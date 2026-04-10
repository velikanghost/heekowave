import 'dotenv/config';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    if (!process.env.DATABASE_URL) {
      console.error('CRITICAL: DATABASE_URL environment variable is missing.');
    }
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (err) {
      console.error('FAILED TO CONNECT TO DATABASE:', err.message);
      throw err;
    }
  }
}
