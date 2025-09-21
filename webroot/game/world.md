# Wasteland Investigator: Game Design Document

## Characters

* Player (The Technopath)
* Elder Joric
* Anya
* Silas
* Lena
* Transport Boss
* Cog Enforcer
* The Techno-Prophet
* Techno-Prophet's Guard #1
* Techno-Prophet's Guard #2
* Wasteland Stalker - Hostile
* Wasteland Scrabbler - Docile

## Game Items

### Core Items (directly required for quests)

* Pulsing Beacon
* Fusion Regulator
* Coordinates
* Nanite Stabilizer
* Master Override Keycard
* Forged Transit Pass
* Damaged Schematics
* Scrap Parts
* Makeshift Stabilizer
* Supplicant's Pass

### Additional Items

* **Pre-Plague Datapad:** (Bonus Item) Contains corrupted data from before the fall. While mostly filled with mundane logs, it could be traded to a tech-hoarder like Silas for a minor reward or a piece of extra information.
* **Geiger Counter:** (Bonus Item) A functioning device that clicks in the presence of radiation. Allows the player to navigate a high-radiation zone that may contain a shortcut or a hidden item stash.
* **High-Quality Water Filter:** (Bonus Item) Not as rare as a legendary artifact, but still highly valuable. Could serve as an alternative item to trade with the **Transport Boss** for the **Forged Transit Pass**.
* **Anya's Wrench:** (Bonus Item) A personalized, high-torque wrench that **Anya** lost on a salvage run. Finding and returning it to her could result in a reward, like a free weapon upgrade or a schematic.
* **EMP Grenade:** (Combat Item) A single-use throwable that emits a powerful electromagnetic pulse, temporarily disabling robotic enemies. An **EMP Grenade** might be found in The Cathedral.
* **Combat Stim:** (Combat Item) A disposable auto-injector that provides a significant, temporary boost to the player's `combat` stat for one encounter.
* **Scavenged Ballistic Weave:** (Combat Item) A piece of pre-plague body armor. Equipping it permanently increases the player's `armour` stat.
* **Corroded Dog Tags:** (Flavor Item) Belonged to a long-dead soldier. Looks important and feels personal, but has no mechanical function.
* **"Glimmer" Bottlecap:** (Flavor Item) A rare, shiny bottlecap from a popular pre-plague soda. A red herring that is ultimately just junk.
* **Faded Photograph:** (Flavor Item) A cracked photo of an unknown family from before the plague. Purely for world-building and atmosphere.

## Summaries and Connections

Here is how the characters and items link together within the game's logic.

### Character Summaries

* **Elder Joric:** The leader of the Oasis settlement. His kidnapping is the game's catalyst. He is the objective to be rescued from **The Techno-Prophet**.
* **Anya:** The mechanic for Oasis and the first step in the quest.
  * She needs a **Fusion Regulator** to repair vital equipment.
  * In exchange, she provides the **Coordinates** to Silas's location.
  * Alternatively, she can take **Damaged Schematics** and **Scrap Parts** to create a **Makeshift Stabilizer**.
* **Silas:** A reclusive tech-expert essential for deciphering the main clue.
  * He can decrypt the **Pulsing Beacon**.
  * He demands a **Nanite Stabilizer** (or a **Makeshift Stabilizer**) in payment for his help.
  * He provides the player with crucial information about **Lena** and the **Master Override Keycard**.
* **Lena:** A defector from The Cog hiding in Barter-town.
  * She holds the **Master Override Keycard**, which is necessary to safely enter the final area.
  * She will trade the keycard for a **Forged Transit Pass** to secure her escape.
* **Transport Boss:** A shady contact in Barter-town.
  * They are the source for the **Forged Transit Pass**.
  * They will only trade it for a rare or valuable item.
* **Cog Enforcer:** An antagonist NPC who represents a betrayal path.
  * If the player tells them Lena's location, the enforcer provides a **Supplicant's Pass** in return.
* **The Techno-Prophet:** The primary antagonist and leader of The Cog. He does not trade, and the game culminates in a confrontation with him.

### Game Item Summaries

* **Pulsing Beacon:** The initial clue found at the scene of Joric's kidnapping. It is given to **Silas** to be analyzed.
* **Fusion Regulator:** A key mechanical part. It is given to **Anya** to progress the main quest.
* **Coordinates:** An information item received from **Anya** that reveals **Silas's** location on the map.
* **Nanite Stabilizer:** A rare medical item given to **Silas** to secure his full cooperation, leading to the best possible information from him.
* **Master Override Keycard:** The main "key" item, received from **Lena**. It is used by the player to bypass the fortress defenses in the final stage.
* **Forged Transit Pass:** The item **Lena** desires. It is acquired from the **Transport Boss** and given to Lena.
* **Damaged Schematics & Scrap Parts:** An alternate item path. Given to **Anya** to craft the **Makeshift Stabilizer**.
* **Makeshift Stabilizer:** A lower-quality version of the Nanite Stabilizer, crafted by **Anya**. It is given to **Silas** and results in incomplete information.
* **Supplicant's Pass:** A trap item received from the **Cog Enforcer** if the player betrays **Lena**. It leads to a bad ending.

## Game Settings & Locations

### 1. Oasis Settlement

* **Stage:** The beginning of the game.
* **Description (JPG Idea):** A small, self-sufficient settlement built into the shell of a pre-plague desert observatory. Dwellings are made from scrap metal and canvas. In the center, a large, jury-rigged water purifier hums quietly, the heart of the community.
* **Sub-Locations:**
  * **Elder Joric's Quarters:** A small room showing signs of a struggle. This is where the quest begins.
    * **People:** None.
    * **Items:** The **Pulsing Beacon** can be found here.
  * **Anya's Workshop:** A cluttered but organized space filled with tools, spare parts, and a massive, dismantled pump.
    * **People:** Anya.
    * **Items:** **Scrap Parts** can be found on a workbench.

### 2. Ruined Highway Med-Bay

* **Stage:** Middle of the game; the "Golden Path" to helping Silas.
* **Description (JPG Idea):** An overturned ambulance half-buried in the sand beside a crumbling concrete overpass. The back doors are pried open, revealing a ransacked interior with rusted, empty medical cabinets.
* **People:** None (potentially hostile wasteland creatures).
* **Items:** The **Nanite Stabilizer** can be salvaged from a sealed first-aid kit inside.

### 3. Silas's Hermitage

* **Stage:** Middle of the game; after getting coordinates from Anya.
* **Description (JPG Idea):** The entrance to a cave in a rocky canyon, fortified with a patchwork of scrap metal, satellite dishes, and warning signs. Wires and antennas snake from the door up the canyon walls.
* **People:** Silas.
* **Items:** None. Silas is too paranoid to leave anything lying around for the taking.

### 4. Barter-town

* **Stage:** Middle of the game; after learning about Lena from Silas.
* **Description (JPG Idea):** A bustling, dusty marketplace sprawling in the shadow of a ruined skyscraper. A chaotic collection of tents, stalls, and scavenged vehicles serves as the hub for wasteland trade.
* **People:**
  * **Lena:** Can be found keeping a low profile at a quiet cantina stall.
  * **Transport Boss:** Runs a large, makeshift garage and shipping service.
  * **Cog Enforcer:** Can be seen patrolling the market, looking for the defector.
* **Items:** No key items are free, as everything here has a price.

### 5. The Cathedral (Cog Fortress)

* **Stage:** The end of the game.
* **Description (JPG Idea):** A massive, pre-plague geothermal power station, its giant, skeletal cooling towers dominating the horizon. The entrance is a heavily fortified blast door monitored by automated turrets.
* **Sub-Locations:**
  * **Fortress Exterior:** The entrance patrolled by turrets.
  * **Central AI Chamber:** The final room. Pristine, white, and filled with humming server racks. In the center is a massive AI core with a chair wired into it, where Elder Joric is being held.
    * **People:** The Techno-Prophet and his guards.
    * **Items:** An **EMP Grenade** might be found in a weapons locker, offering a non-lethal way to end the final confrontation.
