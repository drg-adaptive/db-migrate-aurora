const tsconfig = require("./tsconfig.json");
const moduleNameMapper = require("tsconfig-paths-jest")(tsconfig);

require("dotenv").config();

module.exports = {
  runner: "jest-runner-tsc",
  displayName: "tsc",

  automock: false,

  clearMocks: true,

  // collect coverage messes up unit test debugging
  collectCoverage: false,

  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/index.ts",
    "!src/pdfKitEngine.ts",
    "src/**/*.js"
  ],

  coverageDirectory: "coverage",

  restoreMocks: true,

  // roots: ["src", "__tests__"],

  testEnvironment: "node",
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(js|ts)$",
  moduleFileExtensions: ["ts", "js", "json"],
  testPathIgnorePatterns: [
    "/node_modules",
    "__tests__/integrationTestHelper.ts"
  ],
  moduleNameMapper
};
