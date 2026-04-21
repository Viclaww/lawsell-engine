import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { LogisticsService } from './logistics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UpdateStatusDto } from './dto/update-status.dto';

@Controller('logistics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LogisticsController {
  constructor(private logisticsService: LogisticsService) {}

  @Get('order/:orderId/status')
  getStatus(@Param('orderId') orderId: string) {
    return this.logisticsService.getOrderStatus(orderId);
  }

  @Patch('order/:orderId/status')
  @Roles('ADMIN', 'VENDOR')
  updateStatus(
    @Param('orderId') orderId: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.logisticsService.updateOrderStatus(orderId, dto.status);
  }
}
