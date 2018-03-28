const redis = require('../redis');

module.exports = opts => {
  const defaultOpts = {
    limit: 2
  };
  const options = Object.assign({}, defaultOpts, opts);

  return function rateLimiter(req, res, next) {
    const key = `rate.limiting:${req.ip}`;
    const seconds = 60;
    redis
      .existsAsync(key)
      .then(exist => {
        if (exist) {
          return redis.incrAsync(key).then(count => {
            if (count > options.limit) {
              const err = new Error('访问过于频繁，请稍后再试');
              err.errorCode = 20000;
              return Promise.reject(err);
            }
            return Promise.resolve('访问+1');
          });
        }
        return redis
          .multi()
          .incr(key)
          .expire(key, seconds)
          .execAsync();
      })
      .then(result => {
        next();
      })
      .catch(err => {
        console.error(err);
        next(err);
      });
  };
};
