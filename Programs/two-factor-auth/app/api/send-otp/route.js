import { NextResponse } from "next/server";
import { generate } from "otp-generator";
import { createHmac } from "crypto";
import { Twilio } from "twilio";

export const POST = async (req) => {
    const { phoneNumber } = await req.json();
    const client = new Twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

    try {
        const otp      = generate(6, {alphabets: false, upperCase: false, specialChars: false});
        const ttl      = 5 * 60 * 1000; // 5 Minutes in miliseconds
        const expires  = Date.now() + ttl; //timestamp to 5 minutes in the future
        const data     = `${phoneNumber}.${otp}.${expires}`; // phone.otp.expiry_timestamp
        const hash     = createHmac("sha256", process.env.SECRET_KEY).update(data).digest("hex"); // creating SHA256 hash of the data
        const fullHash = `${hash}.${expires}`; // Hash.expires, format to send to the user        

        await client.messages.create({
            body: `Your OTP for authentication is: ${otp}`,
            from: `${process.env.TWILIO_NO}`,
            to: phoneNumber
        });

        console.log(`OTP sent to ${phoneNumber}: ${otp}`);
        return new NextResponse(
            fullHash, {
              status: 200
            });
        
    } catch (error) {
        console.error("Error sending OTP:", error);
        return new NextResponse(error, {
            status: 400,
          });
    }
};
