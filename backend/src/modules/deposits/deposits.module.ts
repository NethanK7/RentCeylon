import { Module } from '@nestjs/common';
import { DepositsService } from './deposits.service';

@Module({
  providers: [DepositsService],
  exports: [DepositsService],
})
export class DepositsModule {}
