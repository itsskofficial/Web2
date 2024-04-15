import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import React from "react";

const PaymentForm = () => {
    const stripe = useStripe();
    const router = useRouter();
    const elements = useElements();

    const onSubmit = async (e) => {
        e.preventDefault();
        const cardElement = elements?.getElement("card");

        try {
        if (!stripe || !cardElement) return null;
        const response = await fetch("/api/payment/create-payment-intent", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({ amount: 3 }), // Assuming 3 is the amount
        });
            
            const clientSecret = await response.text();
            console.log(clientSecret)

            const result = await stripe?.confirmCardPayment(clientSecret, {
            payment_method: { card: cardElement },
            });

            
            if (result) {
                // Navigate to a different page
                router.push('/success');
            } else {
                router.push('/failure')
            } 
            

        } catch (error) {
        console.log(error);
        }
    };

    return (
        <div className="flex justify-center items-center h-screen">
        <div className="max-w-md w-full">
            <h1 className="text-[30px] font-bold mb-8 text-center">Payments Security Testing</h1>
            <form onSubmit={onSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="card">
                Card Details
                </label>
                <CardElement id="card" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div className="flex items-center justify-between">
                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                Pay Now
                </button>
            </div>
            </form>
        </div>
        </div>
    );
}

export default PaymentForm;