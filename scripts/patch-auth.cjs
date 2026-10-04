const fs = require("fs");

const file = "index.html";
const site = "https://walkerramzinski2011-oss.github.io/family-chores/";

let html = fs.readFileSync(file, "utf8");

const oldAuth = 'db=supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storage:window.localStorage}})';
const newAuth = 'db=supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storage:window.localStorage}})';

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

fs.writeFileSync(file, html);
console.log("Patched Supabase auth for GitHub Pages:", site);
