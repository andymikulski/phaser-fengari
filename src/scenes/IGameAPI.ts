import { Card } from './Card';



export interface IGameAPI {
  getNumResources(): number;
  discard(card: Card): void;
  spendPlayerResources(amount: number): void;
  drawCard(): void;
  drawResourceCard(): void;
  drawAndPlayResourceCard(): void;
  addToPlaySpace(card: Card): void;
  removeFromPlaySpace(card: Card): void;
  removeFromHand(card: Card): void;
}
