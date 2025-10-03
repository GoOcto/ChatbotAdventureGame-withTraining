// audio.js
// Redesigned sound effects using audio files

// Freesound.org -- I made an account with my email

// Store reference to the global Audio constructor before we override it
const HTMLAudio = window.Audio;

export const Audio = {

    // Audio file paths - you'll need to add these files to a /sounds/ directory
    sounds: {
        plunk: '/sounds/item_drop.mp3',           // Item dropped in room
        boop: '/sounds/error_soft.mp3',           // Error/negative feedback
        click: '/sounds/ui_click.mp3',            // UI button clicks
        itemPickup: '/sounds/item_pickup.mp3',    // Item collected
        encounterStart: '/sounds/encounter_start.mp3',  // Friendly encounter
        encounterEvil: '/sounds/encounter_danger.mp3',  // Hostile encounter

        // Ambient sounds for different locations
        ambience: {
            workshop: '/sounds/ambient_workshop.mp3',
            settlement: '/sounds/ambient_settlement.mp3',
            wasteland: '/sounds/ambient_wasteland.mp3',
            cathedral: '/sounds/ambient_cathedral.mp3'
        }
    },

    // Current ambience audio element
    ambienceAudio: null,

    // Play a sound effect
    _playSound: function (audioPath, volume = 0.5) {
        console.log('Playing sound:', audioPath);
        try {
            const audio = new HTMLAudio(audioPath);
            audio.volume = volume;
            audio.play().catch(e => console.warn('Could not play sound:', audioPath, e));
            return audio;
        } catch (e) {
            console.error("Failed to play sound:", audioPath, e);
        }
    },

    // Specific sound effects for game actions
    playPlunk: function () {
        this._playSound(this.sounds.plunk, 0.3);
    },

    playBoop: function () {
        this._playSound(this.sounds.boop, 0.4);
    },

    playClick: function () {
        this._playSound(this.sounds.click, 0.2);
    },

    playItemPickup: function () {
        this._playSound(this.sounds.itemPickup, 0.5);
    },

    playNiceEncounterStart: function () {
        this._playSound(this.sounds.encounterStart, 0.6);
    },

    playEvilEncounterStart: function () {
        this._playSound(this.sounds.encounterEvil, 0.7);
    },

    // Play any sound bite
    playSoundBite: function (mp3url, volume = 0.5) {
        this._playSound(mp3url, volume);
    },

    // Ambient background music/sounds
    beginAmbience: function (locationKey, volume = 0.3) {
        this.stopAmbience(); // Stop any current ambience

        const ambiencePath = this.sounds.ambience[locationKey];
        if (ambiencePath) {
            try {
                this.ambienceAudio = new HTMLAudio(ambiencePath);
                this.ambienceAudio.loop = true;
                this.ambienceAudio.volume = volume;
                this.ambienceAudio.play().catch(e => console.warn('Could not play ambience:', ambiencePath, e));
            } catch (e) {
                console.error("Failed to start ambience:", ambiencePath, e);
            }
        }
    },

    stopAmbience: function () {
        if (this.ambienceAudio) {
            this.ambienceAudio.pause();
            this.ambienceAudio.currentTime = 0;
            this.ambienceAudio = null;
        }
    },

    // Fallback to synthetic sounds if audio files don't exist
    _playFallbackSound: function (frequency, duration, type = 'sine') {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + duration);
        } catch (e) {
            console.error("Failed to play fallback sound:", e);
        }
    }
};