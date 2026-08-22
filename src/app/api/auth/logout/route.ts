import { NextResponse } from "next/server";

// POST /api/auth/logout
// Removes the authentication cookie and logs the user out.
export async function POST() {
  try {
    // Create a successful response.
    const response = NextResponse.json({
      success: true,
      message: "Logout successful",
    });

    // Remove the authentication token by expiring the cookie.
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0),
      path: "/",
    });

    // Return the response.
    return response;
  } catch (error) {
    // Handle unexpected errors.
    return NextResponse.json(
      {
        success: false,
        message: "Logout failed",
      },
      { status: 500 }
    );
  }
}