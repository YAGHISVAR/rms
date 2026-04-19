/* ============================================================
   RMS — data.js  |  Supabase Cloud Database
   All data is now stored in Supabase — shared across all devices.
   ============================================================ */

var SUPABASE_URL = 'https://ejhocvrxgznjypqyhujv.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqaG9jdnJ4Z3puanlwcXlodWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MTQ0OTAsImV4cCI6MjA5MjE5MDQ5MH0.IGzMVlfBAnlnyPR2GLYzDgRyNCsZ3Faky2fjRyrggfo';

var TEAM_NAMES = ['ROVIO','DRONE','BARNES','AMR','CORE','OMEGA'];

var TEAM_COLORS = {
  ROVIO:'#4A8FE8', DRONE:'#2EAA82', BARNES:'#D4920A',
  AMR:'#E05252',   CORE:'#9B6FD4',  OMEGA:'#2EA8C4',
  ALPHA:'#4A8FE8', BETA:'#2EAA82',  GAMMA:'#D4920A',
  DELTA:'#E05252', SIGMA:'#9B6FD4', ZETA:'#D4629B',
  ETA:'#5EAA3C',   THETA:'#C47A2E', IOTA:'#4A70C8',
  KAPPA:'#2E9E7A', LAMBDA:'#C45252'
};

function sbFetch(method, table, body, query) {
  var url = SUPABASE_URL + '/rest/v1/' + table + (query ? '?' + query : '');
  var opts = {
    method: method,
    headers: {
      'apikey':        SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Content-Type':  'application/json',
      'Prefer':        method === 'POST' ? 'return=representation' : 'return=minimal'
    }
  };
  if (body) opts.body = JSON.stringify(body);
  return fetch(url, opts).then(function(r) {
    return r.text().then(function(t) {
      if (!t) return [];
      try { return JSON.parse(t); } catch(e) { return []; }
    });
  });
}

function sbGet(table, query)     { return sbFetch('GET',   table, null, query || 'order=id'); }
function sbPost(table, body)     { return sbFetch('POST',  table, body); }
function sbPatch(table, body, q) { return sbFetch('PATCH', table, body, q); }
function sbDelete(table, query)  { return sbFetch('DELETE',table, null, query); }

var USERS        = [];
var inventory    = [];
var transactions = [];
var tasks        = [];
var treasury     = [];
var links        = [];
var rolePerms    = {};
var userCount    = 0;
var cu           = null;

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
    USERS        = res[0] || [];
    inventory    = res[1] || [];
    transactions = res[2] || [];
    tasks        = res[3] || [];
    treasury     = res[4] || [];
    links        = res[5] || [];
    rolePerms    = {};
    (res[6] || []).forEach(function(rp) {
      rolePerms[rp.role] = {
        label:              rp.label,
        canApproveTreasury: rp.can_approve_treasury,
        canManageInventory: rp.can_manage_inventory,
        canModerateTasks:   rp.can_moderate_tasks,
        canAddLinks:        rp.can_add_links,
        canViewAllTreasury: rp.can_view_all_treasury,
        canViewAllTeams:    rp.can_view_all_teams
      };
    });
    userCount = USERS.length;
    showLoader(false);
    if (callback) callback();
  }).catch(function(e) {
    showLoader(false);
    console.error('Load error:', e);
    showToast('Connection error. Check internet.', 'error');
  });
}

function showLoader(show) {
  var el = document.getElementById('globalLoader');
  if (el) el.style.display = show ? 'flex' : 'none';
}

function showToast(msg, type) {
  var t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);' +
    'background:'+(type==='error'?'#E05252':'#2EAA82')+';color:#fff;padding:8px 16px;' +
    'border-radius:6px;font-size:10px;font-family:Courier New,monospace;z-index:9999;letter-spacing:0.5px;';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function() { t.remove(); }, 3000);
}

function newId(prefix, arr) {
  var max = 0;
  arr.forEach(function(x) {
    var n = parseInt((x.id || '').replace(prefix+'-','')) || 0;
    if (n > max) max = n;
  });
  return prefix + '-' + String(max + 1).padStart(3,'0');
}

function saveSession(username) { localStorage.setItem('rms_session', username); }
function clearSession()        { localStorage.removeItem('rms_session'); }
function getSavedSession()     { return localStorage.getItem('rms_session'); }
