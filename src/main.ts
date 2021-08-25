import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // logger: console
  });
  
  const port = 1337;
  await app.listen(port, () => {
    console.log('listen localhost:' + port)
  });
}
bootstrap();
