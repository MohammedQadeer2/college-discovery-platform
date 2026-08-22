"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// This describes the college details returned by the existing college API.
type College = {
  id: string;
  name: string;
  location: string;
  state: string;
  fees: number;
  rating: number;
  placement: number;
  courses: {
    id: string;
    name: string;
    duration: string;
  }[];
};

export default function ComparePage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Format fees and placement values as Indian currency.
  function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  // Remove one college from both the page and localStorage.
  function removeCollege(collegeId: string) {
    const storedIds = localStorage.getItem("compareCollegeIds");
    const currentIds: string[] = storedIds ? JSON.parse(storedIds) : [];
    const updatedIds = currentIds.filter((id) => id !== collegeId);

    localStorage.setItem("compareCollegeIds", JSON.stringify(updatedIds));
    setColleges((currentColleges) =>
      currentColleges.filter((college) => college.id !== collegeId)
    );
  }

  // Remove all selected colleges from the comparison list.
  function clearAll() {
    localStorage.removeItem("compareCollegeIds");
    setColleges([]);
  }

  useEffect(() => {
    // Read IDs after the page loads because localStorage exists only in the browser.
    const timer = setTimeout(() => {
      async function fetchComparedColleges() {
        try {
          const storedIds = localStorage.getItem("compareCollegeIds");
          const collegeIds: string[] = storedIds ? JSON.parse(storedIds) : [];

          if (collegeIds.length === 0) {
            setLoading(false);
            return;
          }

          const responses = await Promise.all(
            collegeIds.map((collegeId) =>
              fetch(`/api/colleges/${collegeId}`)
            )
          );
          const results = await Promise.all(
            responses.map((response) => response.json())
          );

          setColleges(
            results
              .filter((result) => result.success)
              .map((result) => result.data)
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load comparison colleges"
          );
        } finally {
          setLoading(false);
        }
      }

      fetchComparedColleges();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* ================= HEADER ================= */}
      <header className="border-b border-slate-800 bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <Link href="/" className="text-2xl font-bold tracking-tight">
              College<span className="text-blue-400">Finder</span>
            </Link>
            <p className="text-sm text-slate-400">
              Discover the right college for you
            </p>
          </div>

          <Link href="/" className="text-sm text-slate-300 hover:text-white">
            Colleges
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Compare Colleges</h1>
            <p className="mt-2 text-slate-400">
              Compare up to three colleges side-by-side.
            </p>
          </div>

          {colleges.length > 0 && (
            <button
              onClick={clearAll}
              className="rounded-xl border border-red-800 px-4 py-3 text-sm font-semibold text-red-300 hover:border-red-500"
            >
              Clear All
            </button>
          )}
        </div>

        {loading && (
          <div className="py-20 text-center text-slate-400">
            Loading comparison...
          </div>
        )}

        {!loading && error && (
          <div className="mt-8 rounded-xl border border-red-900 bg-red-950/30 p-6 text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && colleges.length === 0 && (
          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
            <h2 className="text-xl font-semibold">
              No colleges selected for comparison.
            </h2>
            <Link
              href="/"
              className="mt-6 inline-block rounded-xl bg-blue-600 px-4 py-3 font-semibold hover:bg-blue-500"
            >
              Return to Colleges
            </Link>
          </div>
        )}

        {!loading && !error && colleges.length > 0 && (
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {colleges.map((college) => (
              <article
                key={college.id}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-bold">{college.name}</h2>
                  <button
                    onClick={() => removeCollege(college.id)}
                    className="text-sm text-red-300 hover:text-red-200"
                  >
                    Remove
                  </button>
                </div>

                <dl className="mt-6 space-y-4 text-sm">
                  <div>
                    <dt className="text-slate-500">Location</dt>
                    <dd className="mt-1 text-slate-200">
                      {college.location}, {college.state}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Rating</dt>
                    <dd className="mt-1 text-yellow-400">★ {college.rating}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Annual Fees</dt>
                    <dd className="mt-1 font-semibold">
                      {formatCurrency(college.fees)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Average Placement</dt>
                    <dd className="mt-1 font-semibold">
                      {formatCurrency(college.placement)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Number of Courses</dt>
                    <dd className="mt-1 font-semibold">
                      {college.courses.length}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}