import {
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

export const budgetCategoryEnum = pgEnum('budget_category', [
  'household',
  'mortgage',
  'loan',
  'credit-card',
])

export const debtCategoryEnum = pgEnum('debt_category', [
  'mortgage',
  'loan',
  'credit-card',
])

export const households = pgTable('households', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 120 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const budgetItems = pgTable('budget_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  householdId: uuid('household_id')
    .notNull()
    .references(() => households.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 140 }).notNull(),
  amount: integer('amount').notNull(),
  category: budgetCategoryEnum('category').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const debtAccounts = pgTable('debt_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  householdId: uuid('household_id')
    .notNull()
    .references(() => households.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 140 }).notNull(),
  principal: integer('principal').notNull(),
  annualRate: numeric('annual_rate', { precision: 5, scale: 2 }).notNull(),
  minimumPayment: integer('minimum_payment').notNull(),
  category: debtCategoryEnum('category').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
