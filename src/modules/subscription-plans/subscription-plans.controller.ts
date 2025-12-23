import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { SubscriptionPlansService } from './subscription-plans.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { CreatePlanDto } from './dto/create-subscription-plan.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('Subscription Plans')
@Controller('subscription/plans')
export class SubscriptionPlansController {
  constructor(private readonly plansService: SubscriptionPlansService) { }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Faol obuna rejalarini olish' })
  @ApiResponse({
    status: 200,
    description: 'Muvaffaqiyatli',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: '550e8400-e29b-41d4-a716-446655440001',
            name: 'Free',
            price: 0.0,
            duration_days: 0,
            features: ['SD sifatli kinolar', 'Reklama bilan'],
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440002',
            name: 'Premium',
            price: 49.99,
            duration_days: 30,
            features: ['HD sifatli kinolar', 'Reklamasiz', 'Yangi kinolar'],
          },
        ],
      },
    },
  })
  getActivePlans() {
    return this.plansService.getActivePlans();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Yangi obuna rejasi yaratish (Admin uchun)' })
  @ApiResponse({
    status: 201,
    description: 'Reja muvaffaqiyatli yaratildi',
    schema: {
      example: {
        success: true,
        message: 'Obuna rejasi muvaffaqiyatli yaratildi',
        data: {
          id: '550e8400-e29b-41d4-a716-446655440002',
          name: 'Premium',
          price: 49.99,
          duration_days: 30,
          features: ['HD sifatli kinolar', 'Reklamasiz', 'Yangi kinolar'],
          is_active: true,
        },
      },
    },
  })
  async createPlan(@Body() dto: CreatePlanDto) {
    return this.plansService.createPlan(dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete subscription plan' })
  @ApiParam({ name: 'id', description: 'Plan ID' })
  @ApiResponse({ status: 200, description: 'Plan deleted successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete plan with active subscriptions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  deletePlan(@Param('id') id: string) {
    return this.plansService.deletePlan(id);
  }

}