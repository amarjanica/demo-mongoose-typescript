import mongoose, { Types, Schema, Model } from 'mongoose';

export enum LocationType {
  COUNTRY = 'country',
  CITY = 'city',
  DISTRICT = 'district',
  UNKNOWN = 'unknown',
}

export interface ILocation {
  _id: Types.ObjectId;
  name: string;
  location_type: LocationType;
  geometry: { type: string; coordinates: number[] };
  parent?: ILocation;
}

export interface ILocationMethods {
  descendants(): Promise<ILocation & { level: number }[]>;

  parents(): Promise<ILocation & { level: number }[]>;
}

export interface ILocationModel extends Model<ILocation, {}, ILocationMethods> {
  /**
   * @param lat decimal latitude
   * @param lng decimal longitude
   * @param distance distance in kilometers
   */
  nearby(lat: number, lng: number, distance: number): Promise<ILocation & { distance: number }[]>;
}

const LocationSchema = new Schema<ILocation, ILocationModel, ILocationMethods>({
  name: { type: String, required: true },
  location_type: { type: String, enum: LocationType, default: LocationType.UNKNOWN },
  geometry: {
    type: {
      type: String,
      enum: ['Point'],
      required: [true, 'Geometry is required!'],
    },
    coordinates: {
      type: [Number],
      index: '2dsphere',
      validate: {
        validator: ([longitude, latitude]: number[]) => {
          if (isNaN(longitude) || isNaN(latitude)) {
            return false;
          }
          return longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90;
        },
        message: 'Coordinates should be in format [longitude, latitude]',
      },
    },
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
  },
});

LocationSchema.method('descendants', function () {
  return mongoose.model('Location').aggregate([
    {
      $match: {
        _id: this._id,
      },
    },
    {
      $graphLookup: {
        from: 'locations',
        startWith: '$_id',
        connectFromField: '_id',
        connectToField: 'parent',
        as: 'descendants',
        depthField: 'level',
      },
    },
    { $unwind: '$descendants' },
    { $replaceRoot: { newRoot: '$descendants' } },
  ]);
});

LocationSchema.method('parents', function () {
  return mongoose.model('Location').aggregate([
    {
      $match: {
        _id: this._id,
      },
    },
    {
      $graphLookup: {
        from: 'locations',
        startWith: '$parent',
        connectFromField: 'parent',
        connectToField: '_id',
        as: 'parents',
        depthField: 'level',
        maxDepth: 3,
      },
    },
    { $unwind: '$parents' },
    { $replaceRoot: { newRoot: '$parents' } },
  ]);
});

LocationSchema.static('nearby', (lat: number, lng: number, distance: number) => {
  return mongoose.model('Location').aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng, lat] },
        distanceField: 'distance',
        minDistance: 0,
        maxDistance: distance * 1000,
        includeLocs: 'geometry',
        spherical: true,
      },
    },
  ]);
});

export default (mongoose.models.Location as unknown as ILocationModel) ||
  mongoose.model<ILocation, ILocationModel>('Location', LocationSchema);
