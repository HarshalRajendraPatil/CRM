import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const receiptSchema = new mongoose.Schema({
  receiptNumber: {
    type: String,
    default: () => `RCP-${nanoid(8).toUpperCase()}`,
    unique: true,
    index: true
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true,
    index: true
  },
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true,
    index: true
  },
  deal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal',
    required: true,
    index: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    default: null,
    index: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR']
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'bank_transfer', 'check', 'cash', 'paypal', 'stripe', 'other'],
    required: true
  },
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  pdfUrl: {
    type: String,
    trim: true
  },
  sentToEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  sentAt: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isArchived: {
    type: Boolean,
    default: false,
    index: true
  },
  archivedAt: {
    type: Date
  },
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for common queries
receiptSchema.index({ project: 1, isArchived: 1 });
receiptSchema.index({ project: 1, customer: 1 });
receiptSchema.index({ project: 1, payment: 1 });
receiptSchema.index({ project: 1, invoice: 1 });
receiptSchema.index({ project: 1, deal: 1 });
receiptSchema.index({ project: 1, paymentDate: 1 });
receiptSchema.index({ customer: 1, project: 1 });
receiptSchema.index({ company: 1, project: 1 });

const Receipt = mongoose.model('Receipt', receiptSchema);

export default Receipt;

