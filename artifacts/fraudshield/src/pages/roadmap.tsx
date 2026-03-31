import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, BrainCircuit, Network, ShieldCheck, GitPullRequest, SearchCode } from "lucide-react";

export default function Roadmap() {
  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-12">
      <div className="border-b border-border pb-6">
        <Badge variant="outline" className="mb-3 text-primary border-primary">Technical Documentation</Badge>
        <h1 className="text-4xl font-bold tracking-tight mb-2">System Architecture</h1>
        <p className="text-xl text-muted-foreground">Understanding the deep detection capabilities of FraudShield.</p>
      </div>

      {/* Architecture Diagram */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Network className="text-primary" /> Processing Pipeline
        </h2>
        <div className="bg-card/50 border border-border rounded-xl p-8 backdrop-blur overflow-x-auto">
          <div className="min-w-[700px] flex items-center justify-between font-mono text-sm relative">
            
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -z-10" />

            {/* Input */}
            <div className="flex flex-col items-center gap-3 bg-background p-4 rounded-lg border border-border w-32 shadow-sm">
              <Database className="w-6 h-6 text-muted-foreground" />
              <span className="font-semibold text-center">Raw Data<br/><span className="text-[10px] text-muted-foreground font-normal">API Gateway</span></span>
            </div>

            {/* Step 1 */}
            <div className="flex flex-col items-center gap-3 bg-background p-4 rounded-lg border border-border border-b-4 border-b-primary w-40 shadow-sm relative">
              <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">NLP</div>
              <SearchCode className="w-6 h-6 text-primary" />
              <span className="font-semibold text-center">Text Extraction<br/><span className="text-[10px] text-muted-foreground font-normal">Regex & Tokens</span></span>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-3 bg-background p-4 rounded-lg border border-border border-b-4 border-b-threat-spam w-40 shadow-sm">
              <BrainCircuit className="w-6 h-6 text-threat-spam" />
              <span className="font-semibold text-center">ML Classifier<br/><span className="text-[10px] text-muted-foreground font-normal">Intent Analysis</span></span>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-3 bg-background p-4 rounded-lg border border-border border-b-4 border-b-threat-fraud w-40 shadow-sm">
              <ShieldCheck className="w-6 h-6 text-threat-fraud" />
              <span className="font-semibold text-center">Risk Scoring<br/><span className="text-[10px] text-muted-foreground font-normal">Heuristics Engine</span></span>
            </div>

          </div>
        </div>
      </section>

      {/* Grid of details */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Detection Heuristics</CardTitle>
            <CardDescription>How the risk score is calculated</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-foreground/80">
            <div className="flex justify-between items-center border-b border-border/50 pb-2">
              <span className="font-mono">Urgency Indicators</span>
              <Badge variant="outline" className="text-threat-fraud border-threat-fraud/50">+30 pts</Badge>
            </div>
            <div className="flex justify-between items-center border-b border-border/50 pb-2">
              <span className="font-mono">Suspicious URLs</span>
              <Badge variant="outline" className="text-threat-fraud border-threat-fraud/50">+45 pts</Badge>
            </div>
            <div className="flex justify-between items-center border-b border-border/50 pb-2">
              <span className="font-mono">Financial Keywords</span>
              <Badge variant="outline" className="text-threat-spam border-threat-spam/50">+15 pts</Badge>
            </div>
            <div className="flex justify-between items-center pb-2">
              <span className="font-mono">Grammar Anomalies</span>
              <Badge variant="outline" className="text-muted-foreground border-muted-foreground/50">+10 pts</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Tech Stack</CardTitle>
            <CardDescription>The underlying infrastructure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Frontend</span>
                <span className="text-xs font-mono text-muted-foreground">React, Tailwind, Recharts</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary w-full" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Backend API</span>
                <span className="text-xs font-mono text-muted-foreground">Node.js, Express, OpenAPI</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary w-full" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Database</span>
                <span className="text-xs font-mono text-muted-foreground">PostgreSQL, Drizzle ORM</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[80%]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roadmap Timeline */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <GitPullRequest className="text-primary" /> Development Roadmap
        </h2>
        
        <div className="border-l-2 border-border ml-3 pl-8 space-y-8 relative">
          <div className="relative">
            <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center border-4 border-background" />
            <h3 className="text-lg font-semibold">Phase 1: Heuristics Engine</h3>
            <p className="text-sm text-muted-foreground mt-1">Implement regex-based detection, URL reputation checking, and basic risk scoring. (Completed)</p>
          </div>
          
          <div className="relative">
            <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-muted border-4 border-background" />
            <h3 className="text-lg font-semibold text-foreground/70">Phase 2: Deep Learning Integration</h3>
            <p className="text-sm text-muted-foreground mt-1">Replace heuristics with fine-tuned transformer models for intent classification and semantic analysis.</p>
          </div>

          <div className="relative">
            <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-muted border-4 border-background" />
            <h3 className="text-lg font-semibold text-foreground/70">Phase 3: Real-time API Subscriptions</h3>
            <p className="text-sm text-muted-foreground mt-1">Expose high-throughput WebSockets for enterprise clients to scan thousands of messages per second.</p>
          </div>
        </div>
      </section>

    </div>
  );
}