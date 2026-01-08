'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Server, BarChart3, Calculator, Search, Globe, Trophy, Bell, Coins, Sparkles, Code2, TrendingUp,
    Zap, HardDrive, Clock, Shield, Target, Award, CheckCircle, X, ExternalLink, ArrowRight, Info,
    GitCompare, Heart, DollarSign, Brain, Users, Activity, MessageCircle, Copy
} from 'lucide-react';
import Link from 'next/link';

const DOCS_URL = 'https://docs.xandeum.network';

export const GuideComponents: Record<string, React.ReactNode> = {
    introduction: (
        <div className="space-y-6">
            <p className="text-lg text-muted-foreground">
                pNode Watch is a comprehensive analytics dashboard for monitoring and exploring the Xandeum pNode network.
                Whether you&apos;re a node operator, staker, or enthusiast, this platform provides real-time insights into
                network health, node performance, and staking opportunities.
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
                <Card className="bg-emerald-500/5 border-emerald-500/20">
                    <CardContent className="p-4 text-center">
                        <Server className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                        <p className="font-medium">Monitor Nodes</p>
                        <p className="text-xs text-muted-foreground">Track uptime, credits & performance</p>
                    </CardContent>
                </Card>
                <Card className="bg-blue-500/5 border-blue-500/20">
                    <CardContent className="p-4 text-center">
                        <BarChart3 className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                        <p className="font-medium">Analyze Data</p>
                        <p className="text-xs text-muted-foreground">Network stats & trends</p>
                    </CardContent>
                </Card>
                <Card className="bg-purple-500/5 border-purple-500/20">
                    <CardContent className="p-4 text-center">
                        <Calculator className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                        <p className="font-medium">Calculate ROI</p>
                        <p className="text-xs text-muted-foreground">Estimate potential rewards</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    ),

    features: (
        <div className="space-y-6">
            <p className="text-muted-foreground">
                A complete toolkit for Xandeum network participants.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
                {[
                    { icon: Activity, title: 'Live Dashboard', desc: 'Real-time node status with search, filters, and sorting' },
                    { icon: BarChart3, title: 'Network Analytics', desc: 'Interactive charts for uptime, credits, and storage trends' },
                    { icon: Globe, title: 'Interactive Map', desc: 'Geographic view of node distribution worldwide' },
                    { icon: Trophy, title: 'Leaderboard', desc: 'Top nodes ranked by credits and performance' },
                    { icon: Users, title: 'Operators Directory', desc: 'Browse node operators and their fleet performance' },
                    { icon: GitCompare, title: 'Compare Tool', desc: 'Side-by-side comparison of up to 4 nodes' },
                    { icon: Heart, title: 'Watchlist', desc: 'Save and track your favorite nodes' },
                    { icon: Bell, title: 'Alert System', desc: 'Email & push notifications for node status' },
                    { icon: Calculator, title: 'ROI Calculator', desc: 'Estimate rewards with ERA, NFT boosts, and live XAND price' },
                    { icon: Sparkles, title: 'AI Copilot', desc: 'Ask questions and get AI-powered answers' },
                    { icon: Code2, title: 'Embeddable Widgets', desc: 'Add live stats to your own website' },
                    { icon: MessageCircle, title: 'Telegram & Discord Bots', desc: 'Get alerts and check nodes from chat apps' },
                ].map((feature) => (
                    <div key={feature.title} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                        <feature.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium">{feature.title}</p>
                            <p className="text-sm text-muted-foreground">{feature.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    ),

    'quick-start': (
        <div className="space-y-6">
            <ol className="space-y-4">
                {[
                    { step: 1, title: 'Explore the Dashboard', desc: 'Visit the home page to see all active nodes with real-time status, uptime, and credits.' },
                    { step: 2, title: 'Find Top Nodes', desc: 'Use the Leaderboard to discover nodes ranked by credits and performance.' },
                    { step: 3, title: 'Check Node Details', desc: 'Click any node to see storage, uptime, credits, ranking, and operator info.' },
                    { step: 4, title: 'Set Up Alerts', desc: 'Subscribe to email/push notifications for nodes you care about.' },
                    { step: 5, title: 'Calculate Returns', desc: 'Use the ROI Calculator to estimate staking rewards with boost multipliers.' },
                ].map((item) => (
                    <li key={item.step} className="flex gap-4">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                            {item.step}
                        </span>
                        <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                    </li>
                ))}
            </ol>
        </div>
    ),

    pnodes: (
        <div className="space-y-6">
            <p className="text-muted-foreground">
                A <strong>pNode (Provider Node)</strong> is the core of Xandeum&apos;s distributed storage network.
                pNodes store data, handle redundancy, and earn income proportional to their contributions.
            </p>

            <Card>
                <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Key Functions</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                            <HardDrive className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <span><strong>Storage Management</strong> — Stores and retrieves data in the distributed network</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Globe className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <span><strong>Networking</strong> — Communicates with other pNodes via gossip protocols</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <span><strong>Heartbeats</strong> — Responds to liveness checks every 30 seconds for rewards eligibility</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <span><strong>Security</strong> — Ensures data integrity using Merkle proofs and erasure coding</span>
                        </li>
                    </ul>
                </CardContent>
            </Card>

            <Link
                href={`${DOCS_URL}/what-is-a-xandeum-pod`}
                target="_blank"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
                Learn more about pNodes in official docs
                <ExternalLink className="h-3 w-3" />
            </Link>
        </div>
    ),

    credits: (
        <div className="space-y-6">
            <p className="text-muted-foreground">
                <strong>Credits</strong> are points accumulated by nodes based on their contributions.
                They determine your share of network rewards and are the primary performance metric.
            </p>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">How Credits Work</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="p-3 rounded-lg bg-muted/50">
                            <p className="font-medium text-sm">Base Credits</p>
                            <p className="text-xs text-muted-foreground">
                                pNodes × Storage × Performance × Stake
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                            <p className="font-medium text-sm">Boosted Credits</p>
                            <p className="text-xs text-muted-foreground">
                                Base Credits × Boost Multipliers
                            </p>
                        </div>
                    </div>

                    <div>
                        <p className="font-medium text-sm mb-2">Credits are earned by:</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• <strong>Uptime</strong> — Staying consistently online</li>
                            <li>• <strong>Heartbeat Responses</strong> — +1 credit per successful heartbeat (max ~2,880/day)</li>
                            <li>• <strong>Version Compliance</strong> — Running latest software</li>
                            <li>• <strong>Network Contribution</strong> — Successful data storage and retrieval</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-amber-500/5 border-amber-500/20">
                <CardContent className="p-4">
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-amber-500" />
                        Reward Threshold
                    </h4>
                    <p className="text-sm text-muted-foreground">
                        You need approximately <strong>80% of the network&apos;s 95th percentile credits</strong> to qualify for rewards.
                        Below this threshold = zero earnings for that epoch.
                    </p>
                </CardContent>
            </Card>
        </div>
    ),

    rewards: (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            Fixed Rewards
                            <Badge variant="secondary">DevNet</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        <p>Foundation-funded incentives (~10,000 XAND/month per pNode). Covers hosting costs. Paid quarterly in seasons.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            Storage Income (STOINC)
                            <Badge variant="outline">MainNet</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        <p>Long-term earnings from app fees. 94% of fees go to pNodes. Proportional to your boosted credits share.</p>
                    </CardContent>
                </Card>
            </div>

            <div>
                <h3 className="font-semibold mb-3">Boost Multipliers</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                    <div className="p-3 rounded-lg bg-muted/50">
                        <p className="font-medium text-sm mb-1">ERA-Based Boosts</p>
                        <p className="text-xs text-muted-foreground">
                            Deep South (16x) → South (10x) → Mine (7x) → Coal (3.5x) → Central (2x) → North (1.25x)
                        </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                        <p className="font-medium text-sm mb-1">NFT-Based Boosts</p>
                        <p className="text-xs text-muted-foreground">
                            Titan (11x) → Dragon (4x) → Coyote (2.5x) → Rabbit (1.5x) → Cricket (1.1x)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    ),

    staking: (
        <div className="space-y-6">
            <p className="text-muted-foreground">
                Participate in the Xandeum staking ecosystem by supporting high-performing nodes.
            </p>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Stake to pNodes</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    <p className="mb-2">Stake XAND directly to high-performing nodes. Your stake contributes to their credit calculation.</p>
                    <p className="text-xs">Rewards depend on node performance and your stake share.</p>
                </CardContent>
            </Card>

            <div>
                <h3 className="font-semibold mb-3">Choosing a Node to Stake</h3>
                <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm">Look for <strong>Reward Eligible</strong> nodes (above credits threshold)</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm">Choose <strong>Elite</strong> (🏆) or <strong>Reliable</strong> (✅) uptime badges</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm">Prefer nodes running <strong>Mainnet</strong> software version</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-red-500/10 border border-red-500/20">
                        <X className="h-4 w-4 text-red-500" />
                        <span className="text-sm">Avoid nodes marked <strong>Not Eligible</strong> or with &lt;95% uptime</span>
                    </div>
                </div>
            </div>
        </div>
    ),

    dashboard: (
        <div className="space-y-6">
            <p className="text-muted-foreground">
                The main dashboard shows all active pNodes with real-time data. Use filters, search, and sorting to find specific nodes.
            </p>
            <Card>
                <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Dashboard Features</h4>
                    <div className="grid gap-2 sm:grid-cols-2 text-sm text-muted-foreground">
                        <div>• <strong>Table & Card Views</strong> — Switch between layouts</div>
                        <div>• <strong>Network Filters</strong> — Devnet/Mainnet toggle</div>
                        <div>• <strong>Status Filters</strong> — Online/Degraded/Offline</div>
                        <div>• <strong>Search</strong> — Find by ID, IP, or location</div>
                        <div>• <strong>Sorting</strong> — By uptime, credits, storage</div>
                        <div>• <strong>Export CSV</strong> — Download node data</div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Available Columns</h4>
                    <div className="grid gap-2 sm:grid-cols-2 text-sm text-muted-foreground">
                        <div>• <strong>Status</strong> — Online/Degraded/Offline</div>
                        <div>• <strong>Uptime (24h)</strong> — Availability percentage</div>
                        <div>• <strong>Credits</strong> — Total earned credits</div>
                        <div>• <strong>Storage</strong> — Capacity and utilization</div>
                        <div>• <strong>Version</strong> — Software version + network</div>
                        <div>• <strong>Online For</strong> — Current session duration</div>
                    </div>
                </CardContent>
            </Card>
            <Link href="/" className="text-primary hover:underline flex items-center gap-1">
                View Dashboard <ArrowRight className="h-3 w-3" />
            </Link>
        </div>
    ),

    analytics: (
        <div className="space-y-6">
            <p className="text-muted-foreground">
                Track network trends over time with interactive charts showing uptime, node counts, version distribution, and more.
            </p>
            <Card>
                <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Available Charts</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <strong>Node Status Distribution</strong> — Online vs Degraded vs Offline</li>
                        <li>• <strong>Uptime Trends</strong> — Historical network uptime</li>
                        <li>• <strong>Credits Distribution</strong> — How credits are distributed</li>
                        <li>• <strong>Version Distribution</strong> — Software version breakdown</li>
                        <li>• <strong>Storage Metrics</strong> — Network capacity utilization</li>
                    </ul>
                </CardContent>
            </Card>
            <Link href="/analytics" className="text-primary hover:underline flex items-center gap-1">
                View Analytics <ArrowRight className="h-3 w-3" />
            </Link>
        </div>
    ),

    leaderboard: (
        <div className="space-y-6">
            <p className="text-muted-foreground">
                See top-performing nodes ranked by credits, uptime, and response time. Great for finding reliable nodes to stake with.
            </p>
            <Card>
                <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Leaderboard Categories</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <strong>Top by Credits</strong> — Highest earning nodes</li>
                        <li>• <strong>Top by Uptime</strong> — Most reliable nodes</li>
                        <li>• <strong>Elite Nodes</strong> — 100% uptime performers</li>
                    </ul>
                </CardContent>
            </Card>
            <Link href="/leaderboard" className="text-primary hover:underline flex items-center gap-1">
                View Leaderboard <ArrowRight className="h-3 w-3" />
            </Link>
        </div>
    ),

    map: (
        <div className="space-y-6">
            <p className="text-muted-foreground">
                Interactive world map showing geographic distribution of pNodes. Zoom, pan, and click nodes for details.
            </p>
            <Card>
                <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Map Features</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <strong>Country Sidebar</strong> — Browse nodes by geographic region</li>
                        <li>• <strong>City Grouping</strong> — See multiple nodes in the same city</li>
                        <li>• <strong>Status Colors</strong> — Green/Yellow/Red markers for status</li>
                        <li>• <strong>Click for Details</strong> — Click any marker to view node profile</li>
                    </ul>
                </CardContent>
            </Card>
            <Link href="/map" className="text-primary hover:underline flex items-center gap-1">
                Open Map <ArrowRight className="h-3 w-3" />
            </Link>
        </div>
    ),

    operators: (
        <div className="space-y-6">
            <p className="text-muted-foreground">
                The Operators page shows all node operators and their fleet performance. An operator can run multiple pNodes.
            </p>
            <Card>
                <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Operator Information</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <strong>Node Count</strong> — How many pNodes they operate</li>
                        <li>• <strong>Total Credits</strong> — Combined credits across all nodes</li>
                        <li>• <strong>Average Uptime</strong> — Fleet-wide uptime percentage</li>
                        <li>• <strong>Storage Capacity</strong> — Total storage across nodes</li>
                    </ul>
                </CardContent>
            </Card>
            <p className="text-sm text-muted-foreground">
                Click on any operator to see their individual node breakdown with per-node performance metrics.
            </p>
            <Link href="/operators" className="text-primary hover:underline flex items-center gap-1">
                View Operators <ArrowRight className="h-3 w-3" />
            </Link>
        </div>
    ),

    compare: (
        <div className="space-y-6">
            <p className="text-muted-foreground">
                Compare up to 4 nodes side-by-side to analyze their performance, storage, uptime, and credits.
                Perfect for choosing which nodes to stake with or monitor.
            </p>
            <Card>
                <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Comparison Features</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <strong>Side-by-Side Stats</strong> — Compare credits, uptime, storage, and version</li>
                        <li>• <strong>Network Averages</strong> — See how nodes compare to network benchmarks</li>
                        <li>• <strong>Radar Chart</strong> — Visual comparison of key metrics</li>
                        <li>• <strong>AI Analysis</strong> — Get AI-powered insights via Copilot integration</li>
                        <li>• <strong>Share Links</strong> — Copy shareable comparison links</li>
                    </ul>
                </CardContent>
            </Card>
            <Link
                href="/compare"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
            >
                Open Compare Tool <ArrowRight className="h-4 w-4" />
            </Link>
        </div>
    ),

    watchlist: (
        <div className="space-y-6">
            <p className="text-muted-foreground">
                Save your favorite nodes to a personalized watchlist for quick access. Track multiple nodes
                without scrolling through the entire network.
            </p>
            <Card>
                <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Watchlist Features</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <strong>Quick Favorites</strong> — Click the heart icon on any node to add it</li>
                        <li>• <strong>Persistent Storage</strong> — Your watchlist is saved locally</li>
                        <li>• <strong>Status Overview</strong> — See all your tracked nodes at a glance</li>
                        <li>• <strong>Badge Counter</strong> — Sidebar shows count of favorited nodes</li>
                    </ul>
                </CardContent>
            </Card>
            <div className="flex items-center gap-2 p-3 rounded bg-muted/50 border">
                <Heart className="h-5 w-5 text-rose-500" />
                <span className="text-sm">Look for the <strong>heart icon</strong> on node cards and detail pages.</span>
            </div>
            <Link href="/watchlist" className="text-primary hover:underline flex items-center gap-1">
                View Watchlist <ArrowRight className="h-3 w-3" />
            </Link>
        </div>
    ),

    'roi-calculator': (
        <div className="space-y-6">
            <p className="text-muted-foreground">
                Estimate potential pNode rewards based on your stake, storage, ERA multipliers, and NFT boosts.
                Uses real-time XAND price from Jupiter API.
            </p>
            <Card>
                <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Calculator Features</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <strong>ERA Selection</strong> — Choose your registration era for boost multiplier</li>
                        <li>• <strong>NFT Boosts</strong> — Apply NFT multipliers (Cricket to Titan)</li>
                        <li>• <strong>Live XAND Price</strong> — Real-time conversion to USD</li>
                        <li>• <strong>Formula Visualizer</strong> — See exactly how rewards are calculated</li>
                        <li>• <strong>Monthly/Yearly Projections</strong> — Estimated earnings over time</li>
                    </ul>
                </CardContent>
            </Card>
            <Link
                href="/calculator"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
            >
                Open ROI Calculator <ArrowRight className="h-4 w-4" />
            </Link>
        </div>
    ),

    widgets: (
        <div className="space-y-6">
            <p className="text-muted-foreground">
                Embed live pNode Watch stats on your own website. Choose from various widget types and customize their appearance.
            </p>
            <Card>
                <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Available Widgets</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <strong>Network Stats</strong> — Total nodes, uptime, storage</li>
                        <li>• <strong>Price Ticker</strong> — Live XAND price</li>
                        <li>• <strong>Node Status</strong> — Single node status badge</li>
                        <li>• <strong>Leaderboard Mini</strong> — Top 5 nodes preview</li>
                    </ul>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Copy className="h-4 w-4" />
                        Embed Code
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                        Copy the iframe code from the Widgets page and paste it into your HTML.
                        Widgets auto-update with live data.
                    </p>
                </CardContent>
            </Card>
            <Link
                href="/widgets"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
            >
                Browse Widgets <ArrowRight className="h-4 w-4" />
            </Link>
        </div>
    ),

    copilot: (
        <div className="space-y-6">
            <p className="text-muted-foreground">
                Your personal AI assistant powered by advanced language models. The Copilot has access to real-time network data
                and can generate intelligent insights about the network.
            </p>
            <Card className="bg-emerald-500/5 border-emerald-500/20">
                <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Try asking:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• &quot;What&apos;s the current XAND price?&quot;</li>
                        <li>• &quot;How do credits work?&quot;</li>
                        <li>• &quot;Show me the top 5 nodes by uptime&quot;</li>
                        <li>• &quot;Compare nodes ABC123 and XYZ789&quot;</li>
                        <li>• &quot;Which pNodes are best for staking?&quot;</li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-3">
                        Click the <Sparkles className="h-3 w-3 inline text-emerald-500" /> button in the bottom-right corner to open.
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Brain className="h-4 w-4 text-primary" />
                        Network Summary
                    </h4>
                    <p className="text-sm text-muted-foreground">
                        The dashboard features AI-generated network summaries that provide
                        intelligent insights about network health, trends, and recommendations.
                    </p>
                </CardContent>
            </Card>
        </div>
    ),

    'about-xand': (
        <div className="space-y-6">
            <p className="text-muted-foreground">
                The About XAND page provides comprehensive information about the XAND token, including live price data,
                market statistics, and trading options.
            </p>
            <Card>
                <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Page Features</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <strong>Live Price</strong> — Real-time XAND price from Jupiter</li>
                        <li>• <strong>Price Chart</strong> — Historical price visualization</li>
                        <li>• <strong>Market Stats</strong> — Volume, market cap, supply info</li>
                        <li>• <strong>Trade Links</strong> — Quick access to DEX trading</li>
                        <li>• <strong>Token Info</strong> — Contract address, decimals, etc.</li>
                    </ul>
                </CardContent>
            </Card>
            <Link
                href="/about"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
            >
                View About XAND <ArrowRight className="h-4 w-4" />
            </Link>
        </div>
    ),

    bots: (
        <div className="space-y-6">
            <p className="text-muted-foreground">
                Get pNode Watch notifications and data directly in Telegram or Discord.
                Set up bots to monitor your nodes and receive alerts.
            </p>
            <Card>
                <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Bot Features</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <strong>Node Alerts</strong> — Get notified when nodes go offline</li>
                        <li>• <strong>Status Checks</strong> — Query node status via chat commands</li>
                        <li>• <strong>Price Updates</strong> — XAND price notifications</li>
                        <li>• <strong>Network Stats</strong> — Quick network overview</li>
                    </ul>
                </CardContent>
            </Card>
            <Link
                href="/bots"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
            >
                Set Up Bots <ArrowRight className="h-4 w-4" />
            </Link>
        </div>
    ),

    alerts: (
        <div className="space-y-6">
            <p className="text-muted-foreground">
                Get notified when nodes go offline, uptime drops, or versions change. Subscribe via email or browser push notifications.
            </p>
            <Card>
                <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Available Alert Types</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <strong>Node Offline</strong> — Node goes from online to offline</li>
                        <li>• <strong>Uptime Drop</strong> — Uptime falls below your threshold</li>
                        <li>• <strong>Version Change</strong> — Node updates to a new version</li>
                    </ul>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Notification Methods</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <strong>Email</strong> — Receive alerts to your inbox</li>
                        <li>• <strong>Push Notifications</strong> — Browser notifications (PWA)</li>
                        <li>• <strong>Telegram/Discord</strong> — Via bots integration</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    ),

    'self-hosting': (
        <div className="space-y-6">
            <p className="text-muted-foreground">
                pNode Watch is <strong>open source</strong> and can be self-hosted on your own server.
                This is great for customization, privacy, or running a local instance for your team.
            </p>

            <Card className="bg-emerald-500/5 border-emerald-500/20">
                <CardContent className="p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Source Code
                    </h4>
                    <Link
                        href="https://github.com/abulimen/xandeum-pnode-watch-vercel"
                        target="_blank"
                        className="text-primary hover:underline text-sm"
                    >
                        github.com/abulimen/xandeum-pnode-watch-vercel
                    </Link>
                </CardContent>
            </Card>

            <div>
                <h3 className="font-semibold mb-3">Quick Start</h3>
                <Card>
                    <CardContent className="p-4">
                        <pre className="text-sm bg-muted/50 p-3 rounded-lg overflow-x-auto">
                            {`# Clone the repository
git clone https://github.com/abulimen/xandeum-pnode-watch-vercel.git
cd xandeum-pnode-watch-vercel

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your settings

# Start development server
npm run dev`}
                        </pre>
                        <p className="text-xs text-muted-foreground mt-2">
                            Open <code className="px-1 bg-muted rounded">http://localhost:3000</code> in your browser.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div>
                <h3 className="font-semibold mb-3">Prerequisites</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Node.js</strong> — v18.17+ or v20+ (LTS recommended)</li>
                    <li>• <strong>npm</strong> — v9+ (comes with Node.js)</li>
                    <li>• <strong>Git</strong> — For cloning the repository</li>
                </ul>
            </div>

            <div>
                <h3 className="font-semibold mb-3">Tech Stack</h3>
                <div className="grid gap-2 sm:grid-cols-2 text-sm">
                    <div className="p-2 rounded bg-muted/50">Next.js 14+ (App Router)</div>
                    <div className="p-2 rounded bg-muted/50">TypeScript</div>
                    <div className="p-2 rounded bg-muted/50">Tailwind CSS + shadcn/ui</div>
                    <div className="p-2 rounded bg-muted/50">TanStack Query</div>
                    <div className="p-2 rounded bg-muted/50">Supabase (PostgreSQL)</div>
                    <div className="p-2 rounded bg-muted/50">Recharts + react-simple-maps</div>
                </div>
            </div>
        </div>
    ),

    environment: (
        <div className="space-y-6">
            <p className="text-muted-foreground">
                Configure your instance by setting environment variables. Create a <code className="px-1 bg-muted rounded">.env.local</code> file
                in the project root (copy from <code className="px-1 bg-muted rounded">.env.example</code>).
            </p>

            <div>
                <h3 className="font-semibold mb-3">Required Variables</h3>
                <Card>
                    <CardContent className="p-4 space-y-3">
                        <div className="text-sm">
                            <code className="text-primary font-mono">NEXT_PUBLIC_PNODE_SEED_IPS</code>
                            <p className="text-muted-foreground text-xs mt-1">
                                Comma-separated seed node IPs. Example: <code>173.212.203.145,65.109.29.154</code>
                            </p>
                        </div>
                        <div className="text-sm">
                            <code className="text-primary font-mono">SUPABASE_URL</code>
                            <p className="text-muted-foreground text-xs mt-1">
                                Your Supabase project URL.
                            </p>
                        </div>
                        <div className="text-sm">
                            <code className="text-primary font-mono">SUPABASE_SERVICE_ROLE_KEY</code>
                            <p className="text-muted-foreground text-xs mt-1">
                                Supabase Service Role Key (safe for server-side use).
                            </p>
                        </div>
                        <div className="text-sm">
                            <code className="text-primary font-mono">SUPABASE_ANON_KEY</code>
                            <p className="text-muted-foreground text-xs mt-1">
                                Supabase Anon Key (for client-side Auth).
                            </p>
                        </div>
                        <div className="text-sm">
                            <code className="text-primary font-mono">BASE_URL</code>
                            <p className="text-muted-foreground text-xs mt-1">
                                Your production base URL.
                            </p>
                        </div>
                        <div className="text-sm">
                            <code className="text-primary font-mono">GEMINI_API_KEY</code>
                            <p className="text-muted-foreground text-xs mt-1">
                                For AI Copilot features.
                            </p>
                        </div>
                        <div className="text-sm">
                            <code className="text-primary font-mono">LONGCAT_API_KEY</code>
                            <p className="text-muted-foreground text-xs mt-1">
                                For Network Summary AI generation.
                            </p>
                        </div>
                        <div className="text-sm">
                            <code className="text-primary font-mono">JUPITER_API_KEY</code>
                            <p className="text-muted-foreground text-xs mt-1">
                                For fetching live XAND token price.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div>
                <h3 className="font-semibold mb-3">Database Setup</h3>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground mb-2">Initialize your Supabase database:</p>
                        <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                            <li>Create a new Supabase project</li>
                            <li>Go to the SQL Editor in Supabase dashboard</li>
                            <li>Run the migration scripts found in <code className="px-1 bg-muted rounded">scripts/*.sql</code></li>
                        </ol>
                    </CardContent>
                </Card>
            </div>

            <div>
                <h3 className="font-semibold mb-3">Optional Variables</h3>
                <Card>
                    <CardContent className="p-4">
                        <div className="space-y-2 text-sm">
                            <div className="grid grid-cols-[200px_1fr] gap-2 items-start">
                                <code className="font-mono text-xs">NEXT_PUBLIC_PNODE_RPC_PORT</code>
                                <span className="text-muted-foreground text-xs">Default: 6000</span>
                            </div>
                            <div className="grid grid-cols-[200px_1fr] gap-2 items-start">
                                <code className="font-mono text-xs">NEXT_PUBLIC_PNODE_RPC_ENDPOINT</code>
                                <span className="text-muted-foreground text-xs">Default: /rpc</span>
                            </div>
                            <div className="grid grid-cols-[200px_1fr] gap-2 items-start">
                                <code className="font-mono text-xs">BREVO_API_KEY</code>
                                <span className="text-muted-foreground text-xs">For email alerts</span>
                            </div>
                            <div className="grid grid-cols-[200px_1fr] gap-2 items-start">
                                <code className="font-mono text-xs">NEXT_PUBLIC_VAPID_PUBLIC_KEY</code>
                                <span className="text-muted-foreground text-xs">For push notifications</span>
                            </div>
                            <div className="grid grid-cols-[200px_1fr] gap-2 items-start">
                                <code className="font-mono text-xs">VAPID_PRIVATE_KEY</code>
                                <span className="text-muted-foreground text-xs">For push notifications</span>
                            </div>
                            <div className="grid grid-cols-[200px_1fr] gap-2 items-start">
                                <code className="font-mono text-xs">TELEGRAM_BOT_TOKEN</code>
                                <span className="text-muted-foreground text-xs">For Telegram bot</span>
                            </div>
                            <div className="grid grid-cols-[200px_1fr] gap-2 items-start">
                                <code className="font-mono text-xs">DISCORD_BOT_TOKEN</code>
                                <span className="text-muted-foreground text-xs">For Discord bot</span>
                            </div>
                            <div className="grid grid-cols-[200px_1fr] gap-2 items-start">
                                <code className="font-mono text-xs">CRON_SECRET</code>
                                <span className="text-muted-foreground text-xs">For securing cron jobs</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div>
                <h3 className="font-semibold mb-3">Generate VAPID Keys</h3>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground mb-2">For push notifications, generate keys using:</p>
                        <pre className="text-sm bg-muted/50 p-2 rounded">npx web-push generate-vapid-keys</pre>
                    </CardContent>
                </Card>
            </div>
        </div>
    ),

    deployment: (
        <div className="space-y-6">
            <p className="text-muted-foreground">
                Deploy pNode Watch to production using one of these methods.
            </p>

            <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Badge className="bg-green-500">Recommended</Badge>
                    Vercel
                </h3>
                <Card>
                    <CardContent className="p-4">
                        <ol className="text-sm text-muted-foreground space-y-2">
                            <li>1. Push your code to GitHub/GitLab</li>
                            <li>2. Go to <Link href="https://vercel.com/new" target="_blank" className="text-primary hover:underline">vercel.com/new</Link></li>
                            <li>3. Import your repository (Vercel auto-detects Next.js)</li>
                            <li>4. Add environment variables (including <code>SUPABASE_URL</code>/<code>KEY</code>)</li>
                            <li>5. Click Deploy — done!</li>
                        </ol>
                        <p className="text-xs text-muted-foreground mt-3">
                            Automatic redeployment on every push to main branch.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div>
                <h3 className="font-semibold mb-3">Docker</h3>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground mb-2">Self-host using Docker containers:</p>
                        <pre className="text-sm bg-muted/50 p-3 rounded-lg overflow-x-auto">
                            {`# Create .env file with your variables
cp .env.example .env
# Ensure SUPABASE_* vars are set

# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f`}
                        </pre>
                        <p className="text-xs text-muted-foreground mt-2">
                            Requires Docker and docker-compose. See <code>docker-compose.yml</code>.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div>
                <h3 className="font-semibold mb-3">VPS / Bare Metal</h3>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground mb-2">Deploy to a Linux server with PM2:</p>
                        <pre className="text-sm bg-muted/50 p-3 rounded-lg overflow-x-auto">
                            {`# Install Node.js 20 & PM2
# (See full docs for install commands)

# Clone and setup
git clone https://github.com/abulimen/xandeum-pnode-watch-vercel.git
cd xandeum-pnode-watch-vercel
npm ci
cp .env.example .env.local
# Set SUPABASE_* and other vars

# Build
npm run build

# Start with PM2
pm2 start npm --name "pnode-watch" -- start`}
                        </pre>
                    </CardContent>
                </Card>
            </div>

            <div>
                <h3 className="font-semibold mb-3">Updating</h3>
                <Card>
                    <CardContent className="p-4">
                        <pre className="text-sm bg-muted/50 p-3 rounded-lg overflow-x-auto">
                            {`git pull origin main
npm ci
npm run build
pm2 restart pnode-watch`}
                        </pre>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-blue-500/5 border-blue-500/20">
                <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Full Documentation</h4>
                    <p className="text-sm text-muted-foreground">
                        See the complete deployment guide at{' '}
                        <Link
                            href="https://github.com/abulimen/xandeum-pnode-watch-vercel/blob/main/docs/DEPLOYMENT.md"
                            target="_blank"
                            className="text-primary hover:underline"
                        >
                            docs/DEPLOYMENT.md
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    ),

    // Legacy redirects for old URLs
    'node-explorer': null, // Redirect to dashboard
    'staking-calculator': null, // Removed - use roi-calculator
};

