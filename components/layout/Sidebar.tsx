'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { navGroups } from '@/config/navigation';
import { Badge } from '@/components/ui/badge';
import { useFavorites } from '@/hooks/useFavorites';

interface SidebarProps {
    className?: string;
}

const SIDEBAR_STORAGE_KEY = 'pnode-watch-sidebar-collapsed';

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { favoritesCount } = useFavorites();

    // Initialize state from local storage
    useEffect(() => {
        const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
        if (stored) {
            setIsCollapsed(stored === 'true');
        }
    }, []);

    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(newState));
    };

    return (
        <TooltipProvider delayDuration={0}>
            <div
                className={cn(
                    "hidden lg:flex flex-col h-screen border-r bg-card transition-all duration-300 ease-in-out z-40 sticky top-0 relative",
                    isCollapsed ? "w-16" : "w-64",
                    className
                )}
            >
                {/* Collapse/Expand Tag - positioned on right edge at middle */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={toggleCollapse}
                            className={cn(
                                "absolute top-1/2 -translate-y-1/2 -right-4 z-50",
                                "flex items-center justify-center",
                                "w-8 h-16 rounded-r-xl",
                                "bg-primary/90 hover:bg-primary",
                                "border-2 border-l-0 border-primary",
                                "shadow-lg shadow-primary/25",
                                "transition-all duration-200",
                                "hover:w-10 hover:shadow-xl hover:shadow-primary/30",
                                "group"
                            )}
                            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            {isCollapsed ? (
                                <ChevronRight className="h-5 w-5 text-primary-foreground group-hover:scale-110 transition-transform" />
                            ) : (
                                <ChevronLeft className="h-5 w-5 text-primary-foreground group-hover:scale-110 transition-transform" />
                            )}
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                        {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    </TooltipContent>
                </Tooltip>

                {/* Header / Logo */}
                <div className={cn(
                    "flex items-center h-14 border-b transition-all duration-300 px-3",
                    isCollapsed ? "justify-center" : "justify-between"
                )}>
                    <Link href="/" className="flex items-center gap-2 overflow-hidden">
                        <div className="flex-shrink-0 flex items-center justify-center">
                            <img src="/logo.png" alt="Node Watch" className="h-8 w-8 object-contain" />
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col fade-in animate-in duration-300">
                                <span className="font-semibold whitespace-nowrap">Node Watch</span>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Navigation Items */}
                <ScrollArea className="flex-1 py-4">
                    <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
                        {navGroups.map((group, groupIndex) => (
                            <div key={group.label} className={cn("mb-4", isCollapsed ? "px-0" : "px-2")}>
                                {!isCollapsed && (
                                    <h4 className="mb-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase px-2">
                                        {group.label}
                                    </h4>
                                )}
                                {isCollapsed && groupIndex > 0 && (
                                    <div className="h-px bg-border/50 mx-2 my-2" />
                                )}
                                <div className="grid gap-1">
                                    {group.items.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = pathname === item.href;

                                        if (isCollapsed) {
                                            const isWatchlist = item.href === '/watchlist';
                                            return (
                                                <Tooltip key={item.href}>
                                                    <TooltipTrigger asChild>
                                                        <Link
                                                            href={item.href}
                                                            className={cn(
                                                                "relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8 mx-auto",
                                                                isActive
                                                                    ? "bg-primary text-primary-foreground"
                                                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                                            )}
                                                        >
                                                            <Icon className="h-4 w-4" />
                                                            {isWatchlist && favoritesCount > 0 && (
                                                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                                                    {favoritesCount > 9 ? '9+' : favoritesCount}
                                                                </span>
                                                            )}
                                                            <span className="sr-only">{item.label}</span>
                                                        </Link>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="right" className="flex items-center gap-4">
                                                        {item.label}
                                                        {isWatchlist && favoritesCount > 0 && (
                                                            <Badge variant="destructive" className="h-5 px-1.5">
                                                                {favoritesCount}
                                                            </Badge>
                                                        )}
                                                    </TooltipContent>
                                                </Tooltip>
                                            );
                                        }

                                        const isWatchlist = item.href === '/watchlist';
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={cn(
                                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary",
                                                    isActive
                                                        ? "bg-primary/10 text-primary hover:bg-primary/15"
                                                        : "text-muted-foreground hover:bg-muted"
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
                            </div>
                        ))}
                    </nav>
                </ScrollArea>

                {/* Footer - Version only */}
                <div className="p-3 mt-auto border-t bg-muted/10">
                    {!isCollapsed && (
                        <div className="px-2">
                            <p className="text-xs text-muted-foreground">v3.0.29 Live</p>
                        </div>
                    )}
                </div>
            </div>
        </TooltipProvider>
    );
}
