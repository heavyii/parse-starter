import { Test, TestingModule } from '@nestjs/testing';
import { ParseServerService } from './parse-server.service';

describe('ParseServerService', () => {
  let service: ParseServerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParseServerService],
    }).compile();

    service = module.get<ParseServerService>(ParseServerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
