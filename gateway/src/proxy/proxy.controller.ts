import { Controller, All, Req, Res, Param, UseGuards, NotFoundException, HttpException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ProxyService } from './proxy.service';
import { X402Guard } from './x402.guard';

@Controller('proxy')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @All(':apiId/*')
  @UseGuards(X402Guard)
  async handleProxy(@Param('apiId') apiId: string, @Req() req: Request, @Res() res: Response) {
    const api = this.proxyService.getApi(apiId);
    if (!api) throw new NotFoundException('API not found');

    // Simple proxying logic
    // We strip the /proxy/:apiId prefix if needed, but for our mock weather API
    // we'll just hit the mapped URL directly
    
    try {
      // In production, we would use axios or node-fetch to properly proxy headers, body, params
      const response = await fetch(api.url, {
        method: req.method,
        // body and other headers skipped for hackathon simplicity
      });

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      throw new HttpException('Error proxying to destination', 502);
    }
  }
}
