window.__ModuleLoader__.load({
	id: "dsh-ui-provider-policy",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		const { jsx, jsxs, Fragment } = react_jsx_runtime;
		const { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } = react;

		// ══ settings shape ══════════════════════════════════════════════════
		/** Locale dictionary namespace this panel registers. */
		const LOCALE_NS = "settings.providerPolicy";
		/** pi-ai settings namespace this panel reads and writes. */
		const SETTINGS_NS = "llm-pi-ai";
		/** Every pi-ai thinking level a provider default may name, in escalation order. */
		const THINKING_LEVELS = ["off", "minimal", "low", "medium", "high", "xhigh", "max"];
		/** Retryable error codes written when a provider has no explicit whitelist.
		 * QUOTA is NOT in the host's compiled default whitelist, so quota-shaped 429s
		 * only retry when it is listed explicitly. */
		const RETRYABLE_CODES = ["EMPTY_RESPONSE", "RATE_LIMIT", "QUOTA", "SERVER", "TIMEOUT", "TRANSPORT"];
		/** Host backoff defaults, used when a provider carries no backoff of its own. */
		const DEFAULT_BACKOFF = { initialDelayMs: 2000, maxDelayMs: 60000 };
		/** The host's own jitter default, mirrored by the preview. */
		const DEFAULT_JITTER_RATIO = 0.1;
		/** Retry strategy ids this panel can write; both resolve to the host's normal mode. */
		const STRATEGY_STANDARD = "standard";
		const STRATEGY_AGGRESSIVE = "aggressive";
		/** The aggressive preset: waits of 1s, 2s, 4s, then a 5s cap — 1000 retries, no jitter. */
		const AGGRESSIVE = { maxRetries: 1000, backoff: { initialDelayMs: 1000, maxDelayMs: 5000, jitterRatio: 0 } };
		/** Retry count shown when the stored policy carries none. */
		const FALLBACK_RETRY_COUNT = 10;
		/** Conversation slot the stock Chat renderer uses for correlated retry chains. */
		const CONVERSATION_NODE_SLOT = "conversation.chat.node";
		/** Node kind the stock Chat renderer registers for retry chains. */
		const RETRY_NODE_KEY = "model-retry";
		/** Browser-local key carrying the retry-notice display mode. */
		const RETRY_NOTICE_KEY = "ui-provider-policy.retry-notices";
		/** Display modes, in panel order: stock rows, a live line only, or nothing. */
		const RETRY_NOTICE_MODES = ["default", "compact", "silent"];
		/** Stock behavior: every retry row stays in the transcript. */
		const RETRY_NOTICE_DEFAULT = "default";

		// ══ copy ════════════════════════════════════════════════════════════
		/** English strings (the key-set source of truth for this pair). */
		const en = {
			nav: "Provider Policy",
			title: "Provider Policy",
			intro: "Provider-level controls the stock Models page omits: a default reasoning level, a retry strategy with a live preview, and developer-role compat for OpenAI-compatible (pi-ai) providers.",
			loading: "Loading settings…",
			noProviders: "No pi-ai providers are configured yet.",
			readOnly: "Settings are read-only in this browser.",
			namespaceMissing: "The llm-pi-ai settings namespace is not available.",
			loadFailed: "Failed to load settings.",
			globalTitle: "Global provider policy",
			globalHint: "One save applies to every pi-ai provider and all of its models. Per-model reasoning levels live on the Models page; each conversation can still pick its own level.",
			providerCountOne: "1 provider",
			providerCountMany: "{count} providers",
			defaultReasoning: "Default reasoning",
			defaultReasoningHint: "Used when a conversation does not pick its own level. “Provider default” writes nothing and keeps the provider's own setting.",
			defaultReasoningUnset: "Provider default",
			developerRole: "Developer role",
			developerRoleHint: "Auto follows the adapter's own detection; disable it when the gateway rejects the developer role.",
			developerRoleAuto: "Automatic",
			developerRoleEnabled: "Enabled",
			developerRoleDisabled: "Disabled",
			retryStrategy: "Retry strategy",
			strategyStandard: "Standard",
			strategyAggressive: "Aggressive",
			strategyStandardHint: "Retry count is editable; each provider keeps its retryable codes, and a backoff still on the aggressive preset is restored to host defaults (2s/60s).",
			strategyAggressiveHint: "Retry count is locked at 1000; waits become 1s, 2s, 4s, then a 5s cap, with jitter off.",
			retryCount: "Retry count",
			retryCountHint: "Maximum retries after a failure; 0 ends the step on the first failure.",
			retryLocked: "Locked at 1000 by the aggressive strategy.",
			retryInvalid: "Retry count must be a non-negative integer.",
			retryUnit: "retries",
			retryPreview: "Retry preview",
			previewAt: "#{n} {d}",
			previewCapFrom: "from #{n} {d} (cap)",
			previewTotal: "{count} retries · ≈ {total} of cumulative wait",
			previewNone: "Zero retries: a failure ends the step instead of retrying.",
			previewParamsStandard: "Standard keeps every provider's backoff (restoring host defaults over the aggressive preset); the curve reads the first provider's post-save values — initial {initial}, cap {max}, ×2, jitter ±{percent}%",
			previewParamsAggressive: "Aggressive writes this backoff into every provider — initial {initial}, cap {max}, ×2, no jitter",
			axisTime: "wait",
			save: "Save",
			saveHint: "Edits are written only when you save.",
			saving: "Saving…",
			savedAt: "Saved",
			saveFailed: "Save failed.",
			retryNoticeTitle: "Retry notices in chat",
			retryNoticeHint: "When the API is flaky, every retry leaves a row in the transcript. Control how those rows appear; the choice applies immediately.",
			retryNoticeModeLabel: "Display",
			retryNoticeDefault: "Default",
			retryNoticeCompact: "Compact",
			retryNoticeSilent: "Hidden",
			retryNoticeModeDefault: "Every retry keeps a row, with failure and delay details on expand (stock behavior).",
			retryNoticeModeCompact: "One live line while a retry waits; the row collapses away once the retry resolves.",
			retryNoticeModeSilent: "Retry rows are hidden entirely; a failed turn still shows its error.",
			retryNoticeNote: "Stored in this browser only — it never writes to provider settings.",
			retryNoticeActive: "Retrying model request · {retry}/{maximum} · {seconds}s"
		};
		/** Chinese strings. */
		const zh = {
			nav: "供应商策略",
			title: "供应商策略",
			intro: "为 OpenAI 兼容(pi-ai)供应商补上「模型」页没有的供应商级控件:默认推理强度、重试策略与预览、Developer 角色兼容。",
			loading: "正在加载设置…",
			noProviders: "尚未配置任何 pi-ai 供应商。",
			readOnly: "此浏览器对设置为只读。",
			namespaceMissing: "llm-pi-ai 设置命名空间不可用。",
			loadFailed: "加载设置失败。",
			globalTitle: "全局供应商策略",
			globalHint: "保存一次即应用到所有 pi-ai 供应商及其全部模型;模型级思考等级请在「模型」页配置,对话里仍可逐次选择推理等级。",
			providerCountOne: "1 个供应商",
			providerCountMany: "{count} 个供应商",
			defaultReasoning: "默认推理强度",
			defaultReasoningHint: "对话里未单独选择推理等级时使用;「供应商默认」不写入,沿用供应商自身设置。",
			defaultReasoningUnset: "供应商默认",
			developerRole: "Developer 角色",
			developerRoleHint: "自动沿用适配器自身检测;网关拒绝 developer 角色时选择禁用。",
			developerRoleAuto: "自动",
			developerRoleEnabled: "启用",
			developerRoleDisabled: "禁用",
			retryStrategy: "重试策略",
			strategyStandard: "标准",
			strategyAggressive: "激进",
			strategyStandardHint: "重试次数可调;保留各供应商的可重试错误码;退避仍是激进预设时恢复宿主默认(2s/60s)。",
			strategyAggressiveHint: "重试次数锁定为 1000;退避固定为 1s、2s、4s,之后封顶 5s,并关闭随机抖动。",
			retryCount: "重试次数",
			retryCountHint: "失败后最多重试的次数;0 表示失败即结束。",
			retryLocked: "激进策略下固定为 1000,不可调整。",
			retryInvalid: "重试次数必须是非负整数。",
			retryUnit: "次",
			retryPreview: "重试预览",
			previewAt: "第 {n} 次 {d}",
			previewCapFrom: "第 {n} 次起 {d}(封顶)",
			previewTotal: "共 {count} 次 · 累计约 {total}",
			previewNone: "重试次数为 0:失败即结束,不再重试。",
			previewParamsStandard: "标准策略保留各供应商的退避(仍是激进预设时恢复宿主默认);曲线按第一个供应商保存后的值绘制:初始 {initial} · 上限 {max} · ×2 · 抖动 ±{percent}%",
			previewParamsAggressive: "激进策略把该退避写入所有供应商:初始 {initial} · 上限 {max} · ×2 · 无抖动",
			axisTime: "等待时间",
			save: "保存",
			saveHint: "修改仅在点击保存后写入。",
			saving: "保存中…",
			savedAt: "已保存",
			saveFailed: "保存失败。",
			retryNoticeTitle: "对话里的重试提示",
			retryNoticeHint: "API 不稳定时,每次重试都会在对话里留下一行。这里控制这些行的显示方式,切换后立即生效。",
			retryNoticeModeLabel: "显示方式",
			retryNoticeDefault: "默认",
			retryNoticeCompact: "精简",
			retryNoticeSilent: "隐藏",
			retryNoticeModeDefault: "每条重试都显示一行,展开可看失败原因与重试延迟(原生行为)。",
			retryNoticeModeCompact: "只在等待重试时显示一行,重试结束即收起,避免刷屏。",
			retryNoticeModeSilent: "完全隐藏重试记录;回合最终失败仍会显示错误。",
			retryNoticeNote: "该偏好只保存在本机浏览器,不写入供应商配置。",
			retryNoticeActive: "正在重试模型请求 · {retry}/{maximum} · {seconds}s"
		};

		// ══ pure settings helpers ═══════════════════════════════════════════
		/** A plain data object, never an array or null. */
		function isRecord(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value);
		}
		/** One object-valued field of a parent object, or an empty object. */
		function recordAt(value, key) {
			const entry = isRecord(value) ? value[key] : void 0;
			return isRecord(entry) ? entry : {};
		}
		/** A string field read off a settings object, undefined otherwise. */
		function stringAt(value, key) {
			return typeof value?.[key] === "string" ? value[key] : void 0;
		}
		/** The message of an unknown thrown value. */
		function messageOf(error) {
			return error instanceof Error ? error.message : String(error);
		}
		/** Parse a non-negative integer draft; blank and malformed drafts are invalid. */
		function parseRetryCount(text) {
			const cleaned = String(text).trim();
			if (cleaned === "") return { valid: false, value: void 0 };
			const parsed = Number(cleaned);
			if (!Number.isSafeInteger(parsed) || parsed < 0) return { valid: false, value: void 0 };
			return { valid: true, value: parsed };
		}
		/** The provider ids declared in either settings layer, in stable order. */
		function providerIdsOf(schema, namespace) {
			const userProviders = schema.getPath(namespace.user ?? {}, ["providers"]);
			const resolvedProviders = schema.getPath(namespace.value, ["providers"]);
			return [...new Set([
				...Object.keys(isRecord(userProviders) ? userProviders : {}),
				...Object.keys(isRecord(resolvedProviders) ? resolvedProviders : {})
			])].sort();
		}
		/** One provider's two layers: the user layer, and the resolved fallback of it. */
		function providerLayers(schema, namespace, providerId) {
			const user = recordAt(schema.getPath(namespace.user ?? {}, ["providers"]), providerId);
			const resolved = recordAt(schema.getPath(namespace.value, ["providers"]), providerId);
			return { user, resolved: Object.keys(resolved).length > 0 ? resolved : user };
		}
		/** The developer-role tri-state from the user layer first, resolved fallback second. */
		function compatModeOf(userProvider, resolvedProvider) {
			for (const provider of [userProvider, resolvedProvider]) {
				const stored = provider?.compat?.supportsDeveloperRole;
				if (typeof stored === "boolean") return stored ? "enabled" : "disabled";
			}
			return "auto";
		}
		/** The backoff a provider effectively runs: its own values, else the panel defaults. */
		function effectiveBackoff(policy) {
			const backoff = recordAt(policy, "backoff");
			const initialDelayMs = typeof backoff.initialDelayMs === "number" ? backoff.initialDelayMs : DEFAULT_BACKOFF.initialDelayMs;
			const maxDelayMs = typeof backoff.maxDelayMs === "number" ? Math.max(backoff.maxDelayMs, initialDelayMs) : Math.max(DEFAULT_BACKOFF.maxDelayMs, initialDelayMs);
			const jitterRatio = typeof backoff.jitterRatio === "number" ? backoff.jitterRatio : DEFAULT_JITTER_RATIO;
			return { initialDelayMs, maxDelayMs, jitterRatio };
		}
		/** Whether a stored backoff is exactly the aggressive preset this card writes. */
		function isAggressiveBackoff(backoff) {
			return isRecord(backoff)
				&& backoff.initialDelayMs === AGGRESSIVE.backoff.initialDelayMs
				&& backoff.maxDelayMs === AGGRESSIVE.backoff.maxDelayMs
				&& backoff.jitterRatio === AGGRESSIVE.backoff.jitterRatio;
		}
		/** Which strategy a stored retry policy already encodes. */
		function strategyOf(policy) {
			return policy?.maxRetries === AGGRESSIVE.maxRetries && isAggressiveBackoff(recordAt(policy, "backoff"))
				? STRATEGY_AGGRESSIVE
				: STRATEGY_STANDARD;
		}
		/** The backoff the standard strategy runs (and previews): the provider's own
		 * values, except that the aggressive preset this card wrote is restored to the
		 * host defaults — otherwise a saved standard policy would keep re-detecting as
		 * aggressive. */
		function standardBackoffFor(policy) {
			return isAggressiveBackoff(recordAt(policy, "backoff")) ? { ...DEFAULT_BACKOFF, jitterRatio: DEFAULT_JITTER_RATIO } : effectiveBackoff(policy);
		}
		/** The retry policy one save writes: each provider keeps its own retryable codes,
		 * while the count and (for the aggressive preset) the backoff follow the card. */
		function retryPolicyFor(existing, strategy, maxRetries) {
			const policy = isRecord(existing) ? { ...existing } : {};
			if (!Array.isArray(policy.retryableCodes) || policy.retryableCodes.length === 0) policy.retryableCodes = RETRYABLE_CODES.slice();
			if (strategy === STRATEGY_AGGRESSIVE) policy.backoff = { ...AGGRESSIVE.backoff };
			else if (!isRecord(policy.backoff) || isAggressiveBackoff(policy.backoff)) policy.backoff = { ...DEFAULT_BACKOFF };
			policy.mode = "normal";
			policy.maxRetries = maxRetries;
			return policy;
		}
		/**
		 * The ordered path ops one save sends: default reasoning, retry policy, and
		 * developer-role compat for every pi-ai provider. Model rows are deliberately
		 * absent — per-model reasoning levels belong to the stock Models page.
		 * @param schema - immutable path reads over the settings snapshot.
		 * @param userLayer - raw user layer of the llm-pi-ai namespace.
		 * @param draft - the global policy the card currently shows.
		 * @returns the ops, in write order.
		 */
		function policyOps(schema, userLayer, draft) {
			const { providerIds, reasoning, developerRole, strategy, maxRetries } = draft;
			const ops = [];
			for (const providerId of providerIds) {
				const base = ["providers", providerId];
				if (reasoning === "") ops.push({ op: "unset", path: [...base, "reasoning"] });
				else ops.push({ op: "set", path: [...base, "reasoning"], value: reasoning });
				ops.push({
					op: "set",
					path: [...base, "retryPolicy"],
					value: retryPolicyFor(schema.getPath(userLayer, [...base, "retryPolicy"]), strategy, maxRetries)
				});
				const compat = schema.getPath(userLayer, [...base, "compat"]);
				if (developerRole === "auto") {
					if (isRecord(compat) && "supportsDeveloperRole" in compat) {
						const next = { ...compat };
						delete next.supportsDeveloperRole;
						if (Object.keys(next).length === 0) ops.push({ op: "unset", path: [...base, "compat"] });
						else ops.push({ op: "set", path: [...base, "compat"], value: next });
					}
				} else {
					ops.push({
						op: "set",
						path: [...base, "compat"],
						value: { ...(isRecord(compat) ? compat : {}), supportsDeveloperRole: developerRole === "enabled" }
					});
				}
			}
			return ops;
		}

		// ══ retry-preview math over the host's backoff function ════════════
		/** The host's exponential backoff, one wait per retry: min(initial × 2^(n-1), max). */
		function retryWaits(count, initialDelayMs, maxDelayMs) {
			const waits = [];
			for (let index = 0; index < count; index += 1) waits.push(Math.min(initialDelayMs * 2 ** Math.min(index, 60), maxDelayMs));
			return waits;
		}
		/** 1-based number of the first retry already sitting at the delay cap. */
		function capRetryNumber(waits, maxDelayMs) {
			const index = waits.findIndex((wait) => wait >= maxDelayMs);
			return index === -1 ? waits.length + 1 : index + 1;
		}
		/** A fixed-decimal number without a trailing ".0". */
		function trimDecimal(value, digits) {
			return value.toFixed(digits).replace(/\.0+$/, "");
		}
		/** Human-readable duration over the whole ms → h range. */
		function formatDuration(ms) {
			if (ms < 1000) return Math.round(ms) + "ms";
			if (ms < 60000) return trimDecimal(ms / 1000, ms % 1000 === 0 ? 0 : 1) + "s";
			if (ms < 3600000) return trimDecimal(ms / 60000, ms % 60000 === 0 ? 0 : 1) + "min";
			return trimDecimal(ms / 3600000, ms % 3600000 === 0 ? 0 : 1) + "h";
		}
		const AXIS_UNITS = [[1, "ms"], [1000, "s"], [60000, "min"], [3600000, "h"]];
		/** The largest axis unit that still divides the peak into at least two of itself. */
		function axisUnit(peakMs) {
			let unit = AXIS_UNITS[0];
			for (const candidate of AXIS_UNITS) if (peakMs / candidate[0] >= 2) unit = candidate;
			return unit;
		}
		/** A 1/2/5×10^k step near the requested value. */
		function niceStep(value) {
			if (!(value > 0)) return 1;
			const power = 10 ** Math.floor(Math.log10(value));
			const normalized = value / power;
			const multiplier = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
			return multiplier * power;
		}
		/** Evenly spaced values from 0 covering the requested maximum, in axis units:
		 * the top tick rounds UP so the peak never leaves the plot area. */
		function axisTicks(maxUnits, targetCount) {
			const step = niceStep(maxUnits / targetCount);
			const ceiling = Math.max(step, Math.ceil(maxUnits / step) * step);
			const ticks = [];
			for (let value = 0; value <= ceiling + step / 1000; value += step) ticks.push(value);
			return ticks;
		}

		// ══ retry-notice display preference ═════════════════════════════════
		/** Read the stored display mode, ignoring absent or malformed values. */
		function readRetryNoticeMode() {
			try {
				if (typeof window === "undefined") return RETRY_NOTICE_DEFAULT;
				const raw = window.localStorage.getItem(RETRY_NOTICE_KEY);
				return RETRY_NOTICE_MODES.includes(raw) ? raw : RETRY_NOTICE_DEFAULT;
			} catch {
				return RETRY_NOTICE_DEFAULT;
			}
		}
		/** Browser-local store: the settings card and the live chat rows stay in sync. */
		const retryNoticeMode = (() => {
			let mode = readRetryNoticeMode();
			const listeners = new Set();
			const publish = () => {
				for (const listener of [...listeners]) listener();
			};
			return {
				get: () => mode,
				set(next) {
					if (!RETRY_NOTICE_MODES.includes(next) || next === mode) return;
					mode = next;
					try {
						window.localStorage.setItem(RETRY_NOTICE_KEY, next);
					} catch {}
					publish();
				},
				/** Adopt a mode written by another same-origin window. */
				adopt(raw) {
					const next = RETRY_NOTICE_MODES.includes(raw) ? raw : RETRY_NOTICE_DEFAULT;
					if (next === mode) return;
					mode = next;
					publish();
				},
				subscribe(listener) {
					listeners.add(listener);
					return () => listeners.delete(listener);
				}
			};
		})();
		/** Subscribe one component to the display-mode store. */
		function useRetryNoticeMode() {
			return useSyncExternalStore(retryNoticeMode.subscribe, retryNoticeMode.get, retryNoticeMode.get);
		}
		/** Countdown seconds for the wait before the next retry, like the stock row. */
		function retrySeconds(milliseconds) {
			return Math.max(1, Math.ceil(milliseconds / 1000));
		}
		/**
		 * Quiet replacement for the stock `model-retry` chat row. Compact mode shows one
		 * live countdown line while a retry is being waited on and renders nothing for
		 * resolved chains (hiding their flow wrapper so the transcript keeps no gap);
		 * silent renders nothing at all.
		 * @param props - { node, t } from the conversation.chat.node slot.
		 */
		function QuietRetryNodeView(props) {
			const { node, t } = props;
			const mode = useRetryNoticeMode();
			const anchorRef = useRef(null);
			const current = node?.data?.current;
			const active = mode === "compact" && current !== void 0 && current.retryState === "scheduled";
			const delayMs = active ? current.delayMs : 0;
			const seq = active ? current.seq : void 0;
			const deadline = useMemo(() => Date.now() + delayMs, [delayMs, seq]);
			const [remaining, setRemaining] = useState(() => retrySeconds(deadline - Date.now()));
			useEffect(() => {
				if (!active) return void 0;
				const tick = () => {
					const next = retrySeconds(deadline - Date.now());
					setRemaining(next);
					return next;
				};
				if (tick() === 1) return void 0;
				const timer = window.setInterval(() => {
					if (tick() === 1) window.clearInterval(timer);
				}, 250);
				return () => window.clearInterval(timer);
			}, [active, deadline]);
			useLayoutEffect(() => {
				const wrapper = anchorRef.current?.closest ? anchorRef.current.closest('[data-chat-flow-kind="model-retry"]') : null;
				if (wrapper === null || wrapper === void 0) return void 0;
				const previousHidden = wrapper.hidden;
				wrapper.hidden = !active;
				return () => {
					wrapper.hidden = previousHidden;
				};
			}, [active]);
			if (!active) return jsx("span", { ref: anchorRef, hidden: true, "aria-hidden": "true" });
			const maximum = current.mode === "normal" ? current.maxRetries : "∞";
			return jsxs("div", { ref: anchorRef, className: "dpp-retryLine", role: "status", children: [
				jsx("span", { className: "dpp-retryDot", "aria-hidden": "true" }),
				jsx("span", { children: t("retryNoticeActive", { retry: current.retry, maximum, seconds: remaining }) })
			] });
		}

		// ══ stylesheet (namespaced, injected once) ══════════════════════════
		const PANEL_STYLE_ID = "dsh-ui-provider-policy/panel.css";
		const PANEL_CSS = [
			".dpp-root{display:flex;flex-direction:column;gap:14px;max-width:720px;color:var(--dsw-alias-label-primary)}",
			".dpp-title{margin:0;font-size:16px;font-weight:500;line-height:24px}",
			".dpp-intro{margin:0;color:var(--dsw-alias-label-tertiary);font-size:14px;line-height:22px}",
			".dpp-error{margin:0;color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px;white-space:pre-wrap}",
			".dpp-notice{margin:0;padding:9px 12px;border:.5px solid var(--dsw-alias-state-warn-primary);border-radius:var(--dsw-radius-md);color:var(--dsw-alias-state-warn-label);background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 8%,transparent);font-size:12px;line-height:18px}",
			".dpp-card{display:flex;flex-direction:column;padding:12px 16px 0;border:.5px solid var(--dsw-alias-settings-card-stroke);border-radius:var(--dsw-radius-xl);background:var(--dsw-alias-settings-card-fill)}",
			".dpp-cardHead{display:flex;align-items:center;gap:8px;min-width:0}",
			".dpp-cardTitle{flex:1;min-width:0;font-size:14px;font-weight:500;line-height:22px}",
			".dpp-tag{flex:none;padding:1px 8px;border:.5px solid var(--dsw-alias-border-l4);border-radius:999px;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:17px;font-weight:500;white-space:nowrap}",
			".dpp-cardHint{margin:2px 0 4px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}",
			".dpp-row{display:flex;align-items:center;gap:24px;padding:11px 0;border-top:.5px solid var(--dsw-alias-border-l2)}",
			".dpp-rowText{flex:1;min-width:0}",
			".dpp-rowLabel{font-size:14px;line-height:20px}",
			".dpp-rowHint{margin-top:3px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}",
			".dpp-hintError{color:var(--dsw-alias-state-error-primary)}",
			".dpp-controls{flex:none;display:flex;align-items:center;gap:8px;min-width:0}",
			".dpp-unit{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}",
			".dpp-dropdown{position:relative;display:inline-flex}",
			".dpp-selectButton{display:flex;align-items:center;gap:8px;box-sizing:border-box;height:32px;min-width:170px;max-width:220px;padding:0 10px 0 12px;border:none;border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;line-height:20px;text-align:left;cursor:pointer}",
			".dpp-selectButton:hover:not(:disabled){background:var(--dsw-alias-border-l1)}",
			".dpp-selectButton:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}",
			".dpp-selectButton:disabled{opacity:.5;cursor:default}",
			".dpp-selectLabel{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
			".dpp-chevron{flex:none;display:inline-flex;align-items:center;color:var(--dsw-alias-label-tertiary);pointer-events:none}",
			".dpp-menu{position:absolute;z-index:1200;top:calc(100% + 4px);left:0;box-sizing:border-box;min-width:100%;max-height:264px;padding:4px;display:flex;flex-direction:column;gap:1px;overflow-y:auto;border:0;border-radius:var(--dsw-radius-md);background:var(--dsw-menu-surface-fill,var(--dsw-alias-bg-layer-2));backdrop-filter:var(--dsw-menu-backdrop-filter,none);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);box-shadow:var(--dsw-elevation-prominent,var(--dsw-elevation-soft));outline:none}",
			".dpp-menuItem{display:flex;align-items:center;gap:6px;width:100%;height:30px;padding:0 8px;border:none;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:18px;text-align:left;cursor:pointer;white-space:nowrap}",
			".dpp-menuItem[data-active=\"true\"]{background:var(--dsw-alias-interactive-bg-hover)}",
			".dpp-menuItem[aria-selected=\"true\"]{font-weight:500}",
			".dpp-menuCheck{flex:none;display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;color:var(--dsw-alias-state-business-primary)}",
			".dpp-menuLabel{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis}",
			".dpp-seg{display:inline-flex;gap:2px;padding:2px;border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-module-platform)}",
			".dpp-segItem{height:28px;padding:0 12px;border:none;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:13px;line-height:18px;cursor:pointer;white-space:nowrap}",
			".dpp-segItem:hover:not(:disabled){background:var(--dsw-alias-border-l1);color:var(--dsw-alias-label-primary)}",
			".dpp-segItem[aria-pressed=\"true\"]{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);box-shadow:var(--dsw-elevation-soft)}",
			".dpp-segItem:disabled{opacity:.5;cursor:default}",
			".dpp-segItem:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}",
			".dpp-input{box-sizing:border-box;width:110px;height:32px;padding:0 12px;border:none;border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;line-height:20px}",
			".dpp-input:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}",
			".dpp-input:disabled{opacity:.5;cursor:default}",
			".dpp-input[aria-invalid=\"true\"]{box-shadow:inset 0 0 0 1px var(--dsw-alias-state-error-primary)}",
			".dpp-preview{display:flex;flex-direction:column;gap:6px;padding:10px 0 11px;border-top:.5px solid var(--dsw-alias-border-l2)}",
			".dpp-previewHead{display:flex;align-items:baseline;gap:8px;min-width:0}",
			".dpp-previewTitle{flex:none;font-size:14px;line-height:20px}",
			".dpp-previewMeta{flex:1;min-width:0;text-align:right;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}",
			".dpp-chart{display:block;width:100%;height:auto;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-module-platform)}",
			".dpp-caption{margin:0;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}",
			".dpp-footer{display:flex;align-items:center;gap:12px;padding:10px 0 12px;border-top:.5px solid var(--dsw-alias-border-l2)}",
			".dpp-status{flex:1;min-width:0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary);white-space:pre-wrap}",
			".dpp-statusOk{color:var(--dsw-alias-state-success-primary)}",
			".dpp-statusError{color:var(--dsw-alias-state-error-primary)}",
			".dpp-save{appearance:none;flex:none;height:32px;padding:0 16px;border:none;border-radius:var(--dsw-radius-md);background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-layer-3);font:inherit;font-size:13px;font-weight:500;line-height:18px;cursor:pointer}",
			".dpp-save:hover:not(:disabled){opacity:.9}",
			".dpp-save:disabled{opacity:.4;cursor:default}",
			".dpp-save:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}",
			".dpp-cardNote{margin:0 0 12px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}",
			".dpp-retryLine{display:flex;align-items:center;gap:8px;padding:1px 0;color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px}",
			".dpp-retryDot{flex:none;width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-state-business-primary);animation:dpp-pulse 1.2s ease-in-out infinite}",
			"@keyframes dpp-pulse{0%,100%{opacity:.35}50%{opacity:1}}",
			"@media (prefers-reduced-motion:reduce){.dpp-retryDot{animation:none}}"
		].join("");

		/** Append the panel stylesheet once, tolerating HMR re-materialization. */
		function injectPanelStyles() {
			if (typeof document === "undefined") return;
			if (document.querySelector('style[data-plugin-css="' + PANEL_STYLE_ID + '"]') !== null) return;
			const style = document.createElement("style");
			style.dataset.plugin = "dsh-ui-provider-policy";
			style.dataset.pluginCss = PANEL_STYLE_ID;
			style.textContent = PANEL_CSS;
			document.head.appendChild(style);
		}

		// ══ small presentational atoms ═════════════════════════════════════
		/** The disclosure chevron of a select, drawn with the text color. */
		function ChevronDownIcon() {
			return jsx("span", { className: "dpp-chevron", "aria-hidden": "true", children: jsx("svg", {
				width: 12,
				height: 12,
				viewBox: "0 0 12 12",
				children: jsx("path", {
					d: "M3 4.75 6 7.75 9 4.75",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: 1.5,
					strokeLinecap: "round",
					strokeLinejoin: "round"
				})
			}) });
		}
		/** One labelled policy row: copy on the left, the control on the right. */
		function PolicyRow(props) {
			const { label, hint, children } = props;
			return jsxs("div", { className: "dpp-row", children: [
				jsxs("div", { className: "dpp-rowText", children: [
					jsx("div", { className: "dpp-rowLabel", children: label }),
					hint !== void 0 ? jsx("div", { className: "dpp-rowHint", children: hint }) : null
				] }),
				jsx("div", { className: "dpp-controls", children: children })
			] });
		}
		/** A fully themed dropdown; a native <select> popup cannot follow the app theme,
		 * so its option list turns white-on-white in dark mode. */
		function DropdownControl(props) {
			const { id, value, options, onChange, disabled, label } = props;
			const [open, setOpen] = useState(false);
			const selectedIndex = options.findIndex((option) => option.value === value);
			const [activeIndex, setActiveIndex] = useState(() => Math.max(selectedIndex, 0));
			const wrapRef = useRef(null);
			const buttonRef = useRef(null);
			const menuRef = useRef(null);
			const selected = selectedIndex === -1 ? options[0] : options[selectedIndex];
			const close = useCallback((focusButton) => {
				setOpen(false);
				if (focusButton) buttonRef.current?.focus();
			}, []);
			const openMenu = useCallback(() => {
				if (disabled) return;
				setActiveIndex(Math.max(selectedIndex, 0));
				setOpen(true);
			}, [disabled, selectedIndex]);
			useEffect(() => {
				if (disabled) setOpen(false);
			}, [disabled]);
			useEffect(() => {
				if (!open) return void 0;
				const closeOnOutsidePointer = (event) => {
					if (wrapRef.current?.contains(event.target)) return;
					setOpen(false);
				};
				document.addEventListener("pointerdown", closeOnOutsidePointer, true);
				return () => document.removeEventListener("pointerdown", closeOnOutsidePointer, true);
			}, [open]);
			useEffect(() => {
				if (open) menuRef.current?.focus();
			}, [open]);
			useEffect(() => {
				if (open) menuRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
			}, [open, activeIndex]);
			const choose = useCallback((index) => {
				const option = options[index];
				if (option === void 0) return;
				onChange(option.value);
				close(true);
			}, [options, onChange, close]);
			const onButtonKeyDown = (event) => {
				if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					openMenu();
				}
			};
			const onMenuKeyDown = (event) => {
				if (event.key === "ArrowDown") {
					event.preventDefault();
					setActiveIndex((index) => Math.min(index + 1, options.length - 1));
				} else if (event.key === "ArrowUp") {
					event.preventDefault();
					setActiveIndex((index) => Math.max(index - 1, 0));
				} else if (event.key === "Home") {
					event.preventDefault();
					setActiveIndex(0);
				} else if (event.key === "End") {
					event.preventDefault();
					setActiveIndex(options.length - 1);
				} else if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					choose(activeIndex);
				} else if (event.key === "Escape") {
					event.preventDefault();
					close(true);
				} else if (event.key === "Tab") {
					event.preventDefault();
					close(true);
				}
			};
			return jsxs("div", { ref: wrapRef, className: "dpp-dropdown", children: [
				jsxs("button", {
					ref: buttonRef,
					id: id,
					type: "button",
					className: "dpp-selectButton",
					disabled: disabled,
					"aria-haspopup": "listbox",
					"aria-expanded": open,
					"aria-label": label,
					onClick: () => {
						if (open) close(true);
						else openMenu();
					},
					onKeyDown: onButtonKeyDown,
					children: [
						jsx("span", { className: "dpp-selectLabel", children: selected?.label }),
						jsx(ChevronDownIcon, {})
					]
				}),
				open ? jsx("div", {
					ref: menuRef,
					className: "dpp-menu",
					role: "listbox",
					id: id + "-listbox",
					"aria-label": label,
					"aria-activedescendant": id + "-option-" + activeIndex,
					tabIndex: -1,
					onKeyDown: onMenuKeyDown,
					children: options.map((option, index) => jsxs("button", {
						type: "button",
						id: id + "-option-" + index,
						tabIndex: -1,
						role: "option",
						"aria-selected": option.value === value,
						"data-active": index === activeIndex,
						className: "dpp-menuItem",
						onPointerEnter: () => setActiveIndex(index),
						onClick: () => choose(index),
						children: [
							jsx("span", { className: "dpp-menuCheck", "aria-hidden": "true", children: option.value === value ? jsx("svg", {
								width: 12,
								height: 12,
								viewBox: "0 0 12 12",
								children: jsx("path", {
									d: "M2.5 6.2 5 8.7 9.5 3.6",
									fill: "none",
									stroke: "currentColor",
									strokeWidth: 1.6,
									strokeLinecap: "round",
									strokeLinejoin: "round"
								})
							}) : null }),
							jsx("span", { className: "dpp-menuLabel", children: option.label })
						]
					}, option.value))
				}) : null
			] });
		}
		/** A segmented button group; the pressed segment paints the raised pill. */
		function SegmentedControl(props) {
			const { id, value, options, onChange, disabled, label } = props;
			return jsx("div", { className: "dpp-seg", role: "group", "aria-label": label, children: options.map((option) => jsx("button", {
				type: "button",
				id: id + "-" + option.value,
				className: "dpp-segItem",
				"aria-pressed": value === option.value,
				disabled: disabled || option.disabled === true,
				title: option.title,
				onClick: () => {
					if (value !== option.value) onChange(option.value);
				},
				children: option.label
			}, option.value)) });
		}

		/** Settings card for the retry-notice display preference (browser-local). */
		function RetryNoticeCard(props) {
			const { t } = props;
			const mode = useRetryNoticeMode();
			const hintKey = mode === "compact" ? "retryNoticeModeCompact" : mode === "silent" ? "retryNoticeModeSilent" : "retryNoticeModeDefault";
			return jsxs("div", { className: "dpp-card", children: [
				jsx("div", { className: "dpp-cardHead", children: jsx("span", { className: "dpp-cardTitle", children: t("retryNoticeTitle") }) }),
				jsx("p", { className: "dpp-cardHint", children: t("retryNoticeHint") }),
				jsx(PolicyRow, {
					label: t("retryNoticeModeLabel"),
					hint: t(hintKey),
					children: jsx(SegmentedControl, {
						id: "dpp-retry-notices",
						value: mode,
						label: t("retryNoticeModeLabel"),
						onChange: (value) => retryNoticeMode.set(value),
						options: [
							{ value: RETRY_NOTICE_DEFAULT, label: t("retryNoticeDefault") },
							{ value: "compact", label: t("retryNoticeCompact") },
							{ value: "silent", label: t("retryNoticeSilent") }
						]
					})
				}),
				jsx("p", { className: "dpp-cardNote", children: t("retryNoticeNote") })
			] });
		}

		// ══ retry preview ══════════════════════════════════════════════════
		const CHART = { width: 600, height: 128, left: 46, right: 16, top: 20, bottom: 22 };
		/**
		 * The retry preview: one inline SVG plotting the host's real backoff — the wait
		 * before retry n against n — whose area under the curve is exactly the cumulative
		 * wait. Axes, unit, and sampling refit whatever strategy and count are selected,
		 * so 1000 retries stay legible.
		 * @param props - { count, initialDelayMs, maxDelayMs, jitterRatio, aggressive, t }.
		 */
		function RetryPreview(props) {
			const { count, initialDelayMs, maxDelayMs, jitterRatio, aggressive, t } = props;
			const gradientId = "dpp-area-" + useId().replace(/[^A-Za-z0-9_-]/g, "");
			const waits = retryWaits(count, initialDelayMs, maxDelayMs);
			const steps = [];
			let totalText = "";
			if (waits.length > 0) {
				totalText = t("previewTotal", { count, total: formatDuration(waits.reduce((sum, wait) => sum + wait, 0)) });
				const capped = capRetryNumber(waits, maxDelayMs);
				for (let index = 0; index < Math.min(capped - 1, 3); index += 1) steps.push(t("previewAt", { n: index + 1, d: formatDuration(waits[index]) }));
				if (capped <= count) steps.push(t("previewCapFrom", { n: capped, d: formatDuration(maxDelayMs) }));
			}
			const paramsText = aggressive === true
				? t("previewParamsAggressive", { initial: formatDuration(initialDelayMs), max: formatDuration(maxDelayMs) })
				: t("previewParamsStandard", { initial: formatDuration(initialDelayMs), max: formatDuration(maxDelayMs), percent: trimDecimal(jitterRatio * 100, 1) });
			const head = jsxs("div", { className: "dpp-previewHead", children: [
				jsx("span", { className: "dpp-previewTitle", children: t("retryPreview") }),
				waits.length > 0 ? jsx("span", { className: "dpp-previewMeta", children: totalText }) : null
			] });
			if (waits.length === 0) {
				return jsxs("div", { className: "dpp-preview", children: [
					head,
					jsx("p", { className: "dpp-caption", children: t("previewNone") })
				] });
			}
			const peak = waits[waits.length - 1];
			const unit = axisUnit(peak);
			const ticks = axisTicks((peak / unit[0]) * 1.05, 3);
			const top = ticks[ticks.length - 1];
			const plotWidth = CHART.width - CHART.left - CHART.right;
			const plotHeight = CHART.height - CHART.top - CHART.bottom;
			const baseline = CHART.top + plotHeight;
			const plotRight = CHART.left + plotWidth;
			const xOf = (index) => CHART.left + (count <= 1 ? plotWidth / 2 : (index / (count - 1)) * plotWidth);
			const yOf = (value) => baseline - (value / unit[0] / top) * plotHeight;
			const stride = Math.max(1, Math.ceil(count / 160));
			const sampled = [];
			for (let index = 0; index < count; index += stride) sampled.push(index);
			if (sampled[sampled.length - 1] !== count - 1) sampled.push(count - 1);
			const points = sampled.map((index) => xOf(index).toFixed(1) + "," + yOf(waits[index]).toFixed(1));
			const areaPath = "M " + CHART.left.toFixed(1) + " " + baseline.toFixed(1) + " L " + points.join(" L ") + " L " + xOf(count - 1).toFixed(1) + " " + baseline.toFixed(1) + " Z";
			const xTickCount = Math.min(count, 4);
			const xTicks = [...new Set(Array.from({ length: xTickCount }, (_unused, slot) => xTickCount <= 1 ? 0 : Math.round((slot / (xTickCount - 1)) * (count - 1))))];
			const capped = capRetryNumber(waits, maxDelayMs);
			const capX = xOf(capped - 1);
			const capLabel = t("previewCapFrom", { n: capped, d: formatDuration(maxDelayMs) });
			const labelColor = "var(--dsw-alias-label-tertiary)";
			const gridColor = "var(--dsw-alias-border-l2)";
			const accent = "var(--dsw-alias-brand-primary)";
			const surface = "var(--dsw-alias-bg-module-platform)";
			const grid = [];
			for (const [index, tick] of ticks.entries()) {
				if (tick > 0) {
					const y = yOf(tick * unit[0]);
					grid.push(jsx("line", { x1: CHART.left, y1: y, x2: plotRight, y2: y, stroke: gridColor, strokeWidth: 1, strokeDasharray: "2 5" }, "grid" + index));
				}
				grid.push(jsx("text", { x: CHART.left - 8, y: yOf(tick * unit[0]) + 4, textAnchor: "end", fill: labelColor, fontSize: 11, children: trimDecimal(tick, Number.isInteger(tick) ? 0 : 1) + unit[1] }, "ylabel" + index));
			}
			for (const index of xTicks) grid.push(jsx("text", { x: xOf(index), y: CHART.height - 8, textAnchor: "middle", fill: labelColor, fontSize: 11, children: String(index + 1) }, "xlabel" + index));
			const ramp = Math.min(capped - 1, 4);
			for (let index = 0; index < ramp; index += 1) {
				grid.push(jsx("circle", { cx: xOf(index), cy: yOf(waits[index]), r: 2.5, fill: surface, stroke: accent, strokeWidth: 1.5 }, "dot" + index));
			}
			if (capped <= count) {
				grid.push(jsx("line", { x1: capX, y1: CHART.top, x2: capX, y2: baseline, stroke: "var(--dsw-alias-border-l3)", strokeWidth: 1, strokeDasharray: "3 4" }, "cap"));
				grid.push(jsx("circle", { cx: capX, cy: yOf(maxDelayMs), r: 2.5, fill: accent }, "capdot"));
				grid.push(jsx("text", { x: plotRight, y: CHART.top - 9, textAnchor: "end", fill: labelColor, fontSize: 11, children: capLabel }, "caplabel"));
			}
			return jsxs("div", { className: "dpp-preview", children: [
				head,
				jsxs("svg", {
					className: "dpp-chart",
					viewBox: "0 0 " + CHART.width + " " + CHART.height,
					role: "img",
					"aria-label": t("retryPreview") + " · " + totalText + " · " + steps.join(" · "),
					children: [
						jsx("defs", { children: jsxs("linearGradient", { id: gradientId, x1: "0", y1: "0", x2: "0", y2: "1", children: [
							jsx("stop", { offset: "0%", stopColor: accent, stopOpacity: 0.22 }),
							jsx("stop", { offset: "100%", stopColor: accent, stopOpacity: 0.02 })
						] }) }),
						jsxs("g", { children: [
							jsx("text", { x: 4, y: 13, fill: labelColor, fontSize: 11, children: t("axisTime") + " (" + unit[1] + ")" }),
							...grid,
							jsx("line", { x1: CHART.left, y1: baseline, x2: plotRight, y2: baseline, stroke: gridColor, strokeWidth: 1 }),
							jsx("path", { d: areaPath, fill: "url(#" + gradientId + ")" }),
							jsx("polyline", { points: points.join(" "), fill: "none", stroke: accent, strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" })
						] })
					]
				}),
				jsx("p", { className: "dpp-caption", children: steps.join(" · ") }),
				jsx("p", { className: "dpp-caption", children: paramsText })
			] });
		}

		// ══ the global policy card ═════════════════════════════════════════
		/**
		 * The single global policy card: default reasoning, developer-role compat, and
		 * the retry strategy with its live preview — applied to every pi-ai provider.
		 * It never writes model rows; per-model reasoning levels stay on the Models page.
		 * @param props - { providerIds, namespace, mutate, schema, t, readOnly, saved,
		 *   onDirtyChange, onRefresh, onSaved }.
		 */
		function GlobalPolicyPanel(props) {
			const { providerIds, namespace, mutate, schema, t, readOnly, saved, onDirtyChange, onRefresh, onSaved } = props;
			const [expectedRevision] = useState(() => namespace.revision);
			const userLayer = isRecord(namespace.user) ? namespace.user : {};
			const first = providerLayers(schema, namespace, providerIds[0]);
			const savedPolicy = isRecord(first.resolved.retryPolicy) ? first.resolved.retryPolicy : {};
			const [reasoning, setReasoning] = useState(() => stringAt(first.user, "reasoning") ?? stringAt(first.resolved, "reasoning") ?? "");
			const [developerRole, setDeveloperRole] = useState(() => compatModeOf(first.user, first.resolved));
			const [strategy, setStrategy] = useState(() => strategyOf(savedPolicy));
			const [maxText, setMaxText] = useState(() => {
				const stored = savedPolicy.maxRetries;
				return String(strategyOf(savedPolicy) === STRATEGY_AGGRESSIVE || typeof stored !== "number" ? FALLBACK_RETRY_COUNT : stored);
			});
			const [busy, setBusy] = useState(false);
			const [failure, setFailure] = useState(void 0);
			const disabled = readOnly || busy;
			const aggressive = strategy === STRATEGY_AGGRESSIVE;
			const countDraft = parseRetryCount(maxText);
			const countInvalid = !aggressive && !countDraft.valid;
			const previewCount = aggressive ? AGGRESSIVE.maxRetries : countDraft.valid ? countDraft.value : FALLBACK_RETRY_COUNT;
			const previewBackoff = aggressive ? AGGRESSIVE.backoff : standardBackoffFor(savedPolicy);
			const previewJitter = aggressive ? 0 : previewBackoff.jitterRatio;
			const markDirty = () => {
				setFailure(void 0);
				onDirtyChange(true);
			};
			const changeReasoning = (value) => {
				markDirty();
				setReasoning(value);
			};
			const changeDeveloperRole = (value) => {
				markDirty();
				setDeveloperRole(value);
			};
			const changeStrategy = (value) => {
				markDirty();
				setStrategy(value);
			};
			const changeMaxText = (value) => {
				markDirty();
				setMaxText(value);
			};
			const save = async () => {
				if (countInvalid) {
					setFailure(t("retryInvalid"));
					return;
				}
				const maxRetries = aggressive ? AGGRESSIVE.maxRetries : countDraft.value;
				const ops = policyOps(schema, userLayer, { providerIds, reasoning, developerRole, strategy, maxRetries });
				setBusy(true);
				setFailure(void 0);
				try {
					const response = await mutate(ops, expectedRevision);
					if (!response.ok) {
						setFailure(response.error?.message ?? t("saveFailed"));
						if (response.error?.code === "settings/conflict") {
							onDirtyChange(false);
							onRefresh();
						}
						return;
					}
					onDirtyChange(false);
					onSaved();
					onRefresh();
				} catch (error) {
					setFailure(messageOf(error));
				} finally {
					setBusy(false);
				}
			};
			const countHint = countInvalid
				? jsx("span", { className: "dpp-hintError", children: t("retryInvalid") })
				: aggressive ? t("retryLocked") : t("retryCountHint");
			const countLabel = providerIds.length === 1 ? t("providerCountOne") : t("providerCountMany", { count: providerIds.length });
			return jsxs("div", { className: "dpp-card", children: [
				jsxs("div", { className: "dpp-cardHead", children: [
					jsx("span", { className: "dpp-cardTitle", children: t("globalTitle") }),
					jsx("span", { className: "dpp-tag", children: countLabel })
				] }),
				jsx("p", { className: "dpp-cardHint", children: t("globalHint") }),
				jsx(PolicyRow, {
					label: t("defaultReasoning"),
					hint: t("defaultReasoningHint"),
					children: jsx(DropdownControl, {
						id: "dpp-reasoning",
						value: reasoning,
						disabled: disabled,
						label: t("defaultReasoning"),
						onChange: changeReasoning,
						options: [{ value: "", label: t("defaultReasoningUnset") }, ...THINKING_LEVELS.map((level) => ({ value: level, label: level }))]
					})
				}),
				jsx(PolicyRow, {
					label: t("developerRole"),
					hint: t("developerRoleHint"),
					children: jsx(SegmentedControl, {
						id: "dpp-developer-role",
						value: developerRole,
						disabled: disabled,
						label: t("developerRole"),
						onChange: changeDeveloperRole,
						options: [
							{ value: "auto", label: t("developerRoleAuto") },
							{ value: "enabled", label: t("developerRoleEnabled") },
							{ value: "disabled", label: t("developerRoleDisabled") }
						]
					})
				}),
				jsx(PolicyRow, {
					label: t("retryStrategy"),
					hint: aggressive ? t("strategyAggressiveHint") : t("strategyStandardHint"),
					children: jsx(SegmentedControl, {
						id: "dpp-strategy",
						value: strategy,
						disabled: disabled,
						label: t("retryStrategy"),
						onChange: changeStrategy,
						options: [
							{ value: STRATEGY_STANDARD, label: t("strategyStandard") },
							{ value: STRATEGY_AGGRESSIVE, label: t("strategyAggressive") }
						]
					})
				}),
				jsx(PolicyRow, {
					label: t("retryCount"),
					hint: countHint,
					children: jsxs("span", { className: "dpp-controls", children: [
						jsx("input", {
							id: "dpp-retry-count",
							className: "dpp-input",
							type: "number",
							min: 0,
							step: 1,
							inputMode: "numeric",
							value: aggressive ? String(AGGRESSIVE.maxRetries) : maxText,
							disabled: disabled || aggressive,
							"aria-invalid": countInvalid,
							"aria-label": t("retryCount"),
							onChange: (event) => changeMaxText(event.target.value)
						}),
						jsx("span", { className: "dpp-unit", children: t("retryUnit") })
					] })
				}),
				jsx(RetryPreview, {
					count: previewCount,
					initialDelayMs: previewBackoff.initialDelayMs,
					maxDelayMs: previewBackoff.maxDelayMs,
					jitterRatio: previewJitter,
					aggressive,
					t
				}),
				jsxs("div", { className: "dpp-footer", children: [
					failure !== void 0
						? jsx("span", { className: "dpp-status dpp-statusError", children: failure })
						: saved === true
							? jsx("span", { className: "dpp-status dpp-statusOk", children: t("savedAt") })
							: jsx("span", { className: "dpp-status", children: t("saveHint") }),
					jsx("button", {
						type: "button",
						className: "dpp-save",
						disabled: disabled || countInvalid,
						onClick: () => {
							void save();
						},
						children: busy ? t("saving") : t("save")
					})
				] })
			] });
		}

		// ══ settings section ═══════════════════════════════════════════════
		/**
		 * The Provider Policy settings section: loads the llm-pi-ai namespace from the
		 * shared describe mirror, renders the one global policy card over every pi-ai
		 * provider, and reloads on pushed invalidations unless an edit is pending.
		 * @param props - { mutate, schema, describeFace, t, subscribeExternal }.
		 */
		function ProviderPolicySection(props) {
			const { mutate, schema, describeFace, t, subscribeExternal } = props;
			const [snapshot, setSnapshot] = useState({ status: "loading", error: void 0, writable: false, namespace: void 0 });
			const [reloadKey, setReloadKey] = useState(0);
			const [saved, setSaved] = useState(false);
			const dirtyRef = useRef(false);
			useEffect(() => {
				let disposed = false;
				setSnapshot((current) => ({ ...current, status: "loading", error: void 0 }));
				(async () => {
					try {
						await describeFace.ensure();
						if (disposed) return;
						const mirrored = describeFace.getSnapshot();
						if (mirrored.view === void 0) throw new Error(mirrored.error ?? t("namespaceMissing"));
						const namespace = mirrored.view.namespaces.find((view) => view.ns === SETTINGS_NS);
						setSnapshot({ status: "ready", error: void 0, writable: mirrored.view.writable, namespace });
					} catch (error) {
						if (!disposed) setSnapshot({ status: "error", error: messageOf(error), writable: false, namespace: void 0 });
					}
				})();
				return () => {
					disposed = true;
				};
			}, [reloadKey]);
			useEffect(() => subscribeExternal(() => {
				if (dirtyRef.current) return;
				setSaved(false);
				setReloadKey((key) => key + 1);
			}), [subscribeExternal]);
			const onRefresh = useCallback(() => setReloadKey((key) => key + 1), []);
			const onDirtyChange = useCallback((dirty) => {
				dirtyRef.current = dirty;
				if (dirty) setSaved(false);
			}, []);
			const onSaved = useCallback(() => setSaved(true), []);
			const namespace = snapshot.namespace;
			const providerIds = namespace === void 0 ? [] : providerIdsOf(schema, namespace);
			return jsxs("div", { className: "dpp-root", children: [
				jsx("h2", { className: "dpp-title", children: t("title") }),
				jsx("p", { className: "dpp-intro", children: t("intro") }),
				snapshot.status === "loading" ? jsx("p", { className: "dpp-caption", children: t("loading") }) : null,
				snapshot.status === "error" ? jsxs("p", { className: "dpp-error", children: [t("loadFailed"), " ", snapshot.error] }) : null,
				snapshot.status === "ready" && namespace === void 0 ? jsx("p", { className: "dpp-notice", children: t("namespaceMissing") }) : null,
				snapshot.status === "ready" && namespace !== void 0 && !snapshot.writable ? jsx("p", { className: "dpp-notice", children: t("readOnly") }) : null,
				snapshot.status === "ready" && namespace !== void 0 && providerIds.length === 0 ? jsx("p", { className: "dpp-notice", children: t("noProviders") }) : null,
				snapshot.status === "ready" && namespace !== void 0 && providerIds.length > 0 ? jsx(GlobalPolicyPanel, {
					key: "global:" + String(namespace.revision ?? 0),
					providerIds,
					namespace,
					mutate,
					schema,
					t,
					readOnly: !snapshot.writable,
					saved,
					onDirtyChange,
					onRefresh,
					onSaved
				}) : null,
				jsx(RetryNoticeCard, { t })
			] });
		}

		// ══ registration ═══════════════════════════════════════════════════
		/**
		 * Required services (cordis fiber inject). The target slot is declared by
		 * ui-settings' apply, whose activation order relative to this one is NOT
		 * constrained; registration depends on each slot through slots.inject().
		 * dsh 0.1.7: the settingsScope service was replaced by the configForms
		 * service provided by dsh-client-ui-settings.
		 */
		const inject = ["slots", "locale", "remote", "remote.settings", "configForms", "settingsSchema"];
		/**
		 * Register the Provider Policy section once the settings.section declaration is
		 * on the ledger and keep it fresh on pushed settings invalidations (unless the
		 * card holds unsaved edits).
		 * @param ctx - client root context.
		 */
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(LOCALE_NS, { zh, en }), "ui-provider-policy: copy dictionaries");
			const schema = { getPath: (value, path) => ctx.settingsSchema.getPath(value, path) };
			const describeFace = ctx.configForms.describe();
			const t = ctx.locale.bind(LOCALE_NS);
			const mutate = (ops, expectedRevision) => ctx.remote.settings.mutate(SETTINGS_NS, ops, expectedRevision);
			let notifyExternalUpdate = () => {};
			const injected = () => ({
				mutate,
				schema,
				describeFace,
				t,
				subscribeExternal: (listener) => {
					notifyExternalUpdate = listener;
					return () => {
						notifyExternalUpdate = () => {};
					};
				}
			});
			ctx.effect(() => {
				const onStorage = (event) => {
					if (event.key !== RETRY_NOTICE_KEY) return;
					retryNoticeMode.adopt(event.newValue);
				};
				window.addEventListener("storage", onStorage);
				return () => window.removeEventListener("storage", onStorage);
			}, "ui-provider-policy: retry notice preference sync");
			ctx.effect(() => {
				let disposeOverride;
				const sync = () => {
					const quiet = retryNoticeMode.get() !== RETRY_NOTICE_DEFAULT;
					if (quiet && disposeOverride === void 0) {
						disposeOverride = ctx.slots.inject(CONVERSATION_NODE_SLOT, () => ctx.slots.register({
							name: CONVERSATION_NODE_SLOT,
							key: RETRY_NODE_KEY,
							priority: -1,
							locale: LOCALE_NS,
							registrant: "dsh-ui-provider-policy"
						}, QuietRetryNodeView));
					} else if (!quiet && disposeOverride !== void 0) {
						disposeOverride();
						disposeOverride = void 0;
					}
				};
				const stop = retryNoticeMode.subscribe(sync);
				sync();
				return () => {
					stop();
					if (disposeOverride !== void 0) {
						disposeOverride();
						disposeOverride = void 0;
					}
				};
			}, "ui-provider-policy: quiet retry rows");
			ctx.effect(() => ctx.remote.$on("settings/document-updated", () => notifyExternalUpdate()), "ui-provider-policy: pushed invalidations");
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "provider-policy",
				order: 15,
				label: () => t("nav"),
				inject: injected
			}, ProviderPolicySection));
		}

		injectPanelStyles();
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
