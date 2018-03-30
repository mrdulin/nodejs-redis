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
 * @author dulin
 * @param {number} [count=1000 * 1000] 插入的元素个数，默认值=1000 * 1000
 * @param {string} [key='huge:set']  set类型的key，默认值='huge:set'
 * @param {number} [elementCount=0] 元素总个数，默认值=0
 * @returns
 */
function mockData(count = 1000 * 1000, key = 'huge:set', elementCount = 0) {
  const elements = [];
  const bulkLength = 1024 * 1023;
  const len = count > bulkLength ? bulkLength : count;

  for (let i = count; i > count - len; i -= 1) {
    elements.push(i);
  }
  return redis.saddAsync(key, elements).then(res => {
    let nextElementCount;
    if (!elementCount) {
      nextElementCount = res;
    } else {
      nextElementCount = elementCount + res;
    }
    if (count > bulkLength) {
      console.log('add data successfully. continue...');
      return mockData(count - bulkLength, key, nextElementCount);
    }
    return Promise.resolve(nextElementCount);
  });
}

/**
 *
 * 分批删除mock的数据
 *
 * @author dulin
 * @param {number} [size=500] 每次删除的数据个数，默认值=500
 * @param {string} [key='huge:set'] set类型的key，默认值='huge:set'
 * @returns
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

exports.mockData = mockData;
exports.delSet = delSet;
