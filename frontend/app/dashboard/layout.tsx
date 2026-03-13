"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Megaphone,
  MessageSquare,
  BarChart3,
  Zap,
  Settings,
  Menu,
  Sparkles,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  User,
  HelpCircle,
  Plus,
} from "lucide-react";

// Main navigation items matching Shopify structure
const mainNavItems = [
  { title: "Home", href: "/dashboard", icon: LayoutDashboard },
  { title: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
  { title: "Products", href: "/dashboard/products", icon: Package },
  { title: "Customers", href: "/dashboard/customers", icon: Users },
];

// Marketing section
const marketingNavItems = [
  { title: "Marketing", href: "/dashboard/marketing", icon: Megaphone },
  { title: "Automations", href: "/dashboard/automations", icon: Zap, badge: "8" },
];

// Analytics section
const analyticsNavItems = [
  { title: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { title: "Reports", href: "/dashboard/reports", icon: MessageSquare },
];

// Apps section
const appsNavItems = [
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
];

function Sidebar() {
  const pathname = usePathname();

  const NavItem = ({ item }: { item: any }) => {
    const Icon = item.icon;
    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
    
    return (
      <Link
        href={item.href}
        className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-[18px] h-[18px]" />
          <span>{item.title}</span>
        </div>
        {item.badge && (
          <Badge variant="secondary" className="text-xs h-5 px-1.5">
            {item.badge}
          </Badge>
        )}
      </Link>
    );
  };

  const NavSection = ({ title, items }: { title?: string; items: any[] }) => (
    <div className="px-3 py-2">
      {title && (
        <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </h3>
      )}
      <nav className="space-y-0.5">
        {items.map((item) => (
          <NavItem key={item.href} item={item} />
        ))}
      </nav>
    </div>
  );

  return (
    <div className="flex h-full flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-foreground flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-background" />
          </div>
          <span className="text-base font-semibold tracking-tight">OmniAgent</span>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-2">
        <NavSection items={mainNavItems} />
        <div className="my-2 border-t" />
        <NavSection title="Marketing" items={marketingNavItems} />
        <div className="my-2 border-t" />
        <NavSection title="Analytics" items={analyticsNavItems} />
        <div className="my-2 border-t" />
        <NavSection title="Apps" items={appsNavItems} />
      </ScrollArea>

      {/* Bottom - Trial Banner */}
      <div className="border-t p-3">
        <div className="rounded-lg bg-muted p-3">
          <p className="text-xs font-medium text-foreground">Trial ends in 14 days</p>
          <p className="text-xs text-muted-foreground mt-0.5">Subscribe for ₹999/mo</p>
          <Button size="sm" className="w-full mt-2 text-xs h-8">
            Subscribe now
          </Button>
        </div>
      </div>
    </div>
  );
}

function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-60">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Shopify Style */}
        <header className="flex h-14 items-center justify-between border-b bg-card px-4">
          <div className="flex items-center gap-4 flex-1">
            <MobileSidebar />
            
            {/* Search Bar */}
            <div className="hidden md:flex items-center flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full h-9 pl-9 pr-4 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-1">
            {/* Store Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 hidden sm:flex">
                  <span className="font-medium">My Store</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Your stores</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-xs font-bold">
                      M
                    </div>
                    <span>My Store</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Plus className="mr-2 h-4 w-4" />
                  Add store
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            </Button>

            {/* Help */}
            <Button variant="ghost" size="icon">
              <HelpCircle className="h-5 w-5" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-1">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                      OM
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Omni User</DropdownMenuLabel>
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                  user@omniagent.com
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-muted/30">
          {children}
        </main>
      </div>
    </div>
  );
}

