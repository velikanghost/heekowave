import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProxyController } from './proxy.controller.js';
import { ProxyService } from './proxy.service.js';
import { SorobanService } from './soroban.service.js';
import { X402Guard } from './x402.guard.js';

@Module({
  imports: [ConfigModule],
  controllers: [ProxyController],
  providers: [ProxyService, SorobanService, X402Guard],
  exports: [ProxyService]
})
export class ProxyModule {}
