const path = require('path');
const cp = require('child_process');
const assert = require('assert');

module.exports = async context => {
  if (context.electronPlatformName !== 'darwin') return;
  const app = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`);
  cp.execFileSync('codesign', ['--verify', '--deep', '--strict', '--verbose=2', app], { stdio: 'inherit' });
  const details = cp.spawnSync('codesign', ['-dvvv', app], { encoding: 'utf8' });
  assert.strictEqual(details.status, 0);
  assert(/Authority=Developer ID Application:/.test(details.stderr), 'Developer ID Application required');
  assert(/flags=.*runtime/.test(details.stderr), 'Hardened Runtime required');
  assert(/Timestamp=/.test(details.stderr), 'Secure timestamp required');
  cp.execFileSync('xcrun', ['stapler', 'validate', app], { stdio: 'inherit' });
  cp.execFileSync('spctl', ['--assess', '--type', 'execute', '--verbose=2', app], { stdio: 'inherit' });
};
