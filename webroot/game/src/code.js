// code.js
// main entry point for the game

import { Game } from './game.js';
import { rules } from './rules.js';
import { UI } from './ui.js';
import { InitialWorld } from './world.js';

// main game logic should work with any customized world.js file
document.addEventListener('DOMContentLoaded', function () {

  Game.load(InitialWorld);
  UI.initDOM(Game);
  UI.setupEventListeners(Game);

  function applyJSONResponse(obj) {

    const characterData = Game.State.characterData;
    const selectedCharacter = Game.State.selectedCharacter;

    console.log('AI JSON response', obj);
    console.log('Selected character:', selectedCharacter);

    if (!selectedCharacter) return;

    // Handle 'take' (add to character.items)
    if (Array.isArray(obj.take)) {
      obj.take.forEach(item => {
        console.log('Processing take item:', item);
        console.log('Selected character before take:', characterData[selectedCharacter]);
        let success = false;
        if (!characterData[selectedCharacter].items.includes(item)) {
          const el = UI.offeringsDiv.querySelector(`[data-item="${item}"]`);
          if (el) {
            // the character does NOT already have the item, and the item is in the offerings area
            // so complete the transfer
            characterData[selectedCharacter].items.push(item);
            Game.removeItemFromOfferings(item);
            el.remove();
            success = true;
            Game.save();
            UI.renderOfferings(Game);
          }
        }
        if (success) {
          console.log('Successfully took item:', item);
        } else {
          console.log('Failed to take item:', item);
        }
      });
    }

    // Handle 'give' (remove from character.items)
    if (Array.isArray(obj.give)) {
      obj.give.forEach(item => {
        console.log('Processing give item:', item);
        let success = false;
        const idx = characterData[selectedCharacter].items.indexOf(item);
        if (idx !== -1) {
          characterData[selectedCharacter].items.splice(idx, 1);
          console.log('Giving item to player:', item);

          if (!UI.offeringsDiv.querySelector(`[data-item="${item}"]`)) {
            Game.addItemToOfferings(item);
            Game.save();
            UI.renderOfferings(Game);
            success = true;
          }
        }
        if (success) {
          console.log('Successfully gave item:', item);
        } else {
          console.log('Failed to give item:', item);
        }
      });
    }

  }

  // Add a message to the game state queue
  function addMessageToState(text, sender) {
    if (!Game.State.chatMessages) Game.State.chatMessages = [];
    let faded = '';
    if (sender === 'bot') {
      let jsonMatch = text.match(/\{[^}]*\}/);
      if (jsonMatch) {
        try {
          const obj = JSON.parse(jsonMatch[0]);
          faded = `<div style="color:#bbb;font-size:13px;margin-top:4px;">${jsonMatch[0]}</div>`;
          text = text.replace(`<|>${jsonMatch[0]}`, '').trim();
          applyJSONResponse(obj);
        } catch (e) {
          console.error('Failed to parse JSON from bot message:', e);
        }
      }
    } else {
      Game.State.chatMessages = [];
      let offerMatch = text.match(/(\[OFFER: [^\]]+\])/g);
      if (offerMatch) {
        faded = `<div style="color:#bbb;font-size:13px;margin-top:4px;">${offerMatch.join(' ')}</div>`;
        offerMatch.forEach(str => {
          text = text.replace(str, '').trim();
        });
      }
    }
    Game.State.chatMessages.push({ sender, text, faded });
    Game.save();
  }

  // Add a message (queue + UI)
  function addMessage(text, sender) {
    addMessageToState(text, sender);
    UI.renderChatMessages(Game);
  }

  // Add event listener for chat form submission
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
    // Disable submit button until response
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
    // Re-enable submit button after response
    if (submitBtn) submitBtn.disabled = false;
  });

  UI.renderAll(Game);

  // Add event listener for Initiate Chat button
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
      // Show chat UI and offerings area
      UI.chatUiDiv.style.display = '';
      UI.beginChatBtn.classList.add('disabled');
      Game.save();

      if (UI.chatMessagesDiv) {
        UI.chatMessagesDiv.innerHTML = `<div class='message bot'>Encounter initiated with <b>${char.name}</b>.</div>`;
      }
    }
  });

});
