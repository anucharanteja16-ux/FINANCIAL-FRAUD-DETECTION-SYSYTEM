import { 
  useGetDashboardStats, 
  getGetDashboardStatsQueryKey,
  useGetRecentActivity,
  getGetRecentActivityQueryKey,
  useGetClassificationBreakdown,
  getGetClassificationBreakdownQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ShieldCheck, MailWarning, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Cell as PieCell } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: stats, isLoading: isStatsLoading } = useGetDashboardStats({
    query: { queryKey: getGetDashboardStatsQueryKey() }
  });

  const { data: recent, isLoading: isRecentLoading } = useGetRecentActivity({
    query: { queryKey: getGetRecentActivityQueryKey() }
  });

  const { data: breakdown, isLoading: isBreakdownLoading } = useGetClassificationBreakdown({
    query: { queryKey: getGetClassificationBreakdownQueryKey() }
  });

  const COLORS = {
    safe: "hsl(var(--threat-safe))",
    spam: "hsl(var(--threat-spam))",
    fraud: "hsl(var(--threat-fraud))"
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Overview</h1>
          <p className="text-muted-foreground mt-1">Real-time telemetrics and fraud classification stats.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/analyze">
            <div className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium text-sm cursor-pointer transition-colors shadow-sm">
              Analyze New Message
            </div>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Analyzed" 
          value={stats?.totalAnalyzed} 
          loading={isStatsLoading} 
          icon={<Activity className="w-4 h-4 text-muted-foreground" />} 
        />
        <StatCard 
          title="Fraud Detected" 
          value={stats?.fraudCount} 
          loading={isStatsLoading} 
          icon={<AlertCircle className="w-4 h-4 text-threat-fraud" />} 
          trend={stats ? `${stats.fraudRate.toFixed(1)}% rate` : undefined}
          trendColor="text-threat-fraud"
        />
        <StatCard 
          title="Spam Blocked" 
          value={stats?.spamCount} 
          loading={isStatsLoading} 
          icon={<MailWarning className="w-4 h-4 text-threat-spam" />} 
        />
        <StatCard 
          title="Safe Messages" 
          value={stats?.safeCount} 
          loading={isStatsLoading} 
          icon={<ShieldCheck className="w-4 h-4 text-threat-safe" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg">Weekly Threat Trend</CardTitle>
              <CardDescription>Volume of messages analyzed over the past 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {isBreakdownLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : breakdown ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={breakdown.weeklyTrend} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Bar dataKey="safe" stackId="a" fill={COLORS.safe} radius={[0, 0, 4, 4]} />
                      <Bar dataKey="spam" stackId="a" fill={COLORS.spam} />
                      <Bar dataKey="fraud" stackId="a" fill={COLORS.fraud} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg">By Classification</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                {isBreakdownLoading ? (
                  <Skeleton className="h-[200px] w-[200px] rounded-full" />
                ) : breakdown ? (
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={breakdown.byClassification}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="count"
                          nameKey="classification"
                          stroke="none"
                        >
                          {breakdown.byClassification.map((entry, index) => (
                            <PieCell key={`cell-${index}`} fill={COLORS[entry.classification as keyof typeof COLORS]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                          itemStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card className="border-border bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg">Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center h-[200px] space-y-4">
                  <div className="text-5xl font-bold tracking-tighter font-mono">
                    {stats?.avgRiskScore ? Math.round(stats.avgRiskScore) : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Average Risk Score</div>
                  
                  <div className="w-full space-y-2 mt-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">URLs Checked</span>
                      <span className="font-medium">{stats?.urlsChecked || 0}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-threat-fraud">Suspicious URLs</span>
                      <span className="font-medium">{stats?.suspiciousUrls || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity Sidebar */}
        <Card className="border-border bg-card/50 backdrop-blur flex flex-col">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Detections</CardTitle>
              <Link href="/history">
                <span className="text-xs text-primary hover:underline cursor-pointer">View All</span>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto">
            {isRecentLoading ? (
              <div className="p-4 space-y-4">
                {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : recent ? (
              <div className="divide-y divide-border/50">
                {recent.map((item) => (
                  <Link key={item.id} href={`/history?id=${item.id}`}>
                    <div className="p-4 hover:bg-muted/50 cursor-pointer transition-colors flex items-start gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-1.5 shrink-0",
                        item.classification === 'fraud' && "bg-threat-fraud shadow-[0_0_8px_rgba(239,68,68,0.5)]",
                        item.classification === 'spam' && "bg-threat-spam",
                        item.classification === 'safe' && "bg-threat-safe",
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {item.channel}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            Score: {item.riskScore}
                          </span>
                        </div>
                        <p className="text-sm truncate text-foreground/90">{item.messagePreview}</p>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(item.analyzedAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, loading, icon, trend, trendColor }: { 
  title: string; 
  value?: number; 
  loading: boolean;
  icon: React.ReactNode;
  trend?: string;
  trendColor?: string;
}) {
  return (
    <Card className="border-border bg-card/50 backdrop-blur">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium tracking-tight text-muted-foreground">{title}</p>
          {icon}
        </div>
        <div className="flex items-baseline gap-2">
          {loading ? (
            <Skeleton className="h-8 w-20 mt-1" />
          ) : (
            <div className="text-3xl font-bold tracking-tighter font-mono mt-1">
              {value?.toLocaleString() || 0}
            </div>
          )}
          {trend && (
            <span className={cn("text-xs font-medium ml-2", trendColor)}>
              {trend}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}
