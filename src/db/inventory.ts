/* eslint-disable camelcase */
// Leave this to look into later!!

import { User } from 'discord.js';
import { QueryResult } from 'pg';
import {
  UserInvetoryDb,
  UserInvetory,
} from '../models/types';
import { poolDb } from './tables';

/* *********************************************************
 * *********** Parsing database data into types ************
 * ********************************************************* */

/**
 * Parse the data from database into the UserInvetory type
 * @param {UserInvetoryDb} data
 * @returns {UserInvetory}
 */
export function parseUserInvetory(data: UserInvetoryDb): UserInvetory {
  return {
    username: data.username,
    uid: data.uid,
    guild_id: data.guild_id,
    item_list: data.item_list,
  };
}

// /* *********************************************************
//  * ******************* INSERT queries **********************
//  * ********************************************************* */

/**
 * Inserts a user into the database to begin their inventory
 * @param {User} user The User Insance (msg.author)
 * @param {string} guild_id The guild's ID for the server
 * @returns {Promise<boolean | undefined>}
 */
export async function addUserInvetory(
  user: User,
  guild_id: string,
): Promise<boolean | undefined> {
  const data = await poolDb.query('SELECT * FROM booster_balance.user_inventory WHERE uid = $1', [user.id]);

  if (data.rowCount === 0) {
    poolDb.query(
      'INSERT INTO booster_balance.user_inventory('
            + 'username, uid, guild_id, item_list)'
            + 'VALUES ($1, $2, $3, $4)',
      [user.tag, user.id, guild_id, []],
    );
    return true;
  }
  return undefined;
}

/* *********************************************************
 * ******************* UPDATE queries **********************
 * ********************************************************* */

/**
 * Updates an item in the server shop
 * @param {UserInvetory} user the user within the database
 * @returns {Promise<QueryResult<UserInvetoryDb>>}
 */
export async function updateUserInvetory(
  user: UserInvetory,
):
  Promise<QueryResult<UserInvetoryDb>> {
  return poolDb.query(
    'UPDATE booster_balance.user_inventory SET '
      + 'username = $1, '
      + 'item_list =  $2'
      + 'WHERE '
      + 'uid = $3 '
      + 'AND guild_id = $4',
    [user.username, user.item_list, user.uid, user.guild_id],
  );
}
// /* *********************************************************
//  * ******************* GET queries **********************
//  * ********************************************************* */

/**
 * Get all the members in a server from the database and parse them to the defined
 * type. If no users are found, return undefined
 * @param {string} guildID The Guild's ID
 * @returns {Promise<UserInvetory[] | undefined>}
 */
export async function getUserInvetory(guildID: string):
  Promise<UserInvetory[] | undefined> {
  const items = await poolDb
    .query('SELECT * FROM booster_balance.user_inventory WHERE guild_id = $1', [guildID]);
  const itemsParsed = new Array<UserInvetory>(0);

  if (items !== undefined) {
    items.rows.forEach((row: UserInvetoryDb) => {
      itemsParsed.push(parseUserInvetory(row));
    });
    return itemsParsed;
  }

  return undefined;
}

/**
 * Delete the user from the database of the shop
 * @param {string} item_name
 * @returns {Promise<void>}
 */
export async function deleteItemFromInventory(item_name: string): Promise<void> {
  poolDb.query(
    'DELETE FROM booster_balance.user_inventory WHERE item_list[$1]', [item_name],
  );
}
