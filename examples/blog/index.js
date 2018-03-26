const redis = require('redis');

const postModelFactory = require('./model/post');

const port = 6379;
const host = '127.0.0.1';
const client = redis.createClient(port, host);

const postModel = postModelFactory(client);

client.on('error', err => {
  console.log(`Error ${err}`);
});

function quit() {
  client.quit(() => {
    console.log('Redis client quit');
  });
}

const post = {
  title: 'redis入门指南',
  content: 'redis入门指南redis入门指南redis入门指南redis入门指南redis入门指南redis入门指南',
  author: 'mrdulin',
  time: Date.now()
};
postModel.create(post, err => {
  if (err) console.error(err);
  console.log('发布文章成功');
  quit();
});
