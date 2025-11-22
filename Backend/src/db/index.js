import { drizzle } from 'drizzle-orm/libsql';///web'; // the "/web" is so it can be used on serverless (lambda)
import { createClient } from '@libsql/client';///web'; // the "/web" is so it can be used on serverless (lambda)
import * as schema from './schema.js';

import { config } from "dotenv";
config();

const isProdEnv = process.env.PROD?.toUpperCase() == "TRUE";
const client = isProdEnv ?
  createClient({
    url: process.env.TURSO_CONNECTION_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })
  :
  createClient({ 
    url: "file:local.db",
  });
const db = drizzle({ client, schema });

export default db;