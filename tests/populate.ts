import Location, { ILocation, LocationType } from '@models/location';

export default async function run() {
  const croatia = await createLoc('Croatia', LocationType.COUNTRY, 45.815399, 15.966568);
  if (croatia) {
    const zagreb = await createLoc('Zagreb', LocationType.CITY, 45.815399, 15.966568, croatia);
    const split = await createLoc('Split', LocationType.CITY, 43.508133, 16.440193, croatia);
    const dubrovnik = await createLoc('Dubrovnik', LocationType.CITY, 42.640278, 18.108334, croatia);

    await createLoc('Črnomerec', LocationType.DISTRICT, 45.826181, 15.936315, zagreb);
    await createLoc('Gripe', LocationType.DISTRICT, 43.5054813, 16.450665, split);
    await createLoc('Lapad', LocationType.DISTRICT, 42.65283, 18.073833, dubrovnik);
  } else {
    console.error('Could not create a country');
    return;
  }

  async function createLoc(
    name: string,
    locationType: LocationType,
    latitude: number,
    longitude: number,
    parent?: ILocation
  ) {
    const loc = new Location({
      name,
      location_type: locationType,
      geometry: {
        type: 'Point',
        coordinates: [
          // Note that longitude comes first in a GeoJSON coordinate array, not latitude
          longitude,
          latitude,
        ],
      },
      parent: parent?._id,
    });

    return await loc.save();
  }
}
