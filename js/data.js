/* ============================================================
   RMS — data.js  |  Supabase Cloud Database
   ============================================================ */

var SUPABASE_URL = 'https://ejhocvrxgznjypqyhujv.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqaG9jdnJ4Z3puanlwcXlodWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MTQ0OTAsImV4cCI6MjA5MjE5MDQ5MH0.IGzMVlfBAnlnyPR2GLYzDgRyNCsZ3Faky2fjRyrggfo';

var TEAM_NAMES = ['ROVIO','DRONE','BARNES','AMR','CORE','OMEGA'];

var TEAM_COLORS = {
  ROVIO:'#3B82F6', DRONE:'#10B981', BARNES:'#F59E0B',
  AMR:'#EF4444',   CORE:'#8B5CF6',  OMEGA:'#06B6D4',
  GENERAL:'#6B7280'
};

/* ── THEME ── */
function getTheme(){ return localStorage.getItem('rms_theme')||'dark'; }
function setTheme(t){
  localStorage.setItem('rms_theme',t);
  document.documentElement.setAttribute('data-theme',t);
  var btn=document.getElementById('themeToggle');
  if(btn) btn.textContent = t==='dark' ? '☀ Light' : '☾ Dark';
}
function toggleTheme(){ setTheme(getTheme()==='dark'?'light':'dark'); }

/* ── SUPABASE ── */
function sbFetch(method, table, body, query) {
  var url = SUPABASE_URL + '/rest/v1/' + table + (query ? '?' + query : '');
  return fetch(url, {
    method: method,
    headers: {
      'apikey':        SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Content-Type':  'application/json',
      'Prefer':        'return=representation'
    },
    body: body ? JSON.stringify(body) : undefined
  }).then(function(r) {
    return r.text().then(function(t) {
      if (!t) return [];
      try { return JSON.parse(t); } catch(e) { return []; }
    });
  });
}

function sbGet(table, query)     { return sbFetch('GET',   table, null, query||'order=id'); }
function sbPost(table, body)     { return sbFetch('POST',  table, body); }
function sbPatch(table, body, q) { return sbFetch('PATCH', table, body, q); }
function sbDelete(table, query)  { return sbFetch('DELETE',table, null, query); }

/* ── LIVE DATA ── */
var USERS=[], inventory=[], transactions=[], tasks=[], treasury=[], links=[], rolePerms={}, userCount=0, cu=null;

function loadAllData(callback) {
  showLoader(true);
  Promise.all([
    sbGet('users'),
    sbGet('inventory'),
    sbGet('transactions','order=created_at.desc&limit=100'),
    sbGet('tasks'),
    sbGet('treasury'),
    sbGet('links'),
    sbGet('role_perms')
  ]).then(function(res) {
    USERS        = res[0]||[];
    inventory    = res[1]||[];
    transactions = res[2]||[];
    tasks        = res[3]||[];
    treasury     = res[4]||[];
    links        = res[5]||[];
    rolePerms    = {};
    (res[6]||[]).forEach(function(rp){
      rolePerms[rp.role]={
        label:              rp.label,
        canApproveTreasury: rp.can_approve_treasury,
        canManageInventory: rp.can_manage_inventory,
        canModerateTasks:   rp.can_moderate_tasks,
        canAddLinks:        rp.can_add_links,
        canViewAllTreasury: rp.can_view_all_treasury,
        canViewAllTeams:    rp.can_view_all_teams
      };
    });
    userCount=USERS.length;
    showLoader(false);
    if(callback) callback();
  }).catch(function(e){
    console.error('Load error:',e);
    showLoader(false);
    if(callback) callback();
  });
}

function showLoader(show){
  var el=document.getElementById('globalLoader');
  if(el) el.style.display=show?'flex':'none';
}

function showToast(msg,type){
  var t=document.createElement('div');
  t.style.cssText='position:fixed;bottom:20px;left:50%;transform:translateX(-50%);'+
    'background:'+(type==='error'?'var(--rd)':'var(--gn)')+';color:#fff;padding:9px 18px;'+
    'border-radius:8px;font-size:11px;font-family:inherit;z-index:9999;letter-spacing:0.3px;font-weight:500;box-shadow:0 4px 12px rgba(0,0,0,0.2);';
  t.textContent=msg;
  document.body.appendChild(t);
  setTimeout(function(){t.remove();},3000);
}

function newId(prefix,arr){
  return prefix+'-'+String(Date.now()).slice(-8);
}

function saveSession(u){ localStorage.setItem('rms_session',u); }
function clearSession(){ localStorage.removeItem('rms_session'); }
function getSavedSession(){ return localStorage.getItem('rms_session'); }
