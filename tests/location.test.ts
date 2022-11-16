import {clear, connect, close} from './db-connect';
import populate from './populate';
import Location from '@models/location';

describe('Locations model', () => {
  it('should return descendants for a location', async () => {
    const loc = await Location.findOne({name: 'Croatia'});
    if (loc == null) {
      throw new Error('location undefined!');
    }

    const descendants = await loc.descendants();

    expect(descendants.length).toBeGreaterThan(0);
  });

  it('should not return descendants for a bottom level location', async () => {
    const loc = await Location.findOne({ name: 'Gripe' });
    if (loc == null) {
      throw new Error('location undefined!');
    }

    const descendants = await loc.descendants();

    expect(descendants.length).toBe(0);
  });

  it('should return parents for a location', async () => {
    const loc = await Location.findOne({ name: 'Gripe' });
    if (loc == null) {
      throw new Error('location undefined!');
    }

    const parents = await loc.parents();

    expect(parents.length).toBeGreaterThan(0);
  });

  it('should not return parents for a top level location', async () => {
    const loc = await Location.findOne({ name: 'Croatia' });
    if (loc == null) {
      throw new Error('location undefined!');
    }

    const parents = await loc.parents();

    expect(parents.length).toBe(0);
  });

  it('should return all nearby locations', async () => {
    // I picked a point somewhere in city of Zagreb. result should return 3 nearby locations.
    const nearby = await Location.nearby(45.804816, 15.967296, 10);

    expect(nearby.length).toBe(3);
  });

  beforeAll(async () => {
    await connect();
    await populate();
  })

  afterAll(async () => {
    await clear();
    await close();
  })
})
