import { type ReactNode } from 'react';
import type { TrayConfigureRequest, TrayStatusView } from '../types.js';
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
/** Registration-side Remote face used by the tray preference row. */
export interface TrayRowInjected {
    /** Read the desktop shell's current tray/window state. */
    getStatus: () => Promise<TrayStatusView>;
    /** Persist and apply a tray configuration. */
    configure: (request: TrayConfigureRequest) => Promise<TrayStatusView>;
    /** Ask the desktop shell to quit (its before-quit stops the spawned server). */
    quit: () => Promise<void>;
}
/** Full component props assembled by the Settings slot renderer. */
export type TrayRowProps = PropsRuntime<'settings.general.item'> & PropsLocale<'settings.tray'> & InjectFace<TrayRowInjected>;
/**
 * System-tray preference row in the General settings section: enable the
 * tray, choose the close-window behavior, and quit from the tray. Every
 * change applies immediately through the Host's `tray` Remote; failures keep
 * the previous view and surface an inline alert.
 */
export declare function TrayRow({ getStatus, configure, quit, t }: TrayRowProps): ReactNode;
//# sourceMappingURL=TrayRow.d.ts.map