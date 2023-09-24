import { CardEvents } from './CardEvents';

export const resourceCardLua = `
function get_card_name()
  return "Resource"
end

function get_description()
  return "A resource card that can be spent."
end

function can_play_card()
  return true
end

function on_turn_start()
end

function on_card_drawn()
  print("A resource card was DRAWN!")
end

function on_card_played()
  print("A resource card was PLAYED!")
  has_played = true
end
--
subscribe("${CardEvents.CardDrawn}", on_card_drawn)
subscribe("${CardEvents.CardPlayed}", on_card_played)
subscribe("${CardEvents.TurnStart}", on_turn_start)
`;


export const actionCardLua = `
function get_card_name()
  return "Action"
end

function get_description()
  return "An action card that can do something."
end

function can_play_card()
  return get_player_resources() >= 1
end

function on_turn_start()
end

function on_card_drawn()
  print("An action card was DRAWN!")
end

function on_card_played()
  print("An action card was PLAYED!")
  spend_player_resources(1)
end
--
subscribe("${CardEvents.CardDrawn}", on_card_drawn)
subscribe("${CardEvents.CardPlayed}", on_card_played)
subscribe("${CardEvents.TurnStart}", on_turn_start)
`;
