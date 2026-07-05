import { describe, expect, it } from 'vitest';
import { sayHiRequestSchema } from '../src/validation/sayHiSchema';

describe('sayHiRequestSchema', () => {
  it('accepts the API contract', () => {
    expect(
      sayHiRequestSchema.safeParse({
        turnstileToken: 'token',
        locale: 'sv',
        requestId: '6f1f7b90-1fc3-4bc5-8e52-ea642d3b9137',
      }).success,
    ).toBe(true);
  });

  it('rejects unsupported locales and non-uuid request ids', () => {
    expect(
      sayHiRequestSchema.safeParse({
        turnstileToken: 'token',
        locale: 'de',
        requestId: 'not-a-uuid',
      }).success,
    ).toBe(false);
  });
});
