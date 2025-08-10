# Activity System

A unified activity log for the CRM, capturing all important events across entities (contacts, companies, projects, pipelines, stages, tasks, invitations, notifications, etc.). Designed for multi-tenant isolation, RBAC, and future integrations.

## Data Model

Entity: `Activity`

- project: ObjectId (Project) required
- company: ObjectId (Company) optional
- contact: ObjectId (Contact) optional
- entityType: enum ['contact','company','project','deal','task','pipeline','stage','invitation','notification','user','system','note','email','call','meeting','activity','other']
- entityId: ObjectId required
- type: enum ['created','updated','deleted','note_added','note_updated','note_deleted','tag_added','tag_removed','stage_changed','status_changed','assignment_changed','owner_changed','lead_score_updated','custom_field_added','custom_field_removed','social_link_added','social_link_removed','email_sent','email_received','call_made','call_received','meeting_scheduled','meeting_completed','task_created','task_completed','imported','exported','merged','duplicated','restored','other']
- title: string
- description: string
- actor: ObjectId (User) required
- mentions: [User]
- visibility: enum ['private','team','public'] default team
- priority: enum ['low','medium','high']
- source: enum ['manual','system','email','phone','integration','import','api']
- tags: [string]
- attachments: [{ name, url, mimeType, size }]
- related: [{ entityType, entityId }]
- metadata: Map<string, any>
- ipAddress, userAgent
- isPinned: boolean
- reactions: [{ user, type, createdAt }]

Indexes: by project+createdAt, by entityType+entityId+project, by actor+createdAt.

## API

- GET `/api/activities/project/:projectId`
  - Query: companyId, contactId, entityType, entityId, types (csv), actorId, visibility, search, from, to, tags (csv), limit, skip, sortBy, sortOrder
  - Returns: { items, pagination }
- POST `/api/activities` (log manual)
  - Body: projectId, companyId?, contactId?, entityType, entityId, type, title?, description?, visibility?, priority?, source?, tags?, attachments?, related?, metadata?, mentions?
- GET `/api/activities/:id`
- PUT `/api/activities/:id/pin` (manager+)
- POST `/api/activities/:id/reactions`
- DELETE `/api/activities/:id/reactions`

All routes require auth and project membership (viewer for read/react, manager for pin).

## Integration

- `utils/activityLogger.logActivity` central utility to log events; used across controllers.
- Contacts controller integrated for create/update/delete, notes, tags, custom fields, social links, stage and lead score updates.
- Future: integrate into company, project, pipeline, stage, deal, and task flows similarly.

## Realtime

- Emits a lightweight event to the project room so clients can update activity feeds.

## Security & Privacy

- Visibility controls (private/team/public) for future UI filtering.
- Stores minimal request metadata (IP, user-agent) for auditability.

## Examples

```
POST /api/activities
{
  "projectId": "...",
  "entityType": "contact",
  "entityId": "...",
  "type": "note_added",
  "title": "Follow-up note",
  "description": "Called the lead, scheduled a demo.",
  "source": "manual",
  "tags": ["follow-up"]
}
```

Response contains the created activity.


