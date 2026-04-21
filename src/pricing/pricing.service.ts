import { Injectable } from '@nestjs/common';

export interface PriceBreakdown {
  basePrice: number;
  markupAmount: number;
  platformCut: number;
  finalPrice: number;
  vendorEarnings: number;
}

@Injectable()
export class PricingService {
  /**
   * Calculates final price including affiliate markup and platform cut.
   * @param basePrice - vendor's base price
   * @param markupPercent - affiliate markup percentage (default 0)
   * @param platformCutPercent - platform fee percentage (default from env or 10)
   */
  calculate(
    basePrice: number,
    markupPercent: number = 0,
    platformCutPercent: number = Number(process.env.PLATFORM_CUT_PERCENT || 10),
  ): PriceBreakdown {
    const markupAmount = basePrice * (markupPercent / 100);
    const priceAfterMarkup = basePrice + markupAmount;
    const platformCut = priceAfterMarkup * (platformCutPercent / 100);
    const finalPrice = priceAfterMarkup;
    const vendorEarnings = finalPrice - platformCut;

    return {
      basePrice,
      markupAmount,
      platformCut,
      finalPrice,
      vendorEarnings,
    };
  }

  calculateFromStrings(
    basePrice: string,
    markupPercent: string = '0',
    platformCutPercent: string = process.env.PLATFORM_CUT_PERCENT || '10',
  ): PriceBreakdown {
    return this.calculate(
      parseFloat(basePrice),
      parseFloat(markupPercent),
      parseFloat(platformCutPercent),
    );
  }
}
