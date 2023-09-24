import { CardEvents } from '../CardEvents';
import { Card } from './Card';

export class Deck {
  cards: Card[] = [];

  getNumCards() {
    return this.cards.length;
  }

  getCards = (): Card[] => {
    return this.cards;
  };

  add(card: Card) {
    this.cards.push(card);
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  drawCard(): Card | null {
    if (this.cards.length === 0) return null;
    return this.cards.pop()!;
  }

  insertAtBottom(card: Card) {
    this.cards.unshift(card);
  }

  discard(card: Card) {
    this.removeCard(card);
    card.triggerEvent(CardEvents.CardDiscarded);
  }

  removeCard(card: Card) {
    this.cards = this.cards.filter(x => x !== card);
  }

  discardRandom() {
    const rand = this.getRandomCard();
    if (!rand) { return; }
    this.discard(rand);
  }

  getRandomCard(): Card | null {
    return this.cards[(this.cards.length * Math.random()) | 0] ?? null;
  }

  drawRandomCard(): Card | null {
    const rand = this.getRandomCard();
    if (rand) {
      this.cards = this.cards.filter(x => x !== rand);
    }
    return rand;
  }

  dispatchEvent(eventName: string, ...args: any[]) {
    this.cards.forEach(c => c.triggerEvent(eventName, ...args));
  }

  countType(type: string) {
    return this.cards.reduce((acc, curr) => {
      return acc + (curr.getName() == type ? 1 : 0);
    }, 0);
  }

  getFirstType(type: string): Card | null {
    return this.cards.find(x => x.getName() == type) ?? null;
  }

  getAllOfType(type: string): Card[] {
    return this.cards.filter(x => x.getName() == type);
  }
}
