import { CardEvents } from './CardEvents';
import { Card } from './scenes/Card';

export const resourceLua = `
function get_card_name()
  return "Resource"
end

function get_description()
  return "A resource card that can be spent."
end

function can_play_card()
  return true
end

function get_resource_cost()
  return 0
end

function on_card_played()
  remove_from_hand()
  add_to_playspace()
end

--
subscribe("${CardEvents.CardPlayed}", on_card_played)
`;


const genericActionLua = `
function get_card_name()
  return "Action"
end

function get_description()
  return "A generic action card that can do something."
end

function get_resource_cost()
  return 1
end

function can_play_card()
  return get_player_resources() >= get_resource_cost()
end

function on_card_played()
  print("An action card was PLAYED!")
  spend_player_resources(get_resource_cost())
  remove_from_hand()
  add_to_playspace()
end

--
subscribe("${CardEvents.CardPlayed}", on_card_played)
`;



const waitForItLua = `
local turns_remaining = 3

function get_card_name()
  return "Wait For It"
end

function get_description()
  return "Must be held for " .. turns_remaining .. " turns before playing. When played, gain 2 resources. If discarded, lose 2 resources."
end

function get_resource_cost()
  return 0
end


function can_play_card()
  return turns_remaining <= 0
end

function on_card_played()
  draw_resource_card()
  draw_resource_card()
  remove_from_hand()
end

function on_card_discarded()
  spend_player_resources(2)
end

function on_turn_start()
  turns_remaining = turns_remaining - 1
end
--
subscribe("${CardEvents.CardPlayed}", on_card_played)
subscribe("${CardEvents.CardDiscarded}", on_card_discarded)
subscribe("${CardEvents.TurnStart}", on_turn_start)
`;




const drawBonusLua = `
function get_card_name()
  return "Draw Bonus Cards"
end

function get_description()
  return "Draw 1-3 more cards upon playing."
end

function get_resource_cost()
  return 1
end

function can_play_card()
  return get_player_resources() >= get_resource_cost()
end

function on_card_played()
  local random_number = math.random(1, 3)
  spend_player_resources(get_resource_cost())
  remove_from_hand()

  print("Action card is drawing " .. random_number .. " extra cards!")
  for i = 1, random_number do
    draw_card()
  end
end
--
subscribe("${CardEvents.CardPlayed}", on_card_played)
`;



const zombieLua = `

local age = 5
local hasPlayed = false

function get_card_name()
  return "Zombie"
end

function get_description()
  return [[A zombie! Bluh! I vant to suck your blud!

    Turns left: ]] .. age
end

function get_resource_cost()
  return 2
end

function can_play_card()
  return get_player_resources() >= get_resource_cost()
end


function on_card_played()
  hasPlayed = true
  spend_player_resources(get_resource_cost())
  remove_from_hand()
  add_to_playspace()
end

function on_turn_start()
    if hasPlayed then
      age = age - 1
      if age <= 0 then
        remove_from_playspace()
      end
    end
end
--
subscribe("${CardEvents.CardPlayed}", on_card_played)
subscribe("${CardEvents.TurnStart}", on_turn_start)

`;


const recycleLua = `
function get_card_name()
  return "Recycle"
end

function get_description()
  return "Gain three resources. If discarded, only gain one resource."
end

function get_resource_cost()
  return 0
end

function can_play_card()
  return true
end

function on_card_played()
  remove_from_hand()
  draw_resource_card()
  draw_resource_card()
  draw_resource_card()
end

function on_card_discarded()
  draw_resource_card()
end
--
subscribe("${CardEvents.CardPlayed}", on_card_played)
subscribe("${CardEvents.CardDiscarded}", on_card_discarded)
`;



const mercLua = `
local hasPlayed = false
local remainingTurns = 5

function get_card_name()
    return "Mercenary"
end

function get_description()
    return "While in play, gain 1 resource at the start of each turn. When removed from play, lose 1 resource. (" .. remainingTurns .. " turns remaining)"
end

function get_resource_cost()
    return 2
end

function can_play_card()
    return get_player_resources() >= get_resource_cost()
end

function on_card_played()
    hasPlayed = true
    spend_player_resources(get_resource_cost())
    remove_from_hand()
    add_to_playspace()
end

function on_turn_start()
    if hasPlayed then
        remainingTurns = remainingTurns - 1

        if remainingTurns <= 0 then
          remove_from_playspace()
        else
          play_resource_card()
        end
    end
end

function on_card_removed_from_play()
    if hasPlayed then
        spend_player_resources(1)
    end
end

--
subscribe("${CardEvents.CardPlayed}", on_card_played)
subscribe("${CardEvents.CardRemovedFromPlay}", on_card_removed_from_play)
subscribe("${CardEvents.TurnStart}", on_turn_start)
`


const alchemistLua = `
local transformation_count = 0
local transform_limit = 3

function get_card_name()
    return "Alchemist"
end

function get_description()
    return "Transmute resources into cards each turn. If more than four resources are in play, then one resource is transmuted into a new card. " ..
           transformation_count .. " / " .. transform_limit .. " resources transmuted so far."
end

function get_resource_cost()
    return 3
end

function can_play_card()
    return get_player_resources() >= get_resource_cost()
end

local hasPlayed = false
function on_card_played()
    hasPlayed = true
    spend_player_resources(get_resource_cost())
    remove_from_hand()
    add_to_playspace()
end

function on_turn_start()
    if not hasPlayed then
      return
    end

    if get_player_resources() > 3 then
        spend_player_resources(1)
        draw_card()
        transformation_count = transformation_count + 1

        if transformation_count >= transform_limit then
          remove_from_playspace()
        end
    end
end

function on_card_removed_from_play()
    print("The Alchemist has left the playspace. Transmuted " .. transformation_count .. " resources during its stay.")
end

--
subscribe("${CardEvents.CardPlayed}", on_card_played)
subscribe("${CardEvents.CardRemovedFromPlay}", on_card_removed_from_play)
subscribe("${CardEvents.TurnStart}", on_turn_start)
`

const fateLua = `
local bonus_chance = 1 -- 100% initial chance to get a bonus

function get_card_name()
    return "Fate Weaver"
end

function get_description()
    return "Tweak the threads of fate! When played, you have a " .. (bonus_chance * 100) .. "% chance to draw 3 extra cards. Every subsequent turn, the chance reduces by half until the card is removed from play."
end

function get_resource_cost()
    return 3
end

function can_play_card()
    return get_player_resources() >= get_resource_cost()
end

function on_card_played()
    spend_player_resources(get_resource_cost())
    remove_from_hand()

    if math.random() <= bonus_chance then
        print("Luck favors you! Drawing 3 extra cards.")
        for i = 1, 3 do
            draw_card()
        end
    else
        print("Luck is elusive this time.")
    end
end

function on_turn_start()
    bonus_chance = bonus_chance / 2
    if bonus_chance < 0.01 then -- a threshold to prevent the chance from being too small and virtually zero
        bonus_chance = 0
        print("The threads of fate have unwound. The Fate Weaver's power has waned.")
        remove_from_hand()
    end
end

--
subscribe("${CardEvents.CardPlayed}", on_card_played)
subscribe("${CardEvents.TurnStart}", on_turn_start)
`

const listOfCardBehaviors = [resourceLua, fateLua, drawBonusLua, zombieLua, recycleLua, waitForItLua, mercLua, alchemistLua];
export default listOfCardBehaviors;