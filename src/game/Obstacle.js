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
        // Increased pool size to 24 total (8 of each) to handle "All Moves" mode
        for (let i = 0; i < 8; i++) {
            const jump = this.createJumpObstacle();
            this.obstacles.push(jump);
            console.log(`📦 [Pool] JUMP obstacle ${i} criado`);
        }
        for (let i = 0; i < 8; i++) {
            const duck = this.createDuckObstacle();
            this.obstacles.push(duck);
            console.log(`📦 [Pool] DUCK obstacle ${i} criado`);
        }
        for (let i = 0; i < 8; i++) {
            const side = this.createSideObstacle();
            this.obstacles.push(side);
            console.log(`📦 [Pool] SIDE obstacle ${i} criado`);
        }
    }

    createJumpObstacle() {
        const group = new THREE.Group();

        // CYBER-HOLOGRAM: Semi-transparent neon RED (Danger)
        const barrierMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xFF0040, // Neon Red
            transparent: true,
            opacity: 0.3,
            metalness: 0.1,
            roughness: 0.2,
            emissive: 0xFF0040,
            emissiveIntensity: 1.5, // High glow for hologram effect
            clearcoat: 1.0, // Glass-like reflections
            clearcoatRoughness: 0.1,
            side: THREE.DoubleSide
        });

        const barrier = new THREE.Mesh(
            new THREE.BoxGeometry(8, 1.5, 1.2),
            barrierMaterial
        );
        barrier.position.y = 0.75;
        barrier.castShadow = false; // Holograms don't cast shadows
        group.add(barrier);

        // Holographic rim glow (brighter edges)
        const rimMaterial = new THREE.MeshBasicMaterial({
            color: 0xFF0040,
            transparent: true,
            opacity: 0.8,
            side: THREE.BackSide
        });
        const rim = new THREE.Mesh(
            new THREE.BoxGeometry(8.2, 1.6, 1.3),
            rimMaterial
        );
        rim.position.y = 0.75;
        group.add(rim);

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
        // Track dimensions
        const playableTrackWidth = 5; // Width where player can move (±2.5)
        const beamWidth = 8; // Beam spans across visible track area
        const pillarOffset = 4; // Pillars at visible track edges
        const beamHeight = 2; // Height of the laser beam
        const pillarHeight = 4.5; // Height of support pillars (tall enough to be visible)

        // Sci-Fi Metal Material for Pillars
        const pillarMaterial = new THREE.MeshStandardMaterial({
            color: 0x4A5568, // Dark metallic gray
            metalness: 0.9,
            roughness: 0.3,
            emissive: 0x1E40AF, // Subtle blue glow
            emissiveIntensity: 0.2
        });

        // LEFT PILLAR (thicker for better visibility)
        const leftPillar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.3, pillarHeight, 12),
            pillarMaterial
        );
        leftPillar.position.set(-pillarOffset, pillarHeight / 2, 0);
        leftPillar.castShadow = true;
        group.add(leftPillar);

        // Left pillar top cap (sci-fi detail)
        const capMaterial = new THREE.MeshStandardMaterial({
            color: 0x3B82F6, // Bright blue
            metalness: 0.8,
            roughness: 0.2,
            emissive: 0x3B82F6,
            emissiveIntensity: 0.5
        });
        const leftCap = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.2, 0.15, 12),
            capMaterial
        );
        leftCap.position.set(-pillarOffset, pillarHeight, 0);
        group.add(leftCap);

        // RIGHT PILLAR (thicker for better visibility)
        const rightPillar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.3, pillarHeight, 12),
            pillarMaterial
        );
        rightPillar.position.set(pillarOffset, pillarHeight / 2, 0);
        rightPillar.castShadow = true;
        group.add(rightPillar);

        // Right pillar top cap
        const rightCap = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.2, 0.15, 12),
            capMaterial
        );
        rightCap.position.set(pillarOffset, pillarHeight, 0);
        group.add(rightCap);

        // GLOWING ENERGY BEAM (replaces solid bar)
        const beamMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xFFFF00, // Bright yellow
            transparent: true,
            opacity: 0.4,
            metalness: 0,
            roughness: 0,
            emissive: 0xFFFF00,
            emissiveIntensity: 2.0, // Strong glow
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            side: THREE.DoubleSide
        });

        const beam = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.2, beamWidth, 16),
            beamMaterial
        );
        beam.rotation.z = Math.PI / 2;
        beam.position.y = beamHeight;
        beam.castShadow = false; // Energy doesn't cast shadows
        group.add(beam);

        // Beam outer glow layer
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFF00,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(
            new THREE.CylinderGeometry(0.35, 0.35, beamWidth + 0.2, 16),
            glowMaterial
        );
        glow.rotation.z = Math.PI / 2;
        glow.position.y = beamHeight;
        group.add(glow);

        // Point light for beam illumination
        const beamLight = new THREE.PointLight(0xFFFF00, 1.5, 8);
        beamLight.position.set(0, beamHeight, 0);
        beamLight.castShadow = false;
        group.add(beamLight);

        group.visible = false;
        group.userData = {
            type: ObstacleType.DUCK,
            active: false,
            mainMesh: beam,
            animatableLight: beamLight // For pulsing effect
        };

        this.scene.add(group);
        return group;
    }

    createSideObstacle() {
        const group = new THREE.Group();

        // CYBER-HOLOGRAM: Semi-transparent neon CYAN (Agility)
        const blockMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x00FFFF, // Neon Cyan
            transparent: true,
            opacity: 0.3,
            metalness: 0.1,
            roughness: 0.2,
            emissive: 0x00FFFF,
            emissiveIntensity: 1.5, // High glow for hologram effect
            clearcoat: 1.0, // Glass-like reflections
            clearcoatRoughness: 0.1,
            side: THREE.DoubleSide
        });

        const block = new THREE.Mesh(
            new THREE.BoxGeometry(3, 3.5, 2),
            blockMaterial
        );
        block.position.y = 1.75;
        block.castShadow = false; // Holograms don't cast shadows
        group.add(block);

        // Holographic rim glow
        const rimMaterial = new THREE.MeshBasicMaterial({
            color: 0x00FFFF,
            transparent: true,
            opacity: 0.8,
            side: THREE.BackSide
        });
        const rim = new THREE.Mesh(
            new THREE.BoxGeometry(3.2, 3.7, 2.2),
            rimMaterial
        );
        rim.position.y = 1.75;
        group.add(rim);

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

            // Animate duck obstacle beam light (pulsing effect)
            if (obstacle.userData.type === ObstacleType.DUCK && obstacle.userData.animatableLight) {
                const light = obstacle.userData.animatableLight;
                const time = Date.now() * 0.003; // Slow pulse
                light.intensity = 1.5 + Math.sin(time) * 0.5; // Pulse between 1.0 and 2.0
            }

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
