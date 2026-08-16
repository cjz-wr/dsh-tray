import { useEffect, useState, type ReactNode } from 'react'
import type {
  TrayConfigureRequest,
  TrayStatusView,
} from '../types.js'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import css from './TrayRow.module.css'

/** Registration-side Remote face used by the tray preference row. */
export interface TrayRowInjected {
  /** Read the desktop shell's current tray/window state. */
  getStatus: () => Promise<TrayStatusView>
  /** Persist and apply a tray configuration. */
  configure: (request: TrayConfigureRequest) => Promise<TrayStatusView>
  /** Ask the desktop shell to quit (its before-quit stops the spawned server). */
  quit: () => Promise<void>
}

/** Full component props assembled by the Settings slot renderer. */
export type TrayRowProps =
  PropsRuntime<'settings.general.item'>
  & PropsLocale<'settings.tray'>
  & InjectFace<TrayRowInjected>

type ViewState =
  | { readonly status: 'loading' }
  | { readonly status: 'error' }
  | { readonly status: 'ready'; readonly view: TrayStatusView }

/**
 * System-tray preference row in the General settings section: enable the
 * tray, choose the close-window behavior, and quit from the tray. Every
 * change applies immediately through the Host's `tray` Remote; failures keep
 * the previous view and surface an inline alert.
 */
export function TrayRow({ getStatus, configure, quit, t }: TrayRowProps): ReactNode {
  const [version, setVersion] = useState(0)
  const [state, setState] = useState<ViewState>({ status: 'loading' })
  const [saving, setSaving] = useState(false)
  const [saveFailed, setSaveFailed] = useState(false)
  const [quitting, setQuitting] = useState(false)
  const [quitFailed, setQuitFailed] = useState(false)

  useEffect(() => {
    let current = true
    setState({ status: 'loading' })
    void getStatus().then(
      (view) => { if (current) setState({ status: 'ready', view }) },
      () => { if (current) setState({ status: 'error' }) },
    )
    return () => { current = false }
  }, [getStatus, version])

  const retry = (): void => setVersion(value => value + 1)

  const apply = (request: TrayConfigureRequest): void => {
    setSaving(true)
    setSaveFailed(false)
    void configure(request).then(
      (view) => setState({ status: 'ready', view }),
      () => setSaveFailed(true),
    ).finally(() => setSaving(false))
  }

  if (state.status === 'loading') return null
  if (state.status === 'error') {
    return (
      <p role="alert" className={css.error}>{t('loadFailed')}
        <button type="button" onClick={retry} className={css.linkButton}>{t('retry')}</button>
      </p>
    )
  }

  const { view } = state
  const available = view.available

  return (
    <div className={css.panel}>
      <div className={css.banner} data-available={String(available)}>
        {available ? t('available') : t('unavailable')}
        {!available && <div className={css.hint}>{t('unavailableHint')}</div>}
      </div>

      <label className={css.row}>
        <span className={css.rowCopy}>
          <span className={css.rowTitle}>{t('enableTray')}</span>
          <span className={css.rowDesc}>{t('enableTrayDesc')}</span>
        </span>
        <input
          type="checkbox"
          data-tray-enabled
          checked={view.enabled}
          disabled={!available || saving}
          onChange={(event) => apply({
            enabled: event.target.checked,
            closeBehavior: view.closeBehavior,
          })}
        />
      </label>

      <label className={css.row}>
        <span className={css.rowCopy}>
          <span className={css.rowTitle}>{t('closeBehaviorDesc')}</span>
          <span className={css.rowDesc}>
            {view.closeBehavior === 'tray' ? t('closeBehaviorTray') : t('closeBehaviorQuit')}
          </span>
        </span>
        <input
          type="checkbox"
          data-close-to-tray
          checked={view.closeBehavior === 'tray' && view.enabled}
          disabled={!available || saving || !view.enabled}
          onChange={(event) => apply({
            enabled: view.enabled,
            closeBehavior: event.target.checked ? 'tray' : 'quit',
          })}
        />
      </label>

      <div className={css.actions}>
        <button
          type="button"
          data-quit-app
          className={`${css.button} ${css.danger}`}
          disabled={!available || saving || quitting}
          onClick={() => {
            setQuitting(true)
            setQuitFailed(false)
            void quit().catch(() => setQuitFailed(true)).finally(() => setQuitting(false))
          }}
        >
          {quitting ? t('saving') : t('quitApp')}
        </button>
      </div>

      {(saveFailed || quitFailed) && (
        <p role="alert" className={css.error}>{saveFailed ? t('saveFailed') : t('quitFailed')}</p>
      )}
    </div>
  )
}
