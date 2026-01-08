'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, Menu, X, ExternalLink, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { GUIDE_NAVIGATION } from './guide-data';
import { useNodes, useNetworkStats } from '@/hooks';

const DOCS_URL = 'https://docs.xandeum.network';

// Custom hover dropdown component
function HoverDropdown({
    label,
    items,
    isActive
}: {
    label: string;
    items: typeof GUIDE_NAVIGATION[0]['items'];
    isActive: boolean;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const checkActive = (id: string) => {
        return pathname === `/guide/${id}` || (pathname === '/guide' && id === 'introduction');
    };

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <button
                className={cn(
                    "flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                    isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
            >
                {label}
                <ChevronDown className={cn(
                    "h-3 w-3 transition-transform",
                    isOpen && "rotate-180"
                )} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 pt-1 z-50">
                    <div className="bg-popover border rounded-lg shadow-lg p-1 min-w-[220px]">
                        {items.map((item) => {
                            const Icon = item.icon;
                            const active = checkActive(item.id);
                            return (
                                <Link
                                    key={item.id}
                                    href={`/guide/${item.id}`}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                                        active
                                            ? "bg-primary/10 text-primary"
                                            : "hover:bg-muted"
                                    )}
                                >
                                    <Icon className="h-4 w-4 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm">{item.title}</div>
                                        <div className="text-[10px] text-muted-foreground truncate">{item.description}</div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function GuideLayout({ children }: { children: React.ReactNode }) {
    const { nodes } = useNodes();
    const { issueCount } = useNetworkStats(nodes);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const isActive = (id: string) => {
        return pathname === `/guide/${id}` || (pathname === '/guide' && id === 'introduction');
    };

    const currentSection = GUIDE_NAVIGATION.flatMap(g => g.items).find(item => isActive(item.id));

    return (
        <div className="min-h-screen flex flex-col">
            <Header issueCount={issueCount} />

            <div className="flex-1 flex flex-col">
                {/* Guide Header with Horizontal Navigation - SOLID BACKGROUND */}
                <div className="border-b bg-background sticky top-14 z-30">
                    <div className="max-w-6xl mx-auto px-4">
                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-1 py-2">
                            <Link href="/guide" className="flex items-center gap-2 mr-4 pr-4 border-r border-border">
                                <BookOpen className="h-4 w-4 text-primary" />
                                <span className="font-semibold text-sm">Guide</span>
                            </Link>

                            {GUIDE_NAVIGATION.map((group) => (
                                <HoverDropdown
                                    key={group.title}
                                    label={group.title}
                                    items={group.items}
                                    isActive={group.items.some(item => isActive(item.id))}
                                />
                            ))}

                            <div className="ml-auto">
                                <Link
                                    href={DOCS_URL}
                                    target="_blank"
                                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Official Docs
                                    <ExternalLink className="h-3 w-3" />
                                </Link>
                            </div>
                        </div>

                        {/* Mobile Navigation */}
                        <div className="flex md:hidden items-center justify-between py-2">
                            <Link href="/guide" className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-primary" />
                                <span className="font-semibold text-sm">Guide</span>
                                {currentSection && (
                                    <>
                                        <span className="text-muted-foreground">/</span>
                                        <span className="text-sm text-muted-foreground truncate max-w-[150px]">{currentSection.title}</span>
                                    </>
                                )}
                            </Link>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    {/* Mobile Menu Dropdown */}
                    {mobileMenuOpen && (
                        <div className="md:hidden border-t bg-background">
                            <ScrollArea className="max-h-[60vh]">
                                <div className="p-4 space-y-4">
                                    {GUIDE_NAVIGATION.map((group) => (
                                        <div key={group.title}>
                                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                                {group.title}
                                            </h4>
                                            <div className="grid gap-1">
                                                {group.items.map((item) => {
                                                    const Icon = item.icon;
                                                    const active = isActive(item.id);
                                                    return (
                                                        <Link
                                                            key={item.id}
                                                            href={`/guide/${item.id}`}
                                                            onClick={() => setMobileMenuOpen(false)}
                                                            className={cn(
                                                                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                                                                active
                                                                    ? "bg-primary text-primary-foreground"
                                                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                                            )}
                                                        >
                                                            <Icon className="h-4 w-4" />
                                                            {item.title}
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}

                                    <div className="pt-4 border-t">
                                        <Link
                                            href={DOCS_URL}
                                            target="_blank"
                                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                                        >
                                            Official Xandeum Docs
                                            <ExternalLink className="h-3 w-3" />
                                        </Link>
                                    </div>
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <main className="flex-1 bg-muted/5">
                    <div className="max-w-4xl mx-auto px-6 py-8 min-h-full flex flex-col">
                        {children}
                        <div className="mt-auto pt-12">
                            <Footer />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
