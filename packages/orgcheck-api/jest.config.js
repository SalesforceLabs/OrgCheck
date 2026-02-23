const config = {
  preset: 'ts-jest',
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    '^.+\\.(js|jsx)$':  'babel-jest',
  },
  moduleNameMapper: {
    "^dist/(.*)$": "<rootDir>/dist/$1",
    "^tests/(.*)$": "<rootDir>/tests/$1",
    "^src/(.*)$": "<rootDir>/src/$1"
  }
};

export default config;