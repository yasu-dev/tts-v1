/**
 * @jest-environment node
 */
import { describe, expect, test } from '@jest/globals';
import { formatTagNumberForDisplay } from '../tag-display';

describe('formatTagNumberForDisplay', () => {
  test('V1: existing tag number format is returned unchanged', () => {
    expect(formatTagNumberForDisplay('T-2025-001')).toBe('T-2025-001');
  });

  test('V2: 96bit UID (24 chars) is shortened to ellipsis + last 8 chars', () => {
    expect(formatTagNumberForDisplay('E2806894000050250A9F0080')).toBe('…0A9F0080');
  });

  test('V3a: boundary at 14 chars stays unchanged', () => {
    expect(formatTagNumberForDisplay('AAAAAAAAAAAAAA')).toBe('AAAAAAAAAAAAAA');
  });

  test('V3b: boundary at 15 chars is shortened', () => {
    expect(formatTagNumberForDisplay('AAAAAAAAAAAAAAA')).toBe('…AAAAAAAA');
  });

  test('V4a: empty string returns empty string', () => {
    expect(formatTagNumberForDisplay('')).toBe('');
  });

  test('V4b: null returns empty string', () => {
    expect(formatTagNumberForDisplay(null)).toBe('');
  });

  test('V4c: undefined returns empty string', () => {
    expect(formatTagNumberForDisplay(undefined)).toBe('');
  });

  test('V4d: 128bit UID (32 chars) is shortened to ellipsis + last 8 chars', () => {
    expect(formatTagNumberForDisplay('00112233445566778899AABBCCDDEEFF11223344')).toBe('…11223344');
  });
});
