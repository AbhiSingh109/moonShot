import os
import sys
import json
import uuid
import random
import voyageai
from sqlalchemy import create_engine, text

# Add backend directory to path to import database config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import DATABASE_URL

print(f"Connecting to database: {DATABASE_URL.split('@')[-1]}")
engine = create_engine(DATABASE_URL)

# Voyage AI setup
voyage_key = os.getenv("VOYAGE_API_KEY", "")
vo = voyageai.Client(api_key=voyage_key) if voyage_key else None

def enable_pgvector_and_create_table():
    with engine.begin() as conn:
        print("Enabling pgvector extension...")
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        
        print("Creating job_embeddings table...")
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS job_embeddings (
                id VARCHAR(255) PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                company VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                requirements TEXT NOT NULL,
                skills JSONB NOT NULL,
                embedding vector(1024),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        print("Table structure checked/created.")

def generate_synthetic_jobs(count=500):
    companies = [
        "Google", "Meta", "Amazon", "Netflix", "Apple", "Microsoft", "Stripe", "Uber", 
        "Swiggy", "Razorpay", "CRED", "Flipkart", "Zomato", "Paytm", "PhonePe", 
        "Atlassian", "Adobe", "Salesforce", "Coinbase", "Airbnb", "Pinterest"
    ]
    
    titles = [
        "SDE-1", "SDE-2", "Frontend Engineer", "Backend Developer", 
        "Full Stack Developer", "DevOps Engineer", "Data Engineer", 
        "Machine Learning Engineer", "Android Developer", "iOS Developer"
    ]
    
    skills_map = {
        "SDE-1": ["Java", "Python", "Data Structures", "Algorithms", "SQL", "Git"],
        "SDE-2": ["Java", "Python", "System Design", "Microservices", "Docker", "Kubernetes", "SQL"],
        "Frontend Engineer": ["JavaScript", "TypeScript", "React", "Next.js", "TailwindCSS", "HTML/CSS", "Webpack"],
        "Backend Developer": ["Python", "FastAPI", "Node.js", "Express", "PostgreSQL", "Redis", "Docker", "MongoDB"],
        "Full Stack Developer": ["TypeScript", "React", "Node.js", "Express", "PostgreSQL", "Docker", "Git", "REST APIs"],
        "DevOps Engineer": ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD", "GitHub Actions", "Linux", "Bash"],
        "Data Engineer": ["Python", "SQL", "Apache Spark", "Hadoop", "ETL Pipelines", "Airflow", "Snowflake"],
        "Machine Learning Engineer": ["Python", "PyTorch", "TensorFlow", "Pandas", "Scikit-Learn", "SQL", "Data Pipelines"],
        "Android Developer": ["Kotlin", "Java", "Android SDK", "Jetpack Compose", "Coroutines", "Dagger/Hilt"],
        "iOS Developer": ["Swift", "SwiftUI", "Xcode", "UIKit", "CocoaPods", "CoreData"]
    }
    
    cities = ["Bangalore", "Hyderabad", "Pune", "Gurgaon", "Mumbai", "Remote"]
    
    jobs = []
    
    for i in range(count):
        title = random.choice(titles)
        company = random.choice(companies)
        skills = skills_map[title]
        city = random.choice(cities)
        
        # Build templates dynamically
        desc = (
            f"Join {company} as a {title} in our {city} office! We are looking for talented candidates "
            f"excited about solving complex user problems and scaling our software platforms. "
            f"In this role, you will write clean, well-tested code, design APIs, and work closely with product managers."
        )
        
        reqs = (
            f"Bachelor's degree in Computer Science or equivalent. "
            f"Proficient understanding of {', '.join(skills[:3])}. "
            f"Familiarity with modern software engineering practices like code reviews, testing, and Git."
        )
        
        jobs.append({
            "id": f"job_{i:04d}",
            "title": title,
            "company": company,
            "description": desc,
            "requirements": reqs,
            "skills": skills
        })
        
    return jobs

def get_voyage_embeddings(text_list):
    """Fetches vector representations from Voyage AI or returns dummy values."""
    if not vo:
        print("VOYAGE_API_KEY not set. Generating dummy 1024-dim vectors for database seeding...")
        # Return dummy zero-vectors of size 1024
        return [[0.0] * 1024 for _ in text_list]
    
    try:
        print(f"Calling Voyage AI to embed {len(text_list)} descriptions...")
        # Voyage API supports batch embedding calls
        result = vo.embed(text_list, model="voyage-large-2-instruct", input_type="document")
        return result.embeddings
    except Exception as e:
        print(f"Voyage embedding failed: {e}. Falling back to zero-vectors.")
        return [[0.0] * 1024 for _ in text_list]

def seed_database():
    enable_pgvector_and_create_table()
    
    print("Generating 500 synthetic jobs...")
    jobs = generate_synthetic_jobs(500)
    
    # Process in batches of 50 to avoid network timeouts or payload size limits
    batch_size = 50
    print(f"Seeding jobs into PostgreSQL database in batches of {batch_size}...")
    
    with engine.begin() as conn:
        # Clear existing jobs to ensure clean seeding
        conn.execute(text("TRUNCATE TABLE job_embeddings;"))
        
        for idx in range(0, len(jobs), batch_size):
            batch = jobs[idx:idx + batch_size]
            
            # Combine fields to embed the context
            texts_to_embed = [
                f"Title: {j['title']} | Company: {j['company']} | Description: {j['description']} | Requirements: {j['requirements']} | Skills: {', '.join(j['skills'])}"
                for j in batch
            ]
            
            vectors = get_voyage_embeddings(texts_to_embed)
            
            for j, vec in zip(batch, vectors):
                conn.execute(
                    text("""
                        INSERT INTO job_embeddings (id, title, company, description, requirements, skills, embedding)
                        VALUES (:id, :title, :company, :description, :requirements, :skills, :embedding)
                    """),
                    {
                        "id": j["id"],
                        "title": j["title"],
                        "company": j["company"],
                        "description": j["description"],
                        "requirements": j["requirements"],
                        "skills": json.dumps(j["skills"]),
                        "embedding": vec
                    }
                )
            print(f"Successfully seeded batch {idx // batch_size + 1}/{len(jobs) // batch_size}")

if __name__ == "__main__":
    try:
        seed_database()
        print("\nDatabase seeded successfully!")
    except Exception as e:
        print(f"\nSeeding script encountered fatal error: {e}")
