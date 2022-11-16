import mongoose, {Model, Schema, Types} from "mongoose";

export enum LocationType {
  COUNTRY = 'country',
  CITY = 'city',
  DISTRICT = 'district',
  UNKNOWN = 'unknown'
}

export interface ILocation {
  _id: Types.ObjectId;
  name: string;
  location_type: LocationType;
  geometry: { type: string; coordinates: number[] };
  parent?: ILocation
}

const LocationSchema = new Schema<ILocation>({
  name: { type: String, required: true},
  location_type: { type: String, enum: LocationType, default: LocationType.UNKNOWN},
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
        message: 'Coordinates should be in format [longitude, latitude]'
      }
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location'
    }
  }
});

export default (mongoose.models.Location as unknown as Model<ILocation> || mongoose.model<ILocation>('Location', LocationSchema))
