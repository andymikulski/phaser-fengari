
export enum CardEvents {
  CardDrawn = 'card:drawn',
  CardPlayed = 'card:played',
  CardDiscarded = 'card:discarded',
  CardRemovedFromPlay = 'card:removed_from_play',

  PlayerPlayedResource = 'player:resource:drawn',
  PlayerPlayedCard = 'player:card:played',

  TurnStart = 'turn:started',

  ResourceSpent = 'resource:spent',
}
