const postModelFactory = require('../models/post');
const redisClient = require('../redis');

const postModel = postModelFactory(redisClient);

module.exports = {
  index: (req, res, next) => {
    const { page, pageSize } = req.query;
    postModel
      .getPostsByPage(page, pageSize)
      .then(posts => {
        res.apiSuccess({ posts });
      })
      .catch(err => {
        console.error(err);
        next(err);
      });
  },
  create: (req, res, next) => {
    const post = req.body;
    console.log(post);
    postModel.create(post, err => {
      if (err) return next(err);
      console.log('发布文章成功');
      return res.json({ status: 'ok', result: '发布文章成功' });
    });
  },
  createByHash(req, res, next) {
    const post = req.body;
    console.log(post);
    postModel
      .createByHash(post)
      .then(() => {
        res.apiSuccess('发布文章成功');
      })
      .catch(err => {
        console.error(err);
        next(err);
      });
  },
  getHashPostBySlug(req, res, next) {
    const { slug } = req.params;
    postModel
      .getHashPostBySlug(slug)
      .then(post => {
        res.apiSuccess(post);
      })
      .catch(err => {
        console.error(err);
        next(err);
      });
  },
  updateHashPostSlugById(req, res, next) {
    const { id, slug } = req.body;
    postModel
      .updateHashPostSlugById(slug, id)
      .then(() => {
        res.apiSuccess('更新文章slug成功');
      })
      .catch(err => {
        console.error(err);
        next(err);
      });
  },
  deleteById(req, res, next) {
    const { id } = req.body;
    postModel
      .deleteById(id)
      .then(() => {
        res.apiSuccess('删除成功');
      })
      .catch(err => {
        console.error(err);
        next(err);
      });
  },
  getHotPosts(req, res, next) {
    const { count } = req.body;
    postModel
      .getHotPosts(Number.parseInt(count, 10))
      .then(posts => {
        res.apiSuccess({ posts });
      })
      .catch(err => {
        console.error(err);
        next(err);
      });
  }
};
