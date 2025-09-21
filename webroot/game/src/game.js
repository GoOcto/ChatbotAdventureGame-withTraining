// game.js
// the game engine and state management

export const Game = {
    State: null,

    _deepCopy(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    init(initialWorld) {
        this.State = this._deepCopy(initialWorld);
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
        // convert the list of id's into full item objects
        let items = [];
        this.State.backpackItems.forEach(id => {
            items.push(this.State.worldItems[id]);
        });
        return items;
    },

    getRoomItems() {
        // convert the list of id's into full item objects
        let items = [];
        this.State.locationData[this.State.currentLocation].items.forEach(id => {
            items.push(this.State.worldItems[id]);
        });
        return items;
    },

    getCurrentOfferings() {
        // convert the list of id's into full item objects
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
        console.log('Adding item to backpack:', itemId);
        const backpackItems = this.State.backpackItems;
        if (!backpackItems.includes(itemId)) {
            backpackItems.push(itemId);
        }
    },

    removeItemFromBackpack(itemId) {
        console.log('Removing item from backpack:', itemId);
        const backpackItems = this.State.backpackItems;
        this.State.backpackItems = backpackItems.filter(i => i !== itemId);
    },

    addItemToOfferings(itemId) {
        console.log('Adding item to offerings:', itemId);
        const currentLocation = this.State.currentLocation;
        if (!this.State.currentOfferings.includes(itemId)) {
            this.State.currentOfferings.push(itemId);
        }
    },

    removeItemFromOfferings(itemId) {
        console.log('Removing item from offerings:', itemId);
        const currentLocation = this.State.currentLocation;
        this.State.currentOfferings = this.State.currentOfferings.filter(i => i !== itemId);
    }

}
