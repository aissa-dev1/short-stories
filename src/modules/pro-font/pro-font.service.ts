import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class ProFontService {
  readFontsSrc(): string[] {
    try {
      const data = JSON.parse(
        readFileSync(join(__dirname, 'pro-font-src-data.json'), 'utf-8'),
      );
      return data;
    } catch (error) {
      console.error('An error occurred while trying to read fonts src', error);
      return [];
    }
  }

  readFonts(path: string): Record<string, Record<string, string>> {
    try {
      const data = JSON.parse(readFileSync(join(__dirname, path), 'utf-8'));
      return data;
    } catch (error) {
      console.error('An error occurred while trying to read fonts', error);
      return {};
    }
  }
}
