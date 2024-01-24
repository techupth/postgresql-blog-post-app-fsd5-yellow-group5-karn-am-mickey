// Creating PostgreSQL Client here
import * as pg from "pg";
const { Pool } = pg.default;

const pool = new Pool({
  connectionString: "postgresql://postgres:14012544@127.0.0.1:5432/posts",
});

export { pool };
