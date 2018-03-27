module.exports = client => {
  /**
   * 创建文章, 使用redis字符串数据类型存储
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

  /**
   * 创建文章，使用redis散列数据类型存储
   *
   * @param {*} data {title: '标题', 'content': '内容', 'author': '作者', time: '发布时间', slug: '文章缩略名'}
   */
  function createByHash(data) {
    return client
      .incrAsync('posts:count')
      .then(postId => {
        return Promise.all([client.hsetnxAsync('slug.to.id', data.slug, postId), postId]);
      })
      .then(([isSlugAvailable, postId]) => {
        if (isSlugAvailable) {
          const post = Object.assign({}, data, { id: postId });
          return client.hmsetAsync(`post:${postId}`, post);
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

  /**
   * 通过缩略名slug获取post
   *
   * @param {*} slug 缩略名
   */
  function getHashPostBySlug(slug) {
    return client.hgetAsync('slug.to.id', slug).then(postId => {
      if (postId) {
        return client.hgetallAsync(`post:${postId}`);
      }
      const err = new Error('文章不存在');
      err.errorCode = 10001;
      return Promise.reject(err);
    });
  }

  /**
   * 通过文章id更新文章slug
   *
   * @param {*} slug 缩略名
   * @param {*} id 文章id
   */
  function updateHashPostSlugById(slug, id) {
    console.log(slug, id);
    return client
      .hsetnxAsync('slug.to.id', slug, id)
      .then(isSlugAvailable => {
        if (isSlugAvailable) {
          return client.hgetallAsync(`post:${id}`);
        }
        const err = new Error('slug不可用');
        err.errorCode = 10002;
        return Promise.reject(err);
      })
      .then(post => {
        const oldSlug = post.slug;
        return Promise.all([client.hsetAsync(`post:${id}`, 'slug', slug), oldSlug]);
      })
      .then(([status, oldSlug]) => {
        console.log('oldSlug', oldSlug);
        return client.hdelAsync('slug.to.id', oldSlug);
      });
  }

  return {
    create,
    createByHash,
    getPostById,
    getHashPostBySlug,
    updateHashPostSlugById
  };
};
