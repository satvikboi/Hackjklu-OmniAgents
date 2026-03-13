"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AgentPipelineCompact } from "@/components/agent/agent-pipeline";
import { ActivityFeedMini } from "@/components/agent/activity-feed";
import { AgentNetworkMini } from "@/components/agent/agent-network";
import {
  PlusCircle,
  Activity,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Brain,
  Search,
  BarChart3,
  PenTool,
  Shield,
  ArrowRight,
  Sparkles,
} from "lucide-react";

// Agent status types
type AgentStatus = "idle" | "active" | "complete" | "retrying" | "error";

interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  confidence?: number;
  message?: string;
  icon: React.ElementType;
}

const agents: Agent[] = [
  {
    id: "planner",
    name: "Planner",
    role: "Goal Decomposer",
    status: "complete",
    confidence: 9.2,
    message: "Broke goal into 4 subtasks",
    icon: Brain,
  },
  {
    id: "researcher",
    name: "Researcher",
    role: "Information Gatherer",
    status: "active",
    message: "Searching web for market data...",
    icon: Search,
  },
  {
    id: "analyst",
    name: "Analyst",
    role: "Data Processor",
    status: "idle",
    icon: BarChart3,
  },
  {
    id: "writer",
    name: "Writer",
    role: "Report Generator",
    status: "idle",
    icon: PenTool,
  },
  {
    id: "critic",
    name: "Critic",
    role: "Quality Controller",
    status: "idle",
    icon: Shield,
  },
];

function AgentCard({ agent }: { agent: Agent }) {
  const Icon = agent.icon;
  const statusColors = {
    idle: "bg-muted text-muted-foreground",
    active: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    complete: "bg-green-500/10 text-green-500 border-green-500/20",
    retrying: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    error: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  const statusIcons = {
    idle: Clock,
    active: Activity,
    complete: CheckCircle2,
    retrying: AlertCircle,
    error: AlertCircle,
  };

  const StatusIcon = statusIcons[agent.status];

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 ${agent.status === "active" ? "ring-2 ring-blue-500/20" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusColors[agent.status]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium truncate">{agent.name}</h3>
              <Badge variant="secondary" className="text-xs">
                <StatusIcon className="w-3 h-3 mr-1" />
                {agent.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{agent.role}</p>
            {agent.message && (
              <p className="text-sm mt-2 truncate">{agent.message}</p>
            )}
            {agent.confidence && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Confidence</span>
                  <span className="font-medium">{agent.confidence}/10</span>
                </div>
                <Progress value={agent.confidence * 10} className="h-1.5" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
      {agent.status === "active" && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500">
          <div className="h-full w-1/3 bg-blue-300 animate-pulse" />
        </div>
      )}
    </Card>
  );
}

function StatCard({ title, value, description, icon: Icon, trend }: {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  trend?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-display mt-1">{value}</h3>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center text-xs text-green-500">
            <Sparkles className="w-3 h-3 mr-1" />
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor your AI agents and manage tasks
          </p>
        </div>
        <Link href="/dashboard/new-task">
          <Button className="bg-foreground hover:bg-foreground/90 text-background rounded-full">
            <PlusCircle className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tasks"
          value="24"
          description="All time tasks"
          icon={FileText}
          trend="+3 this week"
        />
        <StatCard
          title="Active Jobs"
          value="2"
          description="Currently running"
          icon={Activity}
        />
        <StatCard
          title="Avg. Confidence"
          value="8.7"
          description="Out of 10"
          icon={CheckCircle2}
          trend="Above threshold"
        />
        <StatCard
          title="Avg. Time"
          value="47s"
          description="Per completion"
          icon={Clock}
        />
      </div>

      {/* Agents Status */}
      <div>
        <h2 className="text-lg font-medium mb-4">Agent Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { goal: "Should I launch a fintech startup in India?", status: "completed", time: "2 min ago", confidence: 9.2 },
              { goal: "Analyze EV market trends for 2026", status: "running", time: "5 min ago", confidence: null },
              { goal: "Research competitor pricing strategies", status: "completed", time: "1 hour ago", confidence: 8.5 },
            ].map((task, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-foreground/5">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-sm font-medium truncate">{task.goal}</p>
                  <p className="text-xs text-muted-foreground">{task.time}</p>
                </div>
                <div className="flex items-center gap-2">
                  {task.confidence && (
                    <Badge variant="secondary" className="text-xs">
                      {task.confidence}/10
                    </Badge>
                  )}
                  <Badge className={task.status === "completed" ? "bg-green-500" : "bg-blue-500"}>
                    {task.status}
                  </Badge>
                </div>
              </div>
            ))}
            <Link href="/dashboard/reports">
              <Button variant="ghost" className="w-full gap-2">
                View all reports
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { name: "Groq API", status: "Operational", latency: "120ms" },
                { name: "Web Search (Serper)", status: "Operational", latency: "245ms" },
                { name: "Notion Integration", status: "Operational", latency: "180ms" },
                { name: "ChromaDB", status: "Operational", latency: "15ms" },
              ].map((service) => (
                <div key={service.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm">{service.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{service.latency}</span>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-foreground/10">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">System Version</span>
                <span>v1.0.0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
