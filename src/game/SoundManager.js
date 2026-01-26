/**
 * SoundManager.js
 * Handles audio synthesis for game effects using Web Audio API.
 * No external files required.
 */

export class SoundManager {
    constructor() {
        this.ctx = null;
        this.initialized = false;
        this.volume = 0.3; // Global volume
    }

    /**
     * Initialize Audio Context on first user interaction
     * Browsers block audio until user interaction.
     */
    init() {
        if (this.initialized) return;

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.initialized = true;
            console.log('Audio initialized');
        } catch (e) {
            console.error('Web Audio API not supported', e);
        }
    }

    /**
     * Helper to create an oscillator node
     */
    createOscillator(type, freq, startTime, duration) {
        if (!this.ctx) return null;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        return { osc, gain };
    }

    /**
     * Play "Whoosh Up" for JUMP
     * Elastic rising sound
     */
    playJump() {
        if (!this.initialized) this.init();
        if (!this.ctx) return;

        const t = this.ctx.currentTime;
        const { osc, gain } = this.createOscillator('triangle', 150, t, 0);

        // Pitch: start low, quick rise, slight drop at peak (elastic feel)
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(600, t + 0.15);
        osc.frequency.linearRampToValueAtTime(400, t + 0.3);

        // Volume
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(this.volume * 0.8, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

        osc.start(t);
        osc.stop(t + 0.3);

        this.playNoise(t, 0.2, 'highpass', 500);
    }

    /**
     * Play "Swoosh Down" for DUCK
     * Sharp descending sound
     */
    playDuck() {
        if (!this.initialized) this.init();
        if (!this.ctx) return;

        const t = this.ctx.currentTime;
        const { osc, gain } = this.createOscillator('sine', 400, t, 0);

        // Pitch: sharp drop
        osc.frequency.setValueAtTime(500, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.2);

        // Volume
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(this.volume, t + 0.02); // fast attack
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

        osc.start(t);
        osc.stop(t + 0.2);

        // Wind noise for speed
        this.playNoise(t, 0.2, 'lowpass', 600);
    }

    /**
     * Play "Slide" for SIDE (Left/Right)
     * Short, noisy movement
     */
    playSide() {
        if (!this.initialized) this.init();
        if (!this.ctx) return;

        const t = this.ctx.currentTime;

        // Use noise mainly for the "slide" friction sound
        this.playNoise(t, 0.15, 'bandpass', 800);

        // Subtle underlying tone
        const { osc, gain } = this.createOscillator('sine', 200, t, 0);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(this.volume * 0.4, t + 0.02);
        gain.gain.linearRampToValueAtTime(0, t + 0.15);

        osc.start(t);
        osc.stop(t + 0.15);
    }

    /**
     * Play "Tada" for Phase Complete
     */
    playPhaseComplete() {
        if (!this.initialized) this.init();
        if (!this.ctx) return;

        const t = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major Arpeggio (C E G C)

        notes.forEach((freq, i) => {
            const start = t + i * 0.1;
            const { osc, gain } = this.createOscillator('square', freq, start, 0);

            gain.gain.setValueAtTime(this.volume * 0.5, start);
            gain.gain.exponentialRampToValueAtTime(0.01, start + 0.4);

            osc.start(start);
            osc.stop(start + 0.4);
        });
    }

    /**
     * Helper to generate noise buffer
     */
    playNoise(startTime, duration, filterType = 'lowpass', filterFreq = 1000) {
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = filterType;
        noiseFilter.frequency.value = filterFreq;

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(this.volume * 0.5, startTime);
        noiseGain.gain.linearRampToValueAtTime(0, startTime + duration);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);

        noise.start(startTime);
    }
}
