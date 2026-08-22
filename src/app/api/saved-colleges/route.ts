import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/auth";

// Read the logged-in user's ID from the existing authentication cookie.
async function getUserId(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return null;
  }

  return verifyAuthToken(token);
}

// POST /api/saved-colleges
// Save one college for the logged-in user.
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const collegeId = body.collegeId;

    if (typeof collegeId !== "string" || !collegeId.trim()) {
      return NextResponse.json(
        { success: false, message: "collegeId is required" },
        { status: 400 }
      );
    }

    // Confirm that the college exists before creating the saved record.
    const college = await prisma.college.findUnique({
      where: { id: collegeId },
    });

    if (!college) {
      return NextResponse.json(
        { success: false, message: "College not found" },
        { status: 404 }
      );
    }

    // The composite unique key makes this safe to call more than once.
    const savedCollege = await prisma.savedCollege.upsert({
      where: {
        userId_collegeId: {
          userId,
          collegeId,
        },
      },
      update: {},
      create: {
        userId,
        collegeId,
      },
    });

    return NextResponse.json({
      success: true,
      data: savedCollege,
      message: "College saved successfully",
    });
  } catch (error) {
    console.error("POST /api/saved-colleges error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to save college" },
      { status: 500 }
    );
  }
}

// GET /api/saved-colleges
// Return the colleges saved by the logged-in user.
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const savedColleges = await prisma.savedCollege.findMany({
      where: { userId },
      include: {
        college: {
          include: { courses: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: savedColleges.map((savedCollege) => savedCollege.college),
    });
  } catch (error) {
    console.error("GET /api/saved-colleges error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch saved colleges" },
      { status: 500 }
    );
  }
}