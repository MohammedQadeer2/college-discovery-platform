"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// This describes the college information returned by the saved colleges API.
type College = {
  id: string;
  name: string;
  location: string;
  state: string;
  description: string;
  fees: number;
  rating: number;
  placement: number;
  courses: {
    id: string;
    name: string;
    duration: string;
  }[];
};

export default function SavedPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  // Convert a number into Indian currency format.
  function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  // Fetch the colleges saved by the current user.
  async function fetchSavedColleges() {
    try {
      const response = await fetch("/api/saved-colleges");
      const result = await response.json();

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch saved colleges");
      }

      setColleges(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Remove a college and immediately update the visible list.
  async function handleRemove(collegeId: string) {
    try {
      const response = await fetch(`/api/saved-colleges/${collegeId}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to remove college");
      }

      setColleges((currentColleges) =>
        currentColleges.filter((college) => college.id !== collegeId)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSavedColleges();
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
        <h2 className="text-3xl font-bold">Saved Colleges</h2>
        <p className="mt-2 text-slate-400">
          Colleges you saved for later.
        </p>

        {loading && (
          <div className="py-20 text-center text-slate-400">
            Loading saved colleges...
          </div>
        )}

        {!loading && error && (
          <div className="mt-8 rounded-xl border border-red-900 bg-red-950/30 p-6 text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && colleges.length === 0 && (
          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
            <h3 className="text-xl font-semibold">No saved colleges yet</h3>
            <p className="mt-2 text-slate-400">
              Return to the colleges page and save one to see it here.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-xl bg-blue-600 px-4 py-3 font-semibold hover:bg-blue-500"
            >
              Explore Colleges
            </Link>
          </div>
        )}

        {!loading && !error && colleges.length > 0 && (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {colleges.map((college) => (
              <article
                key={college.id}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl font-bold">{college.name}</h3>
                  <span className="rounded-lg bg-yellow-400/10 px-2 py-1 text-sm text-yellow-400">
                    ★ {college.rating}
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-400">
                  {college.location}, {college.state}
                </p>
                <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-400">
                  {college.description}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-950 p-3">
                    <p className="text-xs text-slate-500">Annual Fees</p>
                    <p className="mt-1 font-semibold">
                      {formatCurrency(college.fees)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-950 p-3">
                    <p className="text-xs text-slate-500">Avg. Placement</p>
                    <p className="mt-1 font-semibold">
                      {formatCurrency(college.placement)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Link
                    href={`/colleges/${college.id}`}
                    className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold hover:bg-blue-500"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleRemove(college.id)}
                    className="rounded-xl border border-red-800 px-4 py-3 text-sm font-semibold text-red-300 hover:border-red-500"
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}