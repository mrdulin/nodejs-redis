const cp = require('child_process');
const os = require('os');
const path = require('path');

const { fork, execFile } = cp;
const childProcessCount = os.cpus().length - 1;

for (let i = 0; i < childProcessCount; i += 1) {
  fork(path.resolve(__dirname, './worker-without-using-transaction.js'));
}
