// audio.js
// sound effects


export const Audio = {

    _playSound: function (frequency, duration, type = 'sine') {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + duration);
        } catch (e) {
            console.error("Failed to play sound:", e);
        }
    },

    playPlunk: function () {
        this._playSound(300, 0.1, 'triangle'); // Medium pitch, short
    },

    playBoop: function () {
        this._playSound(150, 0.2, 'sine'); // Low pitch, short
    },

    playClick: function () {
        this._playSound(800, 0.05, 'triangle'); // High pitch, very short
    },

    playItemPickup: function () {
        this._playSound(600, 0.3, 'sine'); // Medium-high pitch
    },

    playNiceEncounterStart: function () {
        this._playSound(400, 0.5, 'square'); // Medium pitch, longer
    },

    playEvilEncounterStart: function () {
        this._playSound(100, 0.5, 'sawtooth'); // Low, tense, longer
    },

    playSoundBite: function (mp3url) {
        const audio = new Audio(mp3url);
        audio.play();
    },

    beginAmbience: function (mp3url) {
        this.ambienceAudio = new Audio(mp3url);
        this.ambienceAudio.loop = true;
        this.ambienceAudio.play();
    },
    stopAmbience: function () {
        this.ambienceAudio.pause();
        this.ambienceAudio.currentTime = 0;
    }

};
