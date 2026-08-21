import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Import our Prisma client so we can communicate with the database.

// This GET function runs whenever the client sends a GET request
// to /api/colleges.
export async function GET(request: NextRequest) {
  try {
    // Convert the request URL into a URL object.
    // This allows us to easily read query parameters such as:
    // ?search=engineering&location=Hyderabad&page=1
    const { searchParams } = new URL(request.url);

    // Get the "search" value from the URL.
    // If search is missing, use an empty string.
    // trim() removes unnecessary spaces from the beginning and end.
    const search = searchParams.get("search")?.trim() || "";

    // Get the "location" filter from the URL.
    const location = searchParams.get("location")?.trim() || "";

    // Get the page number for pagination.
    // If no page is provided, start from page 1.
    // Math.max(..., 1) prevents the page from becoming 0 or negative.
    const page = Math.max(
      Number.parseInt(searchParams.get("page") || "1", 10),
      1
    );

    // Get how many colleges should be returned on one page.
    // Default is 6 colleges per page.
    // We allow a minimum of 1 and maximum of 20 colleges per request.
    const limit = Math.min(
      Math.max(
        Number.parseInt(searchParams.get("limit") || "6", 10),
        1
      ),
      20
    );

    // Get the minimum fee filter.
    // If the user doesn't provide it, use 0.
    const minFees = Number.parseInt(
      searchParams.get("minFees") || "0",
      10
    );

    // Check whether the user provided a maximum fee.
    const maxFeesParam = searchParams.get("maxFees");

    // Convert the maximum fee from a string to a number.
    // If maxFees was not provided, keep it as undefined.
    const maxFees = maxFeesParam
      ? Number.parseInt(maxFeesParam, 10)
      : undefined;

    // Calculate how many records should be skipped.
    //
    // Example:
    // page = 1, limit = 6  -> skip 0
    // page = 2, limit = 6  -> skip 6
    // page = 3, limit = 6  -> skip 12
    const skip = (page - 1) * limit;

    // Build the Prisma "where" object.
    // This object contains all the filters that will be applied
    // when searching for colleges.
    const where = {
      // Add search filtering only when the user entered a search term.
      //
      // We search in:
      // 1. College name
      // 2. College location
      // 3. College state
      ...(search
        ? {
            OR: [
              {
                name: {
                  // "contains" means the name can contain the search text.
                  // "insensitive" means uppercase/lowercase don't matter.
                  //
                  // Example:
                  // "college" can match "College"
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                location: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                state: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),

      // Add an exact location filter if the user selected a location.
      ...(location
        ? {
            location: {
              // Match the selected location without caring about
              // uppercase/lowercase.
              equals: location,
              mode: "insensitive" as const,
            },
          }
        : {}),

      // Filter colleges according to their fees.
      fees: {
        // College fees must be greater than or equal to minFees.
        // If minFees is invalid, use 0 instead.
        gte: Number.isNaN(minFees) ? 0 : minFees,

        // Add the maximum fee condition only when maxFees is valid.
        ...(maxFees !== undefined && !Number.isNaN(maxFees)
          ? { lte: maxFees }
          : {}),
      },
    };

    // Run both database queries at the same time.
    //
    // Query 1: Get the actual colleges for the current page.
    // Query 2: Get the total number of colleges matching the filters.
    //
    // Promise.all() allows both queries to run in parallel,
    // which is faster than waiting for them one after another.
    const [colleges, total] = await Promise.all([
      
      // Get colleges from the database.
      prisma.college.findMany({
        // Apply our search, location and fee filters.
        where,

        // Also return the courses related to each college.
        include: {
          courses: true,
        },

        // Show colleges with the highest rating first.
        orderBy: {
          rating: "desc",
        },

        // Skip colleges from previous pages.
        skip,

        // Return only the number of colleges requested by "limit".
        take: limit,
      }),

      // Count how many colleges match the same filters.
      // This is needed to calculate pagination information.
      prisma.college.count({
        where,
      }),
    ]);

    // Send a successful JSON response back to the frontend.
    return NextResponse.json({
      success: true,

      // The actual college data.
      data: colleges,

      // Information needed by the frontend to create pagination.
      pagination: {
        page,
        limit,
        total,

        // Calculate how many pages are available.
        // Example:
        // total = 25, limit = 6
        // totalPages = 5
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    // If anything goes wrong while processing the request
    // or communicating with the database, it will come here.
    console.error("GET /api/colleges error:", error);

    // Send an error response to the frontend with HTTP status 500.
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch colleges",
      },
      { status: 500 }
    );
  }
}