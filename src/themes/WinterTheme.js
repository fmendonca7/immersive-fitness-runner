/**
 * WinterTheme.js - Tema de inverno com neve e árvores de natal
 */

import * as THREE from 'three';

export class WinterTheme {
    constructor(scene) {
        this.scene = scene;

        // Cores do tema
        this.skyColor = 0x1a3a4a;
        this.fogColor = 0x2a4a5a;
        this.groundColor = 0xf5f5f0;
        this.fogNear = 30;
        this.fogFar = 150;
    }

    createDecorations() {
        const decorations = [];

        // Criar árvores de natal em ambos os lados
        for (let i = 0; i < 40; i++) {
            const side = i % 2 === 0 ? -1 : 1;
            const tree = this.createChristmasTree();

            tree.position.set(
                side * (8 + Math.random() * 15),
                0,
                -i * 10 - Math.random() * 5
            );
            tree.scale.setScalar(0.8 + Math.random() * 0.5);

            decorations.push(tree);
        }

        // Adicionar neve no chão (partículas estáticas)
        const snowGround = this.createSnowPatches();
        decorations.push(snowGround);

        // Adicionar muros laterais decorados
        const leftWall = this.createWall(-6);
        const rightWall = this.createWall(6);
        decorations.push(leftWall);
        decorations.push(rightWall);

        return decorations;
    }

    createChristmasTree() {
        const group = new THREE.Group();

        // Tronco
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 0.5;
        trunk.castShadow = true;
        group.add(trunk);

        // Folhagem (3 cones)
        const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });

        const cone1Geometry = new THREE.ConeGeometry(1.2, 1.5, 8);
        const cone1 = new THREE.Mesh(cone1Geometry, foliageMaterial);
        cone1.position.y = 1.5;
        cone1.castShadow = true;
        group.add(cone1);

        const cone2Geometry = new THREE.ConeGeometry(0.9, 1.2, 8);
        const cone2 = new THREE.Mesh(cone2Geometry, foliageMaterial);
        cone2.position.y = 2.5;
        cone2.castShadow = true;
        group.add(cone2);

        const cone3Geometry = new THREE.ConeGeometry(0.6, 1, 8);
        const cone3 = new THREE.Mesh(cone3Geometry, foliageMaterial);
        cone3.position.y = 3.3;
        cone3.castShadow = true;
        group.add(cone3);

        // Neve no topo
        const snowGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const snowMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const snow = new THREE.Mesh(snowGeometry, snowMaterial);
        snow.position.y = 3.8;
        snow.scale.set(1, 0.5, 1);
        group.add(snow);

        // Decorações (bolas coloridas)
        const colors = [0xff0000, 0xffff00, 0x0000ff, 0xff00ff];
        for (let i = 0; i < 5; i++) {
            const ballGeometry = new THREE.SphereGeometry(0.08, 8, 8);
            const ballMaterial = new THREE.MeshStandardMaterial({
                color: colors[i % colors.length],
                emissive: colors[i % colors.length],
                emissiveIntensity: 0.3
            });
            const ball = new THREE.Mesh(ballGeometry, ballMaterial);

            const angle = (i / 5) * Math.PI * 2;
            const radius = 0.5 + Math.random() * 0.3;
            const height = 1.5 + Math.random() * 1.5;

            ball.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            group.add(ball);
        }

        return group;
    }

    createSnowPatches() {
        const group = new THREE.Group();

        // Criar manchas de neve
        const snowMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 1
        });

        for (let i = 0; i < 100; i++) {
            const size = 0.5 + Math.random() * 2;
            const geometry = new THREE.CircleGeometry(size, 8);
            const patch = new THREE.Mesh(geometry, snowMaterial);

            patch.rotation.x = -Math.PI / 2;
            patch.position.set(
                (Math.random() - 0.5) * 50,
                0.01,
                -Math.random() * 400
            );

            // Evitar a pista
            if (Math.abs(patch.position.x) < 5) {
                patch.position.x += Math.sign(patch.position.x) * 5 || 8;
            }

            group.add(patch);
        }

        return group;
    }

    createWall(xPosition) {
        const group = new THREE.Group();

        // Muro baixo
        const wallGeometry = new THREE.BoxGeometry(0.5, 1.5, 500);
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x87909c,
            roughness: 0.9
        });

        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.set(xPosition, 0.75, -250);
        wall.castShadow = true;
        wall.receiveShadow = true;
        group.add(wall);

        // Luzes decorativas
        const lightColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
        for (let i = 0; i < 80; i++) {
            const lightGeometry = new THREE.SphereGeometry(0.08, 8, 8);
            const lightMaterial = new THREE.MeshBasicMaterial({
                color: lightColors[i % lightColors.length]
            });
            const light = new THREE.Mesh(lightGeometry, lightMaterial);

            light.position.set(
                xPosition + (xPosition > 0 ? -0.3 : 0.3),
                1.6,
                -i * 5
            );
            group.add(light);
        }

        return group;
    }
}
