export const UI = {


    setTitle(game) {
        document.title = game.State.worldName;
    },

    renderBackpack(game) {
        const worldItems = game.State.worldItems;
        UI.backpackDiv.innerHTML = '';
        game.State.backpackItems.forEach((itemId) => {
            const item = worldItems[itemId];
            if (!item) return;
            const div = document.createElement('div');
            div.className = 'backpack-item';
            div.setAttribute('draggable', 'true');
            div.setAttribute('data-item', itemId);
            div.setAttribute('title', item);
            div.textContent = item;
            this.backpackDiv.appendChild(div);
        });
    },

    renderLocationItems(game) {
        const worldItems = game.State.worldItems;
        UI.itemsListDiv.innerHTML = '';
        game.State.locationData[game.State.currentLocation].items.forEach((itemId) => {
            const item = worldItems[itemId];
            if (!item) return;
            const div = document.createElement('div');
            div.className = 'backpack-item';
            div.setAttribute('draggable', 'true');
            div.setAttribute('data-item', itemId);
            div.setAttribute('title', item);
            div.textContent = item;
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
            div.setAttribute('title', item);
            div.textContent = item;
            this.offeringsDiv.appendChild(div);
        });
    },

    renderLocationHeader(game) {
        const locationData = game.State.locationData;
        const currentLocation = game.State.currentLocation;
        const areaData = locationData[currentLocation];
        UI.locationNameDiv.textContent = areaData.name;
        UI.locationDescDiv.innerHTML = `<p>${areaData.description}</p>`;
        if (Object.keys(areaData.people).length > 0) {
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
                        const currentLocation = game.State.currentLocation;
                        if (game.State.locationData[currentLocation].onLeave !== undefined) {
                            console.log("Calling onLeave for", game.State.currentLocation);
                            game.State.locationData[currentLocation].onLeave(game);
                        }
                        game.State.currentLocation = areaID;
                        game.State.chatId = null;
                        game.State.selectedCharacter = null;
                        game.State.chatOpen = false;
                        if (game.State.locationData[areaID].onEnter !== undefined) {
                            console.log("Calling onEnter for", areaID);
                            game.State.locationData[areaID].onEnter(game);
                        }
                        game.save();
                        Audio.playClick();
                        UI.renderAll(game);
                    };
                    btnLi.appendChild(btn);
                    this.locationNavDiv.appendChild(btnLi);
                }
            });
        }

        // if (locationInfo && Array.isArray(locationInfo.navigate_to)) {
        //     locationInfo.navigate_to.forEach(areaID => {
        //         const areaData = locationData[areaID];
        //         if (!areaData) return;
        //         const btn = document.createElement('button');
        //         btn.className = 'btn btn-outline-primary';
        //         btn.textContent = areaData.name;
        //         btn.onclick = () => {
        //             game.State.currentLocation = areaID;
        //             game.State.selectedCharacter = null;
        //             this.renderAll(game);
        //         };
        //         if (areaData.visited) btn.classList.add('visited');
        //         if (areaData.requirements) {
        //             let meetsRequirements = true;
        //             areaData.requirements.forEach(req => {
        //                 if (!backpackItems.includes(req)) {
        //                     meetsRequirements = false;
        //                 }
        //             });
        //             if (!meetsRequirements) {
        //                 btn.disabled = true;
        //                 btn.title = `Requires: ${areaData.requirements.join(', ')}`;
        //             }
        //         }
        //         UI.locationNavDiv.appendChild(btn);
        //     });
        // }
    },

    renderEncounterCard(game) {
        if (game.State.selectedCharacter === null) {
            UI.chatUiDiv.style.display = 'none';
            return;
        }

        const char = game.State.characterData[game.State.selectedCharacter];
        UI.chatUiDiv.style.display = '';
        UI.encounterAvatarDiv.innerHTML = `<img src="${char.avatar}" alt="${char.name}">`;
        UI.encounterNameDiv.textContent = char.name;
        UI.encounterDescDiv.textContent = char.description || '';

        // Show encounter header, hide chat content
        if (UI.encounterHeaderDiv) UI.encounterHeaderDiv.style.display = '';
        if (UI.chatContentDiv) UI.chatContentDiv.style.display = 'none';

        UI.beginChatBtn.classList.remove('disabled');
        game.save();
    },

    renderLocationAvatars(game) {
        const locationData = game.State.locationData;
        const currentLocation = game.State.currentLocation;
        const characterData = game.State.characterData;
        UI.avatarAreaDiv.innerHTML = '';
        const locationInfo = locationData[currentLocation];
        if (locationInfo && Object.keys(locationInfo.people).length > 0) {
            Object.keys(locationInfo.people).forEach(charID => {
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
        if (game.State.chatOpen !== true) return;

        UI.chatUiDiv.style.display = '';

        // Hide encounter header and show chat content when chat is open
        if (UI.encounterHeaderDiv) UI.encounterHeaderDiv.style.display = 'none';
        if (UI.chatContentDiv) UI.chatContentDiv.style.display = '';

        // Enable the input when chat is open
        if (UI.userInputDiv) {
            UI.userInputDiv.disabled = false;
            UI.userInputDiv.placeholder = 'Type your message...';
        }

        UI.chatMessagesDiv.innerHTML = '';
        if (!Array.isArray(game.State.chatMessages)) {
            game.State.chatMessages = [];
        }
        game.State.chatMessages.forEach(msg => {
            const msgDiv = document.createElement('div');
            msgDiv.className = `message ${msg.sender} animate__animated animate__fadeInUp`;

            let innerHTML = `<span>${msg.text}</span>`;
            if (msg.metaText) {
                innerHTML += `<div class="meta-text">${msg.metaText}</div>`;
            }
            msgDiv.innerHTML = innerHTML;
            UI.chatMessagesDiv.appendChild(msgDiv);
        });
    },

    animateItemTransferToCharacter(el, oncomplete) {
        const targetEl = document.querySelector('#encounter-avatar');

        if (!targetEl) {
            el.remove();
            return;
        }

        const startRect = el.getBoundingClientRect();
        const endRect = targetEl.getBoundingClientRect();
        const deltaX = endRect.left + (endRect.width / 2) - (startRect.left + startRect.width / 2);
        const deltaY = endRect.top + (endRect.height / 2) - (startRect.top + startRect.height / 2);
        el.style.position = 'absolute';
        el.style.zIndex = '1000'; // High z-index to ensure it animates over other UI

        const keyframes = [
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${deltaX}px, ${deltaY}px) scale(0.2)`, opacity: 0 }
        ];

        const options = {
            duration: 600,
            easing: 'ease-in-out',
            fill: 'forwards'
        };

        const animation = el.animate(keyframes, options);
        animation.finished.then(() => {
            el.remove();
            oncomplete && oncomplete();
        });
    },

    animateItemTransferFromCharacter(el, oncomplete) {
        // 1. Find the destination element
        const startEl = document.querySelector('#encounter-avatar');

        // Gracefully exit if the destination isn't on the page
        if (!startEl) {
            el.remove(); // Clean up the provided element
            if (oncomplete) oncomplete();
            return;
        }

        // 2. Get the start and end coordinates
        const startRect = startEl.getBoundingClientRect();
        const endRect = el.getBoundingClientRect();

        console.log('Animating item transfer from character:', { el, startEl, startRect, endRect });

        // 3. Calculate the distance to travel
        const deltaX = endRect.left + (endRect.width / 2) - (startRect.left + startRect.width / 2);
        const deltaY = endRect.top + (endRect.height / 2) - (startRect.top + startRect.height / 2);

        const keyframes = [
            { transform: `translate(${-deltaX}px, ${-deltaY}px) scale(0.2)`, opacity: 0 },
            { transform: `translate(${-deltaX / 2}px, ${-deltaY / 2 - 50}px) scale(1.2)`, opacity: 1, offset: 0.5 },
            { transform: `translate(0,0) scale(1)`, opacity: 1 }
        ];

        // 5. Define animation options
        const options = {
            duration: 800,
            easing: 'ease-out',
            fill: 'forwards' // Keep it at its final position visually
        };

        // 6. Run the animation
        const animation = el.animate(keyframes, options);

        // 7. After animation, remove the temporary element and call the callback
        animation.finished.then(() => {
            oncomplete && oncomplete();
        });
    },

    performTradeAnimation(game, tradeObj, onComplete) {
        // 1. Handle items the character takes from the player
        if (Array.isArray(tradeObj.take)) {
            tradeObj.take.forEach(itemId => {
                const offeringEl = UI.offeringsDiv.querySelector(`[data-item="${itemId}"]`);
                if (offeringEl) {
                    UI.animateItemTransferToCharacter(offeringEl, () => {
                        UI.renderOfferings(game);
                    });
                }
            });
        }

        // Delay giving items to the player until the 'take' animation is done
        const animationDelay = (tradeObj.take && tradeObj.take.length > 0) ? 620 : 0;

        setTimeout(() => {
            // 2. Handle items the character gives to the player
            if (Array.isArray(tradeObj.give)) {
                tradeObj.give.forEach(itemId => {
                    const tempEl = document.createElement('div');
                    tempEl.className = 'backpack-item';
                    tempEl.textContent = game.State.worldItems[itemId];
                    tempEl.style.position = 'absolute';
                    document.body.appendChild(tempEl);
                    UI.animateItemTransferFromCharacter(tempEl);
                });
            }
            if (onComplete) onComplete();
        }, animationDelay);
    },

    hideIntroductionScreen() {
        const introDiv = document.querySelector('#introduction-screen');
        introDiv.remove();
    },

    showIntroductionScreen(game) {
        // Create overlay div
        const introDiv = document.querySelector('#introduction-screen');

        const introText = document.querySelector('#intro-text');
        introText.innerHTML = game.State.introductionText;

        // Avatar selection
        const avatarOptions = game.State.avatarOptions;
        const avatarRow = document.querySelector('#avatar-row');

        avatarRow.querySelectorAll('.avatar-box').forEach(avatarBox => {
            avatarBox.onmouseenter = () => avatarBox.style.borderColor = '#2a9d8f';
            avatarBox.onmouseleave = () => avatarBox.style.borderColor = '#444';
            avatarBox.onclick = () => {
                const img = avatarBox.querySelector('.avatar-img');
                game.State.playerAvatar = img.src;
                this.hideIntroductionScreen();
                this.renderAll(game);
                game.save();
            };
        });

    },



    setupDragAndDrop(game) {
        // Event delegation for dragstart, dragend, dblclick
        function handleDragStart(e) {
            const item = e.target;
            if (item.classList.contains('backpack-item')) {
                e.dataTransfer.setData('text/plain', item.dataset.item);
                item.style.opacity = '0.5';
            }
        }
        function handleDragEnd(e) {
            const item = e.target;
            if (item.classList.contains('backpack-item')) {
                item.style.opacity = '';
            }
        }
        function handleDblClick(e) {
            const item = e.target;
            if (!item.classList.contains('backpack-item')) return;
            const itemId = item.dataset.item;
            const container = item.parentElement;

            if (container === UI.offeringsDiv) {
                game.removeItemFromOfferings(itemId);
                game.addItemToBackpack(itemId);
                UI.renderOfferings(game);
                UI.renderBackpack(game);
                game.save();
            }
            if (container === UI.itemsListDiv) {
                const success = game.addItemToBackpack(itemId);
                if (success) {
                    game.removeItemFromRoom(itemId);
                    UI.renderLocationItems(game);
                    UI.renderBackpack(game);
                    game.save();
                }
            }
            if (container === UI.backpackDiv) {
                if (game.State.selectedCharacter && game.State.chatOpen) {
                    game.removeItemFromBackpack(itemId);
                    game.addItemToOfferings(itemId);
                    UI.renderBackpack(game);
                    UI.renderOfferings(game);
                    game.save();
                } else {
                    game.removeItemFromBackpack(itemId);
                    game.addItemToRoom(itemId);
                    UI.renderBackpack(game);
                    UI.renderLocationItems(game);
                    game.save();
                }
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
            e.preventDefault();
            const item = e.dataTransfer.getData('text/plain');
            if (item) {
                if (game.State.backpackItems.includes(item)) {
                    game.removeItemFromBackpack(item);
                    game.addItemToOfferings(item);
                    UI.renderBackpack(game);
                    UI.renderOfferings(game);
                    game.save();
                }
            }
        });
        UI.backpackDiv.addEventListener('dragover', function (e) { e.preventDefault(); });
        UI.backpackDiv.addEventListener('drop', function (e) {
            e.preventDefault();
            const itemId = e.dataTransfer.getData('text/plain');
            if (game.State.currentOfferings.includes(itemId)) {
                game.removeItemFromOfferings(itemId);
                game.addItemToBackpack(itemId);
                UI.renderOfferings(game);
                UI.renderBackpack(game);
                game.save();
            }
            if (game.State.locationData[game.State.currentLocation].items.includes(itemId)) {
                const success = game.addItemToBackpack(itemId);
                if (success) {
                    game.removeItemFromRoom(itemId);
                    UI.renderLocationItems(game);
                    UI.renderBackpack(game);
                    game.save();
                }
            }
        });
        UI.itemsListDiv.addEventListener('dragover', function (e) { e.preventDefault(); });
        UI.itemsListDiv.addEventListener('drop', function (e) {
            e.preventDefault();
            const item = e.dataTransfer.getData('text/plain');

            if (game.State.backpackItems.includes(item)) {
                game.removeItemFromBackpack(item);
                game.addItemToRoom(item);
                UI.renderBackpack(game);
                UI.renderLocationItems(game);
                game.save();
            }
            if (game.State.currentOfferings.includes(item)) {
                game.removeItemFromOfferings(item);
                game.addItemToRoom(item);
                UI.renderOfferings(game);
                UI.renderLocationItems(game);
                game.save();
            }
        });
    },

    setupEventListeners(game) {

        // The Encounter Card's X is clicked
        if (UI.closeEncounterBtn) {
            UI.closeEncounterBtn.addEventListener('click', () => {
                game.State.selectedCharacter = null;
                game.State.chatOpen = false;
                game.State.chatId = null;
                game.State.chatMessages = [];
                game.State.currentOfferings = [];
                this.renderAll(game);
                game.save();
            });
        }

        // Prevent dropping items into chat fields
        if (UI.chatFormDiv) {
            UI.chatFormDiv.addEventListener('dragover', function (e) {
                e.preventDefault();
                e.currentTarget.classList.add('drag-over');
            });
            UI.chatFormDiv.addEventListener('dragleave', function (e) {
                e.currentTarget.classList.remove('drag-over');
            });
            UI.chatFormDiv.addEventListener('drop', function (e) {
                e.preventDefault();
                e.currentTarget.classList.remove('drag-over');
            });
        }
        if (UI.userInputDiv) {
            UI.userInputDiv.addEventListener('dragover', function (e) {
                e.preventDefault();
                e.currentTarget.classList.add('drag-over');
            });
            UI.userInputDiv.addEventListener('dragleave', function (e) {
                e.currentTarget.classList.remove('drag-over');
            });
            UI.userInputDiv.addEventListener('drop', function (e) {
                e.preventDefault();
                e.currentTarget.classList.remove('drag-over');
            });
        }

    },

    renderPlayerAvatar(game) {
        const playerAvatar = document.getElementById('player-avatar');
        if (game.State.playerAvatar && playerAvatar) {
            playerAvatar.innerHTML = ''; // Clear any existing content
            const img = document.createElement('img');
            img.src = game.State.playerAvatar;
            img.className = 'img-fluid';
            playerAvatar.appendChild(img);
        }
    },

    renderAll(game) {
        const locationData = game.State.locationData;
        const currentLocation = game.State.currentLocation;
        const chatId = game.State.chatId;
        const selectedCharacter = game.State.selectedCharacter;
        const userInputDiv = UI.userInputDiv;
        const locationInfo = locationData[currentLocation];

        if (locationInfo && locationInfo.background) {
            UI.settingBgDiv.style.backgroundImage = `url(${locationInfo.background})`;
        }
        else {
            UI.settingBgDiv.style.backgroundImage = '';
        }
        if (selectedCharacter !== null) {
            this.renderEncounterCard(game);
        }
        else {
            UI.chatUiDiv.style.display = 'none';
        }
        if (!chatId && !game.State.chatOpen) {
            if (userInputDiv) {
                userInputDiv.disabled = true;
                userInputDiv.placeholder = 'Select a character to begin chatting';
            }
        }
        else {
            if (userInputDiv) {
                userInputDiv.disabled = false;
                userInputDiv.placeholder = 'Type your message...';
            }
        }
        locationInfo.visited = true;
        this.renderPlayerAvatar(game);
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
    encounterHeaderDiv: null,
    encounterAvatarDiv: null,
    encounterNameDiv: null,
    encounterDescDiv: null,
    beginChatBtn: null,
    chatUiDiv: null,
    chatContentDiv: null,
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
        this.encounterCardDiv = document.getElementById('encounter-card'); // This will be null now, but keeping for compatibility
        this.encounterHeaderDiv = document.getElementById('encounter-header');
        this.encounterAvatarDiv = document.getElementById('encounter-avatar');
        this.encounterNameDiv = document.getElementById('encounter-name');
        this.encounterDescDiv = document.getElementById('encounter-desc');
        this.beginChatBtn = document.getElementById('begin-chat-btn');
        this.chatUiDiv = document.getElementById('chat-ui');
        this.chatContentDiv = document.getElementById('chat-content');
        this.chatMessagesDiv = document.getElementById('chat-messages');
        this.chatFormDiv = document.getElementById('chat-form');
        this.userInputDiv = document.getElementById('user-input');
        this.closeEncounterBtn = document.getElementById('close-encounter-btn');

        // place the player's avatar once and only once
        const playerAvatar = document.getElementById('player-avatar');
        if (game.State.playerAvatar && playerAvatar) {
            playerAvatar.innerHTML = ''; // Clear any existing content
            const img = document.createElement('img');
            img.src = game.State.playerAvatar;
            img.className = 'img-fluid';
            playerAvatar.appendChild(img);
        }

        // a DOM reload will always reset the chat
        game.State.chatId = null;
        game.State.chatOpen = false;

        this.setupDragAndDrop(game);
        this.setupEventListeners(game);
    }
}