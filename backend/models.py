from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=True)
    email = Column(String, unique=True, nullable=True)
    email_verified = Column(DateTime, nullable=True)
    image = Column(String, nullable=True)
    target_role = Column(String, default="SDE-1")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    roadmaps = relationship("Roadmap", back_populates="user", cascade="all, delete-orphan")
    interviews = relationship("Interview", back_populates="user", cascade="all, delete-orphan")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String, nullable=False)
    file_url = Column(String, nullable=True)
    ats_score = Column(Integer, nullable=False)
    overall_score = Column(Integer, nullable=False)
    keyword_match_score = Column(Integer, nullable=False)
    sections = Column(JSON, nullable=False)
    keywords_present = Column(JSON, nullable=False)
    keywords_missing = Column(JSON, nullable=False)
    improvements = Column(JSON, nullable=False)
    analyzed_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="resumes")

class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    target_role = Column(String, nullable=False)
    weeks = Column(JSON, nullable=False)
    total_xp = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="roadmaps")

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    target_role = Column(String, nullable=False)
    messages = Column(JSON, nullable=False)
    score = Column(Integer, default=0)
    question_index = Column(Integer, default=0)
    is_complete = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="interviews")
