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


export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params;
  const username = await getUser(req);
  if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = parseInt(rawId, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  await sql`
    DELETE FROM regex_history
    WHERE id = ${id} AND username = ${username}
  `;
  return NextResponse.json({ success: true });
}