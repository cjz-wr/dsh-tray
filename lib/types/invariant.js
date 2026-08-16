/** Package-owned invariant companion. @module dsh-tray/invariant */
const PACKAGE_NAME = 'dsh-tray';
/** Cordis companion plugin name. */
export const name = 'dsh-tray-invariant';
/** Service required before the companion can reserve package ownership. */
export const inject = ['invariants'];
/** No runtime invariant: this package owns a remote-backed Settings contribution. */
const install = () => { };
/** Register this package's invariant companion. */
export const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
/* jscpd:ignore-end */
//# sourceMappingURL=invariant.js.map