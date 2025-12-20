import { PartialType } from '@nestjs/swagger';
import { CreatePlanDto } from './create-subscription-plan.dto';

export class UpdateSubscriptionPlanDto extends PartialType(CreatePlanDto) {}
