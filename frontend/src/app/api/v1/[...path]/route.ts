import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

export async function catchAll(
  req: NextRequest,
  props: { params: Promise<{ path: string[] }> }
) {
  // Validate session
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const email = session.user.email || "";
  
  // Await the route params (required in Next.js 15/16)
  const { path: pathArray } = await props.params;
  const path = pathArray.join("/");
  const searchParams = req.nextUrl.searchParams.toString();
  const querySuffix = searchParams ? `?${searchParams}` : "";

  const backendBaseUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  // FastAPI endpoints are under /api/*
  const targetUrl = `${backendBaseUrl}/api/${path}${querySuffix}`;

  // Generate secure gateway headers
  const timestamp = Date.now().toString();
  const secret = process.env.NEXTAUTH_SECRET || "fallback_secret";
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${userId}:${email}:${timestamp}`)
    .digest("hex");

  const headers = new Headers();
  
  // Copy relevant headers from the client request
  const contentType = req.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }
  
  // Set gateway auth headers
  headers.set("X-User-Id", userId);
  headers.set("X-User-Email", email);
  headers.set("X-Gateway-Timestamp", timestamp);
  headers.set("X-Gateway-Signature", signature);

  const method = req.method;
  let body: any = undefined;

  if (method !== "GET" && method !== "HEAD") {
    if (contentType?.includes("multipart/form-data")) {
      body = await req.arrayBuffer();
    } else {
      body = await req.text();
    }
  }

  try {
    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
      cache: "no-store",
    });

    const responseContentType = response.headers.get("content-type") || "";
    
    // Check if it's a Server-Sent Events stream
    if (responseContentType.includes("text/event-stream")) {
      return new NextResponse(response.body, {
        status: response.status,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }

    const data = await response.arrayBuffer();
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type": responseContentType,
      },
    });
  } catch (err: any) {
    console.error("Gateway proxy error:", err);
    return NextResponse.json(
      { error: "Internal Gateway Error", details: err.message },
      { status: 502 }
    );
  }
}

export { catchAll as GET, catchAll as POST, catchAll as PUT, catchAll as DELETE };
