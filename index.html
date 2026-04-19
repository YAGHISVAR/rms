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
  { id:'USR-0001', name:'Arjun R.',  username:'master', password:'master123', team:'—',     role:'master' },
  { id:'USR-0002', name:'Priya S.',  username:'priya',  password:'admin123',  team:'ALPHA',  role:'admin'  },
  { id:'USR-0003', name:'Kiran M.',  username:'kiran',  password:'admin123',  team:'BETA',   role:'admin'  },
  { id:'USR-0004', name:'Ravi T.',   username:'ravi',   password:'pass123',   team:'GAMMA',  role:'member' },
  { id:'USR-0005', name:'Sneha L.',  username:'sneha',  password:'pass123',   team:'ALPHA',  role:'member' },
  { id:'USR-0006', name:'Dev P.',    username:'dev',    password:'pass123',   team:'BETA',   role:'member' },
  { id:'USR-0007', name:'Arun K.',   username:'arun',   password:'pass123',   team:'DELTA',  role:'member' },
  { id:'USR-0008', name:'Meera J.',  username:'meera',  password:'pass123',   team:'SIGMA',  role:'member' },
  // ── Add more users here ──
  // { id:'USR-0009', name:'Name Here', username:'username', password:'password', team:'ALPHA', role:'member' },
];

var DEFAULT_INVENTORY = [
  { id:'INV-001', name:'Servo SG90',          qty:20,  unit:'pcs', cat:'Electronics' },
  { id:'INV-002', name:'Arduino Mega',         qty:5,   unit:'pcs', cat:'Electronics' },
  { id:'INV-003', name:'L298N Motor Driver',   qty:8,   unit:'pcs', cat:'Electronics' },
  { id:'INV-004', name:'LiPo 3S Battery',      qty:3,   unit:'pcs', cat:'Power'       },
  { id:'INV-005', name:'Aluminium Sheet 1mm',  qty:10,  unit:'m',   cat:'Materials'   },
  { id:'INV-006', name:'M3 Bolts',             qty:200, unit:'pcs', cat:'Fasteners'   },
  { id:'INV-007', name:'Ultrasonic HC-SR04',   qty:12,  unit:'pcs', cat:'Sensors'     },
  { id:'INV-008', name:'IR Sensor',            qty:15,  unit:'pcs', cat:'Sensors'     },
  { id:'INV-009', name:'12V DC Motor',         qty:6,   unit:'pcs', cat:'Electronics' },
  { id:'INV-010', name:'Steel Rod 10mm',       qty:5,   unit:'m',   cat:'Materials'   },
  { id:'INV-011', name:'Soldering Wire',       qty:500, unit:'g',   cat:'Tools'       },
  { id:'INV-012', name:'Jumper Wires',         qty:100, unit:'pcs', cat:'Electronics' },
  // ── Add more components here ──
];

var DEFAULT_LINKS = [
  { id:'LK-001', title:'Reimbursement Form',   url:'https://forms.google.com', desc:'Submit reimbursement requests', cat:'Finance'     },
  { id:'LK-002', title:'Bill Submission',       url:'https://drive.google.com', desc:'Upload bills and receipts',     cat:'Finance'     },
  { id:'LK-003', name:'Alumni Network',         url:'https://linkedin.com',     desc:'Connect with RMI alumni',       cat:'Alumni'      },
  { id:'LK-004', title:'Competition Resources', url:'https://robocon.in',       desc:'ABU Robocon official site',     cat:'Competition' },
  // ── Add more links here ──
];

var TEAM_NAMES = [
  'ALPHA','BETA','GAMMA','DELTA','SIGMA','OMEGA',
  'ZETA','ETA','THETA','IOTA','KAPPA','LAMBDA'
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
      userCount   = d.userCount    || USERS.length;
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
  userCount    = USERS.length;
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
