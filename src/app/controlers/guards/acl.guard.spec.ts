import { TestBed } from '@angular/core/testing';

import { AclGuard } from './acl.guard';

describe('AclGuard', () => {
  let guard: AclGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AclGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
