/**
 * HUD.js - Interface de usuário durante o jogo
 */

export class HUD {
    constructor(game) {
        this.game = game;

        // Elementos do DOM
        this.timeEl = document.getElementById('time');
        this.caloriesEl = document.getElementById('calories');
        this.progressFill = document.getElementById('progress-fill');
        this.progressMarker = document.getElementById('progress-marker');
        this.phaseNameEl = document.getElementById('phase-name');
    }

    update() {
        const scoreManager = this.game.scoreManager;
        const themeManager = this.game.themeManager;

        // Atualizar tempo
        this.timeEl.textContent = scoreManager.getFormattedTime();

        // Atualizar calorias
        this.caloriesEl.textContent = scoreManager.getFormattedCalories();

        // Atualizar progresso da fase
        if (themeManager) {
            const progress = themeManager.getPhaseProgress();
            this.progressFill.style.width = `${progress * 100}%`;
            this.progressMarker.style.left = `${progress * 100}%`;

            // Atualizar nome da fase com tempo restante
            const phaseName = themeManager.getCurrentPhaseName();
            const currentPhase = themeManager.currentPhase;
            const totalPhases = themeManager.getTotalPhases();
            const timeRemaining = this.formatTime(themeManager.getPhaseTimeRemaining());

            this.phaseNameEl.textContent = `FASE ${currentPhase}/${totalPhases} - ${phaseName} (${timeRemaining})`;
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}
