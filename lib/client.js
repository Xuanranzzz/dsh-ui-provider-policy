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
			intro: "Default reasoning, retry count, and developer-role compat for OpenAI-compatible (pi-ai) providers — fields the stock Models page exposes no controls for.",
			globalTitle: "Global provider policy",
			globalIntro: "Applied to every OpenAI-compatible (pi-ai) provider and all of their models: default reasoning, retry count, and developer-role compat. All models get thinking enabled; the per-conversation level is chosen in the chat dialog's model dropdown.",
			noProviders: "No pi-ai providers are configured yet.",
			readOnly: "Settings are read-only in this browser.",
			namespaceMissing: "The llm-pi-ai settings namespace is not available.",
			loadFailed: "Failed to load settings.",
			defaultReasoning: "Default reasoning",
			defaultReasoningUnset: "Provider default",
			retryCount: "Retry count",
			retryInvalid: "Retry count must be a non-negative integer.",
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
			intro: "为 OpenAI 兼容(pi-ai)供应商配置默认推理强度、重试次数与 Developer 角色兼容 —— 原生“模型”页不提供这些字段的控件。",
			globalTitle: "全局供应商策略",
			globalIntro: "应用到所有 OpenAI 兼容(pi-ai)供应商及其全部模型:默认推理强度、重试次数与 Developer 角色兼容。所有模型默认开启思考,逐次选择在对话的模型下拉框里进行。",
			noProviders: "尚未配置任何 pi-ai 供应商。",
			readOnly: "此浏览器对设置为只读。",
			namespaceMissing: "llm-pi-ai 设置命名空间不可用。",
			loadFailed: "加载设置失败。",
			defaultReasoning: "默认推理强度",
			defaultReasoningUnset: "供应商默认",
			retryCount: "重试次数",
			retryInvalid: "重试次数必须是非负整数。",
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

		/**
		* The single global policy card: one set of default reasoning, retry count,
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
			const [maxText, setMaxText] = react.useState(() => String(typeof firstFallback.retryPolicy?.maxRetries === "number" ? firstFallback.retryPolicy.maxRetries : 10));
			const [busy, setBusy] = react.useState(false);
			const [failure, setFailure] = react.useState(void 0);
			const [outcome, setOutcome] = react.useState(void 0);
			const disabled = readOnly || busy || providerIds.length === 0;
			const markDirty = () => {
				setFailure(void 0);
				setOutcome(void 0);
				onDirtyChange("global", true);
			};
			/** Apply the global policy to every pi-ai provider and turn thinking ON for
			* each of their models (full level map) so the chat's reasoning dropdown is
			* always present; the per-conversation level is chosen in the chat. Each
			* provider keeps its own retryable codes and backoff. */
			const apply = async () => {
				const retries = parseCountText(maxText);
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
					if (typeof policy.backoff !== "object" || policy.backoff === null) policy.backoff = { ...DEFAULT_BACKOFF };
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
					(0, react_jsx_runtime.jsx)("span", { style: fieldLabelStyle, children: t("retryCount") }),
					(0, react_jsx_runtime.jsx)("input", { style: inputStyle, type: "number", min: 0, step: 1, value: maxText, disabled, onChange: (event) => {
						markDirty();
						setMaxText(event.target.value);
					} })
				] }),
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
					`${t("loadFailed")} `,
					snapshot.error
				] }) : null,
				snapshot.status === "ready" && namespace === void 0 ? (0, react_jsx_runtime.jsx)("div", { style: noticeStyle, children: t("namespaceMissing") }) : null,
				snapshot.status === "ready" && namespace !== void 0 && !snapshot.writable ? (0, react_jsx_runtime.jsx)("div", { style: noticeStyle, children: t("readOnly") }) : null,
				snapshot.status === "ready" && namespace !== void 0 && providerIds.length === 0 ? (0, react_jsx_runtime.jsx)("div", { style: noticeStyle, children: t("noProviders") }) : null,
				snapshot.status === "ready" && namespace !== void 0 && providerIds.length > 0 ? (0, react_jsx_runtime.jsx)(GlobalPolicyCard, { key: `global:${namespace.revision ?? 0}`, providerIds, namespace, mutate, schema, t, readOnly: !snapshot.writable, onDirtyChange, onRefresh }) : null
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
		* constrained; registration depends on each slot through `slots.inject()`.
		*/
		const inject = ["slots", "locale", "remote", "remote.settings", "settingsScope", "settingsSchema"];
		/**
		* Register the Provider Policy section once the `settings.section`
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
