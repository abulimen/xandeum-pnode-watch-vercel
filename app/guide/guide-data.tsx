import {
    Home,
    Layers,
    Zap,
    Server,
    Coins,
    Award,
    Wallet,
    Search,
    BarChart3,
    Trophy,
    Globe,
    Bell,
    Calculator,
    Sparkles,
    GitCompare,
    Heart,
    Users,
    Info,
    Code2,
    MessageCircle,
    Download,
    Settings,
    Cloud,
    LucideIcon
} from 'lucide-react';

export interface GuideSection {
    id: string;
    title: string;
    icon: LucideIcon;
    description: string;
}

export interface GuideGroup {
    title: string;
    items: GuideSection[];
}

export const GUIDE_NAVIGATION: GuideGroup[] = [
    {
        title: 'Getting Started',
        items: [
            { id: 'introduction', title: 'Introduction', icon: Home, description: 'Welcome to pNode Watch' },
            { id: 'features', title: 'Platform Features', icon: Layers, description: 'Overview of capabilities' },
            { id: 'quick-start', title: 'Quick Start', icon: Zap, description: 'Get started in 5 steps' },
        ]
    },
    {
        title: 'Core Concepts',
        items: [
            { id: 'pnodes', title: 'What are pNodes?', icon: Server, description: 'Understanding Provider Nodes' },
            { id: 'credits', title: 'Credits System', icon: Coins, description: 'How scoring works' },
            { id: 'rewards', title: 'Rewards & STOINC', icon: Award, description: 'Earning incentives' },
            { id: 'staking', title: 'Staking on Nodes', icon: Wallet, description: 'Participation guide' },
        ]
    },
    {
        title: 'Network Pages',
        items: [
            { id: 'dashboard', title: 'Dashboard', icon: Search, description: 'Main node explorer' },
            { id: 'analytics', title: 'Analytics', icon: BarChart3, description: 'Network statistics' },
            { id: 'leaderboard', title: 'Leaderboard', icon: Trophy, description: 'Top performing nodes' },
            { id: 'map', title: 'Network Map', icon: Globe, description: 'Geographic distribution' },
            { id: 'operators', title: 'Operators', icon: Users, description: 'Node operators directory' },
            { id: 'watchlist', title: 'Watchlist', icon: Heart, description: 'Track favorite nodes' },
        ]
    },
    {
        title: 'Tools',
        items: [
            { id: 'compare', title: 'Compare Nodes', icon: GitCompare, description: 'Side-by-side comparison' },
            { id: 'roi-calculator', title: 'ROI Calculator', icon: Calculator, description: 'Estimate rewards' },
            { id: 'widgets', title: 'Widgets', icon: Code2, description: 'Embeddable components' },
            { id: 'copilot', title: 'AI Copilot', icon: Sparkles, description: 'AI Assistant' },
        ]
    },
    {
        title: 'Resources',
        items: [
            { id: 'about-xand', title: 'About XAND', icon: Info, description: 'Token information' },
            { id: 'bots', title: 'Bots', icon: MessageCircle, description: 'Telegram & Discord bots' },
            { id: 'alerts', title: 'Alerts System', icon: Bell, description: 'Stay informed' },
        ]
    },
    {
        title: 'Self-Hosting',
        items: [
            { id: 'self-hosting', title: 'Self-Hosting Guide', icon: Download, description: 'Run your own instance' },
            { id: 'environment', title: 'Environment Setup', icon: Settings, description: 'Configuration variables' },
            { id: 'deployment', title: 'Deployment Options', icon: Cloud, description: 'Vercel, Docker, VPS' },
        ]
    },
];

export const FLATTENED_SECTIONS = GUIDE_NAVIGATION.flatMap(group => group.items);

export function getNextSection(currentId: string) {
    const index = FLATTENED_SECTIONS.findIndex(s => s.id === currentId);
    return index < FLATTENED_SECTIONS.length - 1 ? FLATTENED_SECTIONS[index + 1] : null;
}

export function getPrevSection(currentId: string) {
    const index = FLATTENED_SECTIONS.findIndex(s => s.id === currentId);
    return index > 0 ? FLATTENED_SECTIONS[index - 1] : null;
}
