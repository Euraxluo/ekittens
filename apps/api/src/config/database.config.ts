import {registerAs} from "@nestjs/config";

export const databaseConfig = registerAs("db", () => {
  const env = process.env;

  return {
    type: "postgres",
    host: env.DB_HOST,
    port: parseInt(env.DB_PORT, 10),
    database: env.DB_DATABASE,
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    synchronize: JSON.parse(env.DB_SYNCHRONIZE.toLowerCase()),
    autoLoadEntities: true,
    ssl: true,
    extra: {
      ssl: {
        sslmode: 'require',
        rejectUnauthorized: false
      }
    }
  };
});

