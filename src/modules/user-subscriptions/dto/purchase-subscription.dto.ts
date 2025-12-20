import {
  IsUUID,
  IsEnum,
  IsBoolean,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

class PaymentDetailsDto {
  @ApiProperty({ example: '4242424242424242' })
  card_number: string;

  @ApiProperty({ example: '04/26' })
  expiry: string;

  @ApiProperty({ example: 'ALIJON VALIYEV' })
  card_holder: string;
}

export class PurchaseSubscriptionDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440002' })
  @IsUUID()
  plan_id: string;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;

  @ApiProperty({ example: true })
  @IsBoolean()
  auto_renew: boolean;

  @ApiProperty({ type: PaymentDetailsDto })
  @IsObject()
  @ValidateNested()
  @Type(() => PaymentDetailsDto)
  payment_details: PaymentDetailsDto;
}