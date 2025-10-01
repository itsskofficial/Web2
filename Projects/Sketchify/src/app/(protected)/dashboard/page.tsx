import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const DashboardRedirectPage = async () => {
  const user = await currentUser();

  // Create a URL-friendly slug from the user's name or email
  const sessionName =
    user?.firstName || user?.emailAddresses[0]?.emailAddress.split("@")[0];
  const slug = encodeURIComponent(sessionName?.toLowerCase() || "user");

  redirect(`/dashboard/${slug}`);
};

export default DashboardRedirectPage;