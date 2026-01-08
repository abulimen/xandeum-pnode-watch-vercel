/**
 * Header Component - Navigation, search, and notifications
 * Production-ready with functional search dialog and notifications popover
 */

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Menu,
    Search,
    AlertCircle,
    CheckCircle,
    Clock,
    ChevronDown,
    Globe,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { InstallAppButton } from '@/components/pwa/InstallAppButton';
import { NetworkToggle } from '@/components/NetworkToggle';
import { useNetworkData, NetworkType } from '@/contexts/NetworkDataContext';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
} from '@/components/ui/dropdown-menu';
import { navGroups } from '@/config/navigation';
import { useFavorites } from '@/hooks/useFavorites';

// Compact network dropdown for mobile sidebar
function MobileNetworkDropdown() {
    const { network, setNetwork, networkStats } = useNetworkData();

    const options: { value: NetworkType; label: string; color: string; dotColor: string; count: number }[] = [
        { value: 'devnet', label: 'Dev', color: 'text-emerald-400', dotColor: 'bg-emerald-400', count: networkStats.devnet },
        { value: 'mainnet', label: 'Main', color: 'text-blue-400', dotColor: 'bg-blue-400', count: networkStats.mainnet },
        { value: 'all', label: 'All', color: 'text-purple-400', dotColor: 'bg-purple-400', count: networkStats.total },
    ];

    const currentOption = options.find(o => o.value === network) || options[0];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 gap-1.5 px-2.5 shrink-0">
                    <span className={cn("w-2 h-2 rounded-full", currentOption.dotColor)} />
                    <span className={cn("text-xs font-medium", currentOption.color)}>
                        {currentOption.label}
                    </span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[120px]" style={{ zIndex: 99999 }}>
                {options.map((option) => (
                    <DropdownMenuItem
                        key={option.value}
                        onClick={() => setNetwork(option.value)}
                        className={cn(
                            "gap-2 cursor-pointer",
                            network === option.value && "bg-accent"
                        )}
                    >
                        <span className={cn("w-2 h-2 rounded-full", option.dotColor)} />
                        <span className={option.color}>{option.label}</span>
                        <span className="ml-auto text-xs text-muted-foreground">({option.count})</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}


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
    const { favoritesCount } = useFavorites();

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
            case '/operators': return 'Operators';
            case '/watchlist': return 'Watchlist';
            case '/about': return 'About XAND';
            case '/compare': return 'Compare Nodes';
            case '/calculator': return 'ROI Calculator';
            case '/widgets': return 'Widgets';
            case '/guide': return 'Staking Guide';
            case '/bots': return 'Bots';
            default: return 'pNode Watch';
        }
    };

    return (
        <>
            <header style={{ zIndex: 1000 }} className="sticky top-0 w-full border-b border-border/40 backdrop-blur">
                <div className="container flex h-14 items-center justify-between px-4">
                    {/* Left Side: Mobile Trigger & Page Title */}
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Sidebar Trigger */}
                        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="lg:hidden -ml-2"
                                >
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-80 p-0 flex flex-col bg-background">
                                <SheetHeader className="p-6 border-b">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-auto items-center justify-center overflow-hidden">
                                            <img src="/logo.png" alt="pNode Watch" className="h-10 w-auto object-contain dark:hidden" />
                                            <img src="/logo.png" alt="pNode Watch" className="h-10 w-auto object-contain hidden dark:block" />
                                        </div>
                                        <div>
                                            <SheetTitle className="text-left" style={{ marginLeft: "-10px" }}>Node Watch</SheetTitle>
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-mono mt-1">
                                                v3.0.29 Live
                                            </Badge>
                                        </div>
                                    </div>
                                </SheetHeader>

                                {/* Mobile Search + Network Dropdown Row */}
                                <div className="p-4 border-b flex gap-2">
                                    <form onSubmit={handleSearch} className="flex-1">
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
                                    <MobileNetworkDropdown />
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
                                                const isWatchlist = item.href === '/watchlist';
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
                                                        <div className="relative">
                                                            <Icon className="h-4 w-4" />
                                                            {isWatchlist && favoritesCount > 0 && (
                                                                <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                                                                    {favoritesCount > 9 ? '9+' : favoritesCount}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {item.label}
                                                        {isWatchlist && favoritesCount > 0 && (
                                                            <Badge variant="destructive" className="ml-auto h-5 px-1.5">
                                                                {favoritesCount}
                                                            </Badge>
                                                        )}
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

                        {/* Page Title (Breadcrumb-ish) */}
                        <div className="flex items-center gap-3">
                            <span className="font-semibold text-lg sm:text-base">{getPageTitle()}</span>
                        </div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-2">
                        {/* Network Toggle */}
                        <div className="hidden lg:block">
                            <NetworkToggle />
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

