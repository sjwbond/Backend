import { Module } from "@nestjs/common";
import { Pool } from "pg";
import { PG_CONNECTION } from "src/constants";
import { dataPgDatabase, dataPgHost, dataPgPassword, dataPgPort, dataPgSsl, dataPgUser } from "src/variables";

const dataProvider = {
  provide: PG_CONNECTION,
  useValue: new Pool({
    user: dataPgUser(),
    host: dataPgHost(),
    database: dataPgDatabase(),
    password: dataPgPassword(),
    port: dataPgPort(),
    ssl: dataPgSsl() ? {
      rejectUnauthorized: false,
    } : undefined
  }),
};

@Module({
  providers: [dataProvider],
  exports: [dataProvider],
})
export class DataModule {}
