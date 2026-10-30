# dsh-ui-provider-policy

DeepSeek Harness (dsh) 插件:在 WebUI 设置里新增一个专属的「供应商策略」分区,为 OpenAI 兼容(pi-ai)第三方供应商补上原生「模型」页缺失的**供应商级**配置控件:

- **全局供应商策略**:一套「默认推理强度 + 重试策略 + Developer 角色」,保存时应用到**所有** OpenAI 兼容(pi-ai)供应商及其全部模型(不再按供应商/按模型分别配置)
- **默认推理强度**(off / minimal / low / medium / high / xhigh / max,7 级,另可留空 = 供应商默认)—— 决定模型默认打开的推理等级;对话里仍可逐次选择
- **重试策略选择**:
  - **标准**:重试次数可调;沿用各供应商自己的可重试错误码与退避参数(没有策略时补全量 6 码含 QUOTA 与默认退避;若退避仍是「激进」预设则恢复宿主默认 2s/60s)
  - **激进**:重试次数**锁定 1000 次**(输入框禁用,不可调整),退避固定为 **1s → 2s → 4s → 上限 5s**,并关闭随机抖动
- **重试预览(函数图,自适配)**:按当前策略与次数绘制 dsh **真实**的退避函数 —— 横轴是重试次数、纵轴是该次重试的等待时间,曲线下面积即累计等待;坐标轴单位(ms / s / min / h)、网格与采样点随参数自动缩放(上千次重试自动抽样,不会画出 1000 个点),并标出「第 N 次起 X(封顶)」的拐点与累计总时长
- **Developer 角色三态**(自动 / 启用 / 禁用)
- **对话里的重试提示**(0.4.0):「默认 / 精简 / 隐藏」三档 —— 默认保留原生逐条记录;精简只在等待重试时显示一行、重试结束即收起;隐藏则完全不显示。API 不稳定时不再刷屏。偏好只保存在本机浏览器,不写入供应商配置
- **不再写模型级思考等级**:0.3.0 起只写供应商级字段;模型级「推理等级」交给官方「模型」页(0.2.1 起支持按模型自定义),插件不再向 `models[].reasoningEfforts` 补全任何等级

面板样式对齐原生设置页:标题 / 说明 / 行内布局、卡片描边、分段控件与保存按钮都使用 dsh 语义 token,明暗主题自动适配。

所有改动通过 `settings.mutate` 以路径级 ops 只写入 `llm-pi-ai` 命名空间内的供应商级策略字段(`reasoning` / `retryPolicy` / `compat.supportsDeveloperRole`),不触碰 `models` 与任何其他命名空间;面板数据在 `settings/document-updated` 推送时自动刷新(有未保存编辑时不打扰)。插件不改 dsh 安装树内任何文件,更新 dsh 后无需重打补丁。

English: A DeepSeek Harness (dsh) plugin that adds a dedicated "Provider Policy" section to the WebUI Settings, exposing the provider-level pi-ai fields the stock Models page omits: one global policy (default reasoning + retry strategy + developer-role compat) applied to every OpenAI-compatible (pi-ai) provider and all of its models. The retry strategy is either "standard" (editable count; each provider keeps its own backoff, while a backoff left on the aggressive preset is restored to the host defaults) or "aggressive" (count locked at 1000, waits 1s/2s/4s then a 5s cap, jitter off), and a self-scaling inline SVG preview plots the very backoff function the host runs. Since 0.3.0 the plugin **never writes model rows**: per-model reasoning levels are edited on the stock Models page (available since dsh 0.2.1), so the panel only writes provider-level policy fields.

## 0.3.0 变更(重要)

- 移除「模型默认开启思考」:过去保存时会为没有 `reasoningEfforts` 的模型补齐全量等级,让对话里的思考等级菜单常驻。dsh 0.2.1 起官方「模型」页已支持按模型**自定义推理等级**(开关 + 任意等级/取值行),这份补全不再必要,且会覆盖模型自身的能力声明。
- 现在保存**只写供应商级字段**,`models` 数组原样保留。历史上已被补全的模型不会自动清理:需要清除时到「模型」页把该模型的「推理等级」开关关掉(或删掉对应行)即可;不清除也仍可正常工作。
- 面板重构:策略拼装抽成纯函数 `policyOps`(只产出供应商级路径),重试预览的数学生成、样式表、行 / 控件 / 卡片组件分层;视觉对齐原生设置页。

## 0.4.1 修复:深色模式下的推理强度下拉框

- 「默认推理强度」原本使用原生 `<select>`;它的选项弹层不受页面主题控制,深色模式下会白底白字、偶尔闪黑。现改为完全自绘的主题下拉菜单,复用原生菜单面板 token(`--dsw-menu-surface-fill` + `--dsw-menu-backdrop-filter` + `--dsw-elevation-prominent`),浅色/深色都与应用一致。
- 补齐键盘与无障碍:`↑` / `↓` / `Home` / `End` / `Enter` / `Space` / `Esc` / `Tab`,按钮带 `aria-haspopup` / `aria-expanded`,选项列表使用 `role="listbox"` / `role="option"` / `aria-selected`;点击外部自动收起。

## 0.4.0 新增:对话里的重试提示

- 设置 → 供应商策略 → **对话里的重试提示**:三档「默认 / 精简 / 隐藏」,即时生效并跨重启保留(桌面端页面来源固定为 `dsh-app://app`,浏览器 localStorage 持久)。
- **默认**:与原生一致,每条重试在对话里各占一行,展开可看失败原因与延迟。
- **精简**:默认隐藏所有已结束的重试行,只在「等待重试」的 5s 倒计时期间显示一行 `正在重试模型请求 · n/1000 · 5s`;重试结束该行即收起,因此不会随步数累积。
- **隐藏**:完全不显示重试行;若回合最终失败,仍然由回末错误提示展示。
- 实现方式:以 `priority: -1` 向 `conversation.chat.node`(key `model-retry`)注册一个覆盖视图,shadow 原生 Chat 渲染器;「默认」档不注册,原生渲染完全不受影响。该偏好是纯浏览器端状态,不写 `llm-pi-ai` 或任何供应商配置。

## 0.3.1 修复

- **标准策略保存后被识别回激进**:标准策略此前会保留「激进」预设留下的退避(1s/5s、0 抖动)和 1000 次重试,重新加载时又命中激进判定。现在标准策略保存时会把仍是激进预设的退避恢复为宿主默认(初始 2s / 上限 60s),重试次数草稿也从标准默认的 10 起算;各供应商自定义过的退避仍原样保留。
- **重试预览在切换策略时不刷新**:标准模式此前按旧激进退避绘图,切换后曲线看起来毫无变化。现在预览始终绘制「这次保存将写入的参数」,切换标准/激进会立即更新次数、退避与累计等待。

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

### DSH 桌面端

桌面端**不读取 `web` profile**:它固定启动保留 profile `desktop`(目录 `~/.dsh/profiles/desktop`),所以要在桌面端里用,必须把插件单独装进这个 profile。

插件本身不需要为桌面端改任何东西:桌面端渲染的就是同一套 Web 前端(宿主进程加载 `@deepseek-ai/dsh-web-app`,0.2.1 起在系统分配的本地端口上服务),客户端的 `dsh.client.platform = "web"` 门槛照样通过。

PATH 里的普通 `dsh` / `npx @deepseek-ai/dsh` 会被明确拒绝(`profile "desktop" is managed exclusively by the Electron application`),必须用桌面端自带的 CLI —— 它自带 pnpm,不依赖 PATH 里的 Node/pnpm:

```powershell
& "$env:LOCALAPPDATA\Programs\DeepSeek Harness\resources\runtime\cli\bin\dsh.cmd" `
  plugin --profile desktop add link:C:/path/to/dsh-ui-provider-policy
```

一键安装器同样支持:先 `set DSH_PROFILE=desktop` 再双击 `install.cmd`,它会自动改用桌面端自带的 CLI(并跳过 Node / pnpm 自检)。

首次安装需**完全退出桌面端再重新打开**(只关窗口不算):bundle 列表只在启动时组合,运行中的宿主不会认出新插件。0.2.1 起已启用插件的更新支持依赖同步与热重载,无法热重载的变更仍会提示重启。重启后打开 **设置 → 供应商策略**。

## 兼容性

已在 **dsh 0.1.5-rc.2** 上核对通过(2026-09-20):把 rc.1 与 rc.2 的 npm 产物逐包下载后做 SHA1 比对,本插件触及的 20 个包(`dsh` / `dsh-client-modules` / `dsh-client-ui-settings` / `dsh-client-ui-settings-general` / `dsh-client-ui-settings-models` / `dsh-client-ui-settings-plugins` / `dsh-client-ui-model-selection` / `dsh-client-locale` / `dsh-api-remotes` / `dsh-api-settings-controller` / `dsh-settings` / `dsh-settings-file` / `dsh-base` / `dsh-web-app` / `dsh-app-boot` / `dsh-llm` / `dsh-llm-pi-ai` / `dsh-llm-retry` / `dsh-agent-default-model` / `dsh-web-frontend`)**除 package.json 的版本号与 Web 前端 dist 资源哈希外逐字节相同**,所以 rc.1 → rc.2 不需要改任何代码;本次 0.2.0 是新增功能,不是被迫适配。

已在 **dsh 0.2.0-rc.2**(DSH 官方桌面端自带的运行时)上核对:桌面端仍提供本插件依赖的 `settings.section` 插槽、`configForms` / `settingsSchema` / `remote.settings` 服务与 `window.__ModuleLoader__.load({id, factory})` 协议,插件在其中照常挂载(桌面端安装见上一节)。

已在 **dsh 0.2.1-rc.2 / 0.2.1-rc.3**(DSH 官方桌面端自带运行时)上核对:逐包比对 npm 产物并实测挂载,本插件依赖的插槽 / 服务 / 事件 / 客户端模块协议与 `llm-pi-ai` schema(供应商级 `reasoning`、`retryPolicy`、`compat.supportsDeveloperRole`,`models[].reasoningEfforts` 仍为 7 级)全部未变;`package.json` 声明 `engines.dsh: ">=0.1.7-rc.2 <0.3.0"`(0.2.1 起兼容性检查优先读取该区间,未声明时才回退到 `peerDependencies`)。

**0.3.0** 于 **2026-10-27** 在 **dsh 0.2.1-rc.3** 桌面端实机回归:设置分区正常显示、读值正确、保存链路成功;`cordis.patch.yml` 保存前后逐字节相同(策略未变),且保存不再写 `models`。上游「模型」页已提供按模型自定义推理等级(Reasoning levels)的开关与行编辑器,因此插件移除了原先的等级补全逻辑。**0.3.1** 同日修复标准模式保存后回落激进、切换策略时预览不刷新两个问题,并完成上述回归。 **0.4.0** 于 **2026-10-30** 在 **dsh 0.2.1-rc.5** 桌面端实机回归:重试提示三档切换即时生效、已结束的重试行全部收起、"默认"档恢复原生 64 行历史记录且不误恢复 Chat 自身隐藏的 22 行(逐行保存/恢复原 hidden 状态)。 **0.4.1** 于同日核对深色主题:`<html style="color-scheme: dark">` 下自绘菜单背景为 `rgba(67,69,74,0.45)` + 原生菜单模糊阴影,不再出现白底白字的原生弹层。

| 本插件依赖 | 0.2.1-rc.3 |
| --- | --- |
| `settings.section` 插槽(`kind: list`,`id` / `order` / `label`) | 不变 |
| 六个服务:`slots` / `locale` / `remote` / `remote.settings` / `configForms` / `settingsSchema` | 不变 |
| `configForms.describe()` → `ensure()` / `getSnapshot()`(`view.namespaces` / `view.writable`) | 不变 |
| `settingsSchema.getPath(value, path)` | 不变 |
| `remote.settings.mutate(ns, ops, revision)` → `{ ok, error: { code, message } }`,含 `settings/conflict` | 不变 |
| `remote.$on("settings/document-updated")` | 不变 |
| 客户端模块协议 `window.__ModuleLoader__.load({ id, factory })` / `dsh.client` 字段 | 不变 |
| 平台 seed word `react` / `react/jsx-runtime` | 不变 |
| 写入的 `llm-pi-ai` schema:`reasoning`、`compat.supportsDeveloperRole`、`retryPolicy`(`mode` / `maxRetries` / `retryableCodes` / `backoff`) | 全部仍合法 |
| `models[].reasoningEfforts` | 0.3.0 起不再写入(由官方「模型」页维护) |

上游「模型」页在 0.2.1 中为自定义供应商的每个模型提供 Reasoning levels(`models[].reasoningEfforts`)编辑,但仍**刻意**不提供供应商级推理强度、重试策略与 Developer 角色控件(推理等级属于按模型的能力,而供应商级控件只能被设成部分模型会拒绝的值)。本插件补的正是这些供应商级策略;模型级等级完全交给上游,避免覆盖模型自身的能力声明。

## 重试语义

预览图画的是宿主 `@deepseek-ai/dsh-llm-retry` 真正执行的退避:第 n 次重试等待 `min(initialDelayMs × 2^(n-1), maxDelayMs)`,再乘一个 `[1-jitter, 1+jitter]` 的随机因子并封顶。因此:

| 策略 | 写入的 retryPolicy | 实际等待 |
| --- | --- | --- |
| 标准 | `mode: normal` + 你的次数,保留各供应商原有 `retryableCodes` / `backoff`(缺失时补 6 码与 `2000/60000`;仍是激进预设时恢复 `2000/60000`) | 例如 2000/60000:2s、4s、8s、16s、32s、之后每次 1min |
| 激进 | `mode: normal` + `maxRetries: 1000` + `backoff: { initialDelayMs: 1000, maxDelayMs: 5000, jitterRatio: 0 }` | 1s、2s、4s、之后每次 5s(1000 次累计约 1.4 小时) |

「激进」把抖动设为 0,是为了让等待严格等于 1s / 2s / ……;标准策略不写 `jitterRatio`,沿用宿主默认(±10%),预览图按标称值绘制并在图下注明。

## 文件

| 文件 | 作用 |
| --- | --- |
| `package.json` | `dsh.bundle.patch`(bundle 层声明)+ `dsh.client`(浏览器端 roster) |
| `cordis.patch.yml` | 一行 Loader 条目,URL `/plugins/dsh-ui-provider-policy/client.js` 由包名派生 |
| `lib/index.js` | 服务端 no-op 入口 |
| `lib/client.js` | 面板本体:注册 `settings.section` 插槽;纯函数拼装供应商级 ops、重试预览 SVG、行 / 分段控件与注入式样式表;另按本机偏好 shadow `conversation.chat.node` 的 `model-retry` 行 |
| `install.cmd` | Windows 双击即装的启动器(纯 ASCII,任何代码页下解析一致) |
| `install.ps1` | 安装本体(PowerShell 5.1+,UTF-8 带 BOM,中文界面;Win10/11 自带,无额外依赖) |
