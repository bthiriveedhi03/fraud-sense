import type { Transaction } from '~/stores/feed'

export const useHighRiskAlert = () =>
  useState<Transaction | null>('highRiskAlert', () => null)
