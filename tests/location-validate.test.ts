import Location from '@models/location';

describe('Location Validation', ()=> {
  it('is invalid if properties are not defined',  () => {
    const location = new Location({});

    const error = location.validateSync({});

    expect(error?.message).toContain('Location validation failed: geometry.type: Geometry is required!')
  })

  it('is invalid if null coordinates', ()=> {
    const location = new Location({
      name: 'name',
      parent: undefined,
      geometry: {
        type: 'Point',
        coordinates: null,
      },
    });

    const error = location.validateSync();

    expect(error?.message).toContain('Coordinates should be in format [longitude, latitude]');
  });

  it('is invalid if invalid coordinates', async () => {
    const location = new Location({
      name: 'name',
      parent: undefined,
      geometry: {
        type: 'Point',
        coordinates: [-90, -180],
      },
    });

    const error = location.validateSync();

    expect(error?.message).toContain('Coordinates should be in format [longitude, latitude]');
  });

  it('is a valid location', async () => {
    const location = new Location({
      name: 'name',
      parent: undefined,
      geometry: {
        type: 'Point',
        coordinates: [0, 0],
      },
    });

    const error = location.validateSync();
    expect(error).toBeUndefined();
  });
});
