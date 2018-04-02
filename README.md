# nodejs-redis

serveral examples using node.js and redis

## 环境

* `node`: `v8.10.0`
* `npm`: `5.8.0`

## MacOS 下 redis 配置文件的位置

`/usr/local/etc/redis.conf`

## 使用某个配置文件启动`redis-server`

`redis-server path/redis.conf`

## 数据持久化

使用`RDB`和`AOF`二者结合的方式对`redis`数据进行持久化， 快照`dump.rdb`文件和`aof`文件路径如下:

```bash
~ » ls /usr/local/var/db/redis/
appendonly.aof dump.rdb
```
