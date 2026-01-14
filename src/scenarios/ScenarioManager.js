/**
 * ScenarioManager.js - Clean and Clear Scenarios
 * Baseado nas referências: pista clara, sem muros desnecessários, elementos reconhecíveis
 */

import * as THREE from 'three';

// 10 cenários com configurações claras
// hasWalls: define se o cenário tem muros laterais ou não
export const SCENARIOS = {
    CITY: {
        id: 'city',
        name: 'City Run',
        description: 'City run',
        hasWalls: false, // Sem muros - cidade aberta
        colors: {
            sky: 0x87CEEB,
            fog: 0xb0d4e8,
            ground: 0x7ec850,
            track: 0xf0f0f0,
            trackLine: 0x444444,
            obstacle: 0x333333
        },
        fogNear: 100,
        fogFar: 400
    },
    ROOFTOP: {
        id: 'rooftop',
        name: 'Rooftop Run',
        description: 'Running over buildings',
        hasWalls: false, // Sem muros - telhados
        colors: {
            sky: 0x87CEEB,
            fog: 0xa0c8e0,
            ground: 0x7ec850,
            track: 0xf8f8f8,
            trackLine: 0x333333,
            obstacle: 0x2a2a2a
        },
        fogNear: 80,
        fogFar: 350
    },
    WINTER: {
        id: 'winter',
        name: 'Winter Wonderland',
        description: 'Snow and pines',
        hasWalls: false, // Sem muros - neve aberta
        colors: {
            sky: 0xc8e0f0,
            fog: 0xd8e8f4,
            ground: 0xffffff,
            track: 0xe8dcc8,
            trackLine: 0x888888,
            obstacle: 0x8b4513
        },
        fogNear: 80,
        fogFar: 300
    },
    BEACH: {
        id: 'beach',
        name: 'Beach Run',
        description: 'Tropical beach',
        hasWalls: false, // Sem muros - praia aberta
        colors: {
            sky: 0x87CEEB,
            fog: 0xa8e0f0,
            ground: 0xf0d878,
            track: 0xc8a858,
            trackLine: 0xffffff,
            obstacle: 0x8b4513
        },
        fogNear: 100,
        fogFar: 400
    },
    TUNNEL: {
        id: 'tunnel',
        name: 'Tunnel Run',
        description: 'Industrial tunnel',
        hasWalls: true, // COM muros - túnel fechado
        colors: {
            sky: 0x1a1a2e,
            fog: 0x15152a,
            ground: 0x2a2a3a,
            track: 0x505060,
            trackLine: 0xffd700,
            obstacle: 0xff6600
        },
        fogNear: 30,
        fogFar: 150
    },
    NEON: {
        id: 'neon',
        name: 'Neon City',
        description: 'Cyberpunk city',
        hasWalls: true, // COM muros - corredor neon
        colors: {
            sky: 0x050010,
            fog: 0x100020,
            ground: 0x080010,
            track: 0x1a1a2a,
            trackLine: 0xff00ff,
            obstacle: 0x00ffff
        },
        fogNear: 40,
        fogFar: 180
    },
    JUNGLE: {
        id: 'jungle',
        name: 'Jungle Path',
        description: 'Jungle path',
        hasWalls: false, // Sem muros - selva aberta
        colors: {
            sky: 0x5a8a5a,
            fog: 0x4a7a4a,
            ground: 0x228b22,
            track: 0x6b5030,
            trackLine: 0x8b7355,
            obstacle: 0x4a3020
        },
        fogNear: 50,
        fogFar: 200
    },
    SPACE: {
        id: 'space',
        name: 'Space Station',
        description: 'Space station',
        hasWalls: true, // COM muros - corredor espacial
        colors: {
            sky: 0x000008,
            fog: 0x000010,
            ground: 0x0a0a15,
            track: 0x2a2a35,
            trackLine: 0xff3333,
            obstacle: 0x00ff00
        },
        fogNear: 60,
        fogFar: 250
    },
    SUNSET: {
        id: 'sunset',
        name: 'Sunset Highway',
        description: 'Sunset highway',
        hasWalls: false, // Sem muros - estrada aberta
        colors: {
            sky: 0xff8050,
            fog: 0xffa070,
            ground: 0x4a3520,
            track: 0x505058,
            trackLine: 0xffffff,
            obstacle: 0x333333
        },
        fogNear: 80,
        fogFar: 300
    },
    CRYSTAL: {
        id: 'crystal',
        name: 'Crystal Cave',
        description: 'Crystal cave',
        hasWalls: true, // COM muros - caverna fechada
        colors: {
            sky: 0x100820,
            fog: 0x180a30,
            ground: 0x1a0a30,
            track: 0x2a1a45,
            trackLine: 0xda70d6,
            obstacle: 0xda70d6
        },
        fogNear: 30,
        fogFar: 120
    },
    TEST_SIMPLE: {
        id: 'test_simple',
        name: 'Test Track (Debug)',
        description: 'Isolated test scenario',
        hasWalls: false, // SEM muros para simplicidade
        colors: {
            sky: 0x87CEEB,        // Céu azul claro
            fog: 0xC0D8F0,        // Névoa suave
            ground: 0x90EE90,     // Verde claro
            track: 0xD3D3D3,      // Cinza claro (pista)
            trackLine: 0x000000,  // Linha preta
            obstacle: 0xFF0000    // VERMELHO PURO (para testar)
        },
        fogNear: 150,             // Névoa longe
        fogFar: 500               // Bem longe para ver tudo
    }
};

export class ScenarioManager {
    constructor(scene, game) {
        this.scene = scene;
        this.game = game;

        this.currentScenario = null;
        this.scenarioMode = 'random';
        this.selectedScenario = null;

        // Elementos
        this.leftWall = null;
        this.rightWall = null;
        this.decorations = [];

        this.scenarioList = Object.values(SCENARIOS);
        this.usedScenarios = [];

        this.createWalls();
    }

    createWalls() {
        const wallHeight = 8;
        const wallLength = 800;
        const wallOffset = 5;

        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x333344,
            roughness: 0.7
        });

        const wallGeometry = new THREE.BoxGeometry(0.8, wallHeight, wallLength);

        // Parede esquerda
        this.leftWall = new THREE.Mesh(wallGeometry, wallMaterial.clone());
        this.leftWall.position.set(-wallOffset, wallHeight / 2, -wallLength / 2);
        this.leftWall.visible = false;
        this.scene.add(this.leftWall);

        // Parede direita
        this.rightWall = new THREE.Mesh(wallGeometry, wallMaterial.clone());
        this.rightWall.position.set(wallOffset, wallHeight / 2, -wallLength / 2);
        this.rightWall.visible = false;
        this.scene.add(this.rightWall);
    }

    setMode(mode, specificScenario = null) {
        this.scenarioMode = mode;
        this.selectedScenario = specificScenario;
        this.usedScenarios = [];
    }

    getNextScenario() {
        if (this.scenarioMode === 'specific' && this.selectedScenario) {
            // Buscar cenário pelo ID (minúsculo)
            const found = this.scenarioList.find(s => s.id === this.selectedScenario);
            return found || this.scenarioList[0];
        }

        const available = this.scenarioList.filter(s => !this.usedScenarios.includes(s.id));

        if (available.length === 0) {
            this.usedScenarios = [];
            return this.scenarioList[Math.floor(Math.random() * this.scenarioList.length)];
        }

        const scenario = available[Math.floor(Math.random() * available.length)];
        this.usedScenarios.push(scenario.id);

        if (this.usedScenarios.length > 4) {
            this.usedScenarios.shift();
        }

        return scenario;
    }

    applyScenario(scenario) {
        this.currentScenario = scenario;
        const c = scenario.colors;

        // Céu e névoa
        this.scene.background = new THREE.Color(c.sky);
        this.scene.fog = new THREE.Fog(c.fog, scenario.fogNear, scenario.fogFar);

        // Paredes - mostrar ou esconder baseado no cenário
        if (scenario.hasWalls) {
            this.leftWall.visible = true;
            this.rightWall.visible = true;
            this.leftWall.material.color.setHex(c.ground);
            this.rightWall.material.color.setHex(c.ground);
        } else {
            this.leftWall.visible = false;
            this.rightWall.visible = false;
        }

        // Pista
        if (this.game.track) {
            this.game.track.applyScenarioColors(c);
        }

        // Decorações
        this.clearDecorations();
        this.createDecorations(scenario);
    }

    createDecorations(scenario) {
        const id = scenario.id;

        if (id === 'test_simple') {
            // Sem decorações - teste isolado!
            return;
        }
        else if (id === 'city' || id === 'rooftop') this.createCityDecorations(scenario);
        else if (id === 'winter') this.createWinterDecorations(scenario);
        else if (id === 'beach') this.createBeachDecorations(scenario);
        else if (id === 'tunnel') this.createTunnelDecorations(scenario);
        else if (id === 'neon') this.createNeonDecorations(scenario);
        else if (id === 'jungle') this.createJungleDecorations(scenario);
        else if (id === 'space') this.createSpaceDecorations(scenario);
        else if (id === 'sunset') this.createSunsetDecorations(scenario);
        else if (id === 'crystal') this.createCrystalDecorations(scenario);
    }

    // ========================================
    // CITY / ROOFTOP - Prédios ao fundo
    // ========================================
    createCityDecorations(scenario) {
        // Prédios de vários tamanhos ao fundo
        for (let i = 0; i < 60; i++) {
            const side = i % 2 === 0 ? -1 : 1;
            const distance = 15 + Math.random() * 40;
            const width = 5 + Math.random() * 15;
            const height = 20 + Math.random() * 60;
            const z = -i * 12 - 20;

            // Prédio simples - cor sólida
            const colors = [0x4a5568, 0x5a6678, 0x3a4558, 0x6a7788];
            const building = this.createBox(
                width, height, 8,
                colors[Math.floor(Math.random() * colors.length)]
            );
            building.position.set(side * distance, height / 2 - 5, z);
            this.addDecoration(building);
        }

        // Grama verde nas laterais (chão)
        const grassGeometry = new THREE.PlaneGeometry(100, 800);
        const grassMaterial = new THREE.MeshStandardMaterial({ color: 0x7ec850 });

        const leftGrass = new THREE.Mesh(grassGeometry, grassMaterial);
        leftGrass.rotation.x = -Math.PI / 2;
        leftGrass.position.set(-55, 0.01, -400);
        this.addDecoration(leftGrass);

        const rightGrass = new THREE.Mesh(grassGeometry, grassMaterial);
        rightGrass.rotation.x = -Math.PI / 2;
        rightGrass.position.set(55, 0.01, -400);
        this.addDecoration(rightGrass);
    }

    // ========================================
    // WINTER - Pinheiros com neve
    // ========================================
    createWinterDecorations(scenario) {
        // Pinheiros estilizados (como nas referências)
        for (let i = 0; i < 50; i++) {
            const side = i % 2 === 0 ? -1 : 1;
            const distance = 8 + Math.random() * 15;
            const z = -i * 14 - 10;
            const scale = 0.8 + Math.random() * 0.6;

            // Tronco marrom
            const trunk = this.createCylinder(0.4 * scale, 3 * scale, 0x6b4020);
            trunk.position.set(side * distance, 1.5 * scale, z);
            this.addDecoration(trunk);

            // Copa verde (cone)
            const foliage = this.createCone(2.5 * scale, 5 * scale, 0x228b22);
            foliage.position.set(side * distance, 5.5 * scale, z);
            this.addDecoration(foliage);

            // Segunda camada de copa
            const foliage2 = this.createCone(2 * scale, 4 * scale, 0x2a9b2a);
            foliage2.position.set(side * distance, 7.5 * scale, z);
            this.addDecoration(foliage2);

            // Neve no topo (esfera branca)
            const snow = this.createSphere(1.2 * scale, 0xffffff);
            snow.position.set(side * distance, 9 * scale, z);
            this.addDecoration(snow);
        }

        // Nuvens baixas
        for (let i = 0; i < 20; i++) {
            const cloud = this.createSphere(3 + Math.random() * 4, 0xffffff);
            cloud.position.set(
                (Math.random() - 0.5) * 80,
                20 + Math.random() * 15,
                -i * 35 - 50
            );
            cloud.scale.set(2, 0.6, 1);
            this.addDecoration(cloud);
        }
    }

    // ========================================
    // BEACH - Palmeiras e oceano
    // ========================================
    createBeachDecorations(scenario) {
        // Palmeiras
        for (let i = 0; i < 35; i++) {
            const side = i % 2 === 0 ? -1 : 1;
            const distance = 10 + Math.random() * 12;
            const z = -i * 18 - 15;

            // Tronco inclinado
            const trunk = this.createCylinder(0.4, 8, 0x8b6340);
            trunk.position.set(side * distance, 4, z);
            trunk.rotation.z = side * 0.15;
            this.addDecoration(trunk);

            // Folhas (cones verdes saindo do topo)
            for (let f = 0; f < 6; f++) {
                const angle = (f / 6) * Math.PI * 2;
                const leaf = this.createCone(0.4, 4, 0x228b22);
                leaf.position.set(
                    side * distance + Math.cos(angle) * 1,
                    8.5,
                    z + Math.sin(angle) * 1
                );
                leaf.rotation.x = 0.8;
                leaf.rotation.z = angle + side * 0.15;
                this.addDecoration(leaf);
            }
        }

        // Água azul ao fundo (lado direito)
        const waterGeometry = new THREE.PlaneGeometry(200, 800);
        const waterMaterial = new THREE.MeshStandardMaterial({
            color: 0x00a8cc,
            roughness: 0.1
        });
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.rotation.x = -Math.PI / 2;
        water.position.set(110, 0.02, -400);
        this.addDecoration(water);
    }

    // ========================================
    // TUNNEL - Túnel industrial com muros
    // ========================================
    createTunnelDecorations(scenario) {
        // Vigas no teto
        for (let i = 0; i < 40; i++) {
            const beam = this.createBox(12, 0.5, 0.8, 0x4a4a5a);
            beam.position.set(0, 9, -i * 18 - 10);
            this.addDecoration(beam);
        }

        // Luzes no teto
        for (let i = 0; i < 30; i++) {
            const light = this.createBox(0.5, 0.3, 2, 0xffd700, true);
            light.position.set(0, 8.5, -i * 25 - 15);
            this.addDecoration(light);
        }

        // Trilhos laterais
        for (let side of [-1, 1]) {
            const rail = this.createBox(0.3, 0.3, 800, 0x888888);
            rail.position.set(side * 4.3, 0.15, -400);
            this.addDecoration(rail);
        }
    }

    // ========================================
    // NEON - Cidade cyberpunk com muros neon
    // ========================================
    createNeonDecorations(scenario) {
        // Linhas neon nas paredes
        for (let i = 0; i < 50; i++) {
            const side = i % 2 === 0 ? -1 : 1;
            const z = -i * 15 - 10;

            // Linha neon horizontal
            const colors = [0xff00ff, 0x00ffff, 0xff3366];
            const neonLine = this.createBox(
                0.1, 0.2, 8,
                colors[i % 3],
                true
            );
            neonLine.position.set(side * 4.95, 2 + (i % 4) * 1.5, z);
            this.addDecoration(neonLine);
        }

        // Sinais flutuantes
        for (let i = 0; i < 15; i++) {
            const sign = this.createBox(2, 0.8, 0.1, 0x00ffff, true);
            sign.position.set(i % 2 === 0 ? -3 : 3, 6, -i * 45 - 30);
            this.addDecoration(sign);
        }
    }

    // ========================================
    // JUNGLE - Árvores tropicais
    // ========================================
    createJungleDecorations(scenario) {
        // Árvores tropicais
        for (let i = 0; i < 40; i++) {
            const side = i % 2 === 0 ? -1 : 1;
            const distance = 8 + Math.random() * 10;
            const z = -i * 16 - 10;

            // Tronco
            const trunk = this.createCylinder(0.5, 10, 0x4a3020);
            trunk.position.set(side * distance, 5, z);
            this.addDecoration(trunk);

            // Copa grande
            const foliage = this.createSphere(5, 0x228b22);
            foliage.position.set(side * distance, 12, z);
            this.addDecoration(foliage);
        }

        // Arbustos baixos
        for (let i = 0; i < 30; i++) {
            const side = i % 2 === 0 ? -1 : 1;
            const bush = this.createSphere(1.5, 0x1a6b10);
            bush.position.set(side * (6 + Math.random() * 2), 0.8, -i * 22 - 15);
            this.addDecoration(bush);
        }
    }

    // ========================================
    // SPACE - Corredor espacial
    // ========================================
    createSpaceDecorations(scenario) {
        // Estrelas
        for (let i = 0; i < 200; i++) {
            const star = this.createSphere(0.1 + Math.random() * 0.1, 0xffffff, true);
            star.position.set(
                (Math.random() - 0.5) * 150,
                15 + Math.random() * 40,
                -Math.random() * 400 - 50
            );
            this.addDecoration(star);
        }

        // Painéis da estação
        for (let i = 0; i < 25; i++) {
            const side = i % 2 === 0 ? -1 : 1;
            const panel = this.createBox(0.2, 3, 4, 0x333340);
            panel.position.set(side * 4.9, 4, -i * 28 - 15);
            this.addDecoration(panel);

            // Luz vermelha
            const light = this.createSphere(0.2, 0xff0000, true);
            light.position.set(side * 4.9, 6, -i * 28 - 15);
            this.addDecoration(light);
        }
    }

    // ========================================
    // SUNSET - Pôr-do-sol com postes
    // ========================================
    createSunsetDecorations(scenario) {
        // Sol no horizonte
        const sun = this.createSphere(20, 0xff6600, true);
        sun.position.set(0, 15, -500);
        this.addDecoration(sun);

        // Montanhas
        for (let i = 0; i < 12; i++) {
            const mountain = this.createCone(30 + Math.random() * 20, 25 + Math.random() * 15, 0x4a3520);
            mountain.position.set((i - 6) * 45, 10, -450);
            this.addDecoration(mountain);
        }

        // Postes de luz
        for (let i = 0; i < 25; i++) {
            const side = i % 2 === 0 ? -1 : 1;
            const z = -i * 28 - 20;

            const pole = this.createCylinder(0.12, 10, 0x555555);
            pole.position.set(side * 7, 5, z);
            this.addDecoration(pole);

            const light = this.createSphere(0.4, 0xffd700, true);
            light.position.set(side * 7, 10.3, z);
            this.addDecoration(light);
        }
    }

    // ========================================
    // CRYSTAL - Caverna de cristais
    // ========================================
    createCrystalDecorations(scenario) {
        // Cristais grandes
        for (let i = 0; i < 40; i++) {
            const side = i % 2 === 0 ? -1 : 1;
            const z = -i * 16 - 12;
            const height = 2 + Math.random() * 4;

            const colors = [0xda70d6, 0x9370db, 0xff69b4, 0x8a2be2];
            const crystal = this.createOctahedron(height / 2, colors[i % 4], true);
            crystal.position.set(side * (5.5 + Math.random() * 2), height, z);
            crystal.rotation.y = Math.random() * Math.PI;
            this.addDecoration(crystal);
        }

        // Estalactites
        for (let i = 0; i < 30; i++) {
            const stalactite = this.createCone(0.5, 3, 0x4a3a60);
            stalactite.position.set(
                (Math.random() - 0.5) * 6,
                9 - Math.random() * 2,
                -i * 22 - 15
            );
            stalactite.rotation.x = Math.PI;
            this.addDecoration(stalactite);
        }

        // Brilhos
        for (let i = 0; i < 50; i++) {
            const sparkle = this.createSphere(0.1, 0xda70d6, true);
            sparkle.position.set(
                (Math.random() - 0.5) * 10,
                1 + Math.random() * 7,
                -Math.random() * 400 - 20
            );
            this.addDecoration(sparkle);
        }
    }

    // ========================================
    // HELPERS
    // ========================================

    createBox(w, h, d, color, emissive = false) {
        const geometry = new THREE.BoxGeometry(w, h, d);
        const material = emissive
            ? new THREE.MeshBasicMaterial({ color })
            : new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = !emissive;
        return mesh;
    }

    createSphere(radius, color, emissive = false) {
        const geometry = new THREE.SphereGeometry(radius, 16, 16);
        const material = emissive
            ? new THREE.MeshBasicMaterial({ color })
            : new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
        return new THREE.Mesh(geometry, material);
    }

    createCylinder(radius, height, color) {
        const geometry = new THREE.CylinderGeometry(radius, radius, height, 12);
        const material = new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
        return new THREE.Mesh(geometry, material);
    }

    createCone(radius, height, color) {
        const geometry = new THREE.ConeGeometry(radius, height, 8);
        const material = new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
        return new THREE.Mesh(geometry, material);
    }

    createOctahedron(radius, color, emissive = false) {
        const geometry = new THREE.OctahedronGeometry(radius);
        const material = emissive
            ? new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 })
            : new THREE.MeshStandardMaterial({ color, roughness: 0.3 });
        return new THREE.Mesh(geometry, material);
    }

    addDecoration(mesh) {
        this.scene.add(mesh);
        this.decorations.push(mesh);
    }

    clearDecorations() {
        this.decorations.forEach(dec => {
            this.scene.remove(dec);
            if (dec.geometry) dec.geometry.dispose();
            if (dec.material) {
                if (Array.isArray(dec.material)) {
                    dec.material.forEach(m => m.dispose());
                } else {
                    dec.material.dispose();
                }
            }
        });
        this.decorations = [];
    }

    update(speed) {
        this.decorations.forEach(dec => {
            dec.position.z += speed;
            if (dec.position.z > 50) {
                dec.position.z -= 700;
            }
        });
    }

    getCurrentScenario() {
        return this.currentScenario;
    }

    getScenarioList() {
        return this.scenarioList;
    }

    reset() {
        this.usedScenarios = [];
        this.clearDecorations();
    }
}
