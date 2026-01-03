/**
 * Header Component - Navigation, search, and notifications
 * Production-ready with functional search dialog and notifications popover
 */

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Activity,
    BarChart3,
    Map,
    Trophy,
    Menu,
    X,
    BookOpen,
    Search,
    Bell,
    AlertCircle,
    CheckCircle,
    Clock,
    ExternalLink,
    HelpCircle,
    Calculator,
    Scale,
    Code2,
    ChevronDown,
    TrendingUp,
    Coins,
    GitCompareArrows,
    Star,
    MessageCircle
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { InstallAppButton } from '@/components/pwa/InstallAppButton';
import { NetworkToggle } from '@/components/NetworkToggle';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


interface HeaderProps {
    issueCount?: number;
    issues?: Array<{
        id: string;
        nodeId: string;
        type: string;
        severity: 'low' | 'medium' | 'high';
        message: string;
        timestamp: string;
    }>;
    onSearch?: (query: string) => void;
    lastUpdated?: Date | null;
    isRefreshing?: boolean;
    onRefresh?: () => void;
    isError?: boolean;
    activitySlot?: React.ReactNode; // For ActivityDrawer component
}

const navGroups = [
    {
        label: 'Network',
        items: [
            { href: '/', label: 'Dashboard', icon: Activity },
            { href: '/analytics', label: 'Analytics', icon: BarChart3 },
            { href: '/map', label: 'Map', icon: Map },
            { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
            { href: '/watchlist', label: 'Watchlist', icon: Star },
        ]
    },
    {
        label: 'Token',
        items: [
            { href: '/trade', label: 'Trade XAND', icon: TrendingUp },
            { href: '/staking', label: 'Stake SOL', icon: Coins },
        ]
    },
    {
        label: 'Tools',
        items: [
            { href: '/compare', label: 'Compare Nodes', icon: GitCompareArrows },
            { href: '/calculator', label: 'ROI Calculator', icon: Calculator },
            { href: '/widgets', label: 'Widgets', icon: Code2 },
        ]
    },
    {
        label: 'Resources',
        items: [
            { href: '/guide', label: 'Guide', icon: BookOpen },
            { href: '/bots', label: 'Bots', icon: MessageCircle },
        ]
    }
];

function NavGroupDropdown({ group, pathname }: { group: typeof navGroups[0], pathname: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const isGroupActive = group.items.some(item => pathname === item.href);

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 h-auto font-medium text-sm data-[state=open]:bg-muted",
                        isGroupActive ? "text-primary" : "text-muted-foreground"
                    )}
                    onMouseEnter={() => setIsOpen(true)}
                    onMouseLeave={() => setIsOpen(false)}
                >
                    {group.label}
                    <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="w-48"
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
            >
                {group.items.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                        <Link
                            href={item.href}
                            className={cn(
                                "flex items-center gap-2 cursor-pointer",
                                pathname === item.href && "bg-primary/5 text-primary focus:bg-primary/10 focus:text-primary"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function Header({
    issueCount = 0,
    issues = [],
    onSearch,
    lastUpdated,
    isRefreshing,
    onRefresh,
    isError,
    activitySlot
}: HeaderProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Handle keyboard shortcut for search (Cmd/Ctrl + K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
            if (e.key === 'Escape') {
                setIsSearchOpen(false);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Focus search input when dialog opens
    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [isSearchOpen]);

    // Handle search submission
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // If on dashboard, use the onSearch callback
            if (pathname === '/' && onSearch) {
                onSearch(searchQuery.trim());
            } else {
                // Navigate to dashboard with search query
                router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
            }
            setIsSearchOpen(false);
            setIsMobileMenuOpen(false);
            setSearchQuery('');
        }
    };

    // Determine page title based on pathname
    const getPageTitle = () => {
        if (pathname.startsWith('/nodes/')) return 'Node Details';

        switch (pathname) {
            case '/': return 'Network Overview';
            case '/analytics': return 'Analytics';
            case '/map': return 'Global Map';
            case '/leaderboard': return 'Leaderboard';
            case '/guide': return 'Staking Guide';
            case '/widgets': return 'Widgets';
            default: return 'pNode Watch';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'high': return <AlertCircle className="h-4 w-4 text-destructive" />;
            case 'medium': return <Clock className="h-4 w-4 text-amber-500" />;
            default: return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
        }
    };

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center justify-between px-4">
                    {/* Logo and Title */}
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <div className="flex h-6 w-auto items-center justify-center overflow-hidden">
                                <img src="/logo.png" alt="pNode Watch" className="h-6 w-auto object-contain dark:hidden" />
                                <img src="/logo.png" alt="pNode Watch" className="h-6 w-auto object-contain hidden dark:block" />
                            </div>
                            <span className="font-semibold text-foreground" style={{ marginLeft: "-10px" }}>
                                Node Watch
                            </span>
                        </Link>

                        {/* Page Title with Version Badge */}
                        <div className="hidden md:flex items-center gap-3 pl-4 border-l border-border/50">
                            <span className="font-semibold">{getPageTitle()}</span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-mono bg-muted/50">
                                v2.4.1 Live
                            </Badge>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden min-[1121px]:flex items-center gap-1" data-tour="header">
                        {navGroups.map((group) => {
                            // Special handling for 'Network' group - render items directly on desktop
                            if (group.label === 'Network') {
                                return group.items.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        data-tour={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
                                            pathname === item.href
                                                ? "bg-primary/10 text-primary"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        )}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        {item.label}
                                    </Link>
                                ));
                            }

                            // Check if any item in this group is active
                            if (group.items.length === 1) {
                                const item = group.items[0];
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
                                            pathname === item.href
                                                ? "bg-primary/10 text-primary"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        )}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        {item.label}
                                    </Link>
                                );
                            }

                            return <NavGroupDropdown key={group.label} group={group} pathname={pathname} />;
                        })}
                    </nav>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-2">
                        {/* Network Toggle */}
                        <div className="hidden lg:block">
                            <NetworkToggle />
                        </div>
                        <div className="hidden sm:block lg:hidden">
                            <NetworkToggle compact />
                        </div>

                        {/* Search Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hidden sm:flex"
                            onClick={() => setIsSearchOpen(true)}
                            title="Search (Ctrl+K)"
                        >
                            <Search className="h-4 w-4" />
                        </Button>

                        {/* Activity Drawer (Live Feed) - Only on dashboard */}
                        {activitySlot}

                        {/* Install App Button */}
                        <div className="hidden sm:block">
                            <InstallAppButton />
                        </div>

                        {/* Notifications Bell */}
                        <NotificationBell />

                        <ThemeToggle />

                        {/* Mobile Menu Sidebar */}
                        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="min-[1121px]:hidden"
                                >
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-80 p-0 flex flex-col">
                                <SheetHeader className="p-6 border-b">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-auto items-center justify-center overflow-hidden">
                                            <img src="/logo.png" alt="pNode Watch" className="h-10 w-auto object-contain dark:hidden" />
                                            <img src="/logo.png" alt="pNode Watch" className="h-10 w-auto object-contain hidden dark:block" />
                                        </div>
                                        <div>
                                            <SheetTitle className="text-left" style={{ marginLeft: "-10px" }}>Node Watch</SheetTitle>
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-mono mt-1">
                                                v2.4.1 Live
                                            </Badge>
                                        </div>
                                    </div>
                                </SheetHeader>

                                {/* Mobile Search */}
                                <div className="p-4 border-b">
                                    <form onSubmit={handleSearch}>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="text"
                                                placeholder="Search nodes..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-10"
                                                autoFocus={false}
                                                tabIndex={-1}
                                            />
                                        </div>
                                    </form>
                                </div>

                                {/* Navigation Links - Scrollable */}
                                <nav className="flex flex-col p-4 gap-4 overflow-y-auto flex-1">
                                    {navGroups.map((group) => (
                                        <div key={group.label} className="space-y-1">
                                            <h4 className="px-4 text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-2">
                                                {group.label}
                                            </h4>
                                            {group.items.map((item) => {
                                                const Icon = item.icon;
                                                const isActive = pathname === item.href;
                                                return (
                                                    <Link
                                                        key={item.href}
                                                        href={item.href}
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                        className={cn(
                                                            "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                                            isActive
                                                                ? "bg-primary/10 text-primary"
                                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                                        )}
                                                    >
                                                        <Icon className="h-4 w-4" />
                                                        {item.label}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </nav>

                                {/* Install Button for Mobile */}
                                <div className="p-4 border-t">
                                    <InstallAppButton />
                                </div>

                                {/* Network Status Footer */}
                                <div className="mt-auto p-4 border-t bg-muted/30 shrink-0">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-muted-foreground">Network Status:</span>
                                        <span className="font-medium text-emerald-500">Healthy</span>
                                    </div>
                                    {issueCount > 0 && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {issueCount} alert{issueCount > 1 ? 's' : ''} active
                                        </p>
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </header>

            {/* Search Dialog */}
            <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Search Nodes</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search by Node ID, IP, or location..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                            <span>Press Enter to search</span>
                            <kbd className="px-2 py-1 bg-muted rounded text-[10px]">ESC to close</kbd>
                        </div>
                        <Button type="submit" className="w-full" disabled={!searchQuery.trim()}>
                            Search
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
