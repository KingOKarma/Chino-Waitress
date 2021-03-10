import * as commando from 'discord.js-commando';
import {
  addRole,
  listRoles,
  removeRole,
} from '../../bot/utils/roles';
import { CONFIG, rolePerms } from '../../bot/globals';

export default class boosterListCommand extends commando.Command {
  constructor(client: commando.CommandoClient) {
    super(client, {
      name: 'boosters',
      aliases: ['booster', 'b'],
      group: 'staff',
      memberName: 'boosters',
      description: 'Lets you decide to add, remove, or list the boosters roles',
      clientPermissions: rolePerms,
      userPermissions: rolePerms,
      throttling: {
        usages: 3,
        duration: 5,
      },
      guildOnly: true,
      args: [
        {
          key: 'choice',
          prompt: 'Add, Remove or List',
          type: 'string',
          oneOf: ['add', 'remove', 'list'],
          default: '',
        },
        {
          key: 'roleID',
          prompt: 'I need a role to add/remove to/from',
          type: 'string',
          default: '',
        },
      ],
    });
  }

  public async run(
    msg: commando.CommandoMessage,
    { choice, roleID }: { choice: string, roleID: string },
  ): Promise<any> {
    switch (choice.toLowerCase()) {
      case 'add':
        return addRole(msg, roleID, CONFIG.allowedRoles, CONFIG.colourRoles);

      case 'remove':
        return removeRole(msg, roleID, CONFIG.allowedRoles, CONFIG.colourRoles);

      case 'list':
        return listRoles(msg, CONFIG.allowedRoles, 'Booster Roles');

      default:
        return msg.reply('Please give a choice\n`add <role>`, `remove <role>`, `list`');
    }
  }
}
