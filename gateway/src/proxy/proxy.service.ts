import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Service } from '@prisma/client';
import { SorobanService } from './soroban.service.js';

@Injectable()
export class ProxyService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private soroban: SorobanService,
  ) {}

  async onModuleInit() {
    // Initial sync on startup
    this.syncFromChain().catch((err) => {
      console.error('Initial Soroban sync failed:', err);
    });

    // Periodic sync every 5 seconds
    setInterval(() => {
      this.syncFromChain().catch((err) => {
        console.error('Periodic Soroban sync failed:', err);
      });
    }, 5000);
  }

  async getApi(id: string): Promise<Service | null> {
    return this.prisma.service.findUnique({
      where: { id },
    });
  }

  async getAllApis(): Promise<Service[]> {
    return this.prisma.service.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Syncs the local database with the Soroban smart contract
   */
  async syncFromChain(): Promise<void> {
    const chainServices = await this.soroban.getAllServices();

    for (const svc of chainServices) {
      // Map Soroban struct to Prisma model
      // Price is typically in stroops (7 decimals)
      const price = (Number(svc.price) / 10000000).toString();
      const slug = this.slugify(svc.name);

      await this.prisma.service.upsert({
        where: { id: svc.id.toString() },
        update: {
          name: svc.name,
          slug,
          provider: svc.provider,
          endpoint: svc.endpoint,
          price: price,
          tags: svc.tags,
        },
        create: {
          id: svc.id.toString(),
          name: svc.name,
          slug,
          provider: svc.provider,
          endpoint: svc.endpoint,
          price: price,
          tags: svc.tags,
        },
      });
    }
  }

  async getApiBySlug(shortAddr: string, slug: string): Promise<Service | null> {
    // shortAddr format: "GBNKN7H" -> prefix="GBN", suffix="KN7H"
    const prefix = shortAddr.slice(0, 3);
    const suffix = shortAddr.slice(3);

    return this.prisma.service.findFirst({
      where: {
        slug,
        provider: {
          startsWith: prefix,
          endsWith: suffix,
        },
      },
    });
  }

  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-'); // Replace multiple - with single -
  }

  async getStats() {
    try {
      const registryCount = await this.prisma.service.count();
      const receipts = await this.prisma.paymentReceipt.findMany();

      let totalVolume = 0;
      const activeServiceIds = new Set<string>();

      receipts.forEach((r) => {
        totalVolume += parseFloat(r.amount);
        activeServiceIds.add(r.serviceId);
      });

      return {
        registryCount,
        totalVolume: totalVolume.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        activeAgents: activeServiceIds.size,
      };
    } catch (error) {
      console.error(
        'Error fetching stats from DB (likely uninitialized):',
        error.message,
      );
      return {
        registryCount: 0,
        totalVolume: '0.00',
        activeAgents: 0,
      };
    }
  }
}
