import { Controller, Get } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  async getAllPayments() {
    return await this.paymentService.findAll();
  }

  @Get('recent')
async getRecentPayments() {
  return await this.paymentService.getLastPayments(10);
}
}
