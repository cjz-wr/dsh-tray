import { resolveProfileDir } from "@deepseek-ai/dsh-app-boot";
import { Remote, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
//#region lib/types/config.js
/**
* Persistent tray configuration, kept as one small JSON file in the `web`
* profile directory so the tray preference survives restarts without touching
* the settings capability's schema. Corrupt or absent files fall back to the
* defaults: the tray is on and closing the window hides to the tray.
* @module @deepseek-ai/dsh-host-tray/config
*/
/** The config file name inside the profile directory. */
const TRAY_CONFIG_FILE = "tray.json";
/** Default tray config: enabled, and closing the window hides to the tray. */
const DEFAULT_TRAY_CONFIG = {
	enabled: true,
	closeBehavior: "tray"
};
/** The menu the plugin ships; the desktop shell maps the ids to actions. */
const DEFAULT_TRAY_MENU = [{
	id: "open",
	label: "打开主窗口"
}, {
	id: "quit",
	label: "退出"
}];
/** Read the persisted tray config, defaulting when absent or unparsable. */
function readTrayConfig(profileDir) {
	try {
		const raw = readFileSync(join(profileDir, TRAY_CONFIG_FILE), "utf8");
		const parsed = JSON.parse(raw);
		if (typeof parsed !== "object" || parsed === null) return { ...DEFAULT_TRAY_CONFIG };
		const record = parsed;
		return {
			enabled: typeof record.enabled === "boolean" ? record.enabled : DEFAULT_TRAY_CONFIG.enabled,
			closeBehavior: record.closeBehavior === "quit" ? "quit" : DEFAULT_TRAY_CONFIG.closeBehavior
		};
	} catch {
		return { ...DEFAULT_TRAY_CONFIG };
	}
}
/** Persist the tray config; a failed write is reported to the caller. */
function writeTrayConfig(profileDir, config) {
	writeFileSync(join(profileDir, TRAY_CONFIG_FILE), `${JSON.stringify(config, null, 2)}\n`, "utf8");
}
//#endregion
//#region lib/types/control.js
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
	closeBehavior: "tray",
	windowVisible: false
};
/** Read the control port the desktop shell advertised, or null without one. */
function readControlPort(env = process.env) {
	const raw = env.DSH_DESKTOP_CONTROL_PORT;
	if (typeof raw !== "string" || raw.length === 0) return null;
	const port = Number.parseInt(raw, 10);
	if (!Number.isInteger(port) || port <= 0 || port > 65535) return null;
	return String(port);
}
/** Error thrown when the desktop control service answers non-OK. */
var TrayControlError = class extends Error {
	/** @param message - the transport-level failure description. */
	constructor(message) {
		super(message);
		this.name = "TrayControlError";
	}
};
/** HTTP bridge client over the desktop shell's loopback control service. */
var HttpTrayControlClient = class {
	available;
	baseUrl;
	fetchImpl;
	/**
	* @param port - the control port, or null when no desktop shell is present.
	* @param fetchImpl - fetch seam (tests); defaults to the platform fetch.
	*/
	constructor(port, fetchImpl = fetch) {
		this.available = port !== null;
		this.baseUrl = `http://127.0.0.1:${port ?? "0"}`;
		this.fetchImpl = fetchImpl;
	}
	/** @inheritdoc */
	async status() {
		if (!this.available) return UNAVAILABLE;
		const response = await this.fetchImpl(`${this.baseUrl}/api/status`);
		if (!response.ok) throw new TrayControlError(`tray status failed with HTTP ${response.status}`);
		return await response.json();
	}
	/** @inheritdoc */
	async configure(request) {
		if (!this.available) return;
		const response = await this.fetchImpl(`${this.baseUrl}/api/configure`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(request)
		});
		if (!response.ok) throw new TrayControlError(`tray configure failed with HTTP ${response.status}`);
	}
	/** @inheritdoc */
	async showWindow() {
		if (!this.available) return;
		const response = await this.fetchImpl(`${this.baseUrl}/api/window/show`, { method: "POST" });
		if (!response.ok) throw new TrayControlError(`tray showWindow failed with HTTP ${response.status}`);
	}
	/** @inheritdoc */
	async quit() {
		if (!this.available) return;
		const response = await this.fetchImpl(`${this.baseUrl}/api/quit`, { method: "POST" });
		if (!response.ok) throw new TrayControlError(`tray quit failed with HTTP ${response.status}`);
	}
};
//#endregion
//#region lib/types/index.js
/**
* System-tray Remote: bridges the settings surface to the desktop shell's
* loopback control service. The OS tray itself is owned by the Electron main
* process; this gateway turns user configuration into control calls and
* persists the config in the `web` profile, so the tray state survives
* restarts. Without a desktop shell (plain `dsh web`) the gateway reports
* `available: false` and every action no-ops.
* @module @deepseek-ai/dsh-host-tray
*/
var __runInitializers = function(thisArg, initializers, value) {
	var useValue = arguments.length > 2;
	for (var i = 0; i < initializers.length; i++) value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
	return useValue ? value : void 0;
};
var __esDecorate = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
	function accept(f) {
		if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
		return f;
	}
	var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
	var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
	var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
	var _, done = false;
	for (var i = decorators.length - 1; i >= 0; i--) {
		var context = {};
		for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
		for (var p in contextIn.access) context.access[p] = contextIn.access[p];
		context.addInitializer = function(f) {
			if (done) throw new TypeError("Cannot add initializers after decoration has completed");
			extraInitializers.push(accept(f || null));
		};
		var result = (0, decorators[i])(kind === "accessor" ? {
			get: descriptor.get,
			set: descriptor.set
		} : descriptor[key], context);
		if (kind === "accessor") {
			if (result === void 0) continue;
			if (result === null || typeof result !== "object") throw new TypeError("Object expected");
			if (_ = accept(result.get)) descriptor.get = _;
			if (_ = accept(result.set)) descriptor.set = _;
			if (_ = accept(result.init)) initializers.unshift(_);
		} else if (_ = accept(result)) if (kind === "field") initializers.unshift(_);
		else descriptor[key] = _;
	}
	if (target) Object.defineProperty(target, contextIn.name, descriptor);
	done = true;
};
/** Remote-only service exposing tray control and status. */
let TrayGateway = (() => {
	let _classSuper = TypertRemoteService;
	let _instanceExtraInitializers = [];
	let _getStatus_decorators;
	let _configure_decorators;
	let _showWindow_decorators;
	let _quit_decorators;
	return class TrayGateway extends _classSuper {
		static {
			const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
			_getStatus_decorators = [Remote("getStatus")];
			_configure_decorators = [Remote("configure")];
			_showWindow_decorators = [Remote("showWindow")];
			_quit_decorators = [Remote("quit")];
			__esDecorate(this, null, _getStatus_decorators, {
				kind: "method",
				name: "getStatus",
				static: false,
				private: false,
				access: {
					has: (obj) => "getStatus" in obj,
					get: (obj) => obj.getStatus
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _configure_decorators, {
				kind: "method",
				name: "configure",
				static: false,
				private: false,
				access: {
					has: (obj) => "configure" in obj,
					get: (obj) => obj.configure
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _showWindow_decorators, {
				kind: "method",
				name: "showWindow",
				static: false,
				private: false,
				access: {
					has: (obj) => "showWindow" in obj,
					get: (obj) => obj.showWindow
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _quit_decorators, {
				kind: "method",
				name: "quit",
				static: false,
				private: false,
				access: {
					has: (obj) => "quit" in obj,
					get: (obj) => obj.quit
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			if (_metadata) Object.defineProperty(this, Symbol.metadata, {
				enumerable: true,
				configurable: true,
				writable: true,
				value: _metadata
			});
		}
		static inject = [];
		profileDir = __runInitializers(this, _instanceExtraInitializers);
		client;
		constructor(ctx, options = {}) {
			super(ctx, "tray");
			this.profileDir = options.profileDir ?? resolveProfileDir("web");
			this.client = options.client ?? new HttpTrayControlClient(options.controlPort === void 0 ? readControlPort() : options.controlPort);
			if (options.applyOnStart !== false && this.client.available) {
				const config = readTrayConfig(this.profileDir);
				this.client.configure(this.configureRequest(config)).catch(() => {});
			}
		}
		/**
		* Read the current tray/window state from the desktop shell.
		* @returns the live status, or an unavailable view without a shell.
		*/
		async getStatus() {
			return await this.client.status();
		}
		/**
		* Apply a tray configuration: persist it, then push it to the desktop shell
		* so the tray and close behavior change immediately. The shipped default
		* menu is used unless the surface supplied its own.
		* @param request - the tray configuration (menu optional).
		* @returns the resulting status after the shell applied it.
		*/
		async configure(request) {
			const menu = request.menu ?? [...DEFAULT_TRAY_MENU];
			writeTrayConfig(this.profileDir, {
				enabled: request.enabled,
				closeBehavior: request.closeBehavior
			});
			await this.client.configure({
				enabled: request.enabled,
				closeBehavior: request.closeBehavior,
				menu
			});
			return await this.client.status();
		}
		/**
		* Ask the desktop shell to show and focus the main window (tray menu
		* "open" action, or the settings surface's button).
		* @returns the resulting status.
		*/
		async showWindow() {
			await this.client.showWindow();
			return await this.client.status();
		}
		/**
		* Ask the desktop shell to quit; its before-quit stops the spawned `dsh
		* web` tree so no background process keeps repository files locked.
		*/
		async quit() {
			await this.client.quit();
		}
		configureRequest(config) {
			return {
				enabled: config.enabled,
				closeBehavior: config.closeBehavior,
				menu: [...DEFAULT_TRAY_MENU]
			};
		}
	};
})();
//#endregion
export { DEFAULT_TRAY_CONFIG, DEFAULT_TRAY_MENU, HttpTrayControlClient, TrayControlError, TrayGateway, TrayGateway as default, readControlPort, readTrayConfig, writeTrayConfig };
