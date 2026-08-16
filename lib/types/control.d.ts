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
import type { TrayConfigureRequest, TrayStatusView } from './types.ts';
/** One loopback control-service round trip. */
export interface TrayControlClient {
    /** Whether a desktop control service is configured at all. */
    readonly available: boolean;
    /** Read the desktop shell's current tray/window state. */
    status(): Promise<TrayStatusView>;
    /** Ask the desktop shell to create/update/remove the tray and apply close behavior. */
    configure(request: TrayConfigureRequest): Promise<void>;
    /** Ask the desktop shell to show and focus the main window. */
    showWindow(): Promise<void>;
    /** Ask the desktop shell to quit (its before-quit stops the spawned server). */
    quit(): Promise<void>;
}
/** Read the control port the desktop shell advertised, or null without one. */
export declare function readControlPort(env?: NodeJS.ProcessEnv): string | null;
/** Error thrown when the desktop control service answers non-OK. */
export declare class TrayControlError extends Error {
    /** @param message - the transport-level failure description. */
    constructor(message: string);
}
/** HTTP bridge client over the desktop shell's loopback control service. */
export declare class HttpTrayControlClient implements TrayControlClient {
    readonly available: boolean;
    private readonly baseUrl;
    private readonly fetchImpl;
    /**
     * @param port - the control port, or null when no desktop shell is present.
     * @param fetchImpl - fetch seam (tests); defaults to the platform fetch.
     */
    constructor(port: string | null, fetchImpl?: typeof fetch);
    /** @inheritdoc */
    status(): Promise<TrayStatusView>;
    /** @inheritdoc */
    configure(request: TrayConfigureRequest): Promise<void>;
    /** @inheritdoc */
    showWindow(): Promise<void>;
    /** @inheritdoc */
    quit(): Promise<void>;
}
//# sourceMappingURL=control.d.ts.map