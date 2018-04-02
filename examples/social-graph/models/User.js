const redis = require('../redis');

class User {
  /**
   * 从redis查询结果中构建一个User实例
   *
   * @author dulin
   * @static
   * @param {String} id 用户id
   * @returns
   * @memberof User
   */
  static find(id) {
    return redis.hgetallAsync(`user:${id}:data`).then(obj => {
      return new User(id, obj);
    });
  }

  constructor(id, data) {
    this.id = id;
    this.data = data;
  }

  /**
   * 创建和修改用户信息
   *
   * @author dulin
   * @returns
   * @memberof User
   */
  save() {
    if (!this.id) {
      this.id = String(Math.random()).substr(3);
    }
    return redis.hmsetAsync(`user:${this.id}:data`, this.data);
  }

  /**
   * 关注
   *
   * @author dulin
   * @param {String} userId 被关注的用户id
   * @returns
   * @memberof User
   */
  follow(userId) {
    return redis
      .multi()
      .sadd(`user:${userId}:followers`, this.id)
      .sadd(`user:${this.id}:follows`, userId)
      .execAsync();
  }

  /**
   * 取消关注
   *
   * @author dulin
   * @param {String} userId 被关注的用户id
   * @returns
   * @memberof User
   */
  unfollow(userId) {
    return redis
      .multi()
      .srem(`user:${userId}:followers`, this.id)
      .srem(`user:${this.id}:follows`, userId)
      .execAsync();
  }

  /**
   * 获取粉丝
   *
   * @author dulin
   * @returns
   * @memberof User
   */
  getFollowers() {
    return redis.smembersAsync(`user:${this.id}:followers`);
  }

  /**
   * 获取关注的人
   *
   * @author dulin
   * @returns
   * @memberof User
   */
  getFollows() {
    return redis.smembersAsync(`user:${this.id}:follows`);
  }

  /**
   * 获取朋友
   * 如果某个用户的id同时出现在另一个用户的关注和粉丝列表中，那么他们就是朋友
   *
   * @author dulin
   * @memberof User
   */
  getFriends() {
    return redis.sinterAsync(`user:${this.id}:followers`, `user:${this.id}:follows`);
  }
}

module.exports = User;
