"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserSync } from "@/components/UserSync";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Background } from "@/components/Background";
import { Footer } from "@/components/Footer";

import { LoadingSpinner } from "@/components/ui/loading";
import {
  BarChart3,
  Users,
  DollarSign,
  Clock,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  Star,
  TrendingUp,
  Factory,
  Calculator,
  UserCheck
} from "lucide-react";

export default function Home() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const userData = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  // Redirect to dashboard if user is signed in and has completed onboarding
  useEffect(() => {
    if (isLoaded && user && userData && userData.hasCompletedOnboarding) {
      router.push("/dashboard");
    }
  }, [isLoaded, user, userData, router]);

  return (
    <div className="flex flex-col min-h-screen">
      <UserSync />

      <SignedOut>
        <Background />
        <main className="flex-1 w-full">
          {/* Hero Section */}
          <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8">
                  <Factory className="w-4 h-4" />
                  Production Management Made Simple
                </div>

                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-sans font-bold mb-6 tracking-tight">
                  <span className="bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent">
                    RateSheet
                  </span>
                </h1>

                <p className="text-xl sm:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
                  Transform your garment manufacturing with real-time production tracking,
                  automated payroll calculations, and comprehensive workforce management.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                  <Button size="lg" className="text-lg px-8 py-4 h-auto">
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button variant="outline" size="lg" className="text-lg px-8 py-4 h-auto" asChild>
                    <a href="https://github.com/nomandhoni-cs/rate-sheet" target="_blank" rel="noopener noreferrer">
                      View on GitHub
                    </a>
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>Open Source</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Free for Private Use</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-primary" />
                    <span>Real-time Updates</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-sans font-bold mb-4">
                  Everything you need to manage production
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Streamline your manufacturing operations with powerful tools designed for modern garment facilities.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <BarChart3 className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Real-time Production Tracking</CardTitle>
                    <CardDescription className="text-base">
                      Monitor daily worker output with instant logging and comprehensive reporting dashboards.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Calculator className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Dynamic Piece-rate Pricing</CardTitle>
                    <CardDescription className="text-base">
                      Set time-sensitive rates for each style with automatic payroll calculations and rate history.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Team Management</CardTitle>
                    <CardDescription className="text-base">
                      Organize workers into sections with role-based access control for managers and administrators.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <DollarSign className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Automated Payroll</CardTitle>
                    <CardDescription className="text-base">
                      Calculate accurate wages based on production output and dynamic piece rates automatically.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Secure & Reliable</CardTitle>
                    <CardDescription className="text-base">
                      Enterprise-grade security with role-based permissions and real-time data synchronization.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Analytics & Insights</CardTitle>
                    <CardDescription className="text-base">
                      Gain valuable insights into production trends, worker performance, and operational efficiency.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </section>

          {/* How it Works Section */}
          <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-sans font-bold mb-4">
                  How RateSheet Works
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Get up and running in minutes with our intuitive workflow designed for manufacturing teams.
                </p>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                    <UserCheck className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-sans font-semibold mb-4">1. Setup Your Team</h3>
                  <p className="text-muted-foreground">
                    Add workers, create sections, and define your organizational structure with role-based access.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                    <DollarSign className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-sans font-semibold mb-4">2. Configure Rates</h3>
                  <p className="text-muted-foreground">
                    Set up your product styles and define piece rates that can change over time as needed.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                    <BarChart3 className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-sans font-semibold mb-4">3. Track & Analyze</h3>
                  <p className="text-muted-foreground">
                    Log daily production, monitor performance, and generate automated payroll calculations.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary/5">
            <div className="max-w-7xl mx-auto">
              <div className="grid md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-4xl font-sans font-bold text-primary mb-2">Free</div>
                  <div className="text-muted-foreground">Private Use</div>
                </div>
                <div>
                  <div className="text-4xl font-sans font-bold text-primary mb-2">Real-time</div>
                  <div className="text-muted-foreground">Data Sync</div>
                </div>
                <div>
                  <div className="text-4xl font-sans font-bold text-primary mb-2">Unlimited</div>
                  <div className="text-muted-foreground">Workers</div>
                </div>
                <div>
                  <div className="text-4xl font-sans font-bold text-primary mb-2">24/7</div>
                  <div className="text-muted-foreground">Availability</div>
                </div>
              </div>
            </div>
          </section>

          {/* Benefits Section */}
          <section className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-sans font-bold mb-4">
                  Why Choose RateSheet?
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Built specifically for garment manufacturing with features that matter to your business.
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-sans font-semibold text-lg mb-2">No Vendor Lock-in</h3>
                      <p className="text-muted-foreground">
                        Open source means you own your data and can customize the system to fit your exact needs.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-sans font-semibold text-lg mb-2">Time-Sensitive Pricing</h3>
                      <p className="text-muted-foreground">
                        Handle rate changes over time with automatic historical tracking and accurate payroll calculations.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-sans font-semibold text-lg mb-2">Lightning Fast</h3>
                      <p className="text-muted-foreground">
                        Built with modern technology stack for instant updates and real-time collaboration.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-primary/10 to-purple-600/10 rounded-2xl p-8 text-center">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                    <Factory className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <h3 className="font-sans font-bold text-2xl mb-4">Ready to Get Started?</h3>
                  <p className="text-muted-foreground mb-6">
                    Join the growing community of manufacturers using RateSheet to streamline their operations.
                  </p>
                  <Button size="lg" className="w-full">
                    Start Your Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl font-sans font-bold mb-6">
                Ready to transform your production tracking?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join the modern manufacturing revolution with RateSheet's comprehensive production management platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button size="lg" className="text-lg px-8 py-4 h-auto">
                  Start Free Today
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-4 h-auto" asChild>
                  <a href="https://github.com/nomandhoni-cs/rate-sheet" target="_blank" rel="noopener noreferrer">
                    Star on GitHub
                  </a>
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                No credit card required • Free for private use • <a href="mailto:alnoman.dhoni@gmail.com" className="text-primary hover:underline">Contact sales</a> for commercial use
              </p>
            </div>
          </section>
        </main>
        <Footer />
      </SignedOut>

      <SignedIn>
        {/* This will be handled by UserSync and redirect */}
        <main className="flex-1 flex items-center justify-center pt-16">
          <div className="text-center animate-fadeInUp">
            <LoadingSpinner size="lg" className="mb-4 mx-auto" />
            <h2 className="text-lg font-sans font-medium text-foreground mb-2">Loading Dashboard</h2>
            <p className="text-sm text-muted-foreground">Redirecting you to your workspace...</p>
          </div>
        </main>
      </SignedIn>
    </div>
  );
}
