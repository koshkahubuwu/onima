import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const token = jwt.sign(
    { userId: session.user.id, username: session.user.name },
    process.env.NEXTAUTH_SECRET!,
    { expiresIn: "1h" }
  );

  return NextResponse.json({ token });
}
