"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Github, Mail, Sparkles, Brain, Workflow, Shield } from "lucide-react";
import Link from "next/link";

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate auth
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-24">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2 mb-12 group">
            <span className="text-2xl font-display">OmniAgent</span>
            <span className="text-xs text-muted-foreground font-mono">AI</span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-display tracking-tight mb-2">
              {isSignIn ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-muted-foreground">
              {isSignIn
                ? "Enter your credentials to access your account"
                : "Start your journey with AI-powered agents"}
            </p>
          </div>

          {/* Social Auth */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button variant="outline" className="h-11 rounded-full">
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </Button>
            <Button variant="outline" className="h-11 rounded-full">
              <Mail className="w-4 h-4 mr-2" />
              Google
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-foreground/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isSignIn && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="h-11 rounded-xl"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                className="h-11 rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="h-11 rounded-xl"
                required
              />
            </div>

            {!isSignIn && (
              <div className="flex items-start space-x-2">
                <Checkbox id="terms" className="mt-1" />
                <label
                  htmlFor="terms"
                  className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the{" "}
                  <Link href="#" className="text-foreground hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="text-foreground hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>
            )}

            {isSignIn && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" />
                  <label
                    htmlFor="remember"
                    className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </label>
                </div>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 rounded-full bg-foreground hover:bg-foreground/90 text-background group"
              disabled={isLoading}
            >n              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                  {isSignIn ? "Signing in..." : "Creating account..."}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {isSignIn ? "Sign in" : "Create account"}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              )}
            </Button>
          </form>

          {/* Toggle */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsSignIn(!isSignIn)}
              className="text-foreground hover:underline font-medium"
            >
              {isSignIn ? "Sign up" : "Sign in"}
            </button>
          </p>

          {/* Back to home */}
          <Link
            href="/"
            className="mt-8 inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            Back to home
          </Link>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-foreground text-background relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 40px,
              currentColor 40px,
              currentColor 41px
            )`
          }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24">
          {/* Quote */}
          <blockquote className="mb-12">
            <p className="text-3xl xl:text-4xl font-display leading-tight mb-6">
              "OmniAgent transformed how we research market opportunities. What used to take days now happens in minutes."
            </p>
            <footer>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-background/20" />
                <div>
                  <div className="font-medium">Sarah Chen</div>
                  <div className="text-sm text-background/60">Product Lead, TechCorp</div>
                </div>
              </div>
            </footer>
          </blockquote>

          {/* Features */}
          <div className="grid grid-cols-2 gap-6">
            {[
              { icon: Brain, label: "5 AI Agents", desc: "Collaborating in real-time" },
              { icon: Workflow, label: "Self-Healing", desc: "Auto-correction loops" },
              { icon: Shield, label: "Verified", desc: "Confidence scoring" },
              { icon: Sparkles, label: "60 Seconds", desc: "Average completion" },
            ].map((feature) => (
              <div key={feature.label} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-background/10 flex items-center justify-center shrink-0">
                  <feature.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium text-sm">{feature.label}</div>
                  <div className="text-xs text-background/60">{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-background/5 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 w-64 h-64 bg-background/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
