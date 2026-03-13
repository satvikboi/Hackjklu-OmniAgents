"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";

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
    <div className={`flex gap-4 p-4 rounded-xl border transition-all duration-300 ${status === "active" ? "border-blue-500/30 bg-blue-500/5" : "border-foreground/10"}`}>
      <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-6 h-6 ${config.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{name}</h3>
          <Badge variant="secondary" className="text-xs">
            <StatusIcon className="w-3 h-3 mr-1" />
            {status}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{role}</p>
        {message && <p className="text-sm mt-2 text-muted-foreground">{message}</p>}
        {confidence && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Confidence Score</span>
              <span className="font-medium">{confidence}/10</span>
            </div>
            <Progress value={confidence * 10} className="h-1.5" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function NewTaskPage() {
  const [goal, setGoal] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobStatus, setJobStatus] = useState<"idle" | "running" | "completed">("idle");
  const [currentStep, setCurrentStep] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setIsSubmitting(true);
    setJobStatus("running");

    // Simulate agent pipeline
    for (let i = 0; i <= 5; i++) {
      setCurrentStep(i);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    setJobStatus("completed");
    setIsSubmitting(false);
  };

  const getAgentStatus = (step: number, current: number): "waiting" | "active" | "complete" | "retrying" => {
    if (current > step) return "complete";
    if (current === step) return "active";
    return "waiting";
  };

  const agents = [
    { icon: Brain, name: "Planner", role: "Breaking goal into subtasks", status: getAgentStatus(0, currentStep), confidence: currentStep > 0 ? 9.1 : undefined, message: currentStep === 0 ? "Analyzing goal structure..." : currentStep > 0 ? "Created 4 subtasks" : undefined },
    { icon: Search, name: "Researcher", role: "Gathering information", status: getAgentStatus(1, currentStep), confidence: currentStep > 1 ? 8.5 : undefined, message: currentStep === 1 ? "Searching web sources..." : currentStep > 1 ? "Found 12 sources" : undefined },
    { icon: BarChart3, name: "Analyst", role: "Processing data", status: getAgentStatus(2, currentStep), confidence: currentStep > 2 ? 8.8 : undefined, message: currentStep === 2 ? "Extracting insights..." : currentStep > 2 ? "Identified 8 key insights" : undefined },
    { icon: PenTool, name: "Writer", role: "Generating report", status: getAgentStatus(3, currentStep), confidence: currentStep > 3 ? 9.0 : undefined, message: currentStep === 3 ? "Writing final report..." : currentStep > 3 ? "Report generated" : undefined },
    { icon: Shield, name: "Critic", role: "Quality control", status: getAgentStatus(4, currentStep), confidence: currentStep > 4 ? 9.2 : undefined, message: currentStep === 4 ? "Evaluating report quality..." : currentStep > 4 ? "Approved with score 9.2/10" : undefined },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display tracking-tight">New Task</h1>
        <p className="text-muted-foreground mt-1">
          Describe your goal and let the agents handle the rest
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Task Details</CardTitle>
            <CardDescription>
              Enter a clear, specific goal for best results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="goal">Your Goal</Label>
                <Textarea
                  id="goal"
                  placeholder="e.g., Should I launch a fintech startup in India in 2026? Analyze competitors, market opportunity, risks, and give me a go/no-go recommendation."
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="min-h-[120px] resize-none"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  Be specific. Include context like target market, timeline, and key concerns.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Attachments (Optional)</Label>
                <div className="border-2 border-dashed border-foreground/10 rounded-xl p-6 text-center hover:bg-foreground/5 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Drop files here or click to upload
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, DOCX, TXT up to 10MB
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Estimated time: <span className="font-medium text-foreground">~60 seconds</span>
                </div>
                <Button
                  type="submit"
                  disabled={!goal.trim() || isSubmitting}
                  className="bg-foreground hover:bg-foreground/90 text-background rounded-full"
                >
                  {isSubmitting ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
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
            </form>
          </CardContent>
        </Card>

        {/* Live Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Agent Pipeline</CardTitle>
            <CardDescription>
              {jobStatus === "idle"
                ? "Agents will appear here when you start a task"
                : jobStatus === "running"
                ? "Agents are working on your task..."
                : "Task completed successfully!"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {jobStatus === "idle" ? (
              <div className="text-center py-12 text-muted-foreground">
                <Brain className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Enter a goal and click "Run Agents" to start</p>
              </div>
            ) : (
              <div className="space-y-3">
                {agents.map((agent, index) => (
                  <AgentStep key={agent.name} {...agent} />
                ))}

                {jobStatus === "completed" && (
                  <div className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">Report Ready</h4>
                        <p className="text-sm text-muted-foreground">
                          Saved to Notion • Confidence: 9.2/10
                        </p>
                      </div>
                      <Button size="sm" variant="outline" className="rounded-full">
                        View Report
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      <Card className="bg-foreground/5 border-foreground/10">
        <CardContent className="p-6">
          <h3 className="font-medium mb-4">Tips for better results</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
              <span className="text-muted-foreground">Be specific about your target market and timeline</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
              <span className="text-muted-foreground">Include relevant documents for context</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
              <span className="text-muted-foreground">Ask for specific deliverables (e.g., "SWOT analysis")</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
              <span className="text-muted-foreground">Mention constraints or requirements</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
