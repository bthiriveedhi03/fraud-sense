import { defineStore } from 'pinia'

export type RiskTier = 'low' | 'mid' | 'high'
export type TxStatus = 'new' | 'flagged' | 'cleared' | 'escalated'

export interface Transaction {
  id: string
  timestamp: number
  accountId: string
  accountHolder: string
  merchant: string
  amount: number
  lat: number
  lng: number
  homeLat: number
  homeLng: number
  riskScore: number
  riskTier: RiskTier
  reasons: string[]
  status: TxStatus
}

export interface AuditEntry {
  id: string
  transactionId: string
  action: 'flagged' | 'cleared' | 'escalated'
  analyst: string
  timestamp: number
  chainTx?: string // Solana tx signature, once confirmed
}

export interface Filters {
  tier: RiskTier | 'all'
  accountId: string | null
  query: string
}

export const useFeedStore = defineStore('feed', {
  state: () => ({
    connectionStatus: 'connecting' as 'connecting' | 'live' | 'offline',
    transactions: [] as Transaction[],
    auditLog: [] as AuditEntry[],
    filters: { tier: 'all', accountId: null, query: '' } as Filters,
    selectedTransactionId: null as string | null,
    credStuffing: { active: false, attempts: 0, blocked: false },
    maxFeedLength: 200,
  }),

  getters: {
    filtered(state): Transaction[] {
      return state.transactions.filter((t) => {
        if (state.filters.tier !== 'all' && t.riskTier !== state.filters.tier) return false
        if (state.filters.accountId && t.accountId !== state.filters.accountId) return false
        if (
          state.filters.query &&
          !t.merchant.toLowerCase().includes(state.filters.query.toLowerCase()) &&
          !t.accountHolder.toLowerCase().includes(state.filters.query.toLowerCase())
        )
          return false
        return true
      })
    },

    selectedTransaction(state): Transaction | undefined {
      return state.transactions.find((t) => t.id === state.selectedTransactionId)
    },

    stats(state) {
      const total = state.transactions.length
      const flagged = state.transactions.filter((t) => t.riskTier === 'high').length
      const cleared = state.transactions.filter((t) => t.status === 'cleared').length
      const falsePositiveRate = flagged > 0 ? Math.round((cleared / flagged) * 100) : 0
      const oneMinAgo = Date.now() - 60_000
      const perMinute = state.transactions.filter((t) => t.timestamp >= oneMinAgo).length
      return { total, flagged, falsePositiveRate, perMinute }
    },
  },

  actions: {
    setConnectionStatus(status: 'connecting' | 'live' | 'offline') {
      this.connectionStatus = status
    },

    ingest(tx: Transaction) {
      this.transactions.unshift(tx)
      if (this.transactions.length > this.maxFeedLength) {
        this.transactions.length = this.maxFeedLength
      }
    },

    selectTransaction(id: string | null) {
      this.selectedTransactionId = id
    },

    setFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
      this.filters[key] = value
    },

    async applyAction(transactionId: string, action: AuditEntry['action'], analyst = 'You') {
      const tx = this.transactions.find((t) => t.id === transactionId)
      if (!tx) return
      tx.status = action

      const entry: AuditEntry = {
        id: crypto.randomUUID(),
        transactionId,
        action,
        analyst,
        timestamp: Date.now(),
      }
      this.auditLog.unshift(entry)

      const actionMap: Record<AuditEntry['action'], string> = {
        flagged: 'flag',
        cleared: 'clear',
        escalated: 'escalate',
      }

      try {
        const config = useRuntimeConfig()
        const { chainTx } = await $fetch<{ chainTx: string }>(
          `${config.public.apiBase}/transactions/${transactionId}/flag`,
          { method: 'POST', body: { action: actionMap[action], analyst } }
        )
        const target = this.auditLog.find((e) => e.id === entry.id)
        if (target) target.chainTx = chainTx
      } catch (err) {
        console.error('Failed to persist action to backend:', err)
      }
    },

    recordCredStuffingAttempt(blocked: boolean) {
      this.credStuffing.active = true
      this.credStuffing.attempts += 1
      this.credStuffing.blocked = blocked
    },

    resetCredStuffing() {
      this.credStuffing = { active: false, attempts: 0, blocked: false }
    },
  },
})
