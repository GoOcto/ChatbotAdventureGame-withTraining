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

  init(initialWorld) {
    this.State = initialWorld;
    this.State = {
      ...this.State,
      playerAvatar: null,
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
    const locationData = this.State.locationData;
    const currentLocation = this.State.currentLocation;
    locationData[currentLocation].items.push(itemId);
    Audio.playPlunk();
  },

  removeItemFromRoom(itemId) {
    const locationData = this.State.locationData;
    const currentLocation = this.State.currentLocation;
    locationData[currentLocation].items = locationData[currentLocation].items.filter(i => i !== itemId);
  },

  addItemToBackpack(itemId) {
    const backpackItems = this.State.backpackItems;

    if (backpackItems.length >= 12) {
      console.log('Backpack is full. Cannot add item:', itemId);
      Audio.playBoop();
      return false;
    }

    if (!backpackItems.includes(itemId)) {
      backpackItems.push(itemId);
    }
    Audio.playItemPickup();
    return true;
  },

  removeItemFromBackpack(itemId) {
    const backpackItems = this.State.backpackItems;
    this.State.backpackItems = backpackItems.filter(i => i !== itemId);
  },

  addItemToOfferings(itemId) {
    if (!this.State.currentOfferings.includes(itemId)) {
      this.State.currentOfferings.push(itemId);
    }
  },

  removeItemFromOfferings(itemId) {
    this.State.currentOfferings = this.State.currentOfferings.filter(i => i !== itemId);
  },

  conditionalResponses(char) {
    let response = '';
    char.trades.forEach(trade => {
      if (trade.take.length > 0 && trade.give.length > 0) {
        if (trade.take[0] === trade.give[0]) {
          response += `- *IF* the player offers you '${trade.take.join(' and ')}', you will look at it and give it back to them. `;
          response += trade.result + '\n';
        }
        else {
          response += `- *IF* the player offers you '${trade.take.join(' and ')}',`;
          response += ` you will give them '${trade.give.join(' and ')}' in return. `;
          response += trade.result + '\n';
        }
      }
      if (trade.take.length > 0 && trade.give.length === 0) {
        response += `- *IF* the player offers you '${trade.take.join(' and ')}', you will give them nothing in return. `;
        response += trade.result + '\n';
      }
      if (trade.take.length === 0 && trade.give.length > 0) {
        response += `- You *MIGHT* give to the player '${trade.give.join(' and ')}' in specific circumstances. `;
        response += trade.result + '\n';
      }
    });
    return response;
  },

  removeTradeFromCandidates(charId, itemId) {
    const char = this.State.characterData[charId];
    if (!char) return;
    char.trades = char.trades.filter(trade => !(trade.take.includes(itemId)));
  },

  currentSystemPrompt(char) {
    return `
${char.ai_personality.general}

Your primary goal is: ${char.ai_personality.goal}

--- Conditional Responses ---
${Game.conditionalResponses(char)}

${rules}`;
  }

};


document.addEventListener('DOMContentLoaded', function () {

  Game.load(InitialWorld);

  if (Game.State.playerAvatar === null) {
    UI.showIntroductionScreen(Game);
    Game.save();
  }
  else {
    UI.hideIntroductionScreen(Game);
  }

  UI.initDOM(Game);
  UI.setTitle(Game);
  UI.setupEventListeners(Game);

  function applyJSONResponse(obj) {
    const selectedCharacter = Game.State.selectedCharacter;
    if (!selectedCharacter) return;

    console.log('Applying JSON response for trade:', obj);

    // This happens immediately, before the animation starts.
    if (Array.isArray(obj.take)) {
      obj.take.forEach(itemId => {
        Game.removeItemFromOfferings(itemId);
        Game.removeTradeFromCandidates(selectedCharacter, itemId);
      });
    }

    UI.performTradeAnimation(Game, obj, () => {
      // This code runs once all animations have finished.
      if (Array.isArray(obj.give)) {
        obj.give.forEach(itemId => {
          Game.addItemToOfferings(itemId);
        });
        UI.renderOfferings(Game);
      }

      Game.save();
      console.log('Trade animation complete. Game saved.');
    });
  }

  function addMessageToState(text, sender) {
    if (!Game.State.chatMessages) Game.State.chatMessages = [];
    let metaText = '';

    if (sender === 'bot') {

      // look for 'TRADE'
      const tradeMatch = text.match(/TRADE/g);
      if (tradeMatch) {

        try {
          console.log('Found TRADE keyword');
          metaText = 'TRADE';
          let offering = Game.State.currentOfferings[0];

          const selectedCharacter = Game.State.selectedCharacter;
          if (selectedCharacter) {
            const char = Game.State.characterData[selectedCharacter];
            let tradeFound = false;

            for (const trade of char.trades) {
              const offeringInTake = trade.take.length > 0 && trade.take.includes(offering);
              if (offeringInTake) {
                // we have a match, apply the trade
                console.log('Applying trade object:', trade);
                applyJSONResponse(trade);

                if (trade && trade.new_goal) {
                  char.ai_personality.goal = trade.new_goal;
                  console.log(`${char.name}'s new goal is: ${trade.new_goal}`);
                  Game.save();
                }
                tradeFound = true;
                break;
              }
            }

            if (!tradeFound) {
              console.log('No matching trade found for offering:', offering);
            }
          }
        } catch (e) {
          console.error('Failed to parse one or more JSON objects from bot message:', e);
        }

        // Remove TRADE keyword and any delimited variations from the text
        // For now I need to see the full text
        // text = text.replace(/\bTRADE\b/g, ''); // Remove standalone TRADE
        // text = text.replace(/[\[\{\(\|\*\-]*\s*TRADE\s*[\]\}\)\|\*\-]*/g, ''); // Remove delimited TRADE
        // text = text.replace(/\s+/g, ' ').trim(); // Clean up extra whitespace
      }

    } else {
      Game.State.chatMessages = [];
      let offerMatch = text.match(/(\[OFFER: [^\]]+\])/g);
      if (offerMatch) {
        metaText = offerMatch.join(' ');
        offerMatch.forEach(str => {
          text = text.replace(str, '').trim();
        });
      }
    }

    Game.State.chatMessages.push({ sender, text, metaText });
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
      console.log('Begin chat button clicked');
      Audio.playNiceEncounterStart();
      const selectedCharacter = Game.State.selectedCharacter;
      Game.State.chatOpen = true;
      console.log('Set chatOpen to true, chatId before API call:', Game.State.chatId);
      const char = Game.State.characterData[selectedCharacter];

      console.log('Selected character for chat:', char);
      const system_prompt = Game.currentSystemPrompt(char);

      try {
        const resetResp = await axios.post(`http://${window.location.hostname}:${window.location.port}/api/reset`, {
          system_prompt: system_prompt
        });
        Game.State.chatId = resetResp.data.chat_id;
        console.log('API call successful, chatId set to:', Game.State.chatId);
      } catch (err) {
        console.log('API call failed:', err);
        Game.State.chatId = null;
      }

      // Hide encounter header, show chat content
      if (UI.encounterHeaderDiv) UI.encounterHeaderDiv.style.display = 'none';
      if (UI.chatContentDiv) UI.chatContentDiv.style.display = '';

      // Enable the input field now that chat is open
      if (UI.userInputDiv) {
        console.log('Begin chat: Enabling input field directly');
        UI.userInputDiv.disabled = false;
        UI.userInputDiv.placeholder = 'Type your message...';
      }

      UI.beginChatBtn.classList.add('disabled');
      console.log('About to save game state - chatOpen:', Game.State.chatOpen, ', chatId:', Game.State.chatId);
      Game.save();
      if (UI.chatMessagesDiv) {
        UI.chatMessagesDiv.innerHTML = `<div class='message bot'>Encounter initiated with <b>${char.name}</b>.</div>`;
      }
    }
  });

});