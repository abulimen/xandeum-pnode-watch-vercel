import {
    Activity,
    BarChart3,
    Map,
    Trophy,
    Users,
    Star,
    TrendingUp,
    Info,
    GitCompareArrows,
    Calculator,
    Code2,
    BookOpen,
    MessageCircle,
} from 'lucide-react';

export const navGroups = [
    {
        label: 'Network',
        items: [
            { href: '/', label: 'Dashboard', icon: Activity },
            { href: '/analytics', label: 'Analytics', icon: BarChart3 },
            { href: '/map', label: 'Map', icon: Map },
            { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
            { href: '/operators', label: 'Operators', icon: Users },
            { href: '/watchlist', label: 'Watchlist', icon: Star },
        ]
    },
    {
        label: 'Token',
        items: [
            { href: '/about', label: 'About XAND', icon: Info },
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
