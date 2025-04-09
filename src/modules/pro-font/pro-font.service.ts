import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class ProFontService {
  readFonts(): Record<string, string[] | Record<string, string>> {
    try {
      const data = JSON.parse(
        readFileSync(join(__dirname, 'pro-font-data.json'), 'utf-8'),
      );
      return data;
    } catch (error) {
      console.error('An error occurred while trying to read fonts', error);
      return {};
    }
  }
}
