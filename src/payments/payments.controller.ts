import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { InitializePaymentDto } from './dto/initialize-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('initialize')
  @UseGuards(JwtAuthGuard)
  initialize(@Body() dto: InitializePaymentDto, @CurrentUser() user: any) {
    return this.paymentsService.initialize(dto, user.email);
  }

  @Post('webhook')
  async webhook(
    @Req() req: Request,
    @Headers('x-paystack-signature') signature: string,
  ) {
    await this.paymentsService.verifyWebhook(req.body, signature);
    return { received: true };
  }

  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard)
  findByOrder(@Param('orderId') orderId: string) {
    return this.paymentsService.findByOrder(orderId);
  }

  @Get('reference/:reference')
  @UseGuards(JwtAuthGuard)
  findByReference(@Param('reference') reference: string) {
    return this.paymentsService.findByReference(reference);
  }
}
