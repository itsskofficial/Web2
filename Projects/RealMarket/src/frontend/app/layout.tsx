import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@components/providers";
import { AuthProvider } from "@context/AuthContext";
import { Toaster } from "@components/ui/sonner";

// Import Leaflet CSS
import "leaflet/dist/leaflet.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "CapMatch Market Data",
	description: "Dynamically generate market cards for any address.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={inter.className}>
				<Providers>
					<AuthProvider>
						{children}
						<Toaster richColors />
					</AuthProvider>
				</Providers>
			</body>
		</html>
	);
}
