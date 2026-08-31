/* SourceKettle front-end. Vanilla JS, no build step, no dependencies. */
"use strict";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

let BOOT = null;
const CART = new Map();          // product_id -> quantity
let LAST_EVAL = null;
let CURRENT_LINE = null;

const fmt = n => n.toLocaleString(undefined, { maximumFractionDigits: 0 });

/* ------------------------------------------------------------------ */
/* bootstrap                                                           */
/* ------------------------------------------------------------------ */
async function boot() {
  BOOT = await (await fetch("/api/bootstrap")).json();

  const c = BOOT.counts;
  $("#stats").innerHTML = [
    ["pillars", c.pillars], ["segments", c.segments], ["sub-segments", c.subsegments],
    ["products", c.products], ["lines", c.applications], ["attributes", c.attributes],
  ].map(([k, v]) => `<div class="stat"><b>${v}</b><span>${k}</span></div>`).join("");

  const pillars = BOOT.taxonomy.filter(n => n.kind === "pillar");
  $("#f-pillar").insertAdjacentHTML("beforeend",
    pillars.map(p => `<option value="${p.code}">${p.code} · ${p.name}</option>`).join(""));
  $("#f-app").insertAdjacentHTML("beforeend",
    BOOT.applications.map(a => `<option value="${a.code}">${a.code} · ${a.name}</option>`).join(""));
  $("#f-storage").insertAdjacentHTML("beforeend",
    BOOT.storage_classes.map(s => `<option value="${s.code}">${s.code} · ${s.name}</option>`).join(""));

  ["f-q", "f-pillar", "f-app", "f-grade", "f-dg", "f-storage"].forEach(id =>
    $("#" + id).addEventListener("input", debounce(loadCatalogue, 160)));
  $("#f-clear").addEventListener("click", () => {
    ["f-q", "f-pillar", "f-app", "f-grade", "f-dg", "f-storage"].forEach(id => $("#" + id).value = "");
    loadCatalogue();
  });

  $$("#tabs button").forEach(b => b.addEventListener("click", () => switchTab(b.dataset.tab)));
  $("#btn-evaluate").addEventListener("click", evaluate);
  $("#btn-place").addEventListener("click", placeOrder);
  ["s-declared", "s-doc", "s-carrier", "s-licence"].forEach(id =>
    $("#" + id).addEventListener("change", () => { if (CART.size) evaluate(); }));

  renderLinePicker();
  await loadCatalogue();
  renderCart();
  await loadOrders();
}

const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

function switchTab(name) {
  $$("#tabs button").forEach(b => b.classList.toggle("active", b.dataset.tab === name));
  $$(".tab").forEach(s => s.classList.toggle("active", s.id === "tab-" + name));
  if (name === "orders") loadOrders();
  if (name === "market" && !$("#index-picker").children.length) loadIndexPicker();
  if (name === "insights" && !$("#sub-target").options.length) loadInsights();
}

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 1900);
}

/* ------------------------------------------------------------------ */
/* catalogue                                                           */
/* ------------------------------------------------------------------ */
const PAGE_SIZE = 48;
let catalogueOffset = 0;

async function loadCatalogue(offset = 0) {
  const p = new URLSearchParams();
  const map = { q: "f-q", pillar: "f-pillar", app: "f-app", grade: "f-grade", dg: "f-dg", storage: "f-storage" };
  for (const [k, id] of Object.entries(map)) if ($("#" + id).value) p.set(k, $("#" + id).value);
  p.set("limit", PAGE_SIZE);
  p.set("offset", offset);

  // The catalogue is ~1000 SKUs; the server pages it and returns the true total.
  const { results, total } = await (await fetch("/api/catalogue?" + p)).json();
  window.__lastResults = results;   // so "Add" can read the product's MOQ
  catalogueOffset = offset;

  const from = total ? offset + 1 : 0;
  const to = Math.min(offset + results.length, total);
  $("#facet-count").textContent =
    `${total} product${total === 1 ? "" : "s"} · showing ${from}–${to}`;
  $("#results").innerHTML = results.length
    ? results.map(card).join("")
    : `<div class="empty-note">No products match. Try clearing a filter.</div>`;

  renderPager(total, offset);
  $$("#results button.add").forEach(b => b.addEventListener("click", () => addToCart(b.dataset.id)));
  $$("#results button.detail").forEach(b => b.addEventListener("click", () => showDetail(b.dataset.id)));
}

function renderPager(total, offset) {
  const el = $("#pager");
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const cur = Math.floor(offset / PAGE_SIZE);
  if (total <= PAGE_SIZE) { el.innerHTML = ""; return; }

  // Window of page buttons around the current one, so 22 pages stay usable.
  const win = [];
  for (let i = Math.max(0, cur - 3); i < Math.min(pages, cur + 4); i++) win.push(i);

  el.innerHTML =
    `<button data-go="0" ${cur === 0 ? "disabled" : ""}>&laquo;</button>` +
    `<button data-go="${cur - 1}" ${cur === 0 ? "disabled" : ""}>&lsaquo;</button>` +
    win.map(i => `<button data-go="${i}" ${i === cur ? 'aria-current="page"' : ""}>${i + 1}</button>`).join("") +
    `<button data-go="${cur + 1}" ${cur >= pages - 1 ? "disabled" : ""}>&rsaquo;</button>` +
    `<button data-go="${pages - 1}" ${cur >= pages - 1 ? "disabled" : ""}>&raquo;</button>` +
    `<span class="pager-info">page ${cur + 1} of ${pages}</span>`;

  $$("#pager button").forEach(b => b.addEventListener("click", () => {
    const i = Math.max(0, Math.min(pages - 1, parseInt(b.dataset.go, 10) || 0));
    loadCatalogue(i * PAGE_SIZE);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }));
}

function card(p) {
  const pills = [
    `<span class="pill seg">${p.segment} · ${p.segment_name}</span>`,
    p.dg && p.dg !== "non-DG" ? `<span class="pill dg">DG ${p.dg}${p.un ? " · UN " + p.un : ""}</span>` : "",
    p.dg === "non-DG" ? `<span class="pill">non-DG</span>` : "",
    p.storage ? `<span class="pill storage">${p.storage}</span>` : "",
    p.grade ? `<span class="pill">${p.grade} grade</span>` : "",
    p.grade_gated ? `<span class="pill gate">grade-gated</span>` : "",
    p.licence_gated ? `<span class="pill gate">licence-gated</span>` : "",
    p.transaction_model === "brokerage_escrow" ? `<span class="pill capex">capex · escrow</span>` : "",
    p.un_verified === false ? `<span class="pill gate">UN unverified</span>` : "",
  ].join("");

  const spec = p.form === "equipment" && p.equipment
    ? `<div class="spec"><b>${p.equipment.capacity}</b> · ${p.equipment.moc} · lead ${p.lead} wks · ${p.equipment.certs.join(", ")}</div>`
    : `<div class="spec">${p.form || "—"}${p.purity ? ` · <b>${p.purity}%</b> min` : ""}${p.cas ? ` · CAS ${p.cas}` : ""}</div>`;

  return `<div class="pcard">
    <h3>${p.name}</h3>
    <div class="pill-row">${pills}</div>
    ${spec}
    <div class="meta">
      <span class="price">${fmt(p.price)}<small> / ${p.uom}</small></span>
      <span class="supplier">MOQ ${fmt(p.moq)} ${p.uom} · ${p.lead}d<br>${p.supplier_name} (${p.supplier_tier} · ${p.supplier_score})</span>
    </div>
    ${p.note ? `<p class="note">${p.note}</p>` : ""}
    ${p.disclosure ? `<p class="note" style="border-color:var(--warn)"><b>Off-spec:</b> ${p.disclosure}</p>` : ""}
    <div class="actions">
      <button class="detail" data-id="${p.id}">Compliance pack</button>
      <button class="add" data-id="${p.id}">Add</button>
    </div>
  </div>`;
}

async function showDetail(id) {
  const { product: p, mandatory_attributes: attrs, segment_note: note } =
    await (await fetch("/api/products/" + id)).json();

  const rows = [
    ["Segment path", p.segment_path],
    ["Transaction model", p.transaction_model],
    ["Applications (Taxonomy B)", p.application_names.join("; ") || "—"],
    ["Grade / purity", `${p.grade || "—"}${p.purity ? " · " + p.purity + "%" : ""}`],
    ["CAS", p.cas || "—"],
    ["Physical form", p.form || "—"],
    ["UN number", p.un ? `${p.un} — ${p.dg_psn || "?"} ${p.un_verified ? "(verified in DG reference)" : "(NOT IN DG REFERENCE)"}` : "not applicable (non-DG)"],
    ["DG class / packing group", `${p.dg} ${p.pg ? "/ PG " + p.pg : ""}`],
    ["GHS pictograms", (p.ghs || []).join(", ") || "none"],
    ["Flash point", p.flash != null ? p.flash + " °C" : "—"],
    ["Storage class", p.storage ? `${p.storage} — ${p.storage_rule || ""}` : "—"],
    ["Packaging", (p.packs || []).map(k => `${k.unit}${k.un_rated ? " [" + k.un_rated + "]" : ""}`).join("; ")],
    ["HS / origin", `${p.hs || "—"} / ${p.origin}`],
    ["Documents on file", (p.docs || []).join(", ")],
    ["Certifications", (p.equipment && p.equipment.certs || []).join(", ") || "—"],
  ].map(([k, v]) => `<tr><td class="role">${k}</td><td>${v}</td></tr>`).join("");

  const html = `<div class="card" style="margin-top:1rem">
    <h3>Compliance envelope — ${p.name}</h3>
    <table class="role-table"><tbody>${rows}</tbody></table>
    <p class="note" style="margin-top:.7rem"><b>Mandatory attributes for ${p.segment}:</b> ${attrs.join(", ")}</p>
    ${note ? `<p class="note">${note}</p>` : ""}
  </div>`;

  const el = $("#detail-panel");
  if (el) el.remove();
  $("#results").insertAdjacentHTML("beforebegin", `<div id="detail-panel">${html}</div>`);
  $("#detail-panel").scrollIntoView({ behavior: "smooth", block: "nearest" });
  toast("Compliance pack loaded");

  // landed-cost breakdown -- plan/04: never rank on headline price
  const { data: lc } = await jpost("/api/landed-cost", { product_id: id, payment_days: 30 });
  const v = lc.vs_index || {};
  $("#detail-panel").insertAdjacentHTML("beforeend", `<div class="card" style="margin-top:.7rem">
    <h3>Landed cost at ${fmt(lc.quantity)} ${p.uom} <span class="pill">${lc.landed.currency}</span></h3>
    <div class="idx-row">
      <div><span>headline /unit</span><b>${NGN(p.price * 100)}</b></div>
      <div><span>landed /unit</span><b style="color:var(--accent)">${NGN(lc.landed.landed_unit_kobo)}</b></div>
      <div><span>total</span><b>${NGN(lc.landed.total_kobo)}</b></div>
      <div><span>duty rate</span><b>${(lc.landed.duty_rate * 100).toFixed(0)}%</b></div>
      ${v.available ? `<div><span>vs market index</span>
        <b style="color:${v.delta_kobo < 0 ? 'var(--ok)' : 'var(--bad)'}">
        ${v.delta_kobo > 0 ? '+' : ''}${NGN(v.delta_kobo)} (${v.verdict})</b></div>` : ""}
    </div>
    <dl class="ship-grid" style="margin-top:.6rem">${lc.landed.components.map(c =>
      `<dt>${c.component}</dt><dd>${NGN(c.amount_kobo)}
        <span style="color:var(--muted)">${c.note}</span></dd>`).join("")}</dl>
    ${!v.available ? `<p class="note">No published index for ${p.segment} yet — ${v.reason}.</p>` : ""}
  </div>`);
}

/* ------------------------------------------------------------------ */
/* line builder                                                        */
/* ------------------------------------------------------------------ */
function renderLinePicker() {
  $("#line-picker").innerHTML = Object.entries(BOOT.line_templates).map(([code, t]) =>
    `<button data-line="${code}"><b>${t.name}</b><span>${code} · ${t.typical}</span></button>`).join("");
  $$("#line-picker button").forEach(b => b.addEventListener("click", () => loadLine(b.dataset.line)));
}

async function loadLine(code) {
  CURRENT_LINE = code;
  $$("#line-picker button").forEach(b => b.classList.toggle("on", b.dataset.line === code));
  const d = await (await fetch("/api/lines/" + code)).json();

  $("#line-detail").innerHTML = `
    <h3 style="margin-bottom:.5rem">${d.application_name}</h3>
    <table class="role-table">
      <thead><tr><th>Line role</th><th>Product</th><th>Segment</th><th>Price</th><th></th></tr></thead>
      <tbody>${d.roles.map(r => `<tr>
        <td class="role">${r.role}</td>
        <td>${r.product.name}<div class="sub" style="font-size:.76rem;color:var(--muted)">${r.product.supplier_name} · ${r.product.lead}d lead</div></td>
        <td>${r.product.segment}</td>
        <td>${fmt(r.product.price)} / ${r.product.uom}</td>
        <td><button class="add" data-id="${r.product.id}" style="padding:.3rem .7rem">Add</button></td>
      </tr>`).join("")}</tbody>
    </table>
    <button class="addline" id="add-all">Add entire line to cart (${d.roles.length} items)</button>`;

  $$("#line-detail button.add").forEach(b => b.addEventListener("click", () => addToCart(b.dataset.id)));
  $("#add-all").addEventListener("click", () => {
    d.roles.forEach(r => addToCart(r.product.id, true));
    toast(`Added ${d.roles.length} line components`);
    renderCart();
  });
}

/* ------------------------------------------------------------------ */
/* cart + compliance                                                   */
/* ------------------------------------------------------------------ */
function addToCart(id, quiet) {
  const p = (window.__lastResults || []).find(x => x.id === id);
  CART.set(id, (CART.get(id) || 0) + (p ? p.moq : 1));
  if (!quiet) toast("Added to cart");
  renderCart();
}

async function resolveCart() {
  const out = [];
  for (const [id, qty] of CART) {
    const { product } = await (await fetch("/api/products/" + id)).json();
    out.push({ ...product, quantity: qty });
  }
  return out;
}

async function renderCart() {
  $("#cart-badge").textContent = CART.size;
  const items = await resolveCart();

  if (!items.length) {
    $("#cart-items").innerHTML = `<div class="card"><div class="empty-note">Cart is empty. Add products from the catalogue, or use the Line Builder to add a whole production line at once.</div></div>`;
    $("#ship-summary").innerHTML = "";
    $("#verdict").className = "verdict empty";
    $("#verdict").textContent = "Add items, then run the checks.";
    $("#findings").innerHTML = "";
    $("#warehouse").innerHTML = "";
    $("#btn-place").disabled = true;
    LAST_EVAL = null;
    return;
  }

  $("#cart-items").innerHTML = `<div class="card"><h3>Basket (${items.length} lines)</h3>` +
    items.map(p => `<div class="cart-row">
        <div><div class="nm">${p.name}</div>
             <div class="sub">${p.segment} · ${p.dg !== "non-DG" ? "DG " + p.dg + (p.un ? " UN " + p.un : "") : "non-DG"}${p.storage ? " · " + p.storage : ""} · ${fmt(p.price)}/${p.uom}</div></div>
        <input type="number" min="1" step="1" value="${p.quantity}" data-id="${p.id}" class="qty">
        <button data-rm="${p.id}" title="Remove">✕</button>
      </div>`).join("") + `</div>`;

  $$("#cart-items .qty").forEach(i => i.addEventListener("change", () => {
    CART.set(i.dataset.id, Math.max(1, parseInt(i.value) || 1)); renderCart();
  }));
  $$("#cart-items button[data-rm]").forEach(b => b.addEventListener("click", () => {
    CART.delete(b.dataset.rm); renderCart();
  }));

  const un = [...new Set(items.filter(p => p.un).map(p => p.un))];
  const isDG = items.some(p => p.dg !== "non-DG");
  $("#ship-summary").innerHTML = `
    <dt>Contains dangerous goods</dt><dd>${isDG ? "<b style='color:var(--bad)'>yes</b>" : "no"}</dd>
    <dt>UN numbers present</dt><dd>${un.length ? un.join(", ") : "—"}</dd>
    <dt>Distinct storage classes</dt><dd>${[...new Set(items.map(p => p.storage).filter(Boolean))].sort().join(", ") || "—"}</dd>`;

  if (LAST_EVAL) evaluate();
}

async function evaluate() {
  const items = await resolveCart();
  if (!items.length) return;

  const body = {
    order_id: "ORD-DRAFT",
    buyer_has_licence: $("#s-licence").checked,
    items: items.map(p => ({ product_id: p.id, quantity: p.quantity })),
    shipment: {
      shipment_id: "SHP-DRAFT",
      is_dg: items.some(p => p.dg !== "non-DG"),
      dg_declared: $("#s-declared").checked,
      dg_decl_document_id: $("#s-doc").checked ? "DOC-" + Math.random().toString(36).slice(2, 8) : null,
      carrier_dg_authorised: $("#s-carrier").checked,
    },
  };

  LAST_EVAL = await (await fetch("/api/evaluate", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  })).json();
  renderFindings(LAST_EVAL);
}

function renderFindings(r) {
  const v = $("#verdict");
  v.className = "verdict " + (r.blocked ? "bad" : "ok");
  v.innerHTML = (r.blocked ? "⛔ BLOCKED — this order cannot be placed" : "✅ CLEARED — all compliance rules passed")
    + `<span class="sub">${r.counts.total} checks · ${r.counts.pass} pass · ${r.counts.warn} warn · ${r.counts.block} block. Evaluated by <code>engine/rules.py</code>.</span>`;

  const order = { block: 0, warn: 1, pass: 2 };
  $("#findings").innerHTML = [...r.findings]
    .sort((a, b) => order[a.outcome] - order[b.outcome])
    .filter(f => f.outcome !== "pass" || f.rule_code === "STORAGE_SEGREGATION" || f.rule_code === "DG_GATE")
    .map(f => `<div class="finding ${f.outcome}">
        <span class="rc">${f.rule_code}</span> · ${f.outcome}
        <pre>${JSON.stringify(f.detail, null, 1)}</pre>
      </div>`).join("")
    || `<div class="finding pass"><span class="rc">ALL PASS</span> · every rule returned pass</div>`;

  $("#btn-place").disabled = r.blocked;
  warehousePlan();
}

async function warehousePlan() {
  const items = await resolveCart();
  if (!items.length) return;
  const wp = await (await fetch("/api/warehouse-plan", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: items.map(p => ({ product_id: p.id, quantity: p.quantity })) }),
  })).json();

  $("#warehouse").innerHTML = wp.zones.length
    ? `<div class="card"><h3>Warehouse segregation plan</h3>${
        wp.zones.map(z => `<div class="zone"><b>${z.storage_class}</b> — ${z.name}
            <div style="margin-top:.15rem">${z.items.join(" · ")}</div>
            <span class="rule">${z.rule}</span></div>`).join("")
      }${wp.separate_drops_required
        ? `<p class="note" style="border-color:var(--warn)">Multiple incompatible classes in the basket — this must be split across separate drops.</p>`
        : ""}</div>`
    : "";
}

/* ------------------------------------------------------------------ */
/* orders                                                              */
/* ------------------------------------------------------------------ */
async function placeOrder() {
  const items = await resolveCart();
  const body = {
    buyer_has_licence: $("#s-licence").checked,
    items: items.map(p => ({ product_id: p.id, quantity: p.quantity })),
    shipment: {
      is_dg: items.some(p => p.dg !== "non-DG"),
      dg_declared: $("#s-declared").checked,
      dg_decl_document_id: $("#s-doc").checked ? "DOC-" + Math.random().toString(36).slice(2, 8) : null,
      carrier_dg_authorised: $("#s-carrier").checked,
    },
  };
  const res = await fetch("/api/orders", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    toast("Rejected: " + (data.error || res.status));
    return;
  }
  CART.clear();
  renderCart();
  toast("Order " + data.order_id + " confirmed");
  switchTab("orders");
}

async function loadOrders() {
  const { orders } = await (await fetch("/api/orders")).json();
  $("#order-list").innerHTML = orders.length ? orders.map(o => `
    <div class="order">
      <div class="oh">
        <div><b>${o.order_id}</b> <span class="st">${o.status}</span></div>
        <div class="sub" style="color:var(--muted);font-size:.8rem">
          ${o.counts.total} checks · ${o.counts.block} blocking · DG: ${o.shipment.is_dg ? "yes (" + (o.shipment.un_numbers.join(", ") || "—") + ")" : "no"}
        </div>
      </div>
      <table class="role-table" style="margin-top:.6rem"><tbody>
        ${o.items.map(i => `<tr><td>${i.name}</td><td>${fmt(i.quantity)} ${i.uom}</td><td>${i.segment}</td><td>${fmt(i.price)}/${i.uom}</td></tr>`).join("")}
      </tbody></table>
    </div>`).join("")
    : `<div class="empty-note">No orders yet. Build a basket on the Compliance tab and clear the checks.</div>`;
}

/* end */

boot();

/* ================================================================== */
/* Commercial + insight features                                       */
/* ================================================================== */
const NGN = k => "₦" + (k / 100).toLocaleString(undefined, { maximumFractionDigits: 0 });

async function api(path, opts) {
  const r = await fetch(path, opts);
  return { ok: r.ok, status: r.status, data: await r.json() };
}
const jpost = (path, body) => api(path, {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

/* ---------------- sourcing / auction ---------------- */
let ACTIVE_RFQ = null;

$("#rfq-create").addEventListener("click", async () => {
  const src = $("#rfq-src").value;
  let items = [];
  if (src === "cart") {
    const c = await resolveCart();
    items = c.map(p => ({ product_id: p.id, quantity: p.quantity }));
    if (!items.length) return toast("Cart is empty — add items or pick a line template");
  }
  const body = src === "cart"
    ? { items }
    : { line_template: src };
  Object.assign(body, {
    delivery_location: $("#rfq-loc").value, required_by: $("#rfq-by").value,
    payment_days: parseInt($("#rfq-terms").value) || 30, mode: $("#rfq-mode").value,
  });
  const { data } = await jpost("/api/rfqs", body);
  ACTIVE_RFQ = data.rfq.rfq_id;
  renderRfq(data.rfq, null);
  toast("RFQ " + ACTIVE_RFQ + " created — " + data.rfq.lines.length + " lines");
});

function renderRfq(rfq, res) {
  const won = rfq.quotes || 0;
  $("#rfq-out").innerHTML = `
    <div class="card" style="margin-top:.85rem">
      <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:.6rem">
        <h3 style="margin:0">${rfq.rfq_id} <span class="pill seg">${rfq.mode}</span>
            ${rfq.closed ? '<span class="pill">closed</span>' : '<span class="pill gate">open</span>'}</h3>
        <span class="supplier">${rfq.delivery_location} · required by ${rfq.required_by}
            · ${rfq.payment_days}d terms</span>
      </div>
      <p class="sub" style="color:var(--muted);font-size:.84rem;margin-top:.4rem">
        ${rfq.lines.length} lots (merged by segment). Each lot is awarded independently —
        you do not buy a reactor and caustic soda from the same supplier.</p>
      <table class="role-table" style="margin-top:.6rem">
        <thead><tr><th>Lot</th><th>Spec</th><th>Qty</th><th>UoM</th></tr></thead>
        <tbody>${rfq.lines.map(l => `<tr><td><b>${l.taxonomy_code}</b>
            <span style="color:var(--muted)">${l.segment_name}</span></td>
            <td>${l.spec}</td><td>${fmt(l.quantity)}</td><td>${l.uom}</td></tr>`).join("")}</tbody>
      </table>
      <button id="rfq-run" class="addline" ${won ? "disabled style='opacity:.5'" : ""}>
        ${won ? `Awarded ${won} lot(s)` : "Collect sealed bids"}
      </button>
    </div>
    <div id="rfq-ranking">${res ? renderAuction(res) : ""}</div>`;

  const btn = $("#rfq-run");
  if (btn && !won) btn.addEventListener("click", async () => {
    const { data } = await jpost(`/api/rfqs/${rfq.rfq_id}/auction`, {});
    if (data.error) return toast(data.error);
    const res2 = await api(`/api/rfqs/${rfq.rfq_id}/ranking`);
    renderRfq(res2.data.rfq, res2.data);
    toast(`${data.awarded}/${data.lots} lots awarded`);
  });
}

function renderAuction(res) {
  const a = res.auction;
  if (!a) return `<div class="verdict empty" style="margin-top:.85rem">No bids collected yet.</div>`;

  const head = `<div class="verdict ${a.awarded ? "ok" : "bad"}" style="margin-top:.85rem">
      ${a.awarded} of ${a.lots} lots awarded
      <span class="sub">Ranked on total landed cost per lot. Sealed bids — bidders cannot see
      each other's prices. ${a.unawardable.length
        ? "Lots without 3 qualified bidders: " + a.unawardable.join(", ") + "." : ""}</span></div>`;

  const body = a.results.map(lot => {
    const rk = lot.ranking, ix = lot.reference_index || {};
    if (!rk.rankable) {
      return `<div class="card" style="margin-top:.6rem"><h3>Lot ${lot.lot} — ${lot.segment_name}</h3>
        <div class="finding warn"><span class="rc">NOT AWARDED</span> ${rk.reason}
        <pre>${rk.quotes} bid(s) received for ${lot.spec} (${fmt(lot.quantity)} ${lot.uom})</pre></div></div>`;
    }
    const w = rk.ranking[0];
    return `<div class="card" style="margin-top:.6rem">
      <h3>Lot ${lot.lot} — ${lot.segment_name}
        <span class="pill seg">awarded: ${rk.recommended}</span>
        <span class="pill">spread ${rk.spread_pct}%</span></h3>
      ${ix.published ? `<p class="note">Market index median ${NGN(ix.median_kobo)}/${lot.uom} ·
         n=${ix.n} · band ±${ix.band_pct}% · ${ix.confidence} confidence.
         Winning bid is ${w.landed_unit_kobo < ix.median_kobo ? "BELOW" : "ABOVE"} index.</p>`
        : `<p class="note">No published index for ${lot.lot} — ${ix.reason || "insufficient observations"}.</p>`}
      <table class="role-table">
        <thead><tr><th>#</th><th>Supplier</th><th>Tier</th><th>Score</th><th>Goods /${lot.uom}</th>
          <th>Landed /${lot.uom}</th><th>Lot total</th><th>vs leader</th></tr></thead>
        <tbody>${rk.ranking.map(q => `<tr${q.rank === 1 ? " style='background:#132018'" : ""}>
          <td><b>${q.rank}</b></td><td>${q.supplier}</td><td>${q.tier}</td><td>${q.score}</td>
          <td>${NGN(q.goods_unit_kobo)}</td><td><b>${NGN(q.landed_unit_kobo)}</b></td>
          <td>${NGN(q.total_kobo)}</td>
          <td>${q.vs_leader_pct > 0 ? "+" : ""}${q.vs_leader_pct}%</td></tr>`).join("")}</tbody>
      </table>
      <details style="margin-top:.5rem"><summary style="cursor:pointer;color:var(--muted);font-size:.85rem">
        Landed-cost decomposition — winning bid</summary>
        <dl class="ship-grid">${w.components.map(c =>
          `<dt>${c.component}</dt><dd>${NGN(c.amount_kobo)}
            <span style="color:var(--muted)">${c.note}</span></dd>`).join("")}</dl></details>
    </div>`;
  }).join("");

  return head + body;
}

/* ---------------- market index ---------------- */
async function loadIndexPicker() {
  const list = await (await fetch("/api/index-segments")).json();
  $("#index-picker").innerHTML = list.segments.map(s =>
    `<button data-seg="${s.code}"><b>${s.name}</b><span>${s.code} · ${s.observations} observations</span></button>`
  ).join("");
  $$("#index-picker button").forEach(b => b.addEventListener("click", () => loadIndex(b.dataset.seg)));
  if (list.segments.length) loadIndex(list.segments[0].code);
}

async function loadIndex(code) {
  $$("#index-picker button").forEach(b => b.classList.toggle("on", b.dataset.seg === code));
  const { index: ix, segment_name, recent } = await (await fetch("/api/index/" + code)).json();

  if (!ix.published) {
    $("#index-detail").innerHTML = `<div class="verdict bad" style="margin-top:.85rem">
      Not published — ${ix.reason}<span class="sub">Required n=${ix.required_n}, have n=${ix.n}.
      Publishing a thin index would destroy the credibility the product depends on.</span></div>`;
    return;
  }
  $("#index-detail").innerHTML = `
    <div class="card" style="margin-top:.85rem">
      <h3>${segment_name} <span class="pill seg">${code}</span>
        <span class="pill">${ix.confidence} confidence</span></div>
      <div class="idx-row">
        <div><span>median landed</span><b>${NGN(ix.median_kobo)}</b></div>
        <div><span>20th–80th band</span><b>${NGN(ix.low_kobo)} – ${NGN(ix.high_kobo)}</b></div>
        <div><span>band width</span><b>±${ix.band_pct}%</b></div>
        <div><span>observations (n)</span><b>${ix.n}</b></div>
        <div><span>excluded</span><b>${ix.excluded}</b></div>
        <div><span>vol-wtd mean</span><b>${NGN(ix.volume_weighted_mean_kobo)}</b></div>
      </div>
      <p class="note" style="margin-top:.7rem">Rolling ${ix.window_days}-day window ·
        methodology v${ix.methodology_version} · related-party and own-inventory movements excluded.</p>
    </div>
    <table class="role-table" style="margin-top:.7rem">
      <thead><tr><th>Date</th><th>Landed /unit</th><th>Qty</th><th>Region</th><th>Related party</th></tr></thead>
      <tbody>${recent.map(o => `<tr><td>${o.observed_at}</td><td>${NGN(o.landed_unit_kobo)}</td>
          <td>${fmt(o.quantity)}</td><td>${o.region}</td>
          <td>${o.is_related_party ? '<span class="pill gate">excluded</span>' : "—"}</td></tr>`).join("")}</tbody>
    </table>`;
}

/* ---------------- insights ---------------- */
async function loadInsights() {
  // limit=0 asks the server for the whole catalogue: the substitution picker
  // needs every SKU, not just the first page.
  const prods = await (await fetch("/api/catalogue?limit=0")).json();
  $("#sub-target").innerHTML = prods.results
    .map(p => `<option value="${p.id}">${p.sku} — ${p.name}</option>`).join("");
  $("#sub-target").onchange = () => loadSubstitutes($("#sub-target").value);
  loadSubstitutes(prods.results[0].id);

  const sc = await (await fetch("/api/scorecards")).json();
  $("#scorecards").innerHTML = `<table class="role-table">
    <thead><tr><th>Supplier</th><th>Tier</th><th>Orders</th><th>On-time</th><th>CoA conform.</th>
      <th>Disputes</th><th>Docs complete</th><th>Score</th><th>Flags</th></tr></thead>
    <tbody>${sc.scorecards.sort((a,b)=>b.score-a.score).map(c => `<tr>
      <td>${c.supplier}</td><td>${c.tier||"—"}</td><td>${c.orders}</td>
      <td>${c.on_time_pct ?? "—"}%</td><td>${c.coa_conformance_pct ?? "—"}%</td>
      <td>${c.dispute_rate_pct ?? "—"}%</td><td>${c.document_completeness_pct ?? "—"}%</td>
      <td><b>${c.score}</b></td>
      <td style="font-size:.78rem;color:var(--warn)">${(c.flags||[]).join("; ") || c.note || "—"}</td>
    </tr>`).join("")}</tbody></table>`;

  const rp = await (await fetch("/api/replenishment")).json();
  $("#replenish").innerHTML = `<table class="role-table">
    <thead><tr><th>Product</th><th>On hand</th><th>Usage/day</th><th>Cover</th>
      <th>Reorder pt</th><th>Action</th><th>Suggested</th><th>Value</th></tr></thead>
    <tbody>${rp.suggestions.map(s => `<tr${s.action !== "ok" ? " style='background:#231713'" : ""}>
      <td>${s.name}<div class="sub" style="font-size:.74rem;color:var(--muted)">${s.sku} · ${s.segment}</div></td>
      <td>${fmt(s.on_hand)}</td><td>${fmt(s.daily_qty)}</td>
      <td>${s.days_of_cover}d</td><td>${fmt(s.reorder_point)}</td>
      <td>${s.action === "ok" ? '<span class="pill">ok</span>' : `<span class="pill dg">${s.action}</span>`}</td>
      <td>${s.suggested_qty ? fmt(s.suggested_qty) + " (" + s.lead_time_days + "d lead)" : "—"}</td>
      <td>${s.suggested_value ? NGN(s.suggested_value) : "—"}</td></tr>`).join("")}</tbody></table>`;

  const dc = await (await fetch("/api/documents/alerts")).json();
  $("#docs").innerHTML = `
    ${dc.blocking ? `<div class="verdict bad">${dc.blocking} expired document(s) — these block shipment</div>` : ""}
    <table class="role-table" style="margin-top:.6rem">
      <thead><tr><th>Product</th><th>Type</th><th>Rev</th><th>Expires</th><th>Days left</th><th>Status</th></tr></thead>
      <tbody>
        ${dc.expired.map(d => `<tr style="background:#231713"><td>${d.product_id}</td><td>${d.doc_type}</td>
          <td>${d.revision}</td><td>${d.expires_at}</td><td><b>${d.days_left}</b></td>
          <td><span class="pill dg">EXPIRED — blocking</span></td></tr>`).join("")}
        ${dc.expiring_soon.map(d => `<tr><td>${d.product_id}</td><td>${d.doc_type}</td>
          <td>${d.revision}</td><td>${d.expires_at}</td><td>${d.days_left}</td>
          <td><span class="pill gate">expires within ${dc.warn_window_days}d</span></td></tr>`).join("")}
      </tbody></table>
    <p class="note" style="margin-top:.6rem">${dc.superseded_revisions} superseded revision(s) retained
      immutably — a shipment references the revision current on its ship date, not the latest.</p>`;

  const an = await (await fetch("/api/analytics")).json();
  const bar = rows => rows.map(r => `<div class="zone"><b>${r.key}</b>
      <div class="bar"><span style="width:${r.share_pct}%"></span></div>
      <span class="rule">${NGN(r.value_kobo)} · ${r.share_pct}% of spend</span></div>`).join("");
  $("#analytics").innerHTML = `
    <p>Total recorded spend <b style="color:var(--accent)">${NGN(an.spend.total_kobo)}</b>
       across ${an.spend.orders} orders.</p>
    <div class="two-col">
      <div><h3 style="font-size:.9rem">By segment</h3>${bar(an.spend.by_segment)}</div>
      <div><h3 style="font-size:.9rem">By supplier</h3>${bar(an.spend.by_supplier)}</div>
    </div>`;
}

async function loadSubstitutes(id) {
  const { target, substitutes, count } = await (await fetch("/api/substitutes/" + id)).json();
  $("#sub-out").innerHTML = `
    <p style="margin-top:.7rem"><b>Target:</b> ${target.name}
      <span class="pill seg">${target.segment}</span>
      <span class="pill">${target.grade || "no grade"}</span>
      ${target.cas ? `<span class="pill">CAS ${target.cas}</span>` : ""}</p>
    ${count ? `<table class="role-table">
        <thead><tr><th>Match</th><th>Product</th><th>Grade</th><th>Purity</th><th>Price</th><th>Why</th></tr></thead>
        <tbody>${substitutes.map(s => `<tr>
          <td><b>${s.score}</b></td>
          <td>${s.product.name}<div class="sub" style="font-size:.74rem;color:var(--muted)">${s.product.supplier_name}</div></td>
          <td>${s.product.grade || "—"}</td><td>${s.product.purity ? s.product.purity + "%" : "—"}</td>
          <td>${NGN(s.product.price * 100)}/${s.product.uom}</td>
          <td style="font-size:.78rem;color:var(--muted)">${s.reasons.join(" · ")}</td></tr>`).join("")}
        </tbody></table>`
      : `<p class="empty-note">No substitute clears the score floor. Withholding a weak suggestion
          is safer than making one.</p>`}`;
}
