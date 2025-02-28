import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import configuration from './configuration';
import { join } from 'path';

export const typeOrmConfig = (): TypeOrmModuleOptions => {
  const config = configuration();
  return {
    type: 'postgres',
    host: config.database.host,
    port: config.database.port,
    username: config.database.username,
    password: config.database.password,
    database: config.database.name,
    entities: [join(__dirname, '../**/*.entity.{ts,js}')],
    // logging: process.env.NODE_ENV !== 'production',
    // In production, you'd want to disable synchronize
    synchronize: process.env.NODE_ENV !== 'production',
    // For migrations:
    // migrations: [join(__dirname, '../migrations/*.{ts,js}')],
  };
};
