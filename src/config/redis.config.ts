import configuration from './configuration';
import { RedisClientOptions } from 'redis';

export const redisConfig = (): RedisClientOptions => {
  const config = configuration();
  return {
    socket: {
      host: config.redis.host,
      port: config.redis.port,
    },
  };
};
