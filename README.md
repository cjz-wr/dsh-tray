# dsh-tray

**English** | [中文](README.zh-CN.md)

A small plugin that hides the desktop DSH into the system tray, avoiding the
risk of the app being accidentally closed by clicking "Close".

> Note: This plugin only works with the desktop DSH. Installing it on the Web
> side will have no effect.

## Install

Search this repository in the plugin settings interface and click install
(requires the plugin marketplace to be installed), or from the CLI:

```sh
dsh plugin --profile <name> add github:cjz-wr/dsh-tray
```

`<name>` is a placeholder — replace it with the profile you want to install
into, e.g. `dsh plugin --profile web add github:cjz-wr/dsh-tray`. The official
DeepSeek Harness does not ship this tray, so installing into the standard
`web` profile works fine. The only conflict is with builds that already
compose a `tray` row in-box (such as the repo this package was extracted
from) — see the note below.

A newly installed bundle layer composes on the next process boot.

> **Build output is committed on purpose.** Git installs pull the repository as
> it is — nothing runs your `build` script. `lib/` is therefore committed so
> git/npm/tarball installs all work with zero build authorization; there is no
> `prepare` script. Rebuild locally with `npm run build` and commit the new
> `lib/` whenever `src/` changes.

> ⚠️ **Conflict only with builds that already ship the tray.** The official
> DeepSeek Harness does **not** include this tray — it is a standalone add-on,
> so it installs cleanly into any profile, `web` included. The one exception:
> a build that already composes a row with the id `tray` (e.g. the modified
> repo this package was extracted from, whose
> `packages/bundle/web-app/cordis.patch.yml` adds it) fails at boot with
> `duplicate loader entry id: tray` when this bundle mounts on top. In that
> case, install into a profile that does not include the built-in row.

## Contents

- `src/` — TypeScript sources (Host gateway + client settings face).
- `cordis.patch.yml` — the `dsh.bundle` patch layer (one loader row).
- `lib/` — build output, committed (see note above).
- `node_modules/` — local SDK junction links, git-ignored (not needed by users).

## Build

```sh
npm run build
```

Requires the harness toolchain (typescript + tsdown) resolvable at build time;
the extracted folder links the SDK packages it peers on.
