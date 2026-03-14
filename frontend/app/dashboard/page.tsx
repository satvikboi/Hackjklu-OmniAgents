"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowRight,
  Sparkles,
  Bot,
  Search,
  BarChart3,
  FileText,
  Zap,
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  RefreshCw,
  ExternalLink,
  Eye,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Sample data
const salesData = [
  { date: "Mon", sales: 4200 },
  { date: "Tue", sales: 3800 },
  { date: "Wed", sales: 5100 },
  { date: "Thu", sales: 4600 },
  { date: "Fri", sales: 6200 },
  { date: "Sat", sales: 7100 },
  { date: "Sun", sales: 5800 },
];

const recentJobs = [
  { id: 1, name: "Customer Re-engagement Campaign", status: "completed", time: "2 min ago", agents: 6 },
  { id: 2, name: "Weekly Instagram Content", status: "running", time: "5 min ago", agents: 4 },
  { id: 3, name: "Inventory Analysis Report", status: "completed", time: "1 hour ago", agents: 3 },
  { id: 4, name: "Competitor Price Monitoring", status: "queued", time: "Pending", agents: 2 },
];

const quickPrompts = [
  { text: "Analyze my sales trends this month", icon: BarChart3 },
  { text: "Create Instagram posts for new arrivals", icon: Sparkles },
  { text: "Find customers who haven't ordered in 30 days", icon: Users },
  { text: "Generate weekly business report", icon: FileText },
];

export default function DashboardPage() {
  const [goalInput, setGoalInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRunAgents = () => {
    if (!goalInput.trim()) return;
    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 3000);
  };

  return (
    <div className="min-h-full">
      {/* Hero Section - Goal Input */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 px-6 lg:px-8 py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-400" />
            </div>
            <span className="text-sm font-medium text-zinc-400">AI-Powered Automation</span>
          </div>
          
          <h1 className="text-2xl lg:text-3xl font-semibold text-white mb-2">
            What would you like to accomplish?
          </h1>
          <p className="text-zinc-400 mb-6">
            Describe your goal in plain English. Our 6 AI agents will collaborate to deliver results.
          </p>

          {/* Input Area */}
          <div className="bg-zinc-800/50 rounded-xl border border-zinc-700/50 p-4">
            <Textarea
              placeholder="e.g., Analyze my top 10 customers and suggest personalized offers for each..."
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              className="min-h-[100px] text-base bg-transparent border-0 text-white placeholder:text-zinc-500 focus-visible:ring-0 resize-none p-0"
            />
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-700/50">
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt, i) => {
                  const Icon = prompt.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => setGoalInput(prompt.text)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-700/50 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {prompt.text}
                    </button>
                  );
                })}
              </div>
              
              <Button
                onClick={handleRunAgents}
                disabled={!goalInput.trim() || isProcessing}
                className="bg-violet-600 hover:bg-violet-700 text-white px-6 h-10"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Run Agents
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Agent Status */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm text-zinc-400">6 Agents Ready</span>
              </div>
              <div className="flex -space-x-2">
                {["P", "R", "A", "M", "W", "C"].map((letter, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full bg-zinc-700 border-2 border-zinc-900 flex items-center justify-center text-xs font-medium text-zinc-300"
                  >
                    {letter}
                  </div>
                ))}
              </div>
            </div>
            <Link href="/dashboard/agents">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Eye className="w-4 h-4 mr-2" />
                View Agents
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 lg:px-8 py-6 lg:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-zinc-500">Total Revenue</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
                <div className="text-2xl font-semibold text-zinc-900">₹36,800</div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs font-medium text-emerald-600">+12.5%</span>
                  <span className="text-xs text-zinc-400">from last week</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-zinc-500">Tasks Completed</span>
                  <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-violet-600" />
                  </div>
                </div>
                <div className="text-2xl font-semibold text-zinc-900">147</div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs font-medium text-violet-600">+23</span>
                  <span className="text-xs text-zinc-400">this week</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-zinc-500">Active Automations</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <div className="text-2xl font-semibold text-zinc-900">8</div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-zinc-400">All running smoothly</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-zinc-500">Time Saved</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                </div>
                <div className="text-2xl font-semibold text-zinc-900">48h</div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-zinc-400">this month</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Chart Section */}
            <Card className="lg:col-span-2 border-0 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">Agent Activity</CardTitle>
                  <Button variant="ghost" size="sm" className="text-xs text-zinc-500">
                    View Details
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesData}>
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: '#a1a1aa' }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: '#a1a1aa' }}
                        tickFormatter={(value) => `₹${value/1000}k`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#18181b',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}
                        labelStyle={{ color: '#a1a1aa' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Revenue']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#8b5cf6" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorGradient)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Recent Jobs */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">Recent Jobs</CardTitle>
                  <Link href="/dashboard/jobs">
                    <Button variant="ghost" size="sm" className="text-xs text-zinc-500">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentJobs.map((job) => (
                    <div key={job.id} className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        job.status === "completed" 
                          ? "bg-emerald-100" 
                          : job.status === "running" 
                            ? "bg-blue-100" 
                            : "bg-zinc-200"
                      }`}>
                        {job.status === "completed" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : job.status === "running" ? (
                          <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                        ) : (
                          <Clock className="w-4 h-4 text-zinc-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 truncate">{job.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-zinc-500">{job.time}</span>
                          <span className="text-xs text-zinc-400">•</span>
                          <span className="text-xs text-zinc-500">{job.agents} agents</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Automations Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-900">Active Automations</h2>
              <Link href="/dashboard/automations">
                <Button variant="outline" size="sm">
                  Manage All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: "Order Management", status: "active", runs: 156, icon: "📦" },
                { name: "Customer Re-engagement", status: "active", runs: 47, icon: "👥" },
                { name: "Social Media Content", status: "active", runs: 28, icon: "📱" },
                { name: "Inventory Alerts", status: "paused", runs: 12, icon: "📊" },
              ].map((automation, i) => (
                <Card key={i} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-2xl">{automation.icon}</div>
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        automation.status === "active" 
                          ? "bg-emerald-50 text-emerald-700" 
                          : "bg-zinc-100 text-zinc-600"
                      }`}>
                        {automation.status === "active" ? (
                          <Play className="w-3 h-3" />
                        ) : (
                          <Pause className="w-3 h-3" />
                        )}
                        {automation.status}
                      </div>
                    </div>
                    <h3 className="font-medium text-zinc-900 text-sm">{automation.name}</h3>
                    <p className="text-xs text-zinc-500 mt-1">{automation.runs} runs this month</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
