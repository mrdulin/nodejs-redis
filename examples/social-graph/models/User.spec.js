const { expect } = require('chai');

const redis = require('../redis');
const User = require('./User');

const testUsers = {
  'mark@facebook.com': { name: 'mark' },
  'bill@microsoft.com': { name: 'bill' },
  'jeff@amazon.com': { name: 'jeff' },
  'fred@fedex.com': { name: 'fred' }
};

let userModels = {};

function create(users) {
  const ids = Object.keys(users);
  const multi = redis.multi();
  ids.forEach(id => {
    multi.hmset(`user:${id}:data`, users[id]);
  });
  return multi.execAsync();
}

function hydrate(users) {
  const ids = Object.keys(users);
  const multi = redis.multi();
  ids.forEach(id => {
    multi.hgetall(`user:${id}:data`);
  });
  return multi.execAsync().then(datas => {
    return datas.reduce((pre, data, idx) => {
      const id = ids[idx];
      const next = Object.assign({}, pre, { [id]: new User(id, data) });
      return next;
    }, {});
  });
}

before(() => {
  return redis
    .flushdbAsync()
    .then(() => create(testUsers))
    .then(() => {
      console.log('create test users successfully');
      return hydrate(testUsers);
    })
    .then(users => {
      userModels = users;
    });
});

after(() => {
  redis.quit();
});

describe('models/User.js', () => {
  it('should have "save" method and "id", "data" fields user in userModels, it means the "hydration" is correct', () => {
    const id = 'mark@facebook.com';
    const mark = userModels[id];
    expect(mark.id).to.be.eq(id);
    expect(mark.data.name).to.be.eq('mark');
    expect(mark.save).to.be.a('function');
  });

  it('should have correct relationship between bill and jeff', () => {
    const emails = {
      jeff: 'jeff@amazon.com',
      bill: 'bill@microsoft.com'
    };
    const bill = userModels[emails.bill];
    const jeff = userModels[emails.jeff];

    return bill
      .follow(jeff.id)
      .then(() => jeff.getFollowers())
      .then(users => {
        expect(users)
          .to.be.an('array')
          .that.is.include(emails.bill);
        return jeff.getFriends();
      })
      .then(users => {
        expect(users)
          .to.be.an('array')
          .that.is.have.lengthOf(0);
        return jeff.follow(bill.id);
      })
      .then(() => jeff.getFriends())
      .then(users => {
        expect(users).to.include(emails.bill);
      });
  });
});
