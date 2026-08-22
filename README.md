# dsh-ui-provider-policy

DeepSeek Harness (dsh) 插件:在 WebUI 设置里新增一个专属的「供应商策略」分区,为 OpenAI 兼容(pi-ai)第三方供应商补上原生「模型」页缺失的配置控件:

- **默认推理强度**(off / minimal / low / medium / high / xhigh / max,7 级)
- **重试策略**:重试次数、可重试错误码复选(含 QUOTA —— 429 配额错误的分类码,官方默认白名单不含它)、指数退避参数与预览(如 `2s → 4s → 8s → 16s → 32s → 60s+`)
- **Developer 角色三态**(自动 / 启用 / 禁用,写入 `compat.supportsDeveloperRole`)
- **每模型思考模式**(继承 / 开启 / 关闭)+ 7 级推理强度复选(写入 `reasoningEfforts` 映射)
- **全局重试策略卡**:一键把同一份 retryPolicy 写入所有 pi-ai 供应商

所有改动通过 `settings.mutate` 以路径级 ops 写入 `llm-pi-ai` 命名空间,不触碰其他字段;面板数据在 `settings/document-updated` 推送时自动刷新(有未保存编辑时不打扰)。插件不改 dsh 安装树内任何文件,更新 dsh 后无需重打补丁。

English: A DeepSeek Harness (dsh) plugin that adds a dedicated "Provider Policy" section to the WebUI Settings, exposing pi-ai provider fields the stock Models page omits: default reasoning effort, retry policy with QUOTA-aware retryable codes and exponential backoff, developer-role compat, per-model reasoning levels, and a global apply-to-all retry card.

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
