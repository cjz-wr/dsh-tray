/**
 * Bridge client for the desktop shell's loopback control service. The
 * Electron main process owns the OS tray; this client turns tray commands
 * into HTTP calls against that control service, which the shell exposes on
 * `127.0.0.1` and advertises to the spawned `dsh web` through
 * `DSH_DESKTOP_CONTROL_PORT`. Without that variable (plain `dsh web`, no
 * desktop shell) every call degrades to an unavailable status instead of
 * failing, so the surface can explain why the tray is missing.
 * @module @deepseek-ai/dsh-host-tray/control
 */

import type {
  TrayConfigureRequest,
  TrayStatusView,
} from './types.ts'

/** The unavailable view returned when no desktop control service is reachable. */
const UNAVAILABLE: TrayStatusView = {
  available: false,
  enabled: false,
  closeBehavior: 'tray',
  windowVisible: false,
}

/** One loopback control-service round trip. */
export interface TrayControlClient {
  /** Whether a desktop control service is configured at all. */
  readonly available: boolean
  /** Read the desktop shell's current tray/window state. */
  status(): Promise<TrayStatusView>
  /** Ask the desktop shell to create/update/remove the tray and apply close behavior. */
  configure(request: TrayConfigureRequest): Promise<void>
  /** Ask the desktop shell to show and focus the main window. */
  showWindow(): Promise<void>
  /** Ask the desktop shell to quit (its before-quit stops the spawned server). */
  quit(): Promise<void>
}

/** Read the control port the desktop shell advertised, or null without one. */
export function readControlPort(env: NodeJS.ProcessEnv = process.env): string | null {
  const raw = env.DSH_DESKTOP_CONTROL_PORT
  if (typeof raw !== 'string' || raw.length === 0) return null
  const port = Number.parseInt(raw, 10)
  if (!Number.isInteger(port) || port <= 0 || port > 65535) return null
  return String(port)
}

/** Error thrown when the desktop control service answers non-OK. */
export class TrayControlError extends Error {
  /** @param message - the transport-level failure description. */
  constructor(message: string) {
    super(message)
    this.name = 'TrayControlError'
  }
}

/** HTTP bridge client over the desktop shell's loopback control service. */
export class HttpTrayControlClient implements TrayControlClient {
  readonly available: boolean
  private readonly baseUrl: string
  private readonly fetchImpl: typeof fetch

  /**
   * @param port - the control port, or null when no desktop shell is present.
   * @param fetchImpl - fetch seam (tests); defaults to the platform fetch.
   */
  constructor(port: string | null, fetchImpl: typeof fetch = fetch) {
    this.available = port !== null
    this.baseUrl = `http://127.0.0.1:${port ?? '0'}`
    this.fetchImpl = fetchImpl
  }

  /** @inheritdoc */
  async status(): Promise<TrayStatusView> {
    if (!this.available) return UNAVAILABLE
    const response = await this.fetchImpl(`${this.baseUrl}/api/status`)
    if (!response.ok) throw new TrayControlError(`tray status failed with HTTP ${response.status}`)
    return await response.json() as TrayStatusView
  }

  /** @inheritdoc */
  async configure(request: TrayConfigureRequest): Promise<void> {
    if (!this.available) return
    const response = await this.fetchImpl(`${this.baseUrl}/api/configure`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(request),
    })
    if (!response.ok) throw new TrayControlError(`tray configure failed with HTTP ${response.status}`)
  }

  /** @inheritdoc */
  async showWindow(): Promise<void> {
    if (!this.available) return
    const response = await this.fetchImpl(`${this.baseUrl}/api/window/show`, { method: 'POST' })
    if (!response.ok) throw new TrayControlError(`tray showWindow failed with HTTP ${response.status}`)
  }

  /** @inheritdoc */
  async quit(): Promise<void> {
    if (!this.available) return
    const response = await this.fetchImpl(`${this.baseUrl}/api/quit`, { method: 'POST' })
    if (!response.ok) throw new TrayControlError(`tray quit failed with HTTP ${response.status}`)
  }
}
