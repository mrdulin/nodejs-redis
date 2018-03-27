module.exports = client => {
  function create(data, callback) {
    client.incr('posts:count', (err, postId) => {
      client.set(`post:${postId}:data`, JSON.stringify(data), () => {
        callback(err);
      });
    });
  }

  function getData(postId, callback) {
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
    getData
  };
};
