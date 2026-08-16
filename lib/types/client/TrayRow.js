import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import css from './TrayRow.module.css';
/**
 * System-tray preference row in the General settings section: enable the
 * tray, choose the close-window behavior, and quit from the tray. Every
 * change applies immediately through the Host's `tray` Remote; failures keep
 * the previous view and surface an inline alert.
 */
export function TrayRow({ getStatus, configure, quit, t }) {
    const [version, setVersion] = useState(0);
    const [state, setState] = useState({ status: 'loading' });
    const [saving, setSaving] = useState(false);
    const [saveFailed, setSaveFailed] = useState(false);
    const [quitting, setQuitting] = useState(false);
    const [quitFailed, setQuitFailed] = useState(false);
    useEffect(() => {
        let current = true;
        setState({ status: 'loading' });
        void getStatus().then((view) => { if (current)
            setState({ status: 'ready', view }); }, () => { if (current)
            setState({ status: 'error' }); });
        return () => { current = false; };
    }, [getStatus, version]);
    const retry = () => setVersion(value => value + 1);
    const apply = (request) => {
        setSaving(true);
        setSaveFailed(false);
        void configure(request).then((view) => setState({ status: 'ready', view }), () => setSaveFailed(true)).finally(() => setSaving(false));
    };
    if (state.status === 'loading')
        return null;
    if (state.status === 'error') {
        return (_jsxs("p", { role: "alert", className: css.error, children: [t('loadFailed'), _jsx("button", { type: "button", onClick: retry, className: css.linkButton, children: t('retry') })] }));
    }
    const { view } = state;
    const available = view.available;
    return (_jsxs("div", { className: css.panel, children: [_jsxs("div", { className: css.banner, "data-available": String(available), children: [available ? t('available') : t('unavailable'), !available && _jsx("div", { className: css.hint, children: t('unavailableHint') })] }), _jsxs("label", { className: css.row, children: [_jsxs("span", { className: css.rowCopy, children: [_jsx("span", { className: css.rowTitle, children: t('enableTray') }), _jsx("span", { className: css.rowDesc, children: t('enableTrayDesc') })] }), _jsx("input", { type: "checkbox", "data-tray-enabled": true, checked: view.enabled, disabled: !available || saving, onChange: (event) => apply({
                            enabled: event.target.checked,
                            closeBehavior: view.closeBehavior,
                        }) })] }), _jsxs("label", { className: css.row, children: [_jsxs("span", { className: css.rowCopy, children: [_jsx("span", { className: css.rowTitle, children: t('closeBehaviorDesc') }), _jsx("span", { className: css.rowDesc, children: view.closeBehavior === 'tray' ? t('closeBehaviorTray') : t('closeBehaviorQuit') })] }), _jsx("input", { type: "checkbox", "data-close-to-tray": true, checked: view.closeBehavior === 'tray' && view.enabled, disabled: !available || saving || !view.enabled, onChange: (event) => apply({
                            enabled: view.enabled,
                            closeBehavior: event.target.checked ? 'tray' : 'quit',
                        }) })] }), _jsx("div", { className: css.actions, children: _jsx("button", { type: "button", "data-quit-app": true, className: `${css.button} ${css.danger}`, disabled: !available || saving || quitting, onClick: () => {
                        setQuitting(true);
                        setQuitFailed(false);
                        void quit().catch(() => setQuitFailed(true)).finally(() => setQuitting(false));
                    }, children: quitting ? t('saving') : t('quitApp') }) }), (saveFailed || quitFailed) && (_jsx("p", { role: "alert", className: css.error, children: saveFailed ? t('saveFailed') : t('quitFailed') }))] }));
}
//# sourceMappingURL=TrayRow.js.map