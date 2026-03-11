import type { BudgetCategory, BudgetItem, DebtAccount } from '#/data/types'
import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

export const Route = createFileRoute('/')({ component: App })

const categoryMeta: Record<
  BudgetCategory,
  { label: string; tone: string; helper: string }
> = {
  household: {
    label: 'Household expenses',
    tone: 'bg-[rgba(47,106,74,0.12)] text-[var(--palm)]',
    helper: 'Groceries, utilities, childcare, transport, subscriptions.',
  },
  mortgage: {
    label: 'Mortgage',
    tone: 'bg-[rgba(79,184,178,0.18)] text-[var(--lagoon-deep)]',
    helper: 'Home loan principal + interest + insurance line items.',
  },
  loan: {
    label: 'Loans',
    tone: 'bg-[rgba(50,143,151,0.18)] text-[var(--lagoon-deep)]',
    helper: 'Auto loans, student loans, personal loans.',
  },
  'credit-card': {
    label: 'Credit card fees',
    tone: 'bg-[rgba(144,95,58,0.16)] text-[color:#7a5130]',
    helper: 'Minimums, annual fees, and monthly interest charges.',
  },
}

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const seedItems: BudgetItem[] = [
  { id: 'rent-insurance', name: 'Home insurance', amount: 210, category: 'mortgage' },
  { id: 'mortgage-payment', name: 'Mortgage payment', amount: 1780, category: 'mortgage' },
  { id: 'groceries', name: 'Groceries', amount: 740, category: 'household' },
  { id: 'utilities', name: 'Utilities', amount: 320, category: 'household' },
  { id: 'car-loan', name: 'Car loan payment', amount: 410, category: 'loan' },
  { id: 'student-loan', name: 'Student loan payment', amount: 330, category: 'loan' },
  { id: 'card-interest', name: 'Card interest + fees', amount: 220, category: 'credit-card' },
]

const seedDebts: DebtAccount[] = [
  {
    id: 'mortgage',
    name: 'Primary Mortgage',
    principal: 280000,
    annualRate: 5.8,
    minimumPayment: 1780,
    category: 'mortgage',
  },
  {
    id: 'car-loan',
    name: 'Car Loan',
    principal: 18200,
    annualRate: 6.2,
    minimumPayment: 410,
    category: 'loan',
  },
  {
    id: 'visa',
    name: 'Visa Rewards',
    principal: 5900,
    annualRate: 23.9,
    minimumPayment: 180,
    category: 'credit-card',
  },
]

function App() {
  const [income, setIncome] = useState(6800)
  const [items, setItems] = useState<BudgetItem[]>(seedItems)
  const [draftName, setDraftName] = useState('')
  const [draftAmount, setDraftAmount] = useState('')
  const [draftCategory, setDraftCategory] = useState<BudgetCategory>('household')

  const totalsByCategory = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc[item.category] += item.amount
        return acc
      },
      {
        household: 0,
        mortgage: 0,
        loan: 0,
        'credit-card': 0,
      } satisfies Record<BudgetCategory, number>,
    )
  }, [items])

  const monthlyExpenses = useMemo(
    () => Object.values(totalsByCategory).reduce((sum, amount) => sum + amount, 0),
    [totalsByCategory],
  )

  const netBalance = income - monthlyExpenses

  const debtSnapshot = useMemo(() => {
    const totalPrincipal = seedDebts.reduce((sum, debt) => sum + debt.principal, 0)
    const totalMinimum = seedDebts.reduce((sum, debt) => sum + debt.minimumPayment, 0)
    const weightedApr =
      seedDebts.reduce((sum, debt) => sum + debt.principal * debt.annualRate, 0) /
      totalPrincipal

    return {
      totalPrincipal,
      totalMinimum,
      weightedApr,
    }
  }, [])

  function addBudgetItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedAmount = Number(draftAmount)
    if (!draftName.trim() || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return
    }

    const next: BudgetItem = {
      id: `${draftCategory}-${Date.now()}`,
      name: draftName.trim(),
      amount: parsedAmount,
      category: draftCategory,
    }

    setItems((current) => [...current, next])
    setDraftName('')
    setDraftAmount('')
  }

  function removeBudgetItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id))
  }

  return (
    <main className="page-wrap px-4 pb-12 pt-8 sm:pb-20 sm:pt-12">
      <section className="island-shell rise-in rounded-3xl p-6 sm:p-8">
        <p className="island-kicker mb-3">Monthly planner</p>
        <h1 className="display-title m-0 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
          Household Budget Tracker
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--sea-ink-soft)] sm:text-lg">
          Plan monthly cashflow across household expenses, mortgage, loans, and
          credit card fees in one place.
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <article className="feature-card rounded-2xl border border-[var(--line)] p-4">
            <p className="m-0 text-sm text-[var(--sea-ink-soft)]">Monthly income</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">
              {currency.format(income)}
            </p>
            <label className="mt-3 block text-xs uppercase tracking-[0.12em] text-[var(--sea-ink-soft)]">
              Update income
              <input
                type="number"
                min={0}
                step={50}
                value={income}
                onChange={(event) => setIncome(Number(event.target.value) || 0)}
                className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-base text-[var(--sea-ink)]"
              />
            </label>
          </article>

          <article className="feature-card rounded-2xl border border-[var(--line)] p-4">
            <p className="m-0 text-sm text-[var(--sea-ink-soft)]">Planned expenses</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">
              {currency.format(monthlyExpenses)}
            </p>
            <p className="mt-4 text-sm leading-6 text-[var(--sea-ink-soft)]">
              Includes all core categories and debt minimum payments.
            </p>
          </article>

          <article className="feature-card rounded-2xl border border-[var(--line)] p-4">
            <p className="m-0 text-sm text-[var(--sea-ink-soft)]">Monthly balance</p>
            <p
              className={`mt-2 text-2xl font-semibold ${
                netBalance >= 0 ? 'text-[var(--palm)]' : 'text-[color:#9a3a2e]'
              }`}
            >
              {currency.format(netBalance)}
            </p>
            <p className="mt-4 text-sm leading-6 text-[var(--sea-ink-soft)]">
              {netBalance >= 0
                ? 'Positive cashflow available for savings goals.'
                : 'Spending is above income. Trim or refinance debt lines.'}
            </p>
          </article>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.45fr_1fr]">
        <article className="island-shell rounded-3xl p-6 sm:p-8">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="display-title m-0 text-2xl font-semibold text-[var(--sea-ink)]">
              Monthly Budget Items
            </h2>
            <span className="rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--sea-ink-soft)]">
              {items.length} items
            </span>
          </div>

          <form onSubmit={addBudgetItem} className="grid gap-3 rounded-2xl border border-[var(--line)] p-4">
            <label className="text-sm font-semibold text-[var(--sea-ink)]">
              Item label
              <input
                type="text"
                placeholder="e.g. Internet bill"
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-base text-[var(--sea-ink)]"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-semibold text-[var(--sea-ink)]">
                Amount (monthly)
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={draftAmount}
                  onChange={(event) => setDraftAmount(event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-base text-[var(--sea-ink)]"
                />
              </label>

              <label className="text-sm font-semibold text-[var(--sea-ink)]">
                Category
                <select
                  value={draftCategory}
                  onChange={(event) => setDraftCategory(event.target.value as BudgetCategory)}
                  className="mt-1.5 w-full rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-base text-[var(--sea-ink)]"
                >
                  {Object.entries(categoryMeta).map(([value, meta]) => (
                    <option key={value} value={value}>
                      {meta.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <button
              type="submit"
              className="mt-1 inline-flex w-full items-center justify-center rounded-xl border border-[var(--lagoon-deep)] bg-[var(--lagoon)] px-3 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(50,143,151,0.28)] hover:bg-[var(--lagoon-deep)] sm:w-auto"
            >
              Add budget item
            </button>
          </form>

          <ul className="mt-5 grid gap-3 p-0">
            {items.map((item) => (
              <li
                key={item.id}
                className="feature-card flex list-none items-center justify-between gap-3 rounded-2xl border border-[var(--line)] p-4"
              >
                <div>
                  <p className="m-0 font-semibold text-[var(--sea-ink)]">{item.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${categoryMeta[item.category].tone}`}
                    >
                      {categoryMeta[item.category].label}
                    </span>
                    <span className="text-xs text-[var(--sea-ink-soft)]">
                      {categoryMeta[item.category].helper}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="m-0 text-base font-semibold text-[var(--sea-ink)]">
                    {currency.format(item.amount)}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeBudgetItem(item.id)}
                    className="mt-1 text-xs font-semibold text-[color:#9a3a2e] hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </article>

        <aside className="island-shell rounded-3xl p-6 sm:p-8">
          <h2 className="display-title m-0 text-2xl font-semibold text-[var(--sea-ink)]">
            Debt Snapshot
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--sea-ink-soft)]">
            Mortgage, loan, and credit card balances with payment pressure.
          </p>

          <div className="mt-5 grid gap-3">
            <article className="feature-card rounded-2xl border border-[var(--line)] p-4">
              <p className="m-0 text-sm text-[var(--sea-ink-soft)]">Total principal</p>
              <p className="mt-2 text-xl font-semibold text-[var(--sea-ink)]">
                {currency.format(debtSnapshot.totalPrincipal)}
              </p>
            </article>
            <article className="feature-card rounded-2xl border border-[var(--line)] p-4">
              <p className="m-0 text-sm text-[var(--sea-ink-soft)]">Total minimum payment</p>
              <p className="mt-2 text-xl font-semibold text-[var(--sea-ink)]">
                {currency.format(debtSnapshot.totalMinimum)}
              </p>
            </article>
            <article className="feature-card rounded-2xl border border-[var(--line)] p-4">
              <p className="m-0 text-sm text-[var(--sea-ink-soft)]">Weighted APR</p>
              <p className="mt-2 text-xl font-semibold text-[var(--sea-ink)]">
                {debtSnapshot.weightedApr.toFixed(2)}%
              </p>
            </article>
          </div>

          <ul className="mt-5 grid gap-3 p-0">
            {seedDebts.map((debt) => (
              <li
                key={debt.id}
                className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 list-none"
              >
                <p className="m-0 font-semibold text-[var(--sea-ink)]">{debt.name}</p>
                <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
                  Principal {currency.format(debt.principal)}
                </p>
                <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
                  Min payment {currency.format(debt.minimumPayment)} at {debt.annualRate}% APR
                </p>
              </li>
            ))}
          </ul>
        </aside>
      </section>
    </main>
  )
}
