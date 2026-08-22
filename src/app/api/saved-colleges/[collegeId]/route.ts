import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/auth";

// DELETE /api/saved-colleges/[collegeId]
// Remove one saved college belonging to the logged-in user.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ collegeId: string }> }
) {
  try {
    const token = request.cookies.get("token")?.value;
    const userId = token ? await verifyAuthToken(token) : null;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const { collegeId } = await params;

    // Scope the delete by userId so users can only remove their own saves.
    const deleted = await prisma.savedCollege.deleteMany({
      where: {
        userId,
        collegeId,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { success: false, message: "Saved college not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "College removed successfully",
    });
  } catch (error) {
    console.error("DELETE /api/saved-colleges/[collegeId] error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to remove college" },
      { status: 500 }
    );
  }
}