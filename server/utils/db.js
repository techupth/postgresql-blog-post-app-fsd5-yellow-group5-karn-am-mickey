// Creating PostgreSQL Client here
import * as pg from "pg"
const { Pool } = pg.default;

const connectionPool = new Pool({
  connectionString:
    "postgresql://postgres:22586@localhost:5432/post"
})

export { connectionPool }