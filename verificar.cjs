"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),crypto=require("node:crypto"),assert=require("node:assert/strict");
const read=name=>fs.readFileSync(path.join(__dirname,name),"utf8");
const html=read("index.html"),ui=read("app.js"),motor=read("motor.js"),manual=read("LEEME.html");
for(const code of [ui,motor]) new vm.Script(code);
assert.equal(crypto.createHash("sha256").update(motor).digest("hex"),"0e0e5f26674440acb81d328f9f9d5f6a36ce25579d8ca79115e81e2a94a9fd0a","Motor distinto al revisado");
for(const text of [html,manual]) {
  assert(!/unsafe-inline|\son\w+\s*=|\sstyle=|<script(?![^>]*src=)[^>]*>/i.test(text));
  assert(!/chatgpt|openai/i.test(text));
  const ids=[...text.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(ids.length,new Set(ids).size,"Identificadores duplicados");
  for(const match of text.matchAll(/\b(?:src|href)="([^"]+)"/g)){
    const target=match[1];if(target.startsWith("#"))continue;
    assert(!/^(?:https?:|\/\/|javascript:|data:)/i.test(target),"Referencia externa no prevista");
    if(!target.endsWith(".zip"))assert(fs.existsSync(path.join(__dirname,target)),"Falta "+target);
  }
}
assert(html.includes("connect-src 'none'"));
assert(html.includes("script-src 'self'"));
assert(html.includes("style-src 'self'"));
assert(!/\b(?:fetch|eval|atob|btoa|XMLHttpRequest|WebSocket|Function|Worker|importScripts)\s*\(|\b(?:localStorage|sessionStorage|indexedDB|sendBeacon)\b|innerHTML|outerHTML|insertAdjacentHTML/.test(ui+motor));
assert.equal(read("trazabilidad.csv").trim().split(/\r?\n/).length,20);
console.log("PASS: sintaxis, referencias locales, DOM de texto, política restrictiva, 19 condiciones y motor académico sin modificaciones.");
