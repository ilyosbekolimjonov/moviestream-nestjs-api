import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { SubscriptionPlansController } from './subscription-plans.controller';
import { SubscriptionPlansService } from './subscription-plans.service';

@Module({
  imports: [PrismaModule],
  controllers: [SubscriptionPlansController, ],
  providers: [SubscriptionPlansService, ],
  exports: [SubscriptionPlansService],
})
export class SubscriptionModule {}