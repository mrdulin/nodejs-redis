const redis = require('../redis');

/**
 * 使用get/set模拟incr命令
 *
 * @param {*} client redisClient
 * @param {*} cb
 */
function incr(key, cb) {
  redis.get(key, (getErr, value) => {
    console.log(`${key} before value is: ${value}`);
    if (getErr) cb(getErr);
    let newValue = value || 0;
    newValue = Number.parseInt(newValue, 10);
    newValue += 1;
    setTimeout(() => {
      redis.set(key, newValue, (setErr, result) => {
        cb(setErr, result);
      });
    }, 1000);
  });
}

incr('incr:notrans', (err, value) => {
  if (err) console.error(err);
  console.log('incr successfully');
  redis.quit();
});

module.exports = incr;
