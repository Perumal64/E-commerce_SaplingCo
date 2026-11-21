let I=[],C=[],pg=1,cf="",qs="",so="rel",mx=0,st=false;const U=S.get();window.demo=false;
const cart=()=>JSON.parse(localStorage.getItem("sapcart")||"{}"),sc=c=>{localStorage.setItem("sapcart",JSON.stringify(c));$("#cc").text(Object.values(c).reduce((a,b)=>a+b,0))};
const cn=id=>(C.find(c=>c.id==id)||{name:"-"}).name,ci=id=>(C.find(c=>c.id==id)||{icon:"🌿"}).icon,hue=id=>100+Math.max(0,C.findIndex(c=>c.id==id))*55;
$("#acct").html(U?`Hi, ${esc(U.name)} ${U.role=="admin"?'<a href="admin.html">Admin</a>':'<a href="#" id="ord">My orders</a>'}<a href="#" id="out">Sign out</a>`:'<a href="login.html">Sign in / Sign up</a>');
$("#out").on("click",e=>{e.preventDefault();Auth.out()});sc(cart());
async function init(){try{if(APP.firebase.apiKey.startsWith("YOUR"))throw new Error("Firebase not configured");[C,I]=await Promise.all([DB.list("categories"),DB.list("inventory")]);if(!C.length||!I.length)throw new Error("No data in Firebase yet")}catch(e){C=SAMPLE.cats;I=SAMPLE.items;window.demo=true;$("#demo").show()}
 C=C.filter(c=>c.active);I=I.filter(i=>i.active&&C.some(c=>c.id==i.catId));
 const top=Math.max(10,...I.map(i=>i.price));mx=top;$("#mx").attr("max",top).val(top);
 $("#sc").html('<option value="">All</option>'+C.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join(""));
 $("#cnav").html(`<a data-c="" class="on">All products</a>`+C.map(c=>`<a data-c="${c.id}">${esc(c.icon)} ${esc(c.name)}</a>`).join(""));
 $("#tiles").html(C.map(c=>`<div class="tile" data-c="${c.id}"><span>${esc(c.icon)}</span>${esc(c.name)}</div>`).join(""));
 const hs=[[C[0],"Bring the outdoors in","Statement plants that thrive indoors."],[C[2],"Pots with personality","Terracotta, ceramic and self-watering planters."],[C[3],"Grow your own","Seeds, bulbs and everything to get started."]].filter(h=>h[0]);
 $("#slider").html(hs.map((h,k)=>`<div class="sl ${k?"":"on"}" style="--h:${hue(h[0].id)}"><h2>${h[1]}</h2><p>${h[2]}</p><button class="btn" data-c="${h[0].id}">Shop ${esc(h[0].name)}</button><span class="big">${esc(h[0].icon)}</span></div>`).join("")+`<div class="dots">${hs.map((_,k)=>`<i class="${k?"":"on"}"></i>`).join("")}</div>`);
 let k=0;clearInterval(window.tm);window.tm=setInterval(()=>{k=(k+1)%hs.length;go(k)},5000);window.go=n=>{$(".sl,.dots i").removeClass("on");$(".sl").eq(n).addClass("on");$(".dots i").eq(n).addClass("on")};$(".dots").on("click","i",e=>{k=$(e.target).index();go(k)});
 draw()}
function setCat(id){cf=id;pg=1;$("#sc").val(id);$("#cnav a").removeClass("on").filter((_,a)=>$(a).data("c")==id).addClass("on");draw();if(id)$("#shop")[0].scrollIntoView({behavior:"smooth"})}
function draw(){let l=I.filter(i=>(!cf||i.catId==cf)&&i.price<=mx&&(!st||i.qty>0)&&qs.split(/\s+/).every(w=>`${i.title} ${i.des} ${cn(i.catId)} ${i.id}`.toLowerCase().includes(w)));
 l.sort({rel:()=>0,pa:(a,b)=>a.price-b.price,pd:(a,b)=>b.price-a.price,az:(a,b)=>a.title.localeCompare(b.title)}[so]);
 $("#fcat").html(`<div class="fc ${cf?"":"on"}" data-c="">All <span>${I.length}</span></div>`+C.map(c=>`<div class="fc ${cf==c.id?"on":""}" data-c="${c.id}">${esc(c.icon)} ${esc(c.name)} <span>${I.filter(i=>i.catId==c.id).length}</span></div>`).join(""));
 $("#mxv").text(money(mx));$("#cnt").text(`${l.length} product${l.length==1?"":"s"}${qs?` for "${qs}"`:""}${cf?" in "+cn(cf):""}`);
 $("#grid").html(slice(l,pg).map(i=>`<article class="card" style="--h:${hue(i.catId)}"><div class="art" data-v="${i.id}">${esc(ci(i.catId))}${i.qty?(i.qty<APP.lowStock?`<span class="badge">Only ${i.qty} left</span>`:""):'<span class="badge out">Sold out</span>'}</div><small>${esc(cn(i.catId))}</small><h3 title="${esc(i.title)}">${esc(i.title)}</h3><p>${esc(i.des)}</p><div class="row"><span class="price">${money(i.price)}</span><div class="step"><button data-s="-1">−</button><input class="qn" value="1" readonly><button data-s="1">+</button></div></div><div class="row"><button class="btn" style="width:100%" data-a="${i.id}" ${i.qty?"":"disabled"}>Add to cart</button></div></article>`).join("")||`<div style="grid-column:1/-1;text-align:center;padding:50px"><div style="font-size:60px">🔍</div><h3>No products found</h3><p>Try a different word or <a href="#" id="clr2">clear the filters</a>.</p></div>`);
 pager($("#pg"),l.length,pg,p=>{pg=p;draw();$("#shop")[0].scrollIntoView()})}
const resetF=()=>{qs="";cf="";st=false;mx=+$("#mx").attr("max");$("#q").val("");$("#st").prop("checked",false);$("#mx").val(mx);setCat("");pg=1;draw()};
$("#clr").on("click",resetF);$(document).on("click","#clr2",e=>{e.preventDefault();resetF()});
$(document).on("click","[data-c]",e=>{if($(e.currentTarget).is("#grid *"))return;setCat(String($(e.currentTarget).data("c")))});
$("#sc").on("change",e=>setCat(e.target.value));$("#so").on("change",e=>{so=e.target.value;pg=1;draw()});$("#st").on("change",e=>{st=e.target.checked;pg=1;draw()});$("#mx").on("input",e=>{mx=+e.target.value;pg=1;draw()});
$("#q").on("input",e=>{qs=e.target.value.trim().toLowerCase();pg=1;draw();const m=qs?I.filter(i=>`${i.title} ${cn(i.catId)}`.toLowerCase().includes(qs)).slice(0,6):[];$("#sug").html(m.map(i=>`<a data-sg="${esc(i.title)}">${esc(ci(i.catId))} ${esc(i.title)} <small>· ${esc(cn(i.catId))}</small></a>`).join("")).toggle(m.length>0)});
$("#sug").on("click","a",e=>{const t=$(e.currentTarget).data("sg");$("#q").val(t);qs=t.toLowerCase();pg=1;draw();$("#sug").hide();$("#shop")[0].scrollIntoView({behavior:"smooth"})});
$(document).on("click",e=>{if(!$(e.target).closest(".sbox").length)$("#sug").hide()});$("#sf").on("submit",e=>{e.preventDefault();$("#sug").hide();$("#shop")[0].scrollIntoView({behavior:"smooth"})});
$("#grid").on("click","[data-s]",e=>{const b=$(e.currentTarget),i=b.siblings("input"),a=b.closest(".card").find("[data-a]").data("a"),max=(I.find(x=>x.id==a)||{}).qty||1;i.val(Math.min(max,Math.max(1,+i.val()+ +b.data("s"))))})
 .on("click","[data-a]",e=>{const i=I.find(x=>x.id==$(e.currentTarget).data("a")),n=parseInt($(e.currentTarget).closest(".card").find(".qn").val()),c=cart();
 if((c[i.id]||0)+n>i.qty)return toast(`Only ${i.qty} available`,1);c[i.id]=(c[i.id]||0)+n;sc(c);toast(`${n} × ${i.title} added to cart`)})
 .on("click",".art",e=>{const i=I.find(x=>x.id==$(e.currentTarget).data("v"));const m=modal(`<div class="art" style="--h:${hue(i.catId)};cursor:default;height:190px;font-size:96px;border-radius:14px;background:linear-gradient(135deg,hsl(${hue(i.catId)} 45% 90%),hsl(${hue(i.catId)} 40% 76%))">${esc(ci(i.catId))}</div><p><small>${esc(cn(i.catId))} · ID ${i.id}</small></p><h2>${esc(i.title)}</h2><p style="margin:8px 0">${esc(i.des)}</p><h2>${money(i.price)}</h2><p>${i.qty?i.qty+" in stock":"Sold out"}</p><div class="row"><button class="btn ghost" data-x>Close</button><button class="btn" id="qa" ${i.qty?"":"disabled"}>Add to cart</button></div>`);
  m.on("click","#qa",()=>{const c=cart();if((c[i.id]||0)+1>i.qty)return toast(`Only ${i.qty} available`,1);c[i.id]=(c[i.id]||0)+1;sc(c);m.remove();toast(i.title+" added to cart")})});
function cartView(){const c=cart(),rows=Object.keys(c).map(id=>({i:I.find(x=>x.id==id),n:c[id]})).filter(r=>r.i),t=rows.reduce((a,r)=>a+r.i.price*r.n,0);
 const m=modal(`<h2>Your cart</h2>${rows.length?`<table>${rows.map(r=>`<tr><td>${esc(r.i.title)}</td><td><input type="number" min="1" max="${r.i.qty}" value="${r.n}" data-q="${r.i.id}" style="width:70px"></td><td>${money(r.i.price*r.n)}</td><td><button class="btn sm red" data-r="${r.i.id}">✕</button></td></tr>`).join("")}</table><h3 style="margin:12px 0">Total ${money(t)}</h3>
 <label>Payment<select id="pay"><option value="cash">Cash (pay on delivery)</option><option value="credit">Store credit</option></select></label><p class="err" id="ce"></p><div class="row"><button class="btn ghost" data-x>Keep shopping</button><button class="btn" id="place">Place order</button></div>`:"<p>Your cart is empty.</p>"}`);
 m.on("change","[data-q]",e=>{const c=cart(),i=I.find(x=>x.id==e.target.dataset.q),n=parseInt(e.target.value);c[i.id]=n>=1?Math.min(n,i.qty):1;sc(c);m.remove();cartView()})
  .on("click","[data-r]",e=>{const c=cart();delete c[$(e.currentTarget).data("r")];sc(c);m.remove();cartView()})
  .on("click","#place",()=>place(m))}
async function place(m){if(window.demo)return $("#ce").text("Demo catalogue — connect Firebase in js/config.js to place orders.");if(!U)return location.href="login.html?next=index.html";if(U.role=="admin")return $("#ce").text("Admin accounts can't place orders.");
 const pay=$("#pay").val(),c=cart();$("#place").prop("disabled",1);
 try{const items=[];for(const id in c){const f=await DB.get("inventory",id);if(!f.active||f.qty<c[id])throw new Error(`${f.title}: only ${f.active?f.qty:0} left`);items.push({id,title:f.title,catId:f.catId,cat:cn(f.catId),qty:c[id],price:f.price,left:f.qty})}
  const total=items.reduce((a,x)=>a+x.qty*x.price,0),cu=await DB.get("customers",U.uid);
  if(pay=="credit"&&cu.creditUsed+total>cu.creditLimit)throw new Error(`Credit limit ${money(cu.creditLimit)}; available ${money(cu.creditLimit-cu.creditUsed)}`);
  const o={billNo:uid("SC"),custId:U.uid,custName:cu.name,custEmail:cu.email,items:items.map(({left,...x})=>x),total,payType:pay,date:new Date().toISOString(),status:"Placed"};
  await DB.add("orders",o);for(const x of items)await DB.set("inventory",x.id,{qty:x.left-x.qty});
  if(pay=="credit")await DB.set("customers",U.uid,{creditUsed:cu.creditUsed+total});
  sc({});m.remove();bill(o);mail(o.custEmail,"Your Sapling & Co. bill "+o.billNo,billHtml(o)).then(s=>toast(s?"Bill emailed to "+o.custEmail:"Order placed (email not configured)"));init()
 }catch(x){$("#ce").text(x.message);$("#place").prop("disabled",0)}}
const billHtml=o=>`<h2>Sapling &amp; Co. — Bill ${o.billNo}</h2><p>${fd(o.date)}<br>${esc(o.custName)} (${esc(o.custEmail)})<br>Payment: ${o.payType}</p><table border="1" cellpadding="6" style="border-collapse:collapse"><tr><th>Item</th><th>Qty</th><th>Price</th><th>Amount</th></tr>${o.items.map(i=>`<tr><td>${esc(i.title)}</td><td>${i.qty}</td><td>${money(i.price)}</td><td>${money(i.qty*i.price)}</td></tr>`).join("")}</table><h3>Total ${money(o.total)}</h3>`;
const bill=o=>modal(billHtml(o)+`<div class="row"><button class="btn ghost" data-x>Close</button><button class="btn" onclick="print()">Print</button></div>`);
$("#cartBtn").on("click",cartView);
$("#acct").on("click","#ord",async e=>{e.preventDefault();try{const os=(await DB.q("orders","custId",U.uid)).sort((a,b)=>b.date.localeCompare(a.date)),cu=await DB.get("customers",U.uid);
 const m=modal(`<h2>Order history</h2><p>Credit limit ${money(cu.creditLimit)} · used ${money(cu.creditUsed)} · available ${money(cu.creditLimit-cu.creditUsed)}</p>${os.length?`<table>${os.map((o,k)=>`<tr><td>${o.billNo}<br><small>${fd(o.date)}</small></td><td>${o.payType}</td><td>${money(o.total)}</td><td><button class="btn sm" data-b="${k}">Bill</button></td></tr>`).join("")}</table>`:"<p>No orders yet.</p>"}<div class="row"><button class="btn ghost" data-x>Close</button></div>`);
 m.on("click","[data-b]",x=>bill(os[$(x.currentTarget).data("b")]))}catch(x){toast(x.message,1)}});
init();
