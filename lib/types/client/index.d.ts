/** System tray preference row registered into the General settings section. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import { type TrayLocaleKey } from './locales.ts';
export type { TrayRowInjected, TrayRowProps } from './TrayRow.tsx';
export type { TrayLocaleKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** System tray settings copy. */
        'settings.tray': TrayLocaleKey;
    }
}
/** Dictionary namespace owned by this plugin. */
export declare const NS = "settings.tray";
/** Services required by the Settings registration and generated Remote face. */
export declare const inject: string[];
/** Contribute the tray preference row to the General settings section. */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map