/**
 * 使用get/set模拟incr命令
 *
 * @param {*} client redisClient
 * @param {*} cb
 */
module.exports = function incrFactory(client, cb) {
  return function incr(key) {
    client.get(key, (err, value) => {
      // console.log(`${key} before value is: ${value}`);
      let newValue = value || 0;
      newValue = Number.parseInt(newValue, 10);
      newValue += 1;
      client.set(key, newValue, () => {
        console.log(`${key} after value is: ${value}`);
        cb();
      });
    });
  };
};
