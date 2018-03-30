// 事务

const redis = require('./redis');

// 测试watch命令
// watch命令： 监控一个或多个键，一旦其中有一个键被修改（或删除）,之后的事务就不会执行。
// 监控一直持续到exec命令执行完毕。

redis.flushall(() => {
  const key = 'set';

  // 初始化set
  redis.sadd(key, 'a', 'b', (initialSaddErr, initialSaddReply) => {
    if (initialSaddErr) throw initialSaddErr;
    console.log('initialSaddReply: ', initialSaddReply);
  });

  redis.watch(key, () => {
    const multi = redis.multi();
    multi.srem(key, 'a');

    // 在watch之后对key进行修改
    redis.sadd(key, 'c', (saddErr, saddReply) => {
      if (saddErr) throw saddErr;

      // 查看修改后的set
      redis.smembers(key, (smembersErr, smembersReply) => {
        if (smembersErr) throw smembersErr;
        console.log('smembersReply: ', smembersReply);

        multi.exec((err, multiReply) => {
          if (err) throw err;
          console.log('multiReply: ', multiReply);
          redis.quit();
        });
      });
    });
  });
});
