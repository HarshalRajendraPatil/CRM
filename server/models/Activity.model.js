import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    // Entity reference (Company, Lead, Customer, Deal, Task, CalendarEvent, Project)
    entityType: {
      type: String,
      enum: [
        "Company",
        "Lead",
        "Customer",
        "Deal",
        "Task",
        "CalendarEvent",
        "Project",
      ],
      required: true,
      index: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    // Project reference
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    // Activity details
    activityType: {
      type: String,
      required: true,
      enum: [
        // Company activities
        "company_created",
        "company_updated",
        "company_deleted",
        "company_note_added",
        "company_note_updated",
        "company_note_deleted",
        "company_tag_added",
        "company_tag_removed",
        "company_custom_field_added",
        "company_custom_field_removed",
        "company_custom_field_updated",
        "company_status_changed",
        "company_assigned",
        "company_unassigned",
        "company_name_changed",
        "company_email_changed",
        "company_phone_changed",
        "company_address_changed",
        "company_website_changed",
        "company_industry_changed",
        "company_size_changed",
        "company_owner_changed",
        "company_archived",
        "company_unarchived",

        // Lead activities
        "lead_created",
        "lead_updated",
        "lead_archived",
        "lead_unarchived",
        "lead_deleted",
        "lead_note_added",
        "lead_note_updated",
        "lead_note_deleted",
        "lead_status_changed",
        "lead_assigned",
        "lead_unassigned",
        "lead_converted",
        "lead_score_updated",
        "lead_source_updated",
        "lead_company_linked",
        "lead_company_unlinked",
        "lead_name_changed",
        "lead_email_changed",
        "lead_phone_changed",
        "lead_job_title_changed",
        "lead_owner_changed",
        "lead_tags_changed",
        "lead_custom_field_added",
        "lead_custom_field_updated",
        "lead_custom_field_removed",

        // Customer activities
        "customer_created",
        "customer_updated",
        "customer_archived",
        "customer_unarchived",
        "customer_deleted",
        "customer_note_added",
        "customer_note_updated",
        "customer_note_deleted",
        "customer_interaction_added",
        "customer_interaction_updated",
        "customer_interaction_deleted",
        "customer_stage_changed",
        "customer_status_changed",
        "customer_assigned",
        "customer_unassigned",
        "customer_converted_from_lead",
        "customer_score_updated",
        "customer_priority_changed",
        "customer_tag_added",
        "customer_tag_removed",
        "customer_custom_field_added",
        "customer_custom_field_updated",
        "customer_custom_field_removed",
        "customer_name_changed",
        "customer_email_changed",
        "customer_phone_changed",
        "customer_address_changed",
        "customer_company_changed",
        "customer_owner_changed",

        // Deal activities
        "deal_created",
        "deal_updated",
        "deal_archived",
        "deal_restored",
        "deal_deleted",
        "deal_status_changed",
        "deal_value_changed",
        "deal_assigned",
        "deal_unassigned",
        "deal_note_added",
        "deal_note_updated",
        "deal_note_deleted",
        "deal_activity_added",
        "deal_activity_updated",
        "deal_activity_deleted",
        "deal_priority_changed",
        "deal_probability_changed",
        "deal_close_date_changed",
        "deal_expected_close_date_changed",
        "deal_actual_close_date_changed",
        "deal_customer_changed",
        "deal_company_changed",
        "deal_contact_person_changed",
        "deal_stage_changed",
        "deal_pipeline_changed",
        "deal_product_added",
        "deal_product_updated",
        "deal_product_removed",
        "deal_attachment_added",
        "deal_attachment_removed",
        "deal_name_changed",
        "deal_currency_changed",
        "deal_source_changed",
        "deal_tags_changed",
        "deal_custom_field_added",
        "deal_custom_field_updated",
        "deal_custom_field_removed",
        "deal_won",
        "deal_lost",

        // Task activities
        "task_created",
        "task_updated",
        "task_completed",
        "task_reopened",
        "task_assigned",
        "task_unassigned",
        "task_reassigned",
        "task_archived",
        "task_restored",
        "task_deleted",
        "task_status_changed",
        "task_priority_changed",
        "task_due_date_changed",
        "task_title_changed",
        "task_description_changed",
        "task_comment_added",
        "task_comment_updated",
        "task_comment_deleted",
        "task_custom_field_added",
        "task_custom_field_updated",
        "task_custom_field_deleted",
        "task_subtask_added",
        "task_subtask_updated",
        "task_subtask_deleted",
        "task_subtask_completed",
        "task_tag_added",
        "task_tag_removed",
        "task_attachment_added",
        "task_attachment_removed",
        "task_related_entity_changed",
        "task_estimated_time_changed",
        "task_actual_time_changed",

        // CalendarEvent activities
        "event_created",
        "event_updated",
        "event_deleted",
        "event_cancelled",
        "event_title_changed",
        "event_description_changed",
        "event_start_date_changed",
        "event_end_date_changed",
        "event_start_time_changed",
        "event_end_time_changed",
        "event_location_changed",
        "event_all_day_changed",
        "event_type_changed",
        "event_attendee_added",
        "event_attendee_removed",
        "event_reminder_added",
        "event_reminder_updated",
        "event_reminder_removed",
        "event_related_entity_changed",
        "event_custom_field_added",
        "event_custom_field_updated",
        "event_custom_field_removed",

        // Project activities
        "project_created",
        "project_updated",
        "project_deleted",
        "project_name_changed",
        "project_description_changed",
        "project_owner_changed",
        "project_member_added",
        "project_member_removed",
        "project_member_role_changed",
        "project_settings_changed",
        "project_pipeline_added",
        "project_pipeline_updated",
        "project_pipeline_deleted",
        "project_stage_added",
        "project_stage_updated",
        "project_stage_deleted",
        "project_archived",
        "project_unarchived",
      ],
      index: true,
    },
    // Activity description
    description: {
      type: String,
      required: true,
    },
    // Previous and new values for changes
    changes: {
      field: String,
      oldValue: mongoose.Schema.Types.Mixed,
      newValue: mongoose.Schema.Types.Mixed,
    },
    // Metadata
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // User who performed the activity
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Related entities
    relatedEntity: {
      type: {
        type: String,
        enum: [
          "User",
          "Company",
          "Lead",
          "Customer",
          "Deal",
          "Task",
          "Project",
          "CalendarEvent",
        ],
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },
    // Activity priority/importance
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    // Activity visibility
    isVisible: {
      type: Boolean,
      default: true,
    },
    // Activity category for filtering
    category: {
      type: String,
      enum: [
        "creation",
        "update",
        "deletion",
        "assignment",
        "status_change",
        "interaction",
        "conversion",
        "system",
      ],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
activitySchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
activitySchema.index({ project: 1, createdAt: -1 });
activitySchema.index({ performedBy: 1, createdAt: -1 });
activitySchema.index({ activityType: 1, createdAt: -1 });
activitySchema.index({ category: 1, createdAt: -1 });

// Static methods
activitySchema.statics.logActivity = async function (activityData) {
  const activity = new this(activityData);
  return await activity.save();
};

activitySchema.statics.getEntityActivities = async function (
  entityType,
  entityId,
  options = {}
) {
  const {
    limit = 50,
    skip = 0,
    category,
    activityType,
    performedBy,
    startDate,
    endDate,
    sort = "createdAt",
    order = "desc",
  } = options;

  const query = {
    entityType,
    entityId,
  };

  if (category) query.category = category;
  if (activityType) query.activityType = activityType;
  if (performedBy) query.performedBy = performedBy;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const sortOption = {};
  sortOption[sort] = order === "asc" ? 1 : -1;

  return await this.find(query)
    .sort(sortOption)
    .skip(parseInt(skip))
    .limit(parseInt(limit))
    .populate("performedBy", "name email profileImage")
    .populate("relatedEntity.id", "name email")
    .lean();
};

activitySchema.statics.getProjectActivities = async function (
  projectId,
  options = {}
) {
  const {
    limit = 100,
    skip = 0,
    entityType,
    category,
    activityType,
    performedBy,
    startDate,
    endDate,
    sort = "createdAt",
    order = "desc",
  } = options;

  const query = { project: projectId };

  if (entityType) query.entityType = entityType;
  if (category) query.category = category;
  if (activityType) query.activityType = activityType;
  if (performedBy) query.performedBy = performedBy;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const sortOption = {};
  sortOption[sort] = order === "asc" ? 1 : -1;

  return await this.find(query)
    .sort(sortOption)
    .skip(parseInt(skip))
    .limit(parseInt(limit))
    .populate("performedBy", "name email profileImage")
    .populate("relatedEntity.id", "name email")
    .lean();
};

activitySchema.statics.getActivityStats = async function (
  projectId,
  options = {}
) {
  const { startDate, endDate, entityType, category } = options;

  const matchQuery = { project: projectId };

  if (entityType) matchQuery.entityType = entityType;
  if (category) matchQuery.category = category;
  if (startDate || endDate) {
    matchQuery.createdAt = {};
    if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
    if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
  }

  const stats = await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: {
          activityType: "$activityType",
          category: "$category",
        },
        count: { $sum: 1 },
        lastActivity: { $max: "$createdAt" },
      },
    },
    { $sort: { count: -1 } },
  ]);

  return stats;
};

// Instance methods
activitySchema.methods.getFormattedDescription = function () {
  const user = this.performedBy?.name || "System";
  const timestamp = this.createdAt.toLocaleString();

  return {
    user,
    timestamp,
    description: this.description,
    changes: this.changes,
    metadata: this.metadata,
  };
};

const Activity = mongoose.model("Activity", activitySchema);

export default Activity;
