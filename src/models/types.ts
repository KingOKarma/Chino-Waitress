/* eslint-disable camelcase */
/**
   * @type UserCurrency
   * @property {string} username User's Username
   * @property {string} uid User ID
   * @property {string} guildId Guild's ID
   * @property {number} balance User's Balance
   */
export type UserCurrency = {
   username: string
   uid: string,
   guild_id: string,
   balance: number,
 }

/**
  * @type UserCurrencyDb
   * @property {string} username User's Username
   * @property {string} uid User ID
   * @property {string} guild_id Guild's ID
   * @property {number} balance User's Balance
  */
export type UserCurrencyDb = {
   username: string
   uid: string,
   guild_id: string,
   balance: number,
 }

/**
   * @type ServerShop
   * @property {string} uid User ID of the user that put the item on the shop
   * @property {string} guildId Guild's ID
   * @property {string} item_name The Name of the item
   * @property {string} item_desc The description of the item
   * @property {number} price Item's Price

   */
export type ServerShop = {
  uid: string,
  guild_id: string,
  item_name: string,
  item_desc: string,
  price: number
}

/**
 * @type ServerShopDb
  * @property {string} uid User ID of the user that put the item on the shop
  * @property {string} guild_id Guild's ID
  * @property {string} item_name The Name of the item
  * @property {string} item_desc The description of the item
  * @property {number} price Item's Price

 */
export type ServerShopDb = {
  uid: string,
  guild_id: string,
  item_name: string,
  item_desc: string,
  price: number

}
/**
   * @type UserInvetory
   * @property {string} username User's Username
   * @property {string} uid User ID
   * @property {string} guild_id Guild's ID
   * @property {string[]} item_list The name of the item(s)
   */
export type UserInvetory = {
  username: string
  uid: string,
  guild_id: string,
  item_list: string[]
  }

/**
   * @type UserInvetoryDb
   * @property {string} username User's Username
   * @property {string} uid User ID
   * @property {string} guild_id Guild's ID
   * @property {string[]} item_list The name of the item(s)
   */
export type UserInvetoryDb = {
  username: string
  uid: string,
  guild_id: string,
  item_list: string[]
  }
