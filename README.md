# dsh-ui-provider-policy

DeepSeek Harness (dsh) 插件:在 WebUI 设置里新增一个专属的「供应商策略」分区,为 OpenAI 兼容(pi-ai)第三方供应商补上原生「模型」页缺失的配置控件:

- **全局供应商策略**:一套「默认推理强度 + 重试次数 + Developer 角色」,保存时应用到**所有** OpenAI 兼容(pi-ai)供应商及其全部模型(不再按供应商/按模型分别配置)
- **默认推理强度**(off / minimal / low / medium / high / xhigh / max,7 级)—— 决定模型默认打开的推理等级
- **重试次数**:统一写入所有供应商的 `retryPolicy.maxRetries`(模式固定 normal;供应商已有的可重试错误码与退避参数保持不变,没有策略时补全量 6 码含 QUOTA 与默认退避)
- **Developer 角色三态**(自动 / 启用 / 禁用)
- **所有模型默认开启思考**:保存时给每个供应商的每个模型写入全量 `reasoningEfforts`,使对话里模型下拉框的思考等级菜单**常驻**
- **思考等级在对话里选**:对话模型下拉框逐次选择(`off` / 跟随供应商默认 / 任一等级),「跟随默认」即「默认推理强度」;选 `off` 则关闭思考

所有改动通过 `settings.mutate` 以路径级 ops 写入 `llm-pi-ai` 命名空间,不触碰其他字段;面板数据在 `settings/document-updated` 推送时自动刷新(有未保存编辑时不打扰)。插件不改 dsh 安装树内任何文件,更新 dsh 后无需重打补丁。

English: A DeepSeek Harness (dsh) plugin that adds a dedicated "Provider Policy" section to the WebUI Settings, exposing pi-ai provider fields the stock Models page omits: a single global policy (default reasoning + retry count + developer-role compat) applied to every OpenAI-compatible (pi-ai) provider and all of their models. All models get thinking enabled (full reasoningEfforts) so the chat dialog's model dropdown always shows the reasoning menu, where the per-conversation level is chosen (off / provider default / any level).

## 安装

```powershell
dsh plugin --profile web add github:Xuanranzzz/dsh-ui-provider-policy
```

本地开发(改动即时生效,client-hmr 热更新):

```powershell
dsh plugin --profile web add link:C:/path/to/dsh-ui-provider-policy
```

安装后重启 `dsh web`,浏览器打开 http://127.0.0.1:3080 → 设置 → 供应商策略。

## 文件

| 文件 | 作用 |
| --- | --- |
| `package.json` | `dsh.bundle.patch`(bundle 层声明)+ `dsh.client`(浏览器端 roster) |
| `cordis.patch.yml` | 一行 Loader 条目,URL `/plugins/dsh-ui-provider-policy/client.js` 由包名派生 |
| `lib/index.js` | 服务端 no-op 入口 |
| `lib/client.js` | 面板本体:注册 `settings.section` 插槽,读写 `llm-pi-ai` 命名空间 |
