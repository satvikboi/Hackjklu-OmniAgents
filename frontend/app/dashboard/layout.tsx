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
  LayoutGrid,
  Zap,
  FileText,
  Settings,
  Menu,
  Bell,
  Search,
  LogOut,
  User,
  HelpCircle,
  ChevronRight,
  Layers,
  Bot,
} from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutGrid,
  },
  {
    title: "Agents",
    href: "/dashboard/agents",
    icon: Bot,
    highlight: true,
  },
  {
    title: "Automations",
    href: "/dashboard/automations",
    icon: Zap,
    badge: "8",
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: FileText,
  },
];

const bottomNavItems = [
  {
    title: "Integrations",
    href: "/dashboard/settings",
    icon: Layers,
  },
  {
    title: "Settings",
    href: "/dashboard/settings#preferences",
    icon: Settings,
  },
];

function Sidebar() {
  const pathname = usePathname();

  const NavItem = ({ item, isBottom = false }: { item: any; isBottom?: boolean }) => {
    const Icon = item.icon;
    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
    
    return (
      <Link
        href={item.href}
        className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
          isActive
            ? "bg-zinc-900 text-white"
            : item.highlight
              ? "bg-violet-50 text-violet-700 hover:bg-violet-100 hover:text-violet-800"
              : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-[18px] h-[18px] ${isActive ? "text-white" : item.highlight ? "text-violet-500" : "text-zinc-400 group-hover:text-zinc-600"}`} />
          <span>{item.title}</span>
        </div>
        {item.badge && (
          <Badge variant="secondary" className={`text-[10px] h-5 px-1.5 font-medium ${isActive ? "bg-white/20 text-white" : "bg-zinc-200 text-zinc-600"}`}>
            {item.badge}
          </Badge>
        )}
      </Link>
    );
  };

  return (
    <div className="flex h-full flex-col bg-white border-r border-zinc-200">
      {/* Logo */}
      <div className="flex h-16 items-center px-5 border-b border-zinc-100">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-zinc-900">OmniAgent</span>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <div className="px-3 space-y-1">
          {navItems.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </div>
      </ScrollArea>

      {/* Bottom Navigation */}
      <div className="border-t border-zinc-100 p-3 space-y-1">
        {bottomNavItems.map((item) => (
          <NavItem key={item.href} item={item} isBottom />
        ))}
      </div>

      {/* User Profile Card */}
      <div className="border-t border-zinc-100 p-3">
        <div className="rounded-lg bg-zinc-50 p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
              <AvatarFallback className="bg-violet-100 text-violet-700 text-sm font-semibold">
                OM
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 truncate">Omni User</p>
              <p className="text-xs text-zinc-500 truncate">user@omniagent.com</p>
            </div>
          </div>
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
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-60">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-6">
          <div className="flex items-center gap-4 flex-1">
            <MobileSidebar />
            
            {/* Search Bar */}
            <div className="hidden md:flex items-center flex-1 max-w-lg">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search automations, reports..."
                  className="w-full h-10 pl-10 pr-4 rounded-lg border border-zinc-200 bg-zinc-50 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg hover:bg-zinc-100">
              <Bell className="h-5 w-5 text-zinc-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full" />
            </Button>

            {/* Help */}
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-zinc-100">
              <HelpCircle className="h-5 w-5 text-zinc-500" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 h-9 px-2 hover:bg-zinc-100 rounded-lg">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-violet-100 text-violet-700 text-xs font-semibold">
                      OM
                    </AvatarFallback>
                  </Avatar>
                  <ChevronRight className="h-4 w-4 text-zinc-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
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
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
