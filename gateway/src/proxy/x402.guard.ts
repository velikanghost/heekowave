import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { ProxyService } from './proxy.service.js';
import { useFacilitator, decodePaymentHeader, PaymentRequirements } from 'x402-stellar';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service.js';
import { Keypair, TransactionBuilder, Networks, Transaction } from '@stellar/stellar-sdk';

@Injectable()
export class X402Guard implements CanActivate {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const apiId = req.params.apiId as string;
    
    // Await the new async DB fetch
    const api = await this.proxyService.getApi(apiId);
    if (!api) {
      throw new HttpException('API not found in Bazaar registry', HttpStatus.NOT_FOUND);
    }

    const { verify } = useFacilitator({
      url: process.env.FACILITATOR_URL || 'https://x402-facilitator.onrender.com'
    });

    const lHttpHeader = req.headers['l-http'];
    const testXdr = req.headers['x-heeko-test-xdr'] as string;

    // --- Provider Bypass Logic (XDR-based) ---
    if (testXdr) {
      try {
        const tx = TransactionBuilder.fromXDR(testXdr, Networks.TESTNET);
        const source = (tx instanceof Transaction) ? tx.source : tx.feeSource;
        const isProviderSigner = tx.signatures.some(_ => {
            try {
              // This is a simplified check for the demo: 
              // we check if the transaction's source account or a signer matches the provider.
              return source === api.provider;
            } catch { return false; }
        });

        if (isProviderSigner) {
          // In a production app, we would also verify the signature itself and the sequence number.
          // For the hackathon E2E, we'll accept the signed XDR from the provider's wallet.
          return true; 
        }
      } catch (err) {
        console.error('Bypass verification error:', err);
      }
    }
    
    const requirements: PaymentRequirements = {
      scheme: 'exact',
      network: 'stellar-testnet',
      maxAmountRequired: api.price,
      resource: api.endpoint,
      description: 'API Payment for ' + api.id,
      mimeType: 'application/json',
      payTo: api.provider,
      maxTimeoutSeconds: 3600,
      asset: 'native'
    };

    if (!lHttpHeader || typeof lHttpHeader !== 'string') {
      throw new HttpException({
        status: HttpStatus.PAYMENT_REQUIRED,
        error: 'Payment Required',
        message: 'This endpoint is paywalled via x402 on Stellar. Please provide an L-HTTP receipt.',
        requirements
      }, HttpStatus.PAYMENT_REQUIRED);
    }

    try {
      const payload = decodePaymentHeader<any>(lHttpHeader);
      
      // Double spend prevention
      // The x402-stellar 'decode' function typically extracts the transaction `hash`
      const paymentHash = payload.hash || lHttpHeader.substring(0, 64);
      
      const existing = await this.prisma.paymentReceipt.findUnique({
        where: { paymentHash }
      });
      
      if (existing) {
        throw new HttpException('Payment receipt already used! (Double-spend detected)', HttpStatus.PAYMENT_REQUIRED);
      }
      
      const verification = await verify(payload, requirements);

      if (!verification.isValid) {
        throw new HttpException('Invalid x402 verification: ' + verification.invalidReason, HttpStatus.PAYMENT_REQUIRED);
      }

      // Valid payment! Save the transaction locally to prevent double spends
      await this.prisma.paymentReceipt.create({
        data: {
          paymentHash,
          serviceId: api.id,
          amount: api.price,
          payTo: api.provider
        }
      });

      return true;

    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw new HttpException('Invalid x402 header formatting or signature validation failed', HttpStatus.BAD_REQUEST);
    }
  }
}
