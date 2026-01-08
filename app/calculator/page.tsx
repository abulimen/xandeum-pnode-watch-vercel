'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ROICalculator } from '@/components/calculator/ROICalculator';
import { Calculator, Info, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';

// Wrapper component that uses useSearchParams
function CalculatorWithParams() {
    const searchParams = useSearchParams();

    // Read pre-fill values from URL params (from node details page)
    const storageParam = searchParams.get('storage');
    const creditsParam = searchParams.get('credits');

    const initialStorage = storageParam ? Math.round(Number(storageParam) / (1024 * 1024 * 1024)) : undefined; // Convert bytes to GB
    const initialCredits = creditsParam ? Number(creditsParam) : undefined;

    return <ROICalculator initialStorage={initialStorage} initialCredits={initialCredits} />;
}

export default function CalculatorPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-8 space-y-8">
                {/* Page Header */}
                <div className="space-y-2" data-tour="calculator-inputs">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">For pNode Operators</Badge>
                    </div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Calculator className="h-8 w-8 text-primary" />
                        pNode ROI Calculator
                    </h1>
                    <p className="text-muted-foreground max-w-2xl">
                        <strong>Running a pNode?</strong> Estimate your potential monthly and annual rewards based on your
                        node configuration, stake amount, and applicable boost multipliers.
                    </p>
                </div>

                {/* Info Banner */}
                <Card className="border-blue-500/20 bg-blue-500/5">
                    <CardContent className="py-4">
                        <div className="flex items-start gap-3">
                            <Info className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                            <div className="space-y-1 text-sm">
                                <p className="font-medium text-blue-500">For pNode Operators Only</p>
                                <p className="text-muted-foreground">
                                    This calculator is for <strong>pNode operators</strong> who run storage nodes on the Xandeum network.
                                </p>
                                <Link
                                    href="https://docs.xandeum.network/heartbeat-credit-system"
                                    target="_blank"
                                    className="inline-flex items-center gap-1 text-blue-500 hover:underline mt-2"
                                >
                                    Learn more about the credit system
                                    <ExternalLink className="h-3 w-3" />
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Calculator - wrapped in Suspense for useSearchParams */}
                <Suspense fallback={<div className="flex items-center justify-center py-16 text-muted-foreground">Loading calculator...</div>}>
                    <CalculatorWithParams />
                </Suspense>

                {/* Disclaimer */}
                <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto">
                    * Estimates are based on current network conditions and token prices. Actual rewards may vary
                    depending on network participation, performance, and DAO governance decisions. STOINC will be
                    fully available on mainnet launch.
                </p>
            </main>

            <Footer />
        </div>
    );
}
