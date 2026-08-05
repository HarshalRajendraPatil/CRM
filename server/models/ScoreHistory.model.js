import mongoose from 'mongoose';

/**
 * ScoreHistory — Tracks every AI/rule-based score computation for a lead.
 * Provides a full audit trail, trend data, and raw signals for future ML training.
 */
const scoreHistorySchema = new mongoose.Schema({
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true,
    index: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  previousScore: {
    type: Number,
    default: null,
  },
  reason: {
    type: String,
    required: true,
  },
  method: {
    type: String,
    enum: ['rule_based', 'llm_based', 'hybrid'],
    default: 'rule_based',
  },
  // Snapshot of every signal value used — critical for ML training later
  signalsSnapshot: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  // Sub-scores when hybrid method is used
  ruleScore: {
    type: Number,
    default: null,
  },
  llmScore: {
    type: Number,
    default: null,
  },
  trigger: {
    type: String,
    enum: ['created', 'updated', 'status_changed', 'note_added', 'scheduled_decay', 'manual_recompute'],
    default: 'updated',
  },
  computedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: false, // computedAt handles this
});

// Compound index for efficient lead history lookups
scoreHistorySchema.index({ lead: 1, computedAt: -1 });

const ScoreHistory = mongoose.model('ScoreHistory', scoreHistorySchema);

export default ScoreHistory;
