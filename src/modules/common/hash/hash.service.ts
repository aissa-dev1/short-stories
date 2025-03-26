import { Inject, Injectable } from '@nestjs/common';

import { HashStrategy } from './hash.types';

@Injectable()
export class HashService {
  constructor(
    @Inject('HashStrategy') private readonly strategy: HashStrategy,
  ) {}

  hash(data: string): Promise<string> {
    return this.strategy.hash(data);
  }

  compare(data: string, encrypted: string): Promise<boolean> {
    return this.strategy.compare(data, encrypted);
  }
}
