import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailOptions } from 'src/core/models/email-options.model';
import { Incident } from 'src/core/models/incident.model';
import { EmailService } from 'src/email/email.service';
import { generateIncidentEmailTemplate } from 'src/templates/incident.template';
import { IncidentEntity } from './entities/incident.entity';
import { logger } from '../config/logger';
import { RedisCacheService } from 'src/cache/redis-cache.service';

const INCIDENTS_CACHE_KEY = 'incidents:all';
const INCIDENTS_CACHE_TTL_SECONDS = 60;

@Injectable()
export class IncidentsService {
  constructor(
    @InjectRepository(IncidentEntity)
    private readonly incidentRepository: Repository<IncidentEntity>,
    private readonly emailService: EmailService,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  async findAll(): Promise<IncidentEntity[]> {
    try {
      const cachedIncidents =
        await this.redisCacheService.get(INCIDENTS_CACHE_KEY);
      if (cachedIncidents) {
        logger.info(
          '[IncidentsService] findAll - incidents returned from Redis cache',
        );
        return JSON.parse(cachedIncidents) as IncidentEntity[];
      }
    } catch (error) {
      logger.warn(
        `[IncidentsService] findAll - Redis read failed: ${String(error)}`,
      );
    }

    const incidents = await this.incidentRepository.find();

    try {
      await this.redisCacheService.set(
        INCIDENTS_CACHE_KEY,
        JSON.stringify(incidents),
        INCIDENTS_CACHE_TTL_SECONDS,
      );
    } catch (error) {
      logger.warn(
        `[IncidentsService] findAll - Redis write failed: ${String(error)}`,
      );
    }

    return incidents;
  }

  async createIncident(incident: Incident): Promise<boolean> {
    // 1. Save the new incident
    await this.incidentRepository
      .createQueryBuilder()
      .insert()
      .into(IncidentEntity)
      .values({
        title: incident.title,
        description: incident.description,
        type: incident.type as unknown as string,
        lat: incident.lat,
        lon: incident.lon,
        location: () =>
          `ST_SetSRID(ST_MakePoint(${incident.lon}, ${incident.lat}), 4326)::geography`,
      })
      .execute();

    // 2. ST_DWithin Query implementation provided by the professor:
    const radius = 500; // Search within 500 meters
    const nearbyIncidents = await this.incidentRepository
      .createQueryBuilder('incident')
      .where(
        `ST_DWithin(
          incident.location::geography,
          ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography,
          :radius
        )`,
      )
      .setParameters({ lon: incident.lon, lat: incident.lat, radius })
      .getMany();

    logger.info(`Found ${nearbyIncidents.length} incidents nearby.`);

    try {
      await this.redisCacheService.del(INCIDENTS_CACHE_KEY);
    } catch (error) {
      logger.warn(
        `[IncidentsService] createIncident - Redis cache invalidation failed: ${String(error)}`,
      );
    }

    // 3. Email sending logic
    const template = generateIncidentEmailTemplate(incident);
    const options: EmailOptions = {
      to: 'albertoamyn14@gmail.com',
      subject: incident.title,
      htmlBody: template,
    };
    const result = await this.emailService.sendEmail(options);
    return result;
  }
}
