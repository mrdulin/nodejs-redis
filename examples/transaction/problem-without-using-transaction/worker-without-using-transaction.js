const redis = require('../redis');

function notrans() {
  const key = 'notrans';
  return redis.incrAsync(key).then(incrVal => {
    console.log(`${key} +1 = ${incrVal}`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        redis
          .decrAsync(key)
          .then(decrVal => {
            console.log(`${key} -1 = ${decrVal}`);
            resolve();
          })
          .catch(reject);
      }, 1000);
    });
  });
}

notrans()
  .then(() => {
    console.log('+1 -1成功');
  })
  .catch(console.error)
  .finally(() => redis.quit());

module.exports = notrans;
