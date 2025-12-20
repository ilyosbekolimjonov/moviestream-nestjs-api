import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserSubscriptionsService } from './user-subscriptions.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PurchaseSubscriptionDto } from './dto/purchase-subscription.dto';
import type { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('User Subscriptions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('subscription')
export class UserSubscriptionsController {
  constructor(
    private readonly userSubscriptionsService: UserSubscriptionsService,
  ) {}

  @Post('purchase')
  @ApiOperation({ summary: 'Obuna rejani sotib olish' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 201,
    description: 'Obuna muvaffaqiyatli sotib olindi',
    schema: {
      example: {
        success: true,
        message: 'Obuna muvaffaqiyatli sotib olindi',
        data: {
          subscription: {
            id: '550e8400-e29b-41d4-a716-446655440010',
            plan: { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Premium' },
            start_date: '2025-12-19T10:00:00.000Z',
            end_date: '2026-01-18T10:00:00.000Z',
            status: 'active',
            auto_renew: true,
          },
          payment: {
            id: '550e8400-e29b-41d4-a716-446655440011',
            amount: 49.99,
            status: 'completed',
            external_transaction_id: 'txn_123456789',
            payment_method: 'card',
          },
        },
      },
    },
  })
  purchase(@Req() req: RequestWithUser, @Body() dto: PurchaseSubscriptionDto) {
    return this.userSubscriptionsService.purchase(req.user.id, dto);
  }
}