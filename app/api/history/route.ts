import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

import { decrypt } from "@/lib/session";
const sql = neon(process.env.DATABASE_URL!);

async function getUser(req: NextRequest): Promise<string | null> {
  try {
    const cookie = req.cookies.get("session")?.value;
    if (!cookie) return null;
    const session = await decrypt(cookie);
    if (!session) return null;
    return session.username as string | null;
  } catch {
    return null;
  }
}


export async function GET(req: NextRequest) {
  const username = await getUser(req);
  if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await sql`
    SELECT id, regex, created_at
    FROM regex_history
    WHERE username = ${username}
    ORDER BY created_at DESC
    LIMIT 100
  `;
  return NextResponse.json(rows);
}


export async function POST(req: NextRequest) {
  const username = await getUser(req);
  if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { regex } = await req.json();
  if (!regex || typeof regex !== "string") {
    return NextResponse.json({ error: "regex is required" }, { status: 400 });
  }

  const [row] = await sql`
    INSERT INTO regex_history (username, regex)
    VALUES (${username}, ${regex})
    RETURNING id, regex, created_at
  `;
  return NextResponse.json(row, { status: 201 });
}