const redis = require('./redis');

function mhmset(objs) {
  const keys = Object.keys(objs);
  const multi = redis.multi();
  keys.forEach(key => {
    const obj = objs[key];
    multi.hmset(key, obj);
  });
  return multi.execAsync();
}

module.exports = mhmset;
