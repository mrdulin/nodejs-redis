const redis = require('../redis');

/**
 * 使用事务（transaction）实现incr命令，使用watch命令监听要修改的key，防止其他客户端或进程同时操作该key
 * 导致的竞态条件。
 *
 * @param {String} key
 */
function transIncr(key) {
  return redis
    .watchAsync(key)
    .then(() => {
      return redis.getAsync(key);
    })
    .then(val => {
      console.log(`val is: ${val}`);
      let value = Number.parseInt(val, 10) || 0;
      value += 1;

      return redis
        .multi()
        .set(key, value)
        .execAsync()
        .then(result => {
          console.log(result);
          return result[0];
        })
        .catch(err => {
          console.error('execute transaction failed \n', err);
          console.log('restart transaction...');
          return transIncr(key);
        });
    });
}

transIncr('incr:trans')
  .then(result => {
    console.log('success! result is ', result);
  })
  .catch(console.error)
  .finally(() => redis.quit());

module.exports = transIncr;
