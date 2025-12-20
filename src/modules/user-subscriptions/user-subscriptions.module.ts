import { Module } from '@nestjs/common';
import { UserSubscriptionsService } from './user-subscriptions.service';
import { UserSubscriptionsController } from './user-subscriptions.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserSubscriptionsController],
  providers: [UserSubscriptionsService],
  exports: [ UserSubscriptionsService]
})
export class UserSubscriptionsModule {}
