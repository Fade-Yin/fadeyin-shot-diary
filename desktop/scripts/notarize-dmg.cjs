const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const assert = require('assert');

const arch = process.env.EXPECTED_ARCH;
assert(['arm64', 'x64'].includes(arch), 'EXPECTED_ARCH required');
for (const key of ['APPLE_API_KEY', 'APPLE_API_KEY_ID', 'APPLE_API_ISSUER']) assert(process.env[key], `${key} required`);
const version = require('../package.json').version;
const dmg = path.resolve('dist', `Pianlala-macOS-${arch}-${version}.dmg`);
const credentials = ['--key', process.env.APPLE_API_KEY, '--key-id', process.env.APPLE_API_KEY_ID, '--issuer', process.env.APPLE_API_ISSUER];
const run = args => cp.execFileSync('xcrun', args, { encoding: 'utf8', timeout: 40 * 60 * 1000 });
const submission = JSON.parse(run(['notarytool', 'submit', dmg, ...credentials, '--wait', '--timeout', '35m', '--output-format', 'json']));
fs.writeFileSync(path.resolve('dist', `notary-${arch}.json`), JSON.stringify(submission, null, 2));
if (submission.status !== 'Accepted') {
  // Apple's diagnostics contain code paths and reasons, never credential values.
  fs.writeFileSync(path.resolve('dist', `notary-${arch}-log.json`), run(['notarytool', 'log', submission.id, ...credentials]));
  throw new Error(`DMG notarization failed: ${submission.status}; inspect private notarization log`);
}
console.log(`Apple accepted DMG notarization: ${submission.id}`);
console.log(run(['stapler', 'staple', dmg]));
console.log(run(['stapler', 'validate', dmg]));
cp.execFileSync('spctl', ['--assess', '--type', 'open', '--context', 'context:primary-signature', '--verbose=2', dmg], { stdio: 'inherit' });
