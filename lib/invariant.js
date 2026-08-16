//#region lib/types/invariant.js
/** Package-owned invariant companion. @module dsh-tray/invariant */
const PACKAGE_NAME = "dsh-tray";
/** Cordis companion plugin name. */
const name = "dsh-tray-invariant";
/** Service required before the companion can reserve package ownership. */
const inject = ["invariants"];
/** No runtime invariant: this package owns a remote-backed Settings contribution. */
const install = () => {};
/** Register this package's invariant companion. */
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
