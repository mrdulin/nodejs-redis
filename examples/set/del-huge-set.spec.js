const redis = require('./redis');
const { expect } = require('chai');

const { mockData, delSet } = require('./del-huge-set');

after(() => {
  redis.quit();
});

describe('mockData', () => {
  beforeEach(() => {
    redis.flushdb();
  });

  it('should add 1 million elements to Set "huge:set"', () => {
    return mockData().then(reply => {
      expect(reply).to.be.eq(1000 * 1000);
    });
  });

  it('should add 5 million elements to Set "huge:set"', () => {
    const count = 5 * 1000 * 1000;
    return mockData(count).then(reply => {
      console.log(reply);
      expect(reply).to.be.eq(count);
    });
  });
});

describe('delSet', () => {
  const key = 'huge:set';

  beforeEach(() => {
    return redis.flushdbAsync().then(() => mockData());
  });

  it('should have "huge:set" key and 1 million elements as its value', () => {
    return redis.scardAsync(key).then(reply => {
      expect(reply).to.be.eq(1000 * 1000);
    });
  });

  it('should delete "huge:set" elements in batches', () => {
    return delSet()
      .then(reply => {
        console.log('reply: ', reply);
        return redis.scardAsync(key);
      })
      .then(reply => {
        expect(reply).to.be.eq(0);
      });
  });
});
