"use strict";
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const names=["index.html","estilos.css","motor.js","app.js","LEEME.html","manual.css","README.md","SEGURIDAD.md","trazabilidad.csv","reglas.test.cjs","verificar.cjs","empaquetar.cjs","package.json",".nojekyll"];
const files=new Map(names.map(name=>[name,fs.readFileSync(path.join(__dirname,name))]));
const sums=[...files].map(([name,bytes])=>crypto.createHash("sha256").update(bytes).digest("hex")+"  "+name).join("\n")+"\n";
files.set("SHA256SUMS.txt",Buffer.from(sums));
const table=Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=(n&1)?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function crc32(bytes){let c=0xffffffff;for(const b of bytes)c=table[(c^b)&255]^(c>>>8);return(c^0xffffffff)>>>0;}
const locals=[],central=[];let offset=0;
const date=((2026-1980)<<9)|(9<<5)|10;
for(const[name,bytes]of files){
  const label=Buffer.from(name),crc=crc32(bytes),header=Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50,0);header.writeUInt16LE(20,4);header.writeUInt16LE(0x800,6);header.writeUInt16LE(date,12);header.writeUInt32LE(crc,14);header.writeUInt32LE(bytes.length,18);header.writeUInt32LE(bytes.length,22);header.writeUInt16LE(label.length,26);locals.push(header,label,bytes);
  const entry=Buffer.alloc(46);entry.writeUInt32LE(0x02014b50,0);entry.writeUInt16LE(20,4);entry.writeUInt16LE(20,6);entry.writeUInt16LE(0x800,8);entry.writeUInt16LE(date,14);entry.writeUInt32LE(crc,16);entry.writeUInt32LE(bytes.length,20);entry.writeUInt32LE(bytes.length,24);entry.writeUInt16LE(label.length,28);entry.writeUInt32LE(offset,42);central.push(entry,label);offset+=header.length+label.length+bytes.length;
}
const directory=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(files.size,8);end.writeUInt16LE(files.size,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);
const zip=Buffer.concat([...locals,directory,end]);
fs.writeFileSync(path.join(__dirname,"Herramienta_TFE_Floricultura.zip"),zip);
fs.writeFileSync(path.join(__dirname,"SHA256SUMS.txt"),sums);
console.log(JSON.stringify({files:files.size,bytes:zip.length,sha256:crypto.createHash("sha256").update(zip).digest("hex")}));
