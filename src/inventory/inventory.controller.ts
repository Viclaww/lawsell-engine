import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UpdateInventoryDto, ReserveStockDto } from './dto/update-inventory.dto';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get('variant/:variantId')
  getInventory(@Param('variantId') variantId: string) {
    return this.inventoryService.getInventory(variantId);
  }

  @Patch('variant/:variantId')
  @Roles('VENDOR', 'ADMIN')
  updateStock(
    @Param('variantId') variantId: string,
    @Body() dto: UpdateInventoryDto,
  ) {
    return this.inventoryService.updateStock(variantId, dto);
  }

  @Post('variant/:variantId/reserve')
  reserveStock(
    @Param('variantId') variantId: string,
    @Body() dto: ReserveStockDto,
  ) {
    return this.inventoryService.reserveStock(variantId, dto);
  }

  @Post('variant/:variantId/release')
  @Roles('ADMIN', 'VENDOR')
  releaseStock(
    @Param('variantId') variantId: string,
    @Body() dto: ReserveStockDto,
  ) {
    return this.inventoryService.releaseStock(variantId, dto.quantity);
  }
}
