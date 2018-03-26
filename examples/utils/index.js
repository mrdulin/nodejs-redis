const redis = require('redis');

const incr = require('./incr');

const port = 6379;
const host = '127.0.0.1';

const clientA = redis.createClient(port, host);
const clientB = redis.createClient(port, host);
const clientC = redis.createClient(port, host);

const key = 'pageNo';

// 测试redis命令都是原子操作，无论多少个客户端连接
incr(clientA, () => {
  clientA.quit(() => {
    console.log('Redis clientA quit');
  });
})(key);

incr(clientB, () => {
  clientB.quit(() => {
    console.log('Redis clientB quit');
  });
})(key);

incr(clientC, () => {
  clientC.quit(() => {
    console.log('Redis clientC quit');
  });
})(key);
