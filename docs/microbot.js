const $ = document.getElementById.bind(document);

var db_warnings = $("debug_warnings");
var db_microbot = $("debug_microbot");

var bot;
var startpad;

var output_elem = $("output");
function output(str, nl, noflush) {
  if (!output.cache) output.cache = "";
  if (output.ret) output.cache += "\n";
  output.ret = nl;
  output.cache += str;
  if (!noflush) {
    output_elem.value += output.cache;
    output_elem.scrollTop = output_elem.scrollHeight;
    output.cache = "";
  }
}

$("flush").addEventListener("click", (e) => output(""));

const rows = 25;
const cols = 25;
const map_code_length = Math.ceil(((rows - 2) * (cols - 2)) / 6);

var cell_elems = [];

var table_elem = $("table");

for (var i = 0; i < rows; ++i) {
  var rowtag = document.createElement("tr");
  rowtag.className = "tablerow";
  var row_elem = table_elem.appendChild(rowtag);
  var row_elems = [];
  for (var j = 0; j < cols; ++j) {
    var tdtag = document.createElement("td");
    tdtag.className = "cell";
    var td_elem = row_elem.appendChild(tdtag);
    var celltag = document.createElement("div");
    celltag.className = "empty";
    row_elems.push(td_elem.appendChild(celltag));
  }
  cell_elems.push(row_elems);
}

var floormap = [];
for (var i = 0; i < rows; ++i) floormap.push([]);

function oncellmousepressgen(i, j) {
  return (e) => {
    if (i == 0 || j == 0 || i == rows - 1 || j == cols - 1) return;
    if (startpad && startpad[0] == i && startpad[1] == j) return;
    if (e.buttons & 1) {
      if (e.shiftKey) {
        setstartloc(i, j);
        return;
      }
      if (floormap[i][j] !== 1) {
        floormap[i][j] = 1;
        drawfloor();
      }
    }
    if (e.buttons & 2) {
      if (floormap[i][j] !== 0) {
        floormap[i][j] = 0;
        drawfloor();
      }
    }
  };
}

function setstartloc(i, j) {
  if (startpad) cell_elems[startpad[0]][startpad[1]].className = "empty";
  floormap[i][j] = 0;
  cell_elems[i][j].className = "startpad";
  startpad = [i, j];
}

for (var i = 0; i < rows; ++i) {
  for (var j = 0; j < cols; ++j) {
    cell_elems[i][j].addEventListener("mouseover", oncellmousepressgen(i, j));
    cell_elems[i][j].addEventListener("mousedown", oncellmousepressgen(i, j));
  }
}

function drawfloor() {
  var next_startpad =
    startpad && !floormap[startpad[0]][startpad[1]]
      ? [startpad[0], startpad[1]]
      : null;
  for (var i = 0; i < rows; ++i) {
    for (var j = 0; j < cols; ++j) {
      if (floormap[i][j]) cell_elems[i][j].className = "wall";
      else {
        cell_elems[i][j].className = "empty";
        if (!next_startpad) next_startpad = [i, j];
      }
    }
  }
  if (!next_startpad) {
    startpad = undefined;
    return false;
  }
  startpad = next_startpad;
  cell_elems[startpad[0]][startpad[1]].className = "startpad";
  return true;
}

function savefloormap() {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  function gf(a) {
    if (a >= (rows - 2) * (cols - 2)) return 0;
    return floormap[Math.floor(a / (cols - 2)) + 1][(a % (cols - 2)) + 1];
  }
  var savestr = "";
  for (var i = 0; i < (rows - 2) * (cols - 2); i += 6) {
    savestr +=
      charset[
        gf(i) +
          2 * gf(i + 1) +
          4 * gf(i + 2) +
          8 * gf(i + 3) +
          16 * gf(i + 4) +
          32 * gf(i + 5)
      ];
  }
  return savestr;
}

function loadfloormap(code) {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  var hasEmpty = false;
  function sf(a, b) {
    if (a >= (rows - 2) * (cols - 2)) return;
    floormap[Math.floor(a / (cols - 2)) + 1][(a % (cols - 2)) + 1] = b;
    if (b === 0) hasEmpty = true;
  }
  for (var i = 0; i < code.length; ++i) {
    var c = charset.indexOf(code[i]);
    if (c === -1) {
      output("ERROR: map code contains invalid characters.", true);
      return false;
    }
    for (var j = 0; j < 6; ++j) {
      sf(6 * i + j, c % 2);
      c = Math.floor(c / 2);
    }
  }
  if (!hasEmpty) {
    output("ERROR: no place for starting pad", true);
    return false;
  }
  for (var i = 0; i < rows; ++i) floormap[i][0] = floormap[i][cols - 1] = 1;
  for (var i = 0; i < cols; ++i) floormap[0][i] = floormap[rows - 1][i] = 1;
  drawfloor();
  return true;
}

const puzzlemaps = [
  "_f___v___3___7___9___-__f___v___3___7___9___-__f___v___3___7___9___-__f___v___3___7___9_B",
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  "_f___H___B__fA__HA__BA_fAA_HAA_BAAfAAAHAAABAAABAAwBAA8BAA_BAw_BA8_BA__Bw__B8__B___x___9_B",
  "UERsqqiQdV_jgKC5eVNAgq-_fXCiIadF1po-qWVQE66bfBANoL_yFFAtu6_SUBx9qsCQdUfrKriEhUc_1rogC0FHB",
  "8AAAMAAAGAAADcAgBOAwA__YA_fAAAAAAAAAAAAAAAAAIADAEgBACwDAB4BgHMAQAGAIAAAEAAACAAABAAgAAAQAA",
  "DAAECAEBBACAHABgEgDQA_HIAgDCAQgQAQAQAQAIAIAIAIAUACAF4AQACwEAB-BA_JAAQkAAAOADAIAHEAgPDAw_B",
  "AAAAAAAAAAwA_PYg_HAw_DAAAAAAAAAAAAAAAAAAAPAAgHAAwDwBwA4AYAcAeAAAPAAgHAAAAAQAAAAAAAAAAAAAA",
  "AAARAgDUIBGRgDUYgAEYAQA4DAAADAAQiAAEqHBBCAhCAAgAAABIEgAA-QcAQkB4PgAEAQAGEQEHGwBOQAAEAAAEA",
];

function normalize_map_code(code) {
  if (!code) return "";
  var trimmed = code.trim();
  if (trimmed.startsWith("#")) trimmed = trimmed.substring(1);
  return trimmed;
}

function initmap(code) {
  const dbwarn = db_warnings.checked;
  const normalized_code = normalize_map_code(code);
  if (normalized_code.length !== map_code_length) {
    if (dbwarn) output("ERROR: invalid map code; loading aborted.", true);
    return false;
  }
  if (!loadfloormap(normalized_code)) {
    return false;
  }
  return true;
}

initmap(puzzlemaps[0]);

// $("clearmap").addEventListener("click", (e) => drawfloor());

// const clearmapcode = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
// $("clearmap").addEventListener("click", e => {loadfloormap(clearmapcode); output("Map cleared.", true);});
// const fillmapcode = "-_______________________________________________________________________________________B";
// $("fillmap").addEventListener("click", e => {loadfloormap(fillmapcode); output("Map filled.", true);});

var map_buttons_wrap = $("mapbuttons");

function selectmap_maker(a) {
  return (e) => {
    initmap(puzzlemaps[a]);
    output("Selected map " + a, true);
  };
}

for (var i = 0; i < puzzlemaps.length; ++i) {
  var buttontag = document.createElement("button");
  buttontag.innerText = "map" + i;
  map_buttons_wrap
    .appendChild(buttontag)
    .addEventListener("click", selectmap_maker(i));
}

$("importmap").addEventListener("click", () => {
  var code = prompt("Enter map code");
  if (code === null) return;
  if (!initmap(code)) {
    alert(
      "Invalid map code. Please ensure you pasted the full code from Export Map.",
    );
  } else {
    output("Imported map from code.", true);
  }
});

$("exportmap").addEventListener("click", () => {
  var code = savefloormap();
  prompt("Copy this map code", code);
});

var rules_elem = $("rules");

var rules_code = localStorage.getItem("saved_code");

function reset_rules(ask) {
  if (!reset_rules.default_rules)
    reset_rules.default_rules = `# You can drag files into this box

# Comments start with '#'

# Remember that rules are formatted as
# State Surroundings -> Move NewState

# Microbot starts in state 0.
# Here, state 0 goes N as far as possible

0 -*** -> N 0   # if there's nothing to the N, go N
0 N*** -> X 1   # if N is blocked, switch to state 1

# and state 1 goes S as far as possible

1 ***- -> S 1   # if there's nothing to the S, go S
1 ***S -> X 0   # otherwise, switch to state 0`;
  if (!ask || confirm("Reset the rules box to its default values?")) {
    rules_elem.value = reset_rules.default_rules;
    save_code();
  }
}

if (rules_code) rules_elem.value = rules_code;
else reset_rules(false);

function save_code() {
  localStorage.setItem("saved_code", rules_elem.value);
}

rules_elem.addEventListener("keyup", save_code);
rules_elem.addEventListener("change", save_code);

$("resetrules").addEventListener("click", reset_rules);

var switch_editor_elem = $("switchmode");
var rules_wrapper_elem = $("ruleswrap");

function enable_ide() {
  TLN.append_line_numbers("rules");
  switch_editor_elem.innerText = "Hide line #'s";
  rules_wrapper_elem.classList.remove("plain");
  rules_wrapper_elem.classList.add("ide");
  rules_elem.classList.remove("plain");
  switch_editor_elem.addEventListener("click", disable_ide, { once: true });
}

function disable_ide() {
  TLN.remove_line_numbers("rules");
  switch_editor_elem.innerText = "Show line #'s";
  rules_wrapper_elem.classList.remove("ide");
  rules_wrapper_elem.classList.add("plain");
  rules_elem.classList.add("plain");
  switch_editor_elem.addEventListener("click", enable_ide, { once: true });
}

switch_editor_elem.addEventListener("click", enable_ide, { once: true });

function import_file(file) {
  var reader = new FileReader();
  reader.onload = (e) => {
    rules_elem.value = reader.result;
    $("spinner").style.display = "none";
    localStorage.setItem("saved_code", reader.result);
  };
  reader.onerror = (e) => {
    $("spinner").style.display = "none";
  };
  $("spinner").style.display = "block";
  reader.readAsText(file);
}

function ondrop(e) {
  e.stopPropagation();
  e.preventDefault();
  import_file(e.dataTransfer.files[0]);
  rules_elem.classList.remove("fdrag");
}

function faddCalls(s, fn) {
  s.split(" ").forEach((e) => rules_elem.addEventListener(e, fn, false));
}

faddCalls("drag dragstart dragend dragover dragenter dragleave drop", (e) => {
  e.stopPropagation();
  e.preventDefault();
});
faddCalls("dragover dragenter", (e) => rules_elem.classList.add("fdrag"));
faddCalls("dragleave dragend drop", (e) =>
  rules_elem.classList.remove("fdrag"),
);
faddCalls("drop", ondrop);

$("importf").addEventListener("click", (e) => $("impfile").click());
$("impfile").addEventListener("change", (e) => import_file(e.target.files[0]));

function load_rules() {
  const dblr = true;
  const dbwarn = db_warnings.checked;
  var instructions = rules_elem.value.toUpperCase().split("\n");
  var instrucc = 0;
  var rules = [];
  for (var i = 0; i < 16; ++i) rules[i] = {};
  function testmask(lit, exp) {
    function m(a, b) {
      return exp[a] == b ? 1 : 0;
    }
    const wildmask = 8 * m(0, "*") + 4 * m(1, "*") + 2 * m(2, "*") + m(3, "*");
    const wallmask = 8 * m(0, "N") + 4 * m(1, "E") + 2 * m(2, "W") + m(3, "S");
    return (wildmask | (wallmask ^ lit ^ 15)) == 15;
  }
  for (var i = 0; i < instructions.length; ++i) {
    var instruction = instructions[i].indexOf("#");
    if (instruction != -1)
      instruction = instructions[i]
        .substring(0, instructions[i].indexOf("#"))
        .trim()
        .split(/\s+/);
    else instruction = instructions[i].trim().split(/\s+/);
    if (instruction[0] == "") continue;
    if (
      instruction.length < 5 ||
      /* instruction[2] != '=' && */ instruction[2] != "->"
    ) {
      // output(instruction, true);
      output("ERROR: parsing line " + (i + 1) + " failed.", true, true);
      return;
    }
    if (instruction.length > 5) {
      if (dbwarn)
        output("WARNING: Ignoring extra tokens in line " + (i + 1), true, true);
    }
    ++instrucc;
    for (j = 0; j < 16; ++j)
      if (testmask(j, instruction[1])) {
        if (
          rules[j][instruction[0]] &&
          rules[j][instruction[0]].hasOwnProperty("T")
        ) {
          // conflicting rules
          output("ERROR: duplicate rule on line " + i, true, true);
          return;
        }
        rules[j][instruction[0]] = {
          T: instruction[3],
          S: parseInt(instruction[4]),
        };
      }
  }
  output("" + instrucc + " instructions loaded.", true);
  return rules;
}

function move() {
  var rule = bot.rules[bot.wallmask[bot.locR][bot.locC]][bot.state];
  if (!rule) {
    if (db_warnings.checked) output("WARNING: no rule found", true, true);
    return bot;
  }
  switch (rule.T) {
    case "N":
    case "n":
      --bot.locR;
      break;
    case "E":
    case "e":
      ++bot.locC;
      break;
    case "W":
    case "w":
      --bot.locC;
      break;
    case "S":
    case "s":
      ++bot.locR;
      break;
  }
  bot.state = rule.S;
  return bot;
}

function run_step() {
  return (e) => {
    if (db_microbot.checked) output("state: " + bot.state, true);
    cell_elems[bot.locR][bot.locC].className = "clean";
    bot = move();
    cell_elems[bot.locR][bot.locC].className = "bot";
    if (floormap[bot.locR][bot.locC]) {
      output("MOVED INTO WALL. STOPPING...", true);
      bot.stop();
    }
    if (!bot.seen[bot.locR][bot.locC]) {
      bot.seen[bot.locR][bot.locC] = true;
      --bot.left;
    }
    if (bot.left == 0) {
      output("FLOOR CLEARED; PASSED", true);
      bot.stop();
      return;
    }
    if (!bot.visited[bot.locR][bot.locC][bot.state])
      bot.visited[bot.locR][bot.locC][bot.state] = true;
    else {
      output("LOOP DETECTED; STOPPING; FAILED", true);
      bot.stop();
      return;
    }
    $("step1").addEventListener("click", run_step(), { once: true });
  };
}

function start_microbot() {
  if (!startpad) {
    alert("Set a starting pad before running the program.");
    return;
  }
  var rules = load_rules();
  if (!rules) {
    output("ERROR: loading rules failed", true);
    return;
  }
  drawfloor();
  $("runwrap").style.display = "none";
  $("stepwrap").style.display = "block";
  function stop_microbot() {
    $("runwrap").style.display = "block";
    $("stepwrap").style.display = "none";
    table_elem.classList.remove("noedit");
    stop_auto();
    bot.running = false;
  }
  bot = {
    running: true,
    rules: rules,
    locR: startpad[0],
    locC: startpad[1],
    state: 0,
    left: -1,
    visited: [],
    seen: [],
    wallmask: [],
    stop: stop_microbot,
  };
  for (var i = 0; i < rows; ++i) {
    bot.visited[i] = [];
    bot.wallmask[i] = [];
    bot.seen[i] = [];
    for (var j = 0; j < cols; ++j) {
      bot.visited[i][j] = [];
      bot.seen[i][j] = false;
      if (floormap[i][j] == 0) {
        ++bot.left;
        function fm(a, b) {
          return floormap[a][b];
        }
        bot.wallmask[i][j] =
          8 * fm(i - 1, j) + 4 * fm(i, j + 1) + 2 * fm(i, j - 1) + fm(i + 1, j);
      }
    }
  }
  bot.visited[bot.locR][bot.locC][bot.state] = true;
  bot.seen[bot.locR][bot.locC] = true;
  table_elem.classList.add("noedit");
  $("step1").addEventListener("click", run_step(), { once: true });
  function start_auto() {
    if (bot.ivl) {
      output("U WOT M8", true);
      return;
    }
    bot.ivl = setInterval(() => {
      $("step1").click();
    }, 10);
    $("auto").innerText = "pause";
    $("auto").addEventListener("click", pause_auto, { once: true });
  }
  function pause_auto() {
    clearInterval(bot.ivl);
    bot.ivl = undefined;
    $("auto").innerText = "auto";
    $("auto").addEventListener("click", start_auto, { once: true });
  }
  function stop_auto() {
    clearInterval(bot.ivl);
    bot.ivl = undefined;
    $("auto").innerText = "auto";
  }
  $("auto").addEventListener("click", start_auto, { once: true });
}

$("step10").addEventListener("click", (e) => {
  for (var i = 0; i < 10 && bot.running; ++i) $("step1").click();
});

function test_microbot_all() {
  table_elem.classList.add("noedit");
  output("TESTING ALL CASES:", true);
  var rules = load_rules();
  if (!rules) return;
  var total = 0;
  bot = {
    rules: rules,
    wallmask: [],
  };
  for (var i = 0; i < rows; ++i) {
    bot.wallmask[i] = [];
    for (var j = 0; j < cols; ++j) {
      if (floormap[i][j] == 0) {
        ++total;
        function fm(a, b) {
          return floormap[a][b];
        }
        bot.wallmask[i][j] =
          8 * fm(i - 1, j) + 4 * fm(i, j + 1) + 2 * fm(i, j - 1) + fm(i + 1, j);
      }
    }
  }
  function test_microbot(r, c) {
    if (!rules) {
      output("ERROR: loading rules failed", true);
      table_elem.classList.remove("noedit");
      return false;
    }
    bot.locR = r;
    bot.locC = c;
    bot.state = 0;
    bot.left = total - 1;
    bot.visited = [];
    bot.seen = [];
    for (var i = 0; i < rows; ++i) {
      bot.visited[i] = [];
      bot.seen[i] = [];
      for (var j = 0; j < cols; ++j) {
        bot.visited[i][j] = [];
        bot.seen[i][j] = false;
      }
    }
    bot.visited[bot.locR][bot.locC][bot.state] = true;
    bot.seen[bot.locR][bot.locC] = true;
    while (true) {
      bot = move();
      if (floormap[bot.locR][bot.locC]) return false;
      if (!bot.seen[bot.locR][bot.locC]) {
        bot.seen[bot.locR][bot.locC] = true;
        --bot.left;
      }
      if (bot.left == 0) return true;
      if (!bot.visited[bot.locR][bot.locC][bot.state])
        bot.visited[bot.locR][bot.locC][bot.state] = true;
      else return false;
    }
  }
  var passed = 0;
  for (var i = 0; i < rows; ++i)
    for (var j = 0; j < cols; ++j) {
      if (floormap[i][j]) continue;
      if (test_microbot(i, j)) {
        ++passed;
        cell_elems[i][j].className = "success";
      } else cell_elems[i][j].className = "failed";
    }
  output("TESTING ALL DONE; " + passed + "/" + total + " passed", true);
  table_elem.classList.remove("noedit");
}

$("run").addEventListener("click", start_microbot);
$("testall").addEventListener("click", test_microbot_all);
