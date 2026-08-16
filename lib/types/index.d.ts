/**
 * System-tray Remote: bridges the settings surface to the desktop shell's
 * loopback control service. The OS tray itself is owned by the Electron main
 * process; this gateway turns user configuration into control calls and
 * persists the config in the `web` profile, so the tray state survives
 * restarts. Without a desktop shell (plain `dsh web`) the gateway reports
 * `available: false` and every action no-ops.
 * @module @deepseek-ai/dsh-host-tray
 */
import type { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import { type TrayControlClient } from './control.ts';
import type { TrayConfigureRequest, TrayStatusView } from './types.ts';
export type * from './types.ts';
export type { TrayConfig } from './config.ts';
export { DEFAULT_TRAY_CONFIG, DEFAULT_TRAY_MENU, readTrayConfig, writeTrayConfig } from './config.ts';
export { HttpTrayControlClient, TrayControlError, readControlPort, type TrayControlClient, } from './control.ts';
/** Gateway construction seams (tests override the bridge and profile). */
export interface TrayGatewayOptions {
    /** Profile directory override (tests); defaults to the `web` profile. */
    profileDir?: string;
    /** Control-port override (tests); defaults to `DSH_DESKTOP_CONTROL_PORT`. */
    controlPort?: string | null;
    /** Bridge override (tests); defaults to an HTTP client over the port. */
    client?: TrayControlClient;
    /** Whether to apply the persisted config on construction (tests may disable). */
    applyOnStart?: boolean;
}
/** Remote-only service exposing tray control and status. */
export declare class TrayGateway extends TypertRemoteService {
    static inject: string[];
    private readonly profileDir;
    private readonly client;
    constructor(ctx: Context, options?: TrayGatewayOptions);
    /**
     * Read the current tray/window state from the desktop shell.
     * @returns the live status, or an unavailable view without a shell.
     */
    getStatus(): Promise<TrayStatusView>;
    /**
     * Apply a tray configuration: persist it, then push it to the desktop shell
     * so the tray and close behavior change immediately. The shipped default
     * menu is used unless the surface supplied its own.
     * @param request - the tray configuration (menu optional).
     * @returns the resulting status after the shell applied it.
     */
    configure(request: TrayConfigureRequest): Promise<TrayStatusView>;
    /**
     * Ask the desktop shell to show and focus the main window (tray menu
     * "open" action, or the settings surface's button).
     * @returns the resulting status.
     */
    showWindow(): Promise<TrayStatusView>;
    /**
     * Ask the desktop shell to quit; its before-quit stops the spawned `dsh
     * web` tree so no background process keeps repository files locked.
     */
    quit(): Promise<void>;
    private configureRequest;
}
export default TrayGateway;
//# sourceMappingURL=index.d.ts.map