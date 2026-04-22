import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('incidents')
export class IncidentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  type: string;

  @Column('float')
  lat: number;

  @Column('float')
  lon: number;

  // PostGIS location point
  @Index({ spatial: true })
  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location: string;
}
