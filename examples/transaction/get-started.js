// 事务

module.exports = (client, cb) => {
  client
    .multi()
    .set('foo', 'redis')
    .sadd('setC', 'a')
    .exec((err, reply) => {
      if (err) throw err;
      console.log(reply);
      cb();
    });
};
