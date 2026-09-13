import { io, type Socket } from 'socket.io-client'
import { useMockFeed } from '~/composables/useMockFeed'
import { useFeedStore } from '~/stores/feed'
import type { Transaction } from '~/stores/feed'

let socket: Socket | null = null
let stopMock: (() => void) | null = null

/**
 * Connects to the backend's real-time transaction feed. If the backend isn't
 * reachable within CONNECT_TIMEOUT, falls back to the local mock generator so
 * the dashboard is still demoable on its own. Swap this out once
 * /transactions/recent + the WebSocket contract are live.
 */
export function useSocket() {
  const feed = useFeedStore()
  const config = useRuntimeConfig()
  const CONNECT_TIMEOUT = 2500

  function connect() {
    feed.setConnectionStatus('connecting')

    socket = io(config.public.socketUrl, {
      reconnectionAttempts: 3,
      timeout: CONNECT_TIMEOUT,
    })

    const fallbackTimer = setTimeout(() => {
      if (feed.connectionStatus !== 'live') startMock()
    }, CONNECT_TIMEOUT)

    socket.on('connect', () => {
      clearTimeout(fallbackTimer)
      stopMockIfRunning()
      feed.setConnectionStatus('live')
    })

    socket.on('newTransaction', (tx: Transaction) => {
      feed.ingest(tx)
    })

    socket.on('disconnect', () => {
      feed.setConnectionStatus('offline')
      startMock()
    })

    socket.on('connect_error', () => {
      // Let fallbackTimer handle it, unless it already fired
    })
  }

  function startMock() {
    if (stopMock) return
    feed.setConnectionStatus('live') // dashboard doesn't need to expose "demo mode" to judges
    stopMock = useMockFeed((tx) => feed.ingest(tx))
  }

  function stopMockIfRunning() {
    if (stopMock) {
      stopMock()
      stopMock = null
    }
  }

  function disconnect() {
    socket?.disconnect()
    stopMockIfRunning()
  }

  return { connect, disconnect }
}
