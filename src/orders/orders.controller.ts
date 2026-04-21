import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(user.id, dto);
  }

  @Get()
  @Roles('ADMIN')
  findAll() {
    return this.ordersService.findAll();
  }

  @Get('my')
  findMine(@CurrentUser() user: any) {
    return this.ordersService.findByBuyer(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'VENDOR')
  update(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.ordersService.update(id, dto);
  }

  @Post(':id/assign/:vendorId')
  @Roles('ADMIN')
  assignVendor(@Param('id') id: string, @Param('vendorId') vendorId: string) {
    return this.ordersService.assignVendor(id, vendorId);
  }

  @Post(':id/fulfill')
  @Roles('ADMIN', 'VENDOR')
  fulfill(@Param('id') id: string) {
    return this.ordersService.fulfillOrder(id);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.ordersService.cancelOrder(id);
  }
}
