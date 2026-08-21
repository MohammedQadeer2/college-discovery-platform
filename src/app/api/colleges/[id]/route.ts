// Import Next.js request and response helpers.
import { NextRequest, NextResponse } from "next/server";

// Import our shared Prisma database client.
import { prisma } from "@/lib/prisma";

// Handle GET requests such as:
// /api/colleges/cm123abc
export async function GET(
  request: NextRequest,
  // The URL parameter contains the college ID.
  { params }: { params: Promise<{ id: string }> }
) { 
  try {
    // Get the college ID from the URL.
    const { id } = await params;

    // Find one college using its unique ID.
    const college = await prisma.college.findUnique({
      // Search by the college's primary key.
      where: {
        id,
      },

      // Also fetch the courses belonging to this college.
      include: {
        courses: true,
      },
    });

    // If no college was found, return a 404 response.
    if (!college) {
      return NextResponse.json(
        {
          success: false,
          message: "College not found",
        },
        { status: 404 }
      );
    }

    // Return the college information as JSON.
    return NextResponse.json({
      success: true,
      data: college,
    });
  } catch (error) {
    // Print the actual error in the terminal for debugging.
    console.error("GET /api/colleges/[id] error:", error);

    // Send a safe error message to the browser.
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch college",
      },
      { status: 500 }
    );
  }
}