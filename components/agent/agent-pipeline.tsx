"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useWebSocket, WebSocketEvent } from "@/lib/websocket";
import {
  Brain,
  Search,
  BarChart3,
  PenTool,
  Shield,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Activity,
} from "lucide-react";

export type AgentStatus = "idle" | "waiting" | "active" | "complete" | "retrying" | "error";

export interface Agent {
  id: string;
  name: string;
  role: string;
  icon: React.ElementType;
  status: AgentStatus;
  confidence?: number;
  message?: string;
  startTime?: string;
  endTime?: string;
}

const defaultAgents: Agent[] = [
  {
    id: "planner",
    name: "Planner",
    role: "Goal Decomposer",
    icon: Brain,
    status: "idle",
  },
  {
    id: "researcher",
    name: "Researcher",
    role: "Information Gatherer",
    icon: Search,
    status: "idle",
  },
  {
    id: "analyst",
    name: "Analyst",
    role: "Data Processor",
    icon: BarChart3,
    status: "idle",
  },
  {
    id: "writer",
    name: "Writer",
    role: "Report Generator",
    icon: PenTool,
    status: "idle",
  },
  {
    id: "critic",
    name: "Critic",
    role: "Quality Controller",
    icon: Shield,
    status: "idle",
  },
];

interface AgentNodeProps {
  agent: Agent;
  isLast: boolean;
  index: number;
}

function AgentNode({ agent, isLast, index }: AgentNodeProps) {
  const Icon = agent.icon;
  
  const statusConfig = {
    idle: { color: "bg-muted", textColor: "text-muted-foreground", borderColor: "border-transparent", icon: Clock },
    waiting: { color: "bg-amber-500/10", textColor: "text-amber-500", borderColor: "border-amber-500/30", icon: Clock },
    active: { color: "bg-blue-500", textColor: "text-white", borderColor: "border-blue-500", icon: Activity },
    complete: { color: "bg-green-500", textColor: "text-white", borderColor: "border-green-500", icon: CheckCircle2 },
    retrying: { color: "bg-amber-500", textColor: "text-white", borderColor: "border-amber-500", icon: AlertCircle },
    error: { color: "bg-red-500", textColor: "text-white", borderColor: "border-red-500", icon: AlertCircle },
  };

  const config = statusConfig[agent.status];
  const StatusIcon = config.icon;

  return (
    <div className="relative flex items-center">
      {/* Connection line */}
      {!isLast && (
        <div className="absolute left-8 top-16 w-0.5 h-12 bg-foreground/10">
          {agent.status === "complete" && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "100%" }}
              className="w-full bg-green-500"
              transition={{ duration: 0.5, delay: index * 0.1 }}
            />
          )}
          {agent.status === "active" && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-full h-1/2 bg-blue-500"
            />
          )}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className="flex items-start gap-4 w-full"
      >
        {/* Agent Icon */}
        <div className="relative">
          <motion.div
            animate={agent.status === "active" ? {
              scale: [1, 1.1, 1],
              boxShadow: [
                "0 0 0 0 rgba(59, 130, 246, 0.4)",
                "0 0 0 10px rgba(59, 130, 246, 0)",
              ],
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 ${config.color} ${config.borderColor} ${agent.status === "active" ? "ring-4 ring-blue-500/20" : ""}`}
          >
            {agent.status === "active" ? (
              <StatusIcon className={`w-7 h-7 ${config.textColor} animate-pulse`} />
            ) : (
              <Icon className={`w-7 h-7 ${config.textColor}`} />
            )}
          </motion.div>
          
          {/* Status badge */}
          <div className="absolute -bottom-1 -right-1">
            <Badge 
              variant={agent.status === "complete" ? "default" : "secondary"}
              className={`text-[10px] px-1.5 py-0 ${
                agent.status === "complete" ? "bg-green-500" : 
                agent.status === "active" ? "bg-blue-500" : 
                agent.status === "retrying" ? "bg-amber-500" : ""
              }`}
            >
              {agent.status}
            </Badge>
          </div>
        </div>

        {/* Agent Info */}
        <div className="flex-1 pt-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{agent.name}</h3>
            {agent.confidence && (
              <Badge variant="outline" className="text-xs">
                {agent.confidence}/10
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{agent.role}</p>
          
          {agent.message && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm mt-2 text-foreground/80"
            >
              {agent.message}
            </motion.p>
          )}

          {agent.confidence && (
            <div className="mt-3">
              <Progress value={agent.confidence * 10} className="h-1.5" />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

interface AgentPipelineProps {
  jobId?: string;
  className?: string;
}

export function AgentPipeline({ jobId, className }: AgentPipelineProps) {
  const [agents, setAgents] = useState<Agent[]>(defaultAgents);
  const [pipelineStatus, setPipelineStatus] = useState<"idle" | "running" | "completed">("idle");

  const { isConnected, lastMessage } = useWebSocket({
    jobId,
    onMessage: (event: WebSocketEvent) => {
      setAgents((prev) => {
        const newAgents = [...prev];
        
        switch (event.type) {
          case "agent_start":
            const startAgent = newAgents.find((a) => a.id === event.agent);
            if (startAgent) {
              startAgent.status = "active";
              startAgent.message = event.message;
              startAgent.startTime = event.timestamp;
            }
            // Set previous agents to waiting
            const startIndex = newAgents.findIndex((a) => a.id === event.agent);
            for (let i = 0; i < startIndex; i++) {
              if (newAgents[i].status === "idle") {
                newAgents[i].status = "waiting";
              }
            }
            setPipelineStatus("running");
            break;

          case "agent_complete":
            const completeAgent = newAgents.find((a) => a.id === event.agent);
            if (completeAgent) {
              completeAgent.status = "complete";
              completeAgent.confidence = event.confidence;
              completeAgent.message = event.message;
              completeAgent.endTime = event.timestamp;
            }
            break;

          case "critic_reject":
            // Find the agent that needs to retry
            const retryAgent = newAgents.find((a) => a.status === "complete" && a.id !== "critic");
            if (retryAgent) {
              retryAgent.status = "retrying";
              retryAgent.message = `Retrying: ${event.reason}`;
            }
            break;

          case "critic_approve":
            const criticAgent = newAgents.find((a) => a.id === "critic");
            if (criticAgent) {
              criticAgent.status = "complete";
              criticAgent.confidence = event.final_confidence;
              criticAgent.message = event.message;
            }
            break;

          case "pipeline_complete":
            setPipelineStatus("completed");
            break;

          case "error":
            const errorAgent = newAgents.find((a) => a.id === event.agent);
            if (errorAgent) {
              errorAgent.status = "error";
              errorAgent.message = event.message;
            }
            break;
        }

        return newAgents;
      });
    },
  });

  const resetPipeline = () => {
    setAgents(defaultAgents.map(a => ({ ...a, status: "idle", confidence: undefined, message: undefined })));
    setPipelineStatus("idle");
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold">Agent Pipeline</h2>
            <p className="text-sm text-muted-foreground">
              {pipelineStatus === "idle" && "Ready to start"}
              {pipelineStatus === "running" && "Processing your request..."}
              {pipelineStatus === "completed" && "Pipeline completed!"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                Live
              </Badge>
            ) : (
              <Badge variant="secondary">Offline</Badge>
            )}
            {pipelineStatus === "completed" && (
              <button
                onClick={resetPipeline}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <AnimatePresence>
            {agents.map((agent, index) => (
              <AgentNode
                key={agent.id}
                agent={agent}
                index={index}
                isLast={index === agents.length - 1}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Critic Alert */}
        {agents.some((a) => a.status === "retrying") && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-500">Critic Agent: Quality Check Failed</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Score below threshold. Sending back for revision...
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

// Compact version for dashboard
export function AgentPipelineCompact({ jobId }: { jobId?: string }) {
  const [agents, setAgents] = useState<Agent[]>(defaultAgents);

  useWebSocket({
    jobId,
    onMessage: (event: WebSocketEvent) => {
      setAgents((prev) => {
        const newAgents = [...prev];
        if (event.type === "agent_start") {
          const agent = newAgents.find((a) => a.id === event.agent);
          if (agent) agent.status = "active";
        } else if (event.type === "agent_complete") {
          const agent = newAgents.find((a) => a.id === event.agent);
          if (agent) {
            agent.status = "complete";
            agent.confidence = event.confidence;
          }
        }
        return newAgents;
      });
    },
  });

  return (
    <div className="flex items-center gap-2">
      {agents.map((agent, index) => {
        const Icon = agent.icon;
        return (
          <div key={agent.id} className="flex items-center">
            <motion.div
              animate={agent.status === "active" ? {
                scale: [1, 1.2, 1],
              } : {}}
              transition={{ duration: 1, repeat: Infinity }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                agent.status === "complete" ? "bg-green-500 text-white" :
                agent.status === "active" ? "bg-blue-500 text-white" :
                "bg-muted text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
            </motion.div>
            {index < agents.length - 1 && (
              <div className={`w-4 h-0.5 ${
                agent.status === "complete" ? "bg-green-500" : "bg-foreground/10"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
