import { useState } from "react";
import { useGetAnalysisHistory, getGetAnalysisHistoryQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Mail, Phone, AlertOctagon, AlertTriangle, CheckCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function History() {
  const [page, setPage] = useState(0);
  const limit = 20;

  const { data, isLoading } = useGetAnalysisHistory(
    { limit, offset: page * limit },
    { query: { queryKey: getGetAnalysisHistoryQueryKey({ limit, offset: page * limit }) } }
  );

  const getChannelIcon = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'sms': return <MessageSquare className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'whatsapp': return <Phone className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (classification: string) => {
    switch (classification.toLowerCase()) {
      case 'fraud':
        return <Badge variant="destructive" className="bg-threat-fraud hover:bg-threat-fraud/80 text-[10px] uppercase font-bold tracking-wider">Fraud</Badge>;
      case 'spam':
        return <Badge variant="secondary" className="bg-threat-spam text-black hover:bg-threat-spam/80 text-[10px] uppercase font-bold tracking-wider">Spam</Badge>;
      case 'safe':
        return <Badge variant="outline" className="border-threat-safe text-threat-safe text-[10px] uppercase font-bold tracking-wider">Safe</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">{classification}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analysis History</h1>
        <p className="text-muted-foreground mt-1">Audit log of all processed messages across all channels.</p>
      </div>

      <Card className="border-border bg-card/50 backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="space-y-1">
            <CardTitle>Detection Logs</CardTitle>
            <CardDescription>Showing {data?.items.length || 0} recent evaluations</CardDescription>
          </div>
          <div className="flex items-center space-x-2 relative w-64">
            <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
            <Input placeholder="Search logs..." className="pl-9 bg-background border-border h-9" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="w-[100px]">Channel</TableHead>
                  <TableHead className="w-[120px]">Classification</TableHead>
                  <TableHead className="w-[80px]">Score</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead className="text-right w-[150px]">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(10).fill(0).map((_, i) => (
                    <TableRow key={i} className="border-border">
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-full max-w-[300px]" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : data?.items.map((row) => (
                  <TableRow key={row.id} className="border-border cursor-pointer hover:bg-muted/30">
                    <TableCell className="font-medium flex items-center gap-2">
                      {getChannelIcon(row.channel)}
                      <span className="capitalize text-xs">{row.channel}</span>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(row.classification)}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs">{row.riskScore}/100</span>
                    </TableCell>
                    <TableCell className="max-w-[400px] truncate text-sm text-muted-foreground font-mono">
                      {row.message}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(row.analyzedAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex items-center justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={!data || data.items.length < limit}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}