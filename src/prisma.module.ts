import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/** Global module: PrismaService is available for injection in any module without importing PrismaModule. */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
