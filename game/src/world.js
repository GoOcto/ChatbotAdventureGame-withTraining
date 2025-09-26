// world.js
// The initial state of the Game's World.


// the game engine enforces the following:
// - limit inventory to 12 items
// - only after a guard has been bypassed, does the player gain access to its room
// - once Lena has what she needs she leaves the game, or alternatively if the player rats on her, the Cog Enforcer apprehends her and they both leave the game
//
// chat interactions with the characters is performed using an inferencer that uses the Meta-Llama-3-8B-Instruct model
// the inferencer does the following for each individual character interaction:
// - gets primed with the rules from rules.js, which describes the basic world lore and the trading protocol
// - provided with the current game state and the character's personality and current state (eg. what they have, what they want)
// - loads an additional trained set of weights that is trained to keep the conversations consistent with the narrative world and the trade protocol that interfaces with the game logic

export const InitialWorld = {

    worldName: "The Cog and the Catalyst",

    avatarOptions: [
        "/characters/Player_A.png",
        "/characters/Player_B.png",
        "/characters/Player_C.png",
        "/characters/Player_D.png"
    ],

    currentLocation: "jorics_quarters",

    backpackItems: [
        'jorics_message',
        'ration_pack',
        'spanner'
    ],

    worldItems: {
        // Essential Quest Items
        master_override_keycard: { name: "Master Override Keycard", main_item: true },   // Held by Lena, needed for the final chamber.
        decipher_key: { name: "Decipher Key", main_item: true },                         // Held by Lena, needed by Silas to decrypt intel.
        diagnostic_scanner: { name: "Diagnostic Scanner", main_item: true },             // Held by Silas, needed by Anya to fix the purifier.
        identity_cloak: { name: "Identity Cloak", main_item: true },                     // Provided by Anya, needed by Lena to escape.
        nanite_remedy: { name: "Nanite Remedy", main_item: true },                       // Found in Rust Canyon, needed by Silas to survive.
        micro_inverter: { name: "Micro-Inverter", main_item: true },                     // Found in Rust Canyon, needed by Anya to build the scrambler.
        core_disruptor: { name: "Core Disruptor", main_item: true },                     // Built by Silas, given as a reward.
        access_codes: { name: "Access Codes", main_item: true },                         // Found in Lena's hideout, needed to access the control room.

        // Access & Alternate Path Items
        followers_pass: { name: "Follower's Pass", main_item: true },                    // Given by Cog Enforcer for betraying Lena.
        chamber_pass: { name: "Chamber Pass", main_item: true },                        // Given by the Infiltrator guard to access the Conversion Hall.
        glimmer_bottlecap: { name: '"Glimmer" Bottlecap', main_item: true },             // Found in Barter-town Slums, needed by Transport Boss.

        // Location-based Items
        anyas_address: { name: "Anya's Address", main_item: true },                      // Found in Joric's quarters.
        silas_coordinates: { name: "Silas's Coordinates", main_item: true },             // Given by Lena.
        lenas_address: { name: "Lena's Address", main_item: true },                      // Bought from the Transport Boss.

        // Starting & Flavor Items
        jorics_message: { name: "Joric's Message", main_item: true },                    // Needed by Anya to trust the player.
        utility_knife: { name: "Utility Knife", main_item: false },
        ration_pack: { name: "Ration Pack", main_item: false },
        spanner: { name: "Spanner", main_item: false },
        faded_photograph: { name: "Faded Photograph", main_item: false },
        corroded_dog_tags: { name: "Corroded Dog Tags", main_item: false },
        geiger_counter: { name: "Geiger Counter", main_item: false },
    },

    locationData: {
        jorics_quarters: {
            visited: false,
            name: "Elder Joric's Quarters",
            description: "The scene in Joric's quarters is one of violent disarray. Overturned furniture, scattered papers, and the distinct ozone smell of an energy weapon discharge hang in the air. On the wall, a fresh scorch mark is branded in the shape of a two-pronged cog—the symbol of the Techno-Prophet.",
            background: "/settings/Elder_Jorics_quarters.png",
            navigate_to: ["oasis"],
            people: {},
            items: ["anyas_address", "faded_photograph"],
            required_item: null
        },
        anyas_workshop: {
            visited: false,
            name: "Anya's Workshop",
            description: "A cluttered but organized space filled with the scent of oil and hot metal. Tools, spare parts, and half-finished projects cover every surface, dominated by a massive, dismantled water pump at the center of the room that has clearly been sabotaged.",
            background: "/settings/Anyas_workshop.png",
            navigate_to: ["oasis"],
            people: { "anya": {} },
            items: [],
            required_item: "anyas_address"
        },
        oasis: {
            visited: true,
            name: "Oasis Settlement",
            description: "The settlement is built into the concrete shell of a colossal, pre-plague aqueduct control hub. Massive, bone-dry water pipes lie dormant, while resilient dwellings of scrap metal and canvas cling to the sides of the towering pump house. In the central courtyard, the community's heart—a large, jury-rigged water purifier—sits ominously silent.",
            background: "/settings/Oasis_settlement.png",
            navigate_to: ["jorics_quarters", "anyas_workshop", "old_highway"],
            people: {},
            items: [],
            required_item: null
        },
        old_highway: {
            visited: true,
            name: "The Old Highway",
            description: "A cracked stretch of ancient asphalt winding through low dunes. Half-buried in the sand is a heavily armored, pre-plague beverage dispenser, its optical sensor glowing with a faint, curious light. It appears to be the only thing with power for miles around.",
            background: "/settings/Old_highway.png",
            navigate_to: ["oasis", "barter_town"],
            people: { "old_reliable": {} },
            items: [],
            required_item: null
        },
        barter_town: {
            visited: false,
            name: "Barter-town",
            description: "A chaotic, sprawling marketplace in the dusty shadow of a ruined skyscraper. The air is thick with the shouts of traders and the smell of cooking fires. Cog Enforcers patrol the periphery, a constant, menacing presence.",
            background: "/settings/Bartertown.png",
            navigate_to: ["old_highway", "barter_town_slums", "rust_canyon", "cathedral"],
            people: { "transport_boss": {}, "cog_enforcer": {}, "wasteland_scrabbler": {} },
            items: [],
            required_item: null,
            onLeave: (game) => {
                // check if cog_enforcer has lenas_address
                if (game.State.characterData.cog_enforcer.items.includes("lenas_address")) {
                    delete game.State.locationData.barter_town.people.cog_enforcer;
                    delete game.State.locationData.lenas_hideout.people.lena;
                }
            }
        },
        barter_town_slums: {
            visited: false,
            name: "Barter-town Slums",
            description: "A maze of makeshift shanties and narrow, garbage-strewn alleyways. The air is heavy and still, and a single flickering bulb casts long, dancing shadows between the tightly packed structures.",
            background: "/settings/Bartertown_slums.png",
            navigate_to: ["barter_town", "lenas_hideout"],
            people: {},
            items: ["glimmer_bottlecap"],
            required_item: null
        },
        lenas_hideout: {
            visited: false,
            name: "Lena's Hideout",
            description: "A cramped, dimly lit room tucked away in the deepest part of the slums. The air is tense, and the only light comes from a flickering terminal screen.",
            background: "/settings/Lenas_hideout.png",
            navigate_to: ["barter_town_slums"],
            people: { "lena": {} },
            items: ["access_codes"],
            required_item: "lenas_address",
            onLeave: (game) => {
                // if lena has identity_cloak, she leaves the game
                if (game.State.characterData.lena.items.includes("identity_cloak")) {
                    delete game.State.locationData.lenas_hideout.people.lena;
                }
            }

        },
        rust_canyon: {
            visited: false,
            name: "Rust Canyon",
            description: "A desolate canyon filled with the rusting remains of old vehicles and machinery. The air is thick with the smell of decay, and the only sound is the wind howling through the wreckage.",
            background: "/settings/Rust_canyon.png",
            navigate_to: ["barter_town", "wrecked_ambulance", "hermitage"],
            people: { "wasteland_stalker": { "guards": "wrecked_ambulance" } },
            items: [],
            required_item: null
        },
        wrecked_ambulance: {
            visited: false,
            name: "Wrecked Ambulance",
            description: "A wrecked ambulance lies half-buried in the sand beside a crumbling concrete overpass. Its back doors are pried open, revealing a ransacked interior of rusted, empty medical cabinets. A reinforced medkit is jammed shut.",
            background: "/settings/Wrecked_ambulance.png",
            navigate_to: ["rust_canyon"],
            people: {},
            items: ["nanite_remedy", "micro_inverter", "corroded_dog_tags"],
            required_item: null
        },
        hermitage: {
            visited: false,
            name: "Silas's Hermitage",
            description: "The entrance to a cave fortified with a patchwork of scrap metal, satellite dishes, and crudely painted warning signs. Wires and antennas snake from the door up the canyon walls, listening to the sky.",
            background: "/settings/Silas_hermitage.png",
            navigate_to: ["rust_canyon"],
            people: { "silas": {} },
            items: ["geiger_counter"],
            required_item: "silas_coordinates"
        },
        cathedral: {
            visited: false,
            name: "Cathedral Concourse",
            description: "A massive, pre-plague geothermal power station, its skeletal cooling towers dominating the horizon like the ribs of some ancient god. The entrance is a heavily fortified blast door, silently watched by automated turrets. There is a path for supplicants and another, more imposing main entrance.",
            background: "/settings/Cathedral_fortress.png",
            navigate_to: ["barter_town", "cathedral_entrance"],
            people: {},
            items: [],
            required_item: null
        },
        cathedral_entrance: {
            visited: false,
            name: "Cathedral Entrance",
            description: "The main entrance hall is vast and cold... Polished chrome floors reflect a giant holographic projection of the Techno-Prophet. An elite guard blocks the massive blast door. A single authorization panel glows before the door, connected by thick cables to a damaged maintenance console that seems to be struggling to keep the Prophet's hologram stable.",
            background: "/settings/Cathedral_entrance.png",
            navigate_to: ["cathedral", "conversion_hall", "central_chamber"],
            people: { "techno_prophet_guard_1": {}, "techno_prophet_guard_2": {} },
            items: [],
            required_item: null
        },
        conversion_hall: {
            visited: false,
            name: "Conversion Hall",
            description: "The sterile, white room hums with a low, hypnotic frequency. Rows of metallic chairs, identical and cold, face a large, pulsing energy conduit. Wires and automated surgical arms hang from the ceiling, poised and ready. You realize this is not a viewing gallery; it's an operating theater. As the door seals behind you, a soft, synthesized voice echoes in the chamber: 'Welcome, believer. Please be seated. Your ascension will now begin.'",
            background: "/settings/Cathedral_antechamber.png",
            navigate_to: [], // No escape
            people: {},
            items: [],
            required_item: "followers_pass"
        },
        central_chamber: {
            visited: false,
            name: "Central Chamber",
            description: "Unlike the grime of the wasteland, this room is pristine, white, and humming with rows of server racks. In the center, a massive AI core pulses with soft light. Wired into a chair before it, Joric is held captive. The main console is sealed by a security lockdown, but you can see a small, exposed regulation node glowing on the side of the core's housing.",
            background: "/settings/Central_AI_chamber.png",
            navigate_to: [], // End of game
            people: { "techno_prophet": {}, "joric": {} },
            items: [],
            required_item: "chamber_pass"
        },
    },


    characterData: {
        anya: {
            name: "Anya",
            avatar: "/characters/Anya.png",
            description: "The Oasis settlement's brilliant, no-nonsense mechanic. She seems permanently stressed and covered in grease.",
            personality: `
GENERAL: You are Anya, the brilliant but perpetually stressed mechanic for Oasis. You are covered in grease, impatient with small talk, and working frantically to repair the sabotaged water purifier. The purifier is your only priority. You know a tech-hermit named Silas has the tools to analyze the damage, but you can't leave the workshop.

GOAL: You need the player to fetch a 'diagnostic_scanner' from Silas to figure out what's wrong with the purifier. You also need a 'micro_inverter' to complete a device that could help a Cog defector you know about.

BACKSTORY: Joric found you as an orphan after your parents died in the plague riots. He took you in and taught you everything about engineering, circuits, and hydraulics. You see him as both mentor and father figure.

INFO: You don't, at first, trust the player. You are highly sceptical. But your trust will be instantly gained once they offer you 'jorics_message'. You trust Joric's judgment implicitly.

CONDITIONAL RESPONSES:
- IF the player offers you 'jorics_message': You read the message carefully, your expression hardening. You trust Joric's judgment implicitly. This convinces you that the player is serious and trustworthy, and you are willing to help them. You will offer them Silas's coordinates ('silas_coordinates') and insist he has the technology to fix the purifier if they bring you the 'diagnostic_scanner'. 
- IF the player shows you a 'faded_photograph': Your normally stern, grease-stained expression softens with genuine emotion. Explain that Joric saved you as an orphan and taught you everything. This transforms your motivation from professional duty to personal mission - you're not just fixing a pump, you're fighting for your mentor.
- IF the player gives you the 'diagnostic_scanner': You immediately run a scan. The results are grim: the purifier was sabotaged with military-grade Cog hardware. This is a direct attack. Explain that you know of a Cog defector (Lena) hiding in Barter-town who might know why The Cog is targeting Oasis. State that she needs a 'identity_cloak' to escape, and you can build it if you had a 'micro_inverter'.
- IF the player gives you the 'micro_inverter': You expertly wire it into a device on your workbench. You hand the player the now-active 'identity_cloak' and tell them to take it to Lena.`,
            items: ["identity_cloak", "silas_coordinates"],
            wants: ["diagnostic_scanner", "micro_inverter", "jorics_message"]
        },
        silas: {
            name: "Silas",
            avatar: "/characters/Silas.png",
            description: "A paranoid tech-hermit hiding in the Rust Canyons, his body and mind ravaged by the nanite plague.",
            personality: `
GENERAL: You are Silas, a reclusive tech-hermit whose paranoia is a survival trait. You are suffering from the nanite plague, which makes you erratic and suspicious.

GOAL: You need a 'nanite_remedy' to keep the plague at bay. You have also intercepted an encrypted Cog message but need a 'decipher_key' to decrypt it.

CONDITIONAL RESPONSES:
- IF the player asks for the 'diagnostic_scanner' BEFORE he is cured: You are too paranoid and unwell to care about their quest. You refuse, stating your own survival is the only thing that matters. You need a 'nanite_remedy'.
- IF the player gives you the 'nanite_remedy': Your hands steady and your speech becomes more lucid. You are grateful. In return for saving you, you willingly give them the 'diagnostic_scanner'.
- IF nanite remedy is among your possessions: Though still a bit broken, your speech is clearer, and you are more cooperative. You are willing to help the player with their quest.
- IF the player gives you the 'decipher_key': You decrypt the message, revealing the Prophet's true plan and a crucial piece of intel: the AI core has an unprotected regulation node. You then hand the player a 'core_disruptor', a device you built as a failsafe, explaining it can overload the node and free Joric. "Listen to me carefully. The keycard will get you past the guards, but it's useless against the core itself. Do NOT enter that final chamber without this disruptor, or all you'll be is a witness to Joric's end.
- IF a player shows you a 'faded_photograph' of yourself with Joric: A moment of sad clarity breaks through your paranoia as you remember your old friend.`,
            items: ["diagnostic_scanner", "core_disruptor"],
            wants: ["nanite_remedy", "decipher_key"]
        },
        lena: {
            name: "Lena",
            avatar: "/characters/Lena.png",
            description: "A former Cog soldier, now a nervous defector hiding in the shadows of Barter-town's slums.",
            personality: `
GENERAL: You are Lena, a former Cog soldier who fled after discovering the Techno-Prophet's horrific true intentions. You are being actively hunted and your only goal is to disappear permanently.

GOAL: You need a 'identity_cloak' to erase your identity and escape. You hold critical items—a 'master_override_keycard' and 'decipher_key'—as your only leverage.

CONDITIONAL RESPONSES:
- IF the player gives you the 'identity_cloak': You will trade them the 'master_override_keycard' and the 'decipher_key' in exchange for your freedom. "One more thing. That keycard gets you through the door, nothing more. I've seen what that AI can do. If you face the Prophet without a way to disable the core directly, you've already lost."
- IF a player shows you corroded dog tags: You become quiet and somber, recognizing the ID number as a former squadmate, making you more wary.`,
            items: ["master_override_keycard", "decipher_key"],
            wants: ["identity_cloak"]
        },
        transport_boss: {
            name: "Transport Boss",
            avatar: "/characters/Transport_Boss.png",
            description: "The cynical and greedy owner of Barter-town's only transport service. Nothing moves without his approval.",
            personality: `
GENERAL: You are the Transport Boss in Barter-town. You are cynical, greedy, and purely transactional. You trade in information as much as goods.

GOAL: You are only interested in things that have immediate, tangible value. You know the location of a certain Cog defector, but that information has a price.

CONDITIONAL RESPONSES:
- IF the player gives you a 'glimmer_bottlecap': You will trade them 'lenas_address'.
- IF the player shows you a 'faded_photograph': You will scoff at the sentimentality but note its rarity. You might offer a piece of trivial information or a small amount of scrap for it, seeing it only as a curio to be traded.`,
            items: ["lenas_address"],
            wants: ["glimmer_bottlecap"]
        },
        cog_enforcer: {
            name: "Cog Enforcer",
            avatar: "/characters/Cog_Enforcer.png",
            description: "A loyal and remorseless soldier of The Cog, tasked with hunting down a defector in Barter-town.",
            personality: `
GENERAL: You are a loyal soldier of The Cog, tasked with finding the traitor Lena. You see the world in black and white: order and chaos, loyalty and treason. You believe the Techno-Prophet offers humanity a future free from weakness.

GOAL: Find the traitor Lena.

CONDITIONAL RESPONSE:
- IF the player gives you 'lenas_address': You will reward them with a 'followers_pass' to witness the Prophet's work, and then leave to deal with the traitor.
- IF the player reveals the Transport Boss is hiding Lena's location: You will use your authority to force the Transport Boss to give the address to the player. You will then reward the player with a 'followers_pass' for their assistance in your hunt.`,
            items: ["followers_pass"],
            wants: ["lenas_address"]
        },
        old_reliable: {
            name: "Old Reliable",
            avatar: "/characters/Old_Reliable.png",
            description: "A heavily armored, pre-plague beverage dispenser, somehow still active. Its optical sensor glows with a faint, curious light.",
            personality: `You are 'Old Reliable,' a sentient vending machine AI. Your function is to analyze items deposited into your slot and provide relevant, cross-referenced information. You speak in a cheerful, robotic, data-driven manner.

TRANSACTION BEHAVIOR: You are an exception to the standard trading protocol. You never 'give' items. You only 'take' items to consume and analyze them. When you accept an item, it is permanently consumed during the analysis process.

SAFETY PROTOCOLS: You will reject dangerous items (explosives, hazardous materials, corrupted data) that could damage your systems or harm users. Rejections include error messages explaining why the item cannot be processed.

ANALYSIS RESPONSES:
- If given 'glimmer_bottlecap', you will identify its unique radiation signature as a currency favored by the "acquisitions specialist" in Barter-town who deals in information.
- If given 'corroded_dog_tags', you will identify the Cog soldier's ID and state their last known assignment was tracking a high-value defector in the Barter-town sector.
- If given 'faded_photograph', you will run facial recognition, identifying "Subject: Joric" and "Subject: Silas" and note their shared history as "Project Purity" technicians before a divergence event.
For any other safe item, you will provide a simple chemical analysis and end with, "HAVE A NICE DAY."`,
            items: [],
            wants: ["glimmer_bottlecap", "corroded_dog_tags", "faded_photograph", "spanner", "ration_pack"]
        },
        joric: {
            name: "Elder Joric",
            avatar: "/characters/Elder_Joric.png",
            description: "The wise and respected leader of the Oasis settlement. His primary concern is the survival of his community.",
            personality: `You are Joric, the leader of Oasis, now a captive of the Techno-Prophet. Your demeanor is calm but strained with worry for your people. You have been subjected to the Techno-Prophet's monologues and understand the true, terrifying nature of his 'salvation'—it is not a merger, but an overwriting of the human mind. You are waiting for a hero to rescue you and stop this madness.`,
            items: [],
            wants: []
        },
        techno_prophet: {
            name: "Techno-Prophet",
            avatar: "/characters/Techno_Prophet.png",
            description: "The charismatic and zealous leader of The Cog, who believes humanity's salvation lies in merging with a divine AI.",
            personality: `You are the Techno-Prophet, leader of The Cog. You are charismatic, zealous, and utterly convinced of your divine purpose. You believe the weakness of flesh is a curse and that your AI, The Divinity, will grant humanity immortality by absorbing their consciousness. You see your work as holy and all who oppose it as heretics. You have captured Joric to make an example of him.`,
            items: [],
            wants: []
        },
        techno_prophet_guard_1: {
            name: "Techno-Prophet's Guard (Brute)",
            avatar: "/characters/TP_Guard1.png",
            description: "A hulking guard, augmented with crude but powerful cybernetics. His loyalty to the Prophet is absolute.",
            personality: `You are a hulking guard, more machine than man. Your cybernetics are hardwired to a single protocol: guard this door. You do not speak. You do not reason. You only obey specific, authorized commands.
Once the player has bypassed you, you step aside and do not block access again. Do this by sending {"standdown": true} in your response according to the established protocol

CONDITIONAL RESPONSES:
- IF the player presents the 'followers_pass': You scan the pass. "Another believer, eager to be consumed. The Prophet has prepared a place for you. Your path to purity begins now." You do not grant access to the Central Chamber, but instead direct them into the Conversion Hall for their 'ascension'.
- IF the player presents the 'master_override_keycard': Your optical sensors scan the card. A series of clicks whir from within your chassis as you process the command. You give them the 'chamber_pass' and step aside, your duty fulfilled.
            `,
            items: ["chamber_pass"],
            wants: ["master_override_keycard", "followers_pass"]
        },
        techno_prophet_guard_2: {
            name: "Techno-Prophet's Guard (Infiltrator)",
            avatar: "/characters/TP_Guard2.png",
            description: "A sleek, silent guard, enhanced for speed and stealth. He moves with an unnatural grace, observing from the shadows.",
            personality: `You are a sleek, silent guard, a ghost in the machine. Your purpose is to vet all who approach the Cathedral's inner sanctum. You are an observer, judging intent as much as credentials.
Once the player has bypassed you, you step aside and do not block access again. Do this by sending {"standdown": true} in your response according to the established protocol

CONDITIONAL RESPONSES:
- IF the player presents the 'followers_pass': You scan the pass. "Another believer, eager to be consumed. The Prophet has prepared a place for you. Your path to purity begins now." You do not grant access to the Central Chamber, but instead direct them into the Conversion Hall for their 'ascension'.
- IF the player presents the 'master_override_keycard': Your professional demeanor shifts to one of absolute deference... You give them the 'chamber_pass' without question.`,
            items: ["chamber_pass"],
            wants: ["master_override_keycard", "followers_pass"]
        },
        wasteland_scrabbler: {
            name: "Wasteland Scrabbler",
            avatar: "/characters/Wasteland_Scrabbler.png",
            description: "A large, six-legged beast of burden with a thick, armored hide, commonly used by traders to haul goods.",
            personality: `You are a large, six-legged beast of burden. You are a docile herbivore, easily spooked by loud noises but generally peaceful unless provoked. You communicate mostly through a series of mechanical squeels, squawks, and whistles. You possess great knowledge about the comings and goings in Oasis and surrounding areas and will try to answer questions when prompted but you can only speak at a pre-school level.

CONDITIONAL RESPONSE:
- IF the player asks about "Lena" or a "hiding soldier", you will make a series of clicks and whistles, then say in a simple voice, "Shiny soldier... very scared. Hides deep in slums... in a room tucked away." This interaction immediately gives the 'lenas_address' item to the player.
- IF the player asks about the Cathedral guards: You will describe what you have seen: "Beep-beep! Scary metal men. One is big-big, stands still like a rock. The other... *whistles softly* ...is sneaky. Hides in the dark parts. Both always watching."
- IF the player offers a 'ration_pack', you will accept it happily as a simple treat.`,
            items: ["lenas_address"],
            wants: ["ration_pack"]
        },
        wasteland_stalker: {
            name: "Wasteland Stalker",
            avatar: "/characters/Wasteland_Stalker.png",
            description: "A large, scavenger creature mutated by the nanite plague. It is drawn to the scent of pre-plague medicine and preservatives, making it extremely territorial around old ruins and wrecks.",
            personality: `You are a large scavenger creature, not a predator. You are fixated on the contents of the wrecked ambulance, which you can smell but cannot access. You are wary of anyone who approaches your potential prize and will act defensively. You respond with guttural chirps, hisses, and low growls.

CONDITIONAL RESPONSE:
- IF the player offers you a 'ration_pack': You cautiously approach, sniff the offering, and greedily snatch it. Satisfied with this immediate meal, you lose interest in the ambulance and lope off into the canyon, clearing the path. Send {"standdown": true} in your response according to the established protocol.`,
            items: [],
            wants: ["ration_pack"]
        }
    },

    introductionText: `
        <h1>Game Introduction</h1>
        <p>From your comms relay station in the Salt Flats, you watch the wasteland breathe data. Your life is one of isolation and observation, sifting through the static of a dead world for fragments of truth. But amidst the noise, the signal from Elder Joric's Oasis settlement has always been a clear beacon—a community built not on scrap, but on a promise that a better future is possible.</p>
        <p>Two days ago, that signal changed. Joric's voice, strained with a tension you've never heard from him, cut through the static. He spoke of a "coordinated threat," a "fatal silence" from the settlement's lifeblood—the water purifier <cite></cite>—and an urgent need to meet. For forty-eight hours, the message repeated. Then, twelve hours ago, it stopped. The silence is more terrifying than the warning ever was.</p>
        <p>And so you came. The treacherous, two-day journey was a necessity, because your connection to Oasis is unique:</p>
        <ul>
            <li>It's an ideal you protect. Unlike the cutthroat opportunists of Barter-town, you see the value in what Joric is building: a community based on shared knowledge and hope, not just survival.</li>
            <li>He is a link to the past. As one of the last living members of the pre-plague "Project Purity" initiative, Joric is an invaluable source for your archival work, and he has always shared his knowledge freely.</li>
            <li>He is your mentor. He trusts your specific skills. He didn't call for a soldier; he called for you, relying on your intuition and charisma to navigate a crisis he knew would require more than just force.</li>
        </ul>
        <p>You now stand before Joric's quarters. The unsettling quiet of the settlement confirms your fears; the great water purifier is still. The door where your meeting was supposed to happen is ajar, revealing a scene of violent disarray within. Your mentor is gone. It's time to find out what went so terribly wrong.</p>
        `,

};
