// 需求：卖家将一件商品放到市场上进行销售

// 功能：程序需要将被销售的商品添加到记录市场正在销售商品的有序集合中，并在添加操作执行的过程中，
// 监视卖家的包裹以确保被销售的商品的确存在于卖家的包裹当中

const redis = require('./redis');

function removeItem(inventory, itemId, i = 0) {
  return redis.sremAsync(inventory, itemId);
}

// users:userId - hash
// inventory:userId - set

function sellItem(itemId, sellerId, price) {
  const inventory = `inventory:${sellerId}`;
  const item = `${itemId}.${sellerId}`;

  return redis
    .existsAsync(inventory)
    .then(exist => {
      if (exist) {
        return redis.watchAsync(inventory);
      }
      const err = new Error(`key "${inventory}" is not existed.`);
      return Promise.reject(err);
    })
    .then(() => {
      return redis.sismemberAsync(inventory, itemId);
    })
    .then(exist => {
      if (exist) {
        const multi = redis.multi();
        multi.zadd('market:', item, price).srem(inventory, itemId);
        redis.saddAsync(inventory, 'rose');

        return multi.execAsync();
        // .catch(err => {
        //   const errMsg = "user's inventory changed. retry.";
        //   console.error(err);
        //   console.log(errMsg);
        //   sellItem.retry = typeof sellItem.retry !== 'undefined' ? sellItem.retry + 1 : 0;
        //   if (sellItem.retry < 3) {
        //     console.log('retry sell item...');
        //     sellItem(itemId, sellerId, price);
        //   }
        // });
      }
      return redis.unwatchAsync().then(() => 'sell item failed');
    });
}

const sellerId = 100;
const item = 'gun';
function init() {
  return redis.saddAsync(`inventory:${sellerId}`, item);
}

init()
  .then(() => sellItem(item, sellerId, 298))
  .then(msg => {
    if (msg === 'sell item failed') {
      console.log(msg);
    } else if (msg === 'add item to market successfully') {
      console.log(msg);
    }
  })
  .catch(console.error)
  .finally(() => redis.quit());
