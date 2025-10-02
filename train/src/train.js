// Global variables
let trainingData = [];
let currentIndex = 0;
let worldRules = '';
let worldCharacters = {};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    loadWorldData();
});

// Tab switching functionality
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(tabName + '-tab').classList.add('active');
    event.target.classList.add('active');
}

function updateStatus(message) {
    document.getElementById('statusText').textContent = message;
}

// World Data Tab Functions
async function refreshWorldData() {
    await loadWorldData();
}

function selectCharacter() {
    const characterId = document.getElementById('characterSelect').value;
    if (!characterId || !worldCharacters[characterId]) {
        clearWorldDataDisplay();
        return;
    }

    const character = worldCharacters[characterId];
    displayWorldCharacter(character, characterId);
}

function displayWorldCharacter(character, characterId) {
    document.getElementById('worldCharacterId').value = characterId;
    document.getElementById('worldCharacterName').value = character.name || '';
    document.getElementById('worldCharacterDesc').value = character.description || '';

    // Use ai_personality goal if available, otherwise use direct goal field
    const goal = character.ai_personality?.goal || character.goal || '';
    document.getElementById('worldPrimaryGoal').value = goal;

    displayWorldTrades(character.trades || []);

    const systemPrompt = generateSystemPromptFromWorldData(character);
    document.getElementById('worldSystemPrompt').textContent = systemPrompt;
}

function displayWorldTrades(trades) {
    const container = document.getElementById('worldTradesContainer');
    container.innerHTML = '';

    if (trades.length === 0) {
        container.innerHTML = '<p>No trades defined for this character.</p>';
        return;
    }

    trades.forEach((trade, index) => {
        const tradeDiv = document.createElement('div');
        tradeDiv.className = 'world-trade-display';

        let tradeFlow = '';
        if (trade.take && trade.give) {
            if (trade.take.length > 0 && trade.give.length > 0) {
                if (trade.take[0] === trade.give[0]) {
                    tradeFlow = 'EXAMINE: ' + trade.take.join(', ') + ' → return same item';
                } else {
                    tradeFlow = 'TRADE: ' + trade.take.join(', ') + ' → ' + trade.give.join(', ');
                }
            } else if (trade.take.length > 0) {
                tradeFlow = 'CONSUME: ' + trade.take.join(', ') + ' → nothing';
            } else if (trade.give.length > 0) {
                tradeFlow = 'GIVE: ' + trade.give.join(', ');
            }
        }

        let innerHTML = '<div class="trade-flow">' + tradeFlow + '</div>';
        innerHTML += '<div class="trade-result">' + (trade.result || '') + '</div>';
        if (trade.new_goal) {
            innerHTML += '<div class="trade-result">New Goal: ' + trade.new_goal + '</div>';
        }

        tradeDiv.innerHTML = innerHTML;
        container.appendChild(tradeDiv);
    });
}

function clearWorldDataDisplay() {
    document.getElementById('worldCharacterId').value = '';
    document.getElementById('worldCharacterName').value = '';
    document.getElementById('worldCharacterDesc').value = '';
    document.getElementById('worldPrimaryGoal').value = '';
    document.getElementById('worldTradesContainer').innerHTML = '';
    document.getElementById('worldSystemPrompt').textContent = '';
}

function populateCharacterSelect() {
    const select = document.getElementById('characterSelect');
    select.innerHTML = '<option value="">Select a character...</option>';

    Object.entries(worldCharacters).forEach(([id, character]) => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = character.name + ' (' + id + ')';
        select.appendChild(option);
    });
}

// Training Data Tab Functions
function loadFile() {
    document.getElementById('fileInput').click();
}

document.getElementById('fileInput').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const content = e.target.result;
            const lines = content.trim().split('\n');
            trainingData = lines.map(line => JSON.parse(line));

            currentIndex = 0;
            updateTrainingNavigation();
            displayTrainingItem();
            updateStatus('Loaded ' + trainingData.length + ' training data points');
        } catch (error) {
            updateStatus('Error loading file: ' + error.message);
            console.error('Error loading training data:', error);
        }
    };
    reader.readAsText(file);
});

function displayTrainingItem() {
    if (!trainingData[currentIndex]) return;

    const item = trainingData[currentIndex];
    displayMessages(item.messages);
    analyzeConversation(item);
}

function displayMessages(messages) {
    const container = document.getElementById('messagesContainer');
    container.innerHTML = '';

    messages.forEach((message, index) => {
        if (message.role === 'system') return;

        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ' + message.role;

        let innerHTML = '<div class="message-header">' + message.role.toUpperCase() + '</div>';
        innerHTML += '<textarea class="message-content" onchange="updateMessage(' + index + ', this.value)">' + message.content + '</textarea>';

        messageDiv.innerHTML = innerHTML;
        container.appendChild(messageDiv);
    });
}

function analyzeConversation(item) {
    const systemMessage = item.messages.find(m => m.role === 'system');

    if (systemMessage) {
        const parsed = parseSystemPrompt(systemMessage.content);

        document.getElementById('detectedCharacter').value = parsed.characterName || 'Unknown';
        document.getElementById('originalSystemPrompt').value = systemMessage.content;
        document.getElementById('parsedState').value = parsed.primaryGoal || 'No goal detected';

        displayDetectedTrades(item.messages, parsed);
    } else {
        document.getElementById('detectedCharacter').value = 'No system prompt';
        document.getElementById('originalSystemPrompt').value = '';
        document.getElementById('parsedState').value = '';
        document.getElementById('detectedTrades').innerHTML = '<p>No system prompt found.</p>';
    }
}

function displayDetectedTrades(messages, parsed) {
    const container = document.getElementById('detectedTrades');
    container.innerHTML = '';

    const tradeOffers = [];
    messages.forEach((message, index) => {
        if (message.role === 'user' && message.content.includes('[OFFER:')) {
            const offerMatch = message.content.match(/\[OFFER:\s*(\w+)\]/);
            if (offerMatch) {
                tradeOffers.push({
                    messageIndex: index,
                    item: offerMatch[1],
                    context: message.content.substring(0, 100)
                });
            }
        }
    });

    if (parsed.trades && parsed.trades.length > 0) {
        parsed.trades.forEach(trade => {
            const tradeDiv = document.createElement('div');
            tradeDiv.className = 'detected-trade';
            let innerHTML = '<strong>System:</strong> Take: [' + trade.take.join(', ') + '] → Give: [' + trade.give.join(', ') + ']<br>';
            innerHTML += 'Result: ' + trade.result;
            tradeDiv.innerHTML = innerHTML;
            container.appendChild(tradeDiv);
        });
    }

    tradeOffers.forEach(offer => {
        const tradeDiv = document.createElement('div');
        tradeDiv.className = 'detected-trade';
        let innerHTML = '<strong>Offer:</strong> ' + offer.item + '<br>';
        innerHTML += 'Context: ' + offer.context + '...';
        tradeDiv.innerHTML = innerHTML;
        container.appendChild(tradeDiv);
    });

    if ((parsed.trades?.length || 0) === 0 && tradeOffers.length === 0) {
        container.innerHTML = '<p>No trades detected in this conversation.</p>';
    }
}

function updateTrainingNavigation() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const counter = document.getElementById('itemCounter');

    if (trainingData.length === 0) {
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        counter.textContent = 'No data loaded';
        return;
    }

    prevBtn.disabled = currentIndex <= 0;
    nextBtn.disabled = currentIndex >= trainingData.length - 1;
    counter.textContent = (currentIndex + 1) + ' of ' + trainingData.length;
}

function previousItem() {
    if (currentIndex > 0) {
        currentIndex--;
        displayTrainingItem();
        updateTrainingNavigation();
    }
}

function nextItem() {
    if (currentIndex < trainingData.length - 1) {
        currentIndex++;
        displayTrainingItem();
        updateTrainingNavigation();
    }
}

function updateMessage(index, content) {
    if (trainingData[currentIndex] && trainingData[currentIndex].messages[index]) {
        trainingData[currentIndex].messages[index].content = content;
    }
}

function addMessagePair() {
    if (!trainingData[currentIndex]) return;

    const userMessage = {
        role: 'user',
        content: 'New user message...'
    };

    const assistantMessage = {
        role: 'assistant',
        content: 'New assistant response...'
    };

    trainingData[currentIndex].messages.push(userMessage, assistantMessage);
    displayTrainingItem();
}

function removeLastMessagePair() {
    if (!trainingData[currentIndex] || trainingData[currentIndex].messages.length < 2) return;

    trainingData[currentIndex].messages.splice(-2, 2);
    displayTrainingItem();
}

function saveFile() {
    if (trainingData.length === 0) {
        updateStatus('No training data to save');
        return;
    }

    const jsonlContent = trainingData.map(item => JSON.stringify(item)).join('\n');
    const blob = new Blob([jsonlContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'training_data.jsonl';
    a.click();

    URL.revokeObjectURL(url);
    updateStatus('Training data saved');
}

function exportFile() {
    saveFile();
}

// World Data Loading & Parsing
async function loadWorldData() {
    try {
        updateStatus('Loading world data...');

        // Import the world.js module directly
        const worldModule = await import('/game/src/world.js');
        const rulesModule = await import('/game/src/rules.js');

        // Extract the data from the modules
        worldCharacters = worldModule.InitialWorld.characterData;
        worldRules = rulesModule.rules || '';

        populateCharacterSelect();
        updateStatus('World data loaded successfully');
        console.log('Loaded characters:', Object.keys(worldCharacters));

    } catch (error) {
        updateStatus('Error loading world data: ' + error.message);
        console.error('Error loading world data:', error);
    }
}

function generateSystemPromptFromWorldData(character) {
    let prompt = 'You are ' + character.name + ', ' + character.description + '\n\n';

    // Use the ai_personality goal if available, otherwise use the direct goal field
    const goal = character.ai_personality?.goal || character.goal;
    if (goal) {
        prompt += 'Your primary goal is: ' + goal + '\n\n';
    }

    if (character.trades && character.trades.length > 0) {
        prompt += '--- Conditional Responses ---\n';
        character.trades.forEach(trade => {
            if (trade.take && trade.give) {
                if (trade.take.length > 0 && trade.give.length > 0) {
                    if (trade.take[0] === trade.give[0]) {
                        prompt += '- *IF* the player offers you \'' + trade.take.join(', ') + '\', you will look at it and give it back to them. ' + trade.result + '\n';
                    } else {
                        prompt += '- *IF* the player offers you \'' + trade.take.join(', ') + '\', you will give them \'' + trade.give.join(', ') + '\' in return. ' + trade.result + '\n';
                    }
                } else if (trade.take.length > 0 && trade.give.length === 0) {
                    prompt += '- *IF* the player offers you \'' + trade.take.join(', ') + '\', you will give them nothing in return. ' + trade.result + '\n';
                } else if (trade.take.length === 0 && trade.give.length > 0) {
                    prompt += '- You *MIGHT* give to the player \'' + trade.give.join(', ') + '\' in specific circumstances. ' + trade.result + '\n';
                }
            }
        });
        prompt += '\n';
    }

    if (worldRules) {
        prompt += '\n' + worldRules;
    }

    return prompt;
}

function parseSystemPrompt(content) {
    const result = {
        characterName: '',
        characterDesc: '',
        primaryGoal: '',
        trades: []
    };

    const nameMatch = content.match(/You are ([^,]+)/);
    if (nameMatch) {
        result.characterName = nameMatch[1].trim();
    }

    const descMatch = content.match(/You are [^,]+,\s*([^.]+)/);
    if (descMatch) {
        result.characterDesc = descMatch[1].trim();
    }

    const goalMatch = content.match(/Your primary goal is:\s*([^\n]+)/);
    if (goalMatch) {
        result.primaryGoal = goalMatch[1].trim();
    }

    const conditionalSection = content.match(/--- Conditional Responses ---\n([\s\S]*?)(?:\n\n|$)/);
    if (conditionalSection) {
        const tradeLines = conditionalSection[1].split('\n').filter(line => line.startsWith('- *IF*'));
        tradeLines.forEach(line => {
            const tradeMatch = line.match(/\*IF\* the player offers you '([^']+)', you will (?:give them '([^']+)' in return|give them nothing|look at it and give it back)/);
            if (tradeMatch) {
                const take = tradeMatch[1].split(', ');
                const give = tradeMatch[2] ? tradeMatch[2].split(', ') : [];
                const result_text = line.split('. ').slice(1).join('. ');

                result.trades.push({
                    take: take,
                    give: give,
                    result: result_text
                });
            }
        });
    }

    return result;
}
