import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: ['src/middleware/**/*.ts'],
  moduleNameMapper: {
    '^../config/env$': '<rootDir>/src/__tests__/__mocks__/env.mock.ts',
    '^../config/database$': '<rootDir>/src/__tests__/__mocks__/database.mock.ts',
  },
};

export default config;
