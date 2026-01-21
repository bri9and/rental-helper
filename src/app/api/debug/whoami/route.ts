import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

// Debug endpoint to see current user info
export async function GET() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    return NextResponse.json({
      userId,
      email: user?.emailAddresses?.[0]?.emailAddress,
      firstName: user?.firstName,
      lastName: user?.lastName,
      message: userId
        ? "You are logged in. Use this userId to assign properties."
        : "Not logged in - go to /admin/dashboard first"
    });
  } catch (error) {
    return NextResponse.json({
      error: String(error),
      message: "Auth error - make sure you're logged in at /admin/dashboard"
    });
  }
}
