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
    char.trades = char.trades.filter(trade => trade.take.includes(itemId) || trade.give.includes(itemId));
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


function showIntroductionScreen() {
  // Create overlay div
  const introDiv = document.querySelector('#introduction-screen');

  const introText = document.querySelector('#intro-text');
  introText.innerHTML = Game.State.introductionText;

  // Avatar selection
  const avatarOptions = Game.State.avatarOptions;
  const avatarRow = document.querySelector('#avatar-row');

  avatarRow.querySelectorAll('.avatar-box').forEach(avatarBox => {
    console.log('for existing avatar box:', avatarBox);

    avatarBox.onmouseenter = () => avatarBox.style.borderColor = '#2a9d8f';
    avatarBox.onmouseleave = () => avatarBox.style.borderColor = '#444';
    avatarBox.onclick = () => {
      const filename = avatarBox.querySelector('img').src.split('/').pop();
      console.log('Avatar selected:', avatarBox, introDiv);
      Game.State.playerAvatar = `/characters/${filename}`;
      document.getElementById('player-avatar').innerHTML = `<img src='/characters/${filename}' class='image-fluid'>`;
      introDiv.remove();
      UI.renderAll(Game);
    };
  });

}

document.addEventListener('DOMContentLoaded', function () {

  Game.load(InitialWorld);

  if (Game.State.playerAvatar === null) {
    showIntroductionScreen();
    Game.save();
  }
  else {
    const introDiv = document.querySelector('#introduction-screen');
    introDiv.remove();
  }

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
        const el = UI.offeringsDiv.querySelector(`[data-item="${itemId}"]`);
        if (el) {
          Game.removeTradeFromCandidates(selectedCharacter, itemId);
          Game.save();
          UI.animateItemTransferToCharacter(el, () => {
            UI.renderOfferings(Game);
          });
          success = true;
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
          console.log('Giving item to player:', itemId);
          Game.addItemToOfferings(itemId);
          UI.renderOfferings(Game)
          Game.save();
          const el = UI.offeringsDiv.querySelector(`[data-item="${itemId}"]`);
          if (el) {
            UI.animateItemTransferFromCharacter(el);
          }
          console.log('Successfully gave item:', itemId);
        });
      };
    }, timeout);
  }

  function addMessageToState(text, sender) {
    if (!Game.State.chatMessages) Game.State.chatMessages = [];
    let faded = '';

    if (sender === 'bot') {

      // look for 'TRADE'
      const tradeMatch = text.match(/TRADE/g);
      if (tradeMatch) {

        try {
          console.log('Found TRADE keyword');
          faded = `<div style="color:#bbb;font-size:0.8em;margin-top:4px;">${tradeMatch.join(' ')}</div>`;

          // find the matching trade object in the selected character's trades
          // we need to look at what is in the offerings and match it to a trade
          // then we need to apply that trade
          let tradeObj = { take: [], give: [] };

          let offering = Game.State.currentOfferings[0];

          const selectedCharacter = Game.State.selectedCharacter;
          if (selectedCharacter) {
            const char = Game.State.characterData[selectedCharacter];
            char.trades.forEach(trade => {

              const offeringInGive = trade.give.length > 0 && trade.give.includes(offering);
              const offeringInTake = trade.take.length > 0 && trade.take.includes(offering);

              if (offeringInGive || offeringInTake) {
                tradeObj = trade;
              }
            });
          }
          console.log('Applying trade object:', tradeObj);
          applyJSONResponse(tradeObj);
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
      Audio.playNiceEncounterStart();
      const selectedCharacter = Game.State.selectedCharacter;
      Game.State.chatOpen = true;
      const char = Game.State.characterData[selectedCharacter];

      console.log('Selected character for chat:', char);
      const system_prompt = Game.currentSystemPrompt(char);

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