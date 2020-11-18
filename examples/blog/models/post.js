module.exports = (client) => {
  /**
   * 获取热门文章
   * @param {Number} count 热门文章数量，默认1
   */
  function getHotPosts(count = 1) {
    return client
      .zrevrangeAsync('posts:page.view', 0, -1, 'WITHSCORES')
      .then((results) => {
        const groups = [];
        for (let i = 0; i < results.length; i += 2) {
          groups.push(results.slice(i, i + 2));
        }

        const multi = client.multi();
        const pageViews = [];
        groups.slice(0, count).forEach((group) => {
          const postId = group[0];
          pageViews.push(group[1]);
          multi.hgetall(`post:${postId}`);
        });
        return Promise.all([multi.execAsync(), pageViews]);
      })
      .then(([posts, pageViews]) => {
        return posts.map((post, idx) => {
          const newPost = { ...post };
          newPost.view = pageViews[idx];
          return newPost;
        });
      });
  }

  /**
   * 分页查询文章列表
   *
   * @param {Number} page 当前页
   * @param {Number} pageSize 每页数量
   */
  function getPostsByPage(page = 1, pageSize = 10) {
    const start = (page - 1) * pageSize;
    const end = page * pageSize - 1;
    return client.lrangeAsync('posts:list', start, end).then((postIds) => {
      const multi = client.multi();
      postIds.forEach((postId) => {
        multi.hgetall(`post:${postId}`);
      });
      return multi.execAsync();
    });
  }

  /**
   * 创建文章, 使用redis字符串数据类型存储
   *
   * post:count存文章id
   * post:${postId}:data存data
   *
   * @param {object} data {title: '标题', 'content': '内容', 'author': '作者', time: '发布时间'}
   * @param {function} callback
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
   * @param {object} data {title: '标题', 'content': '内容', 'author': '作者', time: '发布时间', slug: '文章缩略名'}
   */
  function createByHash(data) {
    return client
      .incrAsync('posts:count')
      .then((postId) => {
        return Promise.all([client.hsetnxAsync('slug.to.id', data.slug, postId), postId]);
      })
      .then(([isSlugAvailable, postId]) => {
        if (isSlugAvailable) {
          const post = Object.assign({}, data, { id: postId });

          return client.multi().hmset(`post:${postId}`, post).lpush('posts:list', postId).execAsync();

          // return client.hmsetAsync(`post:${postId}`, post);
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
   * 通过缩略名slug获取post，文章访问量+1
   *
   * @param {string} slug 缩略名
   */
  function getHashPostBySlug(slug) {
    return client.hgetAsync('slug.to.id', slug).then((postId) => {
      if (postId) {
        client
          .zincrbyAsync('posts:page.view', 1, postId)
          .then(() => {
            console.log('更新访问量成功');
          })
          .catch((err) => {
            console.error(`更新访问量失败, ${err}`);
          });
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
   * @param {string} slug 缩略名
   * @param {string} id 文章id
   */
  function updateHashPostSlugById(slug, id) {
    console.log(slug, id);
    return client
      .hsetnxAsync('slug.to.id', slug, id)
      .then((isSlugAvailable) => {
        if (isSlugAvailable) {
          return client.hgetallAsync(`post:${id}`);
        }
        const err = new Error('slug不可用');
        err.errorCode = 10002;
        return Promise.reject(err);
      })
      .then((post) => {
        const oldSlug = post.slug;
        return client.multi().hset(`post:${id}`, 'slug', slug).hdel('slug.to.id', oldSlug).execAsync();
      });
  }

  /**
   * 通过id删除post
   *
   * @param {string} id
   */
  function deleteById(id) {
    return client.hgetAsync(`post:${id}`, 'slug').then((slug) => {
      console.log(slug);
      return client.multi().lrem('posts:list', 1, id).hdel('slug.to.id', slug).del(`post:${id}`).execAsync();
    });
  }

  return {
    create,
    createByHash,
    getPostById,
    getHashPostBySlug,
    updateHashPostSlugById,
    deleteById,
    getPostsByPage,
    getHotPosts,
  };
};
