import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    console.log('Connected to SQLite database via Prisma');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('Disconnected from SQLite database');
  }
}