import { DataSource } from 'typeorm';
import { typeOrmConfig } from './typeorm.config';
import configuration from './configuration';

const options = typeOrmConfig();
const config = configuration();

const dataSource = new DataSource({
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.name,
  entities: options.entities,
  ssl: true,
  migrations: options.migrations,
  migrationsTableName: options.migrationsTableName,
});

export default dataSource; 