// code.js
// main entry point for the game and game engine/state management

// --- MAIN GAME LOGIC & UI INTEGRATION ---
import { Audio } from './audio.js';
import { rules } from './rules.js';
import { UI } from './ui.js';
import { InitialWorld } from './world.js';


// --- GAME ENGINE & STATE MANAGEMENT ---
export const Game = {
  State: null,

  _deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  init(initialWorld) {
    this.State = this._deepCopy(initialWorld);
    this.State = {
      ...this.State,
      selectedCharacter: null,
      chatOpen: false,
      chatId: null,
      currentOfferings: [],
      chatMessages: [],
    };
  },

  save() {
    localStorage.setItem('ChatbotGame', JSON.stringify(this.State));
  },

  load(initialWorld) {
    const saved = localStorage.getItem('ChatbotGame');
    if (saved) {
      try {
        this.State = JSON.parse(saved);
      } catch (e) {
        this.init(initialWorld);
      }
    } else {
      this.init(initialWorld);
    }
  },

  getBackpackItems() {
    let items = [];
    this.State.backpackItems.forEach(id => {
      items.push(this.State.worldItems[id]);
    });
    return items;
  },

  getRoomItems() {
    let items = [];
    this.State.locationData[this.State.currentLocation].items.forEach(id => {
      items.push(this.State.worldItems[id]);
    });
    return items;
  },

  getCurrentOfferings() {
    let items = [];
    this.State.currentOfferings.forEach(id => {
      items.push(this.State.worldItems[id]);
    });
    return items;
  },

  addItemToRoom(itemId) {
    console.log('Adding item to room:', itemId);
    const locationData = this.State.locationData;
    const currentLocation = this.State.currentLocation;
    locationData[currentLocation].items.push(itemId);
  },

  removeItemFromRoom(itemId) {
    console.log('Removing item from room:', itemId);
    const locationData = this.State.locationData;
    const currentLocation = this.State.currentLocation;
    locationData[currentLocation].items = locationData[currentLocation].items.filter(i => i !== itemId);
  },

  addItemToBackpack(itemId) {
    const backpackItems = this.State.backpackItems;

    // --- NEW: Check if backpack is full (limit of 5) ---
    if (backpackItems.length >= 5) {
      console.log('Backpack is full. Cannot add item:', itemId);
      Audio.playBoop();

      return false; // --- NEW: Signal that the item was not added ---
    }

    console.log('Adding item to backpack:', itemId);
    if (!backpackItems.includes(itemId)) {
      backpackItems.push(itemId);
    }
    return true; // --- NEW: Signal that the item was added successfully ---
  },

  removeItemFromBackpack(itemId) {
    console.log('Removing item from backpack:', itemId);
    const backpackItems = this.State.backpackItems;
    this.State.backpackItems = backpackItems.filter(i => i !== itemId);
  },

  addItemToOfferings(itemId) {
    console.log('Adding item to offerings:', itemId);
    if (!this.State.currentOfferings.includes(itemId)) {
      this.State.currentOfferings.push(itemId);
    }
  },

  removeItemFromOfferings(itemId) {
    console.log('Removing item from offerings:', itemId);
    this.State.currentOfferings = this.State.currentOfferings.filter(i => i !== itemId);
  }
};


document.addEventListener('DOMContentLoaded', function () {

  Game.load(InitialWorld);

  UI.initDOM(Game);
  UI.setTitle(Game);
  UI.setupEventListeners(Game);

  function applyJSONResponse(obj) {
    const characterData = Game.State.characterData;
    const selectedCharacter = Game.State.selectedCharacter;
    let success = false;
    console.log('AI JSON response', obj);
    console.log('Selected character:', selectedCharacter);
    if (!selectedCharacter) return;

    // Handle 'take' (add to character.items)
    if (Array.isArray(obj.take)) {
      obj.take.forEach(itemId => {
        console.log('Processing take item:', itemId);
        console.log('Selected character before take:', characterData[selectedCharacter]);
        let success = false;
        if (!characterData[selectedCharacter].items.includes(itemId)) {
          const el = UI.offeringsDiv.querySelector(`[data-item="${itemId}"]`);
          if (el) {
            characterData[selectedCharacter].items.push(itemId);
            Game.removeItemFromOfferings(itemId);
            Game.save();
            UI.animateItemTransferToCharacter(el, () => {
              UI.renderOfferings(Game);
            });
            success = true;
          }
        }
        if (success) {
          console.log('Successfully took item:', itemId);
        } else {
          console.log('Failed to take item:', itemId);
        }
      });
    }

    let timeout = 0;
    if (success == true) timeout = 620;

    setTimeout(() => {
      // Handle 'give' (remove from character.items)
      if (Array.isArray(obj.give)) {
        obj.give.forEach(itemId => {
          console.log('Processing give item:', itemId);
          let success = false;
          const idx = characterData[selectedCharacter].items.indexOf(itemId);
          if (idx !== -1) {
            characterData[selectedCharacter].items.splice(idx, 1);
            console.log('Giving item to player:', itemId);
            if (!UI.offeringsDiv.querySelector(`[data-item="${itemId}"]`)) {
              Game.addItemToOfferings(itemId);
              UI.renderOfferings(Game)
              Game.save();
              const el = UI.offeringsDiv.querySelector(`[data-item="${itemId}"]`);
              if (el) {
                UI.animateItemTransferFromCharacter(el);
              }
              success = true;
            }
          }
          if (success) {
            console.log('Successfully gave item:', itemId);
          } else {
            console.log('Failed to give item:', itemId);
          }
        });
      };
    }, timeout);
  }

  function addMessageToState(text, sender) {
    if (!Game.State.chatMessages) Game.State.chatMessages = [];
    let faded = '';

    if (sender === 'bot') {
      // Use the global flag 'g' to find all JSON-like strings
      const jsonMatches = text.match(/\{[^}]*\}/g);

      if (jsonMatches && jsonMatches.length > 0) {
        const mergedObj = {};

        try {
          // 1. Parse each JSON string and merge it into a single object
          jsonMatches.forEach(jsonString => {
            const parsedObj = JSON.parse(jsonString);

            // Merge properties, specifically concatenating arrays for 'give' and 'take'
            // identical list elements overwrite each other
            for (const key in parsedObj) {
              if (Array.isArray(parsedObj[key])) {
                if (!mergedObj[key]) {
                  mergedObj[key] = [];
                }
                mergedObj[key] = Array.from(new Set([...mergedObj[key], ...parsedObj[key]]));
              } else {
                mergedObj[key] = parsedObj[key];
              }
            }
          });

          // 2. Remove all found JSON strings from the display text
          jsonMatches.forEach(jsonString => {
            text = text.replace(jsonString, '').trim();
          });

          // Display all merged JSON objects in the faded text
          faded = `<div style="color:#bbb;font-size:0.8em;margin-top:4px;">${jsonMatches.join(' ')}</div>`;

          // 3. Apply the final, merged JSON object to the game state
          applyJSONResponse(mergedObj);

        } catch (e) {
          console.error('Failed to parse one or more JSON objects from bot message:', e);
        }
      }
    } else {
      Game.State.chatMessages = [];
      let offerMatch = text.match(/(\[OFFER: [^\]]+\])/g);
      if (offerMatch) {
        faded = `<div style="color:#bbb;font-size:0.8em;margin-top:4px;">${offerMatch.join(' ')}</div>`;
        offerMatch.forEach(str => {
          text = text.replace(str, '').trim();
        });
      }
    }

    Game.State.chatMessages.push({ sender, text, faded });
    Game.save();
  }

  function addMessage(text, sender) {
    addMessageToState(text, sender);
    UI.renderChatMessages(Game);
  }

  UI.chatFormDiv.addEventListener('submit', async function (e) {
    e.preventDefault();
    let text = UI.userInputDiv.value.trim();
    const offerItems = Array.from(UI.offeringsDiv.querySelectorAll('.backpack-item')).map(el => el.dataset.item);
    if (offerItems.length > 0) {
      text += (text ? ' ' : '') + offerItems.map(item => `[OFFER: ${item}]`).join(' ');
    }
    if (!text && offerItems.length === 0) return;
    addMessage(text, 'user');
    UI.userInputDiv.value = '';
    const submitBtn = UI.chatFormDiv.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    console.log('Submitting to chat API with chatId:', Game.State.chatId);
    try {
      if (!Game.State.chatId) {
        addMessage('Error: No chat session. Please select a character.', 'bot');
        if (submitBtn) submitBtn.disabled = false;
        return;
      }
      const response = await axios.post(`http://${window.location.hostname}:${window.location.port}/api/chat/${Game.State.chatId}`, { prompt: text });
      if (response.data.reply) {
        addMessage(response.data.reply, 'bot');
      } else {
        addMessage('No response from bot.', 'bot');
      }
    } catch (err) {
      addMessage('Error: Could not reach chatbot API.', 'bot');
    }
    if (submitBtn) submitBtn.disabled = false;
  });

  UI.renderAll(Game);

  document.addEventListener('click', async function (e) {
    if (e.target && e.target.id === 'begin-chat-btn') {
      const selectedCharacter = Game.State.selectedCharacter;
      console.log('Begin Chat button clicked');
      console.log('Selected character:', selectedCharacter);
      Game.State.chatOpen = true;
      const char = Game.State.characterData[selectedCharacter];
      let inventoryList = char.items.length > 0 ? char.items.join(', ') : '--none--';
      let wantedList = char.wants.length > 0 ? char.wants.join(', ') : '--none--';
      let system_prompt = `${rules}

// -- Your Current Location--
${Game.State.locationData[Game.State.currentLocation].name}
${Game.State.locationData[Game.State.currentLocation].description}

// -- Character Details --
Name: ${char.name}
Personality:
${char.personality}

// ----- Desired Items ----
${wantedList}

// ----- Your Inventory ----
${inventoryList}
`;
      try {
        const resetResp = await axios.post(`http://${window.location.hostname}:${window.location.port}/api/reset`, {
          system_prompt: system_prompt
        });
        Game.State.chatId = resetResp.data.chat_id;
      } catch (err) {
        Game.State.chatId = null;
      }
      UI.chatUiDiv.style.display = '';
      UI.beginChatBtn.classList.add('disabled');
      Game.save();
      if (UI.chatMessagesDiv) {
        UI.chatMessagesDiv.innerHTML = `<div class='message bot'>Encounter initiated with <b>${char.name}</b>.</div>`;
      }
    }
  });

});