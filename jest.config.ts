import type { Config } from "@jest/types"

const config: Config.InitialOptions = {
    verbose: true,
    rootDir: process.cwd(),
    moduleFileExtensions: ['js', 'ts'],
    coveragePathIgnorePatterns: ["jest.config.ts", ".*(TestFactory.ts)$"],
    transform: {
        '.*\\.(ts?)$': [
            "@swc/jest",
            {
                "jsc": {
                    "parser": {
                        "decorators": true,
                        "syntax": "typescript",
                    },
                }
            }
        ]
    },
    ci: true,
    collectCoverageFrom: [
        "**/*.ts"
    ]
}

export default config
