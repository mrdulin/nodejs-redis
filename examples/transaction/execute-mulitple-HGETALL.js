const redis = require('./redis');

/**
 * 使用事务执行多个hgetall命令，获取结果列表
 *
 * @param {string[]} keys
 */
function MHGETALL(keys) {
  const multi = redis.multi();
  keys.forEach(key => {
    multi.hgetall(key);
  });
  return multi.execAsync();
}

MHGETALL(['post:1000', 'post:1001', 'post:1002'])
  .then(results => {
    console.log('results: ', results);
    redis.quit();
  })
  .catch(console.error);
