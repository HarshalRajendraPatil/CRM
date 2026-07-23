import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const invoiceItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  productId: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    default: () => `INV-${nanoid(8).toUpperCase()}`,
    unique: true,
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
  items: [invoiceItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR']
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled', 'partially_paid'],
    default: 'draft',
    index: true
  },
  issueDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  dueDate: {
    type: Date,
    required: true,
    index: true
  },
  paidDate: {
    type: Date,
    default: null
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  remainingAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  notes: {
    type: String,
    trim: true
  },
  terms: {
    type: String,
    trim: true
  },
  billingAddress: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, trim: true }
  },
  shippingAddress: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, trim: true }
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
  pdfUrl: {
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
invoiceSchema.index({ project: 1, isArchived: 1 });
invoiceSchema.index({ project: 1, status: 1 });
invoiceSchema.index({ project: 1, customer: 1 });
invoiceSchema.index({ project: 1, deal: 1 });
invoiceSchema.index({ project: 1, dueDate: 1 });
invoiceSchema.index({ project: 1, issueDate: 1 });
invoiceSchema.index({ customer: 1, project: 1 });
invoiceSchema.index({ company: 1, project: 1 });
invoiceSchema.index({ status: 1, dueDate: 1 });

// Virtual for calculating remaining amount
invoiceSchema.virtual('calculatedRemainingAmount').get(function() {
  return Math.max(0, this.total - (this.paidAmount || 0));
});

// Method to check if invoice is overdue
invoiceSchema.methods.isOverdue = function() {
  if (this.status === 'paid' || this.status === 'cancelled') {
    return false;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(this.dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today;
};

// Method to update payment status
invoiceSchema.methods.updatePaymentStatus = async function() {
  if (this.paidAmount >= this.total) {
    this.status = 'paid';
    if (!this.paidDate) {
      this.paidDate = new Date();
    }
  } else if (this.paidAmount > 0) {
    this.status = 'partially_paid';
  } else if (this.status === 'sent' && this.isOverdue()) {
    this.status = 'overdue';
  }
  
  this.remainingAmount = this.calculatedRemainingAmount;
  return this.save();
};

// Pre-save hook to calculate totals
invoiceSchema.pre('save', function(next) {
  // Calculate subtotal from items
  if (this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce((sum, item) => {
      const itemTotal = (item.unitPrice * item.quantity) - (item.discount || 0);
      return sum + itemTotal;
    }, 0);
  }
  
  // Calculate total
  this.total = this.subtotal + (this.tax || 0) - (this.discount || 0);
  
  // Calculate remaining amount
  this.remainingAmount = Math.max(0, this.total - (this.paidAmount || 0));
  
  // Auto-update status if overdue
  if (this.status === 'sent' && this.isOverdue()) {
    this.status = 'overdue';
  }
  
  next();
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;

