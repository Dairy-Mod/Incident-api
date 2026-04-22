import { IncidentType } from '../enums/incident-type.enum';

export interface Incident {
  title: string;
  lat: number;
  lon: number;
  description: string;
  type: IncidentType;
}
