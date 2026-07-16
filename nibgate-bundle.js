"use strict";
var Nibgate = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/browser/json.js
  function jsonReplacer(_key, value) {
    if (typeof value === "bigint") return value.toString();
    return value;
  }
  function stringifyJson(value) {
    return JSON.stringify(value, jsonReplacer);
  }
  var init_json = __esm({
    "src/browser/json.js"() {
      "use strict";
    }
  });

  // src/browser/gateway.js
  var gateway_exports = {};
  __export(gateway_exports, {
    createCircleGatewayBrowserAdapter: () => createCircleGatewayBrowserAdapter
  });
  function encodeBase64(value) {
    const text = typeof value === "string" ? value : stringifyJson(value);
    if (typeof Buffer !== "undefined") return Buffer.from(text).toString("base64");
    return btoa(unescape(encodeURIComponent(text)));
  }
  function decodeBase64(value) {
    if (typeof Buffer !== "undefined") return Buffer.from(value, "base64").toString("utf8");
    return decodeURIComponent(escape(atob(value)));
  }
  async function createCircleGatewayBrowserAdapter(options = {}) {
    const signer = options.signer || await options.getSigner?.();
    if (!signer?.address || typeof signer.signTypedData !== "function") {
      throw new Error("Circle Gateway browser adapter requires an EVM signer with address and signTypedData.");
    }
    const circleClientModule = options.clientModule || (options.clientModuleUrl ? await runtimeImport(options.clientModuleUrl) : await runtimeImport("@circle-fin/x402-batching/client"));
    const { BatchEvmScheme } = circleClientModule;
    const scheme = new BatchEvmScheme(signer);
    const network = options.network || options.chainId && `eip155:${options.chainId}` || "eip155:5042002";
    function parsePaymentRequired(input) {
      if (input && typeof input === "object") return input;
      if (!input || typeof input !== "string") throw new Error("Missing PAYMENT-REQUIRED header.");
      return JSON.parse(decodeBase64(input));
    }
    function selectGatewayRequirement(paymentRequired) {
      const accepts = Array.isArray(paymentRequired?.accepts) ? paymentRequired.accepts : [];
      const selected = accepts.find((option) => {
        const extra = option.extra || {};
        return option.network === network && extra.name === "GatewayWalletBatched" && extra.version === "1" && typeof extra.verifyingContract === "string";
      }) || accepts.find((option) => {
        const extra = option.extra || {};
        return extra.name === "GatewayWalletBatched" && extra.version === "1" && typeof extra.verifyingContract === "string";
      });
      if (!selected) {
        const networks = accepts.map((option) => option.network).filter(Boolean).join(", ") || "none";
        const hasGatewayExtra = accepts.some((option) => {
          const extra = option.extra || {};
          return extra.name === "GatewayWalletBatched" && extra.version === "1" && typeof extra.verifyingContract === "string";
        });
        throw new Error(
          hasGatewayExtra ? `No Circle Gateway batching payment option found for ${network}. Server returned networks: ${networks}.` : `The payment challenge is not a Circle Gateway batching challenge. Configure the creator access route with createCircleGatewayServer(...) or createNibgateServer({ paymentMode: 'circle-gateway', network: '${network}' }).`
        );
      }
      return selected;
    }
    return {
      signer,
      network,
      async pay({ paymentRequiredHeader, challenge }) {
        const paymentRequired = parsePaymentRequired(paymentRequiredHeader || challenge);
        const accepted = selectGatewayRequirement(paymentRequired);
        const x402Version = paymentRequired.x402Version ?? 2;
        const paymentPayload = await scheme.createPaymentPayload(x402Version, accepted);
        const paymentSignature = encodeBase64({
          ...paymentPayload,
          resource: paymentRequired.resource,
          accepted
        });
        return {
          paymentSignature,
          signature: paymentSignature,
          metadata: {
            paymentProvider: "circle-gateway",
            network: accepted.network,
            payer: signer.address,
            recipient: accepted.payTo || accepted.recipient,
            amount: accepted.amount,
            currency: accepted.asset
          }
        };
      }
    };
  }
  var runtimeImport;
  var init_gateway = __esm({
    "src/browser/gateway.js"() {
      "use strict";
      init_json();
      runtimeImport = new Function("specifier", "return import(specifier)");
    }
  });

  // src/browser/index.js
  var index_exports = {};
  __export(index_exports, {
    ACCESS_MODES: () => ACCESS_MODES,
    CONTENT_TYPES: () => CONTENT_TYPES,
    NIBGATE_CONTENT_HASH_NAMESPACE: () => NIBGATE_CONTENT_HASH_NAMESPACE,
    NIBGATE_CONTENT_SETTING_FIELDS: () => NIBGATE_CONTENT_SETTING_FIELDS,
    NIBGATE_REPUTATION_ABI: () => NIBGATE_REPUTATION_ABI,
    NIBGATE_REPUTATION_CHAIN_ID: () => NIBGATE_REPUTATION_CHAIN_ID,
    NIBGATE_REPUTATION_CHAIN_NAME: () => NIBGATE_REPUTATION_CHAIN_NAME,
    NIBGATE_REPUTATION_CONTRACT: () => NIBGATE_REPUTATION_CONTRACT,
    NIBGATE_REPUTATION_RPC_URL: () => NIBGATE_REPUTATION_RPC_URL,
    PAYMENT_RAILS: () => PAYMENT_RAILS,
    UNLOCK_MODES: () => UNLOCK_MODES,
    checkResourceAccess: () => checkResourceAccess,
    contentRatingHash: () => contentRatingHash,
    createCircleGatewayBrowserAdapter: () => createCircleGatewayBrowserAdapter2,
    createEvmGatewayUnlock: () => createEvmGatewayUnlock,
    createGate: () => createGate,
    createNibgate: () => createNibgate,
    createNibgateContentSettings: () => createNibgateContentSettings,
    createOnchainRating: () => createOnchainRating,
    createTransferCheckout: () => createTransferCheckout,
    createWalletCheckout: () => createWalletCheckout,
    mountRatingUI: () => mountRatingUI,
    nibgate: () => nibgate,
    normalizeAccessPolicy: () => normalizeAccessPolicy,
    normalizeContentType: () => normalizeContentType,
    normalizePaymentRail: () => normalizePaymentRail,
    normalizeResource: () => normalizeResource,
    normalizeUnlockPolicy: () => normalizeUnlockPolicy,
    payAndUnlockResource: () => payAndUnlockResource,
    payWithPaymentSignature: () => payWithPaymentSignature,
    payWithTransfer: () => payWithTransfer,
    rateContentOnchain: () => rateContentOnchain,
    rateResource: () => rateResource,
    reviewTextHash: () => reviewTextHash,
    settingsToAccessPolicy: () => settingsToAccessPolicy,
    settingsToUnlockPolicy: () => settingsToUnlockPolicy,
    setupResourcePage: () => setupResourcePage,
    trackResourcePage: () => trackResourcePage,
    validateResourceMetadata: () => validateResourceMetadata
  });

  // src/core/payment.js
  var PAYMENT_RAILS = ["gateway", "transfer"];
  function normalizePaymentRail(value, fallback = "gateway") {
    const rail = String(value || "").trim().toLowerCase().replace(/[-\s]+/g, "_");
    if (rail === "circle_gateway" || rail === "x402") return "gateway";
    if (rail === "direct_transfer" || rail === "wallet_transfer") return "transfer";
    return PAYMENT_RAILS.includes(rail) ? rail : fallback;
  }

  // src/core/resource.js
  var CONTENT_TYPES = ["music", "video", "article", "image"];
  var TYPE_ALIASES = {
    audio: "music",
    song: "music",
    track: "music",
    album: "music",
    playlist: "music",
    photo: "image",
    picture: "image",
    illustration: "image",
    art: "image",
    movie: "video",
    clip: "video"
  };
  var ACCESS_MODES = ["free", "paid", "blocked"];
  var UNLOCK_MODES = ["one_time", "metered_stream", "metered_read", "time_pass", "agent_quota"];
  function normalizeContentType(value) {
    const type = String(value || "").trim().toLowerCase();
    if (CONTENT_TYPES.includes(type)) return type;
    return TYPE_ALIASES[type] || "article";
  }
  function normalizeAccessMode(value, fallback = "paid") {
    const mode = String(value || "").trim().toLowerCase();
    return ACCESS_MODES.includes(mode) ? mode : fallback;
  }
  function normalizeAccessPolicy(value = {}) {
    if (typeof value === "string") {
      const mode = normalizeAccessMode(value);
      return { humans: mode, agents: mode };
    }
    return {
      humans: normalizeAccessMode(value.humans || value.human || value.default, "paid"),
      agents: normalizeAccessMode(value.agents || value.agent || value.default, "paid")
    };
  }
  function normalizeUnlockPolicy(value = {}) {
    const input = typeof value === "string" ? { mode: value } : value || {};
    const mode = String(input.mode || input.type || "one_time").trim().toLowerCase().replace(/[-\s]+/g, "_");
    return {
      ...input,
      mode: UNLOCK_MODES.includes(mode) ? mode : "one_time"
    };
  }
  function normalizeResource(resource = {}) {
    const input = typeof resource === "string" ? { id: resource } : resource || {};
    const {
      publisher,
      publisherId,
      publisherWallet,
      publisherHandle,
      publisherName,
      publisherProfileUrl,
      publisherOrigin,
      publisherVerification,
      authorHandle,
      ...v1Input
    } = input;
    return {
      ...v1Input,
      id: String(input.id || input.contentId || input.slug || "").trim(),
      title: String(input.title || input.name || "").trim(),
      type: normalizeContentType(input.type || input.contentType),
      price: input.price ?? input.amount ?? "",
      paymentRail: normalizePaymentRail(input.paymentRail || input.paymentMode || input.rail),
      recipient: input.recipient || input.receiver || input.receiverAddress || input.payTo || input.creatorWallet || void 0,
      payTo: input.payTo || input.recipient || input.receiver || input.receiverAddress || input.creatorWallet || void 0,
      path: input.path || input.route || void 0,
      url: input.url || void 0,
      imageUrl: input.imageUrl || input.image || void 0,
      tags: input.tags || void 0,
      access: normalizeAccessPolicy(input.access),
      unlock: normalizeUnlockPolicy(input.unlock),
      ratingsEnabled: input.ratingsEnabled ?? input.enableRatings ?? input.reputation?.ratingsEnabled ?? true,
      reputation: {
        ...typeof input.reputation === "object" && input.reputation ? input.reputation : {},
        ratingsEnabled: input.ratingsEnabled ?? input.enableRatings ?? input.reputation?.ratingsEnabled ?? true
      }
    };
  }
  function hasValue(value) {
    if (Array.isArray(value)) return value.length > 0;
    return value !== void 0 && value !== null && String(value).trim() !== "";
  }
  function isPaidResource(resource = {}) {
    const access = normalizeAccessPolicy(resource.access);
    return access.humans === "paid" || access.agents === "paid" || Number.parseFloat(resource.price || resource.amount || "0") > 0;
  }
  function validateResourceMetadata(resource = {}, options = {}) {
    const normalized = normalizeResource(resource);
    const warnings = [];
    const errors = [];
    const required = options.required || ["id", "title", "url", "type"];
    const recommended = options.recommended || ["description", "imageUrl", "tags"];
    for (const field of required) {
      if (!hasValue(normalized[field])) errors.push(`Missing required content metadata: ${field}`);
    }
    for (const field of recommended) {
      if (!hasValue(normalized[field])) warnings.push(`Missing recommended discovery metadata: ${field}`);
    }
    if (!CONTENT_TYPES.includes(normalized.type)) errors.push("Content type must be one of music, video, article, or image.");
    if (normalized.url && !/^https?:\/\//i.test(String(normalized.url))) {
      warnings.push("Use an absolute canonical url for stronger discovery identity.");
    }
    if (normalized.imageUrl && !/^https?:\/\//i.test(String(normalized.imageUrl))) {
      warnings.push("Use an absolute imageUrl for thumbnails in Explore and agent discovery.");
    }
    if (isPaidResource(normalized)) {
      if (!hasValue(normalized.price)) errors.push("Paid content requires price.");
      if (!hasValue(normalized.recipient || normalized.payTo)) errors.push("Paid content requires recipient/payTo wallet.");
    }
    const score = Math.max(0, 100 - errors.length * 20 - warnings.length * 8);
    return {
      ok: errors.length === 0,
      score,
      errors,
      warnings,
      resource: normalized
    };
  }

  // src/browser/env.js
  function browserWindow() {
    return typeof window === "undefined" ? null : window;
  }

  // src/browser/events.js
  function queueEvent(eventName, payload) {
    const win = browserWindow();
    if (!win) return false;
    win.__nibgateClientQueue = win.__nibgateClientQueue || [];
    win.__nibgateClientQueue.push({ eventName, payload });
    return true;
  }
  function flushQueue() {
    const win = browserWindow();
    if (!win?.nibgateHub?.track || !Array.isArray(win.__nibgateClientQueue)) return false;
    const queue = win.__nibgateClientQueue.splice(0);
    queue.forEach((entry) => {
      win.nibgateHub.track(entry.eventName, entry.payload);
    });
    return queue.length > 0;
  }
  function startQueueFlush() {
    const win = browserWindow();
    if (!win || win.__nibgateClientFlushStarted) return;
    win.__nibgateClientFlushStarted = true;
    let attempts = 0;
    const timer = win.setInterval(() => {
      attempts += 1;
      flushQueue();
      if (win.nibgateHub?.track || attempts >= 80) {
        win.clearInterval(timer);
        win.__nibgateClientFlushStarted = false;
      }
    }, 250);
  }
  function emit(eventName, payload = {}) {
    const win = browserWindow();
    if (!win) return false;
    if (win.nibgateHub?.track) {
      win.nibgateHub.track(eventName, payload);
      flushQueue();
      return true;
    }
    queueEvent(eventName, payload);
    startQueueFlush();
    return false;
  }
  function payloadWithResource(resource, extra = {}) {
    return {
      ...extra,
      resource: normalizeResource(resource)
    };
  }

  // src/browser/storage.js
  function unlockStorageKey(resource) {
    return `nibgate:unlock:${resource.id || resource.path || resource.url || "content"}`;
  }
  function proofStorageKey(resource) {
    return `nibgate:payment-proof:${resource.id || resource.path || resource.url || "content"}`;
  }
  function markUnlocked(resource, payment = {}) {
    const win = browserWindow();
    if (!win) return false;
    try {
      win.localStorage.setItem(unlockStorageKey(resource), JSON.stringify({
        unlockedAt: (/* @__PURE__ */ new Date()).toISOString(),
        payment
      }));
      return true;
    } catch (_error) {
      return false;
    }
  }
  function storePaymentProof(resource, proof) {
    const win = browserWindow();
    if (!win || !proof) return false;
    try {
      const value = typeof proof === "string" ? proof : JSON.stringify(proof);
      win.localStorage.setItem(proofStorageKey(resource), value);
      return true;
    } catch (_error) {
      return false;
    }
  }
  function getPaymentProof(resource) {
    const win = browserWindow();
    if (!win) return "";
    try {
      return win.localStorage.getItem(proofStorageKey(resource)) || "";
    } catch (_error) {
      return "";
    }
  }
  function clearPaymentProof(resource) {
    const normalized = normalizeResource(resource);
    const win = browserWindow();
    if (!win) return false;
    try {
      win.localStorage.removeItem(proofStorageKey(normalized));
      win.localStorage.removeItem(unlockStorageKey(normalized));
      return true;
    } catch (_error) {
      return false;
    }
  }
  function hasUnlock(resource) {
    const win = browserWindow();
    if (!win) return false;
    try {
      return Boolean(win.localStorage.getItem(unlockStorageKey(resource)));
    } catch (_error) {
      return false;
    }
  }

  // src/browser/gate.js
  var defaultClient = null;
  function setDefaultClient(client) {
    defaultClient = client;
  }
  function createGate(resource, options = {}) {
    const normalized = normalizeResource(resource);
    const client = options.client || defaultClient;
    return {
      resource: normalized,
      content(extra = {}) {
        return client.content(normalized, extra);
      },
      view(extra = {}) {
        return client.view(normalized, extra);
      },
      track(eventName, payload = {}) {
        return client.track(eventName, payloadWithResource(normalized, payload));
      },
      unlockStarted(extra = {}) {
        return client.unlockStarted(normalized, extra);
      },
      unlockCompleted(payment = {}) {
        markUnlocked(normalized, payment);
        return client.unlockCompleted(normalized, payment);
      },
      paymentCompleted(payment = {}) {
        return client.paymentCompleted(normalized, payment);
      },
      isUnlocked() {
        return hasUnlock(normalized);
      },
      markUnlocked(payment = {}) {
        markUnlocked(normalized, payment);
        client.unlockCompleted(normalized, payment);
        client.paymentCompleted(normalized, payment);
        return true;
      },
      async unlock(handlerOrPayment = {}) {
        client.unlockStarted(normalized);
        const payment = typeof handlerOrPayment === "function" ? await handlerOrPayment(normalized) : handlerOrPayment;
        markUnlocked(normalized, payment || {});
        client.unlockCompleted(normalized, payment || {});
        client.paymentCompleted(normalized, payment || {});
        return { unlocked: true, resource: normalized, payment: payment || {} };
      },
      rate(rating = {}, extra = {}) {
        return client.rateResource(normalized, rating, extra);
      }
    };
  }

  // src/browser/access.js
  init_json();

  // src/browser/track.js
  function trackResourcePage(resource, options = {}) {
    const item = createGate(resource, options.gateOptions || {});
    const validation = validateResourceMetadata(item.resource, options.validation || {});
    if ((validation.warnings.length || validation.errors.length) && options.warn !== false && browserWindow()?.console?.warn) {
      browserWindow().console.warn("Nibgate content metadata needs attention", validation);
    }
    item.content({ source: options.source, metadataQuality: { score: validation.score, warnings: validation.warnings, errors: validation.errors }, ...options.content || {} });
    item.view({
      source: options.source,
      path: options.path || browserWindow()?.location?.pathname || item.resource.path,
      referrer: options.referrer ?? browserWindow()?.document?.referrer ?? "",
      ...options.view || {}
    });
    return item;
  }
  function setupResourcePage(resource, options = {}) {
    const item = trackResourcePage(resource, options);
    const win = browserWindow();
    if (!win) return item;
    const button = typeof options.button === "string" ? win.document.querySelector(options.button) : options.button;
    const statusElement = typeof options.status === "string" ? win.document.querySelector(options.status) : options.status;
    const setStatus = options.onStatus || ((message) => {
      if (statusElement) statusElement.textContent = message || "";
    });
    if (button) {
      button.addEventListener("click", async () => {
        button.disabled = true;
        try {
          await checkResourceAccess(resource, { ...options, onStatus: setStatus });
        } finally {
          button.disabled = false;
        }
      });
    }
    return item;
  }

  // src/browser/access.js
  async function checkResourceAccess(resource, options = {}) {
    const item = createGate(resource, options.gateOptions || {});
    const accessPath = options.accessPath || item.resource.accessPath || "/api/nibgate/access";
    const status = typeof options.onStatus === "function" ? options.onStatus : () => {
    };
    status(options.checkingMessage || "Checking access route...");
    item.unlockStarted({ source: options.source, paymentProvider: options.paymentProvider || "nibgate-access-route" });
    const response = await fetch(accessPath, {
      method: options.method || "GET",
      headers: {
        accept: "application/json",
        ...getPaymentProof(item.resource) ? { "x-nibgate-payment-proof": getPaymentProof(item.resource) } : {},
        ...options.headers || {}
      },
      body: options.body
    });
    const payload = await response.json().catch(() => ({}));
    if (response.status === 402) {
      item.track("payment_challenge_returned", { source: options.source, challenge: payload, resource: item.resource });
      status(options.challengeMessage || "Payment challenge returned. Continue with checkout.");
      if (typeof options.createPaymentSignature === "function" || typeof options.checkout === "function") {
        return payWithPaymentSignature(resource, {
          ...options,
          challenge: payload,
          paymentRequiredHeader: response.headers.get("PAYMENT-REQUIRED") || response.headers.get("payment-required") || ""
        });
      }
      if (options.autoPay && options.payPath) {
        const paymentResult = await payAndUnlockResource(resource, options);
        if (paymentResult.ok && options.retryAfterPay !== false) {
          return checkResourceAccess(resource, { ...options, autoPay: false });
        }
        return paymentResult;
      }
      return { ok: false, status: response.status, challenge: payload, resource: item.resource, response };
    }
    if (!response.ok) {
      status(payload.error || options.errorMessage || "Access check failed");
      return { ok: false, status: response.status, error: payload.error || "Access check failed", payload, resource: item.resource, response };
    }
    const payment = options.payment || payload.payment || null;
    if (payment) {
      item.unlockCompleted(payment);
      item.paymentCompleted(payment);
    }
    status(options.successMessage || "Access allowed and Nibgate events emitted.");
    return { ok: true, status: response.status, payload, payment, resource: item.resource, response };
  }
  async function payWithPaymentSignature(resource, options = {}) {
    const item = createGate(resource, options.gateOptions || {});
    const accessPath = options.accessPath || item.resource.accessPath || "/api/nibgate/access";
    const status = typeof options.onStatus === "function" ? options.onStatus : () => {
    };
    status(options.paymentMessage || "Waiting for wallet payment approval...");
    item.unlockStarted({ source: options.source, paymentProvider: options.paymentProvider || "wallet-gateway" });
    let paymentSignature = options.paymentSignature || "";
    let paymentMemo = options.memo || "";
    let paymentMetadata = options.payment || {};
    if (!paymentSignature) {
      const paymentRequiredHeader = options.paymentRequiredHeader || "";
      const challenge = options.challenge || null;
      const checkout = options.createPaymentSignature || options.checkout;
      const result = await checkout({
        resource: item.resource,
        challenge,
        paymentRequiredHeader,
        accessPath
      });
      paymentSignature = result?.paymentSignature || result?.signature || result?.payment || "";
      paymentMemo = result?.memo || result?.paymentMemo || "";
      paymentMetadata = result?.metadata || result?.paymentMetadata || result || {};
    }
    if (!paymentSignature) {
      const error = "Wallet did not return a payment signature.";
      item.track("payment_failed", { source: options.source, error });
      status(error);
      return { ok: false, status: 400, error, resource: item.resource };
    }
    const response = await fetch(accessPath, {
      method: options.method || "GET",
      headers: {
        accept: "application/json",
        "payment-signature": paymentSignature,
        ...paymentMemo ? { "payment-memo": paymentMemo } : {},
        ...options.headers || {}
      }
    });
    const responseText = await response.text();
    let payload = {};
    try {
      payload = responseText ? JSON.parse(responseText) : {};
    } catch (_error) {
      payload = { error: responseText || "Payment verification failed" };
    }
    if (!response.ok) {
      const detail = payload.detail || payload.reason || payload.invalidReason || payload.error || responseText || "Payment verification failed";
      const error = typeof detail === "string" ? detail : stringifyJson(detail);
      item.track("payment_failed", { source: options.source, status: response.status, error, ...paymentMetadata });
      status(options.paymentErrorMessage || error);
      return { ok: false, status: response.status, error, payload, resource: item.resource, response };
    }
    const payment = payload.payment || {
      paymentProvider: options.paymentProvider || "wallet-gateway",
      paymentId: paymentSignature,
      memo: paymentMemo,
      amount: Number(item.resource.price || 0),
      revenue: Number(item.resource.price || 0),
      currency: item.resource.currency || "USDC",
      ...paymentMetadata
    };
    storePaymentProof(item.resource, payload.unlockProof);
    item.markUnlocked(payment);
    status(options.paymentSuccessMessage || "Payment verified. Content unlocked.");
    return { ok: true, status: response.status, payload, payment, resource: item.resource, response };
  }
  async function payAndUnlockResource(resource, options = {}) {
    const item = createGate(resource, options.gateOptions || {});
    const payPath = options.payPath || item.resource.payPath || "/api/nibgate/pay";
    const status = typeof options.onStatus === "function" ? options.onStatus : () => {
    };
    status(options.paymentMessage || "Starting payment...");
    item.unlockStarted({ source: options.source, paymentProvider: options.paymentProvider || "circle-gateway" });
    const response = await fetch(payPath, {
      method: options.payMethod || "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        ...options.payHeaders || {}
      },
      body: JSON.stringify({ resource: item.resource, ...options.payPayload || {} })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) {
      item.track("payment_failed", { source: options.source, status: response.status, error: payload.error || "Payment failed", detail: payload.detail || "" });
      status(payload.detail || payload.error || options.paymentErrorMessage || "Payment failed.");
      return { ok: false, status: response.status, payload, resource: item.resource, response };
    }
    const payment = payload.payment || {
      paymentProvider: options.paymentProvider || "circle-gateway",
      paymentId: payload.paymentId || `nibgate_payment_${Date.now()}`,
      amount: Number(item.resource.price || 0),
      revenue: Number(item.resource.price || 0),
      currency: item.resource.currency || "USDC"
    };
    storePaymentProof(item.resource, payload.unlockProof);
    item.markUnlocked(payment);
    status(options.paymentSuccessMessage || "Payment verified. Content unlocked.");
    return { ok: true, status: response.status, payload, payment, resource: item.resource, response };
  }

  // src/browser/checkout.js
  function setElementText(target, message) {
    const win = browserWindow();
    if (!target || !win) return;
    const element = typeof target === "string" ? win.document.querySelector(target) : target;
    if (element) element.textContent = message || "";
  }
  function setElementDisabled(target, disabled) {
    const win = browserWindow();
    if (!target || !win) return;
    const element = typeof target === "string" ? win.document.querySelector(target) : target;
    if (element && "disabled" in element) element.disabled = Boolean(disabled);
  }
  function createWalletCheckout(resource, options = {}) {
    const normalized = normalizeResource(resource);
    const accessPath = options.accessPath || normalized.accessPath || "/api/nibgate/access";
    const button = options.button || null;
    const statusTarget = options.status || null;
    const status = typeof options.onStatus === "function" ? options.onStatus : (message) => setElementText(statusTarget, message);
    const checkout = options.checkout || options.createPaymentSignature || options.pay;
    if (typeof checkout !== "function") {
      throw new Error("createWalletCheckout requires checkout/createPaymentSignature/pay callback for the active wallet or Gateway adapter.");
    }
    async function unlock(extra = {}) {
      setElementDisabled(button, true);
      try {
        return await checkResourceAccess(normalized, {
          ...options,
          ...extra,
          accessPath,
          createPaymentSignature: checkout,
          onStatus: status
        });
      } finally {
        setElementDisabled(button, false);
      }
    }
    function mount() {
      const win = browserWindow();
      if (!win || !button) return { unlock };
      const element = typeof button === "string" ? win.document.querySelector(button) : button;
      if (element) element.addEventListener("click", () => unlock().catch((error) => status(error.message || "Checkout failed.")));
      return { unlock };
    }
    return { resource: normalized, unlock, mount };
  }

  // src/core/rating.js
  function normalizeRating(input = {}) {
    const value = typeof input === "number" ? input : input.rating ?? input.stars ?? input.ratingValue ?? input.score;
    const numeric = Number.parseFloat(value);
    const ratingValue = Number.isFinite(numeric) ? Math.max(1, Math.min(50, numeric <= 5 ? Math.round(numeric * 10) : Math.round(numeric))) : null;
    return {
      ...input,
      rating: ratingValue ? ratingValue / 10 : void 0,
      ratingValue: ratingValue || void 0
    };
  }
  function ratingMessage(resource, rating = {}, options = {}) {
    const normalized = normalizeResource(resource);
    const normalizedRating = normalizeRating(rating);
    const value = normalizedRating.ratingValue || 0;
    return [
      "Nibgate content rating",
      `site:${options.siteDomain || options.domain || normalized.siteDomain || normalized.domain || ""}`,
      `content:${normalized.externalId || normalized.id}`,
      `url:${normalized.url || options.url || ""}`,
      `rating:${value}`,
      "I confirm this rating is tied to my unlock/payment proof."
    ].join("\n");
  }

  // src/browser/evm-gateway.js
  init_json();
  async function createCircleGatewayBrowserAdapter2(options = {}) {
    const gateway = await Promise.resolve().then(() => (init_gateway(), gateway_exports));
    return gateway.createCircleGatewayBrowserAdapter(options);
  }
  function createEvmGatewayUnlock(resource, options = {}) {
    const item = createGate(resource, options.gateOptions || {});
    const win = browserWindow();
    const accessPath = options.accessPath || item.resource.accessPath || "/api/nibgate/access";
    const source = options.source || "nibgate-evm-gateway";
    const network = options.network || "eip155:5042002";
    const statusTarget = typeof options.status === "string" ? win?.document.querySelector(options.status) : options.status;
    const connectButton = typeof options.connectButton === "string" ? win?.document.querySelector(options.connectButton) : options.connectButton;
    const disconnectButton = typeof options.disconnectButton === "string" ? win?.document.querySelector(options.disconnectButton) : options.disconnectButton;
    const unlockButton = typeof options.unlockButton === "string" ? win?.document.querySelector(options.unlockButton) : options.unlockButton;
    const clearButton = typeof options.clearButton === "string" ? win?.document.querySelector(options.clearButton) : options.clearButton;
    const walletLabel = typeof options.walletLabel === "string" ? win?.document.querySelector(options.walletLabel) : options.walletLabel;
    const unlockedTarget = typeof options.unlockedTarget === "string" ? win?.document.querySelector(options.unlockedTarget) : options.unlockedTarget;
    let walletAddress = "";
    let busy = false;
    function setStatus(message) {
      if (typeof options.onStatus === "function") options.onStatus(message);
      if (statusTarget) statusTarget.textContent = message || "";
    }
    function shortAddress(address) {
      return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";
    }
    function provider() {
      return win?.ethereum || options.provider || null;
    }
    function setBusy(value) {
      busy = Boolean(value);
      [connectButton, disconnectButton, unlockButton, clearButton].forEach((button) => {
        if (button && "disabled" in button) {
          button.disabled = busy || button === connectButton && !provider() || button === disconnectButton && !walletAddress;
        }
      });
    }
    function renderWallet() {
      const hasProvider = Boolean(provider());
      if (walletLabel) walletLabel.textContent = walletAddress ? shortAddress(walletAddress) : hasProvider ? "Ready to connect" : "No wallet detected";
      if (connectButton) connectButton.textContent = walletAddress ? "Connected" : "Connect wallet";
      if (disconnectButton) disconnectButton.textContent = "Disconnect";
      if (connectButton && "disabled" in connectButton) connectButton.disabled = busy || !hasProvider;
      if (disconnectButton && "disabled" in disconnectButton) disconnectButton.disabled = busy || !walletAddress;
    }
    function setUnlocked(isUnlocked, payment = {}) {
      if (unlockButton) unlockButton.textContent = isUnlocked ? "Unlocked" : `Unlock for ${item.resource.price} ${item.resource.currency || "USDC"}`;
      if (unlockedTarget) {
        if ("hidden" in unlockedTarget) unlockedTarget.hidden = !isUnlocked;
        unlockedTarget.setAttribute("aria-hidden", isUnlocked ? "false" : "true");
      }
      if (isUnlocked) item.markUnlocked(payment);
    }
    async function connect() {
      setBusy(true);
      setStatus("Opening wallet connection...");
      try {
        const evm = provider();
        if (!evm) throw new Error(options.noWalletMessage || "Install or open an EVM wallet to continue.");
        const accounts = await evm.request({ method: "eth_requestAccounts" });
        walletAddress = Array.isArray(accounts) ? accounts[0] || "" : "";
        if (!walletAddress) throw new Error("No wallet account selected.");
        renderWallet();
        setStatus("Wallet connected. You can unlock now.");
        return walletAddress;
      } finally {
        setBusy(false);
      }
    }
    async function disconnect() {
      setBusy(true);
      try {
        const evm = provider();
        if (evm?.request && walletAddress) {
          try {
            await evm.request({ method: "wallet_revokePermissions", params: [{ eth_accounts: {} }] });
          } catch (_error) {
          }
        }
        walletAddress = "";
        renderWallet();
        setStatus(options.disconnectMessage || "Wallet disconnected for this page.");
        return true;
      } finally {
        setBusy(false);
      }
    }
    async function checkout(input) {
      const evm = provider();
      if (!evm) throw new Error(options.noWalletMessage || "Install or open an EVM wallet to continue.");
      if (!walletAddress) await connect();
      const gatewayWallet = await createCircleGatewayBrowserAdapter2({
        network,
        signer: {
          address: walletAddress,
          signTypedData: (typedData) => evm.request({ method: "eth_signTypedData_v4", params: [walletAddress, stringifyJson(typedData)] })
        },
        clientModule: options.circleClientModule,
        clientModuleUrl: options.circleClientModuleUrl
      });
      return gatewayWallet.pay(input);
    }
    async function unlock() {
      setBusy(true);
      try {
        if (!walletAddress) await connect();
        setBusy(true);
        setStatus("Requesting Gateway unlock...");
        const result = await checkResourceAccess(item.resource, {
          accessPath,
          source,
          paymentProvider: options.paymentProvider || "circle-gateway-browser",
          challengeMessage: options.challengeMessage || "Gateway payment required. Connect your wallet to continue...",
          paymentMessage: options.paymentMessage || "Approve the Gateway payment proof in your wallet...",
          successMessage: options.successMessage || `Unlocked ${item.resource.title || "content"}.`,
          checkout,
          onStatus: setStatus
        });
        if (result.ok) {
          setUnlocked(true, result.payment || {});
          if (typeof options.onUnlock === "function") options.onUnlock(result);
        }
        return result;
      } catch (error) {
        const message = error?.message || "Unlock failed. Please try again.";
        setStatus(message);
        return { ok: false, status: 0, error: message, resource: item.resource };
      } finally {
        setBusy(false);
        renderWallet();
      }
    }
    function clear() {
      clearPaymentProof(item.resource);
      setUnlocked(false);
      setStatus("Local payment proof cleared. The next unlock will require Gateway payment again.");
    }
    async function hydrate() {
      const evm = provider();
      try {
        const accounts = evm ? await evm.request({ method: "eth_accounts" }) : [];
        walletAddress = Array.isArray(accounts) ? accounts[0] || "" : "";
      } catch {
      }
      renderWallet();
      setUnlocked(false);
    }
    function mount() {
      connectButton?.addEventListener?.("click", () => connect().catch((error) => setStatus(error?.message || "Could not connect wallet.")));
      disconnectButton?.addEventListener?.("click", () => disconnect().catch((error) => setStatus(error?.message || "Could not disconnect wallet.")));
      unlockButton?.addEventListener?.("click", () => unlock());
      clearButton?.addEventListener?.("click", clear);
      hydrate();
      trackResourcePage(item.resource, { source });
      return controller;
    }
    const controller = { resource: item.resource, connect, disconnect, unlock, clear, hydrate, mount, getWalletAddress: () => walletAddress };
    if (options.autoMount !== false) mount();
    return controller;
  }

  // src/browser/reputation.js
  var RATE_CONTENT_SELECTOR = "0xc62fad09";
  var ZERO_HASH = `0x${"0".repeat(64)}`;
  var NIBGATE_CONTENT_HASH_NAMESPACE = "nibgate:content:v1";
  var NIBGATE_REPUTATION_CHAIN_ID = 5042002;
  var NIBGATE_REPUTATION_CHAIN_NAME = "Arc Testnet";
  var NIBGATE_REPUTATION_RPC_URL = "https://rpc.testnet.arc.network";
  var NIBGATE_REPUTATION_CONTRACT = "0x9f27fd62e75f86a3c7addfdba443aab1f930e281";
  var NIBGATE_REPUTATION_ABI = [
    {
      type: "function",
      name: "rateContent",
      stateMutability: "nonpayable",
      inputs: [
        { name: "contentId", type: "bytes32" },
        { name: "rating", type: "uint8" },
        { name: "reviewHash", type: "bytes32" },
        { name: "unlockRef", type: "string" }
      ],
      outputs: []
    }
  ];
  function stripHex(value = "") {
    return String(value || "").replace(/^0x/i, "").toLowerCase();
  }
  function wordRight(hex = "") {
    const clean = stripHex(hex);
    if (clean.length > 64) throw new Error("ABI word is too long.");
    return clean.padEnd(64, "0");
  }
  function numberWord(value = 0) {
    return Number(value || 0).toString(16).padStart(64, "0");
  }
  function utf8Hex(value = "") {
    return Array.from(new TextEncoder().encode(String(value || ""))).map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  function encodeString(value = "") {
    const hex = utf8Hex(value);
    const byteLength = hex.length / 2;
    const paddedLength = Math.ceil(byteLength / 32) * 64;
    return numberWord(byteLength) + hex.padEnd(paddedLength, "0");
  }
  function encodeRateContent({ contentId, ratingValue, reviewHash, unlockRef }) {
    return RATE_CONTENT_SELECTOR + wordRight(contentId) + numberWord(ratingValue) + wordRight(reviewHash || ZERO_HASH) + numberWord(128) + encodeString(unlockRef || "");
  }
  function contentRatingHash(_resource, options = {}) {
    const contentId = options.contentId || options.contentHash;
    if (!contentId) {
      throw new Error("contentId/contentHash is required. Use the Nibgate backend prepare endpoint or pass a known content hash.");
    }
    return contentId;
  }
  function reviewTextHash(review = "") {
    if (!review) return ZERO_HASH;
    throw new Error("Text review hashing is not available in direct-browser mode. Pass reviewHash from your app/backend.");
  }
  async function prepareOnchainRating(resource, options = {}) {
    if (options.contentId || options.contentHash) return { contentId: options.contentId || options.contentHash };
    const prepareUrl = options.prepareUrl || options.indexUrl?.replace(/\/index$/, "/prepare");
    if (!prepareUrl) throw new Error("contentId/contentHash or prepareUrl is required for onchain rating.");
    const response = await fetch(prepareUrl, {
      method: "POST",
      headers: { "content-type": "application/json", ...options.indexHeaders || {} },
      body: JSON.stringify({
        siteId: options.siteId,
        token: options.token,
        resource,
        url: resource.url,
        path: resource.path
      })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.contentHash) throw new Error(payload.error || "Could not prepare Nibgate onchain rating.");
    return payload;
  }
  async function rateContentOnchain(resource, options = {}) {
    const normalized = normalizeResource(resource);
    const rating = normalizeRating(options.rating ?? options.stars ?? options);
    if (!rating.ratingValue) throw new Error("Rating must be between 0.1 and 5 stars.");
    const provider = options.provider || globalThis?.ethereum;
    if (!provider?.request) throw new Error("Connect an EVM wallet to rate this content onchain.");
    const contractAddress = options.contractAddress || options.reputationContract || NIBGATE_REPUTATION_CONTRACT;
    if (!contractAddress) throw new Error("Nibgate reputation contract address is not configured.");
    const accounts = await provider.request({ method: "eth_requestAccounts" });
    const walletAddress = Array.isArray(accounts) ? accounts[0] || "" : "";
    if (!walletAddress) throw new Error("No wallet account selected.");
    const prepared = await prepareOnchainRating(normalized, options);
    const contentId = prepared.contentHash || prepared.contentId || contentRatingHash(normalized, options);
    const reviewHash = options.reviewHash || ZERO_HASH;
    const unlockRef = String(options.unlockRef || options.paymentId || options.txHash || "");
    const data = encodeRateContent({ contentId, ratingValue: rating.ratingValue, reviewHash, unlockRef });
    const txHash = await provider.request({
      method: "eth_sendTransaction",
      params: [{
        from: walletAddress,
        to: contractAddress,
        data
      }]
    });
    const payload = payloadWithResource(normalized, {
      rating: rating.rating,
      ratingValue: rating.ratingValue,
      walletAddress,
      txHash,
      contentHash: contentId,
      reviewHash,
      proofType: "onchain_pending",
      proof: unlockRef,
      paymentId: options.paymentId,
      actor: options.actor || "human"
    });
    emit("content_rating", payload);
    if (options.indexUrl) {
      await fetch(options.indexUrl, {
        method: "POST",
        headers: { "content-type": "application/json", ...options.indexHeaders || {} },
        body: JSON.stringify({
          siteId: options.siteId,
          token: options.token,
          txHash,
          resource: normalized,
          url: normalized.url,
          path: normalized.path,
          actor: options.actor || "human"
        })
      }).catch(() => null);
    }
    return { txHash, walletAddress, contentId, ratingValue: rating.ratingValue, reviewHash };
  }

  // src/browser/rating-ui.js
  function rateResource(resource, rating = {}, extra = {}) {
    const normalized = normalizeResource(resource);
    const normalizedRating = normalizeRating(rating);
    const payload = {
      ...extra,
      ...normalizedRating,
      ratingMessage: extra.ratingMessage || rating.message || rating.ratingMessage || ratingMessage(normalized, normalizedRating, extra),
      ratingSignature: extra.ratingSignature || rating.signature || rating.ratingSignature || void 0,
      resource: normalized
    };
    return emit("content_rating", payload);
  }
  function createOnchainRating(resource, options = {}) {
    const item = createGate(resource, options.gateOptions || {});
    const win = browserWindow();
    const statusTarget = typeof options.status === "string" ? win?.document.querySelector(options.status) : options.status;
    const ratingTarget = typeof options.ratingTarget === "string" ? win?.document.querySelector(options.ratingTarget) : options.ratingTarget;
    const buttonSelector = options.ratingButtons || options.buttons || "[data-nibgate-rating-value], [data-rating]";
    const explicitButtons = Array.isArray(options.buttons) ? options.buttons : typeof options.buttons === "string" ? Array.from(win?.document.querySelectorAll(options.buttons) || []) : options.buttons ? [options.buttons] : null;
    const buttons = explicitButtons || Array.from(win?.document.querySelectorAll(buttonSelector) || []);
    const source = options.source || "nibgate-onchain-rating";
    let busy = false;
    let payment = options.payment || null;
    function setStatus(message) {
      if (typeof options.onStatus === "function") options.onStatus(message);
      if (statusTarget) statusTarget.textContent = message || "";
    }
    function setBusy(value) {
      busy = Boolean(value);
      buttons.forEach((button) => {
        if (button && "disabled" in button) button.disabled = busy;
      });
    }
    function setPayment(nextPayment = null) {
      payment = nextPayment || null;
      return payment;
    }
    function setVisible(isVisible) {
      if (!ratingTarget) return Boolean(isVisible);
      if ("hidden" in ratingTarget) ratingTarget.hidden = !isVisible;
      ratingTarget.setAttribute("aria-hidden", isVisible ? "false" : "true");
      return Boolean(isVisible);
    }
    function valueFromButton(button) {
      const raw = button?.dataset?.nibgateRatingValue || button?.dataset?.rating || button?.value || button?.textContent;
      const numeric = Number.parseFloat(String(raw || "").replace(/[^\d.]/g, ""));
      return Number.isFinite(numeric) ? numeric : Number(options.rating || options.stars || 0);
    }
    async function rate(input = {}) {
      setBusy(true);
      try {
        const rating = Number.parseFloat(input.rating ?? input.stars ?? input.value ?? options.rating ?? options.stars);
        if (!Number.isFinite(rating)) throw new Error("Choose a rating before sending.");
        const paymentId = input.paymentId || options.paymentId || (typeof options.getPaymentId === "function" ? options.getPaymentId() : payment?.paymentId);
        const unlockRef = input.unlockRef || options.unlockRef || (typeof options.getUnlockRef === "function" ? options.getUnlockRef() : null) || paymentId || payment?.txHash || payment?.transactionHash || "";
        setStatus(options.pendingMessage || "Send the onchain rating transaction...");
        const result = await rateContentOnchain(item.resource, { ...options, ...input, rating, paymentId, unlockRef, source });
        setStatus(options.successMessage || "Rating sent to Nibgate reputation.");
        if (typeof options.onRated === "function") options.onRated(result);
        return result;
      } catch (error) {
        const message = error?.message || options.errorMessage || "Rating failed.";
        setStatus(message);
        if (typeof options.onError === "function") options.onError(error);
        throw error;
      } finally {
        setBusy(false);
      }
    }
    function mount() {
      buttons.forEach((button) => {
        button?.addEventListener?.("click", () => rate({ rating: valueFromButton(button) }).catch(() => null));
      });
      if (options.visible !== void 0) setVisible(Boolean(options.visible));
      return controller;
    }
    const controller = { resource: item.resource, rate, mount, setPayment, setVisible };
    if (options.autoMount !== false) mount();
    return controller;
  }
  function mountRatingUI(resource, options = {}) {
    const item = createGate(resource, options.gateOptions || {});
    const win = browserWindow();
    if (!win) return null;
    const target = typeof options.target === "string" ? win.document.querySelector(options.target) : options.target;
    if (!target) return null;
    const stars = [1, 2, 3, 4, 5];
    let selectedRating = 0;
    const container = win.document.createElement("div");
    container.className = "nibgate-rating-ui";
    container.style.cssText = "display:flex;align-items:center;gap:4px;padding:8px 0";
    const starButtons = stars.map((value) => {
      const btn = win.document.createElement("button");
      btn.type = "button";
      btn.dataset.nibgateRatingValue = String(value);
      btn.setAttribute("aria-label", `${value} star${value > 1 ? "s" : ""}`);
      btn.innerHTML = "\u2606";
      btn.style.cssText = "background:none;border:none;font-size:24px;cursor:pointer;color:#ccc;transition:color 0.15s;padding:2px;line-height:1";
      btn.addEventListener("mouseenter", () => {
        starButtons.forEach((b, i) => b.style.color = i < value ? "#f5b342" : "#ccc");
      });
      btn.addEventListener("mouseleave", () => {
        starButtons.forEach((b, i) => b.style.color = i < selectedRating ? "#f5b342" : "#ccc");
      });
      btn.addEventListener("click", () => {
        selectedRating = value;
        starButtons.forEach((b, i) => b.style.color = i < value ? "#f5b342" : "#ccc");
        rateResource(item.resource, { rating: value }).catch(() => {
        });
      });
      container.appendChild(btn);
      return btn;
    });
    const statusEl = win.document.createElement("span");
    statusEl.style.cssText = "font-size:13px;color:#888;margin-left:8px";
    statusEl.textContent = options.label || "Rate this content";
    container.appendChild(statusEl);
    target.appendChild(container);
    function rate(r, input = {}) {
      return item.rate({ ...input, rating: r });
    }
    function setRating(value) {
      selectedRating = value;
      starButtons.forEach((b, i) => b.style.color = i < value ? "#f5b342" : "#ccc");
    }
    return { resource: item.resource, container, setRating, rate };
  }

  // src/browser/transfer.js
  function createTransferCheckout(resource, options = {}) {
    const normalized = normalizeResource({ ...resource, paymentRail: "transfer" });
    const sendTransfer = options.sendTransfer || options.transfer;
    if (typeof sendTransfer !== "function") {
      throw new Error("createTransferCheckout requires sendTransfer({ resource, recipient, amount, currency, network }) and a server verifyTransfer hook.");
    }
    return {
      resource: normalized,
      async pay(input = {}) {
        const recipient = normalized.recipient || normalized.payTo;
        const amount = String(normalized.price || normalized.amount || "0");
        const currency = normalized.currency || "USDC";
        const network = options.network || input.challenge?.accepts?.[0]?.network || "eip155:5042002";
        const result = await sendTransfer({ resource: normalized, recipient, amount, currency, network, challenge: input.challenge });
        const txHash = result?.txHash || result?.hash || result?.transactionHash || result?.paymentId || "";
        if (!txHash) throw new Error("Transfer checkout did not return a txHash.");
        return {
          paymentSignature: txHash,
          signature: txHash,
          memo: result.memo || "",
          metadata: {
            paymentProvider: "direct-transfer",
            paymentId: txHash,
            txHash,
            recipient,
            amount: Number(amount),
            currency,
            network,
            ...result.metadata || result
          }
        };
      }
    };
  }
  async function payWithTransfer(resource, options = {}) {
    const checkout = options.checkout || createTransferCheckout(resource, options).pay;
    const result = await checkout({ resource: normalizeResource(resource), challenge: options.challenge || null });
    const txHash = result?.metadata?.txHash || result?.txHash || result?.paymentSignature || result?.signature || "";
    if (!txHash) throw new Error("Transfer checkout did not return a txHash.");
    return checkResourceAccess(resource, {
      ...options,
      headers: {
        ...options.headers || {},
        "x-nibgate-transfer-tx": txHash
      },
      payment: result.metadata || { paymentProvider: "direct-transfer", txHash, paymentId: txHash }
    });
  }

  // src/browser/client.js
  function createNibgate(defaults = {}) {
    const defaultResource = defaults.resource ? normalizeResource(defaults.resource) : null;
    function resourceWithDefaults(resource = {}) {
      return normalizeResource({
        ...defaultResource || {},
        ...typeof resource === "string" ? { id: resource } : resource
      });
    }
    return {
      content(resource, extra = {}) {
        return emit("content_registered", payloadWithResource(resourceWithDefaults(resource), extra));
      },
      registerContent(resource, extra = {}) {
        return emit("content_registered", payloadWithResource(resourceWithDefaults(resource), extra));
      },
      view(resource, extra = {}) {
        return emit("resource_view", payloadWithResource(resourceWithDefaults(resource), extra));
      },
      track(eventName, payload = {}) {
        return emit(eventName || "custom", payload);
      },
      unlockStarted(resource, extra = {}) {
        return emit("unlock_started", payloadWithResource(resourceWithDefaults(resource), extra));
      },
      unlockCompleted(resource, payment = {}) {
        return emit("unlock_completed", payloadWithResource(resourceWithDefaults(resource), payment));
      },
      paymentCompleted(resource, payment = {}) {
        return emit("payment_completed", payloadWithResource(resourceWithDefaults(resource), payment));
      },
      rateResource(resource, rating = {}, extra = {}) {
        return rateResource(resourceWithDefaults(resource), rating, extra);
      },
      ratingMessage(resource, rating = {}, messageOptions = {}) {
        return ratingMessage(resourceWithDefaults(resource), rating, messageOptions);
      },
      gate(resource, options = {}) {
        return createGate(resourceWithDefaults(resource), { ...options, client: this });
      },
      trackResourcePage(resource, options = {}) {
        return trackResourcePage(resourceWithDefaults(resource), options);
      },
      checkResourceAccess(resource, options = {}) {
        return checkResourceAccess(resourceWithDefaults(resource), options);
      },
      payWithPaymentSignature(resource, options = {}) {
        return payWithPaymentSignature(resourceWithDefaults(resource), options);
      },
      createWalletCheckout(resource, options = {}) {
        return createWalletCheckout(resourceWithDefaults(resource), options);
      },
      createCircleGatewayBrowserAdapter(options = {}) {
        return createCircleGatewayBrowserAdapter2(options);
      },
      createTransferCheckout(resource, options = {}) {
        return createTransferCheckout(resourceWithDefaults(resource), options);
      },
      payWithTransfer(resource, options = {}) {
        return payWithTransfer(resourceWithDefaults(resource), options);
      },
      createEvmGatewayUnlock(resource, options = {}) {
        return createEvmGatewayUnlock(resourceWithDefaults(resource), options);
      },
      createOnchainRating(resource, options = {}) {
        return createOnchainRating(resourceWithDefaults(resource), options);
      },
      mountRatingUI(resource, options = {}) {
        return mountRatingUI(resourceWithDefaults(resource), options);
      },
      payAndUnlockResource(resource, options = {}) {
        return payAndUnlockResource(resourceWithDefaults(resource), options);
      },
      setupResourcePage(resource, options = {}) {
        return setupResourcePage(resourceWithDefaults(resource), options);
      },
      normalizeResource: resourceWithDefaults,
      normalizeContentType,
      flush: flushQueue
    };
  }
  var nibgate = createNibgate();
  setDefaultClient(nibgate);

  // src/core/settings.js
  var NIBGATE_CONTENT_SETTING_FIELDS = [
    { name: "publishToNibgate", label: "Publish to Nibgate discovery", type: "boolean", defaultValue: true },
    { name: "type", label: "Content type", type: "select", options: CONTENT_TYPES, defaultValue: "article" },
    { name: "humanAccess", label: "Human access", type: "select", options: ACCESS_MODES, defaultValue: "paid" },
    { name: "agentAccess", label: "Agent access", type: "select", options: ACCESS_MODES, defaultValue: "paid" },
    { name: "unlockMode", label: "Unlock mode", type: "select", options: UNLOCK_MODES, defaultValue: "one_time" },
    { name: "paymentRail", label: "Payment rail", type: "select", options: PAYMENT_RAILS, defaultValue: "gateway" },
    { name: "price", label: "Price", type: "text", defaultValue: "0.005" },
    { name: "currency", label: "Currency", type: "text", defaultValue: "USDC" },
    { name: "recipient", label: "Recipient wallet", type: "wallet", defaultValue: "" },
    { name: "ratingsEnabled", label: "Enable ratings", type: "boolean", defaultValue: true },
    { name: "license", label: "License / terms", type: "textarea", defaultValue: "" }
  ];
  function createNibgateContentSettings(input = {}) {
    const access = normalizeAccessPolicy(input.access || {
      humans: input.humanAccess,
      agents: input.agentAccess
    });
    const unlock = normalizeUnlockPolicy(input.unlock || input.unlockMode || "one_time");
    return {
      publishToNibgate: input.publishToNibgate ?? input.publishedToNibgate ?? true,
      type: normalizeContentType(input.type || input.contentType || "article"),
      humanAccess: access.humans,
      agentAccess: access.agents,
      unlockMode: unlock.mode,
      paymentRail: normalizePaymentRail(input.paymentRail || input.paymentMode || input.rail),
      price: String(input.price ?? input.amount ?? "0.005"),
      currency: input.currency || "USDC",
      recipient: input.recipient || input.payTo || input.receiverAddress || input.creatorWallet || "",
      ratingsEnabled: input.ratingsEnabled ?? input.enableRatings ?? input.reputation?.ratingsEnabled ?? true,
      license: input.license || input.terms || ""
    };
  }
  function settingsToAccessPolicy(settings = {}) {
    return normalizeAccessPolicy({
      humans: settings.humanAccess,
      agents: settings.agentAccess
    });
  }
  function settingsToUnlockPolicy(settings = {}) {
    return normalizeUnlockPolicy(settings.unlockMode || settings.unlock || "one_time");
  }
  return __toCommonJS(index_exports);
})();
//# sourceMappingURL=nibgate.js.map
