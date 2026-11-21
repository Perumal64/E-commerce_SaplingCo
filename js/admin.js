if (!Auth.guard("admin")) throw 0;
let D = { cats: [], items: [], custs: [], orders: [] }, tab = "dash", pg = 1, F = { c: "", s: "", a: "" };
const cn = id => (D.cats.find(c => c.id == id) || { name: "(deleted)" }).name;
async function load() { [D.cats, D.items, D.custs, D.orders] = await Promise.all(["categories", "inventory", "customers", "orders"].map(c => DB.list(c))) }
async function go(t) { tab = t; pg = 1; $(".side button").removeClass("on").filter(`[data-t=${t}]`).addClass("on"); try { await load() } catch (e) { toast(e.message, 1) } ({ dash, inv, cat, cus, rep })[t]() }
$(".side").on("click", "[data-t]", e => go(e.currentTarget.dataset.t)); $("#out").on("click", Auth.out);
const tbl = (h, r) => `<div class="tw"><table><tr>${h.map(x => `<th>${x}</th>`).join("")}</tr>${r.map(x => `<tr>${x.map(c => `<td>${c}</td>`).join("")}</tr>`).join("") || `<tr><td colspan="${h.length}">No records.</td></tr>`}</table></div>`;
// generic add/edit form
function form(t, fs, v, save) {
  const m = modal(`<h2>${t}</h2><form>${fs.map(f => `<label>${f.l}${f.t == "select" ? `<select name="${f.k}">${f.o.map(o => `<option value="${o[0]}">${esc(o[1])}</option>`).join("")}</select>` : `<input name="${f.k}" type="${f.t || "text"}" step="any" ${f.ro ? "readonly" : ""}>`}</label>`).join("")}<p class="err"></p><div class="row"><button type="button" class="btn ghost" data-x>Cancel</button><button class="btn">Save</button></div></form>`);
  fs.forEach(f => m.find(`[name=${f.k}]`).val(v[f.k] ?? ""));
  m.find("form").on("submit", async e => {
    e.preventDefault(); const o = {}; fs.forEach(f => { let x = m.find(`[name=${f.k}]`).val().trim(); o[f.k] = f.t == "number" ? (x === "" ? NaN : Number(x)) : x });
    const er = fs.map(f => f.t == "number" ? (Number.isFinite(o[f.k]) && o[f.k] >= (f.min ?? 0) ? "" : f.l + " must be a number ≥ " + (f.min ?? 0)) : (o[f.k] || f.opt ? "" : f.l + " is required")).find(Boolean) || (fs.find(f => f.chk && f.chk(o)) || {}).msg || "";
    if (er) return m.find(".err").text(er); try { await save(o); m.remove(); toast("Saved"); go(tab) } catch (x) { m.find(".err").text(x.message) }
  })
}
const act = (id, a) => `<button class="btn sm" data-e="${id}">Edit</button> <button class="btn sm ghost" data-t="${id}">${a ? "Deactivate" : "Activate"}</button> <button class="btn sm red" data-d="${id}">Delete</button>`;
// ---------- Dashboard
function dash() {
  const sales = D.orders.reduce((a, o) => a + o.total, 0), due = D.custs.reduce((a, c) => a + c.creditUsed, 0);
  $("#main").html(`<h1>Dashboard</h1><div class="stats">${[["Items", D.items.length], ["Low stock (&lt;" + APP.lowStock + ")", D.items.filter(i => i.qty < APP.lowStock).length], ["Customers", D.custs.length], ["Orders", D.orders.length], ["Sales", money(sales)], ["Credit outstanding", money(due)]].map(s => `<div class="stat">${s[0]}<b>${s[1]}</b></div>`).join("")}</div>
 ${D.cats.length ? "" : '<button class="btn" id="seed">Load sample nursery data</button>'}`);
  $("#seed").on("click", async () => {
    const cs = [["🪴", "Indoor Plants"], ["🌵", "Succulents & Cacti"], ["🏺", "Planters & Pots"], ["🌱", "Seeds & Bulbs"], ["✂️", "Garden Tools"], ["🧪", "Soil & Plant Care"]], ids = [];
    for (const [c, n] of cs) { const id = uid("CAT"); ids.push(id); await DB.add("categories", { name: n, icon: c, active: true }, id) }
    const P = [[0, "Monstera Deliciosa", "Split-leaf statement plant for bright, indirect light", 24, 899], [0, "Snake Plant", "Nearly unkillable air-purifying classic", 40, 449], [0, "Golden Pothos", "Trailing vine, thrives in low light", 120, 199], [0, "Peace Lily", "Glossy leaves and white blooms", 12, 549], [0, "ZZ Plant", "Drought-proof and glossy", 9, 799],
    [1, "Echeveria Rosette", "Pastel rosette succulent", 150, 129], [1, "Zebra Haworthia", "Tiny striped succulent for desks", 85, 149], [1, "Jade Plant", "The good-luck succulent", 30, 299], [1, "Bunny Ear Cactus", "Soft pads, sharp personality", 22, 249],
    [2, "Terracotta Pot 6in", "Breathable classic with drainage hole", 200, 99], [2, "Speckle Ceramic Planter", "Matte glaze, saucer included", 35, 349], [2, "Macramé Hanger", "Cotton rope hanging planter", 48, 279], [2, "Self-watering Pot", "2-day water reservoir", 14, 399],
    [3, "Basil Seed Pack", "Sweet basil, 100 seeds", 300, 49], [3, "Marigold Seeds", "Bright orange blooms, 50 seeds", 250, 39], [3, "Lily Bulbs (5)", "Oriental lily, fragrant", 10, 249],
    [4, "Pruning Shears", "Stainless bypass blades", 26, 429], [4, "Hand Trowel", "Ergonomic grip", 40, 199], [4, "Mist Spray Bottle", "500 ml fine mist", 75, 149],
    [5, "Coco Peat Block 5kg", "Expands to 25 L", 90, 179], [5, "Vermicompost 2kg", "Rich organic fertiliser", 130, 129], [5, "Neem Oil Spray", "Natural pest control", 17, 249], [5, "Cactus Mix 1kg", "Fast-draining potting mix", 8, 159]];
    for (const [c, t, d, q, p] of P) await DB.add("inventory", { catId: ids[c], title: t, des: d, qty: q, price: p, active: true }, uid("ITM")); toast("Sample data loaded"); go("dash")
  })
}
// ---------- Inventory (CRUD + pagination + filters + activate/confirm delete)
function inv() {
  const l = D.items.filter(i => (!F.c || i.catId == F.c) && (!F.a || (F.a == "1") == i.active) && `${i.id} ${i.title}`.toLowerCase().includes(F.s.toLowerCase()));
  $("#main").html(`<h1>Inventory</h1><div class="tools"><button class="btn" id="add">+ Add item</button><select id="fc"><option value="">All categories</option>${D.cats.map(c => `<option value="${c.id}" ${F.c == c.id ? "selected" : ""}>${esc(c.name)}</option>`).join("")}</select><select id="fa"><option value="">Any status</option><option value="1" ${F.a == "1" ? "selected" : ""}>Active</option><option value="0" ${F.a == "0" ? "selected" : ""}>Inactive</option></select><input id="fs" placeholder="Find by ID or title" value="${esc(F.s)}"></div>
 ${tbl(["ID", "Title", "Category", "Qty", "Price", "Status", "Actions"], slice(l, pg).map(i => [i.id, `<b>${esc(i.title)}</b><br><small>${esc(i.des)}</small>`, esc(cn(i.catId)), i.qty, money(i.price), i.active ? "Active" : "Inactive", act(i.id, i.active)]))}<div class="pg" id="pg"></div>`);
  pager($("#pg"), l.length, pg, p => { pg = p; inv() });
  $("#fc,#fa").on("change", e => { F[e.target.id[1]] = e.target.value; pg = 1; inv() }); $("#fs").on("change", e => { F.s = e.target.value; pg = 1; inv() });
  const fs = (edit) => [...(edit ? [{ k: "id", l: "ID", ro: 1 }] : []), { k: "catId", l: "Category", t: "select", o: D.cats.map(c => [c.id, c.name]) }, { k: "title", l: "Title", chk: o => o.title.length < 2, msg: "Title is too short" }, { k: "des", l: "Description" }, { k: "qty", l: "Quantity", t: "number", chk: o => !Number.isInteger(o.qty), msg: "Quantity must be a whole number" }, { k: "price", l: "Price", t: "number", min: 1 }];
  $("#add").on("click", () => D.cats.length ? form("Add item", fs(0), {}, o => DB.add("inventory", { ...o, active: true }, uid("ITM"))) : toast("Add a category first", 1));
  $("#main").off("click").on("click", "[data-e]", e => { const i = D.items.find(x => x.id == $(e.currentTarget).data("e")); form("Edit item", fs(1), i, o => { const { id, ...r } = o; return DB.set("inventory", id, r) }) })
    .on("click", "[data-t]", async e => { const i = D.items.find(x => x.id == $(e.currentTarget).data("t")); await DB.set("inventory", i.id, { active: !i.active }); go("inv") })
    .on("click", "[data-d]", async e => { if (await ask("Delete this item permanently?")) { await DB.del("inventory", $(e.currentTarget).data("d")); toast("Deleted"); go("inv") } })
}
// ---------- Categories
function cat() {
  $("#main").html(`<h1>Categories</h1><div class="tools"><button class="btn" id="add">+ Add category</button></div>${tbl(["ID", "Icon", "Name", "Items", "Status", "Actions"], D.cats.map(c => [c.id, esc(c.icon), esc(c.name), D.items.filter(i => i.catId == c.id).length, c.active ? "Active" : "Inactive", act(c.id, c.active)]))}`);
  const fs = [{ k: "icon", l: "Icon (emoji)" }, { k: "name", l: "Name" }];
  $("#add").on("click", () => form("Add category", fs, { icon: "🌿" }, o => DB.add("categories", { ...o, active: true }, uid("CAT"))));
  $("#main").off("click").on("click", "[data-e]", e => { const c = D.cats.find(x => x.id == $(e.currentTarget).data("e")); form("Edit category", fs, c, o => DB.set("categories", c.id, o)) })
    .on("click", "[data-t]", async e => { const c = D.cats.find(x => x.id == $(e.currentTarget).data("t")); await DB.set("categories", c.id, { active: !c.active }); go("cat") })
    .on("click", "[data-d]", async e => { const id = $(e.currentTarget).data("d"); if (D.items.some(i => i.catId == id)) return toast("Move or delete this category's items first", 1); if (await ask("Delete this category?")) { await DB.del("categories", id); go("cat") } })
}
// ---------- Customers (credit limit CRUD)
function cus() {
  const l = D.custs; $("#main").html(`<h1>Customers</h1><div class="tools"><button class="btn" id="add">+ Add customer</button></div>${tbl(["ID", "Name", "Email", "Mobile", "Credit limit", "Credit used", "Actions"], slice(l, pg).map(c => [c.id.slice(0, 8), esc(c.name), esc(c.email), esc(c.mob), money(c.creditLimit), money(c.creditUsed), `<button class="btn sm" data-e="${c.id}">Edit</button> <button class="btn sm red" data-d="${c.id}">Delete</button>`]))}<div class="pg" id="pg"></div>`);
  pager($("#pg"), l.length, pg, p => { pg = p; cus() });
  const fs = [{ k: "name", l: "Name" }, { k: "mob", l: "Mobile", chk: o => !V.mob(o.mob), msg: "Mobile must be 10 digits" }, { k: "creditLimit", l: "Credit limit", t: "number" }, { k: "creditUsed", l: "Credit used (set lower when customer pays)", t: "number" }];
  $("#add").on("click", () => form("Add customer", [{ k: "email", l: "Email", chk: o => !V.email(o.email), msg: "Invalid email" }, ...fs], { creditLimit: APP.defaultCredit, creditUsed: 0 }, async o => { const tmp = "Tmp" + Math.random().toString(36).slice(2) + "9"; const r = await Auth.up(o.email, tmp); await DB.add("customers", { ...o, createdAt: new Date().toISOString() }, r.localId); await Auth.reset(o.email) }));
  $("#main").off("click").on("click", "[data-e]", e => { const c = D.custs.find(x => x.id == $(e.currentTarget).data("e")); form("Edit customer", fs, c, o => DB.set("customers", c.id, o)) })
    .on("click", "[data-d]", async e => { if (await ask("Delete this customer record?")) { await DB.del("customers", $(e.currentTarget).data("d")); go("cus") } })
}
// ---------- Reports
const inR = (o, f, t) => (!f || new Date(o.date) >= new Date(f)) && (!t || new Date(o.date) <= new Date(t + "T23:59:59"));
const ord = (f, t, p) => D.orders.filter(o => inR(o, f, t) && (!p || o.payType == p)).sort((a, b) => b.date.localeCompare(a.date));
const oc = ["Bill", "Date", "Customer", "Items", "Payment", "Total"], orow = o => [o.billNo, fd(o.date), o.custName, o.items.map(i => i.title + " ×" + i.qty).join(", "), o.payType, o.total];
const stk = a => ({ c: ["ID", "Item", "Category", "Qty", "Price", "Status"], r: a.map(i => [i.id, i.title, cn(i.catId), i.qty, i.price, i.active ? "Active" : "Inactive"]) });
const sold = (f, t) => { const m = {}; D.items.forEach(i => m[i.id] = [i.title, cn(i.catId), 0, 0]); ord(f, t).forEach(o => o.items.forEach(x => { m[x.id] = m[x.id] || [x.title, x.cat, 0, 0]; m[x.id][2] += x.qty; m[x.id][3] += x.qty * x.price })); return Object.values(m) };
const R = [
  { g: "Customer", n: "All customers (all columns)", run: () => ({ c: ["ID", "Name", "Email", "Mobile", "Credit limit", "Credit used", "Joined"], r: D.custs.map(c => [c.id, c.name, c.email, c.mob, c.creditLimit, c.creditUsed, fd(c.createdAt)]) }) },
  { g: "Customer", n: "Top 10 customers", d: 1, run: (f, t) => { const m = {}; ord(f, t).forEach(o => { const x = m[o.custId] = m[o.custId] || [o.custName, o.custEmail, 0, 0]; x[2]++; x[3] += o.total }); return { c: ["Customer", "Email", "Orders", "Total spent"], r: Object.values(m).sort((a, b) => b[3] - a[3]).slice(0, 10) } } },
  { g: "Customer", n: "Cash purchase report", d: 1, run: (f, t) => ({ c: oc, r: ord(f, t, "cash").map(orow) }) },
  { g: "Customer", n: "Credit purchase report", d: 1, run: (f, t) => ({ c: oc, r: ord(f, t, "credit").map(orow) }) },
  { g: "Inventory", n: "Current stock — all", run: () => stk(D.items) },
  { g: "Inventory", n: "Current stock — category wise", run: () => stk([...D.items].sort((a, b) => cn(a.catId).localeCompare(cn(b.catId)))) },
  { g: "Inventory", n: `High stock (> ${APP.highStock} units)`, run: () => stk(D.items.filter(i => i.qty > APP.highStock)) },
  { g: "Inventory", n: `Low stock (< ${APP.lowStock} units)`, run: () => stk(D.items.filter(i => i.qty < APP.lowStock)) },
  { g: "Sales", n: "All sales", d: 1, run: (f, t) => ({ c: oc, r: ord(f, t).map(orow) }) },
  { g: "Sales", n: "Category wise", d: 1, run: (f, t) => { const m = {}; sold(f, t).forEach(x => { m[x[1]] = m[x[1]] || [x[1], 0, 0]; m[x[1]][1] += x[2]; m[x[1]][2] += x[3] }); return { c: ["Category", "Units sold", "Revenue"], r: Object.values(m).sort((a, b) => b[2] - a[2]) } } },
  { g: "Sales", n: "Cash wise", d: 1, run: (f, t) => ({ c: oc, r: ord(f, t, "cash").map(orow) }) },
  { g: "Sales", n: "Credit wise", d: 1, run: (f, t) => ({ c: oc, r: ord(f, t, "credit").map(orow) }) },
  { g: "Sales", n: "Top 10 selling items", d: 1, run: (f, t) => ({ c: ["Item", "Category", "Units sold", "Revenue"], r: sold(f, t).sort((a, b) => b[2] - a[2]).slice(0, 10) }) },
  { g: "Sales", n: "Bottom 10 selling items", d: 1, run: (f, t) => ({ c: ["Item", "Category", "Units sold", "Revenue"], r: sold(f, t).sort((a, b) => a[2] - b[2]).slice(0, 10) }) }];
let cur = 0, out = null;
function rep() {
  const gs = [...new Set(R.map(r => r.g))]; $("#main").html(`<h1>Reports</h1><div class="rep"><div>${gs.map(g => `<h4>${g}</h4>` + R.map((r, i) => r.g == g ? `<a data-r="${i}" class="${i == cur ? "on" : ""}">${r.n}</a>` : "").join("")).join("")}</div><div><div class="tools"><span id="dr" ${R[cur].d ? "" : 'hidden'}>From <input type="date" id="rf"> To <input type="date" id="rt"></span><button class="btn" id="run">Run report</button><button class="btn ghost" id="csv">Export CSV</button><button class="btn ghost" onclick="print()">Print</button></div><h3>${R[cur].n}</h3><div id="res"></div></div></div>`);
  $("#main").off("click").on("click", "[data-r]", e => { cur = +$(e.currentTarget).data("r"); rep() });
  $("#run").on("click", () => {
    const f = $("#rf").val(), t = $("#rt").val(); if (f && t && f > t) return toast("From date is after To date", 1); out = R[cur].run(f, t);
    $("#res").html(tbl(out.c, out.r.map(r => r.map((v, k) => typeof v == "number" && /total|spent|price|revenue|limit|used/i.test(out.c[k]) ? money(v) : esc(v)))) + `<p>${out.r.length} row(s)</p>`)
  });
  $("#csv").on("click", () => { if (!out) return toast("Run the report first", 1); const q = v => '"' + String(v ?? "").replace(/"/g, '""') + '"'; const b = new Blob([[out.c, ...out.r].map(r => r.map(q).join(",")).join("\n")], { type: "text/csv" }); $("<a>", { href: URL.createObjectURL(b), download: R[cur].n.replace(/\W+/g, "_") + ".csv" })[0].click() });
  out = null; $("#run").click()
}
go("dash");
