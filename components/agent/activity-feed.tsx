"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
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
  ExternalLink,
  Sparkles,
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: WebSocketEvent["type"];
  agent?: string;
  message: string;
  confidence?: number;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

const agentIcons: Record<string, React.ElementType> = {
  planner: Brain,
  researcher: Search,
  analyst: BarChart3,
  writer: PenTool,
  critic: Shield,
};

const agentColors: Record<string, string> = {
  planner: "bg-purple-500/10 text-purple-500",
  researcher: "bg-blue-500/10 text-blue-500",
  analyst: "bg-green-500/10 text-green-500",
  writer: "bg-amber-500/10 text-amber-500",
  critic: "bg-red-500/10 text-red-500",
};

function ActivityItemComponent({ item, isLatest }: { item: ActivityItem; isLatest: boolean }) {
  const Icon = item.agent ? agentIcons[item.agent] || Brain : Sparkles;
  const colorClass = item.agent ? agentColors[item.agent] || "bg-muted text-muted-foreground" : "bg-muted text-muted-foreground";

  const getStatusIcon = () => {
    switch (item.type) {
      case "agent_complete":
      case "critic_approve":
        return <CheckCircle2 className="w-3 h-3 text-green-500" />;
      case "critic_reject":
        return <AlertCircle className="w-3 h-3 text-amber-500" />;
      case "error":
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      default:
        return <Clock className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`flex gap-3 p-3 rounded-lg transition-colors ${
        isLatest ? "bg-foreground/5 border border-foreground/10" : "hover:bg-foreground/5"
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {item.agent && (
            <span className="font-medium text-sm capitalize">{item.agent}</span>
          )}
          
          {item.confidence && (
            <Badge variant="secondary" className="text-xs">
              {item.confidence}/10
            </Badge>
          )}
          
          {item.type === "critic_reject" && (
            <Badge variant="destructive" className="text-xs">
              Retry
            </Badge>
          )}
          
          {item.type === "critic_approve" && (
            <Badge className="text-xs bg-green-500">
              Approved
            </Badge>
          )}
          
          <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
            {getStatusIcon()}
            {formatTime(item.timestamp)}
          </span>
        </div>
        
        <p className="text-sm text-muted-foreground mt-1">{item.message}</p>
        
        {item.type === "notion_saved" && item.metadata?.notion_url && (
          <a
            href={item.metadata.notion_url as string}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-500 hover:underline mt-2"
          >
            <ExternalLink className="w-3 h-3" />
            Open in Notion
          </a>
        )}
      </div>
    </motion.div>
  );
}

interface ActivityFeedProps {
  jobId?: string;
  maxItems?: number;
  className?: string;
}

export function ActivityFeed({ jobId, maxItems = 50, className }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { isConnected } = useWebSocket({
    jobId,
    onMessage: (event: WebSocketEvent) => {
      const newActivity: ActivityItem = {
        id: `${Date.now()}-${Math.random()}`,
        type: event.type,
        agent: "agent" in event ? event.agent : undefined,
        message: "message" in event ? event.message : 
                 "reason" in event ? event.reason :
                 "Job completed successfully",
        confidence: "confidence" in event ? event.confidence :
                   "final_confidence" in event ? event.final_confidence :
                   "score" in event ? event.score : undefined,
        timestamp: event.timestamp,
        metadata: event.type === "notion_saved" ? { notion_url: event.notion_url } :
                  event.type === "pipeline_complete" ? { 
                    job_id: event.job_id, 
                    total_time: event.total_time_seconds 
                  } : undefined,
      };

      setActivities((prev) => {
        const updated = [newActivity, ...prev];
        return maxItems ? updated.slice(0, maxItems) : updated;
      });
    },
  });

  // Auto-scroll to top when new activity arrives
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [activities]);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Live Activity</h3>
          {isConnected && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {activities.length} events
        </span>
      </div>

      <ScrollArea className="h-[400px]" ref={scrollRef}>
        <div className="space-y-2 pr-4">
          <AnimatePresence mode="popLayout">
            {activities.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-muted-foreground"
              >
                <Sparkles className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm">No activity yet</p>
                <p className="text-xs">Start a task to see live updates</p>
              </motion.div>
            ) : (
              activities.map((item, index) => (
                <ActivityItemComponent
                  key={item.id}
                  item={item}
                  isLatest={index === 0}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
}

// Mini version for dashboard cards
export function ActivityFeedMini({ jobId }: { jobId?: string }) {
  const [latestActivity, setLatestActivity] = useState<ActivityItem | null>(null);

  useWebSocket({
    jobId,
    onMessage: (event: WebSocketEvent) => {
      setLatestActivity({
        id: Date.now().toString(),
        type: event.type,
        agent: "agent" in event ? event.agent : undefined,
        message: "message" in event ? event.message : "",
        timestamp: event.timestamp,
      });
    },
  });

  if (!latestActivity) return null;

  const Icon = latestActivity.agent ? agentIcons[latestActivity.agent] || Brain : Sparkles;
  const colorClass = latestActivity.agent ? agentColors[latestActivity.agent] : "bg-muted";

  return (
    <motion.div
      key={latestActivity.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 p-3 rounded-lg bg-foreground/5"
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{latestActivity.message}</p>
        <p className="text-xs text-muted-foreground">
          {latestActivity.agent && `${latestActivity.agent} • `}
          Just now
        </p>
      </div>
    </motion.div>
  );
}
