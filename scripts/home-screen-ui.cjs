const fs = require("fs");

const file = "index.html";
let html = fs.readFileSync(file, "utf8");

const markerStart = "<!-- FAMILY CHORES HOME SCREEN HELP -->";
const markerEnd = "<!-- /FAMILY CHORES HOME SCREEN HELP -->";

const css = [
  "<style id=\"family-chores-home-help-css\">",
  ".install-help{margin-top:18px;border:1px solid #252c27;background:#0d1410;border-radius:11px;padding:14px 16px;color:#dce5df}",
  ".install-help h2{margin:0 0 8px;font-size:15px;letter-spacing:-.02em}",
  ".install-help p{margin:0 0 8px;color:#89928c;font-size:12px;line-height:1.45}",
  ".install-help-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}",
  ".install-help-step{border:1px solid #29312b;background:#090c0a;border-radius:8px;padding:9px 10px}",
  ".install-help-step strong{display:block;margin-bottom:4px;font-size:12px;color:#dce5df}",
  ".install-help-step span{display:block;color:#89928c;font-size:11px;line-height:1.4}",
  "@media(max-width:650px){.install-help-grid{grid-template-columns:1fr}.install-help{padding:12px 13px}}",
  "</style>"
].join("\n");

const js = [
  "function familyChoresHomeScreenHelp(){",
  "  return '<div class=\"install-help\">'",
  "    + '<h2>Add Family Chores to your home screen</h2>'",
  "    + '<p>Install the app on your phone so you can open Family Chores quickly like an app.</p>'",
  "    + '<div class=\"install-help-grid\">'",
  "    + '<div class=\"install-help-step\"><strong>Android</strong><span>Open Family Chores in Chrome, tap the three dots ⋮, choose <b>Add to Home screen</b> or <b>Install app</b>, then tap Add.</span></div>'",
  "    + '<div class=\"install-help-step\"><strong>iPhone / iPad</strong><span>Open Family Chores in Safari, tap the Share button, choose <b>Add to Home Screen</b>, then tap Add.</span></div>'",
  "    + '</div></div>';",
  "}"
].join("\n");

const dashboardMarker = "function dashboard(){";
const renderOld = "app.innerHTML=top+(parent?parentUI():childUI());";
const renderNew = "app.innerHTML=top+(parent?parentUI():childUI())+familyChoresHomeScreenHelp();";

if (!html.includes(dashboardMarker)) throw new Error("Could not find dashboard() in index.html.");
if (!html.includes(renderOld)) throw new Error("Could not find dashboard render line in index.html.");

if (!html.includes(markerStart)) {
  html = html.replace("</head>", css + "\n</head>");
  html = html.replace(dashboardMarker, markerStart + "\n" + js + "\n" + markerEnd + "\n" + dashboardMarker);
}

html = html.replace(renderOld, renderNew);

fs.writeFileSync(file, html);
console.log("Added non-collapsible home-screen installation instructions.");
