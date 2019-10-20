import Promise from "bluebird"; // eslint-disable-line no-global-assign
import redis from "redis";
import cuid from "uuid/v1";
import { EventEmitter } from "events";
import config from "../config";
import logger from "./logger";
Promise.promisifyAll(redis.RedisClient.prototype);
const redisConf = config.redis;

// connect to redis
export const redisClient = redis.createClient({
  port: redisConf.port,
  host: redisConf.host || "127.0.0.1",
  retry_strategy: options => {
    if (options.times_connected >= 3) {
      // End reconnecting after a specific number of tries and flush all commands with a individual error
      return new Error("Retry attempts exhausted");
    }
    // reconnect after
    return 1000;
  },
});
redisClient.auth(redisConf.password, (err, reply) => {
  if (err) {
    logger.error(
      `unable to connect to redis: ${redisConf.host}:${redisConf.port}`,
    );
  } else {
    logger.info(" [*] Redis: authentication Succeeded.");
  }
});
redisClient.on("connect", () =>
  logger.info(" [*] Redis: Connection Succeeded."),
);
redisClient.on("error", err => {
  logger.error(
    `unable to connect to redis: ${redisConf.host}:${redisConf.port}`,
  );
});

const popTimeout = 10;
export function pushQueue(queueName = "workqueue", work, cb) {
  const id = cuid();
  const item = {
    work,
    created: Date.now(),
    id,
  };
  redisClient.lpush(`${queueName}:in`, JSON.stringify(item), err => {
    if (err) {
      cb(err);
    } else {
      cb(null, id);
    }
  });
}
export function Worker(queueName, fn) {
  const conn = redis.createClient();
  setImmediate(next);
  const worker = new EventEmitter();
  worker.close = close;
  return worker;
  function next() {
    conn.brpoplpush(
      `${queueName}:in`,
      `${queueName}:processing`,
      popTimeout,
      popped,
    );
    function popped(err, item) {
      if (err) {
        worker.emit("error", err);
      } else if (item) {
        const parsed = JSON.parse(item);
        fn.call(null, parsed.work, parsed.id, workFinished);
      }
      function workFinished() {
        conn.lrem(`${queueName}:processing`, 1, item, poppedFromProcessing);
      }
      /* eslint-disable-next-line  */
      function poppedFromProcessing(err) {
        if (err) {
          worker.emit("error", err);
        }
        next();
      }
    }
  }
  function close() {
    conn.quit();
  }
}
