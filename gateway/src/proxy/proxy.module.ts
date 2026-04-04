import { Module } from '@nestjs/common';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './proxy.service';
import { X402Guard } from './x402.guard';

@Module({
  controllers: [ProxyController],
  providers: [ProxyService, X402Guard],
  exports: [ProxyService]
})
export class ProxyModule {}
