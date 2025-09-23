import { Game } from './code.js';

export const UI = {


    setTitle(game) {
        document.title = game.State.worldName;
    },

    renderBackpack(game) {
        const worldItems = game.State.worldItems;
        UI.backpackDiv.innerHTML = '';
        game.getBackpackItems().forEach((item) => {
            const div = document.createElement('div');
            div.className = 'backpack-item';
            div.setAttribute('draggable', 'true');
            // Always use item ID for data-item
            const itemId = Object.keys(worldItems).find(k => worldItems[k] === item);
            div.setAttribute('data-item', itemId);
            div.setAttribute('title', item.name);
            div.textContent = item.name;
            this.backpackDiv.appendChild(div);
        });
    },

    renderLocationItems(game) {
        const worldItems = game.State.worldItems;
        UI.itemsListDiv.innerHTML = '';
        const locationItems = game.getRoomItems();
        locationItems.forEach((item, id) => {
            const div = document.createElement('div');
            div.className = 'backpack-item';
            div.setAttribute('draggable', 'true');
            // Always use item ID for data-item
            const itemId = Object.keys(worldItems).find(k => worldItems[k] === item);
            div.setAttribute('data-item', itemId);
            div.setAttribute('title', item.name);
            div.textContent = item.name;
            this.itemsListDiv.appendChild(div);
        });
    },

    renderOfferings(game) {
        const worldItems = game.State.worldItems;
        UI.offeringsDiv.innerHTML = '';
        game.State.currentOfferings.forEach(itemId => {
            const item = worldItems[itemId];
            if (!item) return;
            const div = document.createElement('div');
            div.className = 'backpack-item';
            div.setAttribute('draggable', 'true');
            div.setAttribute('data-item', itemId);
            div.setAttribute('title', item.name);
            div.textContent = item.name;
            this.offeringsDiv.appendChild(div);
        });
    },

    renderLocationHeader(game) {
        const locationData = game.State.locationData;
        const currentLocation = game.State.currentLocation;
        const areaData = locationData[currentLocation];
        UI.locationNameDiv.textContent = areaData.name;
        UI.locationDescDiv.innerHTML = `<p>${areaData.description}</p>`;
        if (areaData.people.length > 0) {
            this.locationDescDiv.innerHTML += `<p><em>Characters here:</em></p>`;
        }
        else {
            this.locationDescDiv.innerHTML += `<p><em>No one is here.</em></p>`;
        }
    },

    renderNavigation(game) {
        const locationData = game.State.locationData;
        const currentLocation = game.State.currentLocation;
        const backpackItems = game.State.backpackItems;
        UI.locationNavDiv.innerHTML = '';
        const locationInfo = locationData[currentLocation];
        if (locationInfo && Array.isArray(locationInfo.navigate_to)) {
            locationInfo.navigate_to.forEach(areaID => {
                const areaData = locationData[areaID];
                const hasRequiredItem = areaData.required_item ? backpackItems.includes(areaData.required_item) : true;
                if (areaData.visited || hasRequiredItem) {
                    const btnLi = document.createElement('li');
                    btnLi.className = 'nav-item mb-2';
                    const btn = document.createElement('button');
                    btn.className = 'btn btn-outline-primary w-100';
                    if (locationData[areaID].visited) btn.className += ' visited';
                    btn.textContent = locationData[areaID].name;
                    btn.onclick = function () {
                        game.State.currentLocation = areaID;
                        game.State.chatId = null;
                        game.State.selectedCharacter = null;
                        game.State.chatOpen = false;
                        game.save();
                        UI.renderAll(game);
                    };
                    btnLi.appendChild(btn);
                    this.locationNavDiv.appendChild(btnLi);
                }
            });
        }
    },

    renderEncounterCard(game) {
        if (game.State.selectedCharacter === null) {
            UI.encounterCardDiv.style.display = 'none';
            return;
        }

        const char = game.State.characterData[game.State.selectedCharacter];
        UI.encounterCardDiv.style.display = '';
        UI.encounterAvatarDiv.innerHTML = `<img src="${char.avatar}" alt="${char.name}">`;
        UI.encounterNameDiv.textContent = char.name;
        UI.encounterDescDiv.textContent = char.description || '';
        UI.chatUiDiv.style.display = 'none';
        UI.beginChatBtn.classList.remove('disabled');
        game.save();
    },

    renderLocationAvatars(game) {
        const locationData = game.State.locationData;
        const currentLocation = game.State.currentLocation;
        const characterData = game.State.characterData;
        UI.avatarAreaDiv.innerHTML = '';
        const locationInfo = locationData[currentLocation];
        if (locationInfo && Array.isArray(locationInfo.people)) {
            locationInfo.people.forEach(charID => {
                const char = characterData[charID];
                if (!char) return;
                const avatarDiv = document.createElement('div');
                avatarDiv.className = 'character-avatar';
                avatarDiv.setAttribute('title', char.name);
                avatarDiv.innerHTML = `<img src="${char.avatar}" alt="${char.name}">`;
                UI.avatarAreaDiv.appendChild(avatarDiv);
                avatarDiv.onclick = () => {
                    game.State.selectedCharacter = charID;
                    this.renderEncounterCard(game);
                };
            });
        }
    },

    renderChatMessages(game) {
        console.log('Rendering chat messages', game.State.chatMessages);
        if (game.State.chatOpen !== true) return;

        UI.chatUiDiv.style.display = '';
        UI.chatMessagesDiv.innerHTML = '';
        if (!Array.isArray(game.State.chatMessages)) {
            game.State.chatMessages = [];
        }
        game.State.chatMessages.forEach(msg => {
            const msgDiv = document.createElement('div');
            msgDiv.className = `message ${msg.sender} animate__animated animate__fadeInUp`;
            msgDiv.innerHTML = `<span>${msg.text}</span>${msg.faded}`;
            UI.chatMessagesDiv.appendChild(msgDiv);
        });
    },

    // renderChatMessages() {
    //     UI.chatMessagesDiv.innerHTML = '';
    //     if (!Game.State.chatMessages) return;
    //     Game.State.chatMessages.forEach(msg => {
    //         const msgDiv = document.createElement('div');
    //         msgDiv.className = `message ${msg.sender} animate__animated animate__fadeInUp`;
    //         msgDiv.innerHTML = `<span>${msg.text}</span>${msg.faded}`;
    //         this.chatMessagesDiv.appendChild(msgDiv);
    //     });
    //     this.chatMessagesDiv.scrollTop = this.chatMessagesDiv.scrollHeight;
    // },



    setupDragAndDrop(game) {
        // Event delegation for dragstart, dragend, dblclick
        function handleDragStart(e) {
            const item = e.target;
            if (item.classList.contains('backpack-item')) {
                e.dataTransfer.setData('text/plain', item.dataset.item);
                item.classList.add('dragging');
                console.log('Drag start:', item.dataset.item);
            }
        }
        function handleDragEnd(e) {
            const item = e.target;
            if (item.classList.contains('backpack-item')) {
                item.classList.remove('dragging');
            }
        }
        function handleDblClick(e) {
            const item = e.target;
            if (!item.classList.contains('backpack-item')) return;
            const itemId = item.dataset.item;
            const container = item.parentElement;

            console.log('Double click on item:', itemId, 'in container:', container);

            if (container === UI.offeringsDiv) {
                console.log('Container: OfferingsDiv');
                game.addItemToBackpack(itemId);
                UI.renderBackpack(game);
                game.removeItemFromOfferings(itemId);
                UI.renderOfferings(game);
                game.save();
                return;
            }
            if (container === UI.itemsListDiv) {
                console.log('Container: ItemsListDiv');
                game.removeItemFromRoom(itemId);
                UI.renderLocationItems(game);
                game.addItemToBackpack(itemId);
                UI.renderBackpack(game);
                game.save();
                return;
            }
            if (container === UI.backpackDiv) {
                console.log('Container: BackpackDiv');
                game.removeItemFromBackpack(itemId);
                UI.renderBackpack(game);
                if (UI.chatUiDiv && UI.chatUiDiv.style.display !== 'none') {
                    game.addItemToOfferings(itemId);
                    UI.renderOfferings(game);
                } else {
                    game.addItemToRoom(itemId);
                    UI.renderLocationItems(game);
                }
                game.save();
                return;
            }
        }

        // Remove previous listeners if needed (optional, for safety)
        UI.backpackDiv.ondragstart = null;
        UI.backpackDiv.ondragend = null;
        UI.backpackDiv.ondblclick = null;
        UI.itemsListDiv.ondragstart = null;
        UI.itemsListDiv.ondragend = null;
        UI.itemsListDiv.ondblclick = null;
        UI.offeringsDiv.ondragstart = null;
        UI.offeringsDiv.ondragend = null;
        UI.offeringsDiv.ondblclick = null;

        // Attach event delegation listeners
        UI.backpackDiv.addEventListener('dragstart', handleDragStart);
        UI.backpackDiv.addEventListener('dragend', handleDragEnd);
        UI.backpackDiv.addEventListener('dblclick', handleDblClick);
        UI.itemsListDiv.addEventListener('dragstart', handleDragStart);
        UI.itemsListDiv.addEventListener('dragend', handleDragEnd);
        UI.itemsListDiv.addEventListener('dblclick', handleDblClick);
        UI.offeringsDiv.addEventListener('dragstart', handleDragStart);
        UI.offeringsDiv.addEventListener('dragend', handleDragEnd);
        UI.offeringsDiv.addEventListener('dblclick', handleDblClick);

        // Drop logic (no change, still per-container)
        UI.offeringsDiv.addEventListener('dragover', function (e) { e.preventDefault(); });
        UI.offeringsDiv.addEventListener('drop', function (e) {
            console.log('Drop event on offeringsDiv');
            e.preventDefault();
            const item = e.dataTransfer.getData('text/plain');
            if (item) {
                if (game.State.backpackItems.includes(item)) {
                    game.removeItemFromBackpack(item);
                    UI.renderBackpack(game);
                    game.addItemToOfferings(item);
                    UI.renderOfferings(game);
                    game.save();
                }
            }
        });
        UI.backpackDiv.addEventListener('dragover', function (e) { e.preventDefault(); });
        UI.backpackDiv.addEventListener('drop', function (e) {
            console.log('Drop event on backpackDiv');
            e.preventDefault();
            const item = e.dataTransfer.getData('text/plain');
            if (game.State.currentOfferings.includes(item)) {
                game.removeItemFromOfferings(item);
                UI.renderOfferings(game);
                game.addItemToBackpack(item);
                UI.renderBackpack(game);
                game.save();
                return;
            }
            if (game.State.locationData[game.State.currentLocation].items.includes(item)) {
                game.removeItemFromRoom(item);
                UI.renderLocationItems(game);
                game.addItemToBackpack(item);
                UI.renderBackpack(game);
                game.save();
            }
        });
        UI.itemsListDiv.addEventListener('dragover', function (e) { e.preventDefault(); });
        UI.itemsListDiv.addEventListener('drop', function (e) {
            e.preventDefault();
            const item = e.dataTransfer.getData('text/plain');

            console.log('Drop event on itemsListDiv', { e, item });

            if (game.State.backpackItems.includes(item)) {
                game.removeItemFromBackpack(item);
                UI.renderBackpack(game);
                game.addItemToRoom(item);
                UI.renderLocationItems(game);
                game.save();
                return;
            }
            if (game.State.currentOfferings.includes(item)) {
                game.removeItemFromOfferings(item);
                UI.renderOfferings(game);
                game.addItemToRoom(item);
                UI.renderLocationItems(game);
                game.save();
                return;
            }
        });
    },

    setupEventListeners(game) {

        // The Encounter Card's X is clicked
        if (UI.closeEncounterBtn) {
            UI.closeEncounterBtn.addEventListener('click', () => {
                UI.encounterCardDiv.style.display = 'none';
                game.State.selectedCharacter = null;
                game.State.chatOpen = false;
                game.State.chatId = null;
                UI.renderEncounterCard(game);
                UI.chatUiDiv.style.display = 'none';
                game.save();
            });
        }

        // Prevent dropping items into chat fields
        if (UI.chatFormDiv) {
            UI.chatFormDiv.addEventListener('dragover', function (e) {
                e.preventDefault();
                UI.chatFormDiv.classList.add('drag-over');
            });
            UI.chatFormDiv.addEventListener('dragleave', function (e) {
                UI.chatFormDiv.classList.remove('drag-over');
            });
            UI.chatFormDiv.addEventListener('drop', function (e) {
                e.preventDefault();
                UI.chatFormDiv.classList.remove('drag-over');
            });
        }
        if (UI.userInputDiv) {
            UI.userInputDiv.addEventListener('dragover', function (e) {
                e.preventDefault();
                UI.userInputDiv.classList.add('drag-over');
            });
            UI.userInputDiv.addEventListener('dragleave', function (e) {
                UI.userInputDiv.classList.remove('drag-over');
            });
            UI.userInputDiv.addEventListener('drop', function (e) {
                e.preventDefault();
                UI.userInputDiv.classList.remove('drag-over');
            });
        }

    },

    renderAll(game) {
        console.log('rendering game state UI', game);
        const locationData = game.State.locationData;
        const currentLocation = game.State.currentLocation;
        const chatId = game.State.chatId;
        const selectedCharacter = game.State.selectedCharacter;
        const userInputDiv = UI.userInputDiv;
        const locationInfo = locationData[currentLocation];
        if (locationInfo && locationInfo.background) {
            UI.settingBgDiv.style.backgroundImage = `url('${locationInfo.background}')`;
        }
        else {
            UI.settingBgDiv.style.backgroundImage = 'linear-gradient(0deg, #783c2d 0%, #759595ff 100%)';
        }
        if (selectedCharacter !== null) {
            UI.encounterCardDiv.style.display = '';
        }
        else {
            UI.encounterCardDiv.style.display = 'none';
        }
        if (!chatId) {
            UI.chatUiDiv.style.display = 'none';
            if (selectedCharacter === null) {
                game.State.selectedCharacter = null;
            }
        }
        else {
            UI.chatUiDiv.style.display = '';
            if (userInputDiv) {
                setTimeout(() => { userInputDiv.focus(); }, 0);
            }
        }
        locationInfo.visited = true;
        this.renderNavigation(game);
        this.renderLocationHeader(game);
        this.renderLocationItems(game);
        this.renderLocationAvatars(game);
        this.renderEncounterCard(game);
        this.renderBackpack(game);
        this.renderOfferings(game);
        if (game.State.chatOpen === true)
            this.renderChatMessages(game);
        game.save();
    },

    // ---------------------------
    // DOM references
    settingBgDiv: null,
    locationNameDiv: null,
    locationDescDiv: null,
    locationNavDiv: null,
    avatarAreaDiv: null,
    backpackDiv: null,
    itemsListDiv: null,
    offeringsDiv: null,
    encounterCardDiv: null,
    encounterAvatarDiv: null,
    encounterNameDiv: null,
    encounterDescDiv: null,
    beginChatBtn: null,
    chatUiDiv: null,
    chatMessagesDiv: null,
    chatFormDiv: null,
    userInputDiv: null,
    closeEncounterBtn: null,
    initDOM(game) {
        this.settingBgDiv = document.getElementById('setting-bg');
        this.locationNameDiv = document.getElementById('location-name');
        this.locationDescDiv = document.getElementById('location-desc');
        this.locationNavDiv = document.getElementById('location-nav');
        this.avatarAreaDiv = document.getElementById('location-avatars');
        this.backpackDiv = document.getElementById('backpack');
        this.itemsListDiv = document.getElementById('items-list');
        this.offeringsDiv = document.getElementById('offerings');
        this.encounterCardDiv = document.getElementById('encounter-card');
        this.encounterAvatarDiv = document.getElementById('encounter-avatar');
        this.encounterNameDiv = document.getElementById('encounter-name');
        this.encounterDescDiv = document.getElementById('encounter-desc');
        this.beginChatBtn = document.getElementById('begin-chat-btn');
        this.chatUiDiv = document.getElementById('chat-ui');
        this.chatMessagesDiv = document.getElementById('chat-messages');
        this.chatFormDiv = document.getElementById('chat-form');
        this.userInputDiv = document.getElementById('user-input');
        this.closeEncounterBtn = document.getElementById('close-encounter-btn');

        // place the player's avatar once and only once
        const playerAvatar = document.getElementById('player-avatar');
        const img = document.createElement('img');
        img.src = game.State.playerAvatar;
        img.className = 'image-fluid';
        playerAvatar.appendChild(img);

        // a DOM reload will always reset the chat
        Game.State.chatId = null;
        Game.State.chatOpen = false;

        this.setupDragAndDrop(game);
        this.setupEventListeners(game);
    }
}
