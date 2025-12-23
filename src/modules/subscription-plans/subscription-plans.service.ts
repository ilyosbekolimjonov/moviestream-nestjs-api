import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-subscription-plan.dto';

@Injectable()
export class SubscriptionPlansService {
  constructor(private readonly prisma: PrismaService) { }

  async getActivePlans() {
    const plans = await this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        price: true,
        durationDays: true,
        features: true,
      },
      orderBy: { price: 'asc' },
    });

    return {
      success: true,
      data: plans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        price: Number(plan.price),
        duration_days: plan.durationDays,
        features: plan.features,
      })),
    };
  }

  async createPlan(dto: CreatePlanDto) {
    const plan = await this.prisma.subscriptionPlan.create({
      data: {
        name: dto.name,
        price: dto.price,
        durationDays: dto.duration_days,
        features: dto.features,
        isActive: dto.is_active ?? true,
      },
    });

    return {
      success: true,
      message: 'Obuna rejasi muvaffaqiyatli yaratildi',
      data: {
        id: plan.id,
        name: plan.name,
        price: Number(plan.price),
        duration_days: plan.durationDays,
        features: plan.features,
        is_active: plan.isActive,
      },
    };
  }

  async deletePlan(id: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
      include: {
        subscriptions: {
          where: {
            status: {
              in: ['active', 'pending_payment'],
            },
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException(
        `ID ${id} bo'lgan obuna rejasi topilmadi`,
      );
    }

    if (plan.subscriptions && plan.subscriptions.length > 0) {
      throw new BadRequestException(
        `Bu obuna rejasida ${plan.subscriptions.length} ta faol obuna mavjud. Avval ularni bekor qiling yoki tugatilishini kuting.`,
      );
    }

    const deleted = await this.prisma.subscriptionPlan.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Obuna rejasi muvaffaqiyatli o\'chirildi',
      data: {
        id: deleted.id,
        name: deleted.name,
      },
    };
  }
}