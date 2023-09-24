import { CardEvents } from './CardEvents';
import LuaVM from './LuaVM';
import { luaPubSub } from './luaPubSub';
import { actionCardLua, resourceCardLua } from './resourceCardLua';


class Card extends LuaVM {
  public readonly id = Math.random().toString(32).slice(2);

  constructor(private game: IGameAPI, private lua: string = '') {
    super();

    const hooks: { [name: string]: (...args: any[]) => any } = {
      'get_player_resources': () => game.getNumResources(),
      'discard': () => game.discard(this),
      'spend_player_resources': (num: number) => game.spendPlayerResources(num),
      'print': (msg: string) => {
        console.log('[LUA] ' + msg);
      },
    };

    for (const name in hooks) {
      this.registerHook(name, hooks[name]);
    }

    this.seed();
  }
  public getLua = () => {
    return this.lua;
  }
  private seed = () => {
    this.execute(luaPubSub);
    this.execute(this.getLua());
  }
  public triggerEvent = (eventName: string, ...args: any[]) => {
    this.execute(args?.length > 0 ? `dispatch("${eventName}", ${args.join(', ')})` : `dispatch("${eventName}")`);
  }

  public getName = (): string => {
    return this.callFunction('get_card_name');
  }

  public getDescription = (): string => {
    return this.callFunction('get_description');
  }

  public checkCanBePlayed = (): boolean => {
    return this.callFunction('can_play_card');
  }
}

const cardTypes = {
  'resource': resourceCardLua,
  'action': actionCardLua,
};


interface IGameAPI {
  getNumResources(): number;
  discard(card: Card): void;
  spendPlayerResources(amount: number): void;
}

class Game implements IGameAPI {
  private resourceCount = 0;
  private dom: HTMLElement;

  constructor() {
    this.dom = document.createElement('div');
    document.body.appendChild(this.dom);
  }

  discard(card: Card): void {
    this.cardsInHand = this.cardsInHand.filter(x => x !== card);
    this.cardsInPlay = this.cardsInPlay.filter(x => x !== card);
    this.render();
  }

  spendPlayerResources(amount: number): void {
    this.cardsInPlay = this.cardsInPlay.filter(x => {
      if (amount <= 0) {
        return true;
      }
      if (x.getName() == "Resource") {
        this.discard(x);
        amount -= 1;
        return false;
      }
    });

    this.resourceCount = this.cardsInPlay.reduce((acc, cur) => {
      return acc + (cur.getName() == "Resource" ? 1 : 0)
    }, 0);
  }

  getNumResources(): number {
    return this.resourceCount;
  }

  private cardsInHand: Card[] = [];
  private cardsInPlay: Card[] = [];

  public setup = () => {
    for (let i = 0; i < 5; i++) {
      this.drawCard();
    }

    this.render();

  }

  public drawCard = () => {
    var c = new Card(this, Math.random() > 0.5 ? cardTypes.resource : cardTypes.action);
    this.cardsInHand.push(c);
    c.triggerEvent(CardEvents.CardDrawn);

    this.resourceCount = this.cardsInPlay.reduce((acc, cur) => {
      return acc + (cur.getName() == "Resource" ? 1 : 0)
    }, 0);

    this.render();
  }

  public stepTurn = () => {
    this.cardsInHand.forEach(c => c.triggerEvent(CardEvents.TurnStart));
    this.cardsInPlay.forEach(c => c.triggerEvent(CardEvents.TurnStart));
    this.render();
  }

  public playCardAtIndex = (idx: number) => {
    const card = this.cardsInHand[idx];
    if (card === undefined) {
      return;
    }
    this.playCard(card);
  }

  public getRandomCardInHand = () => {
    return this.cardsInHand[(this.cardsInHand.length * Math.random()) | 0];
  }

  public getResourceCardInHand = () => {
    return this.cardsInHand.find(x => x.getName() == "Resource");
  }

  public getNumCardsInHand = () => {
    return this.cardsInHand.length;
  }

  public playCard = (card: Card) => {
    if (!card.checkCanBePlayed()) {
      return;
    }
    this.cardsInHand = this.cardsInHand.filter(x => x !== card);
    this.cardsInPlay.push(card);
    card.triggerEvent(CardEvents.CardPlayed);

    this.render();
  }


  public render = () => {
    const html = `
<div>
  Num cards in hand: ${this.cardsInHand.length} <br />
  Num cards in play: ${this.cardsInPlay.length} <br />
  Num resources in play: ${this.getNumResources()} <br />
</div>

Cards in play:
<div style="display: flex;">
${this.cardsInPlay.map(card => `
  <div style="padding: 1em; margin: 1em;" data-type="${card.getName()}">
    card: ${card.getName()}<br />
    ${card.getDescription()}
  </div>
`).join('\n')}
</div>


Cards in hand:
${this.cardsInHand.map(card => `
<div style="padding: 1em; margin: 1em;" data-type="${card.getName()}">
    card: ${card.getName()}<br />
    ${card.getDescription()}
</div>
`).join('\n')}

`;

    this.dom.innerHTML = html;

  }
}

var game = new Game();
game.setup();


const fakeTurn = () => {
  if (game.getNumCardsInHand() > 0) {
    let card = game.getResourceCardInHand() ?? game.getRandomCardInHand();
    if (!card.checkCanBePlayed()) {
      game.drawCard();
    } else {
      game.playCard(card);
    }
  } else {
    game.drawCard();
  }
  game.stepTurn();
};

fakeTurn();
setInterval(() => {
  fakeTurn();
}, 2500);



// cardsInHand[0].triggerEvent(CardEvents.CardPlayed);

// card.execute(`
//   outsideState = 0

//   function multiply(a, b)
//     outsideState = outsideState + 1;
//     return a * b
//   end
// `);

// card.triggerEvent('damage:given', 123);

// let result = card.callFunction('multiply', 6, 7);
// console.log(result, card.getGlobal('outsideState'));  // Outputs: 42


// card.dispose();

