/* ============================================================
   RMS — data.js
   All app data lives here. Edit this file to:
   - Add/remove users
   - Pre-load inventory
   - Add default links
   Data is saved to localStorage so it persists between sessions.
   ============================================================ */

// ── DEFAULT DATA (used only on first load) ──────────────────

var DEFAULT_USERS = [
  { id:'USR-0001', name:'Master Admin', username:'master', password:'rmi_pinnacle', team:'—', role:'master' },
  // ── Add more users here (use the app as Master Admin) ──
  // { id:'USR-0002', name:'Name Here', username:'username', password:'password', team:'ALPHA', role:'member' },
];

var DEFAULT_INVENTORY = [
  // ── Add components using the app (INV MGMT tab) ──
];

var DEFAULT_LINKS = [
  { id:'LK-001', title:'Reimbursement Form',   url:'https://forms.google.com', desc:'Submit reimbursement requests', cat:'Finance'     },
  { id:'LK-002', title:'Bill Submission',       url:'https://drive.google.com', desc:'Upload bills and receipts',     cat:'Finance'     },
  { id:'LK-003', name:'Alumni Network',         url:'https://linkedin.com',     desc:'Connect with RMI alumni',       cat:'Alumni'      },
  { id:'LK-004', title:'Competition Resources', url:'https://robocon.in',       desc:'ABU Robocon official site',     cat:'Competition' },
  // ── Add more links here ──
];

var TEAM_NAMES = [
  'ROVIO','DRONE','BARNES','AMR','CORE','OMEGA'
];

var TEAM_COLORS = {
  ALPHA:'#4A8FE8', BETA:'#2EAA82',  GAMMA:'#D4920A', DELTA:'#E05252',
  SIGMA:'#9B6FD4', OMEGA:'#2EA8C4', ZETA:'#D4629B',  ETA:'#5EAA3C',
  THETA:'#C47A2E', IOTA:'#4A70C8',  KAPPA:'#2E9E7A', LAMBDA:'#C45252'
};

// ── PERSISTENT STORAGE ──────────────────────────────────────
// Data is saved to localStorage so it survives page refresh.
// On first visit, DEFAULT data is loaded.

function loadData() {
  var raw = localStorage.getItem('rms_data');
  if (raw) {
    try {
      var d = JSON.parse(raw);
      USERS       = d.users        || DEFAULT_USERS;
      inventory   = d.inventory    || DEFAULT_INVENTORY;
      transactions= d.transactions || [];
      tasks       = d.tasks        || [];
      treasury    = d.treasury     || [];
      links       = d.links        || DEFAULT_LINKS;
      userCount   = d.userCount    || 1;
    } catch(e) {
      resetToDefaults();
    }
  } else {
    resetToDefaults();
  }
}

function saveData() {
  localStorage.setItem('rms_data', JSON.stringify({
    users:        USERS,
    inventory:    inventory,
    transactions: transactions,
    tasks:        tasks,
    treasury:     treasury,
    links:        links,
    userCount:    userCount
  }));
}

function resetToDefaults() {
  USERS        = JSON.parse(JSON.stringify(DEFAULT_USERS));
  inventory    = JSON.parse(JSON.stringify(DEFAULT_INVENTORY));
  transactions = [];
  tasks        = [];
  treasury     = [];
  links        = JSON.parse(JSON.stringify(DEFAULT_LINKS));
  userCount    = 1;
  saveData();
}

// ── LIVE DATA ARRAYS (populated by loadData) ─────────────────
var USERS        = [];
var inventory    = [];
var transactions = [];
var tasks        = [];
var treasury     = [];
var links        = [];
var userCount    = 0;

// Load on startup
loadData();
