window.__ModuleLoader__.load({
	id: "dsh-ui-provider-policy",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");

		const NS = "settings.providerPolicy";
		const SETTINGS_NS = "llm-pi-ai";
		/** Every pi-ai thinking level a profile may declare, in escalation order. */
		const THINKING_LEVELS = ["off", "minimal", "low", "medium", "high", "xhigh", "max"];
		/**
		* The mapping written when a model's thinking is switched on: each level
		* dispatches its own name as the wire value; only `off` may stay empty.
		*/
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

		/** English strings (the key-set source of truth for this pair). */
		const en = {
			nav: "Provider Policy",
			title: "Provider Policy",
			intro: "Default reasoning effort, retry policy, and developer-role compat for OpenAI-compatible (pi-ai) providers — fields the stock Models page exposes no controls for.",
			provider: "Provider",
			noProviders: "No pi-ai providers are configured yet.",
			readOnly: "Settings are read-only in this browser.",
			namespaceMissing: "The llm-pi-ai settings namespace is not available.",
			loadFailed: "Failed to load settings.",
			defaultReasoning: "Default reasoning",
			defaultReasoningUnset: "Provider default",
			retryCount: "Retry count",
			retryCountHint: "Empty removes the retry policy.",
			retryInvalid: "Retry count must be a non-negative integer.",
			retryableCodes: "Retryable codes",
			quotaHint: "A 429 quota error classifies as QUOTA, which the default whitelist omits — keep QUOTA checked so quota 429s retry.",
			needOneCode: "Keep at least one retryable code.",
			backoffInitial: "Initial delay (ms)",
			backoffMax: "Max delay (ms)",
			delayInvalid: "Backoff delays must be positive integers.",
			backoffPreview: "Backoff preview",
			developerRole: "Developer role",
			developerRoleHint: "Auto follows the adapter's own detection; disable it when the gateway rejects the developer role.",
			developerRoleAuto: "Automatic",
			developerRoleEnabled: "Enabled",
			developerRoleDisabled: "Disabled",
			modelsTitle: "Models",
			modelsEmpty: "No models configured for this provider.",
			thinkingMode: "Thinking",
			thinkingInherited: "Inherit",
			thinkingEnabled: "Enabled",
			thinkingDisabled: "Disabled",
			reasoningLevels: "Reasoning levels",
			save: "Save",
			reset: "Reset",
			savedAt: "Saved",
			unsaved: "Unsaved changes",
			globalRetryTitle: "Global retry policy",
			globalRetryIntro: "Write one retry policy to every pi-ai provider at once. Providers that already declare custom retryable codes keep them.",
			applyRetryToAll: "Apply to all providers",
			appliedCount: "Applied to {count} providers"
		};
		/** Chinese strings. */
		const zh = {
			nav: "供应商策略",
			title: "供应商策略",
			intro: "为 OpenAI 兼容(pi-ai)供应商配置默认推理强度、重试策略与 Developer 角色兼容 —— 原生“模型”页不提供这些字段的控件。",
			provider: "供应商",
			noProviders: "尚未配置任何 pi-ai 供应商。",
			readOnly: "此浏览器对设置为只读。",
			namespaceMissing: "llm-pi-ai 设置命名空间不可用。",
			loadFailed: "加载设置失败。",
			defaultReasoning: "默认推理强度",
			defaultReasoningUnset: "供应商默认",
			retryCount: "重试次数",
			retryCountHint: "留空表示删除重试策略。",
			retryInvalid: "重试次数必须是非负整数。",
			retryableCodes: "可重试错误码",
			quotaHint: "429 配额错误分类为 QUOTA,官方默认白名单不含它 —— 保持勾选 QUOTA 才能重试配额 429。",
			needOneCode: "至少保留一个可重试错误码。",
			backoffInitial: "初始退避(ms)",
			backoffMax: "最大退避(ms)",
			delayInvalid: "退避时长必须是正整数。",
			backoffPreview: "退避预览",
			developerRole: "Developer 角色",
			developerRoleHint: "自动沿用适配器自身检测;网关拒绝 developer 角色时选择禁用。",
			developerRoleAuto: "自动",
			developerRoleEnabled: "启用",
			developerRoleDisabled: "禁用",
			modelsTitle: "模型",
			modelsEmpty: "该供应商未配置模型。",
			thinkingMode: "思考模式",
			thinkingInherited: "继承",
			thinkingEnabled: "开启",
			thinkingDisabled: "关闭",
			reasoningLevels: "推理强度",
			save: "保存",
			reset: "重置",
			savedAt: "已保存",
			unsaved: "有未保存的修改",
			globalRetryTitle: "全局重试策略",
			globalRetryIntro: "将同一份重试策略写入所有 pi-ai 供应商。已自定义可重试错误码的供应商保留其列表。",
			applyRetryToAll: "应用到所有供应商",
			appliedCount: "已应用到 {count} 个供应商"
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

		/** Whether a model's stored `reasoningEfforts` is on, off, or inherited. */
		function thinkingModeOf(efforts) {
			if (efforts === false) return "disabled";
			if (typeof efforts === "object" && efforts !== null) return "enabled";
			return "inherit";
		}

		/** "2s → 4s → … → 60s+" for the first six retries; a cap appends "+". */
		function backoffPreviewText(initialDelayMs, maxDelayMs, maxRetries) {
			const steps = [];
			const count = Math.min(Math.max(maxRetries, 1), 6);
			for (let i = 1; i <= count; i++) {
				const raw = initialDelayMs * 2 ** (i - 1);
				const capped = Math.min(raw, maxDelayMs);
				steps.push(capped >= 1000 ? `${Math.round(capped / 100) / 10}s` : `${capped}ms`);
			}
			const text = steps.join(" → ");
			if (maxRetries > 6 && maxDelayMs <= initialDelayMs * 2 ** 5) return `${text}+`;
			return maxRetries > count ? `${text} …` : text;
		}

		/** Parse a non-negative integer field text; undefined when blank or invalid. */
		function parseCountText(text) {
			const cleaned = text.trim();
			if (cleaned === "") return { blank: true };
			const parsed = Number(cleaned);
			if (!Number.isSafeInteger(parsed) || parsed < 0) return { invalid: true };
			return { value: parsed };
		}

		/** Parse a positive integer delay; undefined when blank (defaults apply). */
		function parseDelayText(text, fallback) {
			const cleaned = text.trim();
			if (cleaned === "") return { value: fallback };
			const parsed = Number(cleaned);
			if (!Number.isSafeInteger(parsed) || parsed <= 0) return { invalid: true };
			return { value: parsed };
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
		const ghostButtonStyle = { background: "transparent", color: "var(--dsw-alias-label-primary)", border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer" };
		const failureStyle = { color: "var(--dsw-alias-state-error-primary)", fontSize: 12, lineHeight: 1.5, whiteSpace: "pre-wrap" };
		const outcomeStyle = { color: "var(--dsw-alias-state-success-primary)", fontSize: 12 };
		const checkboxStyle = { accentColor: "var(--dsw-alias-brand-primary)" };
		const checkboxLabelStyle = { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, lineHeight: "18px", color: "var(--dsw-alias-label-primary)" };
		const noticeStyle = { border: "1px solid var(--dsw-alias-state-warn-primary)", borderRadius: 12, padding: "10px 14px", color: "var(--dsw-alias-state-warn-label)", fontSize: 13 };
		const rowStyle = { display: "flex", flexDirection: "row", alignItems: "flex-start", gap: 24, flexWrap: "wrap" };
		const modelRowStyle = { display: "flex", flexDirection: "column", gap: 6, border: "1px solid var(--dsw-alias-border-l1)", borderRadius: 8, padding: "10px 12px" };
		const modelRowHeadStyle = { display: "flex", flexDirection: "row", alignItems: "center", gap: 16, flexWrap: "wrap" };
		const modelNameStyle = { fontSize: 13, fontWeight: 600, minWidth: 140 };

		/**
		* The per-provider policy card: one controlled form whose Save writes every
		* managed leaf under `llm-pi-ai.providers.<id>` as path-addressed ops in a
		* single settings.mutate, leaving every field it does not own untouched.
		* @param props - { providerId, namespace, api, schema, t, readOnly, onDirtyChange, onRefresh }.
		*/
		function ProviderCard(props) {
			const { providerId, namespace, api, schema, t, readOnly, onDirtyChange, onRefresh } = props;
			const userProvider = schema.getPath(namespace.user, ["providers", providerId]) ?? {};
			const fallbackProvider = schema.getPath(namespace.value, ["providers", providerId]) ?? userProvider;
			const [expectedRevision] = react.useState(() => namespace.revision);
			const userPolicy = userProvider.retryPolicy ?? {};
			const formPolicy = userProvider.retryPolicy ?? fallbackProvider.retryPolicy ?? {};
			const [reasoning, setReasoning] = react.useState(() => stringAt(userProvider, "reasoning") ?? stringAt(fallbackProvider, "reasoning") ?? "");
			const [retryText, setRetryText] = react.useState(() => typeof formPolicy.maxRetries === "number" ? String(formPolicy.maxRetries) : "");
			const [codes, setCodes] = react.useState(() => new Set(Array.isArray(formPolicy.retryableCodes) && formPolicy.retryableCodes.length > 0 ? formPolicy.retryableCodes.filter((code) => RETRYABLE_CODES.includes(code)) : RETRYABLE_CODES.slice()));
			const [initialText, setInitialText] = react.useState(() => String(formPolicy.backoff?.initialDelayMs ?? DEFAULT_BACKOFF.initialDelayMs));
			const [maxDelayText, setMaxDelayText] = react.useState(() => String(formPolicy.backoff?.maxDelayMs ?? DEFAULT_BACKOFF.maxDelayMs));
			const [developerRole, setDeveloperRole] = react.useState(() => compatModeOf(userProvider, fallbackProvider));
			const [models, setModels] = react.useState(() => {
				const source = Array.isArray(userProvider.models) && userProvider.models.length > 0 ? userProvider.models : Array.isArray(fallbackProvider.models) ? fallbackProvider.models : [];
				return source.map((model) => ({ ...model }));
			});
			const modelsTouched = react.useRef(false);
			const [busy, setBusy] = react.useState(false);
			const [failure, setFailure] = react.useState(void 0);
			const [outcome, setOutcome] = react.useState(void 0);
			const disabled = readOnly || busy;
			const markDirty = () => {
				setFailure(void 0);
				setOutcome(void 0);
				onDirtyChange(providerId, true);
			};
			const preview = backoffPreviewText(parseDelayText(initialText, DEFAULT_BACKOFF.initialDelayMs).value ?? DEFAULT_BACKOFF.initialDelayMs, parseDelayText(maxDelayText, DEFAULT_BACKOFF.maxDelayMs).value ?? DEFAULT_BACKOFF.maxDelayMs, parseCountText(retryText).value ?? 0);
			/**
			* The thinking switch: on writes the full level mapping, off writes
			* `false`, inherit removes the field (an absent key in the next models
			* array is what "removed" means server-side).
			*/
			const setThinkingMode = (index, mode) => {
				markDirty();
				modelsTouched.current = true;
				setModels((current) => current.map((model, i) => {
					if (i !== index) return model;
					if (mode === "disabled") return { ...model, reasoningEfforts: false };
					if (mode === "inherit") {
						const copy = { ...model };
						delete copy.reasoningEfforts;
						return copy;
					}
					return { ...model, reasoningEfforts: { ...DEFAULT_REASONING_EFFORTS } };
				}));
			};
			/** Toggle one declared level; dropping the last non-`off` level turns thinking off. */
			const toggleReasoningLevel = (index, level) => {
				markDirty();
				modelsTouched.current = true;
				setModels((current) => current.map((model, i) => {
					if (i !== index) return model;
					const efforts = typeof model.reasoningEfforts === "object" && model.reasoningEfforts !== null ? { ...model.reasoningEfforts } : { ...DEFAULT_REASONING_EFFORTS };
					if (level in efforts) {
						delete efforts[level];
						if (level !== "off" && Object.keys(efforts).filter((key) => key !== "off").length === 0) return { ...model, reasoningEfforts: false };
					} else efforts[level] = level === "off" ? null : level;
					return { ...model, reasoningEfforts: efforts };
				}));
			};
			/** Persist the card: leaf ops for every managed field in one mutate. */
			const save = async () => {
				const retries = parseCountText(retryText);
				if (retries.invalid) {
					setFailure(t("retryInvalid"));
					return;
				}
				if (retries.value !== void 0 && codes.size === 0) {
					setFailure(t("needOneCode"));
					return;
				}
				const initialDelay = parseDelayText(initialText, DEFAULT_BACKOFF.initialDelayMs);
				const maxDelay = parseDelayText(maxDelayText, DEFAULT_BACKOFF.maxDelayMs);
				if (initialDelay.invalid || maxDelay.invalid) {
					setFailure(t("delayInvalid"));
					return;
				}
				const base = ["providers", providerId];
				const ops = [];
				if (reasoning === "") ops.push({ op: "unset", path: [...base, "reasoning"] });
				else ops.push({ op: "set", path: [...base, "reasoning"], value: reasoning });
				if (retries.value === void 0) ops.push({ op: "unset", path: [...base, "retryPolicy"] });
				else ops.push({ op: "set", path: [...base, "retryPolicy"], value: {
					...userPolicy,
					mode: "normal",
					maxRetries: retries.value,
					retryableCodes: RETRYABLE_CODES.filter((code) => codes.has(code)),
					backoff: { ...userPolicy.backoff, initialDelayMs: initialDelay.value, maxDelayMs: maxDelay.value }
				} });
				if (developerRole === "auto") {
					const existingCompat = typeof userProvider.compat === "object" && userProvider.compat !== null ? { ...userProvider.compat } : {};
					if ("supportsDeveloperRole" in existingCompat) {
						delete existingCompat.supportsDeveloperRole;
						if (Object.keys(existingCompat).length === 0) ops.push({ op: "unset", path: [...base, "compat"] });
						else ops.push({ op: "set", path: [...base, "compat"], value: existingCompat });
					}
				} else ops.push({ op: "set", path: [...base, "compat"], value: {
					...(typeof userProvider.compat === "object" && userProvider.compat !== null ? userProvider.compat : {}),
					supportsDeveloperRole: developerRole === "enabled"
				} });
				if (modelsTouched.current) {
					const nextModels = models.map((model) => {
						const copy = { ...model };
						if (copy.reasoningEfforts === void 0) delete copy.reasoningEfforts;
						return copy;
					});
					ops.push({ op: "set", path: [...base, "models"], value: nextModels });
				}
				setBusy(true);
				setFailure(void 0);
				try {
					const response = await api.settings.mutate({ ns: SETTINGS_NS, ops, expectedRevision });
					if (!response.result.ok) {
						setFailure(response.result.error.message);
						return;
					}
					modelsTouched.current = false;
					onDirtyChange(providerId, false);
					setOutcome("saved");
					onRefresh();
				} catch (error) {
					setFailure(messageOf(error));
				} finally {
					setBusy(false);
				}
			};
			const reset = () => onRefresh();
			return (0, react_jsx_runtime.jsxs)("div", { style: cardStyle, children: [
				(0, react_jsx_runtime.jsxs)("div", { style: { display: "flex", flexDirection: "row", alignItems: "center", gap: 10 }, children: [
					(0, react_jsx_runtime.jsx)("span", { style: cardTitleStyle, children: stringAt(userProvider, "displayName") ?? stringAt(fallbackProvider, "displayName") ?? providerId }),
					failure === void 0 && outcome === "saved" ? (0, react_jsx_runtime.jsx)("span", { style: outcomeStyle, children: t("savedAt") }) : null
				] }),
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
					(0, react_jsx_runtime.jsx)("span", { style: fieldLabelStyle, children: t("retryCount") }),
					(0, react_jsx_runtime.jsx)("input", { style: inputStyle, type: "number", min: 0, step: 1, value: retryText, placeholder: "5", disabled, onChange: (event) => {
						markDirty();
						setRetryText(event.target.value);
					} }),
					(0, react_jsx_runtime.jsx)("span", { style: fieldHintStyle, children: t("retryCountHint") })
				] }),
				(0, react_jsx_runtime.jsxs)("div", { style: fieldStyle, children: [
					(0, react_jsx_runtime.jsx)("span", { style: fieldLabelStyle, children: t("retryableCodes") }),
					(0, react_jsx_runtime.jsx)("div", { style: { display: "flex", flexWrap: "wrap", gap: "4px 14px" }, children: RETRYABLE_CODES.map((code) => (0, react_jsx_runtime.jsxs)("label", { style: checkboxLabelStyle, children: [
						(0, react_jsx_runtime.jsx)("input", { type: "checkbox", style: checkboxStyle, checked: codes.has(code), disabled, onChange: () => {
							markDirty();
							setCodes((current) => {
								const next = new Set(current);
								if (next.has(code)) next.delete(code);
								else next.add(code);
								return next;
							});
						} }),
						(0, react_jsx_runtime.jsx)("span", { children: code })
					] }, code)) }),
					(0, react_jsx_runtime.jsx)("span", { style: fieldHintStyle, children: t("quotaHint") })
				] }),
				(0, react_jsx_runtime.jsxs)("div", { style: rowStyle, children: [
					(0, react_jsx_runtime.jsxs)("div", { style: fieldStyle, children: [
						(0, react_jsx_runtime.jsx)("span", { style: fieldLabelStyle, children: t("backoffInitial") }),
						(0, react_jsx_runtime.jsx)("input", { style: inputStyle, type: "number", min: 1, step: 1, value: initialText, disabled, onChange: (event) => {
							markDirty();
							setInitialText(event.target.value);
						} })
					] }),
					(0, react_jsx_runtime.jsxs)("div", { style: fieldStyle, children: [
						(0, react_jsx_runtime.jsx)("span", { style: fieldLabelStyle, children: t("backoffMax") }),
						(0, react_jsx_runtime.jsx)("input", { style: inputStyle, type: "number", min: 1, step: 1, value: maxDelayText, disabled, onChange: (event) => {
							markDirty();
							setMaxDelayText(event.target.value);
						} })
					] }),
					(0, react_jsx_runtime.jsxs)("div", { style: fieldStyle, children: [
						(0, react_jsx_runtime.jsx)("span", { style: fieldLabelStyle, children: t("backoffPreview") }),
						(0, react_jsx_runtime.jsx)("span", { style: fieldHintStyle, children: preview })
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
					(0, react_jsx_runtime.jsx)("span", { style: fieldLabelStyle, children: t("modelsTitle") }),
					models.length === 0 ? (0, react_jsx_runtime.jsx)("span", { style: fieldHintStyle, children: t("modelsEmpty") }) : (0, react_jsx_runtime.jsx)("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: models.map((model, index) => (0, react_jsx_runtime.jsxs)("div", { style: modelRowStyle, children: [
						(0, react_jsx_runtime.jsxs)("div", { style: modelRowHeadStyle, children: [
							(0, react_jsx_runtime.jsx)("span", { style: modelNameStyle, children: model.name ?? model.id }),
							(0, react_jsx_runtime.jsxs)("label", { style: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 }, children: [
								(0, react_jsx_runtime.jsx)("span", { children: t("thinkingMode") }),
								(0, react_jsx_runtime.jsxs)("select", { style: selectStyle, value: thinkingModeOf(model.reasoningEfforts), disabled, onChange: (event) => {
									setThinkingMode(index, event.target.value);
								}, children: [
									(0, react_jsx_runtime.jsx)("option", { value: "inherit", children: t("thinkingInherited") }),
									(0, react_jsx_runtime.jsx)("option", { value: "enabled", children: t("thinkingEnabled") }),
									(0, react_jsx_runtime.jsx)("option", { value: "disabled", children: t("thinkingDisabled") })
								] })
							] })
						] }),
						thinkingModeOf(model.reasoningEfforts) === "enabled" ? (0, react_jsx_runtime.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: 4 }, children: [
							(0, react_jsx_runtime.jsx)("span", { style: fieldLabelStyle, children: t("reasoningLevels") }),
							(0, react_jsx_runtime.jsx)("div", { style: { display: "flex", flexWrap: "wrap", gap: "4px 14px" }, children: THINKING_LEVELS.map((level) => (0, react_jsx_runtime.jsxs)("label", { style: checkboxLabelStyle, children: [
								(0, react_jsx_runtime.jsx)("input", { type: "checkbox", style: checkboxStyle, checked: typeof model.reasoningEfforts === "object" && model.reasoningEfforts !== null && level in model.reasoningEfforts, disabled, onChange: () => {
									toggleReasoningLevel(index, level);
								} }),
								(0, react_jsx_runtime.jsx)("span", { children: level })
							] }, level)) })
						] }) : null
					] }, `${model.id}:${index}`)) })
				] }),
				failure !== void 0 ? (0, react_jsx_runtime.jsx)("div", { style: failureStyle, children: failure }) : null,
				(0, react_jsx_runtime.jsxs)("div", { style: { display: "flex", flexDirection: "row", gap: 10 }, children: [
					(0, react_jsx_runtime.jsx)("button", { type: "button", style: primaryButtonStyle, disabled, onClick: () => {
						void save();
					}, children: t("save") }),
					(0, react_jsx_runtime.jsx)("button", { type: "button", style: ghostButtonStyle, disabled: readOnly, onClick: reset, children: t("reset") })
				] })
			] });
		}

		/**
		* The global retry card: writes one retry policy to every listed provider
		* in a single mutate, keeping each provider's own retryableCodes when it
		* already declares them.
		* @param props - { providerIds, namespace, api, schema, t, readOnly, onRefresh }.
		*/
		function GlobalRetryCard(props) {
			const { providerIds, namespace, api, schema, t, readOnly, onRefresh } = props;
			const [expectedRevision] = react.useState(() => namespace.revision);
			const [maxText, setMaxText] = react.useState("10");
			const [initialText, setInitialText] = react.useState(String(DEFAULT_BACKOFF.initialDelayMs));
			const [maxDelayText, setMaxDelayText] = react.useState(String(DEFAULT_BACKOFF.maxDelayMs));
			const [busy, setBusy] = react.useState(false);
			const [failure, setFailure] = react.useState(void 0);
			const [applied, setApplied] = react.useState(void 0);
			const disabled = readOnly || busy || providerIds.length === 0;
			const preview = backoffPreviewText(parseDelayText(initialText, DEFAULT_BACKOFF.initialDelayMs).value ?? DEFAULT_BACKOFF.initialDelayMs, parseDelayText(maxDelayText, DEFAULT_BACKOFF.maxDelayMs).value ?? DEFAULT_BACKOFF.maxDelayMs, parseCountText(maxText).value ?? 0);
			const apply = async () => {
				const retries = parseCountText(maxText);
				if (retries.invalid || retries.value === void 0) {
					setFailure(t("retryInvalid"));
					return;
				}
				const initialDelay = parseDelayText(initialText, DEFAULT_BACKOFF.initialDelayMs);
				const maxDelay = parseDelayText(maxDelayText, DEFAULT_BACKOFF.maxDelayMs);
				if (initialDelay.invalid || maxDelay.invalid) {
					setFailure(t("delayInvalid"));
					return;
				}
				const ops = providerIds.map((providerId) => {
					const existing = schema.getPath(namespace.user, ["providers", providerId, "retryPolicy"]) ?? {};
					const codes = Array.isArray(existing.retryableCodes) && existing.retryableCodes.length > 0 ? existing.retryableCodes : RETRYABLE_CODES.slice();
					return { op: "set", path: ["providers", providerId, "retryPolicy"], value: {
						...existing,
						mode: "normal",
						maxRetries: retries.value,
						retryableCodes: codes,
						backoff: { ...existing.backoff, initialDelayMs: initialDelay.value, maxDelayMs: maxDelay.value }
					} };
				});
				setBusy(true);
				setFailure(void 0);
				try {
					const response = await api.settings.mutate({ ns: SETTINGS_NS, ops, expectedRevision });
					if (!response.result.ok) {
						setFailure(response.result.error.message);
						return;
					}
					setApplied(providerIds.length);
					onRefresh();
				} catch (error) {
					setFailure(messageOf(error));
				} finally {
					setBusy(false);
				}
			};
			return (0, react_jsx_runtime.jsxs)("div", { style: cardStyle, children: [
				(0, react_jsx_runtime.jsx)("span", { style: cardTitleStyle, children: t("globalRetryTitle") }),
				(0, react_jsx_runtime.jsx)("span", { style: fieldHintStyle, children: t("globalRetryIntro") }),
				(0, react_jsx_runtime.jsxs)("div", { style: rowStyle, children: [
					(0, react_jsx_runtime.jsxs)("div", { style: fieldStyle, children: [
						(0, react_jsx_runtime.jsx)("span", { style: fieldLabelStyle, children: t("retryCount") }),
						(0, react_jsx_runtime.jsx)("input", { style: inputStyle, type: "number", min: 0, step: 1, value: maxText, disabled, onChange: (event) => {
							setFailure(void 0);
							setApplied(void 0);
							setMaxText(event.target.value);
						} })
					] }),
					(0, react_jsx_runtime.jsxs)("div", { style: fieldStyle, children: [
						(0, react_jsx_runtime.jsx)("span", { style: fieldLabelStyle, children: t("backoffInitial") }),
						(0, react_jsx_runtime.jsx)("input", { style: inputStyle, type: "number", min: 1, step: 1, value: initialText, disabled, onChange: (event) => {
							setFailure(void 0);
							setApplied(void 0);
							setInitialText(event.target.value);
						} })
					] }),
					(0, react_jsx_runtime.jsxs)("div", { style: fieldStyle, children: [
						(0, react_jsx_runtime.jsx)("span", { style: fieldLabelStyle, children: t("backoffMax") }),
						(0, react_jsx_runtime.jsx)("input", { style: inputStyle, type: "number", min: 1, step: 1, value: maxDelayText, disabled, onChange: (event) => {
							setFailure(void 0);
							setApplied(void 0);
							setMaxDelayText(event.target.value);
						} })
					] }),
					(0, react_jsx_runtime.jsxs)("div", { style: fieldStyle, children: [
						(0, react_jsx_runtime.jsx)("span", { style: fieldLabelStyle, children: t("backoffPreview") }),
						(0, react_jsx_runtime.jsx)("span", { style: fieldHintStyle, children: preview })
					] })
				] }),
				failure !== void 0 ? (0, react_jsx_runtime.jsx)("div", { style: failureStyle, children: failure }) : null,
				applied !== void 0 ? (0, react_jsx_runtime.jsx)("span", { style: outcomeStyle, children: t("appliedCount").replace("{count}", String(applied)) }) : null,
				(0, react_jsx_runtime.jsx)("button", { type: "button", style: primaryButtonStyle, disabled, onClick: () => {
					void apply();
				}, children: t("applyRetryToAll") })
			] });
		}

		/**
		* The Provider Policy settings section: loads the llm-pi-ai namespace from
		* the shared describe mirror, offers one card per provider plus the global
		* retry card, and reloads on pushed invalidations unless a card is dirty.
		* @param props - { api, schema, describeFace, t, subscribeExternal }.
		*/
		function ProviderPolicySection(props) {
			const { api, schema, describeFace, t, subscribeExternal } = props;
			const [snapshot, setSnapshot] = react.useState({ status: "idle", error: void 0, writable: false, namespace: void 0 });
			const [selected, setSelected] = react.useState(void 0);
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
				const userProviders = schema.getPath(namespace.user, ["providers"]) ?? {};
				const resolvedProviders = schema.getPath(namespace.value, ["providers"]) ?? {};
				providerIds = [...new Set([...Object.keys(userProviders), ...Object.keys(resolvedProviders)])].sort();
			}
			const active = providerIds.includes(selected) ? selected : providerIds[0];
			return (0, react_jsx_runtime.jsxs)("div", { style: rootStyle, children: [
				(0, react_jsx_runtime.jsx)("span", { style: titleStyle, children: t("title") }),
				(0, react_jsx_runtime.jsx)("p", { style: introStyle, children: t("intro") }),
				snapshot.status === "loading" ? (0, react_jsx_runtime.jsx)("span", { style: fieldHintStyle, children: "…" }) : null,
				snapshot.status === "error" ? (0, react_jsx_runtime.jsxs)("div", { style: failureStyle, children: [
					`${t("loadFailed")} `,
					snapshot.error
				] }) : null,
				snapshot.status === "ready" && namespace === void 0 ? (0, react_jsx_runtime.jsx)("div", { style: noticeStyle, children: t("namespaceMissing") }) : null,
				snapshot.status === "ready" && namespace !== void 0 && !snapshot.writable ? (0, react_jsx_runtime.jsx)("div", { style: noticeStyle, children: t("readOnly") }) : null,
				snapshot.status === "ready" && namespace !== void 0 && providerIds.length === 0 ? (0, react_jsx_runtime.jsx)("div", { style: noticeStyle, children: t("noProviders") }) : null,
				snapshot.status === "ready" && namespace !== void 0 && providerIds.length > 0 ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					(0, react_jsx_runtime.jsxs)("div", { style: fieldStyle, children: [
						(0, react_jsx_runtime.jsx)("span", { style: fieldLabelStyle, children: t("provider") }),
						(0, react_jsx_runtime.jsxs)("select", { style: selectStyle, value: active, onChange: (event) => {
							setSelected(event.target.value);
						}, children: providerIds.map((providerId) => {
							const displayName = schema.getPath(namespace.user, ["providers", providerId, "displayName"]) ?? schema.getPath(namespace.value, ["providers", providerId, "displayName"]) ?? providerId;
							return (0, react_jsx_runtime.jsx)("option", { value: providerId, children: displayName }, providerId);
						}) })
					] }),
					active !== void 0 ? (0, react_jsx_runtime.jsx)(ProviderCard, { key: `${active}:${namespace.revision ?? 0}`, providerId: active, namespace, api, schema, t, readOnly: !snapshot.writable, onDirtyChange, onRefresh }) : null,
					(0, react_jsx_runtime.jsx)(GlobalRetryCard, { providerIds, namespace, api, schema, t, readOnly: !snapshot.writable, onRefresh })
				] }) : null
			] });
		}

		/**
		* Hide the Cordis service identity behind bound schema callbacks.
		* @param service - settings-owned schema service available in the apply context.
		* @returns callbacks that cannot expose the service context to React components.
		*/
		function createSettingsSchemaOperations(service) {
			return {
				rehydrate: (serialized) => service.rehydrate(serialized),
				validate: (schema2, draft) => service.validate(schema2, draft),
				nodeAtPath: (root, path) => service.nodeAtPath(root, path),
				getPath: (value, path) => service.getPath(value, path),
				hasPath: (value, path) => service.hasPath(value, path),
				setPath: (root, path, value) => service.setPath(root, path, value),
				deletePath: (root, path) => service.deletePath(root, path)
			};
		}

		/**
		* Required services (cordis fiber inject). The target slot is declared by
		* ui-settings' apply, whose activation order relative to this one is NOT
		* constrained; registration depends on each slot through `slots.inject()`.
		*/
		const inject = ["slots", "locale", "connection", "remote", "settingsScope", "settingsSchema"];
		/**
		* Register the Provider Policy section once the `settings.section`
		* declaration is on the ledger and keep it fresh on pushed settings
		* invalidations (unless a card holds unsaved edits).
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "ui-provider-policy: copy dictionaries");
			const connection = ctx.get("connection");
			const schema = createSettingsSchemaOperations(ctx.settingsSchema);
			const describeFace = ctx.settingsScope.describe();
			const t = ctx.locale.bind(NS);
			let notifyExternalUpdate = () => {};
			const injected = () => ({
				api: connection.api,
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
