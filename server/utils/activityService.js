import Activity from '../models/Activity.model.js';
import mongoose from 'mongoose';

class ActivityService {
  // Company activity logging methods
  static async logCompanyCreated(company, performedBy) {
    return await Activity.logActivity({
      entityType: 'Company',
      entityId: company._id,
      project: company.project,
      activityType: 'company_created',
      description: `Company "${company.name}" was created`,
      category: 'creation',
      performedBy: performedBy._id,
      priority: 'high',
      metadata: {
        companyName: company.name,
        industry: company.industry,
        status: company.status
      }
    });
  }

  static async logCompanyUpdated(company, changes, performedBy) {
    const changeDescriptions = [];
    
    Object.keys(changes).forEach(field => {
      if (field === 'updatedAt' || field === 'updatedBy') return;
      
      const oldValue = changes[field].oldValue;
      const newValue = changes[field].newValue;
      
      if (oldValue !== newValue) {
        changeDescriptions.push(`${field} changed from "${oldValue}" to "${newValue}"`);
      }
    });

    if (changeDescriptions.length === 0) return null;

    return await Activity.logActivity({
      entityType: 'Company',
      entityId: company._id,
      project: company.project,
      activityType: 'company_updated',
      description: `Company "${company.name}" was updated: ${changeDescriptions.join(', ')}`,
      category: 'update',
      performedBy: performedBy._id,
      priority: 'medium',
      changes: {
        field: Object.keys(changes).join(', '),
        oldValue: Object.values(changes).map(c => c.oldValue),
        newValue: Object.values(changes).map(c => c.newValue)
      },
      metadata: {
        companyName: company.name,
        fieldsChanged: Object.keys(changes).filter(f => f !== 'updatedAt' && f !== 'updatedBy')
      }
    });
  }

  static async logCompanyDeleted(company, performedBy) {
    return await Activity.logActivity({
      entityType: 'Company',
      entityId: company._id,
      project: company.project,
      activityType: 'company_deleted',
      description: `Company "${company.name}" was deleted`,
      category: 'deletion',
      performedBy: performedBy._id,
      priority: 'critical',
      metadata: {
        companyName: company.name,
        industry: company.industry
      }
    });
  }

  static async logCompanyNoteAdded(company, note, performedBy) {
    return await Activity.logActivity({
      entityType: 'Company',
      entityId: company._id,
      project: company.project,
      activityType: 'company_note_added',
      description: `Note added to company "${company.name}"`,
      category: 'interaction',
      performedBy: performedBy._id,
      priority: 'medium',
      metadata: {
        companyName: company.name,
        noteContent: note.content.substring(0, 100) + (note.content.length > 100 ? '...' : ''),
        noteId: note._id
      }
    });
  }

  static async logCompanyNoteUpdated(company, note, performedBy) {
    return await Activity.logActivity({
      entityType: 'Company',
      entityId: company._id,
      project: company.project,
      activityType: 'company_note_updated',
      description: `Note updated for company "${company.name}"`,
      category: 'interaction',
      performedBy: performedBy._id,
      priority: 'low',
      metadata: {
        companyName: company.name,
        noteId: note._id
      }
    });
  }

  static async logCompanyNoteDeleted(company, noteId, performedBy) {
    return await Activity.logActivity({
      entityType: 'Company',
      entityId: company._id,
      project: company.project,
      activityType: 'company_note_deleted',
      description: `Note deleted from company "${company.name}"`,
      category: 'interaction',
      performedBy: performedBy._id,
      priority: 'low',
      metadata: {
        companyName: company.name,
        noteId: noteId
      }
    });
  }

  static async logCompanyTagAdded(company, tag, performedBy) {
    return await Activity.logActivity({
      entityType: 'Company',
      entityId: company._id,
      project: company.project,
      activityType: 'company_tag_added',
      description: `Tag "${tag}" added to company "${company.name}"`,
      category: 'update',
      performedBy: performedBy._id,
      priority: 'low',
      metadata: {
        companyName: company.name,
        tag: tag
      }
    });
  }

  static async logCompanyTagRemoved(company, tag, performedBy) {
    return await Activity.logActivity({
      entityType: 'Company',
      entityId: company._id,
      project: company.project,
      activityType: 'company_tag_removed',
      description: `Tag "${tag}" removed from company "${company.name}"`,
      category: 'update',
      performedBy: performedBy._id,
      priority: 'low',
      metadata: {
        companyName: company.name,
        tag: tag
      }
    });
  }

  static async logCompanyCustomFieldAdded(company, key, value, performedBy) {
    return await Activity.logActivity({
      entityType: 'Company',
      entityId: company._id,
      project: company.project,
      activityType: 'company_custom_field_added',
      description: `Custom field "${key}" added to company "${company.name}"`,
      category: 'update',
      performedBy: performedBy._id,
      priority: 'low',
      metadata: {
        companyName: company.name,
        fieldKey: key,
        fieldValue: value
      }
    });
  }

  static async logCompanyCustomFieldRemoved(company, key, performedBy) {
    return await Activity.logActivity({
      entityType: 'Company',
      entityId: company._id,
      project: company.project,
      activityType: 'company_custom_field_removed',
      description: `Custom field "${key}" removed from company "${company.name}"`,
      category: 'update',
      performedBy: performedBy._id,
      priority: 'low',
      metadata: {
        companyName: company.name,
        fieldKey: key
      }
    });
  }

  static async logCompanyStatusChanged(company, oldStatus, newStatus, performedBy) {
    return await Activity.logActivity({
      entityType: 'Company',
      entityId: company._id,
      project: company.project,
      activityType: 'company_status_changed',
      description: `Company "${company.name}" status changed from "${oldStatus}" to "${newStatus}"`,
      category: 'status_change',
      performedBy: performedBy._id,
      priority: 'medium',
      changes: {
        field: 'status',
        oldValue: oldStatus,
        newValue: newStatus
      },
      metadata: {
        companyName: company.name
      }
    });
  }

  static async logCompanyArchived(company, performedBy) {
    return await Activity.logActivity({
      entityType: 'Company',
      entityId: company._id,
      project: company.project,
      activityType: 'company_archived',
      description: `Company "${company.name}" was archived`,
      category: 'status_change',
      performedBy: performedBy._id,
      priority: 'medium',
      metadata: {
        companyName: company.name,
        archivedBy: performedBy.name
      }
    });
  }

  static async logCompanyUnarchived(company, performedBy) {
    return await Activity.logActivity({
      entityType: 'Company',
      entityId: company._id,
      project: company.project,
      activityType: 'company_unarchived',
      description: `Company "${company.name}" was unarchived`,
      category: 'status_change',
      performedBy: performedBy._id,
      priority: 'medium',
      metadata: {
        companyName: company.name,
        unarchivedBy: performedBy.name
      }
    });
  }

  static async logCompanyAssigned(company, assignedTo, performedBy) {
    return await Activity.logActivity({
      entityType: 'Company',
      entityId: company._id,
      project: company.project,
      activityType: 'company_assigned',
      description: `Company "${company.name}" was assigned`,
      category: 'assignment',
      performedBy: performedBy._id,
      priority: 'medium',
      relatedEntity: {
        type: 'User',
        id: assignedTo._id || assignedTo
      },
      metadata: {
        companyName: company.name,
        assignedTo: assignedTo.name || assignedTo,
        assignedBy: performedBy.name
      }
    });
  }

  static async logCompanyUnassigned(company, performedBy) {
    return await Activity.logActivity({
      entityType: 'Company',
      entityId: company._id,
      project: company.project,
      activityType: 'company_unassigned',
      description: `Company "${company.name}" was unassigned`,
      category: 'assignment',
      performedBy: performedBy._id,
      priority: 'medium',
      metadata: {
        companyName: company.name,
        unassignedBy: performedBy.name
      }
    });
  }

  // Lead activity logging methods
  static async logLeadCreated(lead, performedBy) {
    return await Activity.logActivity({
      entityType: 'Lead',
      entityId: lead._id,
      project: lead.project,
      activityType: 'lead_created',
      description: `Lead "${lead.name}" was created`,
      category: 'creation',
      performedBy: performedBy._id,
      priority: 'high',
      metadata: {
        leadName: lead.name,
        email: lead.email,
        status: lead.status,
        source: lead.source
      }
    });
  }

  static async logLeadUpdated(lead, changes, performedBy) {
    const changeDescriptions = [];
    
    Object.keys(changes).forEach(field => {
      if (field === 'updatedAt' || field === 'updatedBy') return;
      
      const oldValue = changes[field].oldValue;
      const newValue = changes[field].newValue;
      
      if (oldValue !== newValue) {
        changeDescriptions.push(`${field} changed from "${oldValue}" to "${newValue}"`);
      }
    });

    if (changeDescriptions.length === 0) return null;

    return await Activity.logActivity({
      entityType: 'Lead',
      entityId: lead._id,
      project: lead.project,
      activityType: 'lead_updated',
      description: `Lead "${lead.name}" was updated: ${changeDescriptions.join(', ')}`,
      category: 'update',
      performedBy: performedBy._id,
      priority: 'medium',
      changes: {
        field: Object.keys(changes).join(', '),
        oldValue: Object.values(changes).map(c => c.oldValue),
        newValue: Object.values(changes).map(c => c.newValue)
      },
      metadata: {
        leadName: lead.name,
        fieldsChanged: Object.keys(changes).filter(f => f !== 'updatedAt' && f !== 'updatedBy')
      }
    });
  }

  static async logLeadArchived(lead, performedBy) {
    return await Activity.logActivity({
      entityType: 'Lead',
      entityId: lead._id,
      project: lead.project,
      activityType: 'lead_archived',
      description: `Lead "${lead.name}" was archived`,
      category: 'status_change',
      performedBy: performedBy._id,
      priority: 'medium',
      metadata: {
        leadName: lead.name,
        previousStatus: lead.status
      }
    });
  }

  static async logLeadUnarchived(lead, performedBy) {
    return await Activity.logActivity({
      entityType: 'Lead',
      entityId: lead._id,
      project: lead.project,
      activityType: 'lead_unarchived',
      description: `Lead "${lead.name}" was unarchived`,
      category: 'status_change',
      performedBy: performedBy._id,
      priority: 'medium',
      metadata: {
        leadName: lead.name
      }
    });
  }

  static async logLeadDeleted(lead, performedBy) {
    return await Activity.logActivity({
      entityType: 'Lead',
      entityId: lead._id,
      project: lead.project,
      activityType: 'lead_deleted',
      description: `Lead "${lead.name}" was deleted`,
      category: 'deletion',
      performedBy: performedBy._id,
      priority: 'critical',
      metadata: {
        leadName: lead.name,
        email: lead.email
      }
    });
  }

  static async logLeadNoteAdded(lead, note, performedBy) {
    return await Activity.logActivity({
      entityType: 'Lead',
      entityId: lead._id,
      project: lead.project,
      activityType: 'lead_note_added',
      description: `Note added to lead "${lead.name}"`,
      category: 'interaction',
      performedBy: performedBy._id,
      priority: 'medium',
      metadata: {
        leadName: lead.name,
        noteContent: note.content.substring(0, 100) + (note.content.length > 100 ? '...' : ''),
        noteId: note._id
      }
    });
  }

  static async logLeadNoteUpdated(lead, note, performedBy) {
    return await Activity.logActivity({
      entityType: 'Lead',
      entityId: lead._id,
      project: lead.project,
      activityType: 'lead_note_updated',
      description: `Note updated for lead "${lead.name}"`,
      category: 'interaction',
      performedBy: performedBy._id,
      priority: 'low',
      metadata: {
        leadName: lead.name,
        noteId: note._id
      }
    });
  }

  static async logLeadNoteDeleted(lead, noteId, performedBy) {
    return await Activity.logActivity({
      entityType: 'Lead',
      entityId: lead._id,
      project: lead.project,
      activityType: 'lead_note_deleted',
      description: `Note deleted from lead "${lead.name}"`,
      category: 'interaction',
      performedBy: performedBy._id,
      priority: 'low',
      metadata: {
        leadName: lead.name,
        noteId: noteId
      }
    });
  }

  static async logLeadStatusChanged(lead, oldStatus, newStatus, performedBy) {
    return await Activity.logActivity({
      entityType: 'Lead',
      entityId: lead._id,
      project: lead.project,
      activityType: 'lead_status_changed',
      description: `Lead "${lead.name}" status changed from "${oldStatus}" to "${newStatus}"`,
      category: 'status_change',
      performedBy: performedBy._id,
      priority: 'medium',
      changes: {
        field: 'status',
        oldValue: oldStatus,
        newValue: newStatus
      },
      metadata: {
        leadName: lead.name
      }
    });
  }

  static async logLeadAssigned(lead, assignedTo, performedBy) {
    return await Activity.logActivity({
      entityType: 'Lead',
      entityId: lead._id,
      project: lead.project,
      activityType: 'lead_assigned',
      description: `Lead "${lead.name}" was assigned to a team member`,
      category: 'assignment',
      performedBy: performedBy._id,
      priority: 'medium',
      relatedEntity: {
        type: 'User',
        id: assignedTo
      },
      metadata: {
        leadName: lead.name
      }
    });
  }

  static async logLeadUnassigned(lead, performedBy) {
    return await Activity.logActivity({
      entityType: 'Lead',
      entityId: lead._id,
      project: lead.project,
      activityType: 'lead_unassigned',
      description: `Lead "${lead.name}" was unassigned`,
      category: 'assignment',
      performedBy: performedBy._id,
      priority: 'medium',
      metadata: {
        leadName: lead.name
      }
    });
  }

  static async logLeadConverted(lead, customer, performedBy) {
    return await Activity.logActivity({
      entityType: 'Lead',
      entityId: lead._id,
      project: lead.project,
      activityType: 'lead_converted',
      description: `Lead "${lead.name}" was converted to customer`,
      category: 'conversion',
      performedBy: performedBy._id,
      priority: 'high',
      relatedEntity: {
        type: 'Customer',
        id: customer._id
      },
      metadata: {
        leadName: lead.name,
        customerName: customer.name,
        customerId: customer._id
      }
    });
  }

  static async logLeadScoreUpdated(lead, oldScore, newScore, performedBy) {
    return await Activity.logActivity({
      entityType: 'Lead',
      entityId: lead._id,
      project: lead.project,
      activityType: 'lead_score_updated',
      description: `Lead "${lead.name}" score updated from ${oldScore} to ${newScore}`,
      category: 'update',
      performedBy: performedBy._id,
      priority: 'low',
      changes: {
        field: 'score',
        oldValue: oldScore,
        newValue: newScore
      },
      metadata: {
        leadName: lead.name
      }
    });
  }

  static async logLeadSourceUpdated(lead, oldSource, newSource, performedBy) {
    return await Activity.logActivity({
      entityType: 'Lead',
      entityId: lead._id,
      project: lead.project,
      activityType: 'lead_source_updated',
      description: `Lead "${lead.name}" source updated from "${oldSource}" to "${newSource}"`,
      category: 'update',
      performedBy: performedBy._id,
      priority: 'low',
      changes: {
        field: 'source',
        oldValue: oldSource,
        newValue: newSource
      },
      metadata: {
        leadName: lead.name
      }
    });
  }

  static async logLeadCompanyLinked(lead, company, performedBy) {
    return await Activity.logActivity({
      entityType: 'Lead',
      entityId: lead._id,
      project: lead.project,
      activityType: 'lead_company_linked',
      description: `Lead "${lead.name}" was linked to company "${company.name}"`,
      category: 'update',
      performedBy: performedBy._id,
      priority: 'medium',
      relatedEntity: {
        type: 'Company',
        id: company._id
      },
      metadata: {
        leadName: lead.name,
        companyName: company.name,
        companyId: company._id
      }
    });
  }

  static async logLeadCompanyUnlinked(lead, companyName, performedBy) {
    return await Activity.logActivity({
      entityType: 'Lead',
      entityId: lead._id,
      project: lead.project,
      activityType: 'lead_company_unlinked',
      description: `Lead "${lead.name}" was unlinked from company "${companyName}"`,
      category: 'update',
      performedBy: performedBy._id,
      priority: 'medium',
      metadata: {
        leadName: lead.name,
        companyName: companyName
      }
    });
  }

  // Customer Activities
  static async logCustomerCreated(customer, performedBy) {
    return await Activity.logActivity({
      entityType: 'Customer',
      entityId: customer._id,
      project: customer.project,
      activityType: 'customer_created',
      description: `Customer "${customer.fullName}" was created`,
      category: 'creation',
      performedBy: performedBy._id,
      priority: 'high',
      metadata: {
        customerName: customer.fullName,
        customerId: customer._id,
        createdBy: performedBy.name
      }
    });
  }

  static async logCustomerUpdated(customer, changes, performedBy) {
    const changedFields = Object.keys(changes).map(key => {
      const oldValue = changes[key].oldValue instanceof mongoose.Types.ObjectId ? changes[key].oldValue.toString() : changes[key].oldValue;
      const newValue = changes[key].newValue instanceof mongoose.Types.ObjectId ? changes[key].newValue.toString() : changes[key].newValue;
      return `${key} from "${oldValue}" to "${newValue}"`;
    }).join(', ');

    return await Activity.logActivity({
      entityType: 'Customer',
      entityId: customer._id,
      project: customer.project,
      activityType: 'customer_updated',
      description: `Customer "${customer.fullName}" was updated. Changes: ${changedFields}`,
      category: 'update',
      performedBy: performedBy._id,
      priority: 'medium',
      metadata: {
        customerName: customer.fullName,
        customerId: customer._id,
        updatedBy: performedBy.name,
        changes: changes
      }
    });
  }

  static async logCustomerArchived(customer, performedBy) {
    return await Activity.logActivity({
      entityType: 'Customer',
      entityId: customer._id,
      project: customer.project,
      activityType: 'customer_archived',
      description: `Customer "${customer.fullName}" was archived`,
      category: 'status_change',
      performedBy: performedBy._id,
      priority: 'medium',
      metadata: {
        customerName: customer.fullName,
        customerId: customer._id,
        archivedBy: performedBy.name
      }
    });
  }

  static async logCustomerUnarchived(customer, performedBy) {
    return await Activity.logActivity({
      entityType: 'Customer',
      entityId: customer._id,
      project: customer.project,
      activityType: 'customer_unarchived',
      description: `Customer "${customer.fullName}" was unarchived`,
      category: 'status_change',
      performedBy: performedBy._id,
      priority: 'medium',
      metadata: {
        customerName: customer.fullName,
        customerId: customer._id,
        unarchivedBy: performedBy.name
      }
    });
  }

  static async logCustomerDeleted(customer, performedBy) {
    return await Activity.logActivity({
      entityType: 'Customer',
      entityId: customer._id,
      project: customer.project,
      activityType: 'customer_deleted',
      description: `Customer "${customer.fullName}" was deleted`,
      category: 'deletion',
      performedBy: performedBy._id,
      priority: 'critical',
      metadata: {
        customerName: customer.fullName,
        customerId: customer._id,
        deletedBy: performedBy.name
      }
    });
  }

  static async logCustomerNoteAdded(customer, note, performedBy) {
    return await Activity.logActivity({
      entityType: 'Customer',
      entityId: customer._id,
      project: customer.project,
      activityType: 'customer_note_added',
      description: `Note added to customer "${customer.fullName}": "${note.content.substring(0, 50)}..."`,
      category: 'interaction',
      performedBy: performedBy._id,
      priority: 'low',
      metadata: {
        customerName: customer.fullName,
        customerId: customer._id,
        noteId: note._id,
        noteContent: note.content,
        addedBy: performedBy.name
      }
    });
  }

  static async logCustomerInteractionAdded(customer, interaction, performedBy) {
    return await Activity.logActivity({
      entityType: 'Customer',
      entityId: customer._id,
      project: customer.project,
      activityType: 'customer_interaction_added',
      description: `Interaction "${interaction.title}" was added to customer "${customer.fullName}"`,
      category: 'interaction',
      performedBy: performedBy._id,
      priority: 'low',
      metadata: {
        customerName: customer.fullName,
        customerId: customer._id,
        interactionId: interaction._id,
        interactionType: interaction.type,
        addedBy: performedBy.name
      }
    });
  }

  static async logCustomerNoteUpdated(customer, note, performedBy) {
    return await Activity.logActivity({
      entityType: 'Customer',
      entityId: customer._id,
      project: customer.project,
      activityType: 'customer_note_updated',
      description: `Note on customer "${customer.fullName}" was updated`,
      category: 'interaction',
      performedBy: performedBy._id,
      priority: 'low',
      metadata: {
        customerName: customer.fullName,
        customerId: customer._id,
        noteId: note._id,
        updatedBy: performedBy.name
      }
    });
  }

  static async logCustomerNoteDeleted(customer, noteId, performedBy) {
    return await Activity.logActivity({
      entityType: 'Customer',
      entityId: customer._id,
      project: customer.project,
      activityType: 'customer_note_deleted',
      description: `Note on customer "${customer.fullName}" was deleted`,
      category: 'interaction',
      performedBy: performedBy._id,
      priority: 'low',
      metadata: {
        customerName: customer.fullName,
        customerId: customer._id,
        noteId: noteId,
        deletedBy: performedBy.name
      }
    });
  }

  static async logCustomerInteractionUpdated(customer, interaction, performedBy) {
    return await Activity.logActivity({
      entityType: 'Customer',
      entityId: customer._id,
      project: customer.project,
      activityType: 'customer_interaction_updated',
      description: `Interaction "${interaction.title}" on customer "${customer.fullName}" was updated`,
      category: 'interaction',
      performedBy: performedBy._id,
      priority: 'low',
      metadata: {
        customerName: customer.fullName,
        customerId: customer._id,
        interactionId: interaction._id,
        updatedBy: performedBy.name
      }
    });
  }

  static async logCustomerInteractionDeleted(customer, interactionId, performedBy) {
    return await Activity.logActivity({
      entityType: 'Customer',
      entityId: customer._id,
      project: customer.project,
      activityType: 'customer_interaction_deleted',
      description: `Interaction on customer "${customer.fullName}" was deleted`,
      category: 'interaction',
      performedBy: performedBy._id,
      priority: 'low',
      metadata: {
        customerName: customer.fullName,
        customerId: customer._id,
        interactionId: interactionId,
        deletedBy: performedBy.name
      }
    });
  }

  static async logCustomerStageChanged(customer, oldStage, newStage, performedBy) {
    return await Activity.logActivity({
      entityType: 'Customer',
      entityId: customer._id,
      project: customer.project,
      activityType: 'customer_stage_changed',
      description: `Customer "${customer.fullName}" stage changed from "${oldStage}" to "${newStage}"`,
      category: 'status_change',
      performedBy: performedBy._id,
      priority: 'medium',
      metadata: {
        customerName: customer.fullName,
        customerId: customer._id,
        oldStage,
        newStage,
        changedBy: performedBy.name
      }
    });
  }

  static async logCustomerConvertedFromLead(customer, lead, performedBy) {
    return await Activity.logActivity({
      entityType: 'Customer',
      entityId: customer._id,
      project: customer.project,
      activityType: 'customer_converted_from_lead',
      description: `Customer "${customer.fullName}" was converted from lead "${lead.name}"`,
      category: 'conversion',
      performedBy: performedBy._id,
      priority: 'high',
      metadata: {
        customerName: customer.fullName,
        customerId: customer._id,
        leadName: lead.name,
        leadId: lead._id,
        convertedBy: performedBy.name
      }
    });
  }

  // Deal Activities
  static async logDealCreated(deal, performedBy) {
    return await Activity.logActivity({
      entityType: 'Deal',
      entityId: deal._id,
      project: deal.projectId,
      activityType: 'deal_created',
      description: `Deal "${deal.name}" was created with value ${deal.value} ${deal.currency}`,
      category: 'creation',
      performedBy: performedBy._id,
      priority: 'high',
      metadata: {
        dealName: deal.name,
        dealId: deal._id,
        dealValue: deal.value,
        currency: deal.currency,
        createdBy: performedBy.name
      }
    });
  }

  static async logDealUpdated(deal, changes, performedBy) {
    const changedFields = Object.keys(changes).map(key => {
      const oldValue = changes[key].oldValue instanceof mongoose.Types.ObjectId ? changes[key].oldValue.toString() : changes[key].oldValue;
      const newValue = changes[key].newValue instanceof mongoose.Types.ObjectId ? changes[key].newValue.toString() : changes[key].newValue;
      return `${key} from "${oldValue}" to "${newValue}"`;
    }).join(', ');

    return await Activity.logActivity({
      entityType: 'Deal',
      entityId: deal._id,
      project: deal.projectId,
      activityType: 'deal_updated',
      description: `Deal "${deal.name}" was updated. Changes: ${changedFields}`,
      category: 'update',
      performedBy: performedBy._id,
      priority: 'medium',
      metadata: {
        dealName: deal.name,
        dealId: deal._id,
        updatedBy: performedBy.name,
        changes: changes
      }
    });
  }

  static async logDealArchived(deal, performedBy) {
    return await Activity.logActivity({
      entityType: 'Deal',
      entityId: deal._id,
      project: deal.projectId,
      activityType: 'deal_archived',
      description: `Deal "${deal.name}" was archived`,
      category: 'status_change',
      performedBy: performedBy._id,
      priority: 'medium',
      metadata: {
        dealName: deal.name,
        dealId: deal._id,
        archivedBy: performedBy.name
      }
    });
  }

  static async logDealRestored(deal, performedBy) {
    return await Activity.logActivity({
      entityType: 'Deal',
      entityId: deal._id,
      project: deal.projectId,
      activityType: 'deal_restored',
      description: `Deal "${deal.name}" was restored`,
      category: 'status_change',
      performedBy: performedBy._id,
      priority: 'medium',
      metadata: {
        dealName: deal.name,
        dealId: deal._id,
        restoredBy: performedBy.name
      }
    });
  }

  static async logDealDeleted(deal, performedBy) {
    return await Activity.logActivity({
      entityType: 'Deal',
      entityId: deal._id,
      project: deal.projectId,
      activityType: 'deal_deleted',
      description: `Deal "${deal.name}" was deleted`,
      category: 'deletion',
      performedBy: performedBy._id,
      priority: 'critical',
      metadata: {
        dealName: deal.name,
        dealId: deal._id,
        deletedBy: performedBy.name
      }
    });
  }

  static async logDealStatusChanged(deal, oldStatus, newStatus, performedBy) {
    return await Activity.logActivity({
      entityType: 'Deal',
      entityId: deal._id,
      project: deal.projectId,
      activityType: 'deal_status_changed',
      description: `Deal "${deal.name}" status changed from "${oldStatus}" to "${newStatus}"`,
      category: 'status_change',
      performedBy: performedBy._id,
      priority: 'high',
      metadata: {
        dealName: deal.name,
        dealId: deal._id,
        oldStatus,
        newStatus,
        changedBy: performedBy.name
      }
    });
  }

  static async logDealValueChanged(deal, oldValue, newValue, performedBy) {
    return await Activity.logActivity({
      entityType: 'Deal',
      entityId: deal._id,
      project: deal.projectId,
      activityType: 'deal_value_changed',
      description: `Deal "${deal.name}" value changed from ${oldValue} to ${newValue} ${deal.currency}`,
      category: 'update',
      performedBy: performedBy._id,
      priority: 'medium',
      metadata: {
        dealName: deal.name,
        dealId: deal._id,
        oldValue,
        newValue,
        currency: deal.currency,
        changedBy: performedBy.name
      }
    });
  }

  static async logDealNoteAdded(deal, note, performedBy) {
    return await Activity.logActivity({
      entityType: 'Deal',
      entityId: deal._id,
      project: deal.projectId,
      activityType: 'deal_note_added',
      description: `Note added to deal "${deal.name}": "${note.content.substring(0, 50)}..."`,
      category: 'interaction',
      performedBy: performedBy._id,
      priority: 'low',
      metadata: {
        dealName: deal.name,
        dealId: deal._id,
        noteId: note._id,
        noteContent: note.content,
        addedBy: performedBy.name
      }
    });
  }

  static async logDealActivityAdded(deal, activity, performedBy) {
    return await Activity.logActivity({
      entityType: 'Deal',
      entityId: deal._id,
      project: deal.projectId,
      activityType: 'deal_activity_added',
      description: `Activity "${activity.description}" was added to deal "${deal.name}"`,
      category: 'interaction',
      performedBy: performedBy._id,
      priority: 'low',
      metadata: {
        dealName: deal.name,
        dealId: deal._id,
        activityId: activity._id,
        activityType: activity.type,
        addedBy: performedBy.name
      }
    });
  }

  static async logDealAssigned(deal, assignedToUser, performedBy) {
    return await Activity.logActivity({
      entityType: 'Deal',
      entityId: deal._id,
      project: deal.projectId,
      activityType: 'deal_assigned',
      description: `Deal "${deal.name}" was assigned to "${assignedToUser.name || assignedToUser}"`,
      category: 'assignment',
      performedBy: performedBy._id,
      priority: 'medium',
      metadata: {
        dealName: deal.name,
        dealId: deal._id,
        assignedTo: assignedToUser.name || assignedToUser,
        assignedBy: performedBy.name
      }
    });
  }

  static async logDealUnassigned(deal, performedBy) {
    return await Activity.logActivity({
      entityType: 'Deal',
      entityId: deal._id,
      project: deal.projectId,
      activityType: 'deal_unassigned',
      description: `Deal "${deal.name}" was unassigned`,
      category: 'assignment',
      performedBy: performedBy._id,
      priority: 'medium',
      metadata: {
        dealName: deal.name,
        dealId: deal._id,
        unassignedBy: performedBy.name
      }
    });
  }

  static async logDealProductAdded(deal, product, performedBy) {
    return await Activity.logActivity({
      entityType: 'Deal',
      entityId: deal._id,
      project: deal.projectId,
      activityType: 'deal_product_added',
      description: `Product "${product.name}" added to deal "${deal.name}"`,
      category: 'update',
      performedBy: performedBy._id,
      priority: 'medium',
      metadata: {
        dealName: deal.name,
        dealId: deal._id,
        productName: product.name,
        productId: product._id || product,
        addedBy: performedBy.name
      }
    });
  }

  static async logDealProductRemoved(deal, product, performedBy) {
    return await Activity.logActivity({
      entityType: 'Deal',
      entityId: deal._id,
      project: deal.projectId,
      activityType: 'deal_product_removed',
      description: `Product removed from deal "${deal.name}"`,
      category: 'update',
      performedBy: performedBy._id,
      priority: 'medium',
      metadata: {
        dealName: deal.name,
        dealId: deal._id,
        productName: product.name,
        removedBy: performedBy.name
      }
    });
  }

  static async logDealProductUpdated(deal, product, changes, performedBy) {
    return await Activity.logActivity({
      entityType: 'Deal',
      entityId: deal._id,
      project: deal.projectId,
      activityType: 'deal_product_updated',
      description: `Product "${product.name}" updated in deal "${deal.name}"`,
      category: 'update',
      performedBy: performedBy._id,
      priority: 'low',
      metadata: {
        dealName: deal.name,
        dealId: deal._id,
        productId: product._id || product,
        productName: product.name,
        changes,
        updatedBy: performedBy.name
      }
    });
  }

  static async logDealNoteUpdated(deal, note, performedBy) {
    return await Activity.logActivity({
      entityType: 'Deal',
      entityId: deal._id,
      project: deal.projectId,
      activityType: 'deal_note_updated',
      description: `Note updated on deal "${deal.name}"`,
      category: 'interaction',
      performedBy: performedBy._id,
      priority: 'low',
      metadata: {
        dealName: deal.name,
        dealId: deal._id,
        noteId: note._id || note,
        updatedBy: performedBy.name
      }
    });
  }

  static async logDealNoteDeleted(deal, noteId, performedBy) {
    return await Activity.logActivity({
      entityType: 'Deal',
      entityId: deal._id,
      project: deal.projectId,
      activityType: 'deal_note_deleted',
      description: `Note deleted from deal "${deal.name}"`,
      category: 'interaction',
      performedBy: performedBy._id,
      priority: 'low',
      metadata: {
        dealName: deal.name,
        dealId: deal._id,
        noteId: noteId,
        deletedBy: performedBy.name
      }
    });
  }

  static async logDealActivityUpdated(deal, activity, performedBy) {
    return await Activity.logActivity({
      entityType: 'Deal',
      entityId: deal._id,
      project: deal.projectId,
      activityType: 'deal_activity_updated',
      description: `Activity updated on deal "${deal.name}"`,
      category: 'interaction',
      performedBy: performedBy._id,
      priority: 'low',
      metadata: {
        dealName: deal.name,
        dealId: deal._id,
        activityId: activity._id || activity,
        updatedBy: performedBy.name
      }
    });
  }

  static async logDealActivityDeleted(deal, activityId, performedBy) {
    return await Activity.logActivity({
      entityType: 'Deal',
      entityId: deal._id,
      project: deal.projectId,
      activityType: 'deal_activity_deleted',
      description: `Activity deleted from deal "${deal.name}"`,
      category: 'interaction',
      performedBy: performedBy._id,
      priority: 'low',
      metadata: {
        dealName: deal.name,
        dealId: deal._id,
        activityId: activityId,
        deletedBy: performedBy.name
      }
    });
  }

  static async logDealStageChanged(deal, oldStage, newStage, performedBy) {
    return await Activity.logActivity({
      entityType: 'Deal',
      entityId: deal._id,
      project: deal.projectId,
      activityType: 'deal_stage_changed',
      description: `Deal "${deal.name}" stage changed from "${oldStage}" to "${newStage}"`,
      category: 'status_change',
      performedBy: performedBy._id,
      priority: 'high',
      changes: {
        field: 'stage',
        oldValue: oldStage,
        newValue: newStage
      },
      metadata: {
        dealName: deal.name,
        dealId: deal._id,
        changedBy: performedBy.name
      }
    });
  }

  static async logDealWon(deal, performedBy) {
    return await Activity.logActivity({
      entityType: 'Deal',
      entityId: deal._id,
      project: deal.projectId,
      activityType: 'deal_won',
      description: `Deal "${deal.name}" was won!`,
      category: 'status_change',
      performedBy: performedBy._id,
      priority: 'critical',
      changes: {
        field: 'status',
        oldValue: deal.status,
        newValue: 'won'
      },
      metadata: {
        dealName: deal.name,
        dealId: deal._id,
        dealValue: deal.value,
        wonBy: performedBy.name
      }
    });
  }

  static async logDealLost(deal, performedBy) {
    return await Activity.logActivity({
      entityType: 'Deal',
      entityId: deal._id,
      project: deal.projectId,
      activityType: 'deal_lost',
      description: `Deal "${deal.name}" was marked as lost`,
      category: 'status_change',
      performedBy: performedBy._id,
      priority: 'high',
      changes: {
        field: 'status',
        oldValue: deal.status,
        newValue: 'lost'
      },
      metadata: {
        dealName: deal.name,
        dealId: deal._id,
        lostBy: performedBy.name
      }
    });
  }

  static async logDealTagsChanged(deal, oldTags, newTags, performedBy) {
    return await Activity.logActivity({
      entityType: 'Deal',
      entityId: deal._id,
      project: deal.projectId,
      activityType: 'deal_tags_changed',
      description: `Deal "${deal.name}" tags changed`,
      category: 'update',
      performedBy: performedBy._id,
      priority: 'low',
      changes: {
        field: 'tags',
        oldValue: oldTags,
        newValue: newTags
      },
      metadata: {
        dealName: deal.name,
        dealId: deal._id,
        changedBy: performedBy.name
      }
    });
  }

  static async logDealCustomFieldAdded(deal, key, value, performedBy) {
    return await Activity.logActivity({
      entityType: 'Deal',
      entityId: deal._id,
      project: deal.projectId,
      activityType: 'deal_custom_field_added',
      description: `Custom field "${key}" added to deal "${deal.name}"`,
      category: 'update',
      performedBy: performedBy._id,
      priority: 'low',
      metadata: {
        dealName: deal.name,
        dealId: deal._id,
        fieldKey: key,
        fieldValue: value,
        addedBy: performedBy.name
      }
    });
  }

  static async logDealCustomFieldUpdated(deal, key, oldValue, newValue, performedBy) {
    return await Activity.logActivity({
      entityType: 'Deal',
      entityId: deal._id,
      project: deal.projectId,
      activityType: 'deal_custom_field_updated',
      description: `Custom field "${key}" updated on deal "${deal.name}"`,
      category: 'update',
      performedBy: performedBy._id,
      priority: 'low',
      changes: {
        field: key,
        oldValue,
        newValue
      },
      metadata: {
        dealName: deal.name,
        dealId: deal._id,
        fieldKey: key,
        updatedBy: performedBy.name
      }
    });
  }

  static async logDealCustomFieldRemoved(deal, key, performedBy) {
    return await Activity.logActivity({
      entityType: 'Deal',
      entityId: deal._id,
      project: deal.projectId,
      activityType: 'deal_custom_field_removed',
      description: `Custom field "${key}" removed from deal "${deal.name}"`,
      category: 'update',
      performedBy: performedBy._id,
      priority: 'low',
      metadata: {
        dealName: deal.name,
        dealId: deal._id,
        fieldKey: key,
        removedBy: performedBy.name
      }
    });
  }

  // Task Activities
  static async logTaskCreated(task, performedBy) {
    return await Activity.logActivity({
      entityType: 'Task',
      entityId: task._id,
      project: task.project,
      activityType: 'task_created',
      description: `Task "${task.title}" was created`,
      category: 'creation',
      performedBy: performedBy._id || performedBy,
      priority: 'high',
      metadata: {
        taskTitle: task.title,
        taskId: task._id,
        status: task.status,
        priority: task.priority,
        assignedTo: task.assignedTo
      }
    });
  }

  static async logTaskUpdated(task, changes, performedBy) {
    const changeDescriptions = [];
    
    Object.keys(changes).forEach(field => {
      if (field === 'updatedAt' || field === 'updatedBy') return;
      
      const oldValue = changes[field].oldValue instanceof mongoose.Types.ObjectId ? changes[field].oldValue.toString() : changes[field].oldValue;
      const newValue = changes[field].newValue instanceof mongoose.Types.ObjectId ? changes[field].newValue.toString() : changes[field].newValue;
      
      if (oldValue !== newValue) {
        changeDescriptions.push(`${field} changed from "${oldValue}" to "${newValue}"`);
      }
    });

    if (changeDescriptions.length === 0) return null;

    return await Activity.logActivity({
      entityType: 'Task',
      entityId: task._id,
      project: task.project,
      activityType: 'task_updated',
      description: `Task "${task.title}" was updated: ${changeDescriptions.join(', ')}`,
      category: 'update',
      performedBy: performedBy._id || performedBy,
      priority: 'medium',
      changes: {
        field: Object.keys(changes).join(', '),
        oldValue: Object.values(changes).map(c => c.oldValue),
        newValue: Object.values(changes).map(c => c.newValue)
      },
      metadata: {
        taskTitle: task.title,
        taskId: task._id,
        fieldsChanged: Object.keys(changes).filter(f => f !== 'updatedAt' && f !== 'updatedBy')
      }
    });
  }

  static async logTaskCompleted(task, performedBy) {
    return await Activity.logActivity({
      entityType: 'Task',
      entityId: task._id,
      project: task.project,
      activityType: 'task_completed',
      description: `Task "${task.title}" was completed`,
      category: 'status_change',
      performedBy: performedBy._id || performedBy,
      priority: 'high',
      changes: {
        field: 'status',
        oldValue: 'in_progress',
        newValue: 'completed'
      },
      metadata: {
        taskTitle: task.title,
        taskId: task._id,
        completedBy: performedBy.name || performedBy
      }
    });
  }

  static async logTaskAssigned(task, assignedToUser, performedBy) {
    return await Activity.logActivity({
      entityType: 'Task',
      entityId: task._id,
      project: task.project,
      activityType: 'task_assigned',
      description: `Task "${task.title}" was assigned to "${assignedToUser?.name || assignedToUser}"`,
      category: 'assignment',
      performedBy: performedBy._id || performedBy,
      priority: 'medium',
      relatedEntity: {
        type: 'User',
        id: assignedToUser._id || assignedToUser
      },
      metadata: {
        taskTitle: task.title,
        taskId: task._id,
        assignedTo: assignedToUser?.name || assignedToUser,
        assignedBy: performedBy.name || performedBy
      }
    });
  }

  static async logTaskUnassigned(task, performedBy) {
    return await Activity.logActivity({
      entityType: 'Task',
      entityId: task._id,
      project: task.project,
      activityType: 'task_unassigned',
      description: `Task "${task.title}" was unassigned`,
      category: 'assignment',
      performedBy: performedBy._id || performedBy,
      priority: 'medium',
      metadata: {
        taskTitle: task.title,
        taskId: task._id,
        unassignedBy: performedBy.name || performedBy
      }
    });
  }

  static async logTaskCommentAdded(task, comment, performedBy) {
    return await Activity.logActivity({
      entityType: 'Task',
      entityId: task._id,
      project: task.project,
      activityType: 'task_comment_added',
      description: `Comment added to task "${task.title}"`,
      category: 'interaction',
      performedBy: performedBy._id || performedBy,
      priority: 'medium',
      metadata: {
        taskTitle: task.title,
        taskId: task._id,
        commentId: comment._id || comment,
        commentContent: comment.content ? comment.content.substring(0, 100) + (comment.content.length > 100 ? '...' : '') : '',
        addedBy: performedBy.name || performedBy
      }
    });
  }

  static async logTaskCommentUpdated(task, commentId, performedBy) {
    return await Activity.logActivity({
      entityType: 'Task',
      entityId: task._id,
      project: task.project,
      activityType: 'task_comment_updated',
      description: `Comment updated on task "${task.title}"`,
      category: 'interaction',
      performedBy: performedBy._id || performedBy,
      priority: 'low',
      metadata: {
        taskTitle: task.title,
        taskId: task._id,
        commentId: commentId,
        updatedBy: performedBy.name || performedBy
      }
    });
  }

  static async logTaskCommentDeleted(task, commentId, performedBy) {
    return await Activity.logActivity({
      entityType: 'Task',
      entityId: task._id,
      project: task.project,
      activityType: 'task_comment_deleted',
      description: `Comment deleted from task "${task.title}"`,
      category: 'interaction',
      performedBy: performedBy._id || performedBy,
      priority: 'low',
      metadata: {
        taskTitle: task.title,
        taskId: task._id,
        commentId: commentId,
        deletedBy: performedBy.name || performedBy
      }
    });
  }

  static async logTaskSubtaskAdded(task, subtask, performedBy) {
    return await Activity.logActivity({
      entityType: 'Task',
      entityId: task._id,
      project: task.project,
      activityType: 'task_subtask_added',
      description: `Subtask "${subtask.title}" added to task "${task.title}"`,
      category: 'update',
      performedBy: performedBy._id || performedBy,
      priority: 'medium',
      metadata: {
        taskTitle: task.title,
        taskId: task._id,
        subtaskId: subtask._id || subtask,
        subtaskTitle: subtask.title,
        addedBy: performedBy.name || performedBy
      }
    });
  }

  static async logTaskSubtaskUpdated(task, subtask, performedBy) {
    return await Activity.logActivity({
      entityType: 'Task',
      entityId: task._id,
      project: task.project,
      activityType: 'task_subtask_updated',
      description: `Subtask "${subtask.title}" updated on task "${task.title}"`,
      category: 'update',
      performedBy: performedBy._id || performedBy,
      priority: 'low',
      metadata: {
        taskTitle: task.title,
        taskId: task._id,
        subtaskId: subtask._id || subtask,
        subtaskTitle: subtask.title,
        updatedBy: performedBy.name || performedBy
      }
    });
  }

  static async logTaskSubtaskDeleted(task, subtaskId, performedBy) {
    return await Activity.logActivity({
      entityType: 'Task',
      entityId: task._id,
      project: task.project,
      activityType: 'task_subtask_deleted',
      description: `Subtask deleted from task "${task.title}"`,
      category: 'update',
      performedBy: performedBy._id || performedBy,
      priority: 'low',
      metadata: {
        taskTitle: task.title,
        taskId: task._id,
        subtaskId: subtaskId,
        deletedBy: performedBy.name || performedBy
      }
    });
  }

  static async logTaskCustomFieldAdded(task, key, value, performedBy) {
    return await Activity.logActivity({
      entityType: 'Task',
      entityId: task._id,
      project: task.project,
      activityType: 'task_custom_field_added',
      description: `Custom field "${key}" added to task "${task.title}"`,
      category: 'update',
      performedBy: performedBy._id || performedBy,
      priority: 'low',
      metadata: {
        taskTitle: task.title,
        taskId: task._id,
        fieldKey: key,
        fieldValue: value,
        addedBy: performedBy.name || performedBy
      }
    });
  }

  static async logTaskCustomFieldUpdated(task, key, oldValue, newValue, performedBy) {
    return await Activity.logActivity({
      entityType: 'Task',
      entityId: task._id,
      project: task.project,
      activityType: 'task_custom_field_updated',
      description: `Custom field "${key}" updated on task "${task.title}"`,
      category: 'update',
      performedBy: performedBy._id || performedBy,
      priority: 'low',
      changes: {
        field: key,
        oldValue: oldValue,
        newValue: newValue
      },
      metadata: {
        taskTitle: task.title,
        taskId: task._id,
        fieldKey: key,
        updatedBy: performedBy.name || performedBy
      }
    });
  }

  static async logTaskCustomFieldDeleted(task, key, performedBy) {
    return await Activity.logActivity({
      entityType: 'Task',
      entityId: task._id,
      project: task.project,
      activityType: 'task_custom_field_deleted',
      description: `Custom field "${key}" deleted from task "${task.title}"`,
      category: 'update',
      performedBy: performedBy._id || performedBy,
      priority: 'low',
      metadata: {
        taskTitle: task.title,
        taskId: task._id,
        fieldKey: key,
        deletedBy: performedBy.name || performedBy
      }
    });
  }

  static async logTaskArchived(task, performedBy) {
    return await Activity.logActivity({
      entityType: 'Task',
      entityId: task._id,
      project: task.project,
      activityType: 'task_archived',
      description: `Task "${task.title}" was archived`,
      category: 'status_change',
      performedBy: performedBy._id || performedBy,
      priority: 'medium',
      metadata: {
        taskTitle: task.title,
        taskId: task._id,
        archivedBy: performedBy.name || performedBy
      }
    });
  }

  static async logTaskRestored(task, performedBy) {
    return await Activity.logActivity({
      entityType: 'Task',
      entityId: task._id,
      project: task.project,
      activityType: 'task_restored',
      description: `Task "${task.title}" was restored from archive`,
      category: 'status_change',
      performedBy: performedBy._id || performedBy,
      priority: 'medium',
      metadata: {
        taskTitle: task.title,
        taskId: task._id,
        restoredBy: performedBy.name || performedBy
      }
    });
  }

  static async logTaskDeleted(task, performedBy) {
    return await Activity.logActivity({
      entityType: 'Task',
      entityId: task._id,
      project: task.project,
      activityType: 'task_deleted',
      description: `Task "${task.title}" was deleted`,
      category: 'deletion',
      performedBy: performedBy._id || performedBy,
      priority: 'critical',
      metadata: {
        taskTitle: task.title,
        taskId: task._id,
        deletedBy: performedBy.name || performedBy
      }
    });
  }

  static async logTaskStatusChanged(task, oldStatus, newStatus, performedBy) {
    return await Activity.logActivity({
      entityType: 'Task',
      entityId: task._id,
      project: task.project,
      activityType: 'task_status_changed',
      description: `Task "${task.title}" status changed from "${oldStatus}" to "${newStatus}"`,
      category: 'status_change',
      performedBy: performedBy._id || performedBy,
      priority: 'medium',
      changes: {
        field: 'status',
        oldValue: oldStatus,
        newValue: newStatus
      },
      metadata: {
        taskTitle: task.title,
        taskId: task._id,
        oldStatus,
        newStatus,
        changedBy: performedBy.name || performedBy
      }
    });
  }

  static async logTaskReopened(task, performedBy) {
    return await Activity.logActivity({
      entityType: 'Task',
      entityId: task._id,
      project: task.project,
      activityType: 'task_reopened',
      description: `Task "${task.title}" was reopened`,
      category: 'status_change',
      performedBy: performedBy._id || performedBy,
      priority: 'medium',
      changes: {
        field: 'status',
        oldValue: 'completed',
        newValue: task.status
      },
      metadata: {
        taskTitle: task.title,
        taskId: task._id,
        reopenedBy: performedBy.name || performedBy
      }
    });
  }

  static async logTaskReassigned(task, oldAssignedTo, newAssignedTo, performedBy) {
    return await Activity.logActivity({
      entityType: 'Task',
      entityId: task._id,
      project: task.project,
      activityType: 'task_reassigned',
      description: `Task "${task.title}" was reassigned`,
      category: 'assignment',
      performedBy: performedBy._id || performedBy,
      priority: 'medium',
      changes: {
        field: 'assignedTo',
        oldValue: oldAssignedTo?.name || oldAssignedTo || 'Unassigned',
        newValue: newAssignedTo?.name || newAssignedTo || 'Unassigned'
      },
      metadata: {
        taskTitle: task.title,
        taskId: task._id,
        oldAssignedTo: oldAssignedTo?.name || oldAssignedTo,
        newAssignedTo: newAssignedTo?.name || newAssignedTo,
        reassignedBy: performedBy.name || performedBy
      }
    });
  }

  static async logTaskPriorityChanged(task, oldPriority, newPriority, performedBy) {
    return await Activity.logActivity({
      entityType: 'Task',
      entityId: task._id,
      project: task.project,
      activityType: 'task_priority_changed',
      description: `Task "${task.title}" priority changed from "${oldPriority}" to "${newPriority}"`,
      category: 'update',
      performedBy: performedBy._id || performedBy,
      priority: 'medium',
      changes: {
        field: 'priority',
        oldValue: oldPriority,
        newValue: newPriority
      },
      metadata: {
        taskTitle: task.title,
        taskId: task._id,
        changedBy: performedBy.name || performedBy
      }
    });
  }

  static async logTaskDueDateChanged(task, oldDueDate, newDueDate, performedBy) {
    return await Activity.logActivity({
      entityType: 'Task',
      entityId: task._id,
      project: task.project,
      activityType: 'task_due_date_changed',
      description: `Task "${task.title}" due date changed`,
      category: 'update',
      performedBy: performedBy._id || performedBy,
      priority: 'medium',
      changes: {
        field: 'dueDate',
        oldValue: oldDueDate ? new Date(oldDueDate).toISOString() : null,
        newValue: newDueDate ? new Date(newDueDate).toISOString() : null
      },
      metadata: {
        taskTitle: task.title,
        taskId: task._id,
        changedBy: performedBy.name || performedBy
      }
    });
  }

  static async logTaskSubtaskCompleted(task, subtask, performedBy) {
    return await Activity.logActivity({
      entityType: 'Task',
      entityId: task._id,
      project: task.project,
      activityType: 'task_subtask_completed',
      description: `Subtask "${subtask.title}" completed in task "${task.title}"`,
      category: 'update',
      performedBy: performedBy._id || performedBy,
      priority: 'low',
      metadata: {
        taskTitle: task.title,
        taskId: task._id,
        subtaskId: subtask._id || subtask,
        subtaskTitle: subtask.title,
        completedBy: performedBy.name || performedBy
      }
    });
  }

  // CalendarEvent activity logging methods
  static async logEventCreated(event, performedBy) {
    return await Activity.logActivity({
      entityType: 'CalendarEvent',
      entityId: event._id,
      project: event.project,
      activityType: 'event_created',
      description: `Event "${event.title}" was created`,
      category: 'creation',
      performedBy: performedBy._id || performedBy,
      priority: 'high',
      metadata: {
        eventTitle: event.title,
        eventId: event._id,
        eventType: event.type,
        startDate: event.startDate,
        createdBy: performedBy.name || performedBy
      }
    });
  }

  static async logEventUpdated(event, changes, performedBy) {
    const changeDescriptions = [];
    
    Object.keys(changes).forEach(field => {
      if (field === 'updatedAt' || field === 'updatedBy') return;
      
      const oldValue = changes[field].oldValue;
      const newValue = changes[field].newValue;
      
      if (oldValue !== newValue) {
        changeDescriptions.push(`${field} changed from "${oldValue}" to "${newValue}"`);
      }
    });

    if (changeDescriptions.length === 0) return null;

    return await Activity.logActivity({
      entityType: 'CalendarEvent',
      entityId: event._id,
      project: event.project,
      activityType: 'event_updated',
      description: `Event "${event.title}" was updated: ${changeDescriptions.join(', ')}`,
      category: 'update',
      performedBy: performedBy._id || performedBy,
      priority: 'medium',
      changes: {
        field: Object.keys(changes).join(', '),
        oldValue: Object.values(changes).map(c => c.oldValue),
        newValue: Object.values(changes).map(c => c.newValue)
      },
      metadata: {
        eventTitle: event.title,
        eventId: event._id,
        fieldsChanged: Object.keys(changes).filter(f => f !== 'updatedAt' && f !== 'updatedBy')
      }
    });
  }

  static async logEventDeleted(event, performedBy) {
    return await Activity.logActivity({
      entityType: 'CalendarEvent',
      entityId: event._id,
      project: event.project,
      activityType: 'event_deleted',
      description: `Event "${event.title}" was deleted`,
      category: 'deletion',
      performedBy: performedBy._id || performedBy,
      priority: 'critical',
      metadata: {
        eventTitle: event.title,
        eventId: event._id,
        deletedBy: performedBy.name || performedBy
      }
    });
  }

  static async logEventCancelled(event, performedBy) {
    return await Activity.logActivity({
      entityType: 'CalendarEvent',
      entityId: event._id,
      project: event.project,
      activityType: 'event_cancelled',
      description: `Event "${event.title}" was cancelled`,
      category: 'status_change',
      performedBy: performedBy._id || performedBy,
      priority: 'medium',
      metadata: {
        eventTitle: event.title,
        eventId: event._id,
        cancelledBy: performedBy.name || performedBy
      }
    });
  }

  static async logEventAttendeeAdded(event, attendee, performedBy) {
    return await Activity.logActivity({
      entityType: 'CalendarEvent',
      entityId: event._id,
      project: event.project,
      activityType: 'event_attendee_added',
      description: `Attendee added to event "${event.title}"`,
      category: 'update',
      performedBy: performedBy._id || performedBy,
      priority: 'medium',
      relatedEntity: {
        type: 'User',
        id: attendee._id || attendee
      },
      metadata: {
        eventTitle: event.title,
        eventId: event._id,
        attendeeName: attendee.name || attendee,
        addedBy: performedBy.name || performedBy
      }
    });
  }

  static async logEventAttendeeRemoved(event, attendee, performedBy) {
    return await Activity.logActivity({
      entityType: 'CalendarEvent',
      entityId: event._id,
      project: event.project,
      activityType: 'event_attendee_removed',
      description: `Attendee removed from event "${event.title}"`,
      category: 'update',
      performedBy: performedBy._id || performedBy,
      priority: 'medium',
      relatedEntity: {
        type: 'User',
        id: attendee._id || attendee
      },
      metadata: {
        eventTitle: event.title,
        eventId: event._id,
        attendeeName: attendee.name || attendee,
        removedBy: performedBy.name || performedBy
      }
    });
  }

  static async logEventStartDateChanged(event, oldDate, newDate, performedBy) {
    return await Activity.logActivity({
      entityType: 'CalendarEvent',
      entityId: event._id,
      project: event.project,
      activityType: 'event_start_date_changed',
      description: `Event "${event.title}" start date changed`,
      category: 'update',
      performedBy: performedBy._id || performedBy,
      priority: 'medium',
      changes: {
        field: 'startDate',
        oldValue: oldDate ? new Date(oldDate).toISOString() : null,
        newValue: newDate ? new Date(newDate).toISOString() : null
      },
      metadata: {
        eventTitle: event.title,
        eventId: event._id,
        changedBy: performedBy.name || performedBy
      }
    });
  }

  static async logEventLocationChanged(event, oldLocation, newLocation, performedBy) {
    return await Activity.logActivity({
      entityType: 'CalendarEvent',
      entityId: event._id,
      project: event.project,
      activityType: 'event_location_changed',
      description: `Event "${event.title}" location changed from "${oldLocation || 'None'}" to "${newLocation || 'None'}"`,
      category: 'update',
      performedBy: performedBy._id || performedBy,
      priority: 'low',
      changes: {
        field: 'location',
        oldValue: oldLocation,
        newValue: newLocation
      },
      metadata: {
        eventTitle: event.title,
        eventId: event._id,
        changedBy: performedBy.name || performedBy
      }
    });
  }

  // Project activity logging methods
  static async logProjectCreated(project, performedBy) {
    return await Activity.logActivity({
      entityType: 'Project',
      entityId: project._id,
      project: project._id,
      activityType: 'project_created',
      description: `Project "${project.name}" was created`,
      category: 'creation',
      performedBy: performedBy._id || performedBy,
      priority: 'critical',
      metadata: {
        projectName: project.name,
        projectId: project._id,
        createdBy: performedBy.name || performedBy
      }
    });
  }

  static async logProjectUpdated(project, changes, performedBy) {
    const changeDescriptions = [];
    
    Object.keys(changes).forEach(field => {
      if (field === 'updatedAt' || field === 'updatedBy') return;
      
      const oldValue = changes[field].oldValue;
      const newValue = changes[field].newValue;
      
      if (oldValue !== newValue) {
        changeDescriptions.push(`${field} changed from "${oldValue}" to "${newValue}"`);
      }
    });

    if (changeDescriptions.length === 0) return null;

    return await Activity.logActivity({
      entityType: 'Project',
      entityId: project._id,
      project: project._id,
      activityType: 'project_updated',
      description: `Project "${project.name}" was updated: ${changeDescriptions.join(', ')}`,
      category: 'update',
      performedBy: performedBy._id || performedBy,
      priority: 'high',
      changes: {
        field: Object.keys(changes).join(', '),
        oldValue: Object.values(changes).map(c => c.oldValue),
        newValue: Object.values(changes).map(c => c.newValue)
      },
      metadata: {
        projectName: project.name,
        projectId: project._id,
        fieldsChanged: Object.keys(changes).filter(f => f !== 'updatedAt' && f !== 'updatedBy')
      }
    });
  }

  static async logProjectMemberAdded(project, member, performedBy) {
    return await Activity.logActivity({
      entityType: 'Project',
      entityId: project._id,
      project: project._id,
      activityType: 'project_member_added',
      description: `Member added to project "${project.name}"`,
      category: 'update',
      performedBy: performedBy._id || performedBy,
      priority: 'high',
      relatedEntity: {
        type: 'User',
        id: member.user || member
      },
      metadata: {
        projectName: project.name,
        projectId: project._id,
        memberRole: member.role,
        addedBy: performedBy.name || performedBy
      }
    });
  }

  static async logProjectMemberRemoved(project, member, performedBy) {
    return await Activity.logActivity({
      entityType: 'Project',
      entityId: project._id,
      project: project._id,
      activityType: 'project_member_removed',
      description: `Member removed from project "${project.name}"`,
      category: 'update',
      performedBy: performedBy._id || performedBy,
      priority: 'high',
      relatedEntity: {
        type: 'User',
        id: member.user || member
      },
      metadata: {
        projectName: project.name,
        projectId: project._id,
        removedBy: performedBy.name || performedBy
      }
    });
  }

  static async logProjectMemberRoleChanged(project, member, oldRole, newRole, performedBy) {
    return await Activity.logActivity({
      entityType: 'Project',
      entityId: project._id,
      project: project._id,
      activityType: 'project_member_role_changed',
      description: `Member role changed in project "${project.name}" from "${oldRole}" to "${newRole}"`,
      category: 'update',
      performedBy: performedBy._id || performedBy,
      priority: 'high',
      relatedEntity: {
        type: 'User',
        id: member.user || member
      },
      changes: {
        field: 'role',
        oldValue: oldRole,
        newValue: newRole
      },
      metadata: {
        projectName: project.name,
        projectId: project._id,
        changedBy: performedBy.name || performedBy
      }
    });
  }

  // Helper method to log field-level changes
  static async logFieldChange(entityType, entity, field, oldValue, newValue, performedBy) {
    const activityTypeMap = {
      'Company': {
        'name': 'company_name_changed',
        'email': 'company_email_changed',
        'phone': 'company_phone_changed',
        'address': 'company_address_changed',
        'website': 'company_website_changed',
        'industry': 'company_industry_changed',
        'size': 'company_size_changed',
        'owner': 'company_owner_changed'
      },
      'Lead': {
        'name': 'lead_name_changed',
        'email': 'lead_email_changed',
        'phone': 'lead_phone_changed',
        'jobTitle': 'lead_job_title_changed',
        'owner': 'lead_owner_changed'
      },
      'Customer': {
        'firstName': 'customer_name_changed',
        'lastName': 'customer_name_changed',
        'email': 'customer_email_changed',
        'phone': 'customer_phone_changed',
        'address': 'customer_address_changed',
        'company': 'customer_company_changed',
        'owner': 'customer_owner_changed'
      },
      'Deal': {
        'name': 'deal_name_changed',
        'value': 'deal_value_changed',
        'currency': 'deal_currency_changed',
        'source': 'deal_source_changed',
        'customer': 'deal_customer_changed',
        'company': 'deal_company_changed',
        'stage': 'deal_stage_changed',
        'priority': 'deal_priority_changed',
        'probability': 'deal_probability_changed',
        'expectedCloseDate': 'deal_expected_close_date_changed',
        'actualCloseDate': 'deal_actual_close_date_changed'
      },
      'Task': {
        'title': 'task_title_changed',
        'description': 'task_description_changed',
        'dueDate': 'task_due_date_changed',
        'priority': 'task_priority_changed',
        'status': 'task_status_changed'
      },
      'CalendarEvent': {
        'title': 'event_title_changed',
        'description': 'event_description_changed',
        'startDate': 'event_start_date_changed',
        'endDate': 'event_end_date_changed',
        'startTime': 'event_start_time_changed',
        'endTime': 'event_end_time_changed',
        'location': 'event_location_changed',
        'allDay': 'event_all_day_changed',
        'type': 'event_type_changed'
      },
      'Project': {
        'name': 'project_name_changed',
        'description': 'project_description_changed',
        'owner': 'project_owner_changed'
      }
    };

    const activityType = activityTypeMap[entityType]?.[field];
    if (!activityType) return null;

    const entityName = entity.name || entity.title || entity.fullName || `${entityType} ${entity._id}`;
    const description = `${entityType} "${entityName}" ${field} changed from "${oldValue || 'None'}" to "${newValue || 'None'}"`;

    return await Activity.logActivity({
      entityType,
      entityId: entity._id,
      project: entity.project || entity.projectId || entity._id,
      activityType,
      description,
      category: 'update',
      performedBy: performedBy._id || performedBy,
      priority: 'low',
      changes: {
        field,
        oldValue,
        newValue
      },
      metadata: {
        entityName,
        entityId: entity._id,
        changedBy: performedBy.name || performedBy
      }
    });
  }


}

export default ActivityService;
