import { Controller, Post, Body, Get } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import type { Incident } from 'src/core/models/incident.model';
import { logger } from '../config/logger';

@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Get()
  async findAll() {
    logger.info('[IncidentsController] findAll - Fetching incidents');
    return this.incidentsService.findAll();
  }

  @Post()
  async createIncident(@Body() incident: Incident) {
    logger.info(
      `[IncidentsController] createIncident - Received incident: ${incident.title}`,
    );

    const result = await this.incidentsService.createIncident(incident);

    logger.info(
      `[IncidentsController] createIncident - Successfully processed`,
    );
    return result;
  }
}
