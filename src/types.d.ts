/**
 * Tray capability vocabulary shared across the Host gateway, the desktop-shell
 * bridge, and the settings surface.
 * @module @deepseek-ai/dsh-host-tray/types
 */
/** What closing the main window does while the tray is enabled. */
export type TrayCloseBehavior = 'tray' | 'quit';
/** One context-menu entry the plugin asks the desktop shell to render. */
export interface TrayMenuEntry {
    /** Stable action id the desktop shell maps to an Electron handler. */
    id: string;
    /** Display label shown in the OS context menu. */
    label: string;
}
/** The full tray configuration a surface sends to the Host. */
export interface TrayConfigureRequest {
    /** Whether the system tray icon is shown at all. */
    enabled: boolean;
    /** Close-window behavior while the tray is enabled. */
    closeBehavior: TrayCloseBehavior;
    /** Context-menu entries, in display order; the Host fills its shipped menu when omitted. */
    menu?: TrayMenuEntry[];
}
/** The current tray state, reported back to the settings surface. */
export interface TrayStatusView {
    /** Whether a desktop shell is reachable (false in pure web mode). */
    available: boolean;
    /** Whether the tray is currently enabled. */
    enabled: boolean;
    /** The active close-window behavior. */
    closeBehavior: TrayCloseBehavior;
    /** Whether the main window is currently visible. */
    windowVisible: boolean;
}
//# sourceMappingURL=types.d.ts.map