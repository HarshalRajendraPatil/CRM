import mongoose from "mongoose";

const leadNoteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const leadSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Lead name is required"],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please enter a valid email address",
      ],
    },
    phone: {
      type: String,
      trim: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },
    source: {
      type: String,
      enum: ["web", "email", "phone", "referral", "event", "ads", "other"],
      default: "other",
      index: true,
    },
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "disqualified"],
      default: "new",
      index: true,
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
    },
    jobTitle: {
      type: String,
      trim: true,
      default: "",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    customFields: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    notes: [leadNoteSchema],
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
    convertedAt: {
      type: Date,
      default: null,
    },
    convertedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    convertedContactId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    convertedCustomerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
leadSchema.index({ name: 1, project: 1 });
leadSchema.index({ email: 1, project: 1 });
leadSchema.index({ stage: 1, project: 1 });
leadSchema.index({ status: 1, project: 1 });
leadSchema.index({ tags: 1, project: 1 });

// Static methods
leadSchema.statics.findByProject = function (projectId, options = {}) {
  const {
    limit = 20,
    skip = 0,
    sort = "createdAt",
    order = "desc",
    stage,
    status,
    source,
    search,
    tags,
    owner,
    company,
  } = options;

  const query = { project: projectId, isArchived: false };

  if (stage) query.stage = stage;
  // legacy
  if (status) query.stage = status;
  if (source) query.source = source;
  if (owner) query.owner = owner;
  if (tags && tags.length > 0)
    query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
  if (company) query.company = company;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { companyName: { $regex: search, $options: "i" } },
      { jobTitle: { $regex: search, $options: "i" } },
    ];
  }

  const sortOption = {};
  sortOption[sort] = order === "asc" ? 1 : -1;

  return this.find(query)
    .sort(sortOption)
    .skip(parseInt(skip))
    .limit(parseInt(limit))
    .populate("owner", "name email profileImage")
    .populate("assignedTo", "name email profileImage")
    .populate("createdBy", "name email profileImage")
    .populate("updatedBy", "name email profileImage")
    .populate("convertedBy", "name email profileImage")
    .populate("convertedCustomerId", "name email")
    .populate("company", "name industry");
};

leadSchema.statics.findArchivedByProject = function (projectId, options = {}) {
  const {
    limit = 20,
    skip = 0,
    sort = "createdAt",
    order = "desc",
    stage,
    status,
    source,
    search,
    tags,
    owner,
  } = options;

  const query = { project: projectId, isArchived: true };

  if (stage) query.stage = stage;
  // legacy
  if (status) query.stage = status;
  if (source) query.source = source;
  if (owner) query.owner = owner;
  if (tags && tags.length > 0)
    query.tags = { $in: Array.isArray(tags) ? tags : [tags] };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { companyName: { $regex: search, $options: "i" } },
      { jobTitle: { $regex: search, $options: "i" } },
    ];
  }

  const sortOption = {};
  sortOption[sort] = order === "asc" ? 1 : -1;

  return this.find(query)
    .sort(sortOption)
    .skip(parseInt(skip))
    .limit(parseInt(limit))
    .populate("owner", "name email profileImage")
    .populate("assignedTo", "name email profileImage")
    .populate("createdBy", "name email profileImage")
    .populate("updatedBy", "name email profileImage")
    .populate("convertedBy", "name email profileImage")
    .populate("convertedCustomerId", "name email")
    .populate("company", "name industry");
};

// Instance helpers

leadSchema.methods.addNote = async function (content, userId) {
  this.notes.push({
    content,
    createdBy: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  this.updatedBy = userId;
  return this.save();
};

// Activity tracking methods
leadSchema.methods.trackActivity = async function (
  activityType,
  description,
  performedBy,
  metadata = {}
) {
  const Activity = mongoose.model("Activity");
  return await Activity.logActivity({
    entityType: "Lead",
    entityId: this._id,
    project: this.project,
    activityType,
    description,
    category: this.getActivityCategory(activityType),
    performedBy: performedBy._id || performedBy,
    priority: this.getActivityPriority(activityType),
    metadata: {
      leadName: this.name,
      ...metadata,
    },
  });
};

leadSchema.methods.getActivityCategory = function (activityType) {
  const categoryMap = {
    lead_created: "creation",
    lead_updated: "update",
    lead_archived: "status_change",
    lead_unarchived: "status_change",
    lead_deleted: "deletion",
    lead_note_added: "interaction",
    lead_note_updated: "interaction",
    lead_note_deleted: "interaction",
    lead_status_changed: "status_change",
    lead_assigned: "assignment",
    lead_unassigned: "assignment",
    lead_converted: "conversion",
    lead_score_updated: "update",
    lead_source_updated: "update",
    lead_company_linked: "update",
    lead_company_unlinked: "update",
  };
  return categoryMap[activityType] || "update";
};

leadSchema.methods.getActivityPriority = function (activityType) {
  const priorityMap = {
    lead_created: "high",
    lead_converted: "high",
    lead_deleted: "critical",
    lead_archived: "medium",
    lead_unarchived: "medium",
    lead_status_changed: "medium",
    lead_assigned: "medium",
    lead_unassigned: "medium",
    lead_note_added: "medium",
  };
  return priorityMap[activityType] || "low";
};

leadSchema.pre("save", function (next) {
  if (this.tags) {
    this.tags = [...new Set(this.tags)];
  }
  // keep status and stage synced for compatibility
  if (this.isModified("stage")) {
    this.status = this.stage;
  }
  if (this.isModified("status")) {
    this.stage = this.status;
  }
  next();
});

const Lead = mongoose.model("Lead", leadSchema);

export default Lead;
