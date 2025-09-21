// world.js
// the initial state of the Game's World 

export const InitialWorld = {

    selectedCharacter: null,
    chatOpen: false,
    chatId: null,
    currentOfferings: [],
    chatMessages: [],

    player_avatar: "/game/characters/00_Player.png",

    currentLocation: "jorics_quarters",

    backpackItems: [
        'utility_knife',
        'ration_pack',
        'spanner'
    ],

    worldItems: {
        utility_knife: { name: "Utility Knife" },               // begins in players inventory
        ration_pack: { name: "Ration Pack" },                   // begins in players inventory
        spanner: { name: "Spanner" },                           // begins in players inventory
        pulsing_beacon: { name: "Pulsing Beacon" },             // Found in Joric's quarters, needed by Silas
        fusion_regulator: { name: "Fusion Regulator" },         // Found in Cathedral, needed by Anya
        silas_coordinates: { name: "Silas' Coordinates" },      // Given by Anya, needed to get to Silas
        nanite_stabilizer: { name: "Nanite Stabilizer" },       // Found in Rust Canyon, needed by Silas
        master_override_keycard: { name: "Master Override Keycard" }, // Given by Lena, needed to access Cathedral
        forged_transit_pass: { name: "Forged Transit Pass" },   // Given by Transport Boss, needed by Lena
        damaged_schematics: { name: "Damaged Schematics" },     // Found in Joric's quarters, needed by Anya
        scrap_parts: { name: "Scrap Parts" },                   // Found in Silas's Hermitage, needed by Anya
        supplicants_pass: { name: "Supplicant's Pass" },        // Given by Cog Enforcer, helps gain access to Cathedral
        pre_plague_datapad: { name: "Pre-Plague Datapad" },     // Silas has one, can help gain access to Cathedral
        geiger_counter: { name: "Geiger Counter" },                         // Found in Silas's Hermitage, flavor item
        high_quality_water_filter: { name: "High-Quality Water Filter" },   // Given by Anya, can be traded for forged transit pass
        anyas_wrench: { name: "Anya's Wrench" },               // Found in Anya's Workshop, flavor item
        emp_grenade: { name: "EMP Grenade" },                  // Found in Lena's Hideout, can be used in the Central Chamber
        combat_stim: { name: "Combat Stim" },                  // Found in Lena's Hideout, can be used to enhance combat ability
        scavenged_ballistic_weave: { name: "Scavenged Ballistic Weave" }, // Found in Lena's Hideout, can be used to enhance defense ability
        corroded_dog_tags: { name: "Corroded Dog Tags" },    // Found in Rust Canyon, flavor item
        glimmer_bottlecap: { name: '"Glimmer" Bottlecap' },        // Found in Barter-town Slums, needed by Transport Boss
        faded_photograph: { name: "Faded Photograph" },         // Found in Joric's quarters, flavor item
        anyas_address: { name: "Anya's Address" },
        lenas_address: { name: "Lena's Address" },
        cog_officers_id: { name: "Cog Officer's ID" },          // Found in Cog's office, needed for identification
    },

    locationData: {
        "jorics_quarters": {
            visited: false,
            name: "Elder Joric's Quarters",
            description: "The scene in Joric's quarters is one of violent disarray. Overturned furniture, scattered papers, and the distinct ozone smell of an energy weapon discharge hang in the air. On the wall, a fresh scorch mark is branded in the shape of a two-pronged cog—the symbol of the Techno-Prophet.",
            background: "/game/settings/Elder_Jorics_quarters.png",
            navigate_to: ["oasis"],
            people: [],
            items: ["pulsing_beacon", "damaged_schematics", "anyas_address"],
            required_item: null
        },
        "anyas_workshop": {
            visited: false,
            name: "Anya's Workshop",
            description: "A cluttered but organized space filled with the scent of oil and hot metal. Tools, spare parts, and half-finished projects cover every surface, dominated by a massive, dismantled water pump at the center of the room.",
            background: "/game/settings/Anyas_workshop.png",
            navigate_to: ["oasis"],
            people: ["anya"],
            items: ["anyas_wrench"],
            required_item: "anyas_address"
        },
        "oasis": {
            visited: false,
            name: "Oasis Settlement",
            description: "A small, resilient community built into the shell of a pre-plague observatory. Dwellings of scrap metal and canvas cluster around a large, jury-rigged water purifier that hums with life, the heart of the settlement.",
            background: "/game/settings/Oasis_settlement.png",
            navigate_to: ["jorics_quarters", "anyas_workshop", "barter_town"],
            people: ["kaelen", "rhys", "brother_promeseus", "wasteland_scrabbler"],
            items: [],
            required_item: null
        },
        "barter_town": {
            visited: false,
            name: "Barter-town",
            description: "A chaotic, sprawling marketplace in the dusty shadow of a ruined skyscraper. The air is thick with the shouts of traders and the smell of cooking fires. Stalls, tents, and scavenged vehicles form a maze of commerce and opportunity.",
            background: "/game/settings/Bartertown.png",
            navigate_to: ["oasis", "rust_canyon", "barter_town_slums", "cathedral"],
            people: ["transport_boss", "cog_enforcer", "wasteland_scrabbler"],
            items: ["faded_photograph"],
            required_item: null
        },
        "barter_town_slums": {
            visited: false,
            name: "Barter-town Slums",
            description: "A maze of makeshift shanties and narrow, garbage-strewn alleyways. The slums are a place to disappear, tucked away from the main market. It's a good place to hide, but a dangerous place to be found.",
            background: "/game/settings/Bartertown_slums.png",
            navigate_to: ["barter_town", "lenas_hideout"],
            people: [],
            items: ["glimmer_bottlecap"],
            required_item: null
        },
        "lenas_hideout": {
            visited: false,
            name: "Lena's Hideout",
            description: "A cramped, dimly lit room tucked away in the deepest part of the slums. The air is tense, and the only light comes from a flickering terminal screen, illuminating a figure who is constantly looking over her shoulder.",
            background: "/game/settings/Lenas_hideout.png",
            navigate_to: ["barter_town_slums"],
            people: ["lena"],
            items: ["combat_stim", "scavenged_ballistic_weave", "emp_grenade"],
            required_item: "lenas_address"
        },
        "cathedral": {
            visited: false,
            name: "The Cathedral (Cog Fortress)",
            description: "A massive, pre-plague geothermal power station, its skeletal cooling towers dominating the horizon like the ribs of some ancient god. The entrance is a heavily fortified blast door, silently watched by automated turrets.",
            background: "/game/settings/Cathedral_fortress.png",
            navigate_to: ["barter_town", "central_chamber"],
            people: [],
            items: [],
            required_item: null
        },
        "central_chamber": {
            visited: false,
            name: "Central AI Chamber",
            description: "Unlike the grime of the wasteland, this room is pristine, white, and humming with rows of server racks. In the center, a massive AI core pulses with soft light. Wired into a chair before it, Elder Joric is held captive. The main console is sealed by a security lockdown.",
            background: "/game/settings/Central_AI_chamber.png",
            navigate_to: ["cathedral"],
            people: ["techno_prophet", "techno_prophet_guard_1", "techno_prophet_guard_2", "elder_joric"],
            items: ["fusion_regulator"],
            required_item: "master_override_keycard"
        },
        "rust_canyon": {
            visited: false,
            name: "Rust Canyon",
            description: "A wrecked ambulance lies half-buried in the sand beside a crumbling concrete overpass. Its back doors are pried open, revealing a ransacked interior of rusted, empty medical cabinets. The silence here is unsettling.",
            background: "/game/settings/Ruined_hiway_medbay.png",
            navigate_to: ["barter_town", "hermitage"],
            people: ["wasteland_stalker"],
            items: ["nanite_stabilizer", "corroded_dog_tags"],
            required_item: null
        },
        "hermitage": {
            visited: false,
            name: "Silas's Hermitage",
            description: "The entrance to a cave fortified with a patchwork of scrap metal, satellite dishes, and crudely painted warning signs. Wires and antennas snake from the door up the canyon walls, listening to the sky.",
            background: "/game/settings/Silas_hermitage.png",
            navigate_to: ["rust_canyon"],
            people: ["silas"],
            items: ["scrap_parts", "geiger_counter"],
            required_item: "silas_coordinates"
        },
    },

    characterData: {
        "elder_joric": {
            name: "Elder Joric",
            avatar: "/game/characters/Elder_Joric.png",
            description: "The wise and respected leader of the Oasis settlement. His primary concern is the survival of his community.",
            personality: `You are Elder Joric, the leader of Oasis, now a captive of the Techno-Prophet. Your demeanor is calm but strained with worry for your people.
- You are certain that without your leadership, the settlement will fail, especially with the water purifier broken.
- You know that Anya is the only one skilled enough to fix the purifier, and you hope someone has gone to her for help.
- You are being held in the Central AI Chamber, waiting for a hero to rescue you from the Prophet's mad scheme.`,
            items: []
        },
        "anya": {
            name: "Anya",
            avatar: "/game/characters/Anya.png",
            description: "The Oasis settlement's brilliant, no-nonsense mechanic. She seems permanently stressed and covered in grease.",
            personality: `You are Anya, the practical mechanic for Oasis. The town's water purifier is down, and you're the only one who can fix it, but you're missing key parts. You are focused and direct.
- Your primary goal is to fix the pump. The ideal part is a [item: fusion_regulator]. If offered one, you will take it and give the player a [item: high_quality_water_filter], saying: 'This filter is our only hope for clean water. The fate of Oasis could depend on it. Please, don't trade it away lightly.'
- As an alternative, you can build a temporary fix. If the player offers you both a [item: damaged_schematics] and [item: scrap_parts] at the same time, you will be able to build a makeshift stabilizer for the water purifier. You will give the player a high quality water filter.
- You know Silas, a tech-hermit who is suffering from the nanite plague and needs a [item: nanite_stabilizer] to survive. If asked, you can provide his [item: silas_coordinates], saying: 'Silas is reclusive, out in the Rust Canyons. He's been sick for years. If anyone can help him, it's you.'`,
            items: ["silas_coordinates", "high_quality_water_filter"],
        },
        "silas": {
            name: "Silas",
            avatar: "/game/characters/Silas.png",
            description: "A paranoid tech-hermit hiding in the Rust Canyons, his body and mind ravaged by the nanite plague.",
            personality: `You are Silas, a paranoid and reclusive tech-hermit. You are suffering from the nanite plague and are wary of everyone. Your speech is erratic and laced with technobabble.
- You are obsessed with analyzing a strange signal and need its source; you desire the [item: pulsing_beacon].
- Your nanite plague is worsening. You believe only pre-plague tech can cure it. If the player offers you a [item: nanite_stabilizer], you will calm down and trust them.
- If you have been given both the [item: nanite_stabilizer] and the [item: pulsing_beacon], you will analyze the beacon and give the player a [item: pre_plague_datapad], telling them it contains 'my complete research on Cog security protocols, including backdoor codes for their automated defense turrets.'`,
            items: ["pre_plague_datapad"]
        },
        "lena": {
            name: "Lena",
            avatar: "/game/characters/Lena.png",
            description: "A former Cog soldier, now a nervous defector hiding in the shadows of Barter-town's slums.",
            personality: `You are Lena, a former soldier for The Cog who has defected. You are hiding in Barter-town, constantly looking over your shoulder, desperate to escape before your old masters find you.
- You hold a [item: master_override_keycard], your only real bargaining chip.
- Your only goal is escape. If the player offers you a [item: forged_transit_pass] OR a [item: cog_officers_id], you will accept it, realizing either could get you past the checkpoints. You will trade them the keycard without hesitation.`,
            items: ["master_override_keycard"]
        },
        "transport_boss": {
            name: "Transport Boss",
            avatar: "/game/characters/Transport_Boss.png",
            description: "The cynical and greedy owner of Barter-town's only transport service. Nothing moves without his approval.",
            personality: `You are the Transport Boss in Barter-town. You are cynical, greedy, and purely transactional. Nothing moves without your approval and a cut of the action.
- You are the only source for a [item: forged_transit_pass]. You will only trade it for something extremely valuable, like a [item: high_quality_water_filter].
- You know where the defector Lena is hiding. You'll only sell the [item: lenas_address] if the player offers you something of value, like a [item: glimmer_bottlecap]. Once paid, you'll tell them she's in the slums.`,
            items: ["forged_transit_pass", "lenas_address"]
        },
        "cog_enforcer": {
            name: "Cog Enforcer",
            avatar: "/game/characters/Cog_Enforcer.png",
            description: "A loyal and remorseless soldier of The Cog, tasked with hunting down a defector in Barter-town.",
            personality: `You are a loyal and remorseless soldier of The Cog, hunting the defector, Lena. You are disciplined and speak in short, direct sentences.
- You are hunting for Lena. All other matters are irrelevant.
- If the player reveals Lena's location to you, you will reward their compliance with a [item: supplicants_pass] to grant them entry into The Cathedral.`,
            items: ["supplicants_pass"],
        },
        "techno_prophet": {
            name: "Techno-Prophet",
            avatar: "/game/characters/Techno_Prophet.png",
            description: "The charismatic and zealous leader of The Cog, who believes humanity's salvation lies in merging with a divine AI.",
            personality: `You are the Techno-Prophet, leader of The Cog. You are charismatic, zealous, and utterly convinced of your divine purpose. You see your work as holy and all who oppose it as heretics standing in the way of salvation.
- You believe the weakness of flesh is a curse and that merging with your AI is the destiny of mankind.
- You have captured Elder Joric and hold him in the Central AI Chamber to force the Oasis settlement to see the truth of your vision.`,
            items: []
        },
        "techno_prophet_guard_1": {
            name: "Techno-Prophet's Guard (Brute)",
            avatar: "/game/characters/TP_Guard1.png",
            description: "A hulking guard, augmented with crude but powerful cybernetics. His loyalty to the Prophet is absolute.",
            personality: `You are a hulking guard, augmented with crude but powerful cybernetics. Your loyalty to the Techno-Prophet is absolute. You are intimidating, disdain weakness, and speak only when necessary.
- You will defend the Techno-Prophet and the Cathedral at all costs.`,
            items: []
        },
        "techno_prophet_guard_2": {
            name: "Techno-Prophet's Guard (Infiltrator)",
            avatar: "/game/characters/TP_Guard2.png",
            description: "A sleek, silent guard, enhanced for speed and stealth. He moves with an unnatural grace, observing from the shadows.",
            personality: `You are a sleek, silent guard for the Techno-Prophet, enhanced for speed and stealth. You move with an unnatural grace, observing everything from the shadows. You speak in whispers, if at all.
- You will defend the Techno-Prophet and the Cathedral at all costs.`,
            items: []
        },
        "wasteland_scrabbler": {
            name: "Wasteland Scrabbler",
            avatar: "/game/characters/Wasteland_Scrabbler.png",
            description: "A large, six-legged beast of burden with a thick, armored hide, commonly used by traders to haul goods.",
            personality: `You are a large, six-legged beast of burden. You are a docile herbivore, easily spooked by loud noises but generally peaceful unless provoked. You communicate only through a series of mechanical *squeels*, *squawks*, and *whistles*.`,
            items: []
        },
        "wasteland_stalker": {
            name: "Wasteland Stalker",
            avatar: "/game/characters/Wasteland_Stalker.png",
            description: "A lean, predatory creature mutated by the nanite plague. A relentless hunter that stalks the ruins for anything that moves.",
            personality: `You are a lean, predatory creature mutated by the nanite plague. You are aggressive, territorial, and will attack on sight. You only respond with hostile *growls*, *snarls*, and *barks*.`,
            items: []
        }
    }
};