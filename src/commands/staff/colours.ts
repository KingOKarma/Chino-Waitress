import * as commando from 'discord.js-commando';
import {
  addRole,
  listRoles,
  removeRole,
} from '../../utils/roles';
import { CONFIG, rolePerms } from '../../globals';

export default class colourListCommand extends commando.Command {
  constructor(client: commando.CommandoClient) {
    super(client, {
      name: 'colours',
      aliases: ['colors', 'color', 'colours', 'c'],
      group: 'staff',
      memberName: 'colours',
      description: 'Lets you decide to add, remove, or list the boosters colours roles',
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
        return addRole(msg, roleID, CONFIG.colourRoles, CONFIG.allowedRoles);

      case 'remove':
        return removeRole(msg, roleID, CONFIG.colourRoles, CONFIG.allowedRoles);

      case 'list':
        return listRoles(msg, CONFIG.colourRoles, 'Booster Colour Roles');

      default:
        return msg.reply('Please give a choice\n`add <role>`, `remove <role>`, `list`');
    }
  }
}
