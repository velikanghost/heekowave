import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ProxyModule } from './proxy/proxy.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [ProxyModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
