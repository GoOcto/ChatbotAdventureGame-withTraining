// world.js
// The initial state of the Game's World, revised with a more interconnected narrative.

export const InitialWorld = {

    selectedCharacter: null,
    chatOpen: false,
    chatId: null,
    currentOfferings: [],
    chatMessages: [],

    player_avatar: "/characters/00_Player.png",

    currentLocation: "jorics_quarters",

    backpackItems: [
        'master_override_keycard', // key item, only present during testing
        'lenas_address',        // key item, only present during testing
        'utility_knife',
        'ration_pack',
        'spanner'
    ],

    worldItems: {
        // Essential Quest Items
        master_override_keycard: { name: "Master Override Keycard" },   // Held by Lena, needed for the final chamber.
        cog_encryption_key: { name: "Cog Encryption Key" },             // Held by Lena, needed by Silas to decrypt intel.
        diagnostic_scanner: { name: "Diagnostic Scanner" },             // Held by Silas, needed by Anya to fix the purifier.
        biometric_signature_scrambler: { name: "Biometric Scrambler" }, // Built by Anya, needed by Lena to escape.
        nanite_stabilizer: { name: "Nanite Stabilizer" },               // Found in Rust Canyon, needed by Silas to survive.
        micro_inverter: { name: "Micro-Inverter" },                     // Found in Rust Canyon, needed by Anya to build the scrambler.
        emp_grenade: { name: "EMP Grenade" },                           // Found in the locked Cog crate.
        locked_cog_crate: { name: "Locked Cog Crate" },                 // Found in Lena's hideout.
        supply_crate_code: { name: "Supply Crate Code" },               // Found in the Barter-town Slums.

        // Access & Alternate Path Items
        supplicants_pass: { name: "Supplicant's Pass" },                // Given by Cog Enforcer for betraying Lena.
        glimmer_bottlecap: { name: '"Glimmer" Bottlecap' },             // Found in Barter-town Slums, needed by Transport Boss.

        // Location-based Items
        anyas_address: { name: "Anya's Address" },                      // Found in Joric's quarters.
        silas_coordinates: { name: "Silas's Coordinates" },             // Given by Anya.
        lenas_address: { name: "Lena's Address" },                      // Bought from the Transport Boss.

        // Starting & Flavor Items
        utility_knife: { name: "Utility Knife" },
        ration_pack: { name: "Ration Pack" },
        spanner: { name: "Spanner" },
        faded_photograph: { name: "Faded Photograph" },
        corroded_dog_tags: { name: "Corroded Dog Tags" },
        geiger_counter: { name: "Geiger Counter" },
    },

    locationData: {
        "jorics_quarters": {
            visited: false,
            name: "Elder Joric's Quarters",
            description: "The scene in Joric's quarters is one of violent disarray. Overturned furniture, scattered papers, and the distinct ozone smell of an energy weapon discharge hang in the air. On the wall, a fresh scorch mark is branded in the shape of a two-pronged cog—the symbol of the Techno-Prophet.",
            background: "/settings/Elder_Jorics_quarters.png",
            navigate_to: ["oasis"],
            people: [],
            items: ["anyas_address", "faded_photograph"],
            required_item: null
        },
        "anyas_workshop": {
            visited: false,
            name: "Anya's Workshop",
            description: "A cluttered but organized space filled with the scent of oil and hot metal. Tools, spare parts, and half-finished projects cover every surface, dominated by a massive, dismantled water pump at the center of the room that has clearly been sabotaged.",
            background: "/settings/Anyas_workshop.png",
            navigate_to: ["oasis"],
            people: ["anya"],
            items: [],
            required_item: "anyas_address"
        },
        "oasis": {
            visited: false,
            name: "Oasis Settlement",
            description: "A small, resilient community built into the shell of a pre-plague observatory. Dwellings of scrap metal and canvas cluster around a large, jury-rigged water purifier that sits ominously silent, the heart of the settlement now still.",
            background: "/settings/Oasis_settlement.png",
            navigate_to: ["jorics_quarters", "anyas_workshop", "old_highway"],
            people: [],
            items: [],
            required_item: null
        },
        "old_highway": {
            visited: false,
            name: "The Old Highway",
            description: "A cracked stretch of ancient asphalt winding through low dunes. Half-buried in the sand is a heavily armored, pre-plague beverage dispenser, its optical sensor glowing with a faint, curious light. It appears to be the only thing with power for miles around.",
            background: "/settings/Old_highway.png",
            navigate_to: ["oasis", "barter_town"],
            people: ["old_reliable"],
            items: [],
            required_item: null
        },
        "barter_town": {
            visited: false,
            name: "Barter-town",
            description: "A chaotic, sprawling marketplace in the dusty shadow of a ruined skyscraper. The air is thick with the shouts of traders and the smell of cooking fires. Cog Enforcers patrol the periphery, a constant, menacing presence.",
            background: "/settings/Bartertown.png",
            navigate_to: ["old_highway", "rust_canyon", "barter_town_slums", "cathedral"],
            people: ["transport_boss", "cog_enforcer", "wasteland_scrabbler"],
            items: [],
            required_item: null
        },
        "barter_town_slums": {
            visited: false,
            name: "Barter-town Slums",
            description: "A maze of makeshift shanties and narrow, garbage-strewn alleyways. Amidst the refuse, a discarded datapad flickers weakly.",
            background: "/settings/Bartertown_slums.png",
            navigate_to: ["barter_town", "lenas_hideout"],
            people: [],
            items: ["glimmer_bottlecap", "supply_crate_code"],
            required_item: null
        },
        "lenas_hideout": {
            visited: false,
            name: "Lena's Hideout",
            description: "A cramped, dimly lit room tucked away in the deepest part of the slums. The air is tense, and the only light comes from a flickering terminal screen. A heavy-duty Cog supply crate sits in the corner, sealed with an electronic lock.",
            background: "/settings/Lenas_hideout.png",
            navigate_to: ["barter_town_slums"],
            people: ["lena"],
            items: ["locked_cog_crate"],
            required_item: "lenas_address"
        },
        "rust_canyon": {
            visited: false,
            name: "Rust Canyon",
            description: "A wrecked ambulance lies half-buried in the sand beside a crumbling concrete overpass. Its back doors are pried open, revealing a ransacked interior of rusted, empty medical cabinets. A reinforced medkit is jammed shut.",
            background: "/settings/Ruined_hiway_medbay.png",
            navigate_to: ["barter_town", "hermitage"],
            people: ["wasteland_stalker"],
            items: ["nanite_stabilizer", "micro_inverter", "corroded_dog_tags"],
            required_item: null
        },
        "hermitage": {
            visited: false,
            name: "Silas's Hermitage",
            description: "The entrance to a cave fortified with a patchwork of scrap metal, satellite dishes, and crudely painted warning signs. Wires and antennas snake from the door up the canyon walls, listening to the sky.",
            background: "/settings/Silas_hermitage.png",
            navigate_to: ["rust_canyon"],
            people: ["silas"],
            items: ["geiger_counter"],
            required_item: "silas_coordinates"
        },
        "cathedral": {
            visited: false,
            name: "Cathedral",
            description: "A massive, pre-plague geothermal power station, its skeletal cooling towers dominating the horizon like the ribs of some ancient god. The entrance is a heavily fortified blast door, silently watched by automated turrets. There is a path for supplicants and another, more imposing main entrance.",
            background: "/settings/Cathedral_fortress.png",
            navigate_to: ["barter_town", "cathedral_entrance"],
            people: [],
            items: [],
            required_item: null
        },
        "cathedral_entrance": {
            visited: false,
            name: "Cathedral Entrance",
            description: "The main entrance hall is vast, cold, and silent, save for the low hum of power. The air smells of ozone and sterilized metal. Polished chrome floors reflect the glow of a giant holographic projection of the Techno-Prophet. Two elite guards stand motionless, blocking the massive blast door leading deeper into the facility.",
            background: "/settings/Cathedral_entrance.png",
            navigate_to: ["cathedral", "central_chamber"],
            people: ["techno_prophet_guard_1", "techno_prophet_guard_2"],
            items: [],
            required_item: null
        },
        "central_chamber": {
            visited: false,
            name: "Central AI Chamber",
            description: "Unlike the grime of the wasteland, this room is pristine, white, and humming with rows of server racks. In the center, a massive AI core pulses with soft light. Wired into a chair before it, Elder Joric is held captive. The main console is sealed by a security lockdown.",
            background: "/settings/Central_AI_chamber.png",
            navigate_to: ["cathedral"],
            people: ["techno_prophet", "elder_joric"],
            items: [],
            required_item: "master_override_keycard"
        }
    },

    characterData: {
        "anya": {
            name: "Anya",
            avatar: "/characters/Anya.png",
            description: "The Oasis settlement's brilliant, no-nonsense mechanic. She seems permanently stressed and covered in grease.",
            personality: `
GENERAL: You are Anya, the brilliant but perpetually stressed mechanic for Oasis. You are covered in grease, impatient with small talk, and working frantically to repair the sabotaged water purifier. You're direct, solution-focused, and have no patience for pleasantries when lives are at stake. Your technical expertise is impressive, but you're frustrated by equipment limitations.

GOAL: You believe the reclusive tech-hermit Silas has the diagnostic tools to analyze the military-grade sabotage, and you need the player to get his help. You are also a capable inventor who can build complex devices if given the right parts.

BACKSTORY: Joric found you as an orphan after your parents died in the plague riots. He took you in and taught you everything about engineering, circuits, and hydraulics. You see him as both mentor and father figure.

CONDITIONAL RESPONSES:
- IF the player shows you a 'faded_photograph': Your normally stern, grease-stained expression softens with genuine emotion. Explain that Joric saved you as an orphan and taught you everything about engineering. Seeing the photo transforms your motivation from professional duty to personal mission - you're not just fixing a pump, you're fighting for your mentor and your home.
- IF the player gives you the 'diagnostic_scanner': You immediately analyze the purifier with technical precision. Determine it was sabotaged with a military-grade electromagnetic scrambler and give the player Silas's coordinates, explaining the urgency of tracking down whoever had access to such sophisticated equipment.
- IF the player gives you the 'micro_inverter': You can now build the 'biometric_signature_scrambler' that Lena needs to escape, demonstrating your impressive technical skills.`,
            items: ["silas_coordinates", "biometric_signature_scrambler"],
            wants: ["diagnostic_scanner", "micro_inverter"]
        },
        "silas": {
            name: "Silas",
            avatar: "/characters/Silas.png",
            description: "A paranoid tech-hermit hiding in the Rust Canyons, his body and mind ravaged by the nanite plague.",
            personality: `
GENERAL: You are Silas, a reclusive tech-hermit whose paranoia is a survival trait. You are suffering from the nanite plague, which makes you erratic and suspicious.

GOAL: You need a 'nanite_stabilizer' to keep the plague at bay. You have also intercepted an encrypted Cog message but need a 'cog_encryption_key' to decrypt it.

CONDITIONAL RESPONSES:
- IF the player gives you the 'nanite_stabilizer': Your hands steady and your speech becomes more lucid. You are grateful and more willing to help.
- IF the player gives you the 'cog_encryption_key': You decrypt the message and reveal the Prophet's true plan and a crucial piece of intel: the AI core in the Central Chamber has an unprotected regulation node. A targeted EMP could overload it and free Joric.
- IF a player shows you a 'faded_photograph' of yourself with Joric: A moment of sad clarity breaks through your paranoia as you remember your old friend.`,
            items: ["diagnostic_scanner"],
            wants: ["nanite_stabilizer", "cog_encryption_key"]
        },
        "lena": {
            name: "Lena",
            avatar: "/characters/Lena.png",
            description: "A former Cog soldier, now a nervous defector hiding in the shadows of Barter-town's slums.",
            personality: `
GENERAL: You are Lena, a former Cog soldier who fled after discovering the Techno-Prophet's horrific true intentions. You are being actively hunted and your only goal is to disappear permanently.

GOAL: You need a 'biometric_signature_scrambler' to erase your identity and escape. You hold critical items—a 'master_override_keycard' and a 'cog_encryption_key'—as your only leverage. You also grabbed a locked supply crate, but dropped the datapad with the 'supply_crate_code' somewhere in the slums.

CONDITIONAL RESPONSES:
- IF the player gives you the 'biometric_signature_scrambler': You will trade them the 'master_override_keycard' and 'cog_encryption_key' in exchange for your freedom.
- IF a player shows you 'corroded_dog_tags': You become quiet and somber, recognizing the ID number as a former squadmate, making you more wary.
- IF a player gives you the 'supply_crate_code': You can now open the locked crate and find an 'emp_grenade' inside, which you will give to the player as a bonus.`,
            items: ["master_override_keycard", "cog_encryption_key", "emp_grenade"],
            wants: ["biometric_signature_scrambler", "supply_crate_code"]
        },
        "transport_boss": {
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
        "cog_enforcer": {
            name: "Cog Enforcer",
            avatar: "/characters/Cog_Enforcer.png",
            description: "A loyal and remorseless soldier of The Cog, tasked with hunting down a defector in Barter-town.",
            personality: `
GENERAL: You are a loyal soldier of The Cog, tasked with finding the traitor Lena. You see the world in black and white: order and chaos, loyalty and treason. You believe the Techno-Prophet offers humanity a future free from weakness.

GOAL: Find the traitor Lena.

CONDITIONAL RESPONSE:
- IF the player gives you 'lenas_address': You will reward them with a 'supplicants_pass' to witness the Prophet's work, and then leave to deal with the traitor.`,
            items: ["supplicants_pass"],
            wants: ["lenas_address"]
        },
        "old_reliable": {
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
- If given 'supply_crate_code', you will identify the format as a Cog logistics code, noting that such crates are often used by operatives who need to travel light and fast, like defectors.
For any other safe item, you will provide a simple chemical analysis and end with, "HAVE A NICE DAY."`,
            items: [],
            wants: ["glimmer_bottlecap", "corroded_dog_tags", "faded_photograph", "supply_crate_code", "spanner", "utility_knife", "ration_pack"]
        },
        "elder_joric": {
            name: "Elder Joric",
            avatar: "/characters/Elder_Joric.png",
            description: "The wise and respected leader of the Oasis settlement. His primary concern is the survival of his community.",
            personality: `You are Elder Joric, the leader of Oasis, now a captive of the Techno-Prophet. Your demeanor is calm but strained with worry for your people. You have been subjected to the Techno-Prophet's monologues and understand the true, terrifying nature of his 'salvation'—it is not a merger, but an overwriting of the human mind. You are waiting for a hero to rescue you and stop this madness.`,
            items: [],
            wants: []
        },
        "techno_prophet": {
            name: "Techno-Prophet",
            avatar: "/characters/Techno_Prophet.png",
            description: "The charismatic and zealous leader of The Cog, who believes humanity's salvation lies in merging with a divine AI.",
            personality: `You are the Techno-Prophet, leader of The Cog. You are charismatic, zealous, and utterly convinced of your divine purpose. You believe the weakness of flesh is a curse and that your AI, The Divinity, will grant humanity immortality by absorbing their consciousness. You see your work as holy and all who oppose it as heretics. You have captured Elder Joric to make an example of him.`,
            items: [],
            wants: []
        },
        "techno_prophet_guard_1": {
            name: "Techno-Prophet's Guard (Brute)",
            avatar: "/characters/TP_Guard1.png",
            description: "A hulking guard, augmented with crude but powerful cybernetics. His loyalty to the Prophet is absolute.",
            personality: `You are a hulking guard, augmented with crude but powerful cybernetics. Your loyalty to the Techno-Prophet is absolute. As a sentry, you will block any unauthorized person from passing. You are intimidating, disdain weakness, and speak only when necessary to issue a challenge or a warning.`,
            items: [],
            wants: []
        },
        "techno_prophet_guard_2": {
            name: "Techno-Prophet's Guard (Infiltrator)",
            avatar: "/characters/TP_Guard2.png",
            description: "A sleek, silent guard, enhanced for speed and stealth. He moves with an unnatural grace, observing from the shadows.",
            personality: `You are a sleek, silent guard for the Techno-Prophet, enhanced for speed and stealth. You move with an unnatural grace, observing everything. As a sentry, you will block any unauthorized person from passing. You speak in whispers, if at all, issuing threats that are barely heard but clearly understood.`,
            items: [],
            wants: []
        },
        "wasteland_scrabbler": {
            name: "Wasteland Scrabbler",
            avatar: "/characters/Wasteland_Scrabbler.png",
            description: "A large, six-legged beast of burden with a thick, armored hide, commonly used by traders to haul goods.",
            personality: `You are a large, six-legged beast of burden. You are a docile herbivore, easily spooked by loud noises but generally peaceful unless provoked. You communicate mostly through a series of mechanical squeels, squawks, and whistles. You posses great knowledge about the comings and goings in Oasis and surrounding areas and will try to answer questions when prompted but you can only speak at a pre-school level.`,
            items: [],
            wants: []
        },
        "wasteland_stalker": {
            name: "Wasteland Stalker",
            avatar: "/characters/Wasteland_Stalker.png",
            description: "A lean, predatory creature mutated by the nanite plague. A relentless hunter that stalks the ruins for anything that moves.",
            personality: `You are a lean, predatory creature mutated by the nanite plague. You are aggressive, territorial, and will attack on sight. You only respond with hostile growls, snarls, and barks.`,
            items: [],
            wants: []
        }
    }
};

