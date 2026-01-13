/**
 * NightTheme.js - Tema noturno com estrelas e meteoros
 */

import * as THREE from 'three';

export class NightTheme {
    constructor(scene) {
        this.scene = scene;

        // Cores do tema
        this.skyColor = 0x0a1628;
        this.fogColor = 0x1a2638;
        this.groundColor = 0xf5f5dc;
        this.fogNear = 40;
        this.fogFar = 180;
    }

    createDecorations() {
        const decorations = [];

        // Estrelas no céu
        const stars = this.createStars();
        decorations.push(stars);

        // Meteoros (estrelas cadentes estáticas como decoração)
        for (let i = 0; i < 10; i++) {
            const meteor = this.createMeteor();
            meteor.position.set(
                (Math.random() - 0.5) * 200,
                30 + Math.random() * 50,
                -50 - Math.random() * 300
            );
            decorations.push(meteor);
        }

        // Árvores mais escuras
        for (let i = 0; i < 30; i++) {
            const side = i % 2 === 0 ? -1 : 1;
            const tree = this.createDarkTree();

            tree.position.set(
                side * (10 + Math.random() * 20),
                0,
                -i * 12 - Math.random() * 5
            );
            tree.scale.setScalar(0.7 + Math.random() * 0.4);

            decorations.push(tree);
        }

        // Muros com luzes
        const leftWall = this.createGlowingWall(-6);
        const rightWall = this.createGlowingWall(6);
        decorations.push(leftWall);
        decorations.push(rightWall);

        return decorations;
    }

    createStars() {
        const group = new THREE.Group();

        const starGeometry = new THREE.BufferGeometry();
        const starCount = 500;
        const positions = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);

        for (let i = 0; i < starCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 400;
            positions[i * 3 + 1] = 30 + Math.random() * 100;
            positions[i * 3 + 2] = -Math.random() * 400;
            sizes[i] = Math.random() * 2 + 0.5;
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.5,
            sizeAttenuation: true
        });

        const stars = new THREE.Points(starGeometry, starMaterial);
        group.add(stars);

        return group;
    }

    createMeteor() {
        const group = new THREE.Group();

        // Corpo do meteoro
        const meteorGeometry = new THREE.SphereGeometry(0.5, 8, 8);
        const meteorMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffaa
        });
        const meteor = new THREE.Mesh(meteorGeometry, meteorMaterial);
        group.add(meteor);

        // Rastro
        const trailGeometry = new THREE.ConeGeometry(0.3, 8, 8);
        const trailMaterial = new THREE.MeshBasicMaterial({
            color: 0xffaa66,
            transparent: true,
            opacity: 0.6
        });
        const trail = new THREE.Mesh(trailGeometry, trailMaterial);
        trail.rotation.x = -Math.PI / 4;
        trail.rotation.z = Math.PI / 4;
        trail.position.set(2, 2, 2);
        group.add(trail);

        return group;
    }

    createDarkTree() {
        const group = new THREE.Group();

        // Tronco
        const trunkGeometry = new THREE.CylinderGeometry(0.15, 0.25, 0.8, 6);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x3d2817 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 0.4;
        trunk.castShadow = true;
        group.add(trunk);

        // Folhagem escura
        const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x1a3d1a });

        const cone1Geometry = new THREE.ConeGeometry(1, 1.5, 6);
        const cone1 = new THREE.Mesh(cone1Geometry, foliageMaterial);
        cone1.position.y = 1.3;
        cone1.castShadow = true;
        group.add(cone1);

        const cone2Geometry = new THREE.ConeGeometry(0.7, 1.2, 6);
        const cone2 = new THREE.Mesh(cone2Geometry, foliageMaterial);
        cone2.position.y = 2.2;
        cone2.castShadow = true;
        group.add(cone2);

        return group;
    }

    createGlowingWall(xPosition) {
        const group = new THREE.Group();

        // Muro
        const wallGeometry = new THREE.BoxGeometry(0.3, 2, 500);
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a3a4a,
            roughness: 0.8
        });

        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.set(xPosition, 1, -250);
        wall.castShadow = true;
        group.add(wall);

        // Luzes brilhantes
        const glowColors = [0x00ffff, 0xff00ff, 0xffff00, 0x00ff00];
        for (let i = 0; i < 60; i++) {
            const glowGeometry = new THREE.SphereGeometry(0.12, 8, 8);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: glowColors[i % glowColors.length]
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);

            glow.position.set(
                xPosition + (xPosition > 0 ? -0.2 : 0.2),
                2.2,
                -i * 7
            );
            group.add(glow);
        }

        return group;
    }
}
