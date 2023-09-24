import LuaVM from '../LuaVM';
import { luaPubSub } from '../luaPubSub';
import { seedMathRandom } from '../seedMathRandom';
import { IGameAPI } from './IGameAPI';

export class Card {
  public readonly id = Math.random().toString(32).slice(2);

  private behavior: LuaVM;

  constructor(private game: IGameAPI, private lua: string = '') {
    this.behavior = new LuaVM();

    const hooks: { [name: string]: (...args: any[]) => any; } = {
      'get_player_resources': () => game.getNumResources(),
      'discard': () => game.discard(this),
      'draw_card': () => game.drawCard(),
      'draw_resource_card': () => game.drawResourceCard(),
      'play_resource_card': () => game.drawAndPlayResourceCard(),
      'spend_player_resources': (num: number) => game.spendPlayerResources(num),
      'add_to_playspace': () => game.addToPlaySpace(this),
      'remove_from_playspace': () => game.removeFromPlaySpace(this),
      'remove_from_hand': () => game.removeFromHand(this),
      'print': (msg: string) => {
        console.log('[LUA] ' + msg);
      },
    };

    for (const name in hooks) {
      this.behavior.registerHook(name, hooks[name]);
    }

    this.seed();
  }
  private seed = () => {
    this.behavior.execute(seedMathRandom);
    this.behavior.execute(luaPubSub);
    this.behavior.execute(this.lua);
  };
  public triggerEvent = (eventName: string, ...args: any[]) => {
    this.behavior.execute(args?.length > 0 ? `dispatch("${eventName}", ${args.join(', ')})` : `dispatch("${eventName}")`);
  };

  public getName = (): string => {
    return this.behavior.callFunction('get_card_name');
  };

  public getDescription = (): string => {
    return this.behavior.callFunction('get_description');
  };

  public getLua = () => this.lua;

  public getCost = (): number => {
    return this.behavior.callFunction('get_resource_cost');
  };

  public checkCanBePlayed = (): boolean => {
    return this.behavior.callFunction('can_play_card');
  };
}
