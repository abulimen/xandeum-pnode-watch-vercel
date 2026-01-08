/**
 * Footer Component
 */

import { Github, Globe, Youtube, Linkedin } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
    return (
        <footer className="border-t border-border/40 bg-background/50 backdrop-blur-sm mt-auto mb-10">
            <div className="container flex flex-col gap-6 py-8 px-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <div className="flex h-6 w-auto items-center justify-center overflow-hidden">
                            <img src="/logo.png" alt="pNode Watch" className="h-6 w-auto object-contain dark:hidden" />
                            <img src="/logo.png" alt="pNode Watch" className="h-6 w-auto object-contain hidden dark:block" />
                        </div>
                        <span className="font-semibold text-foreground" style={{ marginLeft: "-10px" }}>
                            Node Watch
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground max-w-xs">
                        Real-time monitoring and analytics for the Xandeum pNode network.
                    </p>
                </div>

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
                    <div className="flex gap-4 text-sm text-muted-foreground">
                        <Link
                            href="https://xandeum.network"
                            target="_blank"
                            className="hover:text-primary transition-colors flex items-center gap-1"
                        >
                            <Globe className="h-3 w-3" />
                            Website
                        </Link>
                        <Link
                            href="https://docs.xandeum.network"
                            target="_blank"
                            className="hover:text-primary transition-colors"
                        >
                            Docs
                        </Link>
                        <Link
                            href="/privacy"
                            className="hover:text-primary transition-colors"
                        >
                            Privacy
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href="https://x.com/Xandeum"
                            target="_blank"
                            className="text-muted-foreground hover:text-primary transition-colors p-2 hover:bg-primary/5 rounded-full"
                            title="X (Twitter)"
                        >
                            {/* X (Twitter) Logo */}
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                            <span className="sr-only">X (Twitter)</span>
                        </Link>
                        <Link
                            href="https://discord.com/invite/mGAxAuwnR9"
                            target="_blank"
                            className="text-muted-foreground hover:text-primary transition-colors p-2 hover:bg-primary/5 rounded-full"
                            title="Discord"
                        >
                            {/* Discord Logo */}
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
                            </svg>
                            <span className="sr-only">Discord</span>
                        </Link>
                        <Link
                            href="https://www.facebook.com/xandeumlabs"
                            target="_blank"
                            className="text-muted-foreground hover:text-primary transition-colors p-2 hover:bg-primary/5 rounded-full"
                            title="Facebook"
                        >
                            {/* Facebook Logo */}
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            <span className="sr-only">Facebook</span>
                        </Link>
                        <Link
                            href="https://www.youtube.com/@BlockchainBernie"
                            target="_blank"
                            className="text-muted-foreground hover:text-primary transition-colors p-2 hover:bg-primary/5 rounded-full"
                            title="YouTube"
                        >
                            <Youtube className="h-4 w-4" />
                            <span className="sr-only">YouTube</span>
                        </Link>
                        <Link
                            href="https://www.linkedin.com/company/xandeum-labs/"
                            target="_blank"
                            className="text-muted-foreground hover:text-primary transition-colors p-2 hover:bg-primary/5 rounded-full"
                            title="LinkedIn"
                        >
                            <Linkedin className="h-4 w-4" />
                            <span className="sr-only">LinkedIn</span>
                        </Link>
                    </div>
                </div>
            </div>
            <div className="border-t border-border/40 bg-muted/20">
                <div className="container py-4 px-4 text-center md:text-left">
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} pNode Watch. Built by{' '}
                        <a
                            href="https://xpansieve.com.ng"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                        >
                            XpanSieve Solutions
                        </a>
                        . This platform is a community-built initiative to support Xandeum operators and is not an official product of Xandeum Labs.
                    </p>
                </div>
            </div>
        </footer>
    );
}
