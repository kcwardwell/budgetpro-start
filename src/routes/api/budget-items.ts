import type { BudgetCategory } from '#/data/types'
import {
  createBudgetItem,
  deleteBudgetItem,
  listBudgetItems,
} from '#/server/budget-items'
import { createFileRoute } from '@tanstack/react-router'



export const Route = createFileRoute('/api/budget-items')({
  server: {
    handlers: {
      GET: async () => {
        const items = await listBudgetItems()
        return Response.json(items)
      },
      POST: async ({ request }) => {
        const payload = (await request.json()) as {
          name: string
          amount: number
          category: BudgetCategory
        }

        const item = await createBudgetItem(payload)
        return Response.json(item, { status: 201 })
      },
      DELETE: async ({ request }) => {
        const url = new URL(request.url)
        const id = url.searchParams.get('id')

        if (!id) {
          return Response.json({ error: 'Missing id query parameter' }, { status: 400 })
        }

        const result = await deleteBudgetItem({ id })
        return Response.json(result)
      },
    },
  },
})
