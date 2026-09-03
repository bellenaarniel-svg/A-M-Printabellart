/* ===== A&M PrintabelleArt — admin + dashboard ===== */
let SESSION = null;

function initAdmin(){
  SESSION = DB.session();
  $("#admin-btn").onclick = ()=> SESSION ? openDash() : open$("#modal-login");
  $("#login-form").onsubmit = doLogin;
  $("#add-admin-form").onsubmit = addAdmin;
  if (SESSION) $("#admin-btn").title = "Dashboard — " + SESSION.email;
}

function doLogin(e){
  e.preventDefault();
  const email = $("#li-email").value.trim().toLowerCase();
  const pass  = $("#li-pass").value;
  const admin = DB.admins().find(a => a.email.toLowerCase() === email);
  if (!admin || admin.pass !== pass){ $("#li-err").textContent = "Invalid email or password."; return; }
  SESSION = { email: admin.email, role: admin.role };
  DB.set("session", SESSION);
  $("#li-err").textContent = ""; e.target.reset();
  closeAll(); openDash(); toast("Welcome back, " + admin.email.split("@")[0] + "!");
}
function logout(){ localStorage.removeItem("amp_session"); SESSION = null; closeAll(); toast("Signed out"); }

function openDash(){ renderDash(); open$("#modal-dash"); }
function tab(name){
  $$("#modal-dash .tabs button").forEach(b=>b.classList.toggle("on", b.dataset.tab===name));
  $$(".tabpane").forEach(p=>p.style.display = p.id === "tab-"+name ? "block" : "none");
}

function renderDash(){
  if (!SESSION) return;
  const sales = DB.sales(), prods = DB.products(), orders = DB.orders();
  $("#dash-who").innerHTML = `Signed in as <b>${SESSION.email}</b> <span class="badge ${SESSION.role==='owner'?'owner':''}">${SESSION.role}</span>`;

  const total = sales.reduce((s,m)=>s+m.v,0);
  const totalOrders = sales.reduce((s,m)=>s+m.o,0) + orders.length;
  const last = sales[sales.length-1], prev = sales[sales.length-2];
  const growth = prev ? (((last.v - prev.v)/prev.v)*100).toFixed(1) : 0;
  const lowStock = prods.filter(p=>p.stock<=30).length;
  const units = prods.reduce((s,p)=>s+p.stock,0);

  $("#kpis").innerHTML = `
    <div class="kpi"><span>Sales (12 mo)</span><b>${money(total)}</b><i>${growth>=0?"▲":"▼"} ${Math.abs(growth)}% vs last month</i></div>
    <div class="kpi"><span>${last.m} Revenue</span><b>${money(last.v)}</b><i>${last.o} orders</i></div>
    <div class="kpi"><span>Total Orders</span><b>${totalOrders}</b><i>${orders.length} new online</i></div>
    <div class="kpi"><span>Inventory Units</span><b>${units.toLocaleString()}</b><i style="color:${lowStock?'#b3123a':'#0f7a48'}">${lowStock} item(s) low / out</i></div>`;

  const max = Math.max(...sales.map(m=>m.v));
  $("#bars").innerHTML = sales.map(m=>`
    <div class="bar-col" title="${m.m}: ${money(m.v)} · ${m.o} orders">
      <span class="bar-val">${CUR==="PHP" ? "₱"+Math.round(m.v/1000)+"k" : "$"+Math.round(m.v/FX)}</span>
      <div class="bar" style="height:${(m.v/max*100).toFixed(1)}%"></div>
      <small>${m.m}</small>
    </div>`).join("");

  $("#sales-tbl").innerHTML = sales.map((m,i)=>{
    const p = sales[i-1]; const g = p ? ((m.v-p.v)/p.v*100).toFixed(1) : null;
    return `<tr><td><b>${m.m}</b></td><td>${money(m.v)}</td><td>${m.o}</td><td>${money(Math.round(m.v/m.o))}</td>
      <td style="color:${g===null?'#999':(g>=0?'#0f7a48':'#b3123a')}">${g===null?'—':(g>=0?'▲ ':'▼ ')+Math.abs(g)+'%'}</td></tr>`;
  }).join("");

  $("#inv-tbl").innerHTML = prods.map(p=>`
    <tr><td>${p.emoji} <b>${p.name}</b></td><td>${money(p.php)} <small>${p.unit}</small></td>
      <td><input type="number" min="0" value="${p.stock}" onchange="setStock('${p.id}', this.value)"></td>
      <td>${money(p.php*p.stock)}</td><td>${stockPill(p.stock)}</td></tr>`).join("");

  $("#orders-tbl").innerHTML = orders.length ? orders.map(o=>`
    <tr><td><b>${o.ref}</b></td><td>${o.date}</td><td>${o.name}<br><small>${o.email}</small></td>
      <td>${o.items.map(i=>`${i.name} ×${i.qty}`).join("<br>")}</td><td>${money(o.total)}</td>
      <td><span class="badge">${o.status}</span></td></tr>`).join("")
    : `<tr><td colspan="6" style="text-align:center;color:#7c6476;padding:26px">No online orders yet.</td></tr>`;

  $("#admins-tbl").innerHTML = DB.admins().map(a=>`
    <tr><td><b>${a.email}</b></td><td><span class="badge ${a.role==='owner'?'owner':''}">${a.role}</span></td><td>${a.added}</td>
      <td>${a.role==="owner" ? '<small style="color:#7c6476">protected</small>'
        : `<button class="rm" style="background:none;border:0;color:#b3123a;cursor:pointer;font-weight:700" onclick="removeAdmin('${a.email}')">Remove</button>`}</td></tr>`).join("");
}

function setStock(id, val){
  const prods = DB.products(); const p = prods.find(x=>x.id===id);
  p.stock = Math.max(0, parseInt(val||"0",10)); DB.set("products", prods);
  renderProducts(); renderDash(); toast(p.name + " stock updated");
}
function addAdmin(e){
  e.preventDefault();
  const email = $("#aa-email").value.trim().toLowerCase();
  const pass  = $("#aa-pass").value;
  const role  = $("#aa-role").value;
  const admins = DB.admins();
  if (admins.some(a=>a.email.toLowerCase()===email)){ toast("That email is already an admin"); return; }
  admins.push({ email, role, pass, added: new Date().toISOString().slice(0,10) });
  DB.set("admins", admins); e.target.reset(); renderDash(); toast("Admin added: " + email);
}
function removeAdmin(email){
  if (!confirm("Remove admin " + email + "?")) return;
  DB.set("admins", DB.admins().filter(a=>a.email!==email)); renderDash(); toast("Admin removed");
}
function resetDemo(){
  if(!confirm("Reset all demo data (products, sales, orders, admins)?")) return;
  ["products","sales","orders","admins","cart"].forEach(k=>localStorage.removeItem("amp_"+k));
  location.reload();
}
