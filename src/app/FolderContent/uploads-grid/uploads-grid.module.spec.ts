import { UploadsGridModule } from './uploads-grid.module';

describe('UploadsGridModule', () => {
  let uploadsGridModule: UploadsGridModule;

  beforeEach(() => {
    uploadsGridModule = new UploadsGridModule();
  });

  it('should create an instance', () => {
    expect(uploadsGridModule).toBeTruthy();
  });
});
