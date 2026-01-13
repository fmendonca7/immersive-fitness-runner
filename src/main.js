/**
 * Immersive Fitness Runner - Entry Point
 */

import { Game } from './game/Game.js';

// Inicializa o jogo quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();

    // Expor para debug no console
    window.game = game;
});
