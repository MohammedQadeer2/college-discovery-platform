import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { createAuthToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Read the email and password sent by the frontend.
    const body = await request.json();

    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    // Check that both fields were provided.
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required",
        },
        { status: 400 }
      );
    }

    // Find the user using their email address.
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // Do not reveal whether the email exists.
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    // Compare the password entered by the user
    // with the password hash stored in the database.
    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash
    );

    // Reject the login if the password is incorrect.
    if (!passwordMatches) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    // Create a JWT token containing the user's ID.
    const token = await createAuthToken(user.id);

    // Create the response that will be sent back to the browser.
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

    // Store the JWT inside a secure HTTP-only cookie.
    //
    // HTTP-only means JavaScript running in the browser
    // cannot directly read the authentication token.
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    // Return the response with the authentication cookie.
    return response;
  } catch (error) {
    // Log the actual error for development.
    console.error("Login error:", error);

    // Return a safe error message to the client.
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while logging in",
      },
      { status: 500 }
    );
  }
}