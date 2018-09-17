import { FolderContentModule } from './folder-content.module';

describe('FolderContentModule', () => {
  let folderContentModule: FolderContentModule;

  beforeEach(() => {
    folderContentModule = new FolderContentModule();
  });

  it('should create an instance', () => {
    expect(folderContentModule).toBeTruthy();
  });
});
