/**
 * System-tray Remote: bridges the settings surface to the desktop shell's
 * loopback control service. The OS tray itself is owned by the Electron main
 * process; this gateway turns user configuration into control calls and
 * persists the config in the `web` profile, so the tray state survives
 * restarts. Without a desktop shell (plain `dsh web`) the gateway reports
 * `available: false` and every action no-ops.
 * @module @deepseek-ai/dsh-host-tray
 */

import type { Context } from '@deepseek-ai/cordis'
import { resolveProfileDir } from '@deepseek-ai/dsh-app-boot'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import {
  DEFAULT_TRAY_MENU,
  readTrayConfig,
  writeTrayConfig,
  type TrayConfig,
} from './config.ts'
import {
  HttpTrayControlClient,
  readControlPort,
  type TrayControlClient,
} from './control.ts'
import type {
  TrayConfigureRequest,
  TrayMenuEntry,
  TrayStatusView,
} from './types.ts'

export type * from './types.ts'
export type { TrayConfig } from './config.ts'
export { DEFAULT_TRAY_CONFIG, DEFAULT_TRAY_MENU, readTrayConfig, writeTrayConfig } from './config.ts'
export {
  HttpTrayControlClient,
  TrayControlError,
  readControlPort,
  type TrayControlClient,
} from './control.ts'

/** Gateway construction seams (tests override the bridge and profile). */
export interface TrayGatewayOptions {
  /** Profile directory override (tests); defaults to the `web` profile. */
  profileDir?: string
  /** Control-port override (tests); defaults to `DSH_DESKTOP_CONTROL_PORT`. */
  controlPort?: string | null
  /** Bridge override (tests); defaults to an HTTP client over the port. */
  client?: TrayControlClient
  /** Whether to apply the persisted config on construction (tests may disable). */
  applyOnStart?: boolean
}

/** Remote-only service exposing tray control and status. */
export class TrayGateway extends TypertRemoteService {
  static inject: string[] = []

  private readonly profileDir: string
  private readonly client: TrayControlClient

  constructor(ctx: Context, options: TrayGatewayOptions = {}) {
    super(ctx, 'tray')
    this.profileDir = options.profileDir ?? resolveProfileDir('web')
    this.client = options.client
      ?? new HttpTrayControlClient(options.controlPort === undefined ? readControlPort() : options.controlPort)
    // 启动时把持久化的托盘配置应用到桌面壳（无控制服务时静默跳过）。
    if (options.applyOnStart !== false && this.client.available) {
      const config = readTrayConfig(this.profileDir)
      void this.client.configure(this.configureRequest(config)).catch(() => {})
    }
  }

  /**
   * Read the current tray/window state from the desktop shell.
   * @returns the live status, or an unavailable view without a shell.
   */
  @Remote('getStatus')
  async getStatus(): Promise<TrayStatusView> {
    return await this.client.status()
  }

  /**
   * Apply a tray configuration: persist it, then push it to the desktop shell
   * so the tray and close behavior change immediately. The shipped default
   * menu is used unless the surface supplied its own.
   * @param request - the tray configuration (menu optional).
   * @returns the resulting status after the shell applied it.
   */
  @Remote('configure')
  async configure(request: TrayConfigureRequest): Promise<TrayStatusView> {
    const menu = request.menu ?? [...DEFAULT_TRAY_MENU]
    writeTrayConfig(this.profileDir, { enabled: request.enabled, closeBehavior: request.closeBehavior })
    await this.client.configure({ enabled: request.enabled, closeBehavior: request.closeBehavior, menu })
    return await this.client.status()
  }

  /**
   * Ask the desktop shell to show and focus the main window (tray menu
   * "open" action, or the settings surface's button).
   * @returns the resulting status.
   */
  @Remote('showWindow')
  async showWindow(): Promise<TrayStatusView> {
    await this.client.showWindow()
    return await this.client.status()
  }

  /**
   * Ask the desktop shell to quit; its before-quit stops the spawned `dsh
   * web` tree so no background process keeps repository files locked.
   */
  @Remote('quit')
  async quit(): Promise<void> {
    await this.client.quit()
  }

  private configureRequest(config: TrayConfig): TrayConfigureRequest {
    return {
      enabled: config.enabled,
      closeBehavior: config.closeBehavior,
      menu: [...DEFAULT_TRAY_MENU] as TrayMenuEntry[],
    }
  }
}

export default TrayGateway
