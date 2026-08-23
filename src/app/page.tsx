"use client";

// React hooks used to store data and react to changes.
import { useEffect, useState } from "react";

// Next.js Link lets us navigate to the college details page.
import Link from "next/link";

// Router lets us send logged-out users to the login page.
import { useRouter } from "next/navigation";

// This describes the information we receive from our API.
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

// This describes the logged-in user returned by our authentication API.
type User = {
  id: string;
  name: string;
  email: string;
};

// This is the main home page component.
export default function Home() {
  // Store the colleges returned by our API.
  const [colleges, setColleges] = useState<College[]>([]);

  // Store the current page number.
  const [page, setPage] = useState(1);

  // Store the total number of pages returned by the API.
  const [totalPages, setTotalPages] = useState(1);

  // Store the search text entered by the user.
  const [search, setSearch] = useState("");

  // Store the selected location.
  const [location, setLocation] = useState("");

  // Show a loading message while the API request is running.
  const [loading, setLoading] = useState(true);

  // Store an error message if the API fails.
  const [error, setError] = useState("");

  // Store the currently logged-in user.
  // If the user is not logged in, this will be null.
  const [user, setUser] = useState<User | null>(null);

  // Track whether we are checking the user's login status.
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Store the IDs of colleges saved by the current user.
  const [savedCollegeIds, setSavedCollegeIds] = useState<string[]>([]);

  // Store the IDs selected for comparison in this browser.
  const [compareCollegeIds, setCompareCollegeIds] = useState<string[]>([]);

  // Show a message when the comparison limit is reached.
  const [compareMessage, setCompareMessage] = useState("");

  // Create the router object for page navigation.
  const router = useRouter();


  // Fetch colleges from our backend API.
  async function fetchColleges() {
    try {
      setLoading(true);

      setError("");

      // Create the query parameters for our API request.
      const params = new URLSearchParams();

      // Send the current page to the backend.
      params.set("page", String(page));

      // Keep the number of colleges per page fixed.
      params.set("limit", "6");

      // Add search only when the user entered something.
      if (search.trim()) {
        params.set("search", search.trim());
      }

      // Add location only when one is selected.
      if (location) {
        params.set("location", location);
      }

      // Ask our Next.js API for colleges.
      const response = await fetch(
        `/api/colleges?${params.toString()}`
      );

      // Convert the response from JSON into JavaScript.
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch colleges");
      }

      setColleges(result.data);

      // Store the total number of pages.
      setTotalPages(result.pagination.totalPages);
    } catch (err) {
      // Show a friendly error message to the user.
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      // Stop showing the loading state.
      setLoading(false);
    }
  }

  // Check whether the user is already logged in.
  async function checkAuthentication() {
    try {
      // Ask our authentication API for the current user.
      const response = await fetch("/api/auth/me");

      // Convert the response into JavaScript data.
      const result = await response.json();

      // If authentication is successful, store the user.
      if (result.success) {
        setUser(result.data);
        await fetchSavedCollegeIds();
      } else {
        // If the user is not authenticated, keep user as null.
        setUser(null);
      }
    } catch (error) {
      // If something goes wrong, treat the user as logged out.
      setUser(null);
    } finally {
      // Authentication checking is finished.
      setCheckingAuth(false);
    }
  }

  // Fetch saved IDs so each homepage card can show Save or Saved.
  async function fetchSavedCollegeIds() {
    const response = await fetch("/api/saved-colleges");
    const result = await response.json();

    if (result.success) {
      setSavedCollegeIds(result.data.map((college: College) => college.id));
    }
  }

  // Save or remove a college for the logged-in user.
  async function handleSave(collegeId: string) {
    if (!user) {
      router.push("/login");
      return;
    }

    const isSaved = savedCollegeIds.includes(collegeId);
    const response = await fetch(
      isSaved ? `/api/saved-colleges/${collegeId}` : "/api/saved-colleges",
      {
        method: isSaved ? "DELETE" : "POST",
        headers: isSaved
          ? undefined
          : { "Content-Type": "application/json" },
        body: isSaved ? undefined : JSON.stringify({ collegeId }),
      }
    );
    const result = await response.json();

    if (!result.success) {
      setError(result.message || "Failed to update saved college");
      return;
    }

    setSavedCollegeIds((currentIds) =>
      isSaved
        ? currentIds.filter((id) => id !== collegeId)
        : [...currentIds, collegeId]
    );
  }

  // Add a college to the browser's comparison list.
  function handleCompare(collegeId: string) {
    if (compareCollegeIds.includes(collegeId)) {
      setCompareMessage("This college is already selected.");
      return;
    }

    if (compareCollegeIds.length >= 3) {
      setCompareMessage("You can compare a maximum of 3 colleges.");
      return;
    }

    const updatedIds = [...compareCollegeIds, collegeId];
    setCompareCollegeIds(updatedIds);
    localStorage.setItem("compareCollegeIds", JSON.stringify(updatedIds));
    setCompareMessage("College added for comparison.");
  }

  // Log the current user out of the application.
  async function handleLogout() {
    try {
      // Send a request to our logout API.
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      // Convert the API response into JavaScript data.
      const result = await response.json();

      // If logout was successful, remove the user from the UI.
      if (result.success) {
        setUser(null);
      }
    } catch (error) {
      // Show the error in the browser console if logout fails.
      console.error("Logout failed:", error);
    }
  }

  // Check authentication when the homepage first loads.
  useEffect(() => {
    checkAuthentication();
  }, []);

  // Load comparison selections saved in this browser.
  useEffect(() => {
    const timer = setTimeout(() => {
      const storedIds = localStorage.getItem("compareCollegeIds");

      if (storedIds) {
        try {
          setCompareCollegeIds(JSON.parse(storedIds));
        } catch {
          localStorage.removeItem("compareCollegeIds");
        }
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Fetch colleges whenever the page number changes.
  useEffect(() => {
    fetchColleges();
  }, [page])

  // Convert the numeric fee into Indian currency format.
  function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* ================= HEADER ================= */}
      <header className="border-b border-slate-800 bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          {/* Website name */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Campus<span className="text-blue-400">Compare</span>
            </h1>

            <p className="text-sm text-slate-400">
              Discover and compare the right college for you
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-300 sm:gap-6">

            {/* Link to the colleges/home page */}
            <Link href="/" className="hover:text-white">
              Colleges
            </Link>

            {/* Link to the comparison page */}
            <Link href="/compare" className="hover:text-white">
              Compare
            </Link>

            {/* Link to the saved colleges page */}
            <Link href="/saved" className="hover:text-white">
              Saved
            </Link>

            {/* Show different options depending on login status */}
            {!checkingAuth && (
              <>
                {user ? (
                  <>
                    {/* Display the logged-in user's name */}
                    <span className="text-blue-400">
                      Hi, {user.name}
                    </span>

                    {/* Logout button */}
                    <button
                      onClick={handleLogout}
                      className="rounded-lg border border-slate-700 px-4 py-2 transition hover:border-blue-500 hover:text-white"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    {/* Login link for logged-out users */}
                    <Link
                      href="/login"
                      className="hover:text-white"
                    >
                      Login
                    </Link>

                    {/* Register link for logged-out users */}
                    <Link
                      href="/register"
                      className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-500"
                    >
                      Register
                    </Link>
                  </>
                )}
              </>
            )}

          </nav>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="border-b border-slate-800 bg-gradient-to-b from-blue-950/40 to-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-400">
              College Discovery Platform
            </p>

            <h2 className="text-4xl font-bold leading-tight md:text-6xl">
              Find a college that
              <span className="text-blue-400"> fits your future.</span>
            </h2>

            <p className="mt-5 max-w-2xl text-lg text-slate-400">
              Search colleges, compare fees and placements,
              explore courses, and make better decisions.
            </p>
          </div>

          {/* ================= SEARCH BOX ================= */}
          <div className="mt-10 rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl">
            <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
              {/* Search input */}
              <input
                type="text"
                placeholder="Search college, city or state..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                onKeyDown={(event) => {
                  // Allow the user to press Enter to search.
                  if (event.key === "Enter") {
                    // Start the search from page 1.
                    setPage(1);

                    // Fetch the filtered results.
                    fetchColleges();
                  }
                }}
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
              />

              {/* Location filter */}
              <select
                value={location}
                onChange={(event) => {
                  setLocation(event.target.value);
                }}
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              >
                <option value="">All locations</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Mumbai">Mumbai</option>
                <option value="New Delhi">New Delhi</option>
                <option value="Chennai">Chennai</option>
                <option value="Vellore">Vellore</option>
                <option value="Pilani">Pilani</option>
                <option value="Warangal">Warangal</option>
              </select>

              {/* Search button */}
              <button
                onClick={() => {
                  // Start search results from the first page.
                  setPage(1);

                  // Fetch the filtered colleges.
                  fetchColleges();
                }}>
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= COLLEGE SECTION ================= */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h3 className="text-2xl font-bold">
              Explore Colleges
            </h3>

            <p className="mt-1 text-slate-400">
              Colleges fetched directly from our database
            </p>
          </div>

          {/* Number of colleges currently displayed */}
          <span className="text-sm text-slate-500">
            {colleges.length} results
          </span>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="py-20 text-center text-slate-400">
            Loading colleges...
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="rounded-xl border border-red-900 bg-red-950/30 p-6 text-red-300">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && colleges.length === 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
            <h4 className="text-xl font-semibold">
              No colleges found
            </h4>

            <p className="mt-2 text-slate-400">
              Try a different search or location.
            </p>
          </div>
        )}

        {/* College cards */}
        {!loading && !error && colleges.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {colleges.map((college) => (
              <article
                key={college.id}
                className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-blue-500/50 hover:bg-slate-900/80"
              >
                {/* College name */}
                <div className="flex items-start justify-between gap-4">
                  <h4 className="text-xl font-bold">
                    {college.name}
                  </h4>

                  {/* Rating */}
                  <span className="rounded-lg bg-yellow-400/10 px-2 py-1 text-sm text-yellow-400">
                    ★ {college.rating}
                  </span>
                </div>

                {/* Location */}
                <p className="mt-2 text-sm text-slate-400">
                  📍 {college.location}, {college.state}
                </p>

                {/* Description */}
                <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-400">
                  {college.description}
                </p>

                {/* Important college information */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-950 p-3">
                    <p className="text-xs text-slate-500">
                      Annual Fees
                    </p>

                    <p className="mt-1 font-semibold">
                      {formatCurrency(college.fees)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-950 p-3">
                    <p className="text-xs text-slate-500">
                      Avg. Placement
                    </p>

                    <p className="mt-1 font-semibold">
                      {formatCurrency(college.placement)}
                    </p>
                  </div>
                </div>

                {/* Course count */}
                <p className="mt-4 text-sm text-slate-500">
                  {college.courses.length} courses available
                </p>

                {/* Actions */}
                <div className="mt-6">
                  <button
                    onClick={() => handleCompare(college.id)}
                    className="mb-3 w-full rounded-xl border border-slate-700 px-4 py-3 text-center font-semibold transition hover:border-blue-500 hover:text-blue-300"
                  >
                    {compareCollegeIds.includes(college.id)
                      ? "Compared"
                      : "Compare"}
                  </button>

                  <button
                    onClick={() => handleSave(college.id)}
                    className="mb-3 w-full rounded-xl border border-slate-700 px-4 py-3 text-center font-semibold transition hover:border-blue-500 hover:text-blue-300"
                  >
                    {savedCollegeIds.includes(college.id) ? "Saved" : "Save"}
                  </button>

                  <Link
                    href={`/colleges/${college.id}`}
                    className="block rounded-xl bg-blue-600 px-4 py-3 text-center font-semibold transition hover:bg-blue-500"
                  >
                    View Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {compareMessage && (
          <p className="mt-6 text-center text-sm text-blue-300">
            {compareMessage}
          </p>
        )}

        {/* ================= PAGINATION ================= */}

        {!loading && !error && colleges.length > 0 && totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">

            {/* Previous page button */}
            <button
              onClick={() => {
                // Move to the previous page.
                setPage((currentPage) => currentPage - 1);
              }}
              disabled={page === 1}
              className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold transition hover:border-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Previous
            </button>

            {/* Current page indicator */}
            <div className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold">
              Page {page} of {totalPages}
            </div>

            {/* Next page button */}
            <button
              onClick={() => {
                // Move to the next page.
                setPage((currentPage) => currentPage + 1);
              }}
              disabled={page === totalPages}
              className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold transition hover:border-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}


      </section>
    </main >
  );
}