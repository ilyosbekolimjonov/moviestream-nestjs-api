import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PurchaseSubscriptionDto } from './dto/purchase-subscription.dto';
import { Prisma, Payment } from '@prisma/client';

@Injectable()
export class UserSubscriptionsService {
  constructor(private readonly prisma: PrismaService) { }

  async purchase(userId: string, dto: PurchaseSubscriptionDto) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: dto.plan_id, isActive: true },
    });

    if (!plan) {
      throw new NotFoundException('Obuna rejasi topilmadi yoki faol emas');
    }

    const isFreePlan = Number(plan.price) === 0;
    const externalTransactionId = isFreePlan
      ? null
      : `txn_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

    const startDate = new Date();
    let endDate: Date | null = null;

    if (plan.durationDays > 0) {
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + plan.durationDays);
    }

    return this.prisma.$transaction(async (tx) => {
      const subscription = await tx.userSubscription.create({
        data: {
          userId,
          planId: plan.id,
          startDate,
          endDate,
          status: 'active',
          autoRenew: dto.auto_renew,
        },
        include: {
          plan: {
            select: { id: true, name: true },
          },
        },
      });

      let payment: Payment | null = null;

      if (!isFreePlan) {
        payment = await tx.payment.create({
          data: {
            userSubscriptionId: subscription.id,
            amount: plan.price,
            paymentMethod: dto.payment_method,
            paymentDetails: dto.payment_details as unknown as Prisma.JsonObject,
            status: 'completed',
            externalTransactionId,
          },
        });
      }

      return {
        success: true,
        message: 'Obuna muvaffaqiyatli sotib olindi',
        data: {
          subscription: {
            id: subscription.id,
            plan: {
              id: subscription.plan.id,
              name: subscription.plan.name,
            },
            start_date: subscription.startDate.toISOString(),
            end_date: subscription.endDate?.toISOString() ?? null,
            status: subscription.status,
            auto_renew: subscription.autoRenew,
          },
          payment: payment
            ? {
              id: payment.id,
              amount: Number(payment.amount),
              status: payment.status,
              external_transaction_id: payment.externalTransactionId,
              payment_method: payment.paymentMethod,
            }
            : null,
        },
      };
    });
  }
}