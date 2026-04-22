import fs from 'fs';
import YAML from 'yaml';

const dir='content/stages';

const files=fs.readdirSync(dir).filter(f=>f.endsWith('.md')&&!f.includes('.ru.'));
let fail=false;

for(const f of files){
  const en=YAML.parse(fs.readFileSync(`${dir}/${f}`,'utf8').split('\n---\n')[0].slice(4));
  const ruFile=f.replace('.md','.ru.md');
  if(!fs.existsSync(`${dir}/${ruFile}`)) continue;
  const ru=YAML.parse(fs.readFileSync(`${dir}/${ruFile}`,'utf8').split('\n---\n')[0].slice(4));

  if(JSON.stringify(Object.keys(en.itemStrings||{}))!==JSON.stringify(Object.keys(ru.itemStrings||{}))){
    console.error('mismatch',ruFile);
    fail=true;
  }
}

if(fail) process.exit(1);
console.log('parity ok');