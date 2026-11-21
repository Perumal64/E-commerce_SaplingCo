const A = APP.firebase, FS = `https://firestore.googleapis.com/v1/projects/${A.projectId}/databases/(default)/documents`, K = "key=" + A.apiKey;
const $call = (u, m, b, t) => new Promise((ok, no) => $.ajax({ url: u, method: m, contentType: "application/json", dataType: "json", data: b ? JSON.stringify(b) : undefined, headers: t ? { Authorization: "Bearer " + t } : {} }).done(ok).fail(x => no(new Error(x.responseJSON?.error?.message || "Network error"))));
const encF = o => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, enc(v)]));
const enc = v => v == null ? { nullValue: null } : typeof v == "string" ? { stringValue: v } : typeof v == "boolean" ? { booleanValue: v } : typeof v == "number" ? (Number.isInteger(v) ? { integerValue: "" + v } : { doubleValue: v }) : Array.isArray(v) ? { arrayValue: { values: v.map(enc) } } : { mapValue: { fields: encF(v) } };
const decF = f => Object.fromEntries(Object.entries(f).map(([k, v]) => [k, dec(v)]));
const dec = v => "stringValue" in v ? v.stringValue : "integerValue" in v ? +v.integerValue : "doubleValue" in v ? v.doubleValue : "booleanValue" in v ? v.booleanValue : "arrayValue" in v ? (v.arrayValue.values || []).map(dec) : "mapValue" in v ? decF(v.mapValue.fields || {}) : null;
const doc = d => ({ id: d.name.split("/").pop(), ...decF(d.fields || {}) });
const S = { get: () => JSON.parse(localStorage.getItem("sap") || "null"), set: s => localStorage.setItem("sap", JSON.stringify(s)), clear: () => localStorage.removeItem("sap") };
async function tok() {
    const s = S.get(); if (!s) return null; if (Date.now() < s.exp - 60000) return s.idToken;
    const r = await new Promise((ok, no) => $.post(`https://securetoken.googleapis.com/v1/token?${K}`, { grant_type: "refresh_token", refresh_token: s.refreshToken }).done(ok).fail(() => no(new Error("Session expired"))));
    s.idToken = r.id_token; s.refreshToken = r.refresh_token; s.exp = Date.now() + r.expires_in * 1000; S.set(s); return s.idToken
}
const DB = {
    async list(c) { let o = [], p = ""; do { const d = await $call(`${FS}/${c}?pageSize=300&${K}${p}`, "GET", 0, await tok()); o = o.concat((d.documents || []).map(doc)); p = d.nextPageToken ? "&pageToken=" + encodeURIComponent(d.nextPageToken) : "" } while (p); return o },
    async q(c, f, v) { const r = await $call(`${FS}:runQuery?${K}`, "POST", { structuredQuery: { from: [{ collectionId: c }], where: { fieldFilter: { field: { fieldPath: f }, op: "EQUAL", value: enc(v) } } } }, await tok()); return r.filter(x => x.document).map(x => doc(x.document)) },
    async get(c, id) { return doc(await $call(`${FS}/${c}/${id}?${K}`, "GET", 0, await tok())) },
    async add(c, o, id) { return doc(await $call(`${FS}/${c}?${id ? "documentId=" + id + "&" : ""}${K}`, "POST", { fields: encF(o) }, await tok())) },
    async set(c, id, o) { const m = Object.keys(o).map(k => "updateMask.fieldPaths=" + k).join("&"); return doc(await $call(`${FS}/${c}/${id}?${m}&${K}`, "PATCH", { fields: encF(o) }, await tok())) },
    async del(c, id) { return $call(`${FS}/${c}/${id}?${K}`, "DELETE", 0, await tok()) }
};
const AU = "https://identitytoolkit.googleapis.com/v1/accounts:";
const Auth = {
    up: (email, password) => $call(`${AU}signUp?${K}`, "POST", { email, password, returnSecureToken: true }),
    async login(email, password) {
        const r = await $call(`${AU}signInWithPassword?${K}`, "POST", { email, password, returnSecureToken: true });
        const role = email.toLowerCase() == APP.adminEmail.toLowerCase() ? "admin" : "customer";
        S.set({ uid: r.localId, email: r.email, idToken: r.idToken, refreshToken: r.refreshToken, exp: Date.now() + r.expiresIn * 1000, role, name: "Admin" });
        if (role == "customer") { let n = r.email; try { n = (await DB.get("customers", r.localId)).name } catch (e) { } S.set({ ...S.get(), name: n }) } return S.get()
    },
    reset: email => $call(`${AU}sendOobCode?${K}`, "POST", { requestType: "PASSWORD_RESET", email }),
    guard(role) { const s = S.get(); if (!s || (role && s.role != role)) { location.href = "login.html"; return null } return s },
    out() { S.clear(); location.href = "login.html" }
};
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = n => APP.currency + Number(n || 0).toLocaleString("en-IN");
const fd = d => d ? new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "";
const uid = p => p + "-" + Date.now().toString(36).toUpperCase().slice(-6) + Math.floor(Math.random() * 36).toString(36).toUpperCase();
const V = { email: e => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e), mob: m => /^[6-9]\d{9}$/.test(m), pw: p => p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p) };
function toast(m, bad) { const t = $(`<div class="toast ${bad ? "bad" : ""}">`).text(m).appendTo("body"); setTimeout(() => t.remove(), 3500) }
function modal(html) { const m = $(`<div class="ov"><div class="md">${html}</div></div>`).appendTo("body"); m.on("click", e => { if (e.target == m[0] || $(e.target).is("[data-x]")) m.remove() }); return m }
function ask(msg) { return new Promise(ok => { const m = $(`<div class="ov"><div class="md sm"><p>${esc(msg)}</p><div class="row"><button class="btn ghost" data-v="0">No</button><button class="btn" data-v="1">Yes</button></div></div></div>`).appendTo("body"); m.on("click", "button", e => { m.remove(); ok(e.target.dataset.v == "1") }) }) }
const slice = (a, p) => a.slice((p - 1) * APP.pageSize, p * APP.pageSize);
function pager(el, total, page, cb) { const n = Math.max(1, Math.ceil(total / APP.pageSize)); el.html(`<button ${page <= 1 ? "disabled" : ""} data-p="${page - 1}">‹ Prev</button><span>Page ${page} of ${n}</span><button ${page >= n ? "disabled" : ""} data-p="${page + 1}">Next ›</button>`).off("click").on("click", "button", e => cb(+$(e.currentTarget).data("p"))) }
function mail(to, subject, html) {
    const e = APP.emailjs; if (!e.serviceId) return Promise.resolve(false);
    return new Promise(ok => $.ajax({ url: "https://api.emailjs.com/api/v1.0/email/send", method: "POST", contentType: "application/json", dataType: "text", data: JSON.stringify({ service_id: e.serviceId, template_id: e.templateId, user_id: e.publicKey, template_params: { to_email: to, subject, message: html } }) }).done(() => ok(true)).fail(() => ok(false)))
}
