const fs=require('node:fs'),path=require('node:path');
const raw=process.env.APPLE_API_KEY_DATA||'';
const key=raw.includes('-----BEGIN')?raw:Buffer.from(raw,'base64').toString('utf8');
if(!key.includes('-----BEGIN PRIVATE KEY-----'))throw new Error('Apple API key must be PEM or base64 PEM');
const target=path.join(process.env.RUNNER_TEMP,'pianlala-notary.p8');
fs.writeFileSync(target,key,{mode:0o600});
fs.appendFileSync(process.env.GITHUB_ENV,'APPLE_API_KEY='+target+'\n');
console.log('Prepared temporary notarization key');
