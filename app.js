hi// ===== SPLASH REMOVAL =====
(function hideSplash(){
  var s = document.getElementById('splash');
  if(!s) return;
  var done = false;
  function kill(){
    if(done) return; done = true;
    s.classList.add('hide');
    setTimeout(function(){ if(s && s.parentNode) s.parentNode.removeChild(s); }, 600);
  }
  setTimeout(kill, 2600);
  setTimeout(kill, 4000);
  s.addEventListener('click', kill);
  s.addEventListener('touchstart', kill, {passive:true});
})();

// ===== STATE =====
var $=function(id){return document.getElementById(id);};
var CUR=DATA[0];
var FILTER="All";
var MY_PROVIDER=DATA[2];

// ===== HELPERS =====
function fmt(n){return "₦"+Number(n).toLocaleString('en-NG');}

function show(id){
  document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active');});
  var el=$(id); if(el) el.classList.add('active');
  document.querySelectorAll('.navitem').forEach(function(n){n.classList.toggle('active',n.dataset.t===id);});
  var nav=$('nav');
  if(nav) nav.style.display=(id==='chat'||id==='addlisting')?'none':'flex';
  if(id==='browse') renderBrowse();
  if(id==='mylistings') renderMyListings();
  window.scrollTo(0,0);
}

function toast(m){var t=$('toast');t.textContent=m;t.classList.add('show');clearTimeout(window._tt);window._tt=setTimeout(function(){t.classList.remove('show');},2200);}

function pill(on){
  return on
    ? '<div class="pill on"><span class="dot g"></span>Online</div>'
    : '<div class="pill off"><span class="dot b"></span>Last seen 12 min ago</div>';
}

// ===== PRICING =====
function priceLine(p){
  if(p.kind==='vet'){
    return '<div class="plabel">Consultation fee</div><div class="pamount consult">'+fmt(p.price)+'</div>';
  }
  var tag=p.tag==='Feeds'?'Feed price':p.tag==='Vaccines'?'Vaccine price':p.tag==='Breeders'?'Breeding price':p.tag==='Groomers'?'Grooming price':'Price';
  return '<div class="plabel">'+tag+'</div><div class="pamount goods">From '+fmt(p.price)+'</div>';
}

// ===== CARD =====
function card(p){
  return '<div class="card" onclick="openProfile(\''+p.n+'\')">'+
    '<div class="row"><div class="avatar">'+p.n[0]+'</div><div style="flex:1">'+
    '<div class="pname">'+p.n+'</div>'+
    '<div class="meta">'+p.t+' • '+p.r+' ★ ('+p.c+')</div>'+
    pill(p.on)+'</div></div>'+
    priceLine(p)+
    '<div class="pmeta">'+p.d+' km away</div></div>';
}

function empty(m){return '<div class="empty"><div class="ei">🔍</div><b>'+m+'</b>Try another category or ask Padi to broaden your search.</div>';}

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
  document.querySelectorAll('.fchip').forEach(function(c){c.classList.toggle('active',c.dataset.cat===cat);});
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
    var badge=l.stock==='in'?'<span class="stockbadge in">Available</span>':'<span class="stockbadge out">Unavailable</span>';
    var typeLabel=p.kind==='vet'?'Vet service':p.tag==='Feeds'?'Feed':p.tag==='Vaccines'?'Vaccine':p.tag==='Breeders'?'Breeding':p.tag==='Groomers'?'Grooming':'Product';
    return '<div class="listcard" onclick="openProfile(\''+p.n+'\')">'+
      '<div class="lhead"><div><div class="lname">'+l.name+' '+badge+'</div><div class="ltype">'+typeLabel+'</div></div>'+
      '<div class="lprice2">'+fmt(l.p)+'</div></div>'+
      '<div class="lseller"><div class="sav">'+p.n[0]+'</div><div style="flex:1">'+
      '<div class="snm">'+p.n+'</div>'+
      '<div class="smeta">'+p.r+' ★ • '+p.d+' km '+(p.on?'• Online':'• Last seen 12m ago')+'</div>'+
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
  $('profStars').textContent=CUR.r+' ★ ('+CUR.c+' reviews) • Replies in ~10 min';
  $('profStatus').textContent=CUR.on?'🟢 Online':'⚫ Last seen 12 min ago';
  $('profDist').textContent=CUR.d+' km away';
  $('profAcct').textContent=CUR.acct;
  $('profChatBtn').textContent=CUR.on?'Chat now':'Send message';
  $('chatName').textContent=CUR.n;
  $('chatStatus').textContent=CUR.on?'🟢 Online':'⚫ Last seen 12 min ago';

  if(CUR.kind==='vet'){
    $('profPriceBlock').innerHTML='<div class="pricebox"><div class="plabel">Consultation fee</div><div class="pamount consult">'+fmt(CUR.price)+'</div><div class="pmeta">Pay per consultation chat</div></div>';
  } else {
    var blockLabel=CUR.tag==='Groomers'?'Grooming services & prices':'Products & prices';
    var rows=(CUR.listings||[]).map(function(l){
      var badge=l.stock==='in'?'<span class="stockbadge in">Available</span>':'<span class="stockbadge out">Unavailable</span>';
      return '<div class="listrow"><div><div class="ldesc">'+l.name+' '+badge+'</div><div class="lsub">'+(CUR.tag==='Groomers'?'Service':'Product')+'</div></div><div class="lprice">'+fmt(l.p)+'</div></div>';
    }).join('');
    $('profPriceBlock').innerHTML='<div class="pricebox listbox"><div style="padding:14px 16px 8px"><div class="plabel">'+blockLabel+'</div></div>'+rows+'</div>';
  }
  show('profile');
}

// ===== CHAT =====
function openChat(){
  var isVet=CUR.kind==='vet';
  var html='<div class="msgrow"><div class="msg them">Hello! How can I help you today?</div></div>';

  if(isVet){
    html+='<div class="msgrow"><div class="msg me">My goat has a fever. Consultation fee?</div></div>';
    html+='<div class="msgrow"><div class="msg them">The consultation fee is '+fmt(CUR.price)+'. Pay to '+CUR.acct+', then tap Pay & Upload Receipt below.</div></div>';
    html+='<div class="paybox" id="payBox"><h4>💳 Pay consultation fee</h4><div class="what">For: consultation with '+CUR.n+'</div>'+
      '<div class="acct">Bank: <b>'+CUR.acct.split(' • ')[0]+'</b><br>Account number: <b>'+CUR.acct.split(' • ')[1]+'</b><br>Amount: <b>'+fmt(CUR.price)+'</b></div>'+
      '<button class="pbtn" onclick="confirmPay()">I\'ve paid — upload receipt</button>'+
      '<div class="hint">PadiVet doesn\'t handle payments. Money goes directly to the provider. PadiVet doesn\'t issue refunds.</div></div>';
  } else {
    var first=(CUR.listings||[])[0];
    var payLabel=CUR.tag==='Groomers'?'💇 Pay for service':'🛒 Pay for goods';
    html+='<div class="msgrow"><div class="msg me">Do you have '+first.name.toLowerCase()+'?</div></div>';
    html+='<div class="msgrow"><div class="msg them">Yes — '+first.name+' is '+fmt(first.p)+'. Payment goes to '+CUR.acct+'. I\'ll confirm once you pay.</div></div>';
    html+='<div class="paybox" id="payBox"><h4>'+payLabel+'</h4><div class="what">For: '+first.name+' — '+fmt(first.p)+'</div>'+
      '<div class="acct">Bank: <b>'+CUR.acct.split(' • ')[0]+'</b><br>Account number: <b>'+CUR.acct.split(' • ')[1]+'</b><br>Amount: <b>'+fmt(first.p)+'</b></div>'+
      '<button class="pbtn" onclick="confirmPay()">I\'ve paid — upload receipt</button>'+
      '<div class="hint">PadiVet doesn\'t handle payments. Money goes directly to the provider. PadiVet doesn\'t issue refunds.</div></div>';
  }
  $('chatLog').innerHTML=html;
  show('chat');
}

function confirmPay(){
  var box=$('payBox'); if(!box) return;
  var isVet=CUR.kind==='vet';
  var first=(CUR.listings||[])[0];
  var amount=isVet?CUR.price:(first?first.p:0);
  var what=isVet?'Consultation with '+CUR.n:(first?first.name:'Goods');
  box.innerHTML='<div style="text-align:center;padding:10px 0;color:#7a7d8a;font-size:13px">Uploading receipt…</div>';
  setTimeout(function(){
    var log=$('chatLog');
    var receipt=document.createElement('div');
    receipt.className='receipt';
    receipt.innerHTML='<h4 style="color:#0b7d47;font-size:13px;margin-bottom:8px">📄 Payment Receipt</h4>'+
      '<p style="font-size:12px;color:#555;margin:3px 0">Amount: '+fmt(amount)+'</p>'+
      '<p style="font-size:12px;color:#555;margin:3px 0">For: '+what+'</p>'+
      '<p style="font-size:12px;color:#555;margin:3px 0">To: '+CUR.n+' • '+CUR.acct+'</p>'+
      '<div style="color:#0b7d47;font-weight:800;font-size:13px;margin-top:9px">✓ Payment received & confirmed</div>';
    log.appendChild(receipt);
    window.scrollTo(0,document.body.scrollHeight);
    toast('Receipt confirmed by '+CUR.n);
  },700);
}

// ===== MY LISTINGS =====
function renderMyListings(){
  $('mlProvName').textContent=MY_PROVIDER.n;
  var rows=(MY_PROVIDER.listings||[]).map(function(l,i){
    var badge=l.stock==='in'?'<span class="stockbadge in">Available</span>':'<span class="stockbadge out">Unavailable</span>';
    return '<div class="mlrow"><div style="flex:1">'+
      '<div class="mldesc">'+l.name+' '+badge+'</div>'+
      '<div class="mlsub">'+fmt(l.p)+'</div>'+
      '<div class="mlactions"><button onclick="toggleStock('+i+')">'+(l.stock==='in'?'Mark unavailable':'Mark available')+'</button>'+
      '<button class="del" onclick="deleteListing('+i+')">Delete</button></div>'+
      '</div></div>';
  }).join('');
  $('mlList').innerHTML=rows || '<div class="empty"><div class="ei">📦</div><b>No listings yet</b>Tap "Add new listing" to start.</div>';
}

function toggleStock(i){
  var l=MY_PROVIDER.listings[i];
  l.stock=l.stock==='in'?'out':'in';
  renderMyListings();
  toast(l.stock==='in'?'Marked available — live in Browse':'Marked unavailable');
}
function deleteListing(i){
  MY_PROVIDER.listings.splice(i,1);
  renderMyListings();
  toast('Listing deleted');
}
function openAddListing(){
  $('alTitle').textContent='Add listing';
  $('alName').value='';
  $('alPrice').value='';
  $('alStock').value='in';
  $('alCat').value=MY_PROVIDER.tag||'Feeds';
  show('addlisting');
}
function saveListing(){
  var name=$('alName').value.trim();
  var price=parseInt($('alPrice').value);
  var cat=$('alCat').value;
  var stock=$('alStock').value;
  if(!name){toast('Please give it a name');return;}
  if(!price||price<=0){toast('Please enter a valid price');return;}
  if(!MY_PROVIDER.listings) MY_PROVIDER.listings=[];
  MY_PROVIDER.listings.push({name:name,p:price,stock:stock});
  if(cat==='Feeds') MY_PROVIDER.tag='Feeds';
  else if(cat==='Vaccines') MY_PROVIDER.tag='Vaccines';
  else if(cat==='Breeders') MY_PROVIDER.tag='Breeders';
  else if(cat==='Vets') MY_PROVIDER.tag='Vets';
  else if(cat==='Groomers') MY_PROVIDER.tag='Groomers';
  var inStock=MY_PROVIDER.listings.filter(function(l){return l.stock==='in';}).map(function(l){return l.p;});
  if(inStock.length) MY_PROVIDER.price=Math.min.apply(null,inStock);
  toast('Published — now live in Browse & Padi');
  renderHome();
  show('mylistings');
}

// ===== PADI =====
function sendPadi(){
  var input=$('padiText');
  var msg=input.value.trim();
  if(!msg)return;
  input.value='';

  var d=document.createElement('div');
  d.className='bubble user';
  d.textContent=msg;
  $('padiLog').appendChild(d);

  var thinking=document.createElement('div');
  thinking.className='thinking';
  thinking.innerHTML='<span></span><span></span><span></span>&nbsp;Padi is finding…';
  $('padiLog').appendChild(thinking);
  window.scrollTo(0,document.body.scrollHeight);

  setTimeout(function(){
    thinking.remove();
    var t=msg.toLowerCase();
    var list=[];
    var text='';
    var medical=["sick","fever","vomit","diarrhea","diarrhoea","drug","medicine","treat","treatment","dose","dosage","inject","symptom","pain","wound","blood","dying","poison","swollen","limp","cough","what should i give","what can i give","is it sick"];
    var isMedical=medical.some(function(w){return t.indexOf(w)>=0;});

    if(isMedical){
      text="I can't give medical advice — that's for a licensed vet. But here are vets available right now for a quick consultation:";
      list=DATA.filter(function(p){return (p.tag==='Vets'||p.tag==='Mobile Vets')&&p.on;});
    } else if(t.indexOf('groom')>=0||t.indexOf('trim')>=0||t.indexOf('bath')>=0){
      text='Here are groomers near you (online first):';
      list=DATA.filter(function(p){return p.tag==='Groomers';});
    } else if(t.indexOf('online')>=0){
      text="Here's who's online right now — you can chat instantly:";
      list=DATA.filter(function(p){return p.on;});
    } else if(t.indexOf('feed')>=0){
      text='Here are feed producers near you (online first):';
      list=DATA.filter(function(p){return p.tag==='Feeds';});
    } else if(t.indexOf('vaccine')>=0){
      text='Here are vaccine producers near you (online first):';
      list=DATA.filter(function(p){return p.tag==='Vaccines';});
    } else if(t.indexOf('breeder')>=0||t.indexOf('breed')>=0){
      text='Here are breeders near you (online first):';
      list=DATA.filter(function(p){return p.tag==='Breeders';});
    } else if(t.indexOf('vet')>=0||t.indexOf('doctor')>=0||t.indexOf('clinic')>=0){
      text='Here are the best-rated vets near you (online first) — consultation fee shown for each:';
      list=DATA.filter(function(p){return p.tag==='Vets'||p.tag==='Mobile Vets';});
    } else {
      text="Hmm, I couldn't match that. I can find vets, feed, vaccines, breeders and groomers. Try: \"vet near me\", \"feed under 10k\", or \"groomer near me\".";
      list=[];
    }

    list=list.slice().sort(function(a,b){return (b.on-a.on)||(b.r-a.r);});

    var r=document.createElement('div');
    r.className='bubble';
    r.textContent=text;
    $('padiLog').appendChild(r);

    if(list.length){
      var wrap=document.createElement('div');
      wrap.innerHTML=list.map(card).join('');
      $('padiLog').appendChild(wrap);
    } else if(!isMedical){
      var e=document.createElement('div');
      e.className='empty';
      e.innerHTML='<div class="ei">🗺️</div><b>No matches</b>Try widening your area or budget.';
      $('padiLog').appendChild(e);
    }
    window.scrollTo(0,document.body.scrollHeight);
  },800);
}

function quickAsk(m){$('padiText').value=m;sendPadi();}

// ===== SIGN-UP =====
function startSignup(type){
  if(type==='consumer') show('signup-consumer');
  else show('signup-provider');
}
function toggleVetFields(){
  var t=$('provType').value;
  var isVet=t==='vet'||t==='mobilevet';
  var isMobile=t==='mobilevet'||t==='groomer';
  var isGoods=t==='feed'||t==='vaccine'||t==='breeder'||t==='groomer';
  $('feeField').style.display=isVet?'block':'none';
  $('radiusField').style.display=isMobile?'block':'none';
  $('listingField').style.display=isGoods?'block':'none';
}
function finishSignup(type){
  if(type==='consumer'){
    $('succIcon').textContent='🐾';
    $('succTitle').textContent='Welcome to PadiVet!';
    $('succText').textContent='Your account is ready. Start by asking Padi to find a provider near you.';
  } else {
    $('succIcon').textContent='✅';
    $('succTitle').textContent='Submitted for verification';
    $('succText').textContent='PadiVet admin will review your profile. Once verified, you can manage listings from your dashboard.';
  }
  show('signup-success');
}

// ===== INIT =====
renderHome();
if($('provType')) toggleVetFields();
