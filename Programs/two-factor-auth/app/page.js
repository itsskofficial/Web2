"use client"

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/utils/config";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Home = () => {
  const router = useRouter();
  const auth = getAuth(app);
  
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/dashboard");
      }
    });
  }, [auth, router]);
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-12">
      <h1 className="text-4xl font-bold mb-10">
        Two Factor Auth
      </h1>
      <div className="space-x-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => router.push("/login")}
        >
          Login
        </button>
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => router.push("/signup")}
        >
          Sign Up
        </button>
      </div>
    </main>
  );
};

export default Home;
