"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ShoppingBag,
  Package,
  Users,
  Megaphone,
  MessageSquare,
  BarChart3,
  TrendingUp,
  Zap,
  Play,
  Pause,
  Settings,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  MoreHorizontal,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  Instagram,
  Mail,
  FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";

// 8 Automation categories from api.md
const automationsData = [
  {
    id: "order-management",
    name: "Order Management",
    description: "Automated order confirmations, shipping updates, and review requests",
    icon: ShoppingBag,
    category: "Orders",
    schedule: "Triggered by Shopify webhooks",
    status: "active",
    lastRun: "2 min ago",
    nextRun: "On next order",
    stats: { runs: 156, success: 156 },
    apis: ["Shopify", "Gmail", "WhatsApp"],
  },
  {
    id: "inventory-management",
    name: "Inventory Management",
    description: "Daily stock checks with low stock alerts and auto-reorder emails",
    icon: Package,
    category: "Inventory",
    schedule: "Daily at 6:00 AM IST",
    status: "active",
    lastRun: "Today, 6:00 AM",
    nextRun: "Tomorrow, 6:00 AM",
    stats: { runs: 30, success: 30 },
    apis: ["Shopify", "Google Sheets", "Gmail", "WhatsApp"],
  },
  {
    id: "customer-reengagement",
    name: "Customer Re-engagement",
    description: "Win back inactive customers with personalized offers",
    icon: Users,
    category: "Marketing",
    schedule: "Weekly on Sunday at 10:00 AM IST",
    status: "active",
    lastRun: "Last Sun, 10:00 AM",
    nextRun: "This Sun, 10:00 AM",
    stats: { runs: 4, success: 4 },
    apis: ["Shopify", "Gmail", "WhatsApp", "Google Sheets"],
  },
  {
    id: "social-media-content",
    name: "Social Media Content",
    description: "Generate and schedule 7 posts per week with trending hashtags",
    icon: Instagram,
    category: "Social Media",
    schedule: "Weekly on Monday at 8:00 AM IST",
    status: "active",
    lastRun: "Mon, 8:00 AM",
    nextRun: "Next Mon, 8:00 AM",
    stats: { runs: 4, success: 4 },
    apis: ["Instagram", "Notion", "Brave Search"],
  },
  {
    id: "review-management",
    name: "Review Management",
    description: "Auto-respond to Google reviews with AI-generated replies",
    icon: MessageSquare,
    category: "Reputation",
    schedule: "Every 2 hours",
    status: "paused",
    lastRun: "Yesterday, 6:00 PM",
    nextRun: "When enabled",
    stats: { runs: 360, success: 358 },
    apis: ["Google My Business", "WhatsApp"],
  },
  {
    id: "sales-analytics",
    name: "Sales Analytics & Reporting",
    description: "Weekly business reports with insights and best sellers",
    icon: BarChart3,
    category: "Analytics",
    schedule: "Weekly on Monday at 7:00 AM IST",
    status: "active",
    lastRun: "Mon, 7:00 AM",
    nextRun: "Next Mon, 7:00 AM",
    stats: { runs: 4, success: 4 },
    apis: ["Shopify", "Google Sheets", "Notion", "WhatsApp", "Gmail"],
  },
  {
    id: "ad-intelligence",
    name: "Ad Campaign Intelligence",
    description: "Monitor competitor ads and optimize your campaigns",
    icon: TrendingUp,
    category: "Advertising",
    schedule: "Daily at 9:00 AM IST",
    status: "active",
    lastRun: "Today, 9:00 AM",
    nextRun: "Tomorrow, 9:00 AM",
    stats: { runs: 30, success: 30 },
    apis: ["Meta Ads", "Brave Search", "Notion", "WhatsApp"],
  },
  {
    id: "customer-support",
    name: "Customer Support",
    description: "Auto-answer common questions via Instagram DMs and WhatsApp",
    icon: MessageSquare,
    category: "Support",
    schedule: "Every 30 minutes",
    status: "active",
    lastRun: "5 min ago",
    nextRun: "In 25 min",
    stats: { runs: 1440, success: 1438 },
    apis: ["Instagram", "WhatsApp", "Shopify"],
  },
];

const statusConfig = {
  active: { label: "Active", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  paused: { label: "Paused", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Pause },
  error: { label: "Error", color: "bg-red-100 text-red-700 border-red-200", icon: AlertCircle },
};

const categoryColors: Record<string, string> = {
  Orders: "bg-blue-50 text-blue-700 border-blue-200",
  Inventory: "bg-purple-50 text-purple-700 border-purple-200",
  Marketing: "bg-pink-50 text-pink-700 border-pink-200",
  "Social Media": "bg-indigo-50 text-indigo-700 border-indigo-200",
  Reputation: "bg-cyan-50 text-cyan-700 border-cyan-200",
  Analytics: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Advertising: "bg-orange-50 text-orange-700 border-orange-200",
  Support: "bg-teal-50 text-teal-700 border-teal-200",
};

function AutomationStatusBadge({ status }: { status: keyof typeof statusConfig }) {
  const config = statusConfig[status] || statusConfig.paused;
  const Icon = config.icon;
  
  return (
    <Badge variant="outline" className={`${config.color} font-medium gap-1`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

export default function AutomationsPage() {
  const [automations, setAutomations] = useState(automationsData);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const toggleAutomation = (id: string) => {
    setAutomations(prev => prev.map(auto => 
      auto.id === id 
        ? { ...auto, status: auto.status === "active" ? "paused" : "active" }
        : auto
    ));
  };

  const filteredAutomations = selectedCategory === "all" 
    ? automations 
    : automations.filter(a => a.category === selectedCategory);

  const activeCount = automations.filter(a => a.status === "active").length;
  const totalRuns = automations.reduce((sum, a) => sum + a.stats.runs, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Automations</h1>
          <p className="text-muted-foreground mt-1">Manage your 8 AI-powered business automations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure All
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Automation
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{activeCount}</p>
              </div>
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Play className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Runs</p>
                <p className="text-2xl font-bold">{totalRuns.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">99.2%</p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Time Saved</p>
                <p className="text-2xl font-bold">48h</p>
              </div>
              <div className="p-2 bg-amber-50 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search automations..."
            className="pl-9"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Orders">Orders</SelectItem>
            <SelectItem value="Inventory">Inventory</SelectItem>
            <SelectItem value="Marketing">Marketing</SelectItem>
            <SelectItem value="Social Media">Social Media</SelectItem>
            <SelectItem value="Reputation">Reputation</SelectItem>
            <SelectItem value="Analytics">Analytics</SelectItem>
            <SelectItem value="Advertising">Advertising</SelectItem>
            <SelectItem value="Support">Support</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Automations Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredAutomations.map((automation) => {
          const Icon = automation.icon;
          const isActive = automation.status === "active";
          const successRate = Math.round((automation.stats.success / automation.stats.runs) * 100);
          
          return (
            <Card key={automation.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isActive ? "bg-gradient-to-br from-blue-500 to-purple-500" : "bg-muted"}`}>
                      <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{automation.name}</h3>
                      <Badge variant="outline" className={`text-[10px] mt-1 ${categoryColors[automation.category]}`}>
                        {automation.category}
                      </Badge>
                    </div>
                  </div>
                  <Switch 
                    checked={isActive}
                    onCheckedChange={() => toggleAutomation(automation.id)}
                  />
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {automation.description}
                </p>

                {/* Schedule */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{automation.schedule}</span>
                </div>

                {/* APIs */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {automation.apis.slice(0, 3).map((api) => (
                    <Badge key={api} variant="secondary" className="text-[10px]">
                      {api}
                    </Badge>
                  ))}
                  {automation.apis.length > 3 && (
                    <Badge variant="secondary" className="text-[10px]">
                      +{automation.apis.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Runs</p>
                      <p className="text-sm font-medium">{automation.stats.runs}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Success</p>
                      <p className="text-sm font-medium text-emerald-600">{successRate}%</p>
                    </div>
                  </div>
                  <AutomationStatusBadge status={automation.status as keyof typeof statusConfig} />
                </div>

                {/* Last/Next Run */}
                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                  <span>Last: {automation.lastRun}</span>
                  <span>Next: {automation.nextRun}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAutomations.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Zap className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No automations found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your filters or create a new automation.</p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Automation
          </Button>
        </Card>
      )}
    </div>
  );
}

