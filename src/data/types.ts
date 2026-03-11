export type BudgetCategory =
  | 'household'
  | 'mortgage'
  | 'loan'
  | 'credit-card'

export type BudgetItem = {
  id: string
  name: string
  amount: number
  category: BudgetCategory
}

export type DebtAccount = {
  id: string
  name: string
  principal: number
  annualRate: number
  minimumPayment: number
  category: Extract<BudgetCategory, 'mortgage' | 'loan' | 'credit-card'>
}