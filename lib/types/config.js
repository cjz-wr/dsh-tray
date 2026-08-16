/**
 * Persistent tray configuration, kept as one small JSON file in the `web`
 * profile directory so the tray preference survives restarts without touching
 * the settings capability's schema. Corrupt or absent files fall back to the
 * defaults: the tray is on and closing the window hides to the tray.
 * @module @deepseek-ai/dsh-host-tray/config
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
/** The config file name inside the profile directory. */
export const TRAY_CONFIG_FILE = 'tray.json';
/** Default tray config: enabled, and closing the window hides to the tray. */
export const DEFAULT_TRAY_CONFIG = {
    enabled: true,
    closeBehavior: 'tray',
};
/** The menu the plugin ships; the desktop shell maps the ids to actions. */
export const DEFAULT_TRAY_MENU = [
    { id: 'open', label: '打开主窗口' },
    { id: 'quit', label: '退出' },
];
/** Read the persisted tray config, defaulting when absent or unparsable. */
export function readTrayConfig(profileDir) {
    try {
        const raw = readFileSync(join(profileDir, TRAY_CONFIG_FILE), 'utf8');
        const parsed = JSON.parse(raw);
        if (typeof parsed !== 'object' || parsed === null)
            return { ...DEFAULT_TRAY_CONFIG };
        const record = parsed;
        return {
            enabled: typeof record.enabled === 'boolean' ? record.enabled : DEFAULT_TRAY_CONFIG.enabled,
            closeBehavior: record.closeBehavior === 'quit' ? 'quit' : DEFAULT_TRAY_CONFIG.closeBehavior,
        };
    }
    catch {
        return { ...DEFAULT_TRAY_CONFIG };
    }
}
/** Persist the tray config; a failed write is reported to the caller. */
export function writeTrayConfig(profileDir, config) {
    writeFileSync(join(profileDir, TRAY_CONFIG_FILE), `${JSON.stringify(config, null, 2)}\n`, 'utf8');
}
/** Whether a config file already exists (so a fresh boot can keep defaults silently). */
export function hasTrayConfig(profileDir) {
    return existsSync(join(profileDir, TRAY_CONFIG_FILE));
}
//# sourceMappingURL=config.js.map