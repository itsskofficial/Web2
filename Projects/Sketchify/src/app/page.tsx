import { redirect } from "next/navigation";

export default function Home() {
  // For now, the home page will just redirect to the dashboard.
  // In a real application, you would build a landing page here.
  redirect("/dashboard");
}