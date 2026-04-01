import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const isProduction = process.env.NODE_ENV === 'production';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  ...(isProduction
    ? {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
      }
    : {
        socketPath:
          '/Users/mac/Library/Application Support/Local/run/UteqvhJUf/mysql/mysqld.sock',
      }),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_DATABASE || 'brass_study',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
  charset: 'utf8mb4',
  logging: isProduction ? ['error'] : ['error', 'warn'],
};
