/**
 * ThemeManager.js - Theme and phase manager
 * CONSTANT SPEED per phase - focus on exercise/warm-up
 */

import * as THREE from 'three';
import { WinterTheme } from './WinterTheme.js';
import { NightTheme } from './NightTheme.js';
import { UrbanTheme } from './UrbanTheme.js';

export class ThemeManager {
    constructor(scene, game) {
        this.scene = scene;
        this.game = game;

        // Tempo de jogo em segundos
        this.gameTime = 0;

        // Duration of each phase in seconds (4 minutes = 240 seconds)
        this.phaseDuration = 240;

        // Fases com configurações de dificuldade
        // Velocidade atual é "5" (máxima) - ajustando para dar mais tempo de reação
        // obstacleInterval maior = mais espaço entre obstáculos
        this.phases = [
            {
                name: 'WARM UP',
                theme: 'winter',
                speed: 0.25,           // Velocidade 1 - bem lenta
                obstacleInterval: 90,  // Muito espaçado - tempo de sobra
                obstacleChance: 0.5
            },
            {
                name: 'LIGHT CARDIO',
                theme: 'night',
                speed: 0.28,           // Velocidade 2
                obstacleInterval: 80,  // Bem espaçado
                obstacleChance: 0.55
            },
            {
                name: 'MEDIUM CARDIO',
                theme: 'urban',
                speed: 0.32,           // Velocidade 3
                obstacleInterval: 70,  // Espaçado
                obstacleChance: 0.6
            },
            {
                name: 'INTENSE',
                theme: 'urban',
                speed: 0.35,           // Velocidade 4-5 (era 0.55)
                obstacleInterval: 60,  // Moderado (era 40)
                obstacleChance: 0.65
            }
        ];

        this.currentPhase = 1;
        this.currentThemeName = 'winter';
        this.phaseCompleted = false;

        // Temas disponíveis
        this.themes = {
            winter: new WinterTheme(scene),
            night: new NightTheme(scene),
            urban: new UrbanTheme(scene)
        };

        // Decorações ativas
        this.activeDecorations = [];
    }

    applyTheme(themeName) {
        // Limpar decorações anteriores
        this.clearDecorations();

        const theme = this.themes[themeName];
        if (!theme) return;

        this.currentThemeName = themeName;

        // Aplicar cores do tema
        this.scene.background = new THREE.Color(theme.skyColor);
        this.scene.fog.color.setHex(theme.fogColor);
        this.scene.fog.near = theme.fogNear || 50;
        this.scene.fog.far = theme.fogFar || 200;

        // Atualizar cores do chão
        if (this.game.track) {
            this.game.track.setGroundColor(theme.groundColor);
        }

        // Criar decorações do tema
        this.createDecorations(theme);
    }

    createDecorations(theme) {
        const decorations = theme.createDecorations();

        decorations.forEach(decoration => {
            this.scene.add(decoration);
            this.activeDecorations.push(decoration);
        });
    }

    clearDecorations() {
        this.activeDecorations.forEach(decoration => {
            this.scene.remove(decoration);

            // Limpar geometria e materiais
            decoration.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        });

        this.activeDecorations = [];
    }

    update(delta) {
        if (this.phaseCompleted) return;

        // Atualizar tempo de jogo
        this.gameTime += delta;

        // Verificar se fase atual terminou
        const phaseEndTime = this.currentPhase * this.phaseDuration;

        if (this.gameTime >= phaseEndTime) {
            // Fase terminou!
            this.phaseCompleted = true;
            this.game.onPhaseComplete();
            return;
        }

        // Atualizar decorações (movimento)
        this.activeDecorations.forEach(decoration => {
            if (decoration.userData.update) {
                decoration.userData.update(this.game.speed);
            }

            // Mover decorações com a pista
            decoration.position.z += this.game.speed;

            // Reciclar se passou do jogador
            if (decoration.position.z > 50) {
                decoration.position.z -= 400;
            }
        });
    }

    startPhase(phaseNumber) {
        this.currentPhase = phaseNumber;
        this.phaseCompleted = false;

        const phaseIndex = Math.min(phaseNumber - 1, this.phases.length - 1);
        const phase = this.phases[phaseIndex];

        this.applyTheme(phase.theme);
        this.applyDifficulty(phase);
    }

    applyDifficulty(phase) {
        // Velocidade CONSTANTE para a fase inteira (não aumenta)
        this.game.speed = phase.speed;
        this.game.baseSpeed = phase.speed;
        this.game.maxSpeed = phase.speed; // Mesmo valor = constante

        // Atualizar configurações de obstáculos
        if (this.game.obstacleManager) {
            this.game.obstacleManager.minSpawnInterval = phase.obstacleInterval;
            this.game.obstacleManager.spawnChance = phase.obstacleChance;
        }
    }

    getCurrentPhaseConfig() {
        const phaseIndex = Math.min(this.currentPhase - 1, this.phases.length - 1);
        return this.phases[phaseIndex];
    }

    getPhaseProgress() {
        // Progresso dentro da fase atual baseado no tempo
        const phaseStartTime = (this.currentPhase - 1) * this.phaseDuration;
        const timeInPhase = this.gameTime - phaseStartTime;

        return Math.min(1, Math.max(0, timeInPhase / this.phaseDuration));
    }

    getPhaseTimeRemaining() {
        const phaseEndTime = this.currentPhase * this.phaseDuration;
        return Math.max(0, phaseEndTime - this.gameTime);
    }

    getCurrentPhaseName() {
        const phase = this.phases[this.currentPhase - 1];
        return phase ? phase.name : 'UNKNOWN';
    }

    getTotalPhases() {
        return this.phases.length;
    }

    nextPhase() {
        if (this.currentPhase < this.phases.length) {
            this.startPhase(this.currentPhase + 1);
            return true;
        }
        return false;
    }

    reset() {
        this.gameTime = 0;
        this.currentPhase = 1;
        this.phaseCompleted = false;
        this.startPhase(1);
    }
}
