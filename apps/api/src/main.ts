import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap(){
  const app=await NestFactory.create(AppModule);
  app.enableCors({origin:[process.env.WEB_ORIGIN || "http://localhost:5173",process.env.ADMIN_ORIGIN || "http://localhost:5174"],credentials:false});
  app.useGlobalPipes(new ValidationPipe({whitelist:true,transform:true}));
  const port=Number(process.env.API_PORT || 4000);
  await app.listen(port,"0.0.0.0");
  console.log(`Foundry API listening on ${port}`);
}
bootstrap();
