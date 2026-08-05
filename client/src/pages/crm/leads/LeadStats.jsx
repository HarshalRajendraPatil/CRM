import React, { useEffect, useMemo, useState, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getLeadStats, getLeadInsights } from '../../../store/leadSlice';
import { getProjectPipelines, clearPipelines } from '../../../store/projectSlice';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  Users, TrendingUp, TrendingDown, Calendar, Target, Activity,
  Tag, Loader2, BarChart3, ArrowUpRight, ArrowDownRight,
  Zap, Award, Clock, Globe, Building2, Star,
  ChevronRight, AlertCircle
} from 'lucide-react';

const PALETTE = {
  indigo: '#6366f1',
  violet: '#8b5cf6',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#f43f5e',
  sky: '#0ea5e9',
  teal: '#14b8a6',
  orange: '#f97316',
};
const CHART_COLORS = Object.values(PALETTE);

const SOURCE_LABELS = {
  web: 'Website', email: 'Email', phone: 'Phone',
  referral: 'Referral', event: 'Event', ads: 'Advertising', other: 'Other',
};

const KpiCard = memo(({ title, value, subtitle, icon: Icon, trend, trendLabel, gradient, sparkData }) => {
  const positive = trend >= 0;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.04] group-hover:opacity-[0.07] transition-opacity`} />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} shadow-sm`}>
            <Icon size={18} className="text-white" />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${positive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <p className="text-3xl font-bold text-slate-900 tracking-tight mb-1">{value}</p>
        <p className="text-sm font-semibold text-slate-500">{title}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        {trendLabel && (
          <p className={`text-xs font-medium mt-2 ${positive ? 'text-emerald-600' : 'text-rose-600'}`}>{trendLabel}</p>
        )}
        {sparkData && sparkData.length > 1 && (
          <div className="mt-3 -mx-1">
            <ResponsiveContainer width="100%" height={36}>
              <AreaChart data={sparkData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`spark-${title.replace(/\s/g,'')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PALETTE.indigo} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={PALETTE.indigo} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="count" stroke={PALETTE.indigo} strokeWidth={1.5} fill={`url(#spark-${title.replace(/\s/g,'')})`} dot={false} animationDuration={800} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
});

const SectionCard = memo(({ title, subtitle, children, badge, headerRight }) => (
  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
      <div>
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          {title}
          {badge && <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full">{badge}</span>}
        </h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {headerRight}
    </div>
    <div className="p-6">{children}</div>
  </div>
));

const ChartTooltipContent = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm">
      {label && <p className="font-semibold text-slate-700 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-600">{p.name}:</span>
          <span className="font-bold text-slate-900">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

function generateInsights(insights) {
  if (!insights) return [];
  const { totals, sourceDistribution, ownerPerformance, monthlyTrends, agingBuckets, topTags } = insights;
  const items = [];

  if (totals?.conversionRate !== undefined) {
    if (totals.conversionRate >= 30) {
      items.push({ type: 'positive', icon: TrendingUp, text: `Excellent conversion rate of ${totals.conversionRate}% — your qualification process is highly effective.` });
    } else if (totals.conversionRate < 10 && totals.totalLeads > 10) {
      items.push({ type: 'warning', icon: AlertCircle, text: `Conversion rate is only ${totals.conversionRate}%. Consider reviewing your qualification criteria or follow-up cadence.` });
    }
  }

  if (sourceDistribution?.length > 0) {
    const best = sourceDistribution[0];
    items.push({ type: 'info', icon: Globe, text: `${SOURCE_LABELS[best.source] || best.source} is your top lead source, accounting for ${best.percentage}% of all leads.` });
  }

  const stale = (agingBuckets?.['90+ days'] || 0) + (agingBuckets?.['61-90 days'] || 0);
  if (stale > 0) {
    items.push({ type: 'warning', icon: Clock, text: `${stale} leads are 60+ days old and may need re-engagement or archiving.` });
  }

  if (ownerPerformance?.length > 0) {
    const top = ownerPerformance[0];
    if (top.total >= 3) {
      items.push({ type: 'positive', icon: Award, text: `${top.owner?.name || 'A team member'} leads performance with a ${top.conversionRate}% win rate on ${top.total} leads.` });
    }
  }

  if (monthlyTrends?.length >= 2) {
    const recent = monthlyTrends[monthlyTrends.length - 1];
    const prev = monthlyTrends[monthlyTrends.length - 2];
    if (recent.total > prev.total) {
      const growth = prev.total > 0 ? Math.round(((recent.total - prev.total) / prev.total) * 100) : 100;
      items.push({ type: 'positive', icon: TrendingUp, text: `Lead volume is up ${growth}% this month vs last month — keep the momentum going!` });
    } else if (recent.total < prev.total && prev.total > 0) {
      const drop = Math.round(((prev.total - recent.total) / prev.total) * 100);
      items.push({ type: 'warning', icon: TrendingDown, text: `Lead inflow dropped ${drop}% month-over-month. Consider activating new acquisition channels.` });
    }
  }

  const fresh = agingBuckets?.['0-7 days'] || 0;
  if (fresh > 0) {
    items.push({ type: 'info', icon: Zap, text: `${fresh} fresh leads added in the last 7 days — prioritize outreach while interest is high.` });
  }

  if (topTags?.length > 0) {
    items.push({ type: 'info', icon: Tag, text: `"${topTags[0].tag}" is your most-used tag (${topTags[0].count} leads), indicating your primary market segment.` });
  }

  return items.slice(0, 6);
}

function buildScoreData(scoreRanges) {
  if (!scoreRanges) return [];
  return [
    { range: '0–25', count: scoreRanges['0-25'] || 0, fill: PALETTE.rose },
    { range: '26–50', count: scoreRanges['26-50'] || 0, fill: PALETTE.amber },
    { range: '51–75', count: scoreRanges['51-75'] || 0, fill: PALETTE.sky },
    { range: '76–100', count: scoreRanges['76-100'] || 0, fill: PALETTE.emerald },
  ];
}

function buildAgingData(agingBuckets) {
  if (!agingBuckets) return [];
  return Object.entries(agingBuckets).map(([key, val]) => ({ age: key, count: val }));
}

const LeadStats = ({ projectId }) => {
  const dispatch = useDispatch();
  const { insights, isLoading } = useSelector((state) => state.leads);
  const { pipelines, currentProjectId } = useSelector((state) => state.projects);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (projectId && projectId !== currentProjectId) {
      dispatch(clearPipelines());
      dispatch(getProjectPipelines(projectId));
    }
    dispatch(getLeadStats({ projectId }));
    dispatch(getLeadInsights({ projectId }));
  }, [dispatch, projectId, currentProjectId]);

  const leadPipeline = useMemo(() => pipelines?.filter(p => p.type === 'lead') || [], [pipelines]);
  const defaultPipeline = useMemo(() => leadPipeline.find(p => p.isDefault) || leadPipeline[0], [leadPipeline]);
  const stages = useMemo(() => defaultPipeline?.stages || [], [defaultPipeline]);

  const dailyTrend = useMemo(() =>
    (insights?.dailyCreationTrend || []).map(d => ({ ...d, date: d.date?.slice(5) })),
  [insights]);

  const monthlyTrends = useMemo(() =>
    (insights?.monthlyTrends || []).map(d => ({
      ...d,
      month: d.month ? new Date(d.month + '-01').toLocaleString('default', { month: 'short', year: '2-digit' }) : '',
    })),
  [insights]);

  const sourceData = useMemo(() =>
    (insights?.sourceDistribution || []).map(s => ({ ...s, label: SOURCE_LABELS[s.source] || s.source })),
  [insights]);

  const scoreData = useMemo(() => buildScoreData(insights?.scoreRanges), [insights]);
  const agingData = useMemo(() => buildAgingData(insights?.agingBuckets), [insights]);

  const funnelData = useMemo(() => {
    if (!insights) return [];
    const serverFunnel = insights.funnel || [];
    if (stages.length === 0) return serverFunnel.map(f => ({ ...f, color: PALETTE.indigo }));
    return stages.map(stage => {
      const found = serverFunnel.find(f => f.stage.toLowerCase() === stage.name.toLowerCase());
      return {
        stage: stage.name,
        count: found?.count || 0,
        conversionFromPrev: found?.conversionFromPrev || 0,
        color: stage.color || PALETTE.indigo,
      };
    });
  }, [insights, stages]);

  const smartInsights = useMemo(() => generateInsights(insights), [insights]);
  const sparkData = useMemo(() => dailyTrend.slice(-14), [dailyTrend]);
  const totals = insights?.totals || {};
  const activePipeline = (totals.totalLeads || 0) - (totals.totalDisqualified || 0);

  if (isLoading && !insights) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-slate-400">
        <Loader2 size={36} className="animate-spin text-indigo-500 mb-4" />
        <p className="font-semibold text-slate-500">Crunching the numbers…</p>
        <p className="text-sm text-slate-400 mt-1">Building your analytics dashboard</p>
      </div>
    );
  }

  const TABS = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'funnel', label: 'Conversion Funnel', icon: Target },
    { id: 'sources', label: 'Lead Sources', icon: Globe },
    { id: 'team', label: 'Team Performance', icon: Users },
    { id: 'trends', label: 'Monthly Trends', icon: TrendingUp },
    { id: 'insights', label: 'Smart Insights', icon: Zap },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <KpiCard title="Total Leads" value={totals.totalLeads || 0} subtitle="All active leads in pipeline" icon={Users} gradient="from-indigo-500 to-indigo-600" trendLabel={`${totals.leadsThisMonth || 0} added this month`} sparkData={sparkData} />
        <KpiCard title="Conversion Rate" value={`${totals.conversionRate || 0}%`} subtitle="Leads that reached qualified stage" icon={TrendingUp} gradient="from-emerald-500 to-emerald-600" trendLabel={`${totals.totalQualified || 0} leads qualified`} />
        <KpiCard title="Active Pipeline" value={activePipeline} subtitle="Opportunities currently in progress" icon={Target} gradient="from-violet-500 to-violet-600" trendLabel={`${totals.totalDisqualified || 0} disqualified excluded`} />
        <KpiCard title="This Month" value={totals.leadsThisMonth || 0} subtitle="New leads added in current month" icon={Calendar} gradient="from-amber-500 to-amber-600" sparkData={dailyTrend.slice(-7)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SectionCard title="Lead Volume — Last 30 Days" subtitle="Daily new lead inflow trend" badge="30D" headerRight={<span className="text-xs text-slate-400">Updated today</span>}>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrend} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PALETTE.indigo} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={PALETTE.indigo} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} interval={4} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="count" name="Leads" stroke={PALETTE.indigo} strokeWidth={2.5} fill="url(#areaGrad)" dot={false} activeDot={{ r: 5, strokeWidth: 0, fill: PALETTE.indigo }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Pipeline Stage Distribution" subtitle="Breakdown by current lead stage">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={funnelData.filter(f => f.count > 0)} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={4} dataKey="count" nameKey="stage" strokeWidth={2} stroke="white">
                  {funnelData.filter(f => f.count > 0).map((entry, i) => (
                    <Cell key={i} fill={entry.color || CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltipContent />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Lead Quality Scores" subtitle="Distribution across score ranges">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" name="Leads" radius={[6, 6, 0, 0]} maxBarSize={56}>
                  {scoreData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="Lead Aging Buckets" subtitle="How long leads have been in the pipeline">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agingData} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis type="category" dataKey="age" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} width={70} />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" name="Leads" fill={PALETTE.teal} radius={[0, 6, 6, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Recent Pipeline Activity" subtitle="Latest 10 leads by activity">
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {insights?.recentActivity?.length > 0 ? (
              insights.recentActivity.map((lead, i) => {
                const stage = stages.find(s => s._id === lead.status);
                const color = stage?.color || PALETTE.indigo;
                const stageName = stage?.name || lead.status || '—';
                return (
                  <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0">
                        {lead.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 leading-tight">{lead.name}</p>
                        <p className="text-xs text-slate-400">{lead.owner?.name || 'Unassigned'}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold border shrink-0"
                      style={{ background: `${color}18`, color, borderColor: `${color}40` }}>
                      {stageName}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-[180px] text-slate-400">
                <Activity size={28} className="mb-2 opacity-40" />
                <p className="text-sm">No recent activity yet</p>
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );

  const renderFunnel = () => {
    const maxCount = Math.max(...funnelData.map(f => f.count), 1);
    return (
      <div className="space-y-6">
        <SectionCard title="Conversion Funnel" subtitle="Stage-by-stage lead progression and drop-off rates">
          <div className="space-y-5 max-w-3xl mx-auto">
            {funnelData.length > 0 ? funnelData.map((item, i) => {
              const pct = Math.max((item.count / maxCount) * 100, item.count > 0 ? 6 : 0);
              const stageColor = item.color || CHART_COLORS[i % CHART_COLORS.length];
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm"
                        style={{ background: stageColor }}>
                        {i + 1}
                      </div>
                      <span className="text-sm font-bold text-slate-700">{item.stage}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-900">{item.count} leads</span>
                      {i > 0 && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          item.conversionFromPrev >= 50 ? 'bg-emerald-50 text-emerald-700' :
                          item.conversionFromPrev >= 20 ? 'bg-amber-50 text-amber-700' :
                          'bg-rose-50 text-rose-700'
                        }`}>
                          {item.conversionFromPrev}% from prev
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-10 bg-slate-100 rounded-xl overflow-hidden">
                    <div className="h-full rounded-xl flex items-center justify-end pr-3 transition-all duration-700"
                      style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${stageColor}cc, ${stageColor})` }}>
                      {pct > 12 && <span className="text-white text-sm font-bold">{item.count}</span>}
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-12 text-slate-400">
                <Target size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No pipeline stages configured</p>
              </div>
            )}
          </div>
        </SectionCard>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { label: 'Total Leads', value: totals.totalLeads || 0, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Qualified', value: totals.totalQualified || 0, icon: Star, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Win Rate', value: `${totals.conversionRate || 0}%`, icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50' },
          ].map((card, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`p-3 rounded-xl ${card.bg}`}>
                <card.icon size={22} className={card.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSources = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="Lead Source Distribution" subtitle="Where your leads are coming from">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData} margin={{ top: 5, right: 5, bottom: 20, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" name="Leads" radius={[6, 6, 0, 0]} maxBarSize={56}>
                  {sourceData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Source Breakdown" subtitle="Percentage share by acquisition channel">
          <div className="space-y-4">
            {sourceData.length > 0 ? sourceData.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                    <span className="text-sm font-bold text-slate-900 ml-2">{item.count}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${item.percentage}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-500 w-10 text-right shrink-0">{item.percentage}%</span>
              </div>
            )) : (
              <div className="text-center py-8 text-slate-400">
                <Globe size={28} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No source data available</p>
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Top Lead Tags" subtitle="Most frequently used tags across all leads">
        <div className="flex flex-wrap gap-3">
          {insights?.topTags?.length > 0 ? (
            insights.topTags.map((tag, i) => (
              <div key={i} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 hover:border-indigo-300 hover:bg-indigo-50 transition-all group">
                <Tag size={13} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                <span className="text-sm font-semibold text-slate-700">{tag.tag}</span>
                <span className="text-xs font-bold text-indigo-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">{tag.count}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400 w-full">
              <Tag size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No tags have been used yet</p>
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );

  const renderTeam = () => (
    <div className="space-y-6">
      <SectionCard title="Team Performance Leaderboard" subtitle="Ranked by conversion rate across all team members">
        {insights?.ownerPerformance?.length > 0 ? (
          <div className="space-y-4">
            {insights.ownerPerformance.map((perf, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3 w-44 shrink-0">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                      {(perf.owner?.name || '?').charAt(0).toUpperCase()}
                    </div>
                    {i === 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center text-white text-[9px] font-bold">1</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 leading-tight">{perf.owner?.name || 'Unassigned'}</p>
                    <p className="text-xs text-slate-500">{perf.total} total leads</p>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-slate-500">Win Rate</span>
                    <span className={`text-sm font-bold ${perf.conversionRate >= 40 ? 'text-emerald-600' : perf.conversionRate >= 20 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {perf.conversionRate}%
                    </span>
                  </div>
                  <div className="h-2 bg-white rounded-full border border-slate-200 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${perf.conversionRate >= 40 ? 'bg-emerald-500' : perf.conversionRate >= 20 ? 'bg-amber-500' : 'bg-rose-400'}`}
                      style={{ width: `${Math.min(perf.conversionRate, 100)}%` }} />
                  </div>
                </div>
                <div className="flex gap-4 shrink-0 text-center">
                  <div>
                    <p className="text-base font-bold text-slate-900">{perf.qualified || 0}</p>
                    <p className="text-xs text-slate-500">Qualified</p>
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-900">{perf.contacted || 0}</p>
                    <p className="text-xs text-slate-500">Contacted</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            <Users size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No team performance data yet</p>
            <p className="text-xs mt-1">Assign leads to team members to see stats here</p>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Top Companies by Lead Volume" subtitle="Organizations with the most leads in your pipeline">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {insights?.topCompanies?.slice(0, 8).length > 0 ? (
            insights.topCompanies.slice(0, 8).map((company, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/50 transition-all">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Building2 size={14} className="text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{company.name}</p>
                  <p className="text-xs text-slate-500">{company.total} leads · {company.qualified} qualified</p>
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full shrink-0">
                  {company.total > 0 ? Math.round((company.qualified / company.total) * 100) : 0}%
                </span>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-8 text-slate-400">
              <Building2 size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No company data available</p>
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );

  const renderTrends = () => (
    <div className="space-y-6">
      <SectionCard title="Monthly Lead Volume & Conversion" subtitle="12-month view of lead inflow vs qualification rates">
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrends} margin={{ top: 10, right: 20, bottom: 5, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={8} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" domain={[0, 100]} />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
              <Line yAxisId="left" type="monotone" dataKey="total" name="Total Leads" stroke={PALETTE.indigo} strokeWidth={2.5} dot={{ r: 4, strokeWidth: 0, fill: PALETTE.indigo }} activeDot={{ r: 6, strokeWidth: 0 }} />
              <Line yAxisId="left" type="monotone" dataKey="qualified" name="Qualified" stroke={PALETTE.emerald} strokeWidth={2.5} strokeDasharray="5 3" dot={{ r: 4, strokeWidth: 0, fill: PALETTE.emerald }} activeDot={{ r: 6, strokeWidth: 0 }} />
              <Line yAxisId="right" type="monotone" dataKey="conversionRate" name="Win Rate %" stroke={PALETTE.amber} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="Daily Lead Inflow" subtitle="Last 30 days breakdown">
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyTrend} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} interval={6} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" name="New Leads" fill={PALETTE.violet} radius={[4, 4, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Lead Aging Distribution" subtitle="Days leads have spent in the pipeline">
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agingData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="age" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" name="Leads" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {agingData.map((_, i) => {
                    const colors = [PALETTE.emerald, PALETTE.sky, PALETTE.amber, PALETTE.orange, PALETTE.rose];
                    return <Cell key={i} fill={colors[i % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </div>
  );

  const renderInsights = () => {
    const typeConfig = {
      positive: { border: 'border-emerald-200', bg: 'bg-emerald-50', iconColor: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700', label: 'Positive' },
      warning:  { border: 'border-amber-200',   bg: 'bg-amber-50',   iconColor: 'text-amber-600',   badge: 'bg-amber-100 text-amber-700',   label: 'Action Needed' },
      info:     { border: 'border-indigo-200',  bg: 'bg-indigo-50',  iconColor: 'text-indigo-600',  badge: 'bg-indigo-100 text-indigo-700', label: 'Insight' },
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-1">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Smart Insights Engine</h3>
            <p className="text-xs text-slate-500">Observations generated from your live pipeline data</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {smartInsights.length > 0 ? (
            smartInsights.map((item, i) => {
              const cfg = typeConfig[item.type] || typeConfig.info;
              return (
                <div key={i} className={`border ${cfg.border} ${cfg.bg} rounded-2xl p-5 flex items-start gap-4 hover:shadow-sm transition-shadow`}>
                  <div className="p-2.5 rounded-xl bg-white shadow-sm shrink-0">
                    <item.icon size={18} className={cfg.iconColor} />
                  </div>
                  <div className="flex-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge} mb-2 inline-block`}>{cfg.label}</span>
                    <p className="text-sm font-medium text-slate-700 leading-relaxed">{item.text}</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 mt-1 shrink-0" />
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 text-slate-400">
              <Zap size={36} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium text-slate-500">Not enough data yet</p>
              <p className="text-sm mt-1">Add more leads to unlock smart insights</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: totals.totalLeads || 0, color: 'text-indigo-600' },
            { label: 'Qualified', value: totals.totalQualified || 0, color: 'text-emerald-600' },
            { label: 'Conversion', value: `${totals.conversionRate || 0}%`, color: 'text-violet-600' },
            { label: 'This Month', value: totals.leadsThisMonth || 0, color: 'text-amber-600' },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 text-center hover:shadow-sm transition-shadow">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs font-medium text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <BarChart3 size={22} className="text-indigo-600" />
            Lead Analytics
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Data-driven insights into your sales pipeline performance</p>
        </div>
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            <Loader2 size={12} className="animate-spin" />
            Refreshing…
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="border-b border-slate-100 overflow-x-auto">
          <nav className="flex min-w-max px-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap transition-all relative ${
                  activeTab === tab.id
                    ? 'text-indigo-700 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-indigo-600 after:rounded-t-full'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <tab.icon size={15} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 sm:p-8 bg-slate-50/30 min-h-[480px]">
          {activeTab === 'overview'  && renderOverview()}
          {activeTab === 'funnel'    && renderFunnel()}
          {activeTab === 'sources'   && renderSources()}
          {activeTab === 'team'      && renderTeam()}
          {activeTab === 'trends'    && renderTrends()}
          {activeTab === 'insights'  && renderInsights()}
        </div>
      </div>
    </div>
  );
};

export default LeadStats;
