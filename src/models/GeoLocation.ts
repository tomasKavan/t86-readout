import { Column, Double } from "typeorm";

export class GeoLocation {
  @Column('double')
  public lat: Double

  @Column('double')
  public lon: Double
}