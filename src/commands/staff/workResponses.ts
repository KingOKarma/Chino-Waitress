import * as commando from 'discord.js-commando';
import { CONFIG, rolePerms } from '../../globals';
import {
  addList,
  listList,
  removeList,
} from '../../utils/lists';

export default class boosterListCommand extends commando.Command {
  constructor(client: commando.CommandoClient) {
    super(client, {
      name: 'workstring',
      aliases: ['workstrings', 'ws'],
      group: 'staff',
      memberName: 'workstring',
      description: 'Lets you decide to add, remove, or list the Work responses roles',
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
          key: 'string',
          prompt: 'I need a string to add to or number to remove from (max length 100 characters)',
          type: 'string',
          default: '',
          validate: (text: string) => text.length < 201,
        },
      ],
    });
  }

  public async run(
    msg: commando.CommandoMessage,
    { choice, string }: { choice: string, string: string },
  ): Promise<any> {
    switch (choice.toLowerCase()) {
      case 'add':
        return addList(msg, string, CONFIG.workResponses, []);

      case 'remove':
        return removeList(msg, string, CONFIG.workResponses);

      case 'list':
        return listList(msg, CONFIG.workResponses, 'Work Responses');

      default:
        return msg.reply('Please give a choice `add <string>`, `remove <number>`, `list`');
    }
  }
}
