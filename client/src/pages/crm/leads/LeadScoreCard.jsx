import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getLeadScoreHistory, recomputeLeadScore } from '../../../store/leadSlice';
import {
  TrendingUp, TrendingDown, Minus, RefreshCw, ChevronDown, ChevronUp,
  Zap, Clock, Star, BarChart2, Info, Sparkles
} from 'lucide-react';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function getScoreColor(score) {
  if (score >= 75) return { text: 'text-emerald-700', bg: 'bg-emerald-50', bar: 'bg-emerald-500', border: 'border-emerald-200' };
  if (score >= 50) return { text: 'text-amber-700', bg: 'bg-amber-50', bar: 'bg-amber-400', border: 'border-amber-200' };
  if (score >= 25) return { text: 'text-orange-700', bg: 'bg-orange-50', bar: 'bg-orange-400', border: 'border-orange-200' };
  return { text: 'text-rose-700', bg: 'bg-rose-50', bar: 'bg-rose-500', border: 'border-rose-200' };
}

function getScoreLabel(score) {
  if (score >= 75) return 'Hot Lead';
  if (score >= 50) return 'Warm Lead';
  if (score >= 25) return 'Developing';
  return 'Cold Lead';
}

function getMethodBadge(method) {
  if (method === 'hybrid') return { label: 'AI Hybrid', icon: Sparkles, color: 'text-violet-700 bg-violet-50 border-violet-200' };
  if (method === 'llm_based') return { label: 'AI Scored', icon: Sparkles, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
  return { label: 'Rule-Based', icon: BarChart2, color: 'text-slate-600 bg-slate-50 border-slate-200' };
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ─────────────────────────────────────────────
// Score Gauge
// ─────────────────────────────────────────────
const ScoreGauge = ({ score }) => {
  const colors = getScoreColor(score);
  const pct = Math.min(100, Math.max(0, score));
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (pct / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
        {/* Track */}
        <circle cx="50" cy="50" r={radius} fill="none" strokeWidth="8" className="stroke-slate-100" />
        {/* Progress */}
        <circle
          cx="50" cy="50" r={radius} fill="none" strokeWidth="8"
          strokeLinecap="round"
          stroke={pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : pct >= 25 ? '#f97316' : '#f43f5e'}
          strokeDasharray={`${strokeDash} ${circumference}`}
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute flex flex-col items-center">
        <span className={`text-2xl font-black ${colors.text}`}>{score}</span>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">/ 100</span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Score History Item
// ─────────────────────────────────────────────
const HistoryItem = ({ entry, isFirst }) => {
  const delta = entry.previousScore !== null ? entry.score - entry.previousScore : null;
  const colors = getScoreColor(entry.score);

  return (
    <div className="relative flex gap-3">
      {/* Timeline line */}
      {!isFirst && (
        <div className="absolute left-[11px] -top-4 w-px h-4 bg-slate-200" />
      )}
      {/* Dot */}
      <div className={`w-[22px] h-[22px] rounded-full border-2 shrink-0 flex items-center justify-center mt-0.5 z-10 ${colors.border} bg-white`}>
        <div className={`w-2 h-2 rounded-full ${colors.bar}`} />
      </div>

      <div className="flex-1 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className={`text-base font-black ${colors.text}`}>{entry.score}</span>
            {delta !== null && (
              <span className={`text-xs font-semibold flex items-center gap-0.5 ${delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                {delta > 0 ? <TrendingUp size={11} /> : delta < 0 ? <TrendingDown size={11} /> : <Minus size={11} />}
                {delta > 0 ? `+${delta}` : delta}
              </span>
            )}
            <span className="text-[10px] font-medium text-slate-400 uppercase px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded">
              {entry.trigger?.replace(/_/g, ' ')}
            </span>
          </div>
          <span className="text-xs text-slate-400">{formatDate(entry.computedAt)}</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">{entry.reason}</p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main LeadScoreCard Component
// ─────────────────────────────────────────────
const LeadScoreCard = ({ lead, hasManagerAccess = false, projectId }) => {
  const dispatch = useDispatch();
  const { scoreHistory, isScoring } = useSelector(s => s.leads);
  const [expanded, setExpanded] = useState(false);
  const [recomputeMsg, setRecomputeMsg] = useState('');
  const [historyLimit, setHistoryLimit] = useState(5); // paginate score history
  const HISTORY_PAGE_SIZE = 5;

  useEffect(() => {
    if (lead?._id) {
      dispatch(getLeadScoreHistory({ id: lead._id, projectId }));
    }
  }, [dispatch, lead?._id]);

  const handleRecompute = useCallback(async () => {
    if (!lead?._id || isScoring) return;
    setRecomputeMsg('');
    try {
      await dispatch(recomputeLeadScore({ id: lead._id, projectId })).unwrap();
      await dispatch(getLeadScoreHistory({ id: lead._id, projectId }));
      setRecomputeMsg('Score updated!');
      setTimeout(() => setRecomputeMsg(''), 3000);
    } catch {
      setRecomputeMsg('Recompute failed');
    }
  }, [dispatch, lead?._id, isScoring]);

  const score = lead?.score ?? 50;
  const reason = lead?.scoreReason || scoreHistory?.scoreReason || 'Score will be computed shortly.';
  const method = lead?.scoreMethod || scoreHistory?.scoreMethod || 'rule_based';
  const updatedAt = lead?.scoreUpdatedAt || scoreHistory?.scoreUpdatedAt;
  const history = scoreHistory?.history || [];

  const colors = getScoreColor(score);
  const label = getScoreLabel(score);
  const methodBadge = getMethodBadge(method);
  const MethodIcon = methodBadge.icon;

  // Previous score for trend
  const prevEntry = history[1];
  const delta = prevEntry ? score - prevEntry.score : null;

  return (
    <div className={`bg-white rounded-xl border shadow-sm overflow-hidden ${colors.border}`}>
      {/* Header */}
      <div className={`px-4 py-3 flex items-center justify-between ${colors.bg} border-b ${colors.border}`}>
        <div className="flex items-center gap-2">
          <Star size={14} className={colors.text} />
          <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>AI Lead Score</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border flex items-center gap-1 ${methodBadge.color}`}>
            <MethodIcon size={9} />
            {methodBadge.label}
          </span>
        </div>
      </div>

      {/* Score body */}
      <div className="p-4">
        <div className="flex items-center gap-5 mb-4">
          {/* Gauge */}
          <ScoreGauge score={score} />

          {/* Label + trend */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-base font-black ${colors.text}`}>{label}</span>
              {delta !== null && (
                <span className={`text-xs font-semibold flex items-center gap-0.5 ${delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                  {delta > 0 ? <TrendingUp size={12} /> : delta < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
                  {delta > 0 ? `+${delta}` : delta} since last update
                </span>
              )}
            </div>

            {/* Score bar */}
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
                style={{ width: `${score}%` }}
              />
            </div>

            {/* Reason */}
            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 flex items-start gap-1">
              <Info size={11} className="text-slate-400 mt-0.5 shrink-0" />
              {reason}
            </p>

            {updatedAt && (
              <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                <Clock size={9} />
                Updated {formatDate(updatedAt)}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          {hasManagerAccess && (
            <button
              onClick={handleRecompute}
              disabled={isScoring}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-wait border border-indigo-100 hover:border-indigo-200"
            >
              <RefreshCw size={11} className={isScoring ? 'animate-spin' : ''} />
              {isScoring ? 'Scoring…' : 'Recompute'}
            </button>
          )}
          {recomputeMsg && (
            <span className={`text-xs font-medium ${recomputeMsg.includes('fail') ? 'text-rose-600' : 'text-emerald-600'}`}>
              {recomputeMsg}
            </span>
          )}
          {history.length > 0 && (
            <button
              onClick={() => {
                setExpanded(e => !e);
                if (expanded) setHistoryLimit(5); // reset on collapse
              }}
              className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700 ml-auto"
            >
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              History ({history.length})
            </button>
          )}
        </div>
      </div>

      {/* Score History Timeline with pagination */}
      {expanded && history.length > 0 && (
        <div className="border-t border-slate-100 px-4 pt-4 pb-2 bg-slate-50/30">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1">
            <BarChart2 size={10} />
            Score History
          </p>
          <div className="space-y-0">
            {history.slice(0, historyLimit).map((entry, i) => (
              <HistoryItem key={entry._id || i} entry={entry} isFirst={i === 0} />
            ))}
          </div>
          {/* Load more / collapse controls */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[10px] text-slate-400">
              {Math.min(historyLimit, history.length)} of {history.length} entries
            </span>
            <div className="flex gap-2">
              {historyLimit < history.length && (
                <button
                  onClick={() => setHistoryLimit(l => l + HISTORY_PAGE_SIZE)}
                  className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded border border-indigo-100 hover:bg-indigo-50 transition-all"
                >
                  Load {Math.min(HISTORY_PAGE_SIZE, history.length - historyLimit)} more
                </button>
              )}
              {historyLimit > HISTORY_PAGE_SIZE && (
                <button
                  onClick={() => setHistoryLimit(HISTORY_PAGE_SIZE)}
                  className="text-[10px] font-semibold text-slate-500 hover:text-slate-700 px-2 py-1 rounded border border-slate-200 hover:bg-slate-100 transition-all"
                >
                  Show less
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadScoreCard;
