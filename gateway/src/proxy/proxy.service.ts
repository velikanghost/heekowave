import { Injectable } from '@nestjs/common';

export interface RegisteredApi {
  id: string;
  url: string;
  price: string;
  merchant: string;
}

@Injectable()
export class ProxyService {
  private apis = new Map<string, RegisteredApi>();

  constructor() {
    // Seed with a mock weather API
    this.apis.set('weather', {
      id: 'weather',
      url: 'https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m', // A free public endpoint for testing
      price: '0.01',
      merchant: 'GBmerchantAddressHere' // Replace with real one in production
    });
  }

  getApi(id: string): RegisteredApi | undefined {
    return this.apis.get(id);
  }

  registerApi(api: RegisteredApi) {
    this.apis.set(api.id, api);
  }
}
