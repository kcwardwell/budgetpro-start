import type { BudgetCategory } from '#/data/types'
import { db } from '#/db/client'
import { budgetItems, households } from '#/db/schema'
import { and, desc, eq } from 'drizzle-orm'

const DEFAULT_HOUSEHOLD_ID = '00000000-0000-0000-0000-000000000001'

async function ensureDefaultHousehold() {
  await db
    .insert(households)
    .values({
      id: DEFAULT_HOUSEHOLD_ID,
      name: 'Primary Household',
    })
    .onConflictDoNothing({ target: households.id })
}

export async function listBudgetItems() {
  await ensureDefaultHousehold()

  const rows = await db
    .select({
      id: budgetItems.id,
      name: budgetItems.name,
      amount: budgetItems.amount,
      category: budgetItems.category,
    })
    .from(budgetItems)
    .where(eq(budgetItems.householdId, DEFAULT_HOUSEHOLD_ID))
    .orderBy(desc(budgetItems.createdAt))

  return rows as Array<{
    id: string
    name: string
    amount: number
    category: BudgetCategory
  }>
}

export async function createBudgetItem(data: {
  name: string
  amount: number
  category: BudgetCategory
}) {
  await ensureDefaultHousehold()

    const [inserted] = await db
      .insert(budgetItems)
      .values({
        householdId: DEFAULT_HOUSEHOLD_ID,
        name: data.name,
        amount: data.amount,
        category: data.category,
      })
      .returning({
        id: budgetItems.id,
        name: budgetItems.name,
        amount: budgetItems.amount,
        category: budgetItems.category,
      })

  return inserted as {
    id: string
    name: string
    amount: number
    category: BudgetCategory
  }
}

export async function updateBudgetItem(data: {
  id: string
  name: string
  amount: number
  category: BudgetCategory
}) {
    const [updated] = await db
      .update(budgetItems)
      .set({
        name: data.name,
        amount: data.amount,
        category: data.category,
      })
      .where(
        and(
          eq(budgetItems.id, data.id),
          eq(budgetItems.householdId, DEFAULT_HOUSEHOLD_ID),
        ),
      )
      .returning({
        id: budgetItems.id,
        name: budgetItems.name,
        amount: budgetItems.amount,
        category: budgetItems.category,
      })

  return (updated ?? null) as
    | {
        id: string
        name: string
        amount: number
        category: BudgetCategory
      }
    | null
}

export async function deleteBudgetItem(data: { id: string }) {
    const [deleted] = await db
      .delete(budgetItems)
      .where(
        and(
          eq(budgetItems.id, data.id),
          eq(budgetItems.householdId, DEFAULT_HOUSEHOLD_ID),
        ),
      )
      .returning({ id: budgetItems.id })

  return {
    ok: Boolean(deleted),
    id: data.id,
  }
}
