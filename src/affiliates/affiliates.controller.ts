import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AffiliatesService } from './affiliates.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateAffiliateProductDto } from './dto/create-affiliate-product.dto';
import { CreateAffiliateDto } from './dto/create-affiliate.dto';

@Controller('affiliates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AffiliatesController {
  constructor(private affiliatesService: AffiliatesService) {}

  @Post()
  @Roles('ADMIN', 'AFFILIATE')
  create(@Body() dto: CreateAffiliateDto) {
    return this.affiliatesService.createAffiliate(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.affiliatesService.findAffiliate(id);
  }

  @Post('products')
  @Roles('AFFILIATE', 'ADMIN')
  addProduct(@Body() dto: CreateAffiliateProductDto) {
    return this.affiliatesService.addProduct(dto);
  }

  @Get(':affiliateId/products')
  findProducts(@Param('affiliateId') affiliateId: string) {
    return this.affiliatesService.findProductsByAffiliate(affiliateId);
  }
}
