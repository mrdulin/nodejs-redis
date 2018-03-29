const redis = require('./redis');

/**
 * mock一个百万级的set
 *
 * 关于ReplyError: ERR Protocol error: invalid multibulk length错误
 *
 * 原因：
 * 一次性插入大于1024*1024个元素导致
 * https://github.com/antirez/redis/blob/6c60526db91e23fb2d666fc52facc9a11780a2a3/src/networking.c#L1024
 *
 * 解决方案：
 * 分批插入，通过递归实现
 *
 * 时间复杂度O(N)
 *
 * @param {String} key set类型的key
 * @param {Number} count 插入的元素个数
 */
function mockData(count = 1000 * 1000, key = 'huge:set') {
  const elements = [];
  const bulkLength = 1024 * 1023;
  const len = count > bulkLength ? bulkLength : count;

  console.log(count, len);
  for (let i = count; i > count - len; i -= 1) {
    elements.push(i);
  }
  return redis.saddAsync(key, elements).then(res => {
    if (count > bulkLength) {
      console.log('add data successfully. continue...');
      return mockData(count - bulkLength);
    }
    return Promise.resolve(res);
  });
}

/**
 * 分批删除mock的数据
 *
 * @param {Number} size 每次删除的数据个数
 * @param {String} key set类型的key
 */
function delSet(size = 500, key = 'huge:set') {
  return redis.scardAsync(key).then(count => {
    if (count > size) {
      return redis.srandmemberAsync(key, size).then(elements => {
        return redis.sremAsync(key, elements).then(() => {
          console.log(`${key} elements left: ${count}`);
          return delSet(size, key);
        });
      });
    }
    return redis.del(key);
  });
}

// 下面两个函数不要同时执行
delSet()
  .then(result => {
    console.log('delete huge:set successfully');
  })
  .catch(console.error)
  .finally(() => redis.quit());

// console.time('mock data');
// mockData(1000 * 1000 * 5)
//   .then(result => {
//     console.log('mock data process is compeleted', result);
//     console.timeEnd('mock data');
//   })
//   .catch(err => {
//     console.error(err);
//   })
//   .finally(() => redis.quit());
