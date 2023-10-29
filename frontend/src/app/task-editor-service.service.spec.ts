import { TestBed } from '@angular/core/testing';

import { TaskEditorServiceService } from './task-editor-service.service';

describe('TaskEditorServiceService', () => {
  let service: TaskEditorServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskEditorServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
