/* ============================================================
   RMS — app.js  |  Supabase-powered app logic
   ============================================================ */

var borrowId   = null;
var doneTaskId = null;
var selTeam    = null;

/* ── MOBILE SIDEBAR ─────────────────────────────────────── */
function toggleSidebar() {
  var sb=document.querySelector('.sb'),ov=document.getElementById('sbOverlay'),btn=document.getElementById('hamBtn');
  if(!sb)return;
  var open=sb.classList.contains('open');
  if(open){sb.classList.remove('open');ov.classList.remove('show');btn.classList.remove('open');}
  else{sb.classList.add('open');ov.classList.add('show');btn.classList.add('open');}
}
function closeSidebarOnMobile(){
  if(window.innerWidth<=600){
    var sb=document.querySelector('.sb'),ov=document.getElementById('sbOverlay'),btn=document.getElementById('hamBtn');
    if(sb)sb.classList.remove('open');if(ov)ov.classList.remove('show');if(btn)btn.classList.remove('open');
  }
}

/* ── HELPERS ─────────────────────────────────────────────── */
function tc(t)  { return TEAM_COLORS[t]||'#4A8FE8'; }
function tb(t)  { return '<span class="bdg" style="background:'+tc(t)+'22;color:'+tc(t)+';border:1px solid '+tc(t)+'44;">'+t+'</span>'; }
function initials(n){ return n.split(' ').map(function(x){return x[0];}).join(''); }

function rb(r) {
  if(r==='master')  return '<span class="bdg b-ma">MASTER</span>';
  if(r==='admin')   return '<span class="bdg b-ad">ADMIN</span>';
  if(r==='manager') return '<span class="bdg" style="background:var(--gnbg);color:var(--gn);">MANAGER</span>';
  return '<span class="bdg b-me">MEMBER</span>';
}

function stBdg(s){
  var m={upcoming:'b-up',working:'b-wk',done:'b-dn',pending:'b-pd',approved:'b-ap',rejected:'b-rj'};
  var l={upcoming:'UPCOMING',working:'WORKING RN',done:'DONE',pending:'PENDING',approved:'APPROVED',rejected:'REJECTED'};
  return '<span class="bdg '+(m[s]||'')+'">'+( l[s]||s.toUpperCase())+'</span>';
}

function locBdg(l){
  if(l==='outside'||l==='competition') return '<span class="bdg b-ob">'+(l==='competition'?'COMPETITION':'OUT OF SAC')+' ⚠</span>';
  return '<span style="font-size:8px;color:var(--tx3);">'+(l==='inside'?'Inside SAC':'Lab')+'</span>';
}

function dlStr(d){
  if(!d)return '—';
  var dt=new Date(d),now=new Date();
  var diff=Math.ceil((dt-now)/(1000*60*60*24));
  var s=dt.toLocaleDateString('en-IN',{day:'numeric',month:'short'});
  if(diff<0) return '<span style="color:var(--rd);font-size:8px;">'+s+' (overdue)</span>';
  if(diff<=3)return '<span style="color:var(--am);font-size:8px;">'+s+' ('+diff+'d)</span>';
  return '<span style="font-size:8px;color:var(--tx3);">'+s+'</span>';
}

function nowStr(){
  var n=new Date();
  return n.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})+' '+
    String(n.getHours()).padStart(2,'0')+':'+String(n.getMinutes()).padStart(2,'0');
}

function isMaster()  { return cu&&cu.role==='master'; }
function isAdmin()   { return cu&&(cu.role==='admin'||cu.role==='master'); }
function isManager() { return cu&&(cu.role==='manager'||cu.role==='admin'||cu.role==='master'); }
function hasPerm(p)  {
  if(isMaster()) return true;
  if(!cu) return false;
  var rp=(rolePerms&&rolePerms[cu.role])?rolePerms[cu.role]:{};
  return !!rp[p];
}

function TEAMS(){
  var seen={},out=[];
  USERS.forEach(function(u){ if(u.role!=='master'&&u.team!=='—'&&!seen[u.team]){seen[u.team]=1;out.push(u.team);} });
  return out.sort();
}

/* ── AUTH ────────────────────────────────────────────────── */
function doLogin(){
  var un=document.getElementById('lUn').value.trim().toLowerCase();
  var pw=document.getElementById('lPw').value;
  var u=USERS.filter(function(x){return x.username===un&&x.password===pw;})[0];
  if(!u){document.getElementById('lErr').textContent='Invalid username or password.';return;}
  cu=u;
  saveSession(u.username);
  showMainApp(u);
  loadAllData(renderAll);
}

function showMainApp(u){
  document.getElementById('loginScreen').style.display='none';
  document.getElementById('mainApp').style.display='flex';
  document.getElementById('sbNm').textContent=u.name;
  var mt=document.getElementById('sbMt');
  if(isMaster())           {mt.style.color='var(--gd)'; mt.textContent='MASTER ADMIN';}
  else if(isAdmin())       {mt.style.color='var(--ac)'; mt.textContent='ADMIN — '+u.team;}
  else if(u.role==='manager'){mt.style.color='var(--gn)'; mt.textContent='MANAGER — '+u.team;}
  else                     {mt.style.color='var(--tx3)';mt.textContent='MEMBER — '+u.team;}
  document.getElementById('sbId').textContent='@'+u.username;
  if(isAdmin()||hasPerm('canManageInventory')){
    document.getElementById('aNL').style.display='block';
    document.getElementById('nIM').style.display='flex';
  }
  if(isAdmin()){document.getElementById('nTR').style.display='flex'; populateTrFilters();}
  if(isMaster()){document.getElementById('mNL').style.display='block'; document.getElementById('nUS').style.display='flex';}
  document.getElementById('linkFormWrap').style.display=hasPerm('canAddLinks')?'block':'none';
  var ut=document.getElementById('ut'); ut.innerHTML='';
  TEAM_NAMES.forEach(function(t){var o=document.createElement('option');o.textContent=t;ut.appendChild(o);});
}

function doLogout(){
  cu=null; selTeam=null; clearSession();
  document.getElementById('mainApp').style.display='none';
  document.getElementById('loginScreen').style.display='flex';
  ['nUS','nIM','nTR','aNL','mNL'].forEach(function(id){document.getElementById(id).style.display='none';});
  document.getElementById('linkFormWrap').style.display='none';
  document.getElementById('lUn').value='';
  document.getElementById('lPw').value='';
  document.getElementById('lErr').textContent='';
}

/* ── NAVIGATION ─────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function(){
  // Try restore session
  var saved=getSavedSession();
  if(saved){
    showLoader(true);
    sbGet('users','username=eq.'+encodeURIComponent(saved)).then(function(res){
      if(res&&res.length){
        cu=res[0];
        showLoader(false);
        showMainApp(cu);
        loadAllData(renderAll);
      } else {
        clearSession();
        showLoader(false);
      }
    }).catch(function(){ clearSession(); showLoader(false); });
  }

  document.querySelectorAll('.ni').forEach(function(el){
    el.addEventListener('click',function(){
      var panel=el.getAttribute('data-panel');
      if(panel){goto(panel,el);closeSidebarOnMobile();}
    });
  });
  document.getElementById('lPw').addEventListener('keydown',function(e){if(e.key==='Enter')doLogin();});
  document.getElementById('lUn').addEventListener('keydown',function(e){if(e.key==='Enter')doLogin();});

  // Auto refresh data every 30 seconds
  setInterval(function(){
    if(cu) loadAllData(renderAll);
  }, 30000);
});

function goto(name,el){
  document.querySelectorAll('.pn').forEach(function(p){p.classList.remove('on');});
  document.querySelectorAll('.ni').forEach(function(n){n.classList.remove('on');});
  var panel=document.getElementById('pn-'+name);
  if(panel)panel.classList.add('on');
  if(el)el.classList.add('on');
  var titles={dashboard:'DASHBOARD',inventory:'INVENTORY',work:'WORK LOG',treasury:'TREASURY',
    treview:'TREASURY REVIEW',links:'LINKS',invmgmt:'INV MANAGEMENT',users:'USER MANAGEMENT'};
  document.getElementById('topT').textContent=titles[name]||name.toUpperCase();
  if(name==='work') renderWork(); else renderAll();
}

function renderAll(){ renderDash(); renderInv(); renderInvMgmt(); renderTReview(); renderLinks(); renderUsers(); renderMyTreasury(); }

/* ── DASHBOARD ──────────────────────────────────────────── */
function renderDash(){
  var rb=document.getElementById('roleBanner');
  if(isMaster())         rb.innerHTML='<div class="rb rb-m">⬡ MASTER ADMIN — Full system access</div>';
  else if(isAdmin())     rb.innerHTML='<div class="rb rb-a">◈ ADMIN — Full access except user management</div>';
  else if(cu&&cu.role==='manager') rb.innerHTML='<div class="rb" style="background:var(--gnbg);border:1px solid rgba(46,170,130,0.3);color:var(--gn);">◉ MANAGER — Inventory + member access</div>';
  else                   rb.innerHTML='<div class="rb rb-u">◎ MEMBER — Your team dashboard</div>';

  var dc=document.getElementById('dashContent');
  if(!isAdmin()){
    var tm=cu.team;
    var tmMem=USERS.filter(function(u){return u.team===tm;});
    var myTks=tasks.filter(function(t){return t.user_id===cu.id;});
    var myTr=treasury.filter(function(t){return t.user_id===cu.id;});
    dc.innerHTML=
      '<div class="mcs">'+
      '<div class="mc"><div class="mc-l">TEAM</div><div class="mc-v" style="font-size:13px;color:'+tc(tm)+';">'+tm+'</div><div class="mc-s">'+tmMem.length+' members</div></div>'+
      '<div class="mc" style="border-top-color:var(--am);"><div class="mc-l">MY TASKS</div><div class="mc-v">'+myTks.filter(function(t){return t.status!=='done';}).length+'</div><div class="mc-s">active</div></div>'+
      '<div class="mc" style="border-top-color:var(--gd);"><div class="mc-l">MY REQUESTS</div><div class="mc-v">'+myTr.length+'</div><div class="mc-s">treasury</div></div>'+
      '</div>'+
      '<div class="sc">TEAM '+tm+' — MEMBER PROGRESS</div>'+
      '<div class="tw"><table><thead><tr><th>MEMBER</th><th>UPCOMING</th><th>WORKING</th><th>DONE</th></tr></thead><tbody>'+
      tmMem.map(function(u){
        return '<tr><td><div style="display:flex;align-items:center;gap:6px;"><div class="av">'+initials(u.name)+'</div>'+u.name+'</div></td>'+
          '<td>'+tasks.filter(function(t){return t.user_id===u.id&&t.status==='upcoming';}).length+'</td>'+
          '<td>'+tasks.filter(function(t){return t.user_id===u.id&&t.status==='working';}).length+'</td>'+
          '<td>'+tasks.filter(function(t){return t.user_id===u.id&&t.status==='done';}).length+'</td></tr>';
      }).join('')+'</tbody></table></div>'+
      '<div class="sc">RECENT TEAM TASKS</div>'+
      '<div class="tw"><table><thead><tr><th>TASK</th><th>BY</th><th>STATUS</th><th>COMPLETED</th></tr></thead><tbody>'+
      tasks.filter(function(t){return t.team===tm;}).slice(0,6).map(function(t){
        return '<tr><td>'+t.task+'</td><td>'+t.user_name+'</td><td>'+stBdg(t.status)+'</td><td style="font-size:8px;color:var(--tx3);">'+(t.completed_at||'—')+'</td></tr>';
      }).join('')+'</tbody></table></div>';
  } else {
    dc.innerHTML=
      '<div class="mcs4">'+
      '<div class="mc"><div class="mc-l">COMPONENTS</div><div class="mc-v">'+inventory.reduce(function(a,i){return a+i.qty;},0)+'</div><div class="mc-s">in inventory</div></div>'+
      '<div class="mc" style="border-top-color:var(--gn);"><div class="mc-l">ACTIVE TASKS</div><div class="mc-v">'+tasks.filter(function(t){return t.status!=='done';}).length+'</div><div class="mc-s">all teams</div></div>'+
      '<div class="mc" style="border-top-color:var(--am);"><div class="mc-l">TREASURY PENDING</div><div class="mc-v">'+treasury.filter(function(t){return t.status==='pending';}).length+'</div><div class="mc-s">awaiting</div></div>'+
      '<div class="mc" style="border-top-color:var(--rd);"><div class="mc-l">OUT OF SAC</div><div class="mc-v">'+transactions.filter(function(t){return t.location==='outside'||t.location==='competition';}).length+'</div><div class="mc-s">components</div></div>'+
      '</div>'+
      '<div class="sc">RECENT TRANSACTIONS</div>'+
      '<div class="tw"><table><thead><tr><th>COMPONENT</th><th>QTY</th><th>BY</th><th>TEAM</th><th>LOCATION</th><th>TIME</th></tr></thead><tbody>'+
      transactions.slice(0,6).map(function(t){
        return '<tr style="'+(t.location==='outside'||t.location==='competition'?'background:rgba(224,82,82,0.05);':'')+'">'+
          '<td>'+t.comp_name+'</td><td>'+t.qty+'</td><td>'+t.user_name+'</td>'+
          '<td>'+tb(t.team)+'</td><td>'+locBdg(t.location)+'</td>'+
          '<td style="color:var(--tx3);">'+t.time+'</td></tr>';
      }).join('')+'</tbody></table></div>'+
      '<div class="sc">TEAM OVERVIEW</div>'+
      '<div class="tw"><table><thead><tr><th>TEAM</th><th>MEMBERS</th><th>UPCOMING</th><th>WORKING</th><th>DONE</th></tr></thead><tbody>'+
      TEAMS().map(function(tm){
        return '<tr><td>'+tb(tm)+'</td>'+
          '<td>'+USERS.filter(function(u){return u.team===tm;}).length+'</td>'+
          '<td>'+tasks.filter(function(t){return t.team===tm&&t.status==='upcoming';}).length+'</td>'+
          '<td>'+tasks.filter(function(t){return t.team===tm&&t.status==='working';}).length+'</td>'+
          '<td>'+tasks.filter(function(t){return t.team===tm&&t.status==='done';}).length+'</td></tr>';
      }).join('')+'</tbody></table></div>';
  }
}

/* ── INVENTORY ───────────────────────────────────────────── */
function groupedInvHTML(items,showBorrow){
  var cats=[],seen={};
  items.forEach(function(i){if(!seen[i.cat]){seen[i.cat]=1;cats.push(i.cat);}});
  cats.sort();
  if(!cats.length) return '<div style="color:var(--tx3);font-size:9px;text-align:center;padding:16px;">No components found</div>';
  var oobIds={};
  transactions.forEach(function(t){if(t.location==='outside'||t.location==='competition')oobIds[t.comp_id]=1;});
  var h='';
  cats.forEach(function(cat){
    var ci=items.filter(function(i){return i.cat===cat;});
    h+='<div class="gh">'+cat.toUpperCase()+' — '+ci.length+' items</div>'+
      '<table><thead><tr><th>NAME</th><th>STOCK</th><th>UNIT</th><th></th></tr></thead><tbody>';
    ci.forEach(function(i){
      var oob=!!oobIds[i.id];
      h+='<tr style="'+(oob?'background:rgba(224,82,82,0.04);':'')+'">'+
        '<td>'+i.name+(oob?' <span class="bdg b-ob" style="font-size:7px;">OUT OF SAC</span>':'')+'</td>'+
        '<td><span style="font-weight:700;color:'+(i.qty<=2?'var(--rd)':i.qty<=8?'var(--am)':'var(--tx)')+';">'+i.qty+'</span></td>'+
        '<td style="color:var(--tx3);">'+i.unit+'</td>'+
        '<td>'+(showBorrow
          ? '<button class="btn-sm btn-g" onclick="openBorrow(\''+i.id+'\')">Borrow →</button>'
          : '<button class="btn-sm btn-r" onclick="deductOne(\''+i.id+'\')">−1</button>')+
        '</td></tr>';
    });
    h+='</tbody></table>';
  });
  return h;
}

function renderInv(){
  var q=(document.getElementById('invSrch').value||'').toLowerCase();
  var f=inventory.filter(function(i){return i.name.toLowerCase().indexOf(q)>=0||i.cat.toLowerCase().indexOf(q)>=0;});
  var hasOOB=transactions.some(function(t){return t.location==='outside'||t.location==='competition';});
  document.getElementById('oobBanner').style.display=hasOOB?'block':'none';
  document.getElementById('invG').innerHTML='<div class="tw">'+groupedInvHTML(f,true)+'</div>';
  var myTx=cu?transactions.filter(function(t){return t.team===cu.team;}):[];
  document.getElementById('myTxn').innerHTML=myTx.length
    ?myTx.map(function(t){
      return '<tr style="'+(t.location==='outside'||t.location==='competition'?'background:rgba(224,82,82,0.04);':'')+'">'+
        '<td>'+t.comp_name+'</td><td>'+t.qty+'</td>'+
        '<td style="font-size:8px;color:var(--tx3);">'+(t.borrow_as==='team'?'Team':'Individual')+'</td>'+
        '<td>'+locBdg(t.location)+'</td><td>'+t.user_name+'</td>'+
        '<td style="color:var(--tx3);">'+t.time+'</td></tr>';
    }).join('')
    :'<tr><td colspan="6" style="color:var(--tx3);font-size:9px;text-align:center;padding:12px;">No transactions yet</td></tr>';
}

function renderInvMgmt(){
  if(!hasPerm('canManageInventory'))return;
  var el=document.getElementById('imSrch');
  var q=el?el.value.toLowerCase():'';
  var f=inventory.filter(function(i){return i.name.toLowerCase().indexOf(q)>=0||i.cat.toLowerCase().indexOf(q)>=0;});
  var cats=[],seen={};
  f.forEach(function(i){if(!seen[i.cat]){seen[i.cat]=1;cats.push(i.cat);}});
  cats.sort();
  var h='';
  cats.forEach(function(cat){
    var ci=f.filter(function(i){return i.cat===cat;});
    h+='<div class="gh">'+cat.toUpperCase()+' — '+ci.length+' items</div>'+
      '<table><thead><tr><th>ID</th><th>NAME</th><th>STOCK</th><th>UNIT</th><th></th></tr></thead><tbody>';
    ci.forEach(function(i){
      h+='<tr><td style="color:var(--tx3);font-size:8px;">'+i.id+'</td><td>'+i.name+'</td>'+
        '<td>'+i.qty+'</td><td style="color:var(--tx3);">'+i.unit+'</td>'+
        '<td><button class="btn-sm btn-r" onclick="deductOne(\''+i.id+'\')">−1</button></td></tr>';
    });
    h+='</tbody></table>';
  });
  document.getElementById('imG').innerHTML='<div class="tw">'+(h||'<div style="color:var(--tx3);font-size:9px;text-align:center;padding:16px;">No components</div>')+'</div>';
}

function addComp(){
  var n=document.getElementById('ia-n').value.trim();
  var q=parseInt(document.getElementById('ia-q').value);
  if(!n||!q)return;
  var item={id:newId('INV',inventory),name:n,qty:q,unit:document.getElementById('ia-u').value,cat:document.getElementById('ia-c').value};
  sbPost('inventory',item).then(function(){
    document.getElementById('ia-n').value='';
    document.getElementById('ia-q').value='';
    showToast('Component added!','success');
    loadAllData(renderAll);
  });
}

function deductOne(id){
  var c=inventory.filter(function(i){return i.id===id;})[0];
  if(!c||c.qty<=0)return;
  sbPatch('inventory',{qty:c.qty-1},'id=eq.'+encodeURIComponent(id)).then(function(){
    loadAllData(renderAll);
  });
}

/* ── BORROW MODAL ───────────────────────────────────────── */
function openBorrow(id){
  var c=inventory.filter(function(i){return i.id===id;})[0];if(!c)return;
  borrowId=id;
  document.getElementById('mc').value=c.name;
  document.getElementById('ms').value=c.qty+' '+c.unit;
  document.getElementById('mq').value='';
  document.getElementById('ml').value='inside';
  document.getElementById('mb2').value='team';
  document.getElementById('merr').textContent='';
  document.getElementById('mwrn').style.display='none';
  document.getElementById('borrowModal').style.display='flex';
}
function closeBorrow(){document.getElementById('borrowModal').style.display='none';borrowId=null;}
function chkOOB(){var l=document.getElementById('ml').value;document.getElementById('mwrn').style.display=(l==='outside'||l==='competition')?'block':'none';}

function confirmBorrow(){
  var qty=parseInt(document.getElementById('mq').value);
  var comp=inventory.filter(function(i){return i.id===borrowId;})[0];
  if(!comp)return;
  if(!qty||qty<=0){document.getElementById('merr').textContent='Enter a valid quantity';return;}
  if(qty>comp.qty){document.getElementById('merr').textContent='Only '+comp.qty+' in stock';return;}
  var now=new Date();
  var t=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
  var txn={
    comp_id:comp.id,comp_name:comp.name,qty:qty,
    borrow_as:document.getElementById('mb2').value,
    location:document.getElementById('ml').value,
    user_id:cu.id,user_name:cu.name,team:cu.team,time:t
  };
  Promise.all([
    sbPost('transactions',txn),
    sbPatch('inventory',{qty:comp.qty-qty},'id=eq.'+encodeURIComponent(comp.id))
  ]).then(function(){
    showToast('Borrowed successfully!','success');
    closeBorrow(); loadAllData(renderAll);
  });
}

/* ── WORK LOG ───────────────────────────────────────────── */
function renderWork(){
  var lEl=document.getElementById('wkList'),vEl=document.getElementById('wkView');
  if(!selTeam){vEl.style.display='none';lEl.style.display='block';renderTeamList(lEl);}
  else{lEl.style.display='none';vEl.style.display='block';renderTeamView(vEl,selTeam);}
}

function renderTeamList(el){
  var teams=TEAMS();
  var h='<div class="sc">ALL TEAMS — CLICK TO VIEW WORK PROGRESS</div><div class="tl">';
  teams.forEach(function(tm){
    var cnt=tasks.filter(function(t){return t.team===tm;}).length;
    var wk=tasks.filter(function(t){return t.team===tm&&t.status==='working';}).length;
    var up=tasks.filter(function(t){return t.team===tm&&t.status==='upcoming';}).length;
    var dn=tasks.filter(function(t){return t.team===tm&&t.status==='done';}).length;
    var mem=USERS.filter(function(u){return u.team===tm;}).length;
    h+='<div class="tt" onclick="selTeam=\''+tm+'\';renderWork();" style="border-top-color:'+tc(tm)+';"><div class="tt-n">'+tm+'</div>'+
      '<div class="tt-c">'+mem+' members · '+cnt+' tasks</div>'+
      '<div class="tt-s"><span class="bdg b-up">'+up+' upcoming</span><span class="bdg b-wk">'+wk+' working</span><span class="bdg b-dn">'+dn+' done</span></div></div>';
  });
  h+='</div>';el.innerHTML=h;
}

function renderTeamView(el,tm){
  var isMyTeam=cu&&cu.team===tm;
  var canPost=isMyTeam||isAdmin();
  var memCnt=USERS.filter(function(u){return u.team===tm;}).length;
  var h='<div class="bk" onclick="selTeam=null;renderWork();">← All Teams</div>'+
    '<div class="thdr"><div class="thn" style="color:'+tc(tm)+';">TEAM '+tm+'</div>'+
    '<span style="font-size:8px;color:var(--tx3);">'+memCnt+' members</span></div>';
  if(canPost){
    h+='<div class="fc"><div class="sc" style="margin-bottom:8px;">ADD TASK — as <span style="color:var(--ac);">'+cu.name+'</span></div>'+
      '<div class="fr2"><div class="fg"><label>TASK</label><input id="wt" placeholder="What are you working on?"/></div>'+
      '<div class="fg"><label>STATUS</label><select id="ws"><option value="upcoming">UPCOMING</option><option value="working">WORKING RN</option></select></div></div>'+
      '<div class="fr2"><div class="fg"><label>DESCRIPTION</label><input id="wd" placeholder="Brief details..."/></div>'+
      '<div class="fg"><label>DEADLINE</label><input id="wdl" type="date"/></div></div>'+
      '<button class="btn" onclick="addTask(\''+tm+'\')">ADD TASK</button></div>';
  }
  var cols=[
    {st:'upcoming',label:'UPCOMING',bc:'var(--ac)',hc:'#6BAEE8'},
    {st:'working', label:'WORKING RN',bc:'var(--am)',hc:'var(--am)'},
    {st:'done',    label:'DONE',bc:'var(--gn)',hc:'var(--gn)'}
  ];
  h+='<div class="kan">';
  cols.forEach(function(cfg){
    var col=tasks.filter(function(t){return t.team===tm&&t.status===cfg.st;});
    var nxtMap={upcoming:'→ Working RN',working:'→ Mark Done',done:'→ Reopen'};
    h+='<div class="kc" style="border-top:2px solid '+cfg.bc+';"><div class="kch" style="color:'+cfg.hc+';">'+cfg.label+' ('+col.length+')</div>';
    col.forEach(function(t){
      var isOwn=cu&&cu.id===t.user_id;
      var canEdit=isOwn||hasPerm('canModerateTasks');
      h+='<div class="tc '+t.status+'">'+
        '<div class="tc-n">'+t.task+'</div>'+
        '<div class="tc-b">'+t.user_name+'</div>'+
        '<div class="tc-d">'+(t.description||'')+'</div>'+
        (t.deadline?'<div class="tc-dl">⏰ '+dlStr(t.deadline)+'</div>':'')+
        (t.completed_at?'<div class="tc-ts">✓ '+t.completed_at+'</div>':'')+
        '<div class="tc-a">';
      if(canEdit){
        if(t.status==='upcoming') h+='<button class="cyc" onclick="cycleTask(\''+t.id+'\',\'working\')">→ Working RN</button>';
        else if(t.status==='working') h+='<button class="cyc" onclick="openDone(\''+t.id+'\')">→ Mark Done</button>';
        else if(t.status==='done'&&hasPerm('canModerateTasks')) h+='<button class="cyc" onclick="cycleTask(\''+t.id+'\',\'working\')">→ Reopen</button>';
        if(isOwn||hasPerm('canModerateTasks')) h+='<button class="cyc" style="border-color:rgba(224,82,82,0.4);color:var(--rd);" onclick="delTask(\''+t.id+'\')">Remove</button>';
      }
      h+='</div></div>';
    });
    if(!col.length) h+='<div style="font-size:9px;color:var(--tx3);margin-top:8px;text-align:center;">No tasks</div>';
    h+='</div>';
  });
  h+='</div>';el.innerHTML=h;
}

function addTask(tm){
  var n=document.getElementById('wt').value.trim();if(!n||!cu)return;
  var task={
    id:newId('TSK',tasks),task:n,
    description:document.getElementById('wd').value,
    deadline:document.getElementById('wdl').value||null,
    user_id:cu.id,user_name:cu.name,team:tm,
    status:document.getElementById('ws').value,completed_at:''
  };
  sbPost('tasks',task).then(function(){
    document.getElementById('wt').value='';
    document.getElementById('wd').value='';
    document.getElementById('wdl').value='';
    showToast('Task added!','success');
    loadAllData(renderWork);
  });
}

function cycleTask(id,status){
  sbPatch('tasks',{status:status,completed_at:''},'id=eq.'+encodeURIComponent(id)).then(function(){
    loadAllData(renderWork);
  });
}

function openDone(id){
  doneTaskId=id;
  document.getElementById('doneTimeDisp').textContent='Completion time: '+nowStr();
  document.getElementById('doneModal').style.display='flex';
}
function closeDone(){document.getElementById('doneModal').style.display='none';doneTaskId=null;}

function confirmDone(){
  var ts=nowStr();
  sbPatch('tasks',{status:'done',completed_at:ts},'id=eq.'+encodeURIComponent(doneTaskId)).then(function(){
    showToast('Task marked done!','success');
    closeDone(); loadAllData(renderWork);
  });
}

function delTask(id){
  sbDelete('tasks','id=eq.'+encodeURIComponent(id)).then(function(){
    showToast('Task removed','success');
    loadAllData(renderWork);
  });
}

/* ── TREASURY ───────────────────────────────────────────── */
function renderMyTreasury(){
  if(!cu)return;
  var myTr=treasury.filter(function(t){return t.user_id===cu.id;});
  document.getElementById('myTrTbl').innerHTML=myTr.length
    ?myTr.map(function(t){
      return '<tr><td style="color:var(--tx3);font-size:8px;">'+t.id+'</td><td>'+t.purpose+'</td>'+
        '<td>₹'+Number(t.amount).toLocaleString()+'</td>'+
        '<td>'+dlStr(t.deadline)+'</td>'+
        '<td>'+stBdg(t.status)+'</td>'+
        '<td>'+(t.status==='pending'?'<button class="btn-sm btn-r" onclick="deleteTreasury(\''+t.id+'\')">Delete</button>':'')+'</td></tr>';
    }).join('')
    :'<tr><td colspan="6" style="color:var(--tx3);font-size:9px;text-align:center;padding:12px;">No requests yet</td></tr>';
}

function addTreasury(){
  var p=document.getElementById('tp').value.trim();
  var a=parseFloat(document.getElementById('ta').value);
  if(!p||!a||!cu)return;
  var req={
    id:newId('TRQ',treasury),purpose:p,amount:a,
    notes:document.getElementById('tn').value,
    deadline:document.getElementById('td').value||null,
    user_id:cu.id,user_name:cu.name,team:cu.team,status:'pending'
  };
  sbPost('treasury',req).then(function(){
    document.getElementById('tp').value='';
    document.getElementById('ta').value='';
    document.getElementById('tn').value='';
    document.getElementById('td').value='';
    showToast('Request submitted!','success');
    loadAllData(renderAll);
  });
}

function deleteTreasury(id){
  sbDelete('treasury','id=eq.'+encodeURIComponent(id)).then(function(){
    showToast('Request deleted','success');
    loadAllData(renderAll);
  });
}

function populateTrFilters(){
  var ts=document.getElementById('trTeam');if(!ts)return;
  ts.innerHTML='<option value="">ALL TEAMS</option>';
  TEAMS().forEach(function(t){var o=document.createElement('option');o.value=t;o.textContent=t;ts.appendChild(o);});
}

function renderTReview(){
  if(!hasPerm('canViewAllTreasury')&&!isAdmin())return;
  var q=document.getElementById('trSrch')?document.getElementById('trSrch').value.toLowerCase():'';
  var tf=document.getElementById('trTeam')?document.getElementById('trTeam').value:'';
  var sf=document.getElementById('trStatus')?document.getElementById('trStatus').value:'';
  var f=treasury.filter(function(t){
    var mq=!q||(t.purpose.toLowerCase().indexOf(q)>=0||t.user_name.toLowerCase().indexOf(q)>=0);
    var mt=!tf||t.team===tf;var ms=!sf||t.status===sf;
    return mq&&mt&&ms;
  });
  document.getElementById('trTbl').innerHTML=f.length
    ?f.map(function(t){
      return '<tr><td style="color:var(--tx3);font-size:8px;">'+t.id+'</td><td>'+t.purpose+'</td>'+
        '<td style="font-weight:700;">₹'+Number(t.amount).toLocaleString()+'</td>'+
        '<td>'+tb(t.team)+'</td><td>'+t.user_name+'</td>'+
        '<td>'+dlStr(t.deadline)+'</td><td>'+stBdg(t.status)+'</td>'+
        '<td>'+(t.status==='pending'&&hasPerm('canApproveTreasury')
          ?'<button class="btn-sm btn-g" onclick="updT(\''+t.id+'\',\'approved\')" style="margin-right:3px;">✓</button>'+
            '<button class="btn-sm btn-r" onclick="updT(\''+t.id+'\',\'rejected\')">✗</button>'
          :'')+'</td></tr>';
    }).join('')
    :'<tr><td colspan="8" style="color:var(--tx3);font-size:9px;text-align:center;padding:12px;">No requests found</td></tr>';
}

function updT(id,status){
  sbPatch('treasury',{status:status},'id=eq.'+encodeURIComponent(id)).then(function(){
    showToast(status==='approved'?'Approved!':'Rejected','success');
    loadAllData(renderAll);
  });
}

/* ── LINKS ──────────────────────────────────────────────── */
function renderLinks(){
  var cats=[],seen={};
  links.forEach(function(l){if(!seen[l.cat]){seen[l.cat]=1;cats.push(l.cat);}});
  if(!links.length){document.getElementById('linksContent').innerHTML='<div style="color:var(--tx3);font-size:9px;text-align:center;padding:20px;">No links added yet</div>';return;}
  var h='';
  cats.forEach(function(cat){
    h+='<div class="sc" style="margin-top:10px;">'+cat.toUpperCase()+'</div>';
    links.filter(function(l){return l.cat===cat;}).forEach(function(l){
      h+='<div class="link-card">'+
        '<div><div class="link-title">'+(l.title||'Link')+'</div>'+
        '<div class="link-desc">'+(l.description||'')+'</div>'+
        '<div class="link-cat">'+l.cat+'</div></div>'+
        '<div style="display:flex;align-items:center;gap:6px;">'+
        '<a class="link-open" href="'+l.url+'" target="_blank" rel="noopener">Open →</a>'+
        (hasPerm('canAddLinks')?'<button class="btn-sm btn-r" onclick="delLink(\''+l.id+'\')">✕</button>':'')+
        '</div></div>';
    });
  });
  document.getElementById('linksContent').innerHTML=h;
}

function addLink(){
  var t=document.getElementById('lk-t').value.trim();
  var u=document.getElementById('lk-u').value.trim();
  if(!t||!u)return;
  var lnk={id:newId('LK',links),title:t,url:u,description:document.getElementById('lk-d').value,cat:document.getElementById('lk-c').value};
  sbPost('links',lnk).then(function(){
    document.getElementById('lk-t').value='';
    document.getElementById('lk-u').value='';
    document.getElementById('lk-d').value='';
    showToast('Link added!','success');
    loadAllData(renderLinks);
  });
}

function delLink(id){
  sbDelete('links','id=eq.'+encodeURIComponent(id)).then(function(){
    showToast('Link removed','success');
    loadAllData(renderLinks);
  });
}

/* ── USERS (master only) ─────────────────────────────────── */
function renderUsers(){
  if(!isMaster())return;
  var ss='background:var(--bg3);border:1px solid var(--bdr);border-radius:4px;padding:3px 6px;font-size:9px;color:var(--tx);font-family:inherit;outline:none;';
  document.getElementById('uTbl').innerHTML=USERS.map(function(u){
    var tOpts=TEAM_NAMES.map(function(t){return '<option value="'+t+'"'+(u.team===t?' selected':'')+'>'+t+'</option>';}).join('');
    var rOpts=['member','manager','admin'].map(function(r){return '<option value="'+r+'"'+(u.role===r?' selected':'')+'>'+r.toUpperCase()+'</option>';}).join('');
    return '<tr>'+
      '<td style="color:var(--ac);font-size:9px;">@'+u.username+'</td>'+
      '<td><div style="display:flex;align-items:center;gap:6px;"><div class="av">'+initials(u.name)+'</div>'+u.name+'</div></td>'+
      '<td><span style="font-size:9px;background:var(--bg3);padding:2px 6px;border-radius:4px;color:var(--tx2);">'+u.password+'</span></td>'+
      '<td>'+(u.role==='master'?'<span style="color:var(--tx3);font-size:8px;">—</span>':tb(u.team))+'</td>'+
      '<td>'+rb(u.role)+'</td>'+
      '<td>'+(u.role!=='master'?'<select onchange="changeTeam(\''+u.id+'\',this.value)" style="'+ss+'"><option value="">Change...</option>'+tOpts+'</select>':'')+'</td>'+
      '<td>'+(u.role!=='master'?'<select onchange="changeRole(\''+u.id+'\',this.value)" style="'+ss+'">'+rOpts+'</select>':'')+'</td>'+
      '<td>'+(u.role!=='master'?'<button class="btn-sm btn-r" onclick="deleteUser(\''+u.id+'\')">✕</button>':'')+'</td></tr>';
  }).join('');
  renderRolePerms();
}

function renderRolePerms(){
  var el=document.getElementById('rolePermsPanel');if(!el)return;
  var PERM_LABELS={
    canApproveTreasury:'Approve Treasury Requests',
    canManageInventory:'Manage Inventory (Add/Remove)',
    canModerateTasks:'Moderate Tasks (Edit/Delete any)',
    canAddLinks:'Add / Remove Links',
    canViewAllTreasury:'View All Teams Treasury',
    canViewAllTeams:'View All Teams Work Log'
  };
  var roles=['admin','manager','member'];
  var h='<div style="overflow-x:auto;"><table><thead><tr><th>PERMISSION</th>';
  roles.forEach(function(r){h+='<th style="text-align:center;">'+r.toUpperCase()+'</th>';});
  h+='</tr></thead><tbody>';
  Object.keys(PERM_LABELS).forEach(function(p){
    h+='<tr><td style="font-size:9px;color:var(--tx2);">'+PERM_LABELS[p]+'</td>';
    roles.forEach(function(r){
      var checked=rolePerms[r]&&rolePerms[r][p];
      h+='<td style="text-align:center;"><input type="checkbox"'+(checked?' checked':'')+
        ' onchange="togglePerm(\''+r+'\',\''+p+'\',this.checked)" style="cursor:pointer;width:14px;height:14px;accent-color:var(--ac);"/></td>';
    });
    h+='</tr>';
  });
  h+='</tbody></table></div>';
  el.innerHTML='<div class="tw">'+h+'</div>';
}

var PERM_DB_MAP={
  canApproveTreasury:'can_approve_treasury',
  canManageInventory:'can_manage_inventory',
  canModerateTasks:'can_moderate_tasks',
  canAddLinks:'can_add_links',
  canViewAllTreasury:'can_view_all_treasury',
  canViewAllTeams:'can_view_all_teams'
};

function togglePerm(role,perm,val){
  if(!rolePerms[role])rolePerms[role]={};
  rolePerms[role][perm]=val;
  var patch={};patch[PERM_DB_MAP[perm]]=val;
  sbPatch('role_perms',patch,'role=eq.'+role).then(function(){
    showToast('Permission updated','success');
  });
}

function changeTeam(id,team){
  if(!team)return;
  sbPatch('users',{team:team},'id=eq.'+encodeURIComponent(id)).then(function(){
    showToast('Team updated','success');
    loadAllData(renderUsers);
  });
}

function changeRole(id,role){
  if(!role)return;
  sbPatch('users',{role:role},'id=eq.'+encodeURIComponent(id)).then(function(){
    showToast('Role updated','success');
    loadAllData(renderUsers);
  });
}

function createUser(){
  var n=document.getElementById('un').value.trim();
  var un=document.getElementById('uu').value.trim().toLowerCase();
  var pw=document.getElementById('upw').value.trim();
  if(!n||!un||!pw){document.getElementById('ucMsg').textContent='Fill all fields';return;}
  if(USERS.filter(function(u){return u.username===un;}).length){
    document.getElementById('ucMsg').textContent='Username already taken';return;
  }
  userCount++;
  var id='USR-'+String(userCount).padStart(4,'0');
  var u={id:id,name:n,username:un,password:pw,team:document.getElementById('ut').value,role:document.getElementById('ur').value};
  sbPost('users',u).then(function(){
    document.getElementById('un').value='';
    document.getElementById('uu').value='';
    document.getElementById('upw').value='';
    document.getElementById('ucMsg').textContent='✓ Created — @'+un+' / '+pw;
    setTimeout(function(){document.getElementById('ucMsg').textContent='';},5000);
    showToast('User created!','success');
    loadAllData(renderUsers);
  });
}

function deleteUser(id){
  if(!isMaster())return;
  sbDelete('users','id=eq.'+encodeURIComponent(id)).then(function(){
    showToast('User deleted','success');
    loadAllData(renderUsers);
  });
}
