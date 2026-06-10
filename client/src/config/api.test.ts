import { describe, expect, it } from 'vitest';
import { BASE_URL, getApiUrl } from './api';

describe('api config', () => {
  it('upgrades non-local API URLs to HTTPS when the page is HTTPS', () => {
    expect(getApiUrl('http://bakery-api.example.com/api', 'https:')).toBe('https://bakery-api.example.com/api');
  });

  it('keeps localhost and 127.0.0.1 URLs on HTTP for local development', () => {
    expect(getApiUrl('http://localhost:3000/api', 'https:')).toBe('http://localhost:3000/api');
    expect(getApiUrl('http://127.0.0.1:3000/api', 'https:')).toBe('http://127.0.0.1:3000/api');
  });

  it('keeps HTTP URLs unchanged when the page is not HTTPS', () => {
    expect(getApiUrl('http://bakery-api.example.com/api', 'http:')).toBe('http://bakery-api.example.com/api');
  });

  it('derives the base URL by removing the trailing API segment', () => {
    expect(BASE_URL.endsWith('/api')).toBe(false);
  });
});
