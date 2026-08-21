"use client";

// React hooks used for loading and storing college information.
import { useEffect, useState } from "react";

// useParams gives us the [id] value from the URL.
import { useParams, useRouter } from "next/navigation";

// This describes the college data returned by our API.
type College = {
  id: string;
  name: string;
  slug: string;
  location: string;
  state: string;
  description: string;
  fees: number;
  rating: number;
  placement: number;

  // Every college can have multiple courses.
  courses: {
    id: string;
    name: string;
    duration: string;
  }[];
};

export default function CollegeDetailsPage() {
  // Get the college ID from the URL.
  // Example: /colleges/abc123 → id = abc123
  const params = useParams();

  // Router lets us go back to the previous page.
  const router = useRouter();

  // Store the college returned by our API.
  const [college, setCollege] = useState<College | null>(null);

  // Show loading while the API request is running.
  const [loading, setLoading] = useState(true);

  // Store an error message if something goes wrong.
  const [error, setError] = useState("");

  useEffect(() => {
    // Get the ID from the URL parameters.
    const collegeId = params.id;

    // Make sure an ID exists before calling the API.
    if (!collegeId || typeof collegeId !== "string") {
      setError("Invalid college ID");
      setLoading(false);
      return;
    }

    // Function responsible for loading the college.
    async function fetchCollege() {
      try {
        // Start loading.
        setLoading(true);

        // Clear previous errors.
        setError("");

        // Call the college detail API we already created.
        const response = await fetch(
          `/api/colleges/${collegeId}`
        );

        // Convert API response to JavaScript.
        const result = await response.json();

        // If API returned an error, show it.
        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to fetch college"
          );
        }

        // Store the college in React state.
        setCollege(result.data);
      } catch (err) {
        // Show a friendly error message.
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong"
        );
      } finally {
        // Stop loading.
        setLoading(false);
      }
    }

    // Run the API request.
    fetchCollege();
  }, [params.id]);

  // Convert numbers into Indian currency format.
  function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  // ================= LOADING STATE =================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-slate-400">
          Loading college details...
        </p>
      </main>
    );
  }

  // ================= ERROR STATE =================

  if (error || !college) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="max-w-md rounded-2xl border border-red-900 bg-red-950/30 p-8 text-center">
          <h1 className="text-2xl font-bold">
            College not found
          </h1>

          <p className="mt-3 text-red-300">
            {error || "We could not find this college."}
          </p>

          <button
            onClick={() => router.back()}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  // ================= MAIN PAGE =================

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* ================= HEADER ================= */}

      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          {/* Website name */}
          <button
            onClick={() => router.push("/")}
            className="text-2xl font-bold"
          >
            College<span className="text-blue-400">Finder</span>
          </button>

          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-blue-500 hover:text-white"
          >
            ← Back to colleges
          </button>
        </div>
      </header>

      {/* ================= COLLEGE HERO ================= */}

      <section className="border-b border-slate-800 bg-gradient-to-b  from-blue-950/40 to-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-14">
          {/* Small label */}
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
            College Details
          </p>

          {/* College name */}
          <h1 className="mt-3 text-4xl font-bold md:text-5xl">
            {college.name}
          </h1>

          {/* Location */}
          <p className="mt-4 text-lg text-slate-400">
            📍 {college.location}, {college.state}
          </p>

          {/* Rating */}
          <div className="mt-6 inline-flex rounded-xl bg-yellow-400/10 px-4 py-2 text-yellow-400">
            ★ {college.rating} / 5
          </div>
        </div>
      </section>

      {/* ================= MAIN CONTENT ================= */}

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">

          {/* ================= LEFT COLUMN ================= */}

          <div className="space-y-8">

            {/* About college */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-7">
              <h2 className="text-2xl font-bold">
                About the College
              </h2>

              <p className="mt-4 leading-7 text-slate-400">
                {college.description}
              </p>
            </div>

            {/* Courses */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-7">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  Courses
                </h2>

                <span className="text-sm text-slate-500">
                  {college.courses.length} available
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {college.courses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <div>
                      <p className="font-semibold">
                        {course.name}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Undergraduate Program
                      </p>
                    </div>

                    <span className="text-sm text-blue-400">
                      {course.duration}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN ================= */}

          <aside className="space-y-5">

            {/* Fees */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-500">
                Annual Fees
              </p>

              <p className="mt-2 text-2xl font-bold">
                {formatCurrency(college.fees)}
              </p>
            </div>

            {/* Placement */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-500">
                Average Placement
              </p>

              <p className="mt-2 text-2xl font-bold text-green-400">
                {formatCurrency(college.placement)}
              </p>
            </div>

            {/* Location */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-500">
                Location
              </p>

              <p className="mt-2 font-semibold">
                {college.location}
              </p>

              <p className="text-sm text-slate-400">
                {college.state}
              </p>
            </div>

            {/* Future action buttons */}
            <div className="rounded-2xl border border-blue-900/50 bg-blue-950/20 p-6">
              <h3 className="font-semibold">
                Interested in this college?
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                You will soon be able to save colleges
                and compare them.
              </p>

              <button
                disabled
                className="mt-5 w-full cursor-not-allowed rounded-xl bg-slate-700 px-4 py-3 text-sm font-semibold text-slate-400"
              >
                Save College — Coming Soon
              </button>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}