import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "CopilotAI — Your AI Career Copilot for College Students",
  description:
    "CopilotAI analyzes your resume, detects skill gaps, generates personalized learning roadmaps, and simulates real interviews — all powered by AI. Land your dream job.",
  keywords: "career copilot, AI resume analysis, skill gap detection, interview simulation, job roadmap, college placement",
  openGraph: {
    title: "CopilotAI — AI Career Copilot",
    description: "Analyze your resume, detect skill gaps, and ace interviews with AI.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#111827",
              color: "#F8FAFC",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              fontSize: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}

