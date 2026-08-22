import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

// GET /api/auth/me
// Returns the currently logged-in user.
export async function GET(request: NextRequest) {
  try {
    // Read the authentication token from the cookie.
    const token = request.cookies.get("token")?.value;

    // If there is no token, the user is not logged in.
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    // Verify that the token is valid.
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    const { payload } = await jwtVerify(token, secret);

    // Get the user ID stored inside the token.
    const userId = payload.userId as string;

    // Find the user in the database.
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // The token may be valid but the user may no longer exist.
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // Return the logged-in user's information.
    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    // Token is invalid, expired, or another authentication error occurred.
    return NextResponse.json(
      {
        success: false,
        message: "Invalid or expired token",
      },
      { status: 401 }
    );
  }
}