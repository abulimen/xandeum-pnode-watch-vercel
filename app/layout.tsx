import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { InstallBanner } from "@/components/pwa/InstallBanner";
import { InstallPromptModal } from "@/components/pwa/InstallPromptModal";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import { CopilotWidget } from "@/components/copilot/CopilotWidget";
import { PriceTicker } from "@/components/PriceTicker";
import { TourButton } from "@/components/tour/TourButton";
import { PagePreloader } from "@/components/PagePreloader";
import { DataLoadingSignal } from "@/components/DataLoadingSignal";

import { Sidebar } from "@/components/layout/Sidebar";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const viewport: Viewport = {
    themeColor: "#10b981",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
};

export const metadata: Metadata = {
    title: "pNode Watch - Xandeum Network Analytics",
    description: "Real-time monitoring and analytics for Xandeum's distributed storage network",
    keywords: ["pNode Watch", "Xandeum", "pNode", "analytics", "blockchain", "storage", "Solana"],
    manifest: "/manifest.json",
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
            <head>
                <link rel="manifest" href="/manifest.json" />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
            >
                <Providers>
                    <div className="flex h-screen overflow-hidden">
                        {/* Sidebar - Visible on Desktop */}
                        <Sidebar />

                        {/* Main Content Area */}
                        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                            <PagePreloader />
                            <DataLoadingSignal />
                            <ServiceWorkerRegistration />

                            <div className="flex-1 overflow-y-auto overflow-x-hidden w-full">
                                {children}
                            </div>
                        </div>
                    </div>

                    <Toaster />
                    <InstallBanner />
                    <InstallPromptModal />
                    <PriceTicker />
                    <CopilotWidget />
                    <TourButton />
                </Providers>
            </body>
        </html>
    );
}
