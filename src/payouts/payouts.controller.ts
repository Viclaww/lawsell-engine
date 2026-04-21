import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PayoutsService } from './payouts.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IsNumber, IsPositive, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class RequestPayoutDto {
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount: number;
}

class UpdatePayoutStatusDto {
  @IsString()
  status: string;
}

@Controller('payouts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PayoutsController {
  constructor(private payoutsService: PayoutsService) {}

  @Get('wallet/:vendorId')
  getWallet(@Param('vendorId') vendorId: string) {
    return this.payoutsService.getWallet(vendorId);
  }

  @Post('request/:vendorId')
  @Roles('VENDOR', 'ADMIN')
  requestPayout(@Param('vendorId') vendorId: string, @Body() dto: RequestPayoutDto) {
    return this.payoutsService.requestPayout(vendorId, dto.amount);
  }

  @Get(':vendorId')
  getPayouts(@Param('vendorId') vendorId: string) {
    return this.payoutsService.getPayouts(vendorId);
  }

  @Patch(':payoutId/status')
  @Roles('ADMIN')
  updateStatus(
    @Param('payoutId') payoutId: string,
    @Body() dto: UpdatePayoutStatusDto,
  ) {
    return this.payoutsService.updatePayoutStatus(payoutId, dto.status);
  }
}
