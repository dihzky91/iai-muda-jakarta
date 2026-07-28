import { mysqlTable, varchar, text, int, bigint, boolean, timestamp, serial, mysqlEnum, uniqueIndex, index } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

export const users = mysqlTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: mysqlEnum('role', ['superadmin', 'admin', 'editor']).default('editor').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const generations = mysqlTable('generations', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  years: varchar('years', { length: 50 }).notNull(),
  isActive: boolean('is_active').default(false).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const positions = mysqlTable('positions', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 255 }).notNull(),
  sortOrder: int('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  // Dipakai resolvePositionId() di POST /api/members untuk lookup by name.
  idxName: index('idx_positions_name').on(table.name),
  // Mencegah duplikasi posisi dengan nama dan kategori yang sama.
  uniqNameCategory: uniqueIndex('uniq_positions_name_category').on(table.name, table.category),
}));

export const members = mysqlTable('members', {
  id: serial('id').primaryKey(),
  generationId: int('generation_id').notNull(),
  positionId: int('position_id'),
  name: varchar('name', { length: 255 }).notNull(),
  division: varchar('division', { length: 255 }),
  university: varchar('university', { length: 255 }),
  email: varchar('email', { length: 255 }),
  imageUrl: varchar('image_url', { length: 500 }),
  linkedinUrl: varchar('linkedin_url', { length: 500 }),
  bio: text('bio'),
  phone: varchar('phone', { length: 20 }),
  whatsapp: varchar('whatsapp', { length: 20 }),
  isAlumni: boolean('is_alumni').default(false).notNull(),
  showPublic: boolean('show_public').default(true).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  // Kolom FK — dipakai LEFT JOIN di homepage, /api/members, dan directory.
  idxGenerationId: index('idx_members_generation_id').on(table.generationId),
  idxPositionId: index('idx_members_position_id').on(table.positionId),
  // Dipakai grouping riwayat generasi di /api/member/directory.
  idxEmail: index('idx_members_email').on(table.email),
  // Homepage & /api/members selalu memfilter show_public.
  idxShowPublic: index('idx_members_show_public').on(table.showPublic),
}));

export const events = mysqlTable('events', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  date: varchar('date', { length: 20 }).notNull(),
  endDate: varchar('end_date', { length: 20 }),
  time: varchar('time', { length: 20 }),
  location: varchar('location', { length: 255 }),
  imageUrl: varchar('image_url', { length: 500 }),
  registrationUrl: varchar('registration_url', { length: 500 }),
  status: mysqlEnum('status', ['ongoing', 'upcoming', 'completed']).default('upcoming').notNull(),
  eventType: varchar('event_type', { length: 20 }).default('public').notNull(),
  visibleToAlumni: boolean('visible_to_alumni').default(false).notNull(),
  allDay: boolean('all_day').default(false).notNull(),
  color: varchar('color', { length: 20 }).default('blue').notNull(),
  generationId: int('generation_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  // /api/calendar/events memfilter rentang tanggal lalu ORDER BY date, time.
  idxDate: index('idx_events_date').on(table.date),
  // /api/calendar/events?scope=public → WHERE event_type = 'public' AND date BETWEEN ...
  idxTypeDate: index('idx_events_type_date').on(table.eventType, table.date),
  // /api/member/events?type=&status=
  idxTypeStatus: index('idx_events_type_status').on(table.eventType, table.status),
}));

export const eventRsvps = mysqlTable('event_rsvps', {
  id: serial('id').primaryKey(),
  eventId: int('event_id').notNull(),
  memberId: bigint('member_id', { mode: 'number', unsigned: true }).notNull(),
  status: mysqlEnum('status', ['attending', 'not_attending', 'maybe']).default('attending').notNull(),
  respondedAt: timestamp('responded_at').defaultNow().notNull(),
}, (table) => ({
  uniqRsvp: uniqueIndex('uniq_event_member_rsvp').on(table.eventId, table.memberId),
}));

export const eventCommittees = mysqlTable('event_committees', {
  id: serial('id').primaryKey(),
  eventId: int('event_id').notNull(),
  memberId: int('member_id').notNull(),
  role: varchar('role', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  uniqCommittee: uniqueIndex('uniq_event_member_role').on(table.eventId, table.memberId, table.role),
}));

export const eventMaterials = mysqlTable('event_materials', {
  id: serial('id').primaryKey(),
  eventId: int('event_id').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  fileUrl: varchar('file_url', { length: 500 }).notNull(),
  fileType: varchar('file_type', { length: 50 }),
  uploadedBy: int('uploaded_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  // Selalu di-query per event: GET /api/member/events/[id]/materials.
  // Nama menyesuaikan index yang sudah dibuat migrasi add_event_committees_and_materials.
  idxEventId: index('idx_event_materials_event').on(table.eventId),
}));

export const generationsRelations = relations(generations, ({ many }) => ({
  members: many(members),
  events: many(events),
}));

export const membersRelations = relations(members, ({ one, many }) => ({
  generation: one(generations, {
    fields: [members.generationId],
    references: [generations.id],
  }),
  position: one(positions, {
    fields: [members.positionId],
    references: [positions.id],
  }),
  rsvps: many(eventRsvps),
  committees: many(eventCommittees),
  uploadedMaterials: many(eventMaterials),
  statuses: many(memberStatuses),
  academicLoads: many(memberAcademicLoads),
  leaveRequests: many(leaveRequests),
  interventionLogs: many(interventionLogs),
  evaluations: many(monthlyEvaluations),
}));

export const positionsRelations = relations(positions, ({ many }) => ({
  members: many(members),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  generation: one(generations, {
    fields: [events.generationId],
    references: [generations.id],
  }),
  rsvps: many(eventRsvps),
  committees: many(eventCommittees),
  materials: many(eventMaterials),
}));

export const eventRsvpsRelations = relations(eventRsvps, ({ one }) => ({
  event: one(events, {
    fields: [eventRsvps.eventId],
    references: [events.id],
  }),
  member: one(members, {
    fields: [eventRsvps.memberId],
    references: [members.id],
  }),
}));

export const eventCommitteesRelations = relations(eventCommittees, ({ one }) => ({
  event: one(events, {
    fields: [eventCommittees.eventId],
    references: [events.id],
  }),
  member: one(members, {
    fields: [eventCommittees.memberId],
    references: [members.id],
  }),
}));

export const eventMaterialsRelations = relations(eventMaterials, ({ one }) => ({
  event: one(events, {
    fields: [eventMaterials.eventId],
    references: [events.id],
  }),
  uploader: one(members, {
    fields: [eventMaterials.uploadedBy],
    references: [members.id],
  }),
}));

export const pillars = mysqlTable('pillars', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  iconName: varchar('icon_name', { length: 50 }).default('Shield').notNull(),
  sortOrder: int('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const articles = mysqlTable('articles', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  date: varchar('date', { length: 20 }).notNull(),
  author: varchar('author', { length: 255 }).notNull(),
  imageUrl: varchar('image_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const galleries = mysqlTable('galleries', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  imageUrl: varchar('image_url', { length: 500 }),
  date: varchar('date', { length: 20 }).notNull(),
  category: varchar('category', { length: 255 }),
  photographer: varchar('photographer', { length: 255 }),
  images: text('images'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Tabel kategori galeri (editable dari CMS)
 * Menggantikan list hardcode di GalleryManager.tsx.
 * Kolom `slug` untuk identifikasi internal; `name` untuk tampilan.
 */
export const galleryCategories = mysqlTable('gallery_categories', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  color: varchar('color', { length: 20 }).default('blue').notNull(),
  sortOrder: int('sort_order').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const settings = mysqlTable('settings', {
  id: serial('id').primaryKey(),
  contactTitle: varchar('contact_title', { length: 255 }).default('Hubungi IAI Wilayah DKI Jakarta').notNull(),
  contactDescription: text('contact_description').notNull(),
  address: text('address').notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 100 }),
  showPhone: boolean('show_phone').default(true).notNull(),
  instagramUrl: varchar('instagram_url', { length: 500 }),
  linkedinUrl: varchar('linkedin_url', { length: 500 }),
  youtubeUrl: varchar('youtube_url', { length: 500 }),
  divisionPhotos: text('division_photos'),
  divisions: text('divisions'),
  footerDescription: text('footer_description'),
  logoUrl: varchar('logo_url', { length: 500 }),
  faviconUrl: varchar('favicon_url', { length: 500 }),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const contactMessages = mysqlTable('contact_messages', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const memberAccounts = mysqlTable('member_accounts', {
  id: serial('id').primaryKey(),
  memberId: int('member_id').notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const memberAccountsRelations = relations(memberAccounts, ({ one }) => ({
  member: one(members, {
    fields: [memberAccounts.memberId],
    references: [members.id],
  }),
}));

export const resources = mysqlTable('resources', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  fileUrl: varchar('file_url', { length: 500 }).notNull(),
  fileName: varchar('file_name', { length: 255 }),
  fileType: varchar('file_type', { length: 50 }),
  fileSize: int('file_size'),
  category: varchar('category', { length: 50 }).default('onboarding').notNull(),
  subcategory: varchar('subcategory', { length: 100 }),
  visibility: varchar('visibility', { length: 20 }).default('pengurus').notNull(),
  sortOrder: int('sort_order').default(0),
  downloadCount: int('download_count').default(0),
  uploadedBy: int('uploaded_by'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  idxCategory: index('idx_resources_category').on(table.category),
  idxVisibility: index('idx_resources_visibility').on(table.visibility),
  idxSortOrder: index('idx_resources_sort_order').on(table.sortOrder),
  idxIsActive: index('idx_resources_is_active').on(table.isActive),
}));

export const resourceReads = mysqlTable('resource_reads', {
  id: serial('id').primaryKey(),
  resourceId: int('resource_id').notNull(),
  memberId: int('member_id').notNull(),
  readAt: timestamp('read_at').defaultNow().notNull(),
}, (table) => ({
  uniqResourceMember: uniqueIndex('uniq_resource_member').on(table.resourceId, table.memberId),
  idxMemberId: index('idx_resource_reads_member_id').on(table.memberId),
  idxResourceId: index('idx_resource_reads_resource_id').on(table.resourceId),
}));

export const resourcesRelations = relations(resources, ({ one, many }) => ({
  uploader: one(users, {
    fields: [resources.uploadedBy],
    references: [users.id],
  }),
  reads: many(resourceReads),
}));

export const resourceReadsRelations = relations(resourceReads, ({ one }) => ({
  resource: one(resources, {
    fields: [resourceReads.resourceId],
    references: [resources.id],
  }),
  member: one(members, {
    fields: [resourceReads.memberId],
    references: [members.id],
  }),
}));

// ============================================================================
// HR COMMAND CENTER TABLES
// ============================================================================

/**
 * Tabel status anggota (Hijau/Kuning/Merah/Biru)
 * Append-only log untuk tracking perubahan status dari waktu ke waktu.
 */
export const memberStatuses = mysqlTable('member_statuses', {
  id: serial('id').primaryKey(),
  memberId: int('member_id').notNull(),
  status: mysqlEnum('status', ['hijau', 'kuning', 'merah', 'biru']).notNull(),
  reason: text('reason'),
  changedBy: int('changed_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  // Query status history per member, sorted by time
  idxMemberCreated: index('idx_member_statuses_member_created').on(table.memberId, table.createdAt),
  // Dashboard filter: ambil semua member dengan status tertentu (latest)
  idxStatus: index('idx_member_statuses_status').on(table.status),
  // FK untuk join ke users (admin yang ubah)
  idxChangedBy: index('idx_member_statuses_changed_by').on(table.changedBy),
}));

/**
 * Tabel academic load anggota (self-reported)
 * Anggota bisa update beban akademik mingguan (UTS, UAS, Quiz, Project, Sick, etc.)
 */
export const memberAcademicLoads = mysqlTable('member_academic_loads', {
  id: serial('id').primaryKey(),
  memberId: int('member_id').notNull(),
  weekStart: varchar('week_start', { length: 10 }).notNull(), // Format: YYYY-MM-DD (Senin)
  loadType: mysqlEnum('load_type', ['uts', 'uas', 'quiz', 'project', 'sick', 'personal', 'other']).notNull(),
  description: text('description'),
  intensity: mysqlEnum('intensity', ['low', 'medium', 'high']).default('medium').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  // Query load per member per minggu
  idxMemberWeek: index('idx_member_academic_loads_member_week').on(table.memberId, table.weekStart),
  // Dashboard: cari member yang belum update minggu ini
  idxWeekStart: index('idx_member_academic_loads_week_start').on(table.weekStart),
  // Mencegah duplikasi: 1 member hanya boleh 1 record per minggu
  uniqMemberWeek: uniqueIndex('uniq_member_academic_loads_member_week').on(table.memberId, table.weekStart),
}));

/**
 * Tabel leave request (cuti)
 * Max 7 hari per 2 bulan, harus submit H-10 (kecuali emergency)
 */
export const leaveRequests = mysqlTable('leave_requests', {
  id: serial('id').primaryKey(),
  memberId: int('member_id').notNull(),
  startDate: varchar('start_date', { length: 10 }).notNull(), // YYYY-MM-DD
  endDate: varchar('end_date', { length: 10 }).notNull(), // YYYY-MM-DD
  reason: text('reason').notNull(),
  leaveType: mysqlEnum('leave_type', ['regular', 'emergency']).default('regular').notNull(),
  status: mysqlEnum('status', ['pending', 'approved', 'rejected']).default('pending').notNull(),
  reviewedBy: int('reviewed_by'),
  reviewedAt: timestamp('reviewed_at'),
  reviewNotes: text('review_notes'),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  // Query leave per member
  idxMember: index('idx_leave_requests_member').on(table.memberId),
  // Dashboard: filter pending leaves
  idxStatus: index('idx_leave_requests_status').on(table.status),
  // Validasi: cek approved leaves dalam 2 bulan terakhir
  idxMemberStatus: index('idx_leave_requests_member_status').on(table.memberId, table.status),
  // FK ke admin yang review
  idxReviewedBy: index('idx_leave_requests_reviewed_by').on(table.reviewedBy),
}));

/**
 * Tabel intervention log (SOP tracking H+1 to H+21)
 * Log setiap step intervention untuk member yang butuh perhatian
 */
export const interventionLogs = mysqlTable('intervention_logs', {
  id: serial('id').primaryKey(),
  memberId: int('member_id').notNull(),
  stage: mysqlEnum('stage', ['h1', 'h3', 'h3_h7', 'h7_zoom', 'h7_h14', 'h14_h21', 'post_h21']).notNull(),
  notes: text('notes'),
  actionTaken: text('action_taken'),
  performedBy: int('performed_by').notNull(),
  scheduledDate: varchar('scheduled_date', { length: 10 }), // YYYY-MM-DD
  completedDate: varchar('completed_date', { length: 10 }), // YYYY-MM-DD
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  // Query intervention history per member
  idxMember: index('idx_intervention_logs_member').on(table.memberId),
  // Track progress: list interventions by stage
  idxMemberStage: index('idx_intervention_logs_member_stage').on(table.memberId, table.stage),
  // Dashboard: ongoing interventions (scheduled but not completed)
  idxScheduledCompleted: index('idx_intervention_logs_scheduled_completed').on(table.scheduledDate, table.completedDate),
  // FK ke admin yang perform
  idxPerformedBy: index('idx_intervention_logs_performed_by').on(table.performedBy),
}));

/**
 * Tabel monthly evaluations
 * HR evaluasi bulanan per anggota
 */
export const monthlyEvaluations = mysqlTable('monthly_evaluations', {
  id: serial('id').primaryKey(),
  memberId: int('member_id').notNull(),
  month: varchar('month', { length: 7 }).notNull(), // Format: YYYY-MM
  evaluationNotes: text('evaluation_notes'),
  actionItems: text('action_items'),
  rating: int('rating'), // 1-5
  evaluatedBy: int('evaluated_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  // Prevent duplicate evaluations per member per month
  uniqMemberMonth: uniqueIndex('uniq_monthly_evaluations_member_month').on(table.memberId, table.month),
  // Query evaluations by member
  idxMember: index('idx_monthly_evaluations_member').on(table.memberId),
  // Query evaluations by month (for reporting)
  idxMonth: index('idx_monthly_evaluations_month').on(table.month),
  // FK ke admin yang evaluasi
  idxEvaluatedBy: index('idx_monthly_evaluations_evaluated_by').on(table.evaluatedBy),
}));

// ============================================================================
// HR RELATIONS
// ============================================================================

export const memberStatusesRelations = relations(memberStatuses, ({ one }) => ({
  member: one(members, {
    fields: [memberStatuses.memberId],
    references: [members.id],
  }),
  changedByUser: one(users, {
    fields: [memberStatuses.changedBy],
    references: [users.id],
  }),
}));

export const memberAcademicLoadsRelations = relations(memberAcademicLoads, ({ one }) => ({
  member: one(members, {
    fields: [memberAcademicLoads.memberId],
    references: [members.id],
  }),
}));

export const leaveRequestsRelations = relations(leaveRequests, ({ one }) => ({
  member: one(members, {
    fields: [leaveRequests.memberId],
    references: [members.id],
  }),
  reviewer: one(users, {
    fields: [leaveRequests.reviewedBy],
    references: [users.id],
  }),
}));

export const interventionLogsRelations = relations(interventionLogs, ({ one }) => ({
  member: one(members, {
    fields: [interventionLogs.memberId],
    references: [members.id],
  }),
  performer: one(users, {
    fields: [interventionLogs.performedBy],
    references: [users.id],
  }),
}));

export const monthlyEvaluationsRelations = relations(monthlyEvaluations, ({ one }) => ({
  member: one(members, {
    fields: [monthlyEvaluations.memberId],
    references: [members.id],
  }),
  evaluator: one(users, {
    fields: [monthlyEvaluations.evaluatedBy],
    references: [users.id],
  }),
}));



