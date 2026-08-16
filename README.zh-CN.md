# dsh-tray

**中文** | [English](README.md)

一个可以将桌面端 DSH 隐藏到系统托盘的小插件，避免误点「关闭」导致应用意外退出的风险。

> 注意：该插件仅适用于桌面端 DSH，在 Web 端安装无法生效。

## 安装

在 插件设置界面中搜索本仓库并点击安装(前提是安装了插件市场)，或通过命令行安装：

```sh
dsh plugin --profile <name> add github:cjz-wr/dsh-tray
```

`<name>` 是占位符，请替换成你要安装的 profile 名称，例如 `dsh plugin --profile web add github:cjz-wr/dsh-tray`。官方 DeepSeek Harness **没有内置**本托盘，装进标准的 `web` profile 完全没问题。唯一的冲突场景是：你的构建**已经内置了 `tray` 行**（例如本插件来源的那个被修改过的仓库）——见下方说明。

新安装的 bundle 层将在下次进程启动时组合生效。

> **构建产物是特意提交的。** Git 安装会按仓库原样拉取——不会运行你的 `build` 脚本。因此 `lib/` 被提交到仓库中，这样 git/npm/tarball 安装都无需任何构建授权即可使用；这里没有 `prepare` 脚本。每当 `src/` 发生变化时，请使用 `npm run build` 在本地重新构建并提交新的 `lib/`。

> ⚠️ **仅与已内置托盘的构建冲突。** 官方 DeepSeek Harness **没有**包含本托盘——它是独立的附加插件，装进任何 profile（包括 `web`）都不会冲突。唯一的例外：如果某个构建已经组合了 `id` 为 `tray` 的行（例如本插件来源的那个被修改过的仓库，其 `packages/bundle/web-app/cordis.patch.yml` 添加了该行），再叠装本 bundle 会因 `duplicate loader entry id: tray` 启动失败。这种情况请装进不含内置行的 profile。

## 目录结构

- `src/` — TypeScript 源码（Host 网关 + 客户端设置界面）。
- `cordis.patch.yml` — `dsh.bundle` 补丁层（一行 loader）。
- `lib/` — 构建输出，已提交（见上方说明）。
- `node_modules/` — 本地 SDK 链接，git 已忽略（用户无需使用）。

## 构建

```sh
npm run build
```

构建时需要可解析的 harness 工具链（typescript + tsdown）；抽取出的文件夹链接了它所依赖的 SDK 包。
