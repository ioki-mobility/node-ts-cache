import type { Config } from "@jest/types"

const config: Config.InitialOptions = {
    verbose: true,
    preset: "ts-jest",
    testEnvironment: "node",
    ci: true,
    moduleNameMapper: {
        'node-ts-cache': '<rootDir>/packages/core/src'
    },
    collectCoverageFrom: [
        "<rootDir>/packages/*/src/**/*.ts"
    ]
}

export default config
