import { useState } from "react";
import { useForm } from "react-form";
import { useAnalyzeMessage } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle, AlertOctagon, Link as LinkIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Analyze() {
  const [message, setMessage] = useState("");
  const [channel, setChannel] = useState("sms");
  
  const mutation = useAnalyzeMessage();

  const handleAnalyze = () => {
    if (!message.trim()) return;
    mutation.mutate({ data: { message, channel: channel as any } });
  };

  const result = mutation.data;
  const isPending = mutation.isPending;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Threat Analysis Engine</h1>
        <p className="text-muted-foreground mt-1">Submit suspicious content for deep inspection.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <Card className="border-border bg-card/50 backdrop-blur h-fit">
          <CardHeader>
            <CardTitle>Message Input</CardTitle>
            <CardDescription>Paste the raw text of the message received.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="channel">Communication Channel</Label>
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger id="channel" className="bg-background">
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sms">SMS / Text Message</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Raw Content</Label>
              <Textarea 
                id="message" 
                placeholder="Paste the suspicious message here..." 
                className="min-h-[200px] font-mono text-sm bg-background resize-y"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <Button 
              className="w-full" 
              size="lg" 
              onClick={handleAnalyze} 
              disabled={isPending || !message.trim()}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Heuristics...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Analyze Content
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <div className="space-y-6">
          {isPending ? (
            <Card className="border-border bg-card/50 backdrop-blur h-[400px] flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
              <p className="font-mono text-sm">Processing NLP pipeline...</p>
              <p className="font-mono text-xs opacity-50">Checking URL reputation...</p>
            </Card>
          ) : result ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className={cn(
                "border-2 backdrop-blur overflow-hidden relative",
                result.classification === 'fraud' ? 'border-threat-fraud/50 bg-threat-fraud/5' :
                result.classification === 'spam' ? 'border-threat-spam/50 bg-threat-spam/5' :
                'border-threat-safe/50 bg-threat-safe/5'
              )}>
                <div className={cn(
                  "absolute top-0 left-0 w-1 h-full",
                  result.classification === 'fraud' ? 'bg-threat-fraud shadow-[0_0_10px_rgba(239,68,68,0.8)]' :
                  result.classification === 'spam' ? 'bg-threat-spam' :
                  'bg-threat-safe'
                )} />
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        {result.classification === 'fraud' && <AlertOctagon className="text-threat-fraud" />}
                        {result.classification === 'spam' && <AlertTriangle className="text-threat-spam" />}
                        {result.classification === 'safe' && <CheckCircle className="text-threat-safe" />}
                        <span className="capitalize tracking-tight">{result.classification} Detected</span>
                      </CardTitle>
                      <CardDescription className="mt-1 font-mono">
                        Risk Score: <span className="font-bold text-foreground">{result.riskScore}/100</span> | 
                        Confidence: <span className="font-bold text-foreground">{result.confidence}%</span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-foreground/90 mt-2">
                    {result.explanation}
                  </p>
                </CardContent>
              </Card>

              {result.indicators.length > 0 && (
                <Card className="border-border bg-card/50 backdrop-blur">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Threat Indicators</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {result.indicators.map((ind, i) => (
                        <div key={i} className="flex gap-3 items-start bg-background/50 p-3 rounded-md border border-border/50">
                          <Badge variant="outline" className={cn(
                            "uppercase text-[10px] px-1.5 py-0.5 mt-0.5",
                            ind.severity === 'high' ? 'border-threat-fraud text-threat-fraud' :
                            ind.severity === 'medium' ? 'border-threat-spam text-threat-spam' :
                            'border-muted-foreground text-muted-foreground'
                          )}>
                            {ind.severity}
                          </Badge>
                          <div>
                            <div className="font-semibold text-sm">{ind.type}</div>
                            <div className="text-xs text-muted-foreground">{ind.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {result.detectedUrls.length > 0 && (
                <Card className="border-border bg-card/50 backdrop-blur">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" /> URL Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {result.detectedUrls.map((url, i) => (
                        <div key={i} className="flex flex-col gap-1 p-3 rounded-md bg-background/50 border border-border/50">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs text-primary truncate max-w-[250px]">{url.url}</span>
                            <Badge variant={url.isSuspicious ? "destructive" : "secondary"} className="text-[10px]">
                              {url.isSuspicious ? "MALICIOUS" : "CLEAN"}
                            </Badge>
                          </div>
                          {url.reason && (
                            <div className="text-xs text-muted-foreground">{url.reason}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card className="border-border border-dashed bg-card/10 h-[400px] flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
              <Shield className="h-12 w-12 mb-4 opacity-20" />
              <h3 className="font-semibold text-foreground/70 mb-2">Awaiting Payload</h3>
              <p className="text-sm">Submit a message to run it through the classification pipeline. Results will appear here.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}