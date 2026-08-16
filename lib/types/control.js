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
/** The unavailable view returned when no desktop control service is reachable. */
const UNAVAILABLE = {
    available: false,
    enabled: false,
    closeBehavior: 'tray',
    windowVisible: false,
};
/** Read the control port the desktop shell advertised, or null without one. */
export function readControlPort(env = process.env) {
    const raw = env.DSH_DESKTOP_CONTROL_PORT;
    if (typeof raw !== 'string' || raw.length === 0)
        return null;
    const port = Number.parseInt(raw, 10);
    if (!Number.isInteger(port) || port <= 0 || port > 65535)
        return null;
    return String(port);
}
/** Error thrown when the desktop control service answers non-OK. */
export class TrayControlError extends Error {
    /** @param message - the transport-level failure description. */
    constructor(message) {
        super(message);
        this.name = 'TrayControlError';
    }
}
/** HTTP bridge client over the desktop shell's loopback control service. */
export class HttpTrayControlClient {
    available;
    baseUrl;
    fetchImpl;
    /**
     * @param port - the control port, or null when no desktop shell is present.
     * @param fetchImpl - fetch seam (tests); defaults to the platform fetch.
     */
    constructor(port, fetchImpl = fetch) {
        this.available = port !== null;
        this.baseUrl = `http://127.0.0.1:${port ?? '0'}`;
        this.fetchImpl = fetchImpl;
    }
    /** @inheritdoc */
    async status() {
        if (!this.available)
            return UNAVAILABLE;
        const response = await this.fetchImpl(`${this.baseUrl}/api/status`);
        if (!response.ok)
            throw new TrayControlError(`tray status failed with HTTP ${response.status}`);
        return await response.json();
    }
    /** @inheritdoc */
    async configure(request) {
        if (!this.available)
            return;
        const response = await this.fetchImpl(`${this.baseUrl}/api/configure`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(request),
        });
        if (!response.ok)
            throw new TrayControlError(`tray configure failed with HTTP ${response.status}`);
    }
    /** @inheritdoc */
    async showWindow() {
        if (!this.available)
            return;
        const response = await this.fetchImpl(`${this.baseUrl}/api/window/show`, { method: 'POST' });
        if (!response.ok)
            throw new TrayControlError(`tray showWindow failed with HTTP ${response.status}`);
    }
    /** @inheritdoc */
    async quit() {
        if (!this.available)
            return;
        const response = await this.fetchImpl(`${this.baseUrl}/api/quit`, { method: 'POST' });
        if (!response.ok)
            throw new TrayControlError(`tray quit failed with HTTP ${response.status}`);
    }
}
//# sourceMappingURL=control.js.map