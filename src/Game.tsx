import { CardEvents } from './CardEvents';
import { Card } from './scenes/Card';
import { Deck } from './scenes/Deck';
import { IGameAPI } from './scenes/IGameAPI';
import cardBehaviors, { resourceLua } from './resourceCardLua';


export class Game implements IGameAPI {
  drawPile: Deck = new Deck();
  hand: Deck = new Deck();
  cardsInPlay: Deck = new Deck();
  public turnCount = 0;

  addToPlaySpace(card: Card): void {
    this.cardsInPlay.add(card);
  }

  drawResourceCard(): void {
    const behavior = resourceLua;
    const card = new Card(this, behavior);
    card.triggerEvent(CardEvents.CardDrawn);
    this.hand.add(card);
  }

  drawAndPlayResourceCard() {
    const behavior = resourceLua;
    const card = new Card(this, behavior);
    card.triggerEvent(CardEvents.CardDrawn);
    this.addToPlaySpace(card);
  }

  removeFromPlaySpace(card: Card): void {
    this.cardsInPlay.removeCard(card);
    card.triggerEvent(CardEvents.CardRemovedFromPlay);
  }

  removeFromHand(card: Card): void {
    this.hand.removeCard(card);
  }

  discard(card: Card): void {
    this.hand.discard(card);
  }

  spendPlayerResources(amount: number): void {
    let found: Card[] = [];
    let foundCount = 0;
    this.cardsInPlay.cards.forEach((card) => {
      if (foundCount >= amount) {
        return;
      }
      if (card.getName() === "Resource") {
        foundCount += 1;
        found.push(card);
      }
    });

    found.forEach(card => {
      this.cardsInPlay.removeCard(card);
      card.triggerEvent(CardEvents.ResourceSpent);
    });
  }

  getNumResources(): number {
    return this.cardsInPlay.countType('Resource');
  }

  public setup = () => {
    for (let i = 0; i < 5; i++) {
      this.drawCard();
    }
  };

  public drawCard = () => {
    const cardType = cardBehaviors[(cardBehaviors.length * Math.random()) | 0];
    var c = new Card(this, cardType);
    this.hand.add(c);
    c.triggerEvent(CardEvents.CardDrawn);
  };

  public stepTurn = () => {
    this.turnCount += 1;

    // while (this.hand.getNumCards() > 5) {
    //   this.discardAtRandom();
    // }

    this.hand.dispatchEvent(CardEvents.TurnStart);
    this.cardsInPlay.dispatchEvent(CardEvents.TurnStart);
  };

  public playCard = (card: Card) => {
    if (!card.checkCanBePlayed()) {
      return;
    }
    card.triggerEvent(CardEvents.CardPlayed);
  };

  public discardAtRandom = () => {
    this.hand.discardRandom();
  };

}
