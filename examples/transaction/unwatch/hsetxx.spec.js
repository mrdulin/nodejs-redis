const { expect } = require('chai');
const redis = require('redis');
const hsetxx = require('./hsetxx');

let client;

before(() => {
  console.log('createClient');
  client = redis.createClient();
});

after(() => {
  client.quit(() => {
    console.log('quit');
  });
});

describe('transaction/unwatch/hsetxx.js', () => {
  const key = 'car';
  const field = 'price';
  const value = '290k';

  beforeEach(() => {
    console.log('flushdb');
    client.flushdb();
  });

  it('should not set value when field does not exist', done => {
    hsetxx(client, key, field, value, err => {
      if (err) done(err);
      client.hgetall(key, (hgetErr, car) => {
        if (hgetErr) done(hgetErr);
        expect(car).to.be.a('null');
        done();
      });
    });
  });

  it('should set value when field exist', done => {
    client.hset(key, field, '', (hsetErr, hsetReply) => {
      if (hsetErr) done(hsetErr);
      hsetxx(client, key, field, value, hsetxxErr => {
        if (hsetErr) done(hsetxxErr);
        client.hgetall(key, (hgetErr, car) => {
          if (hgetErr) done(hgetErr);
          expect(car).to.be.a('object');
          expect(car[field]).to.equal(value);
          done();
        });
      });
    });
  });

  it('should not effect next transaction when field does not exist', done => {
    hsetxx(client, key, field, value, hsetxxErr => {
      if (hsetxxErr) done(hsetxxErr);

      const multi = client.multi();
      multi.hset(key, 'color', 'red');

      client.hset(key, 'owner', 'mrdulin', hsetErr => {
        if (hsetErr) done(hsetErr);

        client.hgetall(key, (hgetallErr, car) => {
          if (hgetallErr) done(hgetallErr);
          expect(car).to.deep.equal({ owner: 'mrdulin' });

          multi.exec(multiErr => {
            if (multiErr) done(multiErr);

            client.hgetall(key, (err, finalCar) => {
              if (err) done(err);
              expect(finalCar).to.deep.equal({ owner: 'mrdulin', color: 'red' });
              done();
            });
          });
        });
      });
    });
  });
});
