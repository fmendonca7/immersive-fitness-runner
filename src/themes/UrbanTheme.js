/**
 * UrbanTheme.js - Tema urbano com prédios e cidade
 */

import * as THREE from 'three';

export class UrbanTheme {
    constructor(scene) {
        this.scene = scene;

        // Cores do tema
        this.skyColor = 0x87CEEB;
        this.fogColor = 0xa0c4e0;
        this.groundColor = 0x4a7c4e;
        this.fogNear = 30;
        this.fogFar = 200;
    }

    createDecorations() {
        const decorations = [];

        // Prédios em ambos os lados
        for (let i = 0; i < 25; i++) {
            const leftBuilding = this.createBuilding();
            leftBuilding.position.set(
                -15 - Math.random() * 30,
                0,
                -i * 15 - Math.random() * 5
            );
            decorations.push(leftBuilding);

            const rightBuilding = this.createBuilding();
            rightBuilding.position.set(
                15 + Math.random() * 30,
                0,
                -i * 15 - Math.random() * 5
            );
            decorations.push(rightBuilding);
        }

        // Árvores pequenas na calçada
        for (let i = 0; i < 30; i++) {
            const side = i % 2 === 0 ? -1 : 1;
            const tree = this.createUrbanTree();

            tree.position.set(
                side * (7 + Math.random() * 2),
                0,
                -i * 10 - Math.random() * 5
            );

            decorations.push(tree);
        }

        // Nuvens
        for (let i = 0; i < 20; i++) {
            const cloud = this.createCloud();
            cloud.position.set(
                (Math.random() - 0.5) * 100,
                15 + Math.random() * 20,
                -Math.random() * 300
            );
            cloud.scale.setScalar(1 + Math.random() * 2);
            decorations.push(cloud);
        }

        // Calçadas
        const leftSidewalk = this.createSidewalk(-5.5);
        const rightSidewalk = this.createSidewalk(5.5);
        decorations.push(leftSidewalk);
        decorations.push(rightSidewalk);

        return decorations;
    }

    createBuilding() {
        const group = new THREE.Group();

        // Dimensões aleatórias
        const width = 5 + Math.random() * 10;
        const height = 10 + Math.random() * 30;
        const depth = 5 + Math.random() * 8;

        // Corpo do prédio
        const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
        const buildingColors = [0x708090, 0x5f6a6a, 0x7f8c8d, 0x85929e, 0x566573];
        const buildingMaterial = new THREE.MeshStandardMaterial({
            color: buildingColors[Math.floor(Math.random() * buildingColors.length)],
            roughness: 0.8
        });

        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.y = height / 2;
        building.castShadow = true;
        building.receiveShadow = true;
        group.add(building);

        // Janelas
        const windowMaterial = new THREE.MeshBasicMaterial({
            color: 0x87CEEB,
            transparent: true,
            opacity: 0.7
        });

        const windowRows = Math.floor(height / 3);
        const windowCols = Math.floor(width / 2);

        for (let row = 0; row < windowRows; row++) {
            for (let col = 0; col < windowCols; col++) {
                const windowGeometry = new THREE.PlaneGeometry(0.8, 1.2);
                const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);

                windowMesh.position.set(
                    -width / 2 + 1 + col * 2,
                    2 + row * 3,
                    depth / 2 + 0.01
                );
                group.add(windowMesh);
            }
        }

        return group;
    }

    createUrbanTree() {
        const group = new THREE.Group();

        // Tronco fino
        const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.15, 1.5, 6);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x5d4037 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 0.75;
        trunk.castShadow = true;
        group.add(trunk);

        // Copa verde redonda
        const foliageGeometry = new THREE.SphereGeometry(0.8, 8, 8);
        const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x2e7d32 });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.y = 2;
        foliage.scale.y = 1.2;
        foliage.castShadow = true;
        group.add(foliage);

        return group;
    }

    createCloud() {
        const group = new THREE.Group();

        const cloudMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 1
        });

        // Várias esferas para formar nuvem
        for (let i = 0; i < 5; i++) {
            const size = 1 + Math.random() * 2;
            const cloudPart = new THREE.Mesh(
                new THREE.SphereGeometry(size, 8, 8),
                cloudMaterial
            );
            cloudPart.position.set(
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 1,
                (Math.random() - 0.5) * 2
            );
            group.add(cloudPart);
        }

        return group;
    }

    createSidewalk(xPosition) {
        const group = new THREE.Group();

        const sidewalkGeometry = new THREE.BoxGeometry(2, 0.1, 500);
        const sidewalkMaterial = new THREE.MeshStandardMaterial({
            color: 0xb0b0b0,
            roughness: 0.9
        });

        const sidewalk = new THREE.Mesh(sidewalkGeometry, sidewalkMaterial);
        sidewalk.position.set(xPosition, 0.05, -250);
        sidewalk.receiveShadow = true;
        group.add(sidewalk);

        // Meio-fio
        const curbGeometry = new THREE.BoxGeometry(0.2, 0.15, 500);
        const curbMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });

        const curb = new THREE.Mesh(curbGeometry, curbMaterial);
        curb.position.set(
            xPosition + (xPosition > 0 ? -1 : 1),
            0.075,
            -250
        );
        group.add(curb);

        return group;
    }
}
