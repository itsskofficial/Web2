"use client"

import { getAuth, signOut } from "firebase/auth";
import {app} from "@/utils/config"
import { useRouter } from "next/navigation";

export default function Dashboard() {

  const router = useRouter()
  const auth = getAuth(app)

    const handleLogout = async () => {
        try {
        await signOut(auth);
            alert("Logged out successfully!");
            router.push("/")
        } catch (error) {
        console.error(error);
        }
    };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
              <h1 className="text-2xl font-bold mb-4 text-center">
                  Welcome to the Dashboard
              </h1>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded w-full"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
