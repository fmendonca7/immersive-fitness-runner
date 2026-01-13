/**
 * Player.js - Controle do jogador
 * Gerencia posição nas lanes, pulo, abaixar e animações
 */

export class Player {
    constructor(game) {
        this.game = game;

        // Posição nas lanes (0 = esquerda, 1 = direita)
        this.lane = 0; // Começa na esquerda
        this.lanePositions = [-2, 2]; // Posições X das lanes

        // Estado do jogador
        this.isJumping = false;
        this.isDucking = false;
        this.targetX = this.lanePositions[this.lane];
        this.currentX = this.targetX;

        // Física do pulo
        this.jumpHeight = 2.5;
        this.jumpDuration = 0.6;
        this.jumpTimer = 0;
        this.baseHeight = 1.6; // Altura dos olhos
        this.currentHeight = this.baseHeight;

        // Altura quando abaixado
        this.duckHeight = 0.8;

        // Velocidade de transição lateral
        this.lateralSpeed = 12;

        // Hitbox para colisão
        this.hitbox = {
            width: 0.8,
            height: 1.6,
            x: this.currentX,
            y: this.currentHeight
        };
    }

    moveLeft() {
        if (this.lane > 0) {
            this.lane--;
            this.targetX = this.lanePositions[this.lane];
            this.game.scoreManager.addAction('sideStep');
        }
    }

    moveRight() {
        if (this.lane < this.lanePositions.length - 1) {
            this.lane++;
            this.targetX = this.lanePositions[this.lane];
            this.game.scoreManager.addAction('sideStep');
        }
    }

    jump() {
        if (!this.isJumping && !this.isDucking) {
            this.isJumping = true;
            this.jumpTimer = 0;
            this.game.scoreManager.addAction('jump');
        }
    }

    duck() {
        if (!this.isJumping && !this.isDucking) {
            this.isDucking = true;
            this.game.scoreManager.addAction('duck');
        }
    }

    standUp() {
        this.isDucking = false;
    }

    reset() {
        this.lane = 0;
        this.targetX = this.lanePositions[this.lane];
        this.currentX = this.targetX;
        this.isJumping = false;
        this.isDucking = false;
        this.jumpTimer = 0;
        this.currentHeight = this.baseHeight;
        this.updateCamera();
    }

    update(delta) {
        // Movimento lateral suave
        if (this.currentX !== this.targetX) {
            const diff = this.targetX - this.currentX;
            const move = this.lateralSpeed * delta;

            if (Math.abs(diff) < move) {
                this.currentX = this.targetX;
            } else {
                this.currentX += Math.sign(diff) * move;
            }
        }

        // Animação do pulo (curva senoidal)
        if (this.isJumping) {
            this.jumpTimer += delta;
            const progress = this.jumpTimer / this.jumpDuration;

            if (progress >= 1) {
                this.isJumping = false;
                this.jumpTimer = 0;
                this.currentHeight = this.baseHeight;
            } else {
                // Curva senoidal para pulo natural
                this.currentHeight = this.baseHeight + Math.sin(progress * Math.PI) * this.jumpHeight;
            }
        } else if (this.isDucking) {
            // Abaixar suavemente
            this.currentHeight = THREE.MathUtils.lerp(this.currentHeight, this.duckHeight, 0.3);
        } else {
            // Voltar à altura normal
            this.currentHeight = THREE.MathUtils.lerp(this.currentHeight, this.baseHeight, 0.2);
        }

        // Atualizar hitbox
        this.hitbox.x = this.currentX;
        this.hitbox.y = this.currentHeight;
        this.hitbox.height = this.isDucking ? 0.8 : 1.6;

        // Atualizar câmera
        this.updateCamera();
    }

    updateCamera() {
        const camera = this.game.camera;

        // Posição da câmera (primeira pessoa)
        camera.position.x = this.currentX;
        camera.position.y = this.currentHeight;

        // Leve inclinação baseada no movimento
        const tiltAmount = (this.targetX - this.currentX) * 0.05;
        camera.rotation.z = tiltAmount;

        // Olhar para frente
        camera.lookAt(this.currentX, this.currentHeight, -100);
    }

    getHitbox() {
        // Quando pulando: os "pés" do jogador sobem do chão
        // currentHeight é a altura dos olhos, então os pés estão ~1.6m abaixo
        // Quando o jogador pula, a altura dos olhos aumenta, e os pés também sobem

        let minY, maxY;

        if (this.isJumping) {
            // Durante o pulo, os pés sobem do chão
            // A altura extra é: currentHeight - baseHeight
            const jumpOffset = this.currentHeight - this.baseHeight;
            minY = jumpOffset; // Pés sobem do chão
            maxY = this.currentHeight + 0.3; // Topo da cabeça
        } else if (this.isDucking) {
            // Quando abaixado, o jogador fica bem baixo
            minY = 0;
            maxY = 0.7; // Jogador abaixado fica com ~0.7m de altura
        } else {
            // Em pé normal
            minY = 0;
            maxY = 1.9; // Altura total em pé
        }

        return {
            minX: this.hitbox.x - this.hitbox.width / 2,
            maxX: this.hitbox.x + this.hitbox.width / 2,
            minY: minY,
            maxY: maxY
        };
    }
}

// Import THREE para MathUtils
import * as THREE from 'three';
