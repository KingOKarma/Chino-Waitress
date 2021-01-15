import { Pool, PoolClient } from 'pg';
import * as globals from '../globals';

/**
 * Create a new pool for users db access.
 * Database information is given in the config file.
 * Export pool so it can be used in other files.
 */
export const poolDb = new Pool({
  host: globals.CONFIG.db_host,
  port: globals.CONFIG.db_port,
  user: globals.CONFIG.db_user,
  password: globals.CONFIG.db_pass,
  max: 20,
});

/**
 * Connect to the pool and create all the schemas and tables if needed
 */
poolDb.connect(async (err: Error, client: PoolClient) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  await client.query('CREATE SCHEMA IF NOT EXISTS booster_balance;');

  await client.query('CREATE TABLE IF NOT EXISTS booster_balance.user_currency ('
                  + 'username text, uid text, guild_id text,'
                  + 'balance integer);');

  await client.query('CREATE TABLE IF NOT EXISTS booster_balance.shop ('
                  + 'uid text, guild_id text, item_name text,'
                  + 'item_desc text, price integer);');

  await client.query('CREATE TABLE IF NOT EXISTS booster_balance.user_inventory ('
                  + 'username text, uid text, guild_id text,'
                  + 'item_list text[]);');

  return console.log('Connected to the DB');
});

poolDb.on('error', (err) => console.log(err));
