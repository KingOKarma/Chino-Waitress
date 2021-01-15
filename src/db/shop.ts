/* eslint-disable camelcase */
// Leave this to look into later!!

import { User } from 'discord.js';
import { QueryResult } from 'pg';
import {
  ServerShopDb,
  ServerShop,
} from '../models/types';
import { poolDb } from './tables';

/* *********************************************************
 * *********** Parsing database data into types ************
 * ********************************************************* */

/**
 * Parse the data from database into the ServerShop type
 * @param {ServerShopDb} data
 * @returns {ServerShop}
 */
export function parseServerShop(data: ServerShopDb): ServerShop {
  return {
    uid: data.uid,
    guild_id: data.guild_id,
    item_name: data.item_name,
    item_desc: data.item_desc,
    price: data.price,
  };
}

// /* *********************************************************
//  * ******************* INSERT queries **********************
//  * ********************************************************* */

/**
 * Inserts an item into the database to create new item in a shop
 * @param {User} user The User Insance (msg.author)
 * @param {string} guild_id The guild's ID for the user
 * @param {string} item_name The name of the item being added
 * @param {string} item_desc The desc of the item being added
 * @param {number} price the price of the item being added
 * @returns {Promise<boolean | undefined>}
 */
export async function addServerShopItem(
  user: User,
  guild_id: string,
  item_name: string,
  item_desc: string,
  price: number,
): Promise<boolean> {
  poolDb.query(
    'INSERT INTO booster_balance.shop('
            + 'uid, guild_Id, item_name, item_desc, price)'
            + 'VALUES ($1, $2, $3, $4, $5)',
    [user.id, guild_id, item_name, item_desc, price],
  );
  return true;
}

/* *********************************************************
 * ******************* UPDATE queries **********************
 * ********************************************************* */

/**
 * Updates an item in the server shop
 * @param {ServerShop} item the item within the database
 * @returns {Promise<QueryResult<ServerShopDb>>}
 */
export async function updateServerShop(
  item: ServerShop,
):
  Promise<QueryResult<ServerShopDb>> {
  return poolDb.query(
    'UPDATE booster_balance.shop SET '
      + 'item_name = $1, '
      + 'item_desc = $2'
      + 'price = $3'
      + 'WHERE '
      + 'uid = $3 '
      + 'AND guild_id = $4',
    [item.item_name, item.item_desc, item.price, item.uid, item.guild_id],
  );
}
// /* *********************************************************
//  * ******************* GET queries **********************
//  * ********************************************************* */

/**
 * Get all the items in a server shop from the database and parse them to the defined
 * type. If no users are found, return undefined
 * @param {string} guildID The Guild's ID
 * @returns {Promise<ServerShop[] | undefined>}
 */
export async function getServerShop(guildID: string):
  Promise<ServerShop[] | undefined> {
  const items = await poolDb
    .query('SELECT * FROM booster_balance.shop WHERE guild_id = $1', [guildID]);
  const itemsParsed = new Array<ServerShop>(0);

  if (items !== undefined) {
    items.rows.forEach((row: ServerShopDb) => {
      itemsParsed.push(parseServerShop(row));
    });
    return itemsParsed;
  }

  return undefined;
}

/**
 * Delete the given item from the database of the shop
 * @param {string} item_name
 * @returns {Promise<void>}
 */
export async function deleteItemFromShop(item_name: string): Promise<void> {
  poolDb.query(
    'DELETE FROM booster_balance.shop WHERE item_name = $1', [item_name],
  );
}
