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
        this.lastDodgeLane = null;

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

        // Main barrier - Bright Neon Red
        const barrierMaterial = new THREE.MeshStandardMaterial({
            color: 0xFF0040, // Bright neon red
            roughness: 0.3,
            metalness: 0.2,
            emissive: 0xFF0040,
            emissiveIntensity: 0.5
        });

        const barrier = new THREE.Mesh(
            new THREE.BoxGeometry(8, 1.5, 1.2),
            barrierMaterial
        );
        barrier.position.y = 0.75;
        barrier.castShadow = true;
        group.add(barrier);

        // Bright yellow hazard stripe
        const stripeMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFF00,
            emissive: 0xFFFF00,
            emissiveIntensity: 0.8
        });
        const stripe = new THREE.Mesh(
            new THREE.BoxGeometry(8.1, 0.2, 1.25),
            stripeMaterial
        );
        stripe.position.y = 1.45;
        group.add(stripe);

        // Black hazard marks
        const hazardMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        for (let i = -3; i <= 3; i++) {
            const hazardMark = new THREE.Mesh(
                new THREE.BoxGeometry(0.3, 0.25, 1.3),
                hazardMaterial
            );
            hazardMark.position.set(i * 1.1, 1.45, 0);
            group.add(hazardMark);
        }

        // Support posts
        const postMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.8,
            metalness: 0.3
        });

        const leftPost = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 2, 0.4),
            postMaterial
        );
        leftPost.position.set(-4.2, 1, 0);
        leftPost.castShadow = true;
        group.add(leftPost);

        const rightPost = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 2, 0.4),
            postMaterial
        );
        rightPost.position.set(4.2, 1, 0);
        rightPost.castShadow = true;
        group.add(rightPost);

        group.visible = false;
        group.userData = {
            type: ObstacleType.JUMP,
            active: false,
            mainMesh: barrier
        };

        this.scene.add(group);
        return group;
    }

    createDuckObstacle() {
        const group = new THREE.Group();

        // Main pipe - Bright Neon Yellow
        const pipeMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFF00, // Bright neon yellow
            roughness: 0.2,
            metalness: 0.5,
            emissive: 0xFFFF00,
            emissiveIntensity: 0.6
        });

        const pipe = new THREE.Mesh(
            new THREE.CylinderGeometry(0.35, 0.35, 10, 16),
            pipeMaterial
        );
        pipe.rotation.z = Math.PI / 2;
        pipe.position.y = 2;
        pipe.castShadow = true;
        group.add(pipe);

        // Green LED strip
        const ledMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF88 });
        const ledStrip = new THREE.Mesh(
            new THREE.BoxGeometry(9, 0.1, 0.4),
            ledMaterial
        );
        ledStrip.position.y = 1.65;
        group.add(ledStrip);

        // LED dots
        for (let i = -4; i <= 4; i += 2) {
            const led = new THREE.Mesh(
                new THREE.SphereGeometry(0.1, 8, 8),
                ledMaterial
            );
            led.position.set(i, 1.6, 0);
            group.add(led);
        }

        // Support brackets
        const bracketMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.6,
            metalness: 0.7
        });

        const leftBracket = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 2.5, 0.3),
            bracketMaterial
        );
        leftBracket.position.set(-5, 1.25, 0);
        leftBracket.castShadow = true;
        group.add(leftBracket);

        const rightBracket = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 2.5, 0.3),
            bracketMaterial
        );
        rightBracket.position.set(5, 1.25, 0);
        rightBracket.castShadow = true;
        group.add(rightBracket);

        group.visible = false;
        group.userData = {
            type: ObstacleType.DUCK,
            active: false,
            mainMesh: pipe
        };

        this.scene.add(group);
        return group;
    }

    createSideObstacle() {
        const group = new THREE.Group();

        // Main block - Tech cyan
        const blockMaterial = new THREE.MeshStandardMaterial({
            color: 0x00D4FF,
            roughness: 0.5,
            metalness: 0.2,
            emissive: 0x003344,
            emissiveIntensity: 0.3
        });

        const block = new THREE.Mesh(
            new THREE.BoxGeometry(2.8, 3.5, 1.8),
            blockMaterial
        );
        block.position.y = 1.75;
        block.castShadow = true;
        group.add(block);

        // Glowing neon edges
        const neonMaterial = new THREE.MeshBasicMaterial({ color: 0x00FFFF });
        const edgeThickness = 0.15;

        // Vertical edges
        const edgePositions = [
            [-1.5, 1.75, -1], [1.5, 1.75, -1],
            [-1.5, 1.75, 1], [1.5, 1.75, 1]
        ];

        edgePositions.forEach(pos => {
            const edge = new THREE.Mesh(
                new THREE.BoxGeometry(edgeThickness, 3.6, edgeThickness),
                neonMaterial
            );
            edge.position.set(...pos);
            group.add(edge);
        });

        // Top and bottom edges
        const hEdge1 = new THREE.Mesh(
            new THREE.BoxGeometry(3, edgeThickness, 2),
            neonMaterial
        );
        hEdge1.position.y = 3.5;
        group.add(hEdge1);

        const hEdge2 = new THREE.Mesh(
            new THREE.BoxGeometry(3, edgeThickness, 2),
            neonMaterial
        );
        hEdge2.position.y = 0;
        group.add(hEdge2);

        // Directional arrows
        const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        for (let y = 0.6; y < 3.2; y += 0.9) {
            const arrow = new THREE.Mesh(
                new THREE.BoxGeometry(2.9, 0.15, 1.85),
                arrowMaterial
            );
            arrow.position.y = y;
            group.add(arrow);
        }

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
            let lane;

            // Check if we have a previous dodge lane to alternate from
            if (this.lastDodgeLane !== undefined && this.lastDodgeLane !== null) {
                // Force opposite lane: if 0 (left) -> 1 (right), if 1 (right) -> 0 (left)
                lane = this.lastDodgeLane === 0 ? 1 : 0;
            } else {
                // First side obstacle or reset: pick random
                lane = Math.random() < 0.5 ? 0 : 1;
            }

            this.lastDodgeLane = lane;

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
