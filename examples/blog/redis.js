const redis = require('redis');
const bluebird = require('bluebird');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const client = redis.createClient(6379, '127.0.0.1');

client.on('error', (err) => {
  console.log(`Error ${err}`);
});

module.exports = client;
