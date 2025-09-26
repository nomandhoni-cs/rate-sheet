import { Github, Heart } from "lucide-react";

export function Footer() {
    return (
        <footer className="relative z-10 border-t border-border/40 bg-background/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-2">
                        <h3 className="font-sans font-bold text-lg mb-4">RateSheet</h3>
                        <p className="text-muted-foreground mb-4 max-w-md">
                            Open-source production tracking and payroll management system for garment manufacturing facilities.
                        </p>
                        <a
                            href="https://github.com/nomandhoni-cs/RateSheet"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                        >
                            <Github className="w-4 h-4" />
                            View on GitHub
                        </a>
                    </div>

                    <div>
                        <h4 className="font-sans font-semibold mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                            <li><a href="mailto:alnoman.dhoni@gmail.com" className="hover:text-foreground transition-colors">Commercial Licensing</a></li>
                            <li><a href="#docs" className="hover:text-foreground transition-colors">Documentation</a></li>
                            <li><a href="#api" className="hover:text-foreground transition-colors">API</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-sans font-semibold mb-4">Resources</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="#support" className="hover:text-foreground transition-colors">Support</a></li>
                            <li><a href="#community" className="hover:text-foreground transition-colors">Community</a></li>
                            <li><a href="#blog" className="hover:text-foreground transition-colors">Blog</a></li>
                            <li><a href="#changelog" className="hover:text-foreground transition-colors">Changelog</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border/40 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        © 2025 RateSheet. Free for private use • <a href="mailto:alnoman.dhoni@gmail.com" className="text-primary hover:underline">Contact sales</a> for commercial use
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                        Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> for manufacturers
                    </p>
                </div>
            </div>
        </footer>
    );
}