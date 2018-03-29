const redis = require('../redis');
const Promise = require('bluebird');

function trans(key = 'trans') {
  const multi = redis.multi();
  multi.incr(key);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      multi.decr(key);
      multi
        .execAsync()
        .then(val => {
          console.log(`${key}: ${val}`);
          resolve();
        })
        .catch(reject);
    }, 1000);
  });
}

trans()
  .then(() => {
    console.log('+1 -1成功');
  })
  .catch(console.error)
  .finally(() => redis.quit());
