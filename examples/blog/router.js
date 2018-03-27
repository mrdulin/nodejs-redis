const posts = require('./controllers/posts');

module.exports = function router(app) {
  app.get('/', posts.index);
  app.post('/create', posts.create);
  app.post('/createByHash', posts.createByHash);
  app.get('/post/:slug', posts.getHashPostBySlug);
  app.post('/updateSlugById', posts.updateHashPostSlugById);
  app.post('/delete', posts.deleteById);
};
