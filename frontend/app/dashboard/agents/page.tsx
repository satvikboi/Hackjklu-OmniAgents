"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bot,
  Brain,
  Search,
  BarChart3,
  PenTool,
  Shield,
  Play,
  Pause,
  RefreshCw,
  CheckCircle2,
  Clock,
  Zap,
  ArrowRight,
  MessageSquare,
  Sparkles,
  Eye,
} from "lucide-react";

// Agent definitions
const agents = [
  {
    id: "planner",
    name: "Planner",
    role: "Task Decomposition",
    description: "Breaks down complex goals into actionable tasks and assigns them to specialized agents.",
    icon: Bot,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
  },
  {
    id: "researcher",
    name: "Researcher",
    role: "Information Gathering",
    description: "Searches the web, gathers data, and finds relevant information to support decisions.",
    icon: Search,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50",
    textColor: "text-purple-600",
  },
  {
    id: "analyst",
    name: "Analyst",
    role: "Data Analysis",
    description: "Analyzes data patterns, identifies trends, and extracts actionable insights.",
    icon: BarChart3,
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-600",
  },
  {
    id: "marketing",
    name: "Marketing",
    role: "Strategy & Content",
    description: "Develops marketing strategies, creates content, and identifies growth opportunities.",
    icon: Sparkles,
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50",
    textColor: "text-orange-600",
  },
  {
    id: "writer",
    name: "Writer",
    role: "Content Generation",
    description: "Creates reports, summaries, and all written outputs with clarity and precision.",
    icon: PenTool,
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-50",
    textColor: "text-pink-600",
  },
  {
    id: "critic",
    name: "Critic",
    role: "Quality Assurance",
    description: "Reviews all outputs, assigns confidence scores, and ensures quality standards.",
    icon: Shield,
    color: "from-amber-500 to-yellow-500",
    bgColor: "bg-amber-50",
    textColor: "text-amber-600",
  },
];

// Simulated agent activities
const activityTypes = [
  { type: "thinking", label: "Thinking..." },
  { type: "searching", label: "Searching..." },
  { type: "analyzing", label: "Analyzing..." },
  { type: "writing", label: "Writing..." },
  { type: "reviewing", label: "Reviewing..." },
  { type: "completed", label: "Completed" },
];

// Simulated thoughts for each agent
const agentThoughts: Record<string, string[]> = {
  planner: [
    "Analyzing the user's goal...",
    "Breaking down into subtasks...",
    "Identifying required agents...",
    "Creating execution plan...",
    "Assigning tasks to specialized agents...",
  ],
  researcher: [
    "Searching for relevant data...",
    "Found 15 relevant sources...",
    "Extracting key information...",
    "Verifying source credibility...",
    "Compiling research findings...",
  ],
  analyst: [
    "Processing data patterns...",
    "Identifying trend anomalies...",
    "Calculating key metrics...",
    "Cross-referencing historical data...",
    "Generating insights report...",
  ],
  marketing: [
    "Analyzing competitor strategies...",
    "Identifying market opportunities...",
    "Creating content calendar...",
    "Optimizing for engagement...",
    "Finalizing campaign strategy...",
  ],
  writer: [
    "Structuring report outline...",
    "Drafting executive summary...",
    "Writing detailed sections...",
    "Adding visual descriptions...",
    "Polishing final output...",
  ],
  critic: [
    "Reviewing output quality...",
    "Checking factual accuracy...",
    "Evaluating relevance...",
    "Assigning confidence score...",
    "Approving final deliverable...",
  ],
};

interface AgentState {
  status: "idle" | "thinking" | "working" | "completed";
  progress: number;
  currentThought: string;
  tasksCompleted: number;
  confidence?: number;
}

export default function AgentsPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [agentStates, setAgentStates] = useState<Record<string, AgentState>>(() => {
    const states: Record<string, AgentState> = {};
    agents.forEach(agent => {
      states[agent.id] = {
        status: "idle",
        progress: 0,
        currentThought: "Ready to work",
        tasksCompleted: 0,
      };
    });
    return states;
  });

  const [activityLog, setActivityLog] = useState<{ time: string; agent: string; message: string; type: string }[]>([]);
  const [currentGoal, setCurrentGoal] = useState("");

  const startSimulation = () => {
    setIsRunning(true);
    
    // Reset all agents
    const newStates: Record<string, AgentState> = {};
    agents.forEach(agent => {
      newStates[agent.id] = {
        status: "idle",
        progress: 0,
        currentThought: "Waiting for task...",
        tasksCompleted: 0,
      };
    });
    setAgentStates(newStates);
    setActivityLog([]);

    // Simulate agent workflow
    const workflow = [
      { agentId: "planner", delay: 0, duration: 3000 },
      { agentId: "researcher", delay: 1000, duration: 4000 },
      { agentId: "analyst", delay: 2000, duration: 3500 },
      { agentId: "marketing", delay: 3000, duration: 3000 },
      { agentId: "writer", delay: 4000, duration: 4000 },
      { agentId: "critic", delay: 5500, duration: 2500 },
    ];

    workflow.forEach(({ agentId, delay, duration }) => {
      // Start working
      setTimeout(() => {
        setAgentStates(prev => ({
          ...prev,
          [agentId]: {
            ...prev[agentId],
            status: "working",
            currentThought: agentThoughts[agentId][0],
          }
        }));

        // Add to activity log
        const now = new Date();
        setActivityLog(prev => [{
          time: now.toLocaleTimeString(),
          agent: agents.find(a => a.id === agentId)?.name || "",
          message: `Started ${agentThoughts[agentId][0].toLowerCase()}`,
          type: "start"
        }, ...prev]);

        // Progress simulation
        const thoughts = agentThoughts[agentId];
        const thoughtInterval = duration / thoughts.length;
        
        thoughts.forEach((thought, i) => {
          setTimeout(() => {
            setAgentStates(prev => ({
              ...prev,
              [agentId]: {
                ...prev[agentId],
                progress: ((i + 1) / thoughts.length) * 100,
                currentThought: thought,
              }
            }));

            setActivityLog(prev => [{
              time: new Date().toLocaleTimeString(),
              agent: agents.find(a => a.id === agentId)?.name || "",
              message: thought,
              type: "progress"
            }, ...prev]);
          }, thoughtInterval * (i + 1));
        });

        // Complete
        setTimeout(() => {
          setAgentStates(prev => ({
            ...prev,
            [agentId]: {
              ...prev[agentId],
              status: "completed",
              progress: 100,
              currentThought: "Task completed successfully",
              tasksCompleted: prev[agentId].tasksCompleted + 1,
              confidence: agentId === "critic" ? 9.2 : undefined,
            }
          }));

          setActivityLog(prev => [{
            time: new Date().toLocaleTimeString(),
            agent: agents.find(a => a.id === agentId)?.name || "",
            message: agentId === "critic" ? "Quality verified ✓ Score: 9.2/10" : "Completed task",
            type: "complete"
          }, ...prev]);
        }, duration);
      }, delay);
    });

    // End simulation
    setTimeout(() => {
      setIsRunning(false);
    }, 8000);
  };

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-zinc-900">Agent Monitor</h1>
              <p className="text-zinc-500 mt-1">
                Watch your AI team collaborate in real-time
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="px-3 py-1.5">
                <span className={`w-2 h-2 rounded-full mr-2 ${isRunning ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"}`} />
                {isRunning ? "Running" : "Ready"}
              </Badge>
              <Button 
                onClick={startSimulation} 
                disabled={isRunning}
                className="bg-zinc-900 hover:bg-zinc-800"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run Demo
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Agents Grid */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-semibold text-zinc-900">Active Agents</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {agents.map((agent) => {
                  const Icon = agent.icon;
                  const state = agentStates[agent.id];
                  
                  return (
                    <Card 
                      key={agent.id}
                      className={`border-0 shadow-sm transition-all ${
                        state.status === "working" 
                          ? "ring-2 ring-violet-500/50 shadow-lg" 
                          : state.status === "completed"
                            ? "ring-2 ring-emerald-500/50"
                            : ""
                      }`}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center shadow-lg ${
                            state.status === "working" ? "animate-pulse" : ""
                          }`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-zinc-900">{agent.name}</h3>
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${
                                  state.status === "working" 
                                    ? "bg-violet-100 text-violet-700" 
                                    : state.status === "completed"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-zinc-100 text-zinc-600"
                                }`}
                              >
                                {state.status === "working" ? (
                                  <>
                                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                    Working
                                  </>
                                ) : state.status === "completed" ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Done
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3 mr-1" />
                                    Idle
                                  </>
                                )}
                              </Badge>
                            </div>
                            <p className="text-xs text-zinc-500 mt-0.5">{agent.role}</p>
                            
                            {/* Progress Bar */}
                            {state.status === "working" && (
                              <div className="mt-3">
                                <Progress value={state.progress} className="h-1.5" />
                              </div>
                            )}
                            
                            {/* Current Thought */}
                            <div className={`mt-3 p-2.5 rounded-lg ${
                              state.status === "working" 
                                ? "bg-violet-50 border border-violet-100" 
                                : state.status === "completed"
                                  ? "bg-emerald-50 border border-emerald-100"
                                  : "bg-zinc-50"
                            }`}>
                              <div className="flex items-start gap-2">
                                {state.status === "working" ? (
                                  <Brain className="w-4 h-4 text-violet-500 mt-0.5 animate-pulse" />
                                ) : state.status === "completed" ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                                ) : (
                                  <Clock className="w-4 h-4 text-zinc-400 mt-0.5" />
                                )}
                                <p className={`text-xs ${
                                  state.status === "working" 
                                    ? "text-violet-700" 
                                    : state.status === "completed"
                                      ? "text-emerald-700"
                                      : "text-zinc-500"
                                }`}>
                                  {state.currentThought}
                                </p>
                              </div>
                            </div>

                            {/* Confidence Score for Critic */}
                            {agent.id === "critic" && state.confidence && (
                              <div className="mt-3 flex items-center justify-between">
                                <span className="text-xs text-zinc-500">Confidence Score</span>
                                <span className="text-sm font-semibold text-emerald-600">{state.confidence}/10</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Activity Feed */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-sm h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Eye className="w-4 h-4 text-zinc-400" />
                    Activity Feed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px] pr-4">
                    {activityLog.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
                          <Zap className="w-6 h-6 text-zinc-400" />
                        </div>
                        <p className="text-sm text-zinc-500">No activity yet</p>
                        <p className="text-xs text-zinc-400 mt-1">Click "Run Demo" to see agents work</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {activityLog.map((log, i) => (
                          <div 
                            key={i} 
                            className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50"
                          >
                            <div className={`w-2 h-2 rounded-full mt-1.5 ${
                              log.type === "complete" 
                                ? "bg-emerald-500" 
                                : log.type === "start" 
                                  ? "bg-blue-500" 
                                  : "bg-zinc-400"
                            }`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-zinc-900">{log.agent}</span>
                                <span className="text-[10px] text-zinc-400">{log.time}</span>
                              </div>
                              <p className="text-xs text-zinc-600 mt-0.5">{log.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* How Agents Work Section */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">How Agents Collaborate</h2>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  {agents.map((agent, i) => {
                    const Icon = agent.icon;
                    return (
                      <div key={agent.id} className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${agent.color} flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-zinc-900">{agent.name}</p>
                          <p className="text-[10px] text-zinc-500">{agent.role}</p>
                        </div>
                        {i < agents.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-zinc-300 hidden md:block" />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 p-4 rounded-lg bg-zinc-50">
                  <p className="text-sm text-zinc-600 text-center">
                    Agents work in parallel when possible, then sequentially pass outputs to the next agent. 
                    The Critic reviews all outputs and ensures quality before delivery.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
