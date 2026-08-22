import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Read the JSON data sent by the frontend.
    const body = await request.json();

    // Get the user's name, email and password.
    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    // Make sure all required fields were provided.
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email and password are required",
        },
        { status: 400 }
      );
    }

    // Require a reasonably strong password.
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters",
        },
        { status: 400 }
      );
    }

    // Check whether an account with this email already exists.
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // Do not allow duplicate accounts.
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists",
        },
        { status: 409 }
      );
    }

    // Convert the plain password into a secure hash.
    //
    // We NEVER store the user's actual password in the database.
    const passwordHash = await bcrypt.hash(password, 12);

    // Create the user in PostgreSQL through Prisma.
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    // Return only safe user information.
    //
    // Never return passwordHash to the frontend.
    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // Log the actual error for development/debugging.
    console.error("Register error:", error);

    // Return a generic error to the user.
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while creating the account",
      },
      { status: 500 }
    );
  }
}