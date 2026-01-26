/**
 * Indicator.js - Indicadores de ação (Jump!, Duck!, Left!, Right!)
 */

import { ObstacleType } from '../game/Obstacle.js';

export class Indicator {
    constructor(soundManager) {
        this.soundManager = soundManager;
        this.element = document.getElementById('action-indicator');
        this.iconSvg = document.getElementById('indicator-svg');
        this.iconImg = document.getElementById('indicator-img'); // New image element
        this.textEl = document.getElementById('indicator-text');

        this.currentType = null;
        this.isVisible = false;

        // Image paths
        this.images = {
            jump: '/assets/action_jump.png',
            duck: '/assets/action_duck.png',
            side: '/assets/action_side.png' // Shared for left/right
        };
    }

    show(obstacleType, lane) {
        let indicatorType;
        let imageKey;
        let text;

        switch (obstacleType) {
            case ObstacleType.JUMP:
                indicatorType = 'jump';
                imageKey = 'jump';
                text = 'JUMP!';
                break;
            case ObstacleType.DUCK:
                indicatorType = 'duck';
                imageKey = 'duck';
                text = 'DUCK!';
                break;
            case ObstacleType.SIDE:
                imageKey = 'side';

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

        // Only update if changed
        if (this.currentType !== indicatorType) {
            this.currentType = indicatorType;

            // Hide SVG, Show Image
            this.iconSvg.classList.add('hidden');
            this.iconImg.classList.remove('hidden');

            this.iconImg.src = this.images[imageKey];

            // For side, we might need to flip the image for left/right transparency or just use the same arrow?
            // User requested "our 3d character" image. 
            // If the image is the character jumping/ducking/strafing.
            // For side, if it's the same image, we might want to mirror it via CSS if it has directionality.
            // Let's assume the 'side' image is generic or right-facing by default.

            if (indicatorType === 'left') {
                this.iconImg.style.transform = 'scaleX(-1)'; // Mirror for left
            } else {
                this.iconImg.style.transform = 'scaleX(1)';
            }

            this.textEl.textContent = text;
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
