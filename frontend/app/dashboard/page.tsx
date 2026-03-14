"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowRight,
  Sparkles,
  BarChart3,
  Users,
  FileText,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle2,
  RefreshCw,
  Eye,
  ChevronRight,
  Play,
  Pause,
  Activity,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const salesData = [
  { date: "Mon", value: 4200 },
  { date: "Tue", value: 3800 },
  { date: "Wed", value: 5100 },
  { date: "Thu", value: 4600 },
  { date: "Fri", value: 6200 },
  { date: "Sat", value: 7100 },
  { date: "Sun", value: 5800 },
];

const quickPrompts = [
  { text: "Analyze sales trends", icon: BarChart3 },
  { text: "Create Instagram posts", icon: Sparkles },
  { text: "Find inactive customers", icon: Users },
  { text: "Generate weekly report", icon: FileText },
];

const agents = [
  { letter: "P", name: "Planner", color: "#3b82f6" },
  { letter: "R", name: "Researcher", color: "#8b5cf6" },
  { letter: "A", name: "Analyst", color: "#10b981" },
  { letter: "M", name: "Marketing", color: "#f59e0b" },
  { letter: "W", name: "Writer", color: "#ec4899" },
  { letter: "C", name: "Critic", color: "#f97316" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export default function DashboardPage() {
  const [goalInput, setGoalInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hoveredAgent, setHoveredAgent] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRunAgents = () => {
    if (!goalInput.trim()) return;
    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 3000);
  };

  return (
    <div className="min-h-full bg-[#fafafa]">
      {/* Hero Section */}
      <div className="relative px-6 lg:px-8 pt-12 pb-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Status Badge */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-zinc-200 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-sm text-zinc-600">6 agents ready</span>
              </div>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl lg:text-5xl font-semibold text-zinc-900 text-center tracking-tight mb-4">
              What would you like to
              <br />
              <span className="text-zinc-400">accomplish today?</span>
            </h1>
            <p className="text-zinc-500 text-center text-lg mb-12 max-w-xl mx-auto">
              Describe your goal in plain English. Our AI agents will collaborate to deliver results.
            </p>

            {/* Input Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
                <Textarea
                  placeholder="e.g., Analyze my top 10 customers and suggest personalized offers..."
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  className="min-h-[120px] text-lg bg-transparent border-0 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-0 resize-none p-0"
                />

                {/* Quick Prompts */}
                <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-zinc-100">
                  {quickPrompts.map((prompt, i) => {
                    const Icon = prompt.icon;
                    return (
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setGoalInput(prompt.text)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm text-zinc-600 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 transition-colors"
                      >
                        <Icon className="w-4 h-4 text-zinc-400" />
                        {prompt.text}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Floating Action Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="flex justify-center mt-6"
              >
                <Button
                  onClick={handleRunAgents}
                  disabled={!goalInput.trim() || isProcessing}
                  className="h-12 px-8 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg shadow-zinc-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
              </motion.div>
            </motion.div>

            {/* Agent Avatars */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex items-center justify-center gap-3 mt-10"
            >
              {agents.map((agent, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.6 + i * 0.05 }}
                  whileHover={{ scale: 1.15, y: -4 }}
                  onHoverStart={() => setHoveredAgent(i)}
                  onHoverEnd={() => setHoveredAgent(null)}
                  className="relative cursor-pointer"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white shadow-sm transition-shadow"
                    style={{ backgroundColor: agent.color }}
                  >
                    {agent.letter}
                  </div>
                  <AnimatePresence>
                    {hoveredAgent === i && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-zinc-900 text-white text-xs rounded-lg whitespace-nowrap"
                      >
                        {agent.name}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {[
              { title: "Total Revenue", value: "₹36,800", change: "+12.5%", icon: TrendingUp, color: "emerald" },
              { title: "Tasks Completed", value: "147", change: "+23", icon: CheckCircle2, color: "violet" },
              { title: "Active Automations", value: "8", change: "Running", icon: Zap, color: "blue" },
              { title: "Time Saved", value: "48h", change: "This month", icon: Clock, color: "amber" },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div key={i} variants={itemVariants}>
                  <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow duration-300">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-zinc-500 mb-1">{stat.title}</p>
                          <p className="text-2xl font-semibold text-zinc-900">{stat.value}</p>
                          <p className={`text-xs mt-1 ${
                            stat.color === "emerald" ? "text-emerald-600" :
                            stat.color === "violet" ? "text-violet-600" :
                            stat.color === "blue" ? "text-blue-600" :
                            "text-amber-600"
                          }`}>
                            {stat.change}
                          </p>
                        </div>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          stat.color === "emerald" ? "bg-emerald-50" :
                          stat.color === "violet" ? "bg-violet-50" :
                          stat.color === "blue" ? "bg-blue-50" :
                          "bg-amber-50"
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            stat.color === "emerald" ? "text-emerald-500" :
                            stat.color === "violet" ? "text-violet-500" :
                            stat.color === "blue" ? "text-blue-500" :
                            "text-amber-500"
                          }`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Chart & Activity */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid lg:grid-cols-3 gap-6"
          >
            {/* Chart */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-900">Activity</h3>
                      <p className="text-sm text-zinc-500">Tasks completed over time</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                      <Activity className="w-4 h-4" />
                      <span>Live</span>
                    </div>
                  </div>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesData}>
                        <defs>
                          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#18181b" stopOpacity={0.1}/>
                            <stop offset="100%" stopColor="#18181b" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 12, fill: '#a1a1aa' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#18181b',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '12px',
                            color: '#fff'
                          }}
                          formatter={(value: any) => [`${value} tasks`, 'Completed']}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#18181b" 
                          strokeWidth={2}
                          fill="url(#gradient)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-sm bg-white h-full">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-zinc-900">Recent</h3>
                    <Link href="/dashboard/jobs">
                      <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-900">
                        View all
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {[
                      { name: "Customer Re-engagement", time: "2m ago", status: "completed" },
                      { name: "Weekly Instagram Content", time: "5m ago", status: "running" },
                      { name: "Inventory Analysis", time: "1h ago", status: "completed" },
                      { name: "Competitor Monitoring", time: "Pending", status: "queued" },
                    ].map((job, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.8 + i * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer group"
                      >
                        <div className={`w-2 h-2 rounded-full ${
                          job.status === "completed" ? "bg-emerald-400" :
                          job.status === "running" ? "bg-blue-400 animate-pulse" :
                          "bg-zinc-300"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-900 truncate group-hover:text-zinc-700 transition-colors">
                            {job.name}
                          </p>
                          <p className="text-xs text-zinc-500">{job.time}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500 group-hover:translate-x-1 transition-all" />
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Automations Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-zinc-900">Active Automations</h3>
              <Link href="/dashboard/automations">
                <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-900">
                  Manage
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: "Order Management", runs: 156, icon: "📦" },
                { name: "Customer Re-engagement", runs: 47, icon: "👥" },
                { name: "Social Media Content", runs: 28, icon: "📱" },
                { name: "Inventory Alerts", runs: 12, icon: "📊" },
              ].map((automation, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.7 + i * 0.05 }}
                  whileHover={{ y: -2 }}
                >
                  <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-all cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-2xl">{automation.icon}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                          <span className="text-xs text-emerald-600">Active</span>
                        </div>
                      </div>
                      <h4 className="font-medium text-zinc-900 text-sm">{automation.name}</h4>
                      <p className="text-xs text-zinc-500 mt-1">{automation.runs} runs</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
