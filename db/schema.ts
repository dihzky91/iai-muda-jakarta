import { mysqlTable, varchar, text, int, boolean, timestamp, serial, mysqlEnum } from 'drizzle-orm/mysql-core';
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
});

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
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const events = mysqlTable('events', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  date: varchar('date', { length: 20 }).notNull(),
  time: varchar('time', { length: 20 }),
  location: varchar('location', { length: 255 }),
  imageUrl: varchar('image_url', { length: 500 }),
  registrationUrl: varchar('registration_url', { length: 500 }),
  status: mysqlEnum('status', ['ongoing', 'upcoming', 'completed']).default('upcoming').notNull(),
  generationId: int('generation_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const generationsRelations = relations(generations, ({ many }) => ({
  members: many(members),
  events: many(events),
}));

export const membersRelations = relations(members, ({ one }) => ({
  generation: one(generations, {
    fields: [members.generationId],
    references: [generations.id],
  }),
  position: one(positions, {
    fields: [members.positionId],
    references: [positions.id],
  }),
}));

export const positionsRelations = relations(positions, ({ many }) => ({
  members: many(members),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  generation: one(generations, {
    fields: [events.generationId],
    references: [generations.id],
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

