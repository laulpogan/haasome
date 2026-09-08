// Static hosts limit individual files. Split only the delivery copy; original bytes
// are reassembled and checked against the licensed scene's SHA-256 by the viewer.
import {readFile,writeFile,unlink} from 'node:fs/promises';
const base = new URL('../dist/curated-court/',import.meta.url);
let bytes;
try { bytes=await readFile(new URL('capitoline.sog',base)); } catch(error) { if(error.code==='ENOENT') process.exit(0); throw error; }
const parts=[];const chunk=18*1024*1024;
for(let offset=0;offset<bytes.length;offset+=chunk){const name=`capitoline.part${parts.length}`;await writeFile(new URL(name,base),bytes.subarray(offset,offset+chunk));parts.push(name);}
await writeFile(new URL('scene-parts.json',base),JSON.stringify({asset:'capitoline.sog',bytes:bytes.length,parts}));
await unlink(new URL('capitoline.sog',base));
console.log(`Packaged scene in ${parts.length} parts (${bytes.length} bytes total).`);
