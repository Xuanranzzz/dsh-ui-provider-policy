# dsh-ui-provider-policy

DeepSeek Harness (dsh) 插件:在 WebUI 设置里新增一个专属的「供应商策略」分区,为 OpenAI 兼容(pi-ai)第三方供应商补上原生「模型」页缺失的配置控件:

- **全局供应商策略**:一套「默认推理强度 + 重试策略 + Developer 角色」,保存时应用到**所有** OpenAI 兼容(pi-ai)供应商及其全部模型(不再按供应商/按模型分别配置)
- **默认推理强度**(off / minimal / low / medium / high / xhigh / max,7 级)—— 决定模型默认打开的推理等级
- **重试策略选择**:
  - **标准**:重试次数可调;沿用各供应商自己的可重试错误码与退避参数(没有策略时补全量 6 码含 QUOTA 与默认退避)
  - **激进**:重试次数**锁定 1000 次**(输入框禁用,不可调整),退避固定为 **1s → 2s → 4s → 上限 5s**,并关闭随机抖动
- **重试预览(函数图,自适配)**:按当前策略与次数绘制 dsh **真实**的退避函数 —— 横轴是重试次数、纵轴是该次重试的等待时间,曲线下面积即累计等待;坐标轴单位(ms / s / min / h)、网格与采样点随参数自动缩放(上千次重试自动抽样,不会画出 1000 个点),并标出「第 N 次起 X(封顶)」的拐点与累计总时长
- **Developer 角色三态**(自动 / 启用 / 禁用)
- **所有模型默认开启思考**:保存时给每个供应商的每个模型写入全量 `reasoningEfforts`,使对话里模型下拉框的思考等级菜单**常驻**
- **思考等级在对话里选**:对话模型下拉框逐次选择(`off` / 跟随供应商默认 / 任一等级),「跟随默认」即「默认推理强度」;选 `off` 则关闭思考

所有改动通过 `settings.mutate` 以路径级 ops 写入 `llm-pi-ai` 命名空间,不触碰其他字段;面板数据在 `settings/document-updated` 推送时自动刷新(有未保存编辑时不打扰)。插件不改 dsh 安装树内任何文件,更新 dsh 后无需重打补丁。

English: A DeepSeek Harness (dsh) plugin that adds a dedicated "Provider Policy" section to the WebUI Settings, exposing pi-ai provider fields the stock Models page omits: a single global policy (default reasoning + retry strategy + developer-role compat) applied to every OpenAI-compatible (pi-ai) provider and all of its models. The retry strategy is either "standard" (editable count, each provider keeps its own backoff) or "aggressive" (count locked at 1000, waits 1s/2s/4s then a 5s cap, jitter off), and a self-scaling inline SVG preview plots the very backoff function the host runs — wait per retry against retry number, with the area under the curve equal to the cumulative wait. All models get thinking enabled (full reasoningEfforts) so the chat dialog's model dropdown always shows the reasoning menu.

## 安装

### Windows 一键安装(双击即可)

双击仓库根目录的 `install.cmd`(它调用 Windows 自带的 PowerShell 执行 `install.ps1`,不引入任何第三方依赖)。安装器只依赖已有的 Node.js / dsh:

- `install.cmd` 是**纯 ASCII** 启动器:Win10 的 cmd 解析含 UTF-8 中文的批处理会在代码页切换时错位,把后续行读成乱码命令,所以启动器刻意不含任何非 ASCII 字节,在任何 Windows 版本/代码页下解析一致
- `install.ps1`(UTF-8 带 BOM,中文界面)才是安装本体,由 Windows 10/11 自带的 PowerShell 5.1 执行
- 自检 Node.js;`dsh` 不在 PATH 时自动改用 `npx -y @deepseek-ai/dsh`
- 自检 pnpm(缺失时先用 Node 自带的 corepack 启用,仍不行才 `npm install -g pnpm`)
- 让你选择安装源:`[1]` 本地当前目录(link:,默认)/ `[2]` GitHub 仓库 / `[3]` 手动输入插件目录(可直接粘贴带引号的路径)
- 装完回读 profile 清单校验,再提示你手动重启 dsh

> 需要装到别的 profile 时,先 `set DSH_PROFILE=名字` 再运行(默认 `web`)。

### 命令行

```powershell
dsh plugin --profile web add github:Xuanranzzz/dsh-ui-provider-policy
```

本地开发(改动即时生效,client-hmr 热更新):

```powershell
dsh plugin --profile web add link:C:/path/to/dsh-ui-provider-policy
```

安装后重启 `dsh web`,浏览器打开 http://127.0.0.1:3080 → 设置 → 供应商策略。

## 兼容性

已在 **dsh 0.1.5-rc.2** 上核对通过(2026-09-20):把 rc.1 与 rc.2 的 npm 产物逐包下载后做 SHA1 比对,本插件触及的 20 个包(`dsh` / `dsh-client-modules` / `dsh-client-ui-settings` / `dsh-client-ui-settings-general` / `dsh-client-ui-settings-models` / `dsh-client-ui-settings-plugins` / `dsh-client-ui-model-selection` / `dsh-client-locale` / `dsh-api-remotes` / `dsh-api-settings-controller` / `dsh-settings` / `dsh-settings-file` / `dsh-base` / `dsh-web-app` / `dsh-app-boot` / `dsh-llm` / `dsh-llm-pi-ai` / `dsh-llm-retry` / `dsh-agent-default-model` / `dsh-web-frontend`)**除 package.json 的版本号与 Web 前端 dist 资源哈希外逐字节相同**,所以 rc.1 → rc.2 不需要改任何代码;本次 0.2.0 是新增功能,不是被迫适配。

| 本插件依赖 | 0.1.5-rc.2 |
| --- | --- |
| `settings.section` 插槽(`kind: list`,`id` / `order` / `label`) | 不变 |
| 六个服务:`slots` / `locale` / `remote` / `remote.settings` / `settingsScope` / `settingsSchema` | 不变 |
| `settingsScope.describe()` → `ensure()` / `getSnapshot()`(`view.namespaces` / `view.writable`) | 不变 |
| `settingsSchema.getPath(value, path)` | 不变 |
| `remote.settings.mutate(ns, ops, revision)` → `{ ok, error: { code, message } }`,含 `settings/conflict` | 不变 |
| `remote.$on("settings/document-updated")` | 不变 |
| 客户端模块协议 `window.__ModuleLoader__.load({ id, factory })` / `dsh.client` 字段 | 不变 |
| 平台 seed word `react` / `react/jsx-runtime` | 不变 |
| 写入的 `llm-pi-ai` schema:`reasoning`、`compat.supportsDeveloperRole`、`models[].reasoningEfforts`(仍是 7 级)、`retryPolicy`(`mode` / `maxRetries` / `retryableCodes` / `backoff`) | 全部仍合法 |

上游「模型」页在 0.1.5-rc.2 中仍然**刻意**不提供推理强度与重试策略控件(effort 属于按模型的能力,而供应商级控件只能被设成部分模型会拒绝的值),所以本插件补的这几项仍然缺失。

English: Verified against dsh 0.1.5-rc.2 — every slot, service, event, transport call, client-module protocol field, and settings-schema field this plugin uses is unchanged (the rc.1 and rc.2 npm artifacts differ only in package.json version strings and rebuilt web-frontend assets).

## 重试语义

预览图画的是宿主 `@deepseek-ai/dsh-llm-retry` 真正执行的退避:第 n 次重试等待 `min(initialDelayMs × 2^(n-1), maxDelayMs)`,再乘一个 `[1-jitter, 1+jitter]` 的随机因子并封顶。因此:

| 策略 | 写入的 retryPolicy | 实际等待 |
| --- | --- | --- |
| 标准 | `mode: normal` + 你的次数,保留各供应商原有 `retryableCodes` / `backoff`(缺失时补 6 码与 `2000/60000`) | 例如 2000/60000:2s、4s、8s、16s、32s、之后每次 1min |
| 激进 | `mode: normal` + `maxRetries: 1000` + `backoff: { initialDelayMs: 1000, maxDelayMs: 5000, jitterRatio: 0 }` | 1s、2s、4s、之后每次 5s(1000 次累计约 1.4 小时) |

「激进」把抖动设为 0,是为了让等待严格等于 1s / 2s / ……;标准策略不写 `jitterRatio`,沿用宿主默认(±10%),预览图按标称值绘制并在图下注明。

## 文件

| 文件 | 作用 |
| --- | --- |
| `package.json` | `dsh.bundle.patch`(bundle 层声明)+ `dsh.client`(浏览器端 roster) |
| `cordis.patch.yml` | 一行 Loader 条目,URL `/plugins/dsh-ui-provider-policy/client.js` 由包名派生 |
| `lib/index.js` | 服务端 no-op 入口 |
| `lib/client.js` | 面板本体:注册 `settings.section` 插槽,读写 `llm-pi-ai` 命名空间,内置重试预览 SVG |
| `install.cmd` | Windows 双击即装的启动器(纯 ASCII,任何代码页下解析一致) |
| `install.ps1` | 安装本体(PowerShell 5.1+,UTF-8 带 BOM,中文界面;Win10/11 自带,无额外依赖) |
