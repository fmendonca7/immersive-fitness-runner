/**
 * Obstacle.js - RECRIADO DO ZERO (Minimal Version)
 * Lógica ultra-simplificada para debug
 */

import * as THREE from 'three';

export const ObstacleType = {
    JUMP: 'jump',
    DUCK: 'duck',
    SIDE: 'side'
};

export class ObstacleManager {
    constructor(scene, game) {
        console.log('🚀 [ObstacleManager] Construtor chamado');
        this.scene = scene;
        this.game = game;

        // Pool pequeno para debug
        this.obstacles = [];
        this.activeObstacles = [];

        // Spawn config - MUITO AGRESSIVO para debug
        this.spawnDistance = -50;  // Mais perto
        this.despawnDistance = 10;
        this.minSpawnInterval = 20; // Spawn a cada 20 unidades
        this.distanceTraveled = 0;

        // Tipos permitidos
        this.allowedTypes = [ObstacleType.JUMP];

        console.log('🎯 [ObstacleManager] Criando pool de obstáculos...');
        this.createObstaclePool();
        console.log(`✅ [ObstacleManager] Pool criado com ${this.obstacles.length} obstáculos`);
    }

    createObstaclePool() {
        // Criar apenas 10 obstáculos no total (3-3-4)
        for (let i = 0; i < 3; i++) {
            const jump = this.createJumpObstacle();
            this.obstacles.push(jump);
            console.log(`📦 [Pool] JUMP obstacle ${i} criado`);
        }
        for (let i = 0; i < 3; i++) {
            const duck = this.createDuckObstacle();
            this.obstacles.push(duck);
            console.log(`📦 [Pool] DUCK obstacle ${i} criado`);
        }
        for (let i = 0; i < 4; i++) {
            const side = this.createSideObstacle();
            this.obstacles.push(side);
            console.log(`📦 [Pool] SIDE obstacle ${i} criado`);
        }
    }

    createJumpObstacle() {
        const group = new THREE.Group();

        // Caixa VERMELHA GIGANTE
        const box = new THREE.Mesh(
            new THREE.BoxGeometry(8, 2, 2), // Bem grande
            new THREE.MeshBasicMaterial({ color: 0xFF0000 })
        );
        box.position.y = 1;
        group.add(box);

        group.visible = false;
        group.userData = {
            type: ObstacleType.JUMP,
            active: false,
            mainMesh: box
        };

        this.scene.add(group);
        return group;
    }

    createDuckObstacle() {
        const group = new THREE.Group();

        // Barra VERDE GIGANTE
        const bar = new THREE.Mesh(
            new THREE.BoxGeometry(10, 1, 1),
            new THREE.MeshBasicMaterial({ color: 0x00FF00 })
        );
        bar.position.y = 2;
        group.add(bar);

        group.visible = false;
        group.userData = {
            type: ObstacleType.DUCK,
            active: false,
            mainMesh: bar
        };

        this.scene.add(group);
        return group;
    }

    createSideObstacle() {
        const group = new THREE.Group();

        // Bloco AZUL GIGANTE
        const block = new THREE.Mesh(
            new THREE.BoxGeometry(3, 4, 2),
            new THREE.MeshBasicMaterial({ color: 0x0000FF })
        );
        block.position.y = 2;
        group.add(block);

        group.visible = false;
        group.userData = {
            type: ObstacleType.SIDE,
            active: false,
            lane: -1,
            mainMesh: block
        };

        this.scene.add(group);
        return group;
    }

    setAllowedTypes(actions) {
        console.log('🎮 [ObstacleManager] setAllowedTypes chamado:', actions);
        this.allowedTypes = [];
        if (actions.includes('jump')) this.allowedTypes.push(ObstacleType.JUMP);
        if (actions.includes('duck')) this.allowedTypes.push(ObstacleType.DUCK);
        if (actions.includes('side')) this.allowedTypes.push(ObstacleType.SIDE);
        if (this.allowedTypes.length === 0) this.allowedTypes.push(ObstacleType.JUMP);
        console.log('✅ [ObstacleManager] Tipos permitidos:', this.allowedTypes);
    }

    update(delta, speed) {
        // Atualizar distância percorrida
        this.distanceTraveled += speed;

        // Tentar spawnar a cada intervalo
        if (this.distanceTraveled >= this.minSpawnInterval) {
            console.log('🎲 [Update] Tentando spawnar obstáculo...');
            this.spawnObstacle();
            this.distanceTraveled = 0;
        }

        // Mover obstáculos ativos
        for (let i = this.activeObstacles.length - 1; i >= 0; i--) {
            const obstacle = this.activeObstacles[i];
            obstacle.position.z += speed;

            // Despawnar se passou do jogador
            if (obstacle.position.z > this.despawnDistance) {
                console.log(`🗑️ [Update] Despawnando obstáculo em z=${obstacle.position.z.toFixed(1)}`);
                obstacle.visible = false;
                obstacle.userData.active = false;
                this.activeObstacles.splice(i, 1);
            }
        }
    }

    spawnObstacle() {
        // Selecionar tipo aleatório dos permitidos
        const typeIndex = Math.floor(Math.random() * this.allowedTypes.length);
        const selectedType = this.allowedTypes[typeIndex];

        console.log(`🎯 [Spawn] Tipo selecionado: ${selectedType}`);

        // Buscar obstáculo inativo do pool
        const available = this.obstacles.find(obs =>
            obs.userData.type === selectedType && !obs.userData.active
        );

        if (!available) {
            console.warn(`⚠️ [Spawn] Nenhum obstáculo ${selectedType} disponível no pool!`);
            return;
        }

        // Ativar obstáculo
        available.userData.active = true;
        available.visible = true;
        available.position.z = this.spawnDistance;
        available.position.x = 0; // Centro

        // Se for SIDE, colocar em uma lane
        if (selectedType === ObstacleType.SIDE) {
            const lane = Math.random() < 0.5 ? 0 : 1;
            available.position.x = lane === 0 ? -2 : 2;
            available.userData.lane = lane;
            console.log(`   Lane: ${lane} (x=${available.position.x})`);
        }

        this.activeObstacles.push(available);

        console.log(`✅ [Spawn] Obstáculo ${selectedType} spawnado em z=${this.spawnDistance}, visible=${available.visible}`);
        console.log(`   Total ativos: ${this.activeObstacles.length}`);
    }

    getNextObstacle() {
        // Retornar o obstáculo mais próximo do jogador
        if (this.activeObstacles.length === 0) return null;

        let closest = this.activeObstacles[0];
        for (const obs of this.activeObstacles) {
            if (obs.position.z > closest.position.z) {
                closest = obs;
            }
        }
        return closest;
    }

    checkCollision(player) {
        // Collision simplificada - não implementado
        return false;
    }

    applyScenarioStyle(colors) {
        console.log('🎨 [ObstacleManager] applyScenarioStyle chamado (ignorado)');
        // Não fazemos nada - mantemos cores puras para debug
    }

    reset() {
        console.log('🔄 [ObstacleManager] Reset chamado');
        this.distanceTraveled = 0;
        this.activeObstacles.forEach(obs => {
            obs.visible = false;
            obs.userData.active = false;
        });
        this.activeObstacles = [];
    }
}
