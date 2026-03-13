"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Calendar,
  Zap,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

// Mock data for charts
const salesData = [
  { date: "Feb 12", sales: 0 },
  { date: "Feb 14", sales: 0 },
  { date: "Feb 16", sales: 0 },
  { date: "Feb 18", sales: 0 },
  { date: "Feb 20", sales: 0 },
  { date: "Feb 22", sales: 0 },
  { date: "Feb 24", sales: 0 },
  { date: "Feb 26", sales: 0 },
  { date: "Feb 28", sales: 0 },
  { date: "Mar 2", sales: 0 },
  { date: "Mar 4", sales: 0 },
  { date: "Mar 6", sales: 0 },
  { date: "Mar 8", sales: 0 },
  { date: "Mar 10", sales: 0 },
  { date: "Mar 12", sales: 3 },
];

const recentOrders = [
  { id: "#1001", customer: "Rahul Sharma", amount: "₹2,499", status: "completed", date: "2 min ago" },
  { id: "#1002", customer: "Priya Patel", amount: "₹1,899", status: "processing", date: "15 min ago" },
  { id: "#1003", customer: "Amit Kumar", amount: "₹3,299", status: "pending", date: "1 hour ago" },
  { id: "#1004", customer: "Sneha Gupta", amount: "₹999", status: "completed", date: "2 hours ago" },
];

const automations = [
  { id: 1, name: "Order Management", status: "active", lastRun: "2 min ago", icon: ShoppingBag },
  { id: 2, name: "Inventory Alerts", status: "active", lastRun: "1 hour ago", icon: Package },
  { id: 3, name: "Review Management", status: "warning", lastRun: "2 hours ago", icon: AlertCircle },
  { id: 4, name: "Social Media", status: "active", lastRun: "5 hours ago", icon: Zap },
];

const stats = [
  {
    title: "Total Sales",
    value: "₹0.00",
    change: "+0%",
    trend: "up",
    icon: DollarSign,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    title: "Orders",
    value: "0",
    change: "+0%",
    trend: "up",
    icon: ShoppingBag,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Customers",
    value: "0",
    change: "+0%",
    trend: "neutral",
    icon: Users,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    title: "Avg Order Value",
    value: "₹0.00",
    change: "-0%",
    trend: "down",
    icon: TrendingUp,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
];

function StatCard({ stat }: { stat: any }) {
  const Icon = stat.icon;
  const TrendIcon = stat.trend === "up" ? ArrowUpRight : stat.trend === "down" ? ArrowDownRight : null;
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
            <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
            <div className="flex items-center gap-1 mt-1">
              {TrendIcon && (
                <TrendIcon className={`h-4 w-4 ${stat.trend === "up" ? "text-emerald-600" : "text-red-600"}`} />
              )}
              <span className={`text-sm ${stat.trend === "up" ? "text-emerald-600" : stat.trend === "down" ? "text-red-600" : "text-muted-foreground"}`}>
                {stat.change}
              </span>
              <span className="text-sm text-muted-foreground">vs last 30 days</span>
            </div>
          </div>
          <div className={`p-3 rounded-xl ${stat.bgColor}`}>
            <Icon className={`h-5 w-5 ${stat.color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SalesChart() {
  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Sales over time</CardTitle>
            <CardDescription>Sessions by top 5 channels</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8">
              <Calendar className="h-4 w-4 mr-2" />
              Last 30 days
            </Button>
            <Select defaultValue="daily">
              <SelectTrigger className="w-[100px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="sales" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorSales)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm text-muted-foreground">Direct</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentOrdersTable() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
          <Link href="/dashboard/orders">
            <Button variant="ghost" size="sm" className="h-8 text-blue-600">
              View all
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {order.customer.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{order.customer}</p>
                  <p className="text-xs text-muted-foreground">{order.id} • {order.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{order.amount}</p>
                <Badge 
                  variant={order.status === "completed" ? "default" : order.status === "processing" ? "secondary" : "outline"}
                  className="text-xs mt-1"
                >
                  {order.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AutomationStatus() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Active Automations</CardTitle>
          <Link href="/dashboard/automations">
            <Button variant="ghost" size="sm" className="h-8 text-blue-600">
              Manage
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {automations.map((automation) => {
            const Icon = automation.icon;
            return (
              <div key={automation.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${automation.status === "active" ? "bg-emerald-50" : "bg-amber-50"}`}>
                    <Icon className={`h-4 w-4 ${automation.status === "active" ? "text-emerald-600" : "text-amber-600"}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{automation.name}</p>
                    <p className="text-xs text-muted-foreground">Last run {automation.lastRun}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {automation.status === "active" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-full bg-blue-100">
              <Zap className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">Automation tip</p>
              <p className="text-xs text-blue-700 mt-0.5">
                Enable Inventory Alerts to get notified when stock runs low automatically.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Home</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 days
          </Button>
          <Button size="sm">
            <Zap className="h-4 w-4 mr-2" />
            Run Automation
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sales Chart - Takes 2 columns */}
        <SalesChart />
        
        {/* Right Column */}
        <div className="space-y-6">
          <AutomationStatus />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentOrdersTable />
        
        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/dashboard/new-task">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                  <Zap className="h-5 w-5" />
                  <span className="text-sm">New Task</span>
                </Button>
              </Link>
              <Link href="/dashboard/orders">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  <span className="text-sm">View Orders</span>
                </Button>
              </Link>
              <Link href="/dashboard/automations">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                  <Package className="h-5 w-5" />
                  <span className="text-sm">Automations</span>
                </Button>
              </Link>
              <Link href="/dashboard/reports">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-sm">Reports</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
