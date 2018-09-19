import { SelectableGridModule } from './selectable-grid.module';

describe('SelectableGridModule', () => {
  let selectableGridModule: SelectableGridModule;

  beforeEach(() => {
    selectableGridModule = new SelectableGridModule();
  });

  it('should create an instance', () => {
    expect(selectableGridModule).toBeTruthy();
  });
});
