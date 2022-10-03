import { PgStorage } from '.';
import { DataType, IBackup, newDb } from "pg-mem";
import { storageTestFactory } from "../../core/src/storage/storageTestFactory"
import { decoratorTestFactory } from "../../core/src/decorator/decoratorTestFactory"

describe("pg-storage", () => {
    const tableName = 'abc'
    let backup: IBackup;
    const db = newDb();
    const { Client: PGClient } = db.adapters.createPg();
    const pgClient = new PGClient()
    const storage = new PgStorage(tableName, async (query) => (await pgClient.query(query)).rows)

    beforeAll(async () => {
        db.public.declareTable({
            name: tableName,
            fields: [
                {
                    name: "key",
                    type: DataType.text
                },
                {
                    name: "value",
                    type: DataType.jsonb
                }
            ],
            constraints: [
                {
                    type: 'primary key',
                    constraintName: { name: 'primary-key-node-ts-cache' },
                    columns: [{ name: 'key' }]
                }
            ]
        })
        backup = db.backup();
    })


    beforeEach(() => {
        backup.restore();
    })

    storageTestFactory(storage)
    decoratorTestFactory(storage)
})
