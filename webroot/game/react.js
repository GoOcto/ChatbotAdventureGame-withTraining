// Use global React and axios from CDN
const { useEffect, useState } = React;
// axios is loaded globally

// Helper for backpack/offerings/room item rendering
function BackpackItem({ item, onDoubleClick, draggable, onDragStart, onDragEnd }) {
    return (
        <div
            className="backpack-item"
            draggable={draggable}
            data-item={item.id}
            title={item.name}
            onDoubleClick={() => onDoubleClick(item.id)}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
        >
            {item.name}
        </div>
    );
}

function Backpack({ items, onItemDoubleClick, onItemDragStart, onItemDragEnd }) {
    return (
        <div className="backpack">
            {items.map((item) => (
                <BackpackItem
                    key={item.id}
                    item={item}
                    onDoubleClick={onItemDoubleClick}
                    draggable={true}
                    onDragStart={onItemDragStart}
                    onDragEnd={onItemDragEnd}
                />
            ))}
        </div>
    );
}

function Offerings({ items, onItemDoubleClick, onItemDragStart, onItemDragEnd }) {
    return (
        <div className="offerings">
            {items.map((item) => (
                <BackpackItem
                    key={item.id}
                    item={item}
                    onDoubleClick={onItemDoubleClick}
                    draggable={true}
                    onDragStart={onItemDragStart}
                    onDragEnd={onItemDragEnd}
                />
            ))}
        </div>
    );
}

function RoomItems({ items, onItemDoubleClick, onItemDragStart, onItemDragEnd }) {
    return (
        <div className="items-list">
            {items.map((item) => (
                <BackpackItem
                    key={item.id}
                    item={item}
                    onDoubleClick={onItemDoubleClick}
                    draggable={true}
                    onDragStart={onItemDragStart}
                    onDragEnd={onItemDragEnd}
                />
            ))}
        </div>
    );
}

function LocationHeader({ areaData }) {
    return (
        <div id="location-header" className="w-100 mb-4">
            <h2 id="location-name" className="mb-2 text-start">{areaData?.btnName}</h2>
            <div id="location-desc" className="mb-2 text-start">
                <h4>You've entered: {areaData?.name}</h4>
                <p>{areaData?.description}</p>
                {areaData?.people?.length > 0 ? (
                    <p><em>People here:</em></p>
                ) : (
                    <p><em>No one else is here.</em></p>
                )}
            </div>
        </div>
    );
}

function Navigation({ locationData, currentArea, onNavigate }) {
    const locationInfo = locationData[currentArea];
    return (
        <div id="location-nav" className="d-flex flex-column gap-2">
            {locationInfo?.navigate_to?.map((areaID) => (
                <li key={areaID} className="nav-item mb-2">
                    <button
                        className={
                            "btn btn-outline-primary w-100" +
                            (locationData[areaID].visited ? " visited" : "")
                        }
                        onClick={() => onNavigate(areaID)}
                    >
                        {locationData[areaID].btnName}
                    </button>
                </li>
            ))}
        </div>
    );
}

function CharacterAvatars({ locationInfo, characterData, onAvatarClick }) {
    return (
        <div id="location-avatars" className="d-flex justify-content-center gap-3 mt-3">
            {locationInfo?.people?.map((charID) => {
                const char = characterData[charID];
                if (!char) return null;
                return (
                    <div
                        key={charID}
                        className="character-avatar"
                        title={char.name}
                        onClick={() => onAvatarClick(charID)}
                    >
                        <img src={char.avatar} alt={char.name} />
                    </div>
                );
            })}
        </div>
    );
}

function EncounterCard({ open, character, onClose, onBeginChat }) {
    if (!open || !character) return null;
    return (
        <div id="encounter-card" className="card w-100 text-center mt-3" style={{ display: "" }}>
            <div className="card-body position-relative">
                <button type="button" className="btn-close" id="close-encounter-btn" aria-label="Close" onClick={onClose}></button>
                <div className="avatar mx-auto mb-2" id="encounter-avatar">
                    <img src={character.avatar} alt={character.name} />
                </div>
                <h5 className="card-title" id="encounter-name">{character.name}</h5>
                <div className="card-text small" id="encounter-desc">{character.description}</div>
                <button id="begin-chat-btn" className="btn btn-primary mt-3" onClick={onBeginChat}>Begin Encounter</button>
            </div>
        </div>
    );
}

function ChatUI({ open, messages, offerings, onSend, userInput, setUserInput, onOfferingsDoubleClick }) {
    if (!open) return null;
    return (
        <div id="chat-ui" className="w-100">
            <div className="chat-messages mb-3" id="chat-messages">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.sender} animate__animated animate__fadeInUp`}>
                        <span>{msg.text}</span>
                        {msg.faded && <div style={{ color: "#bbb", fontSize: 13, marginTop: 4 }}>{msg.faded}</div>}
                    </div>
                ))}
            </div>
            <div id="offerings-area" className="item-container mb-3">
                <h6>Offerings</h6>
                <Offerings items={offerings} onItemDoubleClick={onOfferingsDoubleClick} />
            </div>
            <form id="chat-form" autoComplete="off" onSubmit={onSend}>
                <div className="input-group">
                    <input
                        type="text"
                        id="user-input"
                        className="form-control"
                        placeholder="Type your message..."
                        required
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                    />
                    <button className="btn btn-primary" type="submit">
                        <i className="fa-solid fa-paper-plane"></i>
                    </button>
                </div>
            </form>
        </div>
    );
}

// Main Game Component
const ComicChitchatGame = ({ worldItems, locationData, characterData, rules }) => {
    // State
    const [currentLocation, setCurrentLocation] = useState({ area: "jorics_quarters" });
    const [backpackItems, setBackpackItems] = useState([]);
    const [offeringsItems, setOfferingsItems] = useState([]);
    const [selectedCharacter, setSelectedCharacter] = useState(null);
    const [encounterCardOpen, setEncounterCardOpen] = useState(false);
    const [chatId, setChatId] = useState(null);
    const [chatOpen, setChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [userInput, setUserInput] = useState("");

    // Utility functions
    const getBackpackItems = () => backpackItems.map((id) => worldItems[id]).filter(Boolean);
    const getRoomItems = () => {
        const locationInfo = locationData[currentLocation.area];
        if (locationInfo && Array.isArray(locationInfo.items)) {
            return locationInfo.items.map((id) => worldItems[id]).filter(Boolean);
        }
        return [];
    };
    const getOfferingsItems = () => offeringsItems.map((id) => worldItems[id]).filter(Boolean);

    // Drag-and-drop logic (simplified for React)
    // You can use react-dnd for more advanced logic
    // ...existing code...

    // Avatar click handler
    const handleAvatarClick = (charID) => {
        setSelectedCharacter(charID);
        setEncounterCardOpen(true);
        setChatOpen(false);
    };

    // Close encounter card
    const handleCloseEncounter = () => {
        setEncounterCardOpen(false);
        setChatOpen(false);
        setChatId(null);
    };

    // Begin chat
    const handleBeginChat = async () => {
        const char = characterData[selectedCharacter];
        let itemList = char.items.length > 0 ? char.items.join(" ") : "--none--";
        let system_prompt = `${rules}\n${char.personality}\nYou possess the following items: ${itemList}`;
        try {
            const resetResp = await axios.post(`http://${window.location.hostname}:${window.location.port}/api/reset`, {
                system_prompt,
            });
            setChatId(resetResp.data.chat_id);
            setChatOpen(true);
            setChatMessages([
                { sender: "bot", text: `Encounter initiated with <b>${char.name}</b>.` },
            ]);
        } catch (err) {
            setChatId(null);
            setChatOpen(false);
        }
    };

    // Send chat message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        let text = userInput.trim();
        if (offeringsItems.length > 0) {
            text += (text ? " " : "") + offeringsItems.map((item) => `[OFFER: ${item}]`).join(" ");
        }
        if (!text && offeringsItems.length === 0) return;
        setChatMessages((msgs) => [...msgs, { sender: "user", text }]);
        setUserInput("");
        try {
            if (!chatId) {
                setChatMessages((msgs) => [...msgs, { sender: "bot", text: "Error: No chat session. Please select a character." }]);
                return;
            }
            const response = await axios.post(`http://${window.location.hostname}:${window.location.port}/api/chat/${chatId}`, { prompt: text });
            if (response.data.reply) {
                setChatMessages((msgs) => [...msgs, { sender: "bot", text: response.data.reply }]);
            } else {
                setChatMessages((msgs) => [...msgs, { sender: "bot", text: "No response from bot." }]);
            }
        } catch (err) {
            setChatMessages((msgs) => [...msgs, { sender: "bot", text: "Error: Could not reach chatbot API." }]);
        }
    };

    // Navigation
    const handleNavigate = (areaID) => {
        setCurrentLocation({ area: areaID });
        setEncounterCardOpen(false);
        setChatOpen(false);
        setSelectedCharacter(null);
    };

    // Double-click logic for backpack/offerings/room items
    const handleBackpackDoubleClick = (itemId) => {
        // Move from backpack to offerings if chat is open
        if (chatOpen) {
            setBackpackItems((items) => items.filter((id) => id !== itemId));
            setOfferingsItems((items) => (items.includes(itemId) ? items : [...items, itemId]));
        } else {
            // Move to room items
            setBackpackItems((items) => items.filter((id) => id !== itemId));
            const locationInfo = locationData[currentLocation.area];
            if (locationInfo && Array.isArray(locationInfo.items)) {
                locationInfo.items.push(itemId);
            }
        }
    };
    const handleOfferingsDoubleClick = (itemId) => {
        // Move from offerings to backpack
        setOfferingsItems((items) => items.filter((id) => id !== itemId));
        setBackpackItems((items) => (items.includes(itemId) ? items : [...items, itemId]));
    };
    const handleRoomItemDoubleClick = (itemId) => {
        // Move from room to backpack
        const locationInfo = locationData[currentLocation.area];
        if (locationInfo && Array.isArray(locationInfo.items)) {
            locationInfo.items = locationInfo.items.filter((id) => id !== itemId);
        }
        setBackpackItems((items) => (items.includes(itemId) ? items : [...items, itemId]));
    };

    // Initial render effect (simulate initial backpack)
    useEffect(() => {
        // Example: set initial backpack items
        setBackpackItems(["item1", "item2"]); // Replace with actual initial items
    }, []);

    // Main render
    const areaData = locationData[currentLocation.area];
    const char = selectedCharacter ? characterData[selectedCharacter] : null;

    return (
        <div className="container-fluid d-flex flex-column p-0">
            <div id="main-content" className="row flex-grow-1 m-0">
                <div className="col-3 d-flex flex-column align-items-center justify-content-start p-3">
                    {/* Player Card */}
                    <div id="player-card" className="card w-100 text-center mb-3">
                        <div className="card-body">
                            <div className="avatar mx-auto mb-2" id="player-avatar">
                                <img src="/game/characters/00_Player.png" alt="Player Avatar" className="img-fluid" />
                            </div>
                            <h5 className="card-title" id="player-name">Player</h5>
                        </div>
                    </div>
                    <div id="backpack-area" className="w-100 item-container">
                        <h6 className="text-start">Your inventory:</h6>
                        <Backpack
                            items={getBackpackItems()}
                            onItemDoubleClick={handleBackpackDoubleClick}
                        />
                    </div>
                </div>
                <div className="col-6 d-flex flex-column align-items-center justify-content-start p-3" id="center-column">
                    <LocationHeader areaData={areaData} />
                    <CharacterAvatars
                        locationInfo={areaData}
                        characterData={characterData}
                        onAvatarClick={handleAvatarClick}
                    />
                    <ChatUI
                        open={chatOpen}
                        messages={chatMessages}
                        offerings={getOfferingsItems()}
                        onSend={handleSendMessage}
                        userInput={userInput}
                        setUserInput={setUserInput}
                        onOfferingsDoubleClick={handleOfferingsDoubleClick}
                    />
                </div>
                <div className="col-3 d-flex flex-column align-items-center justify-content-start p-3">
                    <div id="location-context-area" className="w-100">
                        <div id="navigation-area" className="w-100 item-container mb-3">
                            <h6 className="text-start">From here you can get to:</h6>
                            <Navigation
                                locationData={locationData}
                                currentArea={currentLocation.area}
                                onNavigate={handleNavigate}
                            />
                        </div>
                        <div id="room-items-area" className="w-100 item-container">
                            <h6 className="text-start">Items at this location:</h6>
                            <RoomItems
                                items={getRoomItems()}
                                onItemDoubleClick={handleRoomItemDoubleClick}
                            />
                        </div>
                    </div>
                    <EncounterCard
                        open={encounterCardOpen}
                        character={char}
                        onClose={handleCloseEncounter}
                        onBeginChat={handleBeginChat}
                    />
                </div>
            </div>
        </div>
    );
};

window.ComicChitchatGame = ComicChitchatGame;

// Render the app after ComicChitchatGame is defined and window data is available
if (document.getElementById('root')) {
    ReactDOM.createRoot(document.getElementById('root')).render(
        React.createElement(ComicChitchatGame, {
            worldItems: worldItems,
            locationData: locationData,
            characterData: characterData,
            rules: rules
        })
    );
}
