"use client";

import { useUser } from "@/app/user-provider";

export default function ProfilePage() {
  const { currentUser } = useUser();

  if (!currentUser) {
    return <p className="p-4">Loading...</p>;
  }

  return (
    <div className="p-8 ml-64">
      <h1 className="text-3xl font-bold text-green-800 mb-6">Profile</h1>
      <div className="bg-green-50 p-6 rounded-lg shadow-md w-full max-w-md">
        <p className="mb-4">
          <span className="font-semibold text-green-700">Name: </span>
          {currentUser.name}
        </p>
        <p className="mb-4">
          <span className="font-semibold text-green-700">Email: </span>
          {currentUser.email}
        </p>
        {/* Add more info or settings here */}
      </div>
    </div>
  );
}
