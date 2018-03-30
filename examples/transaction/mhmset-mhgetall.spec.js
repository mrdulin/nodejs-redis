const { expect } = require('chai');
const redis = require('./redis');

const mhmset = require('./mhmset');
const mhgetall = require('./mhgetall');

after(() => {
  redis.quit();
});

describe('transaction/mhmset.js', () => {
  const objs = {
    'post:1': { title: 'angular' },
    'post:2': { title: 'react' },
    'post:3': { title: 'node' }
  };

  beforeEach(() => {
    redis.flushdb();
  });

  it('should set multiple objects once', () => {
    return mhmset(objs)
      .then(replies => {
        expect(replies).to.deep.equal(['OK', 'OK', 'OK']);

        const hgetallArr = [];
        for (let i = 1; i <= replies.length; i += 1) {
          const key = `post:${i}`;
          hgetallArr.push(redis.hgetallAsync(key));
        }

        return Promise.all(hgetallArr);
      })
      .then(results => {
        const actualValue = Object.keys(objs).map(key => objs[key]);
        expect(results).to.have.lengthOf(3);
        expect(results).to.deep.equal(actualValue);
      });
  });

  it('should set multiple objects once, use transaction/mhgetall.js method get list', () => {
    return mhmset(objs)
      .then(replies => {
        expect(replies).to.deep.equal(['OK', 'OK', 'OK']);
        return mhgetall(Object.keys(objs));
      })
      .then(results => {
        const actualValue = Object.keys(objs).map(key => objs[key]);
        expect(results).to.have.lengthOf(3);
        expect(results).to.deep.equal(actualValue);
      });
  });
});
