// 事务unwatch命令

// 实现hsetxx函数，作用与hsetnx命令一样

function hsetxx(client, key, field, value, cb) {
  client.watch(key, () => {
    client.hexists(key, field, (hexistsErr, isFieldExist) => {
      if (hexistsErr) cb(hexistsErr);
      if (isFieldExist) {
        client
          .multi()
          .hset(key, field, value)
          .exec((multiErr, multiReply) => {
            if (multiErr) cb(multiErr);
            cb(null, multiReply);
          });
      } else {
        client.unwatch((unwatchErr, unwatchReply) => {
          if (unwatchErr) cb(unwatchErr);
          cb(null, unwatchReply);
        });
      }
    });
  });
}

module.exports = hsetxx;
