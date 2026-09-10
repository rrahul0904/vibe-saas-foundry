import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import helmet from "helmet";
import { AppModule } from "./app.module";
import dataSource from "./data-source";

async function migrate() {
  if (process.env.DB_RUN_MIGRATIONS !== "true") return;
  await dataSource.initialize();
  await dataSource.runMigrations();
  await dataSource.destroy();
}

async function bootstrap() {
  await migrate();
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors({
    origin: [process.env.WEB_ORIGIN || "http://localhost:5173", process.env.ADMIN_ORIGIN || "http://localhost:5174"],
    credentials: false,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  const port = Number(process.env.API_PORT || 4000);
  await app.listen(port, "0.0.0.0");
  console.log(`Foundry API listening on ${port}`);
}
bootstrap();
