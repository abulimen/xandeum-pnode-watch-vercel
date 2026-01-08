'use client';

import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { FLATTENED_SECTIONS, getNextSection, getPrevSection } from '../guide-data';
import { GuideComponents } from '../content-components';
import { use } from 'react';

// Legacy URL redirects
const REDIRECTS: Record<string, string> = {
    'node-explorer': 'dashboard',
    'staking-calculator': 'roi-calculator',
};

export default function GuideSectionPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);

    // Handle legacy URL redirects
    if (REDIRECTS[slug]) {
        redirect(`/guide/${REDIRECTS[slug]}`);
    }

    const section = FLATTENED_SECTIONS.find((s) => s.id === slug);

    if (!section) {
        notFound();
    }

    const prevSection = getPrevSection(section.id);
    const nextSection = getNextSection(section.id);
    const Icon = section.icon;

    // Get the content component
    const ContentComponent = GuideComponents[section.id as keyof typeof GuideComponents];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Community Disclaimer - Only show on Introduction page */}
            {section.id === 'introduction' && (
                <Card className="bg-blue-500/5 border-blue-500/20 mb-8">
                    <CardContent className="py-4 flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                        <div className="text-sm text-muted-foreground">
                            <p className="font-medium text-foreground mb-1">Community-Built Platform</p>
                            <p>
                                This analytics dashboard is developed by the community to empower Xandeum pNode operators.
                                While we strive for accuracy, please note this is not an official product of Xandeum Labs.
                                Always verify critical information with official documentation.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Header */}
            <div className="space-y-2 border-b pb-6">
                <div className="flex items-center gap-3 text-primary mb-2">
                    <Icon className="h-8 w-8" />
                    <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                        Documentation
                    </span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight">{section.title}</h1>
                <p className="text-xl text-muted-foreground">
                    {section.description}
                </p>
            </div>

            {/* Content */}
            <div className="prose prose-slate dark:prose-invert max-w-none">
                {ContentComponent}
            </div>

            {/* Navigation Footer */}
            <div className="grid gap-4 sm:grid-cols-2 pt-8 border-t mt-12">
                <div>
                    {prevSection && (
                        <Link href={`/guide/${prevSection.id}`} className="group block h-full">
                            <div className="border rounded-lg p-4 h-full hover:bg-muted/50 transition-colors text-left">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1 group-hover:text-primary transition-colors">
                                    <ChevronLeft className="h-4 w-4" />
                                    <span className="text-xs font-medium uppercase tracking-wider">Previous</span>
                                </div>
                                <div className="font-semibold">{prevSection.title}</div>
                            </div>
                        </Link>
                    )}
                </div>
                <div>
                    {nextSection && (
                        <Link href={`/guide/${nextSection.id}`} className="group block h-full">
                            <div className="border rounded-lg p-4 h-full hover:bg-muted/50 transition-colors text-right">
                                <div className="flex items-center justify-end gap-2 text-muted-foreground mb-1 group-hover:text-primary transition-colors">
                                    <span className="text-xs font-medium uppercase tracking-wider">Next</span>
                                    <ChevronRight className="h-4 w-4" />
                                </div>
                                <div className="font-semibold">{nextSection.title}</div>
                            </div>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
