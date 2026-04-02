const { envSchema } = require('../envValidator');

/**
 * Minimal valid environment for tests.
 * Only includes required fields so individual tests can override selectively.
 */
const VALID_ENV = {
  DB_HOST: 'localhost',
  DB_NAME: 'checked_out',
  DB_USER: 'root',
  JWT_SECRET: 'test-secret-key',
};

describe('envValidator', () => {
  describe('envSchema', () => {
    it('should pass with all required variables', () => {
      const { error } = envSchema.validate(VALID_ENV, {
        allowUnknown: true,
        abortEarly: false,
      });

      expect(error).toBeUndefined();
    });

    it('should apply default values', () => {
      const { error, value } = envSchema.validate(VALID_ENV, {
        allowUnknown: true,
        abortEarly: false,
      });

      expect(error).toBeUndefined();
      expect(value.NODE_ENV).toBe('development');
      expect(value.PORT).toBe(3000);
      expect(value.DB_PORT).toBe(3306);
      expect(value.DB_PASSWORD).toBe('');
      expect(value.JWT_EXPIRES_IN).toBe('7d');
    });

    it('should fail when DB_HOST is missing', () => {
      const env = { ...VALID_ENV };
      delete env.DB_HOST;

      const { error } = envSchema.validate(env, {
        allowUnknown: true,
        abortEarly: false,
      });

      expect(error).toBeDefined();
      expect(error.details.some((d) => d.path.includes('DB_HOST'))).toBe(true);
    });

    it('should fail when DB_NAME is missing', () => {
      const env = { ...VALID_ENV };
      delete env.DB_NAME;

      const { error } = envSchema.validate(env, {
        allowUnknown: true,
        abortEarly: false,
      });

      expect(error).toBeDefined();
      expect(error.details.some((d) => d.path.includes('DB_NAME'))).toBe(true);
    });

    it('should fail when DB_USER is missing', () => {
      const env = { ...VALID_ENV };
      delete env.DB_USER;

      const { error } = envSchema.validate(env, {
        allowUnknown: true,
        abortEarly: false,
      });

      expect(error).toBeDefined();
      expect(error.details.some((d) => d.path.includes('DB_USER'))).toBe(true);
    });

    it('should fail when JWT_SECRET is missing', () => {
      const env = { ...VALID_ENV };
      delete env.JWT_SECRET;

      const { error } = envSchema.validate(env, {
        allowUnknown: true,
        abortEarly: false,
      });

      expect(error).toBeDefined();
      expect(error.details.some((d) => d.path.includes('JWT_SECRET'))).toBe(true);
    });

    it('should report multiple errors at once', () => {
      const { error } = envSchema.validate({}, { allowUnknown: true, abortEarly: false });

      expect(error).toBeDefined();
      expect(error.details.length).toBeGreaterThanOrEqual(4);
    });

    it('should reject invalid NODE_ENV', () => {
      const env = { ...VALID_ENV, NODE_ENV: 'staging' };

      const { error } = envSchema.validate(env, {
        allowUnknown: true,
        abortEarly: false,
      });

      expect(error).toBeDefined();
      expect(error.details.some((d) => d.path.includes('NODE_ENV'))).toBe(true);
    });

    it('should allow empty DB_PASSWORD', () => {
      const env = { ...VALID_ENV, DB_PASSWORD: '' };

      const { error } = envSchema.validate(env, {
        allowUnknown: true,
        abortEarly: false,
      });

      expect(error).toBeUndefined();
    });

    it('should allow unknown environment variables', () => {
      const env = { ...VALID_ENV, SOME_RANDOM_VAR: 'value' };

      const { error } = envSchema.validate(env, {
        allowUnknown: true,
        abortEarly: false,
      });

      expect(error).toBeUndefined();
    });

    it('should reject invalid PORT value', () => {
      const env = { ...VALID_ENV, PORT: '99999' };

      const { error } = envSchema.validate(env, {
        allowUnknown: true,
        abortEarly: false,
      });

      expect(error).toBeDefined();
      expect(error.details.some((d) => d.path.includes('PORT'))).toBe(true);
    });

    it('should reject invalid LOG_LEVEL', () => {
      const env = { ...VALID_ENV, LOG_LEVEL: 'trace' };

      const { error } = envSchema.validate(env, {
        allowUnknown: true,
        abortEarly: false,
      });

      expect(error).toBeDefined();
      expect(error.details.some((d) => d.path.includes('LOG_LEVEL'))).toBe(true);
    });

    it.each(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'])(
      'should accept LOG_LEVEL=%s',
      (level) => {
        const env = { ...VALID_ENV, LOG_LEVEL: level };
        const { error } = envSchema.validate(env, {
          allowUnknown: true,
          abortEarly: false,
        });

        expect(error).toBeUndefined();
      }
    );
  });
});
