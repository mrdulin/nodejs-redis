const redis = require('redis');

const transaction = require('./transaction');
const getSet = require('./get-set');

const port = 6379;
const host = '127.0.0.1';

const client = redis.createClient(port, host);

client.on('error', err => {
  console.log(`Error ${err}`);
});

function quit() {
  client.quit(() => {
    console.log('Redis client quit');
  });
}

transaction(client, quit);
// getSet(client, quit);
