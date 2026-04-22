import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';
import { EmailModule } from 'src/email/email.module';
import { IncidentEntity } from './entities/incident.entity';
import { RedisCacheModule } from 'src/cache/redis-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IncidentEntity]),
    EmailModule,
    RedisCacheModule,
  ],
  controllers: [IncidentsController],
  providers: [IncidentsService],
})
export class IncidentsModule {}
