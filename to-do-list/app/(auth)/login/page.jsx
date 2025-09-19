"use client";

import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/userProvider";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { login } = useUser();
  const router = useRouter();

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      // Check if email exists
      const res = await fetch(
        `/todolist/api/check-email?email=${encodeURIComponent(email)}`
      );
      const data = await res.json();

      if (!data.exists) {
        setError("This email is not registered. Please sign up first.");
        return;
      }

      // Try login
      await login({ email, password });
      router.push("/today");
    } catch (err) {
      setError(
        err instanceof Error
          ? "Incorrect password. Try again."
          : "An unexpected error occurred."
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-white items-center justify-center p-4">
      <Head>
        <title>CalenDo | Login</title>
      </Head>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6">
        {/* Heading */}
        <div className="text-center">
          <span className="material-icons text-green-600 text-5xl">
            check_circle
          </span>
          <h1 className="mt-4 text-3xl font-extrabold text-green-700">
            Welcome Back
          </h1>
          <p className="mt-2 text-gray-600">Log in to your CalenDo account</p>
        </div>

        {/* Error */}
        {error && <p className="text-center text-red-500">{error}</p>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
          >
            Log In
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-green-600 hover:text-green-500"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
