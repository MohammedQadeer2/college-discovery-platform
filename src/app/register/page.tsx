"use client";

// React hook used to store form data and messages.
import { useState } from "react";

// Next.js router lets us move the user to another page.
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  // Store the name entered by the user.
  const [name, setName] = useState("");

  // Store the email entered by the user.
  const [email, setEmail] = useState("");

  // Store the password entered by the user.
  const [password, setPassword] = useState("");

  // Show a loading message while registration is happening.
  const [loading, setLoading] = useState(false);

  // Store an error message if registration fails.
  const [error, setError] = useState("");

  // Store a success message after registration.
  const [success, setSuccess] = useState("");

  // Create the router object for page navigation.
  const router = useRouter();

  // This function runs when the user submits the form.
  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    // Prevent the browser from refreshing the page.
    event.preventDefault();

    // Clear old messages.
    setError("");
    setSuccess("");

    // Start the loading state.
    setLoading(true);

    try {
      // Send the registration data to our backend API.
      const response = await fetch("/api/auth/register", {
        // Our register API expects a POST request.
        method: "POST",

        // Tell the server that we are sending JSON.
        headers: {
          "Content-Type": "application/json",
        },

        // Convert our form data into JSON.
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      // Convert the API response into JavaScript.
      const result = await response.json();

      // Check whether registration was successful.
      if (!result.success) {
        throw new Error(result.message || "Registration failed");
      }

      // Show a success message.
      setSuccess("Registration successful! Redirecting to login...");

      // Move the user to the login page after registration.
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (err) {
      // Show the error returned by the API.
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      // Stop the loading state.
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* ================= HEADER ================= */}
      <header className="border-b border-slate-800 bg-slate-950/95">
        <div className="mx-auto max-w-7xl px-6 py-5">
          {/* Website name */}
          <h1 className="text-2xl font-bold tracking-tight">
            Campus<span className="text-blue-400">Compare</span>
          </h1>

          {/* Website subtitle */}
          <p className="text-sm text-slate-400">
            Discover and compare the right college for you
          </p>
        </div>
      </header>

      {/* ================= REGISTER SECTION ================= */}
      <section className="flex min-h-[calc(100vh-90px)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Register card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">

            {/* Page heading */}
            <div className="mb-8">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-400">
                Create Account
              </p>

              <h2 className="text-3xl font-bold">
                Join CampusCompare
              </h2>

              <p className="mt-2 text-slate-400">
                Create an account to save and compare colleges.
              </p>
            </div>

            {/* Registration form */}
            <form onSubmit={handleRegister} className="space-y-5">

              {/* Name field */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Name
                </label>

                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
                />
              </div>

              {/* Email field */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
                />
              </div>

              {/* Password field */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Password
                </label>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
                />
              </div>

              {/* Error message */}
              {error && (
                <div className="rounded-xl border border-red-900 bg-red-950/30 p-4 text-sm text-red-300">
                  {error}
                </div>
              )}

              {/* Success message */}
              {success && (
                <div className="rounded-xl border border-green-900 bg-green-950/30 p-4 text-sm text-green-300">
                  {success}
                </div>
              )}

              {/* Register button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            {/* Login link */}
            <div className="mt-6 text-center text-sm text-slate-400">
              Already have an account?{" "}
              <button
                onClick={() => router.push("/login")}
                className="font-semibold text-blue-400 hover:text-blue-300"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}