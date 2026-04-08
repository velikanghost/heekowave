import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as StellarSdk from '@stellar/stellar-sdk';

@Injectable()
export class SorobanService {
  private readonly logger = new Logger(SorobanService.name);
  private server: StellarSdk.rpc.Server;
  private contractId: string;

  constructor(private configService: ConfigService) {
    const rpcUrl = this.configService.get<string>('SOROBAN_RPC_URL') || 'https://soroban-testnet.stellar.org';
    this.contractId = this.configService.get<string>('HEEKOWAVE_CONTRACT_ID') || 'CDXECR7OZG7I2IVCE36NKXJUYDL3ECHNAG4UFEA6C23X67QEVQB2JMQV';
    this.server = new StellarSdk.rpc.Server(rpcUrl);
  }

  /**
   * Fetches all services registered in the Soroban Heekowave contract
   */
  async getAllServices(): Promise<any[]> {
    try {
      this.logger.log(`Fetching services from contract ${this.contractId}...`);
      
      // We use a dummy account for simulation
      const dummyAccount = new StellarSdk.Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', '0');
      
      const tx = new StellarSdk.TransactionBuilder(dummyAccount, {
        fee: '100',
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
      .addOperation(
        StellarSdk.Operation.invokeHostFunction({
          func: StellarSdk.xdr.HostFunction.hostFunctionTypeInvokeContract(
            new StellarSdk.xdr.InvokeContractArgs({
              contractAddress: StellarSdk.Address.fromString(this.contractId).toScAddress(),
              functionName: 'get_all_services',
              args: [],
            }),
          ),
          auth: [],
        })
      )
      .setTimeout(30)
      .build();

      const response = await this.server.simulateTransaction(tx);

      if (StellarSdk.rpc.Api.isSimulationSuccess(response)) {
        const resultVal = response.result?.retval;
        if (!resultVal) return [];
        
        const nativeResult = StellarSdk.scValToNative(resultVal);
        this.logger.log(`Found ${nativeResult?.length || 0} services on-chain.`);
        return nativeResult || [];
      }
      
      this.logger.error('Soroban simulation failed:', response);
      return [];
    } catch (e) {
      this.logger.error('Error querying Soroban contract:', e);
      return [];
    }
  }
}
