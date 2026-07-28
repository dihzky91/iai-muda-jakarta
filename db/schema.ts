import { mysqlTable, varchar, text, int, boolean, timestamp, serial, mysqlEnum, uniqueIndex, index } from 'drizzle-orm/mysql-core';
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
  eventType: mysqlEnum('event_type', ['public', 'internal']).default('public').notNull(),
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
  memberId: int('member_id').notNull(),
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
  id: serial('id').primaryKey(),
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

