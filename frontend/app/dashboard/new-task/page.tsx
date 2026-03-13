"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AgentPipeline } from "@/components/agent/agent-pipeline";
import { ActivityFeed } from "@/components/agent/activity-feed";
import {
  ArrowRight,
  Upload,
  Sparkles,
  Brain,
  Search,
  BarChart3,
  PenTool,
  Shield,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  Send,
  Paperclip,
  Bot,
  User,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

// Message types for chat interface
type MessageType = "user" | "agent" | "system" | "report";

interface Message {
  id: string;
  type: MessageType;
  content: string;
  agent?: string;
  timestamp: Date;
  metadata?: {
    confidence?: number;
    sources?: number;
    insights?: number;
    notionUrl?: string;
  };
}

// Agent visualization component
function AgentStep({
  icon: Icon,
  name,
  role,
  status,
  confidence,
  message,
}: {
  icon: React.ElementType;
  name: string;
  role: string;
  status: "waiting" | "active" | "complete" | "retrying";
  confidence?: number;
  message?: string;
}) {
  const statusConfig = {
    waiting: { color: "text-muted-foreground", bg: "bg-muted", icon: Clock },
    active: { color: "text-blue-500", bg: "bg-blue-500/10", icon: Sparkles },
    complete: { color: "text-green-500", bg: "bg-green-500/10", icon: CheckCircle2 },
    retrying: { color: "text-amber-500", bg: "bg-amber-500/10", icon: AlertCircle },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className={`flex gap-3 p-3 rounded-lg border transition-all duration-300 ${status === "active" ? "border-blue-500/30 bg-blue-500/5" : "border-foreground/10"}`}>
      <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${config.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm">{name}</h4>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            <StatusIcon className="w-3 h-3 mr-1" />
            {status}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{role}</p>
        {message && <p className="text-xs mt-1.5 text-muted-foreground">{message}</p>}
        {confidence && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-[10px] mb-0.5">
              <span className="text-muted-foreground">Confidence</span>
              <span className="font-medium">{confidence}/10</span>
            </div>
            <Progress value={confidence * 10} className="h-1" />
          </div>
        )}
      </div>
    </div>
  );
}

// Chat message component
function ChatMessage({ message }: { message: Message }) {
  if (message.type === "user") {
    return (
      <div className="flex gap-3 justify-end">
        <div className="bg-foreground text-background rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
          <p className="text-sm">{message.content}</p>
          <span className="text-[10px] opacity-60 mt-1 block">
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shrink-0">
          <User className="w-4 h-4 text-white" />
        </div>
      </div>
    );
  }

  if (message.type === "report") {
    return (
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 max-w-[80%]">
          <Card className="bg-green-500/10 border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">Report Generated</h4>
                  <p className="text-xs text-muted-foreground mt-1">{message.content}</p>
                  {message.metadata && (
                    <div className="flex items-center gap-4 mt-3 text-xs">
                      <span className="text-muted-foreground">
                        Confidence: <span className="text-green-500 font-medium">{message.metadata.confidence}/10</span>
                      </span>
                      <span className="text-muted-foreground">
                        Sources: <span className="font-medium">{message.metadata.sources}</span>
                      </span>
                    </div>
                  )}
                </div>
                <Button size="sm" variant="outline" className="rounded-full text-xs h-8">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
          <span className="text-[10px] text-muted-foreground mt-1 block">
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>
    );
  }

  if (message.type === "agent") {
    const agentColors: Record<string, string> = {
      Planner: "from-violet-500 to-purple-500",
      Researcher: "from-blue-500 to-cyan-500",
      Analyst: "from-amber-500 to-orange-500",
      Writer: "from-emerald-500 to-teal-500",
      Critic: "from-rose-500 to-pink-500",
    };

    return (
      <div className="flex gap-3">
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${agentColors[message.agent || "Planner"]} flex items-center justify-center shrink-0`}>
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 max-w-[80%]">
          <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium">{message.agent}</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                Agent
              </Badge>
            </div>
            <p className="text-sm">{message.content}</p>
          </div>
          <span className="text-[10px] text-muted-foreground mt-1 block">
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
        {message.content}
      </span>
    </div>
  );
}

export default function NewTaskPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "system",
      content: "Welcome! Describe your goal and I'll orchestrate the agents to help you.",
      timestamp: new Date(),
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [showSidebar, setShowSidebar] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);
    setShowSidebar(true);

    // Simulate agent pipeline with chat messages
    const agentSteps = [
      { agent: "Planner", message: "Breaking down your goal into actionable subtasks...", delay: 1000 },
      { agent: "Planner", message: "Created 4 subtasks: Market Analysis, Competitor Research, Risk Assessment, and Recommendation Generation.", delay: 2000 },
      { agent: "Researcher", message: "Searching for relevant information and sources...", delay: 1500 },
      { agent: "Researcher", message: "Found 12 credible sources including market reports, competitor data, and industry analysis.", delay: 2500 },
      { agent: "Analyst", message: "Processing research data and extracting insights...", delay: 1500 },
      { agent: "Analyst", message: "Identified 8 key insights including market opportunities, competitive advantages, and potential risks.", delay: 2500 },
      { agent: "Writer", message: "Generating comprehensive report based on analysis...", delay: 1500 },
      { agent: "Writer", message: "Report draft completed with executive summary, findings, and recommendations.", delay: 2500 },
      { agent: "Critic", message: "Evaluating report quality and accuracy...", delay: 1500 },
      { agent: "Critic", message: "Report approved with confidence score 9.2/10. Quality meets all criteria.", delay: 2000 },
    ];

    for (let i = 0; i < agentSteps.length; i++) {
      setCurrentStep(i);
      await new Promise((resolve) => setTimeout(resolve, agentSteps[i].delay));
      
      const agentMessage: Message = {
        id: `agent-${Date.now()}-${i}`,
        type: "agent",
        agent: agentSteps[i].agent,
        content: agentSteps[i].message,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, agentMessage]);
    }

    // Final report message
    const reportMessage: Message = {
      id: `report-${Date.now()}`,
      type: "report",
      content: "Your comprehensive analysis report is ready with executive summary, market findings, competitive analysis, risk assessment, and strategic recommendations.",
      timestamp: new Date(),
      metadata: {
        confidence: 9.2,
        sources: 12,
        insights: 8,
        notionUrl: "https://notion.so/...",
      },
    };

    setMessages((prev) => [...prev, reportMessage]);
    setIsProcessing(false);
    setCurrentStep(-1);
  };

  const getAgentStatus = (step: number, current: number): "waiting" | "active" | "complete" | "retrying" => {
    if (current > step) return "complete";
    if (current === step) return "active";
    return "waiting";
  };

  const agents = [
    { icon: Brain, name: "Planner", role: "Goal Decomposer", status: getAgentStatus(0, Math.floor(currentStep / 2)) },
    { icon: Search, name: "Researcher", role: "Information Gatherer", status: getAgentStatus(1, Math.floor(currentStep / 2)) },
    { icon: BarChart3, name: "Analyst", role: "Data Processor", status: getAgentStatus(2, Math.floor(currentStep / 2)) },
    { icon: PenTool, name: "Writer", role: "Report Generator", status: getAgentStatus(3, Math.floor(currentStep / 2)) },
    { icon: Shield, name: "Critic", role: "Quality Controller", status: getAgentStatus(4, Math.floor(currentStep / 2)) },
  ];

  return (
    <div className="h-[calc(100vh-4rem)] -mx-6 -mt-6 flex">
      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col ${showSidebar ? "border-r" : ""}`}>
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h1 className="text-xl font-display tracking-tight">New Task</h1>
            <p className="text-xs text-muted-foreground">Chat with your AI agents</p>
          </div>
          {showSidebar && (
            <Button variant="ghost" size="sm" onClick={() => setShowSidebar(!showSidebar)}>
              {showSidebar ? "Hide Pipeline" : "Show Pipeline"}
            </Button>
          )}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-6" ref={scrollRef}>
          <div className="py-6 space-y-6 max-w-3xl mx-auto">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isProcessing && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shrink-0 animate-pulse">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="px-6 py-4 border-t">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="relative">
              <Textarea
                placeholder="Describe your goal... (e.g., Should I launch a fintech startup in India in 2026?)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[80px] pr-24 resize-none rounded-xl"
                disabled={isProcessing}
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  disabled={isProcessing}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!input.trim() || isProcessing}
                  className="h-8 rounded-lg bg-foreground hover:bg-foreground/90 text-background"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 text-center">
              Press Enter to send • Attach files for additional context
            </p>
          </form>
        </div>
      </div>

      {/* Sidebar - Agent Pipeline */}
      {showSidebar && (
        <div className="w-80 flex flex-col border-l bg-muted/30">
          <div className="px-4 py-4 border-b">
            <h2 className="font-medium text-sm">Agent Pipeline</h2>
            <p className="text-xs text-muted-foreground">
              {isProcessing ? "Processing your request..." : "Ready to start"}
            </p>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {agents.map((agent) => (
                <AgentStep key={agent.name} {...agent} />
              ))}
            </div>
          </ScrollArea>

          {/* Quick Stats */}
          <div className="p-4 border-t space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={isProcessing ? "default" : "secondary"} className="text-[10px]">
                {isProcessing ? "Running" : "Idle"}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Est. Time</span>
              <span className="font-medium">~60 seconds</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Confidence</span>
              <span className="font-medium text-green-500">9.2/10</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
