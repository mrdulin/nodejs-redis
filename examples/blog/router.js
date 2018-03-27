const posts = require('./controllers/posts');

module.exports = function router(app) {
  app.get('/', posts.index);
  app.post('/create', posts.create);
};
