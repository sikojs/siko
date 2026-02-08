/**
 * Tests for config loader
 */

import * as fs from 'fs';
import * as path from 'path';
import { loadConfig, validateConfig } from '../../src/config/loader';
import { SikoConfig } from '../../src/config/types';

describe('Config Loader', () => {
  const testConfigPath = path.join(__dirname, 'test-config.json');

  afterEach(() => {
    // Clean up test config files
    if (fs.existsSync(testConfigPath)) {
      fs.unlinkSync(testConfigPath);
    }
  });

  test('should load default config when no file exists', () => {
    const config = loadConfig();

    expect(config.include).toContain('src');
    expect(config.exclude).toContain('node_modules');
    expect(config.extensions).toContain('.js');
  });

  test('should load JSON config file', () => {
    const testConfig: Partial<SikoConfig> = {
      include: ['custom-src'],
      thresholds: {
        coverage: 90,
      },
    };

    fs.writeFileSync(testConfigPath, JSON.stringify(testConfig));

    const config = loadConfig(testConfigPath);

    expect(config.include).toEqual(['custom-src']);
    expect(config.thresholds?.coverage).toBe(90);
  });

  test('should merge custom config with defaults', () => {
    const testConfig: Partial<SikoConfig> = {
      include: ['custom-src'],
    };

    fs.writeFileSync(testConfigPath, JSON.stringify(testConfig));

    const config = loadConfig(testConfigPath);

    // Custom value
    expect(config.include).toEqual(['custom-src']);
    // Default values still present
    expect(config.exclude).toContain('node_modules');
    expect(config.extensions).toContain('.js');
  });

  test('should validate coverage threshold range', () => {
    const invalidConfig: SikoConfig = {
      thresholds: {
        coverage: 150, // Invalid: > 100
      },
    } as SikoConfig;

    expect(() => validateConfig(invalidConfig)).toThrow(
      'Coverage threshold must be between 0 and 100'
    );
  });

  test('should validate maxUnused is non-negative', () => {
    const invalidConfig: SikoConfig = {
      thresholds: {
        maxUnused: -5, // Invalid: negative
      },
    } as SikoConfig;

    expect(() => validateConfig(invalidConfig)).toThrow('maxUnused threshold must be >= 0');
  });
});
