import { Controller, All, Get, Req, Res, Param, UseGuards, NotFoundException, HttpException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ProxyService } from './proxy.service.js';
import { X402Guard } from './x402.guard.js';

@Controller('proxy')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get('registry')
  async getRegistry() {
    return this.proxyService.getAllApis();
  }

  @Get('stats')
  async getStats() {
    return this.proxyService.getStats();
  }

  @All(':apiId/*')
  @UseGuards(X402Guard)
  async handleProxy(@Param('apiId') apiId: string, @Req() req: Request, @Res() res: Response) {
    const api = await this.proxyService.getApi(apiId);
    if (!api) throw new NotFoundException('API not found');

    const subPath = (req.params as any)[0] || '';
    const query = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    const targetUrl = `${api.endpoint.replace(/\/$/, '')}/${subPath.replace(/^\//, '')}${query}`;

    // Filter headers to avoid loops and internal logic leaks
    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      const lowerKey = key.toLowerCase();
      if (!['host', 'l-http', 'content-length', 'connection'].includes(lowerKey)) {
        headers[key] = value as string;
      }
    }
    
    try {
      const fetchOptions: any = {
        method: req.method,
        headers,
      };

      if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body && Object.keys(req.body).length > 0) {
        fetchOptions.body = JSON.stringify(req.body);
        if (!headers['Content-Type']) {
          headers['Content-Type'] = 'application/json';
        }
      }

      const response = await fetch(targetUrl, fetchOptions);
      
      // Try to parse JSON, fall back to text if needed
      const contentType = response.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      res.status(response.status).send(data);
    } catch (error) {
      console.error('Proxy Error:', error);
      throw new HttpException('Error proxying to destination: ' + error.message, 502);
    }
  }
}
