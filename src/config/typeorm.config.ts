import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import configuration from './configuration';
import { join } from 'path';

export const typeOrmConfig = (): TypeOrmModuleOptions => {
  const config = configuration();
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    type: 'postgres',
    host: config.database.host,
    port: config.database.port,
    username: config.database.username,
    password: config.database.password,
    database: config.database.name,
    entities: [join(__dirname, '../**/*.entity.{ts,js}')],
    ssl: config.database.ssl ? {
      rejectUnauthorized: false // Important for AWS RDS connections
    } : false,
    synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true' || (!isProduction && process.env.TYPEORM_SYNCHRONIZE !== 'false'),
    migrationsRun: process.env.TYPEORM_MIGRATIONS_RUN === 'true' || (isProduction && process.env.TYPEORM_MIGRATIONS_RUN !== 'false'),
    migrations: [join(__dirname, '../migrations/*.{ts,js}')],
  };
};
