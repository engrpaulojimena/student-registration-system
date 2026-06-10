import { Pool } from "pg";

export const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "student_registration_db",
  password: "1",
  port: 5432,
});