import { Pool } from "pg"

let globalPool: Pool | null = null

export default function getPool(): Pool {
  if (!globalPool) {
    globalPool = new Pool({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })
  }
  return globalPool
}
