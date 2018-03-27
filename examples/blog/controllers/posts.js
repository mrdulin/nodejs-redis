const postModelFactory = require('../models/post');
const redisClient = require('../redis');

const postModel = postModelFactory(redisClient);

module.exports = {
  index: (req, res) => {
    res.json({ status: 'ok', result: [] });
  },
  create: (req, res) => {
    const post = req.body;
    console.log(post);
    postModel.create(post, err => {
      if (err) console.error(err);
      console.log('发布文章成功');
      res.json({ status: 'ok', result: '发布文章成功' });
    });
  },
  createByHash(req, res, next) {
    const post = req.body;
    console.log(post);
    postModel
      .createByHash(post)
      .then(() => {
        console.log('发布文章成功');
        res.json({ status: 'ok', result: '发布文章成功' });
      })
      .catch(err => {
        console.error(err);
        next(err);
      });
  }
};
