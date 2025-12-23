import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { InstallBanner } from "@/components/pwa/InstallBanner";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import { CopilotWidget } from "@/components/copilot/CopilotWidget";
import { PriceTicker } from "@/components/PriceTicker";
import { TourButton } from "@/components/tour/TourButton";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "pNode Watch - Xandeum Network Analytics",
    description: "Real-time monitoring and analytics for Xandeum's distributed storage network",
    keywords: ["pNode Watch", "Xandeum", "pNode", "analytics", "blockchain", "storage", "Solana"],
    icons: {
        icon: [
            { url: "/pnode_favicon.jpg", type: "image/jpeg" },
        ],
        apple: "/pnode_favicon.jpg",
    },
    openGraph: {
        title: "pNode Watch - Xandeum Network Analytics",
        description: "Real-time monitoring and analytics for Xandeum's distributed storage network",
        type: "website",
        images: [
            {
                url: "/pnode_favicon.jpg",
                width: 512,
                height: 512,
                alt: "pNode Watch Logo",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "pNode Watch - Xandeum Network Analytics",
        description: "Real-time monitoring and analytics for Xandeum's distributed storage network",
        images: ["/pnode_favicon.jpg"],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
            >
                <Providers>
                    <ServiceWorkerRegistration />
                    {children}
                    <Toaster />
                    <InstallBanner />
                    <PriceTicker />
                    <CopilotWidget />
                    <TourButton />
                </Providers>
            </body>
        </html>
    );
}
