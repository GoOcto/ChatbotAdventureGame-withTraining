# Game Rules

## The Game Setting (the 'World')

The world will have a list of characters.

[
    "sammy": { ... non-player character object ... },
    "eilene": { ... non-player character object ... },
    ...
]

The world will also have a list of game_items found within the world, for example:

[ "battery", "gemstone", "handgun", "screwdriver", "amulet_of_grum", etc.]

## The Player Character

The player has a set of stats which will be used for combat and other game encounters.

{
    "health": 100,
    "combat":  25,
    "armour":  15,
    "inventory": [ "ration_pack", "utility_knife" ]
}

The player's inventory is a list of game_items.

## The Cast

The non-player characters (NPCs) are instrumental in solving the main quest or goal of the game.

## Interactions

The key game mechanic is how the interactions with a single NPC works.

For each encounter there is an 'offerings' object on the page. The player can drag items from their backpack and drop them into this offerings section. Or if there are objects within the offerings, the player can drag it to their backpack to keep it.

Then, with the next prompt, the AI chatbot can decide to take some of the items or leave them. The chatbot can also choose to add new items to the offerings from their own inventory.

In this manner, the player collects game_items from the AI NPCs and uses them towards achieving a goal.
