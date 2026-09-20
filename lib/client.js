window.__ModuleLoader__.load({
	id: "dsh-ui-provider-policy",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		const h = react.createElement;

		const NS = "settings.providerPolicy";
		const SETTINGS_NS = "llm-pi-ai";
		/** Every pi-ai thinking level a profile may declare, in escalation order. */
		const THINKING_LEVELS = ["off", "minimal", "low", "medium", "high", "xhigh", "max"];
		const DEFAULT_REASONING_EFFORTS = {
			off: null,
			minimal: "minimal",
			low: "low",
			medium: "medium",
			high: "high",
			xhigh: "xhigh",
			max: "max"
		};
		/** Every retryable error code, in write order. QUOTA is NOT in the compiled
		* default whitelist — quota-shaped 429s only retry when explicitly listed. */
		const RETRYABLE_CODES = ["EMPTY_RESPONSE", "RATE_LIMIT", "QUOTA", "SERVER", "TIMEOUT", "TRANSPORT"];
		const DEFAULT_BACKOFF = { initialDelayMs: 2000, maxDelayMs: 60000 };
		/** The host's own jitter default, mirrored by the preview. */
		const DEFAULT_JITTER_RATIO = 0.1;
		/** Retry strategies this card can write; both resolve to the host's normal mode. */
		const STRATEGY_STANDARD = "standard";
		const STRATEGY_AGGRESSIVE = "aggressive";
		/** The aggressive preset: waits of 1s, 2s, 4s, then a 5s cap — 1000 retries, no jitter. */
		const AGGRESSIVE = { maxRetries: 1000, backoff: { initialDelayMs: 1000, maxDelayMs: 5000, jitterRatio: 0 } };

		/** English strings (the key-set source of truth for this pair). */
		const en = {
			nav: "Provider Policy",
			title: "Provider Policy",
			intro: "Default reasoning, retry strategy and preview, and developer-role compat for OpenAI-compatible (pi-ai) providers — fields the stock Models page exposes no controls for.",
			globalTitle: "Global provider policy",
			globalIntro: "Applied to every OpenAI-compatible (pi-ai) provider and all of their models: default reasoning, retry strategy, and developer-role compat. All models get thinking enabled; the per-conversation level is chosen in the chat dialog's model dropdown.",
			noProviders: "No pi-ai providers are configured yet.",
			readOnly: "Settings are read-only in this browser.",
			namespaceMissing: "The llm-pi-ai settings namespace is not available.",
			loadFailed: "Failed to load settings.",
			defaultReasoning: "Default reasoning",
			defaultReasoningUnset: "Provider default",
			retryStrategy: "Retry strategy",
			strategyStandard: "Standard (count editable)",
			strategyAggressive: "Aggressive (1s → 2s → cap 5s, 1000 retries)",
			strategyAggressiveHint: "The aggressive strategy locks the retry count at 1000 and tightens the backoff to 1s, 2s, 4s, then a 5s cap with jitter off.",
			retryCount: "Retry count",
			retryLocked: "Locked at 1000 by the aggressive strategy.",
			retryInvalid: "Retry count must be a non-negative integer.",
			retryPreview: "Retry preview",
			previewAt: "#{n} {d}",
			previewCapFrom: "from #{n} {d} (cap)",
			previewTotal: "{count} retries, ≈ {total} of cumulative wait",
			previewJitter: "actual waits carry ±{percent}% jitter; the curve is nominal",
			previewNone: "Zero retries: a failure ends the step instead of retrying.",
			previewSource: "The standard strategy keeps each provider's own backoff — the curve reads provider {provider}, and saving leaves the other providers untouched.",
			axisRetries: "retry count",
			axisTime: "wait",
			developerRole: "Developer role",
			developerRoleHint: "Auto follows the adapter's own detection; disable it when the gateway rejects the developer role.",
			developerRoleAuto: "Automatic",
			developerRoleEnabled: "Enabled",
			developerRoleDisabled: "Disabled",
			save: "Save",
			savedAt: "Saved"
		};
		/** Chinese strings. */
		const zh = {
			nav: "供应商策略",
			title: "供应商策略",
			intro: "为 OpenAI 兼容(pi-ai)供应商配置默认推理强度、重试策略与预览、以及 Developer 角色兼容 —— 原生“模型”页不提供这些字段的控件。",
			globalTitle: "全局供应商策略",
			globalIntro: "应用到所有 OpenAI 兼容(pi-ai)供应商及其全部模型:默认推理强度、重试策略与 Developer 角色兼容。所有模型默认开启思考,逐次选择在对话的模型下拉框里进行。",
			noProviders: "尚未配置任何 pi-ai 供应商。",
			readOnly: "此浏览器对设置为只读。",
			namespaceMissing: "llm-pi-ai 设置命名空间不可用。",
			loadFailed: "加载设置失败。",
			defaultReasoning: "默认推理强度",
			defaultReasoningUnset: "供应商默认",
			retryStrategy: "重试策略",
			strategyStandard: "标准(次数可调)",
			strategyAggressive: "激进(1s → 2s → 上限 5s,1000 次)",
			strategyAggressiveHint: "激进策略把重试次数锁定为 1000,退避收紧为 1s、2s、4s,之后封顶 5s,并关闭随机抖动。",
			retryCount: "重试次数",
			retryLocked: "激进策略下固定为 1000,不可调整。",
			retryInvalid: "重试次数必须是非负整数。",
			retryPreview: "重试预览",
			previewAt: "第 {n} 次 {d}",
			previewCapFrom: "第 {n} 次起 {d}(封顶)",
			previewTotal: "共 {count} 次,累计等待约 {total}",
			previewJitter: "实际等待含 ±{percent}% 随机抖动,曲线为标称值",
			previewNone: "重试次数为 0:失败即结束,不再重试。",
			previewSource: "标准策略沿用各供应商自己的退避参数 —— 曲线按供应商 {provider} 的当前值绘制,保存时不改动其他供应商。",
			axisRetries: "重试次数",
			axisTime: "等待时间",
			developerRole: "Developer 角色",
			developerRoleHint: "自动沿用适配器自身检测;网关拒绝 developer 角色时选择禁用。",
			developerRoleAuto: "自动",
			developerRoleEnabled: "启用",
			developerRoleDisabled: "禁用",
			save: "保存",
			savedAt: "已保存"
		};

		/** A string field read off a settings object, undefined otherwise. */
		const stringAt = (value, key) => typeof value?.[key] === "string" ? value[key] : void 0;

		function messageOf(error) {
			return error instanceof Error ? error.message : String(error);
		}

		/** The provider-scoped developer-role tri-state from user layer first, resolved fallback second. */
		function compatModeOf(userProvider, fallbackProvider) {
			for (const source of [userProvider, fallbackProvider]) {
				const stored = source?.compat?.supportsDeveloperRole;
				if (typeof stored === "boolean") return stored ? "enabled" : "disabled";
			}
			return "auto";
		}

		/** Parse a non-negative integer field text; undefined when blank or invalid. */
		function parseCountText(text) {
			const cleaned = text.trim();
			if (cleaned === "") return { blank: true };
			const parsed = Number(cleaned);
			if (!Number.isSafeInteger(parsed) || parsed < 0) return { invalid: true };
			return { value: parsed };
		}

		/** The backoff one provider effectively runs: its own values, else the panel defaults. */
		function backoffOf(policy) {
			const backoff = typeof policy?.backoff === "object" && policy.backoff !== null ? policy.backoff : {};
			const initialDelayMs = typeof backoff.initialDelayMs === "number" ? backoff.initialDelayMs : DEFAULT_BACKOFF.initialDelayMs;
			const maxDelayMs = typeof backoff.maxDelayMs === "number" ? Math.max(backoff.maxDelayMs, initialDelayMs) : Math.max(DEFAULT_BACKOFF.maxDelayMs, initialDelayMs);
			const jitterRatio = typeof backoff.jitterRatio === "number" ? backoff.jitterRatio : DEFAULT_JITTER_RATIO;
			return { initialDelayMs, maxDelayMs, jitterRatio };
		}

		/** Which strategy a stored policy already encodes. */
		function strategyOf(policy) {
			const backoff = backoffOf(policy);
			return policy?.maxRetries === AGGRESSIVE.maxRetries
				&& backoff.initialDelayMs === AGGRESSIVE.backoff.initialDelayMs
				&& backoff.maxDelayMs === AGGRESSIVE.backoff.maxDelayMs
				? STRATEGY_AGGRESSIVE
				: STRATEGY_STANDARD;
		}

		// ── retry-preview math over the host's own backoff function ──────────────
		/** The host's exponential backoff, one wait per retry: min(initial × 2^(n-1), max). */
		function retryWaits(count, initialDelayMs, maxDelayMs) {
			const waits = [];
			for (let index = 0; index < count; index += 1) {
				waits.push(Math.min(initialDelayMs * 2 ** Math.min(index, 60), maxDelayMs));
			}
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

		// ── shared inline styles over the app's semantic tokens ──────────────────
		const rootStyle = { display: "flex", flexDirection: "column", gap: 14, maxWidth: 720, color: "var(--dsw-alias-label-primary)" };
		const titleStyle = { margin: 0, fontSize: 18, fontWeight: 600 };
		const introStyle = { margin: 0, color: "var(--dsw-alias-label-secondary)", fontSize: 13, lineHeight: 1.6 };
		const cardStyle = { border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 12, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14 };
		const cardTitleStyle = { fontSize: 14, fontWeight: 600 };
		const fieldStyle = { display: "flex", flexDirection: "column", gap: 6 };
		const fieldLabelStyle = { color: "var(--dsw-alias-label-secondary)", fontSize: 12, fontWeight: 500 };
		const fieldHintStyle = { color: "var(--dsw-alias-label-tertiary)", fontSize: 12, lineHeight: 1.5 };
		const inputStyle = { background: "var(--dsw-alias-bg-base)", border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 8, padding: "6px 10px", color: "var(--dsw-alias-label-primary)", fontSize: 13, width: 200 };
		const selectStyle = { ...inputStyle, width: "auto", minWidth: 160 };
		const primaryButtonStyle = { background: "var(--dsw-alias-button-primary-fill)", color: "var(--dsw-alias-label-primary-foreground)", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer" };
		const failureStyle = { color: "var(--dsw-alias-state-error-primary)", fontSize: 12, lineHeight: 1.5, whiteSpace: "pre-wrap" };
		const outcomeStyle = { color: "var(--dsw-alias-state-success-primary)", fontSize: 12 };
		const noticeStyle = { border: "1px solid var(--dsw-alias-state-warn-primary)", borderRadius: 12, padding: "10px 14px", color: "var(--dsw-alias-state-warn-label)", fontSize: 13 };
		const chartStyle = { display: "block", width: "100%", height: "auto", background: "var(--dsw-alias-bg-base)", border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 10 };

		/**
		* The retry preview: one inline SVG plotting the host's real backoff function —
		* the wait before retry n against n — whose area under the curve is exactly the
		* cumulative wait. Axes, unit, and sampling re-fit whatever strategy and count
		* are selected instead of a fixed window, so 1000 retries stay legible.
		* @param props - { count, initialDelayMs, maxDelayMs, jitterRatio, showSource, t }.
		*/
		function RetryPreview(props) {
			const { count, initialDelayMs, maxDelayMs, jitterRatio, showSource, t } = props;
			const waits = retryWaits(count, initialDelayMs, maxDelayMs);
			if (waits.length === 0) {
				return (0, react_jsx_runtime.jsxs)("div", { style: fieldStyle, children: [
					(0, react_jsx_runtime.jsx)("span", { style: fieldLabelStyle, children: t("retryPreview") }),
					(0, react_jsx_runtime.jsx)("span", { style: fieldHintStyle, children: t("previewNone") })
				] });
			}
			const peak = waits[waits.length - 1];
			const unit = axisUnit(peak);
			const ticks = axisTicks((peak / unit[0]) * 1.05, 4);
			const top = ticks[ticks.length - 1];
			const total = waits.reduce((sum, wait) => sum + wait, 0);
			const capped = capRetryNumber(waits, maxDelayMs);
			const width = 680;
			const height = 204;
			const pad = { left: 66, right: 24, top: 26, bottom: 36 };
			const plotWidth = width - pad.left - pad.right;
			const plotHeight = height - pad.top - pad.bottom;
			const baseline = pad.top + plotHeight;
			const xOf = (index) => pad.left + (count <= 1 ? plotWidth / 2 : (index / (count - 1)) * plotWidth);
			const yOf = (value) => baseline - (value / unit[0] / top) * plotHeight;
			const stride = Math.max(1, Math.ceil(count / 160));
			const sampled = [];
			for (let index = 0; index < count; index += stride) sampled.push(index);
			if (sampled[sampled.length - 1] !== count - 1) sampled.push(count - 1);
			const pointOf = (index) => xOf(index).toFixed(1) + "," + yOf(waits[index]).toFixed(1);
			const line = sampled.map(pointOf).join(" ");
			const areaPath = "M " + pad.left.toFixed(1) + "," + baseline.toFixed(1) + " L " + sampled.map(pointOf).join(" L ") + " L " + xOf(count - 1).toFixed(1) + "," + baseline.toFixed(1) + " Z";
			const tickCount = Math.min(count, 5);
			const xTicks = [...new Set(Array.from({ length: tickCount }, (_unused, slot) => tickCount <= 1 ? 0 : Math.round((slot / (tickCount - 1)) * (count - 1))))];
			const capX = xOf(capped - 1);
			const capLabelX = Math.min(Math.max(capX + 8, pad.left), pad.left + plotWidth - 168);
			const ramp = Math.min(capped - 1, 3);
			const steps = [];
			for (let index = 0; index < ramp; index += 1) steps.push(t("previewAt", { n: index + 1, d: formatDuration(waits[index]) }));
			if (capped <= count) steps.push(t("previewCapFrom", { n: capped, d: formatDuration(maxDelayMs) }));
			const labelColor = "var(--dsw-alias-label-tertiary)";
			const gridColor = "var(--dsw-alias-border-l2)";
			const accent = "var(--dsw-alias-brand-primary)";
			const chart = [];
			for (const [index, tick] of ticks.entries()) {
				const y = yOf(tick * unit[0]);
				chart.push(h("line", { key: "grid" + index, x1: pad.left, y1: y, x2: pad.left + plotWidth, y2: y, stroke: gridColor, strokeWidth: 1, strokeDasharray: tick === 0 ? void 0 : "3 3" }));
				chart.push(h("text", { key: "ylabel" + index, x: pad.left - 10, y: y + 4, textAnchor: "end", fill: labelColor, fontSize: 11 }, trimDecimal(tick, Number.isInteger(tick) ? 0 : 1) + unit[1]));
			}
			for (const index of xTicks) chart.push(h("text", { key: "xlabel" + index, x: xOf(index), y: height - 20, textAnchor: "middle", fill: labelColor, fontSize: 11 }, String(index + 1)));
			chart.push(h("line", { key: "xaxis", x1: pad.left, y1: baseline, x2: pad.left + plotWidth, y2: baseline, stroke: gridColor, strokeWidth: 1 }));
			chart.push(h("path", { key: "area", d: areaPath, fill: accent, fillOpacity: 0.12 }));
			chart.push(h("polyline", { key: "curve", points: line, fill: "none", stroke: accent, strokeWidth: 2, strokeLinejoin: "round" }));
			if (capped <= count) {
				chart.push(h("line", { key: "cap", x1: capX, y1: pad.top, x2: capX, y2: baseline, stroke: "var(--dsw-alias-state-warn-primary)", strokeWidth: 1, strokeDasharray: "4 3" }));
				chart.push(h("circle", { key: "capdot", cx: capX, cy: yOf(waits[capped - 1]), r: 3, fill: "var(--dsw-alias-state-warn-primary)" }));
				chart.push(h("text", { key: "caplabel", x: capLabelX, y: pad.top + 12, fill: "var(--dsw-alias-state-warn-label)", fontSize: 11 }, t("previewCapFrom", { n: capped, d: formatDuration(maxDelayMs) })));
			}
			const totalText = t("previewTotal", { count, total: formatDuration(total) });
			return (0, react_jsx_runtime.jsxs)("div", { style: fieldStyle, children: [
				(0, react_jsx_runtime.jsx)("span", { style: fieldLabelStyle, children: t("retryPreview") }),
				h("svg", {
					viewBox: "0 0 " + width + " " + height,
					style: chartStyle,
					role: "img",
					"aria-label": t("retryPreview") + ": " + steps.join(" · ") + " · " + totalText,
					children: [
						h("text", { key: "yaxis", x: 4, y: 12, fill: labelColor, fontSize: 11 }, t("axisTime") + " (" + unit[1] + ")"),
						...chart
					]
				}),
				h("span", { style: fieldHintStyle }, steps.join(" · ")),
				h("span", { style: fieldHintStyle }, jitterRatio > 0 ? totalText + " · " + t("previewJitter", { percent: trimDecimal(jitterRatio * 100, 1) }) : totalText),
				showSource ? h("span", { style: fieldHintStyle }, t("previewSource", { provider: showSource })) : null
			] });
		}

		/**
		* The single global policy card: one set of default reasoning, retry strategy,
		* and developer-role compat applied to every pi-ai provider, plus turns
		* thinking ON (full reasoningEfforts) for every model of every provider so
		* the chat's reasoning dropdown is always present.
		* @param props - { providerIds, namespace, mutate, schema, t, readOnly, onDirtyChange, onRefresh }.
		*/
		function GlobalPolicyCard(props) {
			const { providerIds, namespace, mutate, schema, t, readOnly, onDirtyChange, onRefresh } = props;
			const [expectedRevision] = react.useState(() => namespace.revision);
			const userLayer = namespace.user ?? {};
			const first = providerIds[0];
			const firstUser = first === void 0 ? {} : schema.getPath(userLayer, ["providers", first]) ?? {};
			const firstFallback = first === void 0 ? firstUser : schema.getPath(namespace.value, ["providers", first]) ?? firstUser;
			const [reasoning, setReasoning] = react.useState(() => stringAt(firstUser, "reasoning") ?? stringAt(firstFallback, "reasoning") ?? "");
			const [developerRole, setDeveloperRole] = react.useState(() => compatModeOf(firstUser, firstFallback));
			const savedPolicy = typeof firstFallback.retryPolicy === "object" && firstFallback.retryPolicy !== null ? firstFallback.retryPolicy : {};
			const [strategy, setStrategy] = react.useState(() => strategyOf(savedPolicy));
			const [maxText, setMaxText] = react.useState(() => String(typeof savedPolicy.maxRetries === "number" ? savedPolicy.maxRetries : 10));
			const [busy, setBusy] = react.useState(false);
			const [failure, setFailure] = react.useState(void 0);
			const [outcome, setOutcome] = react.useState(void 0);
			const disabled = readOnly || busy || providerIds.length === 0;
			const aggressive = strategy === STRATEGY_AGGRESSIVE;
			const previewBackoff = aggressive ? AGGRESSIVE.backoff : backoffOf(savedPolicy);
			const parsedCount = parseCountText(maxText);
			const previewCount = aggressive
				? AGGRESSIVE.maxRetries
				: parsedCount.value ?? (typeof savedPolicy.maxRetries === "number" ? savedPolicy.maxRetries : 10);
			const markDirty = () => {
				setFailure(void 0);
				setOutcome(void 0);
				onDirtyChange("global", true);
			};
			/** Apply the global policy to every pi-ai provider and turn thinking ON for
			* each of their models (full level map) so the chat's reasoning dropdown is
			* always present; the per-conversation level is chosen in the chat. The
			* standard strategy keeps each provider's own retryable codes and backoff;
			* the aggressive strategy overwrites the backoff with its own preset. */
			const apply = async () => {
				const retries = aggressive ? { value: AGGRESSIVE.maxRetries } : parseCountText(maxText);
				if (retries.invalid || retries.value === void 0) {
					setFailure(t("retryInvalid"));
					return;
				}
				const ops = [];
				for (const providerId of providerIds) {
					const base = ["providers", providerId];
					if (reasoning === "") ops.push({ op: "unset", path: [...base, "reasoning"] });
					else ops.push({ op: "set", path: [...base, "reasoning"], value: reasoning });
					const existing = schema.getPath(userLayer, [...base, "retryPolicy"]);
					const policy = typeof existing === "object" && existing !== null ? { ...existing } : {};
					if (!Array.isArray(policy.retryableCodes) || policy.retryableCodes.length === 0) policy.retryableCodes = RETRYABLE_CODES.slice();
					if (aggressive) policy.backoff = { ...AGGRESSIVE.backoff };
					else if (typeof policy.backoff !== "object" || policy.backoff === null) policy.backoff = { ...DEFAULT_BACKOFF };
					policy.mode = "normal";
					policy.maxRetries = retries.value;
					ops.push({ op: "set", path: [...base, "retryPolicy"], value: policy });
					const userCompat = schema.getPath(userLayer, [...base, "compat"]);
					if (developerRole === "auto") {
						const c = typeof userCompat === "object" && userCompat !== null ? { ...userCompat } : {};
						if ("supportsDeveloperRole" in c) {
							delete c.supportsDeveloperRole;
							if (Object.keys(c).length === 0) ops.push({ op: "unset", path: [...base, "compat"] });
							else ops.push({ op: "set", path: [...base, "compat"], value: c });
						}
					} else ops.push({ op: "set", path: [...base, "compat"], value: {
						...(typeof userCompat === "object" && userCompat !== null ? userCompat : {}),
						supportsDeveloperRole: developerRole === "enabled"
					} });
					const models = schema.getPath(userLayer, [...base, "models"]) ?? schema.getPath(namespace.value, [...base, "models"]) ?? [];
					if (Array.isArray(models) && models.length > 0) {
						ops.push({ op: "set", path: [...base, "models"], value: models.map((model) => ({ ...model, reasoningEfforts: { ...DEFAULT_REASONING_EFFORTS } })) });
					}
				}
				setBusy(true);
				setFailure(void 0);
				try {
					const response = await mutate(ops, expectedRevision);
					if (!response.ok) {
						setFailure(response.error.message);
						if (response.error?.code === "settings/conflict") {
							onDirtyChange("global", false);
							onRefresh();
						}
						return;
					}
					onDirtyChange("global", false);
					setOutcome("saved");
					onRefresh();
				} catch (error) {
					setFailure(messageOf(error));
				} finally {
					setBusy(false);
				}
			};
			return (0, react_jsx_runtime.jsxs)("div", { style: cardStyle, children: [
				(0, react_jsx_runtime.jsx)("span", { style: cardTitleStyle, children: t("globalTitle") }),
				(0, react_jsx_runtime.jsx)("span", { style: fieldHintStyle, children: t("globalIntro") }),
				(0, react_jsx_runtime.jsxs)("div", { style: fieldStyle, children: [
					(0, react_jsx_runtime.jsx)("span", { style: fieldLabelStyle, children: t("defaultReasoning") }),
					(0, react_jsx_runtime.jsxs)("select", { style: selectStyle, value: reasoning, disabled, onChange: (event) => {
						markDirty();
						setReasoning(event.target.value);
					}, children: [
						(0, react_jsx_runtime.jsx)("option", { value: "", children: t("defaultReasoningUnset") }),
						THINKING_LEVELS.map((level) => (0, react_jsx_runtime.jsx)("option", { value: level, children: level }, level))
					] })
				] }),
				(0, react_jsx_runtime.jsxs)("div", { style: fieldStyle, children: [
					(0, react_jsx_runtime.jsx)("span", { style: fieldLabelStyle, children: t("developerRole") }),
					(0, react_jsx_runtime.jsxs)("select", { style: selectStyle, value: developerRole, disabled, onChange: (event) => {
						markDirty();
						setDeveloperRole(event.target.value);
					}, children: [
						(0, react_jsx_runtime.jsx)("option", { value: "auto", children: t("developerRoleAuto") }),
						(0, react_jsx_runtime.jsx)("option", { value: "enabled", children: t("developerRoleEnabled") }),
						(0, react_jsx_runtime.jsx)("option", { value: "disabled", children: t("developerRoleDisabled") })
					] }),
					(0, react_jsx_runtime.jsx)("span", { style: fieldHintStyle, children: t("developerRoleHint") })
				] }),
				(0, react_jsx_runtime.jsxs)("div", { style: fieldStyle, children: [
					(0, react_jsx_runtime.jsx)("span", { style: fieldLabelStyle, children: t("retryStrategy") }),
					(0, react_jsx_runtime.jsxs)("select", { style: selectStyle, value: strategy, disabled, onChange: (event) => {
						markDirty();
						setStrategy(event.target.value);
					}, children: [
						(0, react_jsx_runtime.jsx)("option", { value: STRATEGY_STANDARD, children: t("strategyStandard") }),
						(0, react_jsx_runtime.jsx)("option", { value: STRATEGY_AGGRESSIVE, children: t("strategyAggressive") })
					] }),
					aggressive ? (0, react_jsx_runtime.jsx)("span", { style: fieldHintStyle, children: t("strategyAggressiveHint") }) : null
				] }),
				(0, react_jsx_runtime.jsxs)("div", { style: fieldStyle, children: [
					(0, react_jsx_runtime.jsx)("span", { style: fieldLabelStyle, children: t("retryCount") }),
					(0, react_jsx_runtime.jsx)("input", { style: inputStyle, type: "number", min: 0, step: 1, value: aggressive ? String(AGGRESSIVE.maxRetries) : maxText, disabled: disabled || aggressive, onChange: (event) => {
						markDirty();
						setMaxText(event.target.value);
					} }),
					aggressive ? (0, react_jsx_runtime.jsx)("span", { style: fieldHintStyle, children: t("retryLocked") }) : null
				] }),
				(0, react_jsx_runtime.jsx)(RetryPreview, {
					count: previewCount,
					initialDelayMs: previewBackoff.initialDelayMs,
					maxDelayMs: previewBackoff.maxDelayMs,
					jitterRatio: aggressive ? 0 : previewBackoff.jitterRatio,
					showSource: aggressive ? void 0 : String(first),
					t
				}),
				failure !== void 0 ? (0, react_jsx_runtime.jsx)("div", { style: failureStyle, children: failure }) : null,
				outcome === "saved" ? (0, react_jsx_runtime.jsx)("span", { style: outcomeStyle, children: t("savedAt") }) : null,
				(0, react_jsx_runtime.jsx)("button", { type: "button", style: primaryButtonStyle, disabled, onClick: () => {
					void apply();
				}, children: t("save") })
			] });
		}

		/**
		* The Provider Policy settings section: loads the llm-pi-ai namespace from
		* the shared describe mirror, renders one global policy card for every
		* pi-ai provider, and reloads on pushed invalidations unless dirty.
		* @param props - { mutate, schema, describeFace, t, subscribeExternal }.
		*/
		function ProviderPolicySection(props) {
			const { mutate, schema, describeFace, t, subscribeExternal } = props;
			const [snapshot, setSnapshot] = react.useState({ status: "idle", error: void 0, writable: false, namespace: void 0 });
			const [reloadKey, setReloadKey] = react.useState(0);
			const dirtyRef = react.useRef(new Set());
			react.useEffect(() => {
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
			react.useEffect(() => subscribeExternal(() => {
				if (dirtyRef.current.size === 0) setReloadKey((key) => key + 1);
			}), [subscribeExternal]);
			const onRefresh = react.useCallback(() => setReloadKey((key) => key + 1), []);
			const onDirtyChange = react.useCallback((providerId, dirty) => {
				if (dirty) dirtyRef.current.add(providerId);
				else dirtyRef.current.delete(providerId);
			}, []);
			const namespace = snapshot.namespace;
			let providerIds = [];
			if (namespace !== void 0) {
				const userProviders = schema.getPath(namespace.user ?? {}, ["providers"]) ?? {};
				const resolvedProviders = schema.getPath(namespace.value, ["providers"]) ?? {};
				providerIds = [...new Set([...Object.keys(userProviders), ...Object.keys(resolvedProviders)])].sort();
			}
			return (0, react_jsx_runtime.jsxs)("div", { style: rootStyle, children: [
				(0, react_jsx_runtime.jsx)("span", { style: titleStyle, children: t("title") }),
				(0, react_jsx_runtime.jsx)("p", { style: introStyle, children: t("intro") }),
				snapshot.status === "loading" ? (0, react_jsx_runtime.jsx)("span", { style: fieldHintStyle, children: "…" }) : null,
				snapshot.status === "error" ? (0, react_jsx_runtime.jsxs)("div", { style: failureStyle, children: [
					t("loadFailed") + " ",
					snapshot.error
				] }) : null,
				snapshot.status === "ready" && namespace === void 0 ? (0, react_jsx_runtime.jsx)("div", { style: noticeStyle, children: t("namespaceMissing") }) : null,
				snapshot.status === "ready" && namespace !== void 0 && !snapshot.writable ? (0, react_jsx_runtime.jsx)("div", { style: noticeStyle, children: t("readOnly") }) : null,
				snapshot.status === "ready" && namespace !== void 0 && providerIds.length === 0 ? (0, react_jsx_runtime.jsx)("div", { style: noticeStyle, children: t("noProviders") }) : null,
				snapshot.status === "ready" && namespace !== void 0 && providerIds.length > 0 ? (0, react_jsx_runtime.jsx)(GlobalPolicyCard, { key: "global:" + (namespace.revision ?? 0), providerIds, namespace, mutate, schema, t, readOnly: !snapshot.writable, onDirtyChange, onRefresh }) : null
			] });
		}

		/**
		* Hide the Cordis service identity behind the one bound schema callback this
		* panel needs: an immutable path read.
		* @param service - settings-owned schema service available in the apply context.
		*/
		function createSettingsSchemaOperations(service) {
			return {
				getPath: (value, path) => service.getPath(value, path)
			};
		}

		/**
		* Required services (cordis fiber inject). The target slot is declared by
		* ui-settings' apply, whose activation order relative to this one is NOT
		* constrained; registration depends on each slot through slots.inject().
		*/
		const inject = ["slots", "locale", "remote", "remote.settings", "settingsScope", "settingsSchema"];
		/**
		* Register the Provider Policy section once the settings.section
		* declaration is on the ledger and keep it fresh on pushed settings
		* invalidations (unless the card is dirty).
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "ui-provider-policy: copy dictionaries");
			const schema = createSettingsSchemaOperations(ctx.settingsSchema);
			const describeFace = ctx.settingsScope.describe();
			const t = ctx.locale.bind(NS);
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
			ctx.effect(() => ctx.remote.$on("settings/document-updated", () => notifyExternalUpdate()), "ui-provider-policy: pushed invalidations");
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "provider-policy",
				order: 15,
				label: () => t("nav"),
				inject: injected
			}, ProviderPolicySection));
		}
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
