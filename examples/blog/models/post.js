module.exports = client => {
  /**
   * 创建文章
   * 使用redis字符串数据类型存储
   *
   * post:count存文章id
   * post:${postId}:data存data
   *
   * @param {*} data {title: '标题', 'content': '内容', 'author': '作者', time: '发布时间'}
   * @param {*} callback
   */
  function create(data, callback) {
    client.incr('posts:count', (err, postId) => {
      client.set(`post:${postId}:data`, JSON.stringify(data), () => {
        callback(err);
      });
    });
  }

  function createByHash(data) {
    return client
      .incrAsync('posts:count')
      .then(postId => {
        return Promise.all([client.hsetnxAsync('slug.to.id', data.slug, postId), postId]);
      })
      .then(([isSlugAvailable, postId]) => {
        if (isSlugAvailable) {
          return client.hmsetAsync(`post:${postId}`, data);
        }
        const err = new Error('文章slug已存在');
        err.errorCode = 10000;
        return Promise.reject(err);
      });
  }

  function getPostById(postId, callback) {
    client.get(`post:${postId}:data`, (getErr, dataString) => {
      client.incr(`post:${postId}:page.view`, (incrErr, pageView) => {
        const data = JSON.parse(dataString);
        data.pageView = pageView;
        callback(getErr || incrErr, data);
      });
    });
  }

  return {
    create,
    createByHash,
    getPostById
  };
};
