"use client";

import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/user-provider";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { signup } = useUser();
  const router = useRouter();

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      // Check if email already exists
      const response = await fetch(
        `/api/check-email?email=${encodeURIComponent(email)}`
      );
      const data = await response.json();

      if (data.exists) {
        setError("This email is already registered. Please log in.");
        return;
      }

      // If email does not exist, signup
      await signup({ name, email, password });
      router.push("/today");
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("An unexpected error occurred.");
    }
  };

  return (
    <div className="flex min-h-screen bg-green-50 items-center justify-center p-4">
      <Head>
        <title>CalenDo | Sign Up</title>
      </Head>

      {/* Signup Card */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6">
        {/* Heading */}
        <div className="text-center">
          <span className="material-icons text-green-600 text-5xl">
            check_circle
          </span>
          <h1 className="mt-4 text-3xl font-extrabold text-green-700">
            Create Account
          </h1>
          <p className="mt-2 text-gray-600">Sign up to start using CalenDo</p>
        </div>

        {/* Error */}
        {error && <p className="text-center text-red-500">{error}</p>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
            />
          </div>

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

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-green-600 hover:text-green-500"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
