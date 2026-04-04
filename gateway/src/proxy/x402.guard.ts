import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { useFacilitator, decodePaymentHeader, PaymentRequirements } from 'x402-stellar';
import { Request } from 'express';

@Injectable()
export class X402Guard implements CanActivate {
  constructor(private readonly proxyService: ProxyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const apiId = req.params.apiId as string;
    
    const api = this.proxyService.getApi(apiId);
    if (!api) {
      throw new HttpException('API not found in Bazaar registry', HttpStatus.NOT_FOUND);
    }

    const { verify } = useFacilitator({
      url: process.env.FACILITATOR_URL || 'https://x402-facilitator.onrender.com' // Usually configure this to actual OpenZeppelin relayer
    });

    const lHttpHeader = req.headers['l-http'];
    
    // Construct the required payment parameters
    const requirements: PaymentRequirements = {
      scheme: 'exact',
      network: 'stellar-testnet',
      maxAmountRequired: api.price.toString(),
      resource: api.url,
      description: 'API Payment for ' + api.id,
      mimeType: 'application/json',
      payTo: api.merchant,
      maxTimeoutSeconds: 3600,
      asset: 'native' // Or the USDC contract id
    };

    if (!lHttpHeader || typeof lHttpHeader !== 'string') {
      // Request a payment
      throw new HttpException({
        status: HttpStatus.PAYMENT_REQUIRED,
        error: 'Payment Required',
        message: 'This endpoint is paywalled via x402 on Stellar. Please provide an L-HTTP receipt.',
        requirements
      }, HttpStatus.PAYMENT_REQUIRED);
    }

    try {
      // We have the header, verify it
      const payload = decodePaymentHeader<any>(lHttpHeader);
      
      const verification = await verify(payload, requirements);

      if (!verification.isValid) {
        throw new HttpException('Invalid x402 payment receipt', HttpStatus.PAYMENT_REQUIRED);
      }

      // Valid payment!
      return true;

    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw new HttpException('Invalid x402 header formatting', HttpStatus.BAD_REQUEST);
    }
  }
}
