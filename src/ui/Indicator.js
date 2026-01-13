/**
 * Indicator.js - Indicadores de ação (Jump!, Duck!, Left!, Right!)
 */

import { ObstacleType } from '../game/Obstacle.js';

export class Indicator {
    constructor() {
        this.element = document.getElementById('action-indicator');
        this.iconSvg = document.getElementById('indicator-svg');
        this.textEl = document.getElementById('indicator-text');

        this.currentType = null;
        this.isVisible = false;

        // SVG paths para os ícones
        this.icons = {
            jump: `
        <circle cx="50" cy="20" r="8" fill="currentColor"/>
        <path d="M30 85 L40 55 L50 70 L60 55 L70 85" stroke="currentColor" stroke-width="4" fill="none"/>
        <path d="M35 45 L50 30 L65 45" stroke="currentColor" stroke-width="4" fill="none"/>
        <path d="M25 60 L35 50" stroke="currentColor" stroke-width="3" fill="none"/>
        <path d="M75 60 L65 50" stroke="currentColor" stroke-width="3" fill="none"/>
      `,
            duck: `
        <circle cx="50" cy="35" r="8" fill="currentColor"/>
        <path d="M35 90 L45 70 L50 75 L55 70 L65 90" stroke="currentColor" stroke-width="4" fill="none"/>
        <path d="M40 55 L50 50 L60 55" stroke="currentColor" stroke-width="4" fill="none"/>
        <path d="M30 65 L40 60" stroke="currentColor" stroke-width="3" fill="none"/>
        <path d="M70 65 L60 60" stroke="currentColor" stroke-width="3" fill="none"/>
        <path d="M45 48 L45 70" stroke="currentColor" stroke-width="3" fill="none"/>
        <path d="M55 48 L55 70" stroke="currentColor" stroke-width="3" fill="none"/>
      `,
            left: `
        <circle cx="50" cy="20" r="8" fill="currentColor"/>
        <path d="M40 85 L45 55 L50 60 L55 55 L60 85" stroke="currentColor" stroke-width="4" fill="none"/>
        <path d="M50 35 L50 50" stroke="currentColor" stroke-width="4" fill="none"/>
        <path d="M35 55 L45 45" stroke="currentColor" stroke-width="3" fill="none"/>
        <path d="M65 55 L55 45" stroke="currentColor" stroke-width="3" fill="none"/>
        <path d="M20 50 L35 50 M20 50 L28 42 M20 50 L28 58" stroke="currentColor" stroke-width="3" fill="none"/>
      `,
            right: `
        <circle cx="50" cy="20" r="8" fill="currentColor"/>
        <path d="M40 85 L45 55 L50 60 L55 55 L60 85" stroke="currentColor" stroke-width="4" fill="none"/>
        <path d="M50 35 L50 50" stroke="currentColor" stroke-width="4" fill="none"/>
        <path d="M35 55 L45 45" stroke="currentColor" stroke-width="3" fill="none"/>
        <path d="M65 55 L55 45" stroke="currentColor" stroke-width="3" fill="none"/>
        <path d="M80 50 L65 50 M80 50 L72 42 M80 50 L72 58" stroke="currentColor" stroke-width="3" fill="none"/>
      `
        };
    }

    show(obstacleType, lane) {
        let indicatorType;
        let text;

        switch (obstacleType) {
            case ObstacleType.JUMP:
                indicatorType = 'jump';
                text = 'JUMP!';
                break;
            case ObstacleType.DUCK:
                indicatorType = 'duck';
                text = 'DUCK!';
                break;
            case ObstacleType.SIDE:
                // Se obstáculo está na lane esquerda (0), ir para direita
                // Se obstáculo está na lane direita (1), ir para esquerda
                if (lane === 0) {
                    indicatorType = 'right';
                    text = 'RIGHT!';
                } else {
                    indicatorType = 'left';
                    text = 'LEFT!';
                }
                break;
            default:
                return;
        }

        // Só atualizar se mudou
        if (this.currentType !== indicatorType) {
            this.currentType = indicatorType;
            this.iconSvg.innerHTML = this.icons[indicatorType];
            this.textEl.textContent = text;

            // Atualizar classes de cor
            this.element.className = 'action-indicator ' + indicatorType;
        }

        if (!this.isVisible) {
            this.element.classList.remove('hidden');
            this.isVisible = true;
        }
    }

    hide() {
        if (this.isVisible) {
            this.element.classList.add('hidden');
            this.isVisible = false;
            this.currentType = null;
        }
    }
}
