"use client"

import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { app } from '@/utils/config';
import { useRouter } from 'next/navigation';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const auth = getAuth(app);
    const router = useRouter();

    const handleSignup = async (e) => {
        e.preventDefault();

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // Handle successful signup (optional)
            console.log('User signed up:', userCredential.user);
            // Redirect to dashboard or another page
            router.push("/dashboard");
        } catch (error) {
            setError(error.message); // Display error message to user
            console.error('Error signing up:', error);
        }
    };

    return (
        <div className="flex w-screen h-screen items-center justify-center">
        <div className="flex flex-col items-center justify-center max-w-md mx-auto mt-8 p-8 bg-gray-100 shadow-md rounded-md">
        <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
        <form onSubmit={handleSignup} className="w-full">
            <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email:</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
            </div>
            <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password:</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
            </div>
            <button
                type="submit"
                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
                Sign Up
            </button>
            {error && <p className="mt-2 text-red-500">{error}</p>}
        </form>
            </div> 
    </div>        
    );
};

export default Signup;