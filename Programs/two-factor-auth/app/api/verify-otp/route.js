import { createHmac } from "crypto";
import { NextResponse } from "next/server";

export const POST = async (req) => {

    const { phoneNumber, hash, otp } = await req.json();

    try {

        // You can implement custom logic to verify OTP here
        let [hashValue, expires] = hash.split(".");
        // Check if expiry time has passed
        let now = Date.now();
        if (now > parseInt(expires)) return false;
        // Calculate new hash with the same key and the same algorithm
        let data = `${phoneNumber}.${otp}.${expires}`;
        let newCalculatedHash = createHmac("sha256", process.env.SECRET_KEY).update(data).digest("hex");
        // Match the hashes
        if (newCalculatedHash === hashValue) {
            console.log("OTP verification successful")
            return new NextResponse({
                status: 200
            });
        
        }
    } catch (error) {
        console.error("Error sending OTP:", error);
        return new NextResponse(error, {
            status: 400,
        });
    };
}