import { MultiLevelContexMenuModule } from './multi-level-contex-menu.module';

describe('MultiLevelContexMenuModule', () => {
  let multiLevelContexMenuModule: MultiLevelContexMenuModule;

  beforeEach(() => {
    multiLevelContexMenuModule = new MultiLevelContexMenuModule();
  });

  it('should create an instance', () => {
    expect(multiLevelContexMenuModule).toBeTruthy();
  });
});
