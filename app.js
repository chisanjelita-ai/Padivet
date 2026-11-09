// ===== SPLASH REMOVAL =====
setTimeout(function(){
  var s = document.getElementById('splash');
  if(s){
    s.classList.add('hide');
    setTimeout(function(){ if(s && s.parentNode) s.parentNode.removeChild(s); }, 600);
  }
}, 2600);

// ===== STATE =====
var $=function(id){return document.getElementById(id);};
var CUR=DATA[0];
var FILTER="All";

// ===== HELPERS =====
function fmt(n){return "₦"+Number(n).toLocaleString('en-NG');}

function show(id){
  document.querySelectorAll('.s').forEach(function(s){s.classList.remove('on');});
  var el=$(id); if(el) el.classList.add('on');
  document.querySelectorAll('.ni').forEach(function(n){n.classList.toggle('active',n.dataset.t===id);});
  window.scrollTo(0,0);
}

function toast(m){var t=$('toast');t.textContent=m;t.classList.add('on');setTimeout(function(){t.classList.remove('on');},2000);}

function pill(on){
  return on
    ? '<div class="pill on"><span class="dot g"></span>Online</div>'
    : '<div class="pill off"><span class="dot b"></span>Last seen 12 min ago</div>';
}

// ===== PRICING LABELS =====
function priceLine(p){
  if(p.kind==='vet'){
    return '<div class="plabel">Consultation fee</div><div class="pamt vet">'+fmt(p.price)+'</div>';
  }
  var tag=p.tag==='Feeds'?'Feed price':p.tag==='Vaccines'?'Vaccine price':p.tag==='Breeders'?'Breeding price':p.tag==='Groomers'?'Grooming price':'Price';
  return '<div class="plabel">'+tag+'</div><div class="pamt goods">From '+fmt(p.price)+'</div>';
}

// ===== CARD =====
function card(p){
  return '<div class="card" onclick="openProfile(\''+p.n+'\')">'+
    '<div class="row"><div class="av">'+p.n[0]+'</div><div style="flex:1">'+
    '<div class="pn">'+p.n+'</div>'+
    '<div class="mt">'+p.t+' • '+p.r+' ★ ('+p.c+')</div>'+
    pill(p.on)+'</div></div>'+
    priceLine(p)+
    '<div class="pmeta">'+p.d+' km away</div></div>';
}

function empty(m){return '<div class="empty"><b>'+m+'</b>Try another category or ask Padi.</div>';}

// ===== HOME =====
function renderHome(){
  var online=DATA.filter(function(p){return p.on;});
  $('homeOnline').innerHTML=online.length?online.map(card).join(''):empty('No one online right now');
  $('homeNear').innerHTML=DATA.slice().sort(function(a,b){return a.d-b.d;}).slice(0,3).map(card).join('');
}

// ===== RESULTS =====
function openResults(cat){
  $('resTitle').textContent=cat==='All'?'All providers':cat;
  var list=(cat==='All'?DATA:DATA.filter(function(p){return p.tag===cat;})).slice().sort(function(a,b){return (b.on-a.on)||(b.r-a.r);});
  $('resList').innerHTML=list.length?list.map(card).join(''):empty('No providers in '+cat+' yet');
  show('results');
}

// ===== BROWSE =====
function setFilter(cat){
  FILTER=cat;
  document.querySelectorAll('.fc').forEach(function(c){c.classList.toggle('on',c.dataset.cat===cat);});
  renderBrowse();
}

function renderBrowse(){
  var items=[];
  DATA.forEach(function(p){
    (p.listings||[]).forEach(function(l){items.push({provider:p,listing:l});});
  });
  if(FILTER!=='All'){
    items=items.filter(function(it){return it.provider.tag===FILTER;});
  }
  items.sort(function(a,b){
    var aS=a.listing.stock==='in'?1:0, bS=b.listing.stock==='in'?1:0;
    if(aS!==bS) return bS-aS;
    if(a.provider.on!==b.provider.on) return (b.provider.on?1:0)-(a.provider.on?1:0);
    return b.provider.r-a.provider.r;
  });
  if(!items.length){$('browseList').innerHTML=empty('No listings in this category yet');return;}
  $('browseList').innerHTML=items.map(function(it){
    var p=it.provider, l=it.listing;
    var typeLabel=p.kind==='vet'?'Vet service':p.tag==='Feeds'?'Feed':p.tag==='Vaccines'?'Vaccine':p.tag==='Breeders'?'Breeding':p.tag==='Groomers'?'Grooming':'Product';
    return '<div class="lc" onclick="openProfile(\''+p.n+'\')">'+
      '<div class="lh"><div><div class="ln">'+l.name+'</div><div class="lt">'+typeLabel+'</div></div>'+
      '<div class="lp2">'+fmt(l.p)+'</div></div>'+
      '<div class="ls"><div class="sa">'+p.n[0]+'</div><div style="flex:1">'+
      '<div class="sn">'+p.n+'</div>'+
      '<div class="sm">'+p.r+' ★ • '+p.d+' km'+(p.on?' • Online':' • 12m ago')+'</div>'+
      '</div></div></div>';
  }).join('');
}

// ===== PROFILE =====
function openProfile(name){
  var p=name?DATA.find(function(x){return x.n===name;}):CUR;
  CUR=p||DATA[0];
  $('profAv').textContent=CUR.n[0];
  $('profName').textContent=CUR.n;
  $('profType').textContent=CUR.t+' • Enugu';
  $('profStars').textContent=CUR.r+' ★ ('+CUR.c+' reviews)';
  $('profStatus').textContent=CUR.on?'🟢 Online':'⚫ Last seen 12 min ago';
  $('profDist').textContent=CUR.d+' km away';
  $('profAcct').textContent=CUR.acct;
  $('profChatBtn').textContent=CUR.on?'Chat now':'Send message';
  $('chatName').textContent=CUR.n;
  $('chatStatus').textContent=CUR.on?'🟢 Online':'⚫ Last seen 12 min ago';

  if(CUR.kind==='vet'){
    $('profPriceBlock').innerHTML='<div class="pb"><div class="plabel">Consultation fee</div><div class="pamt vet">'+fmt(CUR.price)+'</div><div style="font-size:11px;color:#7a7d8a;margin-top:4px">Pay per consultation chat</div></div>';
  } else {
    var blockLabel=CUR.tag==='Groomers'?'Grooming services & prices':'Products & prices';
    var rows=(CUR.listings||[]).map(function(l){
      return '<div class="lr"><div class="ld">'+l.name+'</div><div class="lp">'+fmt(l.p)+'</div></div>';
    }).join('');
    $('profPriceBlock').innerHTML='<div class="pb"><div class="plabel">'+blockLabel+'</div><div style="margin-top:8px">'+rows+'</div></div>';
  }
  show('profile');
}

// ===== CHAT =====
function openChat(){
  var isVet=CUR.kind==='vet';
  var html='<div style="margin:10px 18px"><div style="display:inline-block;padding:10px 13px;background:#fff;border-radius:14px;font-size:13px">Hello! How can I help you today?</div></div>';

  if(isVet){
    html+='<div style="margin:10px 18px;text-align:right"><div style="display:inline-block;padding:10px 13px;background:#2b1b5e;color:#fff;border-radius:14px;font-size:13px">Consultation fee?</div></div>';
    html+='<div style="margin:10px 18px"><div style="display:inline-block;padding:10px 13px;background:#fff;border-radius:14px;font-size:13px">The consultation fee is '+fmt(CUR.price)+'. Pay to '+CUR.acct+'</div></div>';
    html+='<div class="pb"><div class="plabel">Pay consultation fee</div><div class="pamt vet">'+fmt(CUR.price)+'</div><div style="font-size:11px;color:#7a7d8a;margin:6px 0">Bank: '+CUR.acct.split(' • ')[0]+'<br>Account: '+CUR.acct.split(' • ')[1]+'</div><button class="btn p" style="margin:0;width:100%" onclick="confirmPay()">I\'ve paid — upload receipt</button><div style="font-size:10px;color:#7a7d8a;margin-top:8px">PadiVet doesn\'t handle payments. Money goes direct. No refunds.</div></div>';
  } else {
    var first=(CUR.listings||[])[0];
    var payLabel=CUR.tag==='Groomers'?'Pay for service':'Pay for goods';
    html+='<div style="margin:10px 18px;text-align:right"><div style="display:inline-block;padding:10px 13px;background:#2b1b5e;color:#fff;border-radius:14px;font-size:13px">Do you have '+first.name.toLowerCase()+'?</div></div>';
    html+='<div style="margin:10px 18px"><div style="display:inline-block;padding:10px 13px;background:#fff;border-radius:14px;font-size:13px">Yes — '+first.name+' is '+fmt(first.p)+'. Pay to '+CUR.acct+'</div></div>';
    html+='<div class="pb"><div class="plabel">'+payLabel+'</div><div class="pamt goods">'+fmt(first.p)+'</div><div style="font-size:11px;color:#7a7d8a;margin:6px 0">For: '+first.name+'<br>Bank: '+CUR.acct.split(' • ')[0]+'<br>Account: '+CUR.acct.split(' • ')[1]+'</div><button class="btn p" style="margin:0;width:100%" onclick="confirmPay()">I\'ve paid — upload receipt</button><div style="font-size:10px;color:#7a7d8a;margin-top:8px">PadiVet doesn\'t handle payments. Money goes direct. No refunds.</div></div>';
  }
  $('chatLog').innerHTML=html;
  show('chat');
}

function confirmPay(){
  var isVet=CUR.kind==='vet';
  var first=(CUR.listings||[])[0];
  var amount=isVet?CUR.price:(first?first.p:0);
  var what=isVet?'Consultation with '+CUR.n:(first?first.name:'Goods');
  var log=$('chatLog');
  var r=document.createElement('div');
  r.style.cssText='margin:10px 18px;padding:13px;background:#fff;border-radius:14px;border:2px dashed #0e9f5b;';
  r.innerHTML='<div style="color:#0b7d47;font-weight:800;font-size:12px;margin-bottom:6px">📄 Payment Receipt</div>'+
    '<div style="font-size:11px;color:#555">Amount: '+fmt(amount)+'</div>'+
    '<div style="font-size:11px;color:#555">For: '+what+'</div>'+
    '<div style="font-size:11px;color:#555">To: '+CUR.n+' • '+CUR.acct+'</div>'+
    '<div style="color:#0b7d47;font-weight:800;font-size:12px;margin-top:8px">✓ Payment confirmed</div>';
  log.appendChild(r);
  window.scrollTo(0,document.body.scrollHeight);
  toast('Receipt confirmed by '+CUR.n);
}

// ===== PADI =====
function sendPadi(){
  var input=$('padiText');
  var msg=input.value.trim();
  if(!msg)return;
  input.value='';
  var d=document.createElement('div');
  d.className='bub user';
  d.textContent=msg;
  $('padiLog').appendChild(d);

  var thinking=document.createElement('div');
  thinking.style.cssText='margin:10px 18px;font-size:12px;color:#7a7d8a';
  thinking.textContent='Padi is finding…';
  $('padiLog').appendChild(thinking);
  window.scrollTo(0,document.body.scrollHeight);

  setTimeout(function(){
    thinking.remove();
    var t=msg.toLowerCase();
    var list=[];
    var text='';

    var medical=['sick','fever','vomit','drug','medicine','treat','dose','symptom','pain','wound','cough','what should i give'];
    var isMedical=medical.some(function(w){return t.indexOf(w)>=0;});

    if(isMedical){
      text="I can't give medical advice — that's for a licensed vet. But here are vets available now:";
      list=DATA.filter(function(p){return (p.tag==='Vets'||p.tag==='Mobile Vets')&&p.on;});
    } else if(t.indexOf('groom')>=0||t.indexOf('trim')>=0||t.indexOf('bath')>=0){
      text='Here are groomers near you:';
      list=DATA.filter(function(p){return p.tag==='Groomers';});
    } else if(t.indexOf('online')>=0){
      text="Here's who's online right now:";
      list=DATA.filter(function(p){return p.on;});
    } else if(t.indexOf('feed')>=0){
      text='Here are feed producers near you:';
      list=DATA.filter(function(p){return p.tag==='Feeds';});
    } else if(t.indexOf('vaccine')>=0){
      text='Here are vaccine producers near you:';
      list=DATA.filter(function(p){return p.tag==='Vaccines';});
    } else if(t.indexOf('breed')>=0){
      text='Here are breeders near you:';
      list=DATA.filter(function(p){return p.tag==='Breeders';});
    } else if(t.indexOf('vet')>=0||t.indexOf('doctor')>=0){
      text='Here are vets near you (online first):';
      list=DATA.filter(function(p){return p.tag==='Vets'||p.tag==='Mobile Vets';});
    } else {
      text="I couldn't match that. I can find vets, feed, vaccines, breeders and groomers. Try \"vet near me\" or \"groomer near me\".";
      list=[];
    }

    list=list.slice().sort(function(a,b){return (b.on-a.on)||(b.r-a.r);});

    var r=document.createElement('div');
    r.className='bub';
    r.textContent=text;
    $('padiLog').appendChild(r);

    if(list.length){
      var wrap=document.createElement('div');
      wrap.innerHTML=list.map(card).join('');
      $('padiLog').appendChild(wrap);
    }
    window.scrollTo(0,document.body.scrollHeight);
  },800);
}

function quickAsk(m){$('padiText').value=m;sendPadi();}

// ===== INIT =====
renderHome();
