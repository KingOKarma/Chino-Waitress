// Leave this to look into later!!

// import { QueryResult } from 'pg';
// import {
//   UserCurrencyDb,
//   UserCurrency,
// } from '../models/types';
// import { poolDb } from './tables';

// /* *********************************************************
//  * *********** Parsing database data into types ************
//  * ********************************************************* */

// /**
//  * Parse the data from database into the UserCurrency type
//  * @param {UserCurrencyDb} data
//  * @returns {UserCurrency}
//  */
// export function parseUserCurrency(data: UserCurrencyDb): UserCurrency {
//   return {
//     uid: data.uid,
//     guildId: data.guild_id,
//     balance: data.balance,
//   };
// }

// /* *********************************************************
//  * ******************* SELECT queries **********************
//  * ********************************************************* */

// /**
//  * Function that gets the latest row count in the user muted database. This
//  * value is used for automatic nickname given by the bot when the username is
//  * inappropriate.
//  * @returns {Promise<number>}
//  */
// export async function getNextCurrencyDbRowID(): Promise<number> {
//   const rows = await poolDb.query('SELECT * FROM booster_balance.user_currency');

//   return rows.rowCount;
// }

// /* *********************************************************
//  * ******************* INSERT queries **********************
//  * ********************************************************* */

// /**
//  * Inserts the given inappropriate word into database as well as the indication
//  * if it is bannable or not.
//  * @param {string} word to be inserted
//  * @returns {Promise<void>}
//  */
// export async function insertInapproppriateWord(word: string): Promise<void> {
//   poolDb.query(
//     'INSERT INTO booster_balance.inappropriate_words('
//       + 'word)'
//       + 'VALUES ($1)',
//     [word],
//   );
// }

// /* *********************************************************
//  * ******************* UPDATE queries **********************
//  * ********************************************************* */

// /**
//  * Sets the active and kick timer fields of muted user to false
//  * @param {UserCurrency} user
//  * @returns {Promise<QueryResult<UserCurrencyDb>>}
//  */
// export async function updateMutedUserToInactive(user: UserCurrency):
//   Promise<QueryResult<UserCurrencyDb>> {
//   return poolDb.query(
//     'UPDATE username_check.muted_users SET '
//       + 'modified_at = now() '
//       + 'WHERE '
//       + 'uid = $1 '
//       + 'AND guild_id = $2'
//       + 'AND is_active = true',
//     [user.uid, user.guildId],
//   );
// }
