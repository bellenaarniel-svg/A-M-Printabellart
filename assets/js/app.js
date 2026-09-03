/* ===== A&M PrintabelleArt — app ===== */
let CUR = localStorage.getItem("amp_cur") || "PHP";
let CART = DB.get("cart", []);
let PRODUCTS = DB.products();

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

function money(php){
  if (CUR === "PHP") return "₱" + php.toLocaleString("en-PH", {minimumFractionDigits:0, maximumFractionDigits:2});
  return "$" + (php / FX).toLocaleString("en-US", {minimumFractionDigits:2, maximumFractionDigits:2});
}
function toast(msg){
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(window._tt); window._tt = setTimeout(()=>t.classList.remove("show"), 2200);
}

/* ---------- products ---------- */
function stockPill(s){
  if (s <= 0)  return '<span class="stock-pill out">Out of stock</span>';
  if (s <= 30) return `<span class="stock-pill low">Low stock · ${s} left</span>`;
  return `<span class="stock-pill in">In stock · ${s} left</span>`;
}
function renderProducts(){
  PRODUCTS = DB.products();
  $("#products-grid").innerHTML = PRODUCTS.map(p => `
    <article class="card">
      <div class="card-top">${p.emoji}</div>
      <div class="card-body">
        ${stockPill(p.stock)}
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="price" data-php="${p.php}">${money(p.php)} <small>${p.unit}</small></div>
        <div class="qty">
          <label for="q-${p.id}">Qty</label>
          <input id="q-${p.id}" type="number" min="1" max="${Math.max(p.stock,1)}" value="1" ${p.stock<=0?"disabled":""}>
          <button class="btn btn-primary" style="padding:10px 18px;font-size:.85rem;margin-left:auto"
                  onclick="addToCart('${p.id}')" ${p.stock<=0?"disabled":""}>Add to order</button>
        </div>
      </div>
    </article>`).join("");
}

/* ---------- cart ---------- */
function addToCart(id){
  const p = PRODUCTS.find(x=>x.id===id);
  const qty = Math.max(1, parseInt($("#q-"+id).value || "1", 10));
  if (qty > p.stock){ toast("Only " + p.stock + " left in stock"); return; }
  const line = CART.find(l=>l.id===id);
  if (line) line.qty += qty; else CART.push({id, qty});
  saveCart(); toast(`${qty} × ${p.name} added`);
}
function saveCart(){ DB.set("cart", CART); renderCart(); }
function removeLine(id){ CART = CART.filter(l=>l.id!==id); saveCart(); }
function cartTotal(){ return CART.reduce((s,l)=> s + (PRODUCTS.find(p=>p.id===l.id)?.php||0)*l.qty, 0); }
function renderCart(){
  const n = CART.reduce((s,l)=>s+l.qty,0);
  $("#cart-count").textContent = n; $("#cart-count").style.display = n ? "grid" : "none";
  $("#cart-body").innerHTML = CART.length ? CART.map(l=>{
    const p = PRODUCTS.find(x=>x.id===l.id);
    return `<div class="line"><span style="font-size:1.6rem">${p.emoji}</span>
      <div><b>${p.name}</b><br><small>${l.qty} × ${money(p.php)} = <strong>${money(p.php*l.qty)}</strong></small></div>
      <button class="rm" onclick="removeLine('${l.id}')">✕</button></div>`;
  }).join("") : '<div class="empty">Your order is empty.<br>Browse our services to get started 💗</div>';
  $("#cart-total").textContent = money(cartTotal());
}

/* ---------- checkout ---------- */
function placeOrder(e){
  e.preventDefault();
  if (!CART.length){ toast("Your order is empty"); return; }
  const f = new FormData(e.target);
  const order = {
    ref: "AMP-" + Date.now().toString().slice(-6),
    name: f.get("name"), email: f.get("email"), phone: f.get("phone"),
    method: f.get("method"), address: f.get("address") || "N/A", notes: f.get("notes") || "",
    items: CART.map(l=>({...l, name: PRODUCTS.find(p=>p.id===l.id).name, php: PRODUCTS.find(p=>p.id===l.id).php})),
    total: cartTotal(), date: new Date().toISOString().slice(0,10), status: "Pending"
  };
  // deduct stock
  const prods = DB.products();
  order.items.forEach(i => { const p = prods.find(x=>x.id===i.id); if(p) p.stock = Math.max(0, p.stock - i.qty); });
  DB.set("products", prods);
  const orders = DB.orders(); orders.unshift(order); DB.set("orders", orders);

  CART = []; saveCart(); renderProducts();
  closeAll();
  const body = encodeURIComponent(
    `Order Ref: ${order.ref}\nName: ${order.name}\nEmail: ${order.email}\nPhone: ${order.phone}\nCollection: ${order.method}\nAddress: ${order.address}\n\n` +
    order.items.map(i=>`• ${i.name} × ${i.qty} — ${money(i.php*i.qty)}`).join("\n") +
    `\n\nTOTAL: ${money(order.total)}\nNotes: ${order.notes}`);
  $("#done-ref").textContent = order.ref;
  $("#done-mail").href = `mailto:amprintabellart@gmail.com?subject=New Order ${order.ref} — A%26M PrintabelleArt&body=${body}`;
  open$("#modal-done");
}

/* ---------- modals ---------- */
function open$(sel){ $(sel).classList.add("open"); $("#overlay").classList.add("open"); }
function closeAll(){ $$(".modal,.drawer").forEach(m=>m.classList.remove("open")); $("#overlay").classList.remove("open"); }
function openCart(){ renderCart(); $("#cart").classList.add("open"); $("#overlay").classList.add("open"); }

/* ---------- currency ---------- */
function setCur(c){
  CUR = c; localStorage.setItem("amp_cur", c);
  $$(".cur-toggle button").forEach(b=>b.classList.toggle("on", b.dataset.cur===c));
  renderProducts(); renderCart(); if (typeof renderDash === "function" && DB.session()) renderDash();
}

/* ---------- init ---------- */
document.addEventListener("DOMContentLoaded", ()=>{
  renderProducts(); renderCart();
  $$(".cur-toggle button").forEach(b=>{ b.classList.toggle("on", b.dataset.cur===CUR); b.onclick = ()=>setCur(b.dataset.cur); });
  $("#overlay").onclick = closeAll;
  $("#burger").onclick = ()=> $("#navlinks").classList.toggle("open");
  $$("#navlinks a").forEach(a=>a.onclick = ()=> $("#navlinks").classList.remove("open"));
  document.addEventListener("keydown", e=>{ if(e.key==="Escape") closeAll(); });
  initAdmin();
});
