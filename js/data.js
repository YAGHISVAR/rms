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
  // { id:'USR-0002', name:'Name Here', username:'username', password:'password', team:'ROVIO', role:'member' },
];

var DEFAULT_INVENTORY = [
  // ── Add components using the app (INV MGMT tab) ──
];

var DEFAULT_LINKS = [
  { id:'LK-001', title:'Reimbursement Form',   url:'https://forms.google.com', desc:'Submit reimbursement requests', cat:'Finance'     },
  { id:'LK-002', title:'Bill Submission',       url:'https://drive.google.com', desc:'Upload bills and receipts',     cat:'Finance'     },
  { id:'LK-003', title:'Alumni Network',        url:'https://linkedin.com',     desc:'Connect with RMI alumni',       cat:'Alumni'      },
  { id:'LK-004', title:'Competition Resources', url:'https://robocon.in',       desc:'ABU Robocon official site',     cat:'Competition' },
  // ── Add more links here ──
];

var TEAM_NAMES = [
  'ROVIO','DRONE','BARNES','AMR','CORE','OMEGA'
];

var TEAM_COLORS = {
  ROVIO:'#4A8FE8', DRONE:'#2EAA82', BARNES:'#D4920A',
  AMR:'#E05252',   CORE:'#9B6FD4',  OMEGA:'#2EA8C4',
  ALPHA:'#4A8FE8', BETA:'#2EAA82',  GAMMA:'#D4920A', DELTA:'#E05252',
  SIGMA:'#9B6FD4', ZETA:'#D4629B',  ETA:'#5EAA3C',
  THETA:'#C47A2E', IOTA:'#4A70C8',  KAPPA:'#2E9E7A', LAMBDA:'#C45252'
};

// ── ROLE HIERARCHY ───────────────────────────────────────────
// Four levels: master > admin > manager > member
// Master can edit what each role can do (except master itself).
// Permissions are stored and editable from the Users panel.

var DEFAULT_ROLE_PERMISSIONS = {
  admin: {
    label:        'Admin',
    canApproveTreasury:  true,
    canManageInventory:  true,
    canModerateTasks:    true,
    canAddLinks:         true,
    canViewAllTreasury:  true,
    canViewAllTeams:     true,
  },
  manager: {
    label:        'Manager',
    canApproveTreasury:  false,
    canManageInventory:  true,
    canModerateTasks:    false,
    canAddLinks:         false,
    canViewAllTreasury:  false,
    canViewAllTeams:     true,
  },
  member: {
    label:        'Member',
    canApproveTreasury:  false,
    canManageInventory:  false,
    canModerateTasks:    false,
    canAddLinks:         false,
    canViewAllTreasury:  false,
    canViewAllTeams:     true,
  }
};

// ── PERSISTENT STORAGE ──────────────────────────────────────
// Data is saved to localStorage so it survives page refresh.
// On first visit, DEFAULT data is loaded.

function loadData() {
  var raw = localStorage.getItem('rms_data');
  if (raw) {
    try {
      var d        = JSON.parse(raw);
      USERS        = d.users        || DEFAULT_USERS;
      inventory    = d.inventory    || DEFAULT_INVENTORY;
      transactions = d.transactions || [];
      tasks        = d.tasks        || [];
      treasury     = d.treasury     || [];
      links        = d.links        || DEFAULT_LINKS;
      userCount    = d.userCount    || 1;
      rolePerms    = d.rolePerms    || JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS));
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
    userCount:    userCount,
    rolePerms:    rolePerms
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
  rolePerms    = JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS));
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
var rolePerms    = JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS));

var APP_VERSION = '1.0'; // ← bump this when you deploy updates

// Load on startup
loadData();
