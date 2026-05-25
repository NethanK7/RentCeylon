import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SlaProcessor, SlaService } from './sla.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'sla' }),
  ],
  providers: [SlaProcessor, SlaService],
  exports: [SlaService],
})
export class SlaModule {}
