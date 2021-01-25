/* eslint-disable camelcase */
// Leave this to look into later!!

import { User } from 'discord.js';
import { QueryResult } from 'pg';
import {
  UserCurrencyDb,
  UserCurrency,
} from '../models/types';
import { poolDb } from './tables';

/* *********************************************************
 * *********** Parsing database data into types ************
 * ********************************************************* */

/**
 * Parse the data from database into the UserCurrency type
 * @param {UserCurrencyDb} data
 * @returns {UserCurrency}
 */
export function parseUserCurrency(data: UserCurrencyDb): UserCurrency {
  return {
    username: data.username,
    uid: data.uid,
    guild_id: data.guild_id,
    balance: data.balance,
  };
}

// /* *********************************************************
//  * ******************* INSERT queries **********************
//  * ********************************************************* */

/**
 * Inserts a user into the database to begin their balance
 * @param {User} user The User Insance (msg.author)
 * @param {string} guild_id The guild's ID for the user
 * @returns {Promise<boolean | undefined>}
 */
export async function addUserBalance(
  user: User,
  guild_id: string,
): Promise<boolean | undefined> {
  const data = await poolDb.query('SELECT * FROM booster_balance.user_currency WHERE uid = $1', [user.id]);

  if (data.rowCount === 0) {
    poolDb.query(
      'INSERT INTO booster_balance.user_currency('
            + 'username, uid, guild_id, balance)'
            + 'VALUES ($1, $2, $3, 0)',
      [user.tag, user.id, guild_id],
    );
    return true;
  }
  return undefined;
}

/* *********************************************************
 * ******************* UPDATE queries **********************
 * ********************************************************* */

/**
 * Adds balance onto a user's balance
 * @param {UserCurrency} user the User within the database
 * @returns {Promise<QueryResult<UserCurrencyDb>>}
 */
export async function updateUserBalance(
  user: UserCurrency,
):
  Promise<QueryResult<UserCurrencyDb>> {
  return poolDb.query(
    'UPDATE booster_balance.user_currency SET '
      + 'balance = $1, '
      + 'username = $2'
      + 'WHERE '
      + 'uid = $3 '
      + 'AND guild_id = $4',
    [user.balance, user.username, user.uid, user.guild_id],
  );
}
// /* *********************************************************
//  * ******************* GET queries **********************
//  * ********************************************************* */

/**
 * Get all the members in a server from the database and parse them to the defined
 * type. If no users are found, return undefined
 * @param {string} guildID The Guild's ID
 * @returns {Promise<UserCurrency[] | undefined>}
 */
export async function getUserBalance(guildID: string):
  Promise<UserCurrency[] | undefined> {
  const members = await poolDb
    .query('SELECT * FROM booster_balance.user_currency WHERE guild_id = $1', [guildID]);
  const membersParsed = new Array<UserCurrency>(0);

  if (members !== undefined) {
    members.rows.forEach((row: UserCurrencyDb) => {
      membersParsed.push(parseUserCurrency(row));
    });
    return membersParsed;
  }

  return undefined;
}

/**
 * Delete the user from the database of the shop
 * @param {string} uid the Users's ID
 * @returns {Promise<void>}
 */
export async function deleteUserfromDb(uid: string): Promise<void> {
  poolDb.query(
    'DELETE FROM booster_balance.user_currency WHERE uid = $1', [uid],
  );
}

/**
 * Gets the index of a user in an array
 * @param {string} uid the Users's ID
 * @param {string} guildID The Guild's ID

 * @returns {Promise<void>}
 */
export async function indexUserfromDb(guildID: string): Promise<any> {
  return poolDb.query(
    'SELECT'
    + ' balance,'
    + ' ROW_NUMBER () OVER'
    + ' (ORDER BY booster_balance.user_currency.balance)'
    + ' FROM booster_balance.user_currency'
    + ' WHERE guild_id = $1',
    [guildID],
  );
}
