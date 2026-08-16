/**
 * Persistent tray configuration, kept as one small JSON file in the `web`
 * profile directory so the tray preference survives restarts without touching
 * the settings capability's schema. Corrupt or absent files fall back to the
 * defaults: the tray is on and closing the window hides to the tray.
 * @module @deepseek-ai/dsh-host-tray/config
 */
import type { TrayCloseBehavior } from './types.ts';
/** The config file name inside the profile directory. */
export declare const TRAY_CONFIG_FILE = "tray.json";
/** The tray configuration a surface can persist. */
export interface TrayConfig {
    /** Whether the system tray icon is shown at all. */
    enabled: boolean;
    /** Close-window behavior while the tray is enabled. */
    closeBehavior: TrayCloseBehavior;
}
/** Default tray config: enabled, and closing the window hides to the tray. */
export declare const DEFAULT_TRAY_CONFIG: TrayConfig;
/** The menu the plugin ships; the desktop shell maps the ids to actions. */
export declare const DEFAULT_TRAY_MENU: readonly {
    id: string;
    label: string;
}[];
/** Read the persisted tray config, defaulting when absent or unparsable. */
export declare function readTrayConfig(profileDir: string): TrayConfig;
/** Persist the tray config; a failed write is reported to the caller. */
export declare function writeTrayConfig(profileDir: string, config: TrayConfig): void;
/** Whether a config file already exists (so a fresh boot can keep defaults silently). */
export declare function hasTrayConfig(profileDir: string): boolean;
//# sourceMappingURL=config.d.ts.map