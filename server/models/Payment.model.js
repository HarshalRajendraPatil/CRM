import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const paymentSchema = new mongoose.Schema({
  paymentNumber: {
    type: String,
    default: () => `PAY-${nanoid(8).toUpperCase()}`,
    unique: true,
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
    required: true,
    index: true
  },
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending',
    index: true
  },
  transactionId: {
    type: String,
    trim: true,
    index: true
  },
  receiptNumber: {
    type: String,
    trim: true
  },
  receipt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Receipt',
    default: null
  },
  notes: {
    type: String,
    trim: true
  },
  referenceNumber: {
    type: String,
    trim: true
  },
  bankName: {
    type: String,
    trim: true
  },
  checkNumber: {
    type: String,
    trim: true
  },
  cardLast4: {
    type: String,
    trim: true,
    maxlength: 4
  },
  cardBrand: {
    type: String,
    trim: true,
    enum: ['visa', 'mastercard', 'amex', 'discover', 'other', '']
  },
  refundAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  refundDate: {
    type: Date
  },
  refundReason: {
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
paymentSchema.index({ project: 1, isArchived: 1 });
paymentSchema.index({ project: 1, status: 1 });
paymentSchema.index({ project: 1, customer: 1 });
paymentSchema.index({ project: 1, invoice: 1 });
paymentSchema.index({ project: 1, deal: 1 });
paymentSchema.index({ project: 1, paymentDate: 1 });
paymentSchema.index({ project: 1, paymentMethod: 1 });
paymentSchema.index({ customer: 1, project: 1 });
paymentSchema.index({ company: 1, project: 1 });
paymentSchema.index({ invoice: 1, status: 1 });

// Method to mark payment as completed
paymentSchema.methods.markAsCompleted = async function() {
  this.status = 'completed';
  return this.save();
};

// Method to mark payment as failed
paymentSchema.methods.markAsFailed = async function(reason = '') {
  this.status = 'failed';
  if (reason) {
    this.notes = (this.notes || '') + `\nFailed: ${reason}`;
  }
  return this.save();
};

// Method to process refund
paymentSchema.methods.processRefund = async function(amount, reason = '') {
  if (this.status !== 'completed') {
    throw new Error('Only completed payments can be refunded');
  }
  
  if (amount > this.amount) {
    throw new Error('Refund amount cannot exceed payment amount');
  }
  
  this.status = 'refunded';
  this.refundAmount = amount;
  this.refundDate = new Date();
  if (reason) {
    this.refundReason = reason;
  }
  
  return this.save();
};

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;

