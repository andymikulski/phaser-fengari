// import Phaser from 'phaser';
// import { CardEvents } from '../CardEvents';
// import { actionCardLua, resourceCardLua } from '../resourceCardLua';
// import { Card } from './Card';
// import { Deck } from './Deck';
// import { IGameAPI } from './IGameAPI';
// const cardTypes = {
//   'resource': resourceCardLua,
//   'action': actionCardLua,
// };

// class Game implements IGameAPI {
//   drawPile: Deck = new Deck();
//   hand: Deck = new Deck();
//   cardsInPlay: Deck = new Deck();

//   addToPlaySpace(card: Card): void {
//     this.cardsInPlay.add(card);
//   }

//   removeFromHand(card: Card): void {
//     this.hand.removeCard(card);
//   }

//   discard(card: Card): void {
//     this.hand.discard(card);
//   }

//   spendPlayerResources(amount: number): void {
//     let found: Card[] = [];
//     let foundCount = 0;
//     this.cardsInPlay.cards.forEach((card) => {
//       if (foundCount >= amount) {
//         return;
//       }
//       if (card.getName() === "Resource") {
//         foundCount += 1;
//         found.push(card);
//       }
//     });

//     found.forEach(card => {
//       this.cardsInPlay.removeCard(card);
//       card.triggerEvent(CardEvents.ResourceSpent);
//     });
//   }

//   getNumResources(): number {
//     return this.cardsInPlay.countType('Resource');
//   }

//   public setup = () => {
//     for (let i = 0; i < 5; i++) {
//       this.drawCard();
//     }
//   }

//   public drawCard = () => {
//     var c = new Card(this, Math.random() > 0.5 ? cardTypes.resource : cardTypes.action);
//     this.hand.add(c);
//     c.triggerEvent(CardEvents.CardDrawn);
//   }

//   public stepTurn = () => {
//     this.hand.dispatchEvent(CardEvents.TurnStart);
//     this.cardsInPlay.dispatchEvent(CardEvents.TurnStart);
//   }

//   public playCard = (card: Card) => {
//     if (!card.checkCanBePlayed()) {
//       return;
//     }
//     this.hand.removeCard(card);
//     card.triggerEvent(CardEvents.CardPlayed);
//   }

//   public discardAtRandom = () => {
//     this.hand.discardRandom();
//   }



//   /// for TESTING


//   public fakeTurn = () => {
//     console.log('NEW TURN');
//     let actionCount = 1;

//     while (actionCount > 0) {
//       actionCount -= 1;

//       if (this.hand.getNumCards() > 0) {
//         let card = this.hand.getFirstType("Resource") ?? this.hand.getRandomCard();
//         if (!card.checkCanBePlayed()) {
//           this.drawCard();
//         } else {
//           this.playCard(card);
//         }
//       } else {
//         this.drawCard();
//       }
//     }

//     while (this.hand.getNumCards() > 5) {
//       this.discardAtRandom();
//     }

//     this.stepTurn();
//   };

// }


