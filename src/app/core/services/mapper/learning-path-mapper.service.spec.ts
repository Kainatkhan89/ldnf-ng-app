import { TestBed } from '@angular/core/testing';

import { LearningPathMapperService } from './learning-path-mapper.service';

describe('LearningPathMapperService', () => {
  let service: LearningPathMapperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LearningPathMapperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
