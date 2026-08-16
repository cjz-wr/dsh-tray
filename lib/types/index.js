/**
 * System-tray Remote: bridges the settings surface to the desktop shell's
 * loopback control service. The OS tray itself is owned by the Electron main
 * process; this gateway turns user configuration into control calls and
 * persists the config in the `web` profile, so the tray state survives
 * restarts. Without a desktop shell (plain `dsh web`) the gateway reports
 * `available: false` and every action no-ops.
 * @module @deepseek-ai/dsh-host-tray
 */
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
import { resolveProfileDir } from '@deepseek-ai/dsh-app-boot';
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import { DEFAULT_TRAY_MENU, readTrayConfig, writeTrayConfig, } from "./config.js";
import { HttpTrayControlClient, readControlPort, } from "./control.js";
export { DEFAULT_TRAY_CONFIG, DEFAULT_TRAY_MENU, readTrayConfig, writeTrayConfig } from "./config.js";
export { HttpTrayControlClient, TrayControlError, readControlPort, } from "./control.js";
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
            _getStatus_decorators = [Remote('getStatus')];
            _configure_decorators = [Remote('configure')];
            _showWindow_decorators = [Remote('showWindow')];
            _quit_decorators = [Remote('quit')];
            __esDecorate(this, null, _getStatus_decorators, { kind: "method", name: "getStatus", static: false, private: false, access: { has: obj => "getStatus" in obj, get: obj => obj.getStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _configure_decorators, { kind: "method", name: "configure", static: false, private: false, access: { has: obj => "configure" in obj, get: obj => obj.configure }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _showWindow_decorators, { kind: "method", name: "showWindow", static: false, private: false, access: { has: obj => "showWindow" in obj, get: obj => obj.showWindow }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _quit_decorators, { kind: "method", name: "quit", static: false, private: false, access: { has: obj => "quit" in obj, get: obj => obj.quit }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static inject = [];
        profileDir = __runInitializers(this, _instanceExtraInitializers);
        client;
        constructor(ctx, options = {}) {
            super(ctx, 'tray');
            this.profileDir = options.profileDir ?? resolveProfileDir('web');
            this.client = options.client
                ?? new HttpTrayControlClient(options.controlPort === undefined ? readControlPort() : options.controlPort);
            // 启动时把持久化的托盘配置应用到桌面壳（无控制服务时静默跳过）。
            if (options.applyOnStart !== false && this.client.available) {
                const config = readTrayConfig(this.profileDir);
                void this.client.configure(this.configureRequest(config)).catch(() => { });
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
            writeTrayConfig(this.profileDir, { enabled: request.enabled, closeBehavior: request.closeBehavior });
            await this.client.configure({ enabled: request.enabled, closeBehavior: request.closeBehavior, menu });
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
                menu: [...DEFAULT_TRAY_MENU],
            };
        }
    };
})();
export { TrayGateway };
export default TrayGateway;
//# sourceMappingURL=index.js.map