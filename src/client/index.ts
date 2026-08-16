/** System tray preference row registered into the General settings section. */

import type {} from '@deepseek-ai/dsh-client-locale/client'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import { TrayRow, type TrayRowInjected } from './TrayRow.tsx'
import { en, zh, type TrayLocaleKey } from './locales.ts'
import TYPERT_REMOTE from '../remote.js'

export type { TrayRowInjected, TrayRowProps } from './TrayRow.tsx'
export type { TrayLocaleKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** System tray settings copy. */
    'settings.tray': TrayLocaleKey
  }
}

/** Dictionary namespace owned by this plugin. */
export const NS = 'settings.tray'

/** Services required by the Settings registration and generated Remote face. */
export const inject = ['slots', 'locale', 'remote']

/** Contribute the tray preference row to the General settings section. */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-settings-tray: dictionaries')
  // The standalone package mounts its own Remote: no edit to the app's
  // api-remotes assembly is needed for ctx.remote.tray to exist.
  ctx.effect(() => ctx.remote.$mount(TYPERT_REMOTE), 'dsh-tray: remote mount')

  const getStatus: TrayRowInjected['getStatus'] = async () => {
    const result = await ctx.remote.tray.getStatus()
    if (!result.ok) {
      throw new Error(`tray.getStatus failed: ${result.error.code}: ${result.error.message}`)
    }
    return result.value
  }
  const configure: TrayRowInjected['configure'] = async (request) => {
    const result = await ctx.remote.tray.configure(request)
    if (!result.ok) {
      throw new Error(`tray.configure failed: ${result.error.code}: ${result.error.message}`)
    }
    return result.value
  }
  const quit: TrayRowInjected['quit'] = async () => {
    const result = await ctx.remote.tray.quit()
    if (!result.ok) {
      throw new Error(`tray.quit failed: ${result.error.code}: ${result.error.message}`)
    }
  }
  const injected = (): TrayRowInjected => ({ getStatus, configure, quit })

  ctx.slots.inject('settings.general.item', () => ctx.slots.register({
    name: 'settings.general.item',
    id: 'tray',
    order: 30,
    locale: NS,
    inject: injected,
  }, TrayRow))
}
