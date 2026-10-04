const fs = require("fs");

const file = "index.html";
const site = "https://walkerramzinski2011-oss.github.io/family-chores/";

let html = fs.readFileSync(file, "utf8");

const oldAuth = 'db=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storage:window.localStorage}})';
const newAuth = 'db=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storage:window.localStorage}})';

if (!html.includes(oldAuth)) {
  throw new Error("Expected Supabase client initialization was not found; refusing to make an unsafe auth patch.");
}
html = html.replace(oldAuth, newAuth);

const oldSignUp = 'db.auth.signUp({email:email.value,password:password.value})';
const newSignUp = 'db.auth.signUp({email:email.value,password:password.value,options:{emailRedirectTo:site}})';

if (!html.includes(oldSignUp)) {
  throw new Error("Expected sign-up call was not found; refusing to make an unsafe auth patch.");
}
html = html.replace(oldSignUp, newSignUp);

const rewardFunction = /function rewardRows\(request\)\{[\s\S]*?\}\nfunction requestRows/;
const newRewardFunction = 'function rewardRows(request){if(!rewards.length)return \'<p class="muted">No rewards yet.</p>\';return rewards.map(r=>\'<div class="row"><div><b>\'+esc(r.title)+\'</b><div class="muted">\'+r.cost+\' points</div></div><div>\'+(request?\'<button onclick="rewardReq(\\\'\'+r.id+\'\\\')">Delete</button>\':\'<button class="primary" onclick="rewardReq(\\\'\'+r.id+\'\\\')">Choose</button>\')+\'</div></div>\').join("")}\nfunction requestRows';

if (!rewardFunction.test(html)) {
  throw new Error("Expected reward list renderer was not found; refusing to make an unsafe reward patch.");
}
html = html.replace(rewardFunction, newRewardFunction);

fs.writeFileSync(file, html);
console.log("Patched GitHub Pages auth and child reward selection:", site);
