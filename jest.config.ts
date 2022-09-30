import type { Config } from "@jest/types"

const config: Config.InitialOptions = {
    verbose: true,
    preset: "ts-jest",
    testEnvironment: "node",
    ci: true,
    moduleNameMapper: {
        '@boredland/node-ts-cache': '<rootDir>/packages/core/src'
    },
    collectCoverageFrom: [
        "**/*.ts"
    ]
}

export default config
