"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useWebSocket, WebSocketEvent } from "@/lib/websocket";
import {
  Brain,
  Search,
  BarChart3,
  PenTool,
  Shield,
} from "lucide-react";

interface Node {
  id: string;
  name: string;
  x: number;
  y: number;
  icon: React.ElementType;
  status: "idle" | "active" | "complete" | "retrying";
}

interface Edge {
  from: string;
  to: string;
  status: "idle" | "active" | "complete";
}

const initialNodes: Node[] = [
  { id: "planner", name: "Planner", x: 50, y: 20, icon: Brain, status: "idle" },
  { id: "researcher", name: "Researcher", x: 20, y: 50, icon: Search, status: "idle" },
  { id: "analyst", name: "Analyst", x: 50, y: 50, icon: BarChart3, status: "idle" },
  { id: "writer", name: "Writer", x: 80, y: 50, icon: PenTool, status: "idle" },
  { id: "critic", name: "Critic", x: 50, y: 80, icon: Shield, status: "idle" },
];

const initialEdges: Edge[] = [
  { from: "planner", to: "researcher", status: "idle" },
  { from: "planner", to: "analyst", status: "idle" },
  { from: "planner", to: "writer", status: "idle" },
  { from: "researcher", to: "analyst", status: "idle" },
  { from: "analyst", to: "writer", status: "idle" },
  { from: "writer", to: "critic", status: "idle" },
  { from: "critic", to: "researcher", status: "idle" }, // Retry loop
];

export function AgentNetwork({ jobId, className }: { jobId?: string; className?: string }) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  useWebSocket({
    jobId,
    onMessage: (event: WebSocketEvent) => {
      // Update node status
      if ("agent" in event && event.agent) {
        setNodes((prev) =>
          prev.map((node) => {
            if (node.id === event.agent) {
              return {
                ...node,
                status:
                  event.type === "agent_start"
                    ? "active"
                    : event.type === "agent_complete"
                    ? "complete"
                    : event.type === "critic_reject"
                    ? "retrying"
                    : node.status,
              };
            }
            return node;
          })
        );
      }

      // Update edge status based on agent flow
      if (event.type === "agent_start" && "agent" in event) {
        const agentOrder = ["planner", "researcher", "analyst", "writer", "critic"];
        const currentIndex = agentOrder.indexOf(event.agent);
        if (currentIndex > 0) {
          const prevAgent = agentOrder[currentIndex - 1];
          setEdges((prev) =>
            prev.map((edge) =>
              edge.from === prevAgent && edge.to === event.agent
                ? { ...edge, status: "active" }
                : edge
            )
          );
        }
      }

      if (event.type === "agent_complete" && "agent" in event) {
        setEdges((prev) =>
          prev.map((edge) =>
            edge.from === event.agent ? { ...edge, status: "complete" } : edge
          )
        );
      }

      // Handle critic reject - show retry path
      if (event.type === "critic_reject") {
        setEdges((prev) =>
          prev.map((edge) =>
            edge.from === "critic" && edge.to === "researcher"
              ? { ...edge, status: "active" }
              : edge
          )
        );
      }
    },
  });

  const getNodeColor = (status: Node["status"]) => {
    switch (status) {
      case "active":
        return "fill-blue-500 stroke-blue-600";
      case "complete":
        return "fill-green-500 stroke-green-600";
      case "retrying":
        return "fill-amber-500 stroke-amber-600";
      default:
        return "fill-muted stroke-foreground/20";
    }
  };

  const getEdgeColor = (status: Edge["status"]) => {
    switch (status) {
      case "active":
        return "stroke-blue-500";
      case "complete":
        return "stroke-green-500";
      default:
        return "stroke-foreground/10";
    }
  };

  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Edges */}
        {edges.map((edge, index) => {
          const fromNode = nodes.find((n) => n.id === edge.from);
          const toNode = nodes.find((n) => n.id === edge.to);
          if (!fromNode || !toNode) return null;

          return (
            <g key={`${edge.from}-${edge.to}`}>
              <line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                className={`${getEdgeColor(edge.status)} transition-all duration-500`}
                strokeWidth={edge.status === "idle" ? 0.5 : 1.5}
                strokeDasharray={edge.from === "critic" && edge.to === "researcher" ? "2,2" : "0"}
              />
              {edge.status === "active" && (
                <motion.circle
                  r="1.5"
                  className="fill-blue-500"
                  initial={{ cx: fromNode.x, cy: fromNode.y }}
                  animate={{ cx: toNode.x, cy: toNode.y }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const Icon = node.icon;
          return (
            <g key={node.id}>
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={node.status === "active" ? 6 : 5}
                className={`${getNodeColor(node.status)} transition-all duration-300`}
                strokeWidth={2}
                animate={node.status === "active" ? {
                  r: [5, 7, 5],
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <foreignObject
                x={node.x - 3}
                y={node.y - 3}
                width={6}
                height={6}
                className="pointer-events-none"
              >
                <div className="w-full h-full flex items-center justify-center">
                  <Icon className="w-3 h-3 text-white" />
                </div>
              </foreignObject>
              <text
                x={node.x}
                y={node.y + 10}
                textAnchor="middle"
                className="text-[3px] fill-foreground font-medium"
              >
                {node.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 flex flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-muted-foreground">Active</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-muted-foreground">Complete</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-muted-foreground">Retry</span>
        </div>
      </div>
    </div>
  );
}

// Simplified version for cards
export function AgentNetworkMini({ jobId }: { jobId?: string }) {
  const [activeAgents, setActiveAgents] = useState<string[]>([]);

  useWebSocket({
    jobId,
    onMessage: (event: WebSocketEvent) => {
      if (event.type === "agent_start" && "agent" in event) {
        setActiveAgents((prev) => [...prev, event.agent]);
      }
    },
  });

  const agents = [
    { id: "planner", icon: Brain, color: "bg-purple-500" },
    { id: "researcher", icon: Search, color: "bg-blue-500" },
    { id: "analyst", icon: BarChart3, color: "bg-green-500" },
    { id: "writer", icon: PenTool, color: "bg-amber-500" },
    { id: "critic", icon: Shield, color: "bg-red-500" },
  ];

  return (
    <div className="flex items-center justify-center gap-1">
      {agents.map((agent, index) => {
        const Icon = agent.icon;
        const isActive = activeAgents.includes(agent.id);
        
        return (
          <div key={agent.id} className="flex items-center">
            <motion.div
              animate={isActive ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isActive ? agent.color : "bg-muted"
              }`}
            >
              <Icon className="w-4 h-4 text-white" />
            </motion.div>
            {index < agents.length - 1 && (
              <div className={`w-3 h-0.5 ${
                activeAgents.includes(agent.id) ? "bg-foreground/30" : "bg-foreground/10"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
