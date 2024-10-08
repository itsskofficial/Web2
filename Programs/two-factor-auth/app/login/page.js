"use client"

import { useState, useEffect } from "react";
import { getAuth, RecaptchaVerifier, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "@/utils/config";
import { useRouter } from "next/navigation";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [hash, setHash] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [credentialsVerified, setCredentialsVerified] = useState(false);

    const auth = getAuth(app);
    const router = useRouter();
    
    useEffect(() => {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
            "size": "normal",
            "callback": (response) => {

            },
            "expired-callback": () => {

            }
        });
    }, [auth]);

    const handleLogin = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setCredentialsVerified(true);
            alert("Logged in successfully! Please enter your phone number to continue.");
        } catch (error) {
            console.error("Error signing in:", error);
            alert("Failed to sign in. Please check your credentials.");
        }
    };

    const handleSendOtp = async () => {
        try {
            const response = await fetch("/api/send-otp", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({ phoneNumber })
            });

            if (response.ok) {
                const hash = await response.text();
                setHash(hash);
                setOtpSent(true);
                alert("OTP has been sent");
            } else {
                const errorText = await response.text();
                throw new Error("Error response from server:", errorText);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleOTPSubmit = async () => {
        try {
            const response = await fetch("/api/verify-otp", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({ phoneNumber, otp, hash })
            });
            if (response.ok) {
                setOtp("");
                router.push("/dashboard");
            } else {
                const errorText = await response.text();
                throw new Error("Error response from server:", errorText);
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="flex w-screen h-screen items-center justify-center">
            <div className="flex flex-col items-center justify-center max-w-md mx-auto mt-10 p-10 bg-gray-100 rounded-lg shadow-md">
            <h1 className="text-4xl font-bold mb-10">Login</h1>
            <label className="block mb-2 font-medium text-gray-800">Email</label>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="block w-full px-4 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-400"
            />
            <label className="block mb-2 font-medium text-gray-800">Password</label>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="block w-full px-4 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-400"
            />
            <button
                onClick={handleLogin}
                className="block w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-400"
            >
                Login
            </button>
            {!otpSent ? (
                <div id="recaptcha-container"></div>
            ) : null}
            {credentialsVerified ? (
                <div>
                    <label className="block mt-6 mb-2 font-medium text-gray-800">Phone Number</label>
                    <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Enter your number"
                        className="block w-full px-4 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-400"
                    />
                    <label className="block mb-2 font-medium text-gray-800">OTP</label>
                    <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter OTP"
                        className="block w-full px-4 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-400"
                    />
                    <button 
                        onClick={otpSent ? handleOTPSubmit : handleSendOtp}
                        className={`block w-full px-4 py-2 bg-${otpSent ? "green" : "blue"}-500 text-white rounded-md hover:bg-${otpSent ? "green" : "blue"}-600 focus:outline-none focus:ring focus:ring-${otpSent ? "green" : "blue"}-400`}
                    >
                        {otpSent ? "Submit OTP" : "Send OTP"}
                    </button>
                </div>
        ) : null}
            </div>  
    </div>        
    );
};

export default Login;
