/**
 * Track.js - Pista Clara com Grid Visual
 * Baseado nas referências: pista branca/clara com tiles e linha central
 */

import * as THREE from 'three';

export class Track {
    constructor(scene) {
        this.scene = scene;

        // Configurações da pista
        this.trackWidth = 8;
        this.trackLength = 800;
        this.laneWidth = 4;

        // Materiais compartilhados
        this.trackMaterial = null;
        this.groundMaterial = null;
        this.lineMaterial = null;

        // Referências
        this.trackMesh = null;
        this.leftGround = null;
        this.rightGround = null;
        this.centerLine = null;
        this.gridLines = [];

        this.createTrack();
    }

    createTrack() {
        // Material da pista - claro como nas referências
        this.trackMaterial = new THREE.MeshStandardMaterial({
            color: 0xf0f0f0,
            roughness: 0.6,
            metalness: 0.1
        });

        // Pista principal
        const trackGeometry = new THREE.PlaneGeometry(this.trackWidth, this.trackLength);
        this.trackMesh = new THREE.Mesh(trackGeometry, this.trackMaterial);
        this.trackMesh.rotation.x = -Math.PI / 2;
        this.trackMesh.position.set(0, 0, -this.trackLength / 2);
        this.trackMesh.receiveShadow = true;
        this.scene.add(this.trackMesh);

        // Linha central GROSSA e visível
        this.lineMaterial = new THREE.MeshBasicMaterial({ color: 0x444444 });
        const centerLineGeometry = new THREE.PlaneGeometry(0.15, this.trackLength);
        this.centerLine = new THREE.Mesh(centerLineGeometry, this.lineMaterial);
        this.centerLine.rotation.x = -Math.PI / 2;
        this.centerLine.position.set(0, 0.02, -this.trackLength / 2);
        this.scene.add(this.centerLine);

        // Grid de tiles - linhas horizontais
        for (let i = 0; i < 100; i++) {
            const gridLine = new THREE.Mesh(
                new THREE.PlaneGeometry(this.trackWidth, 0.08),
                new THREE.MeshBasicMaterial({ color: 0xcccccc })
            );
            gridLine.rotation.x = -Math.PI / 2;
            gridLine.position.set(0, 0.015, -i * 8);
            this.scene.add(gridLine);
            this.gridLines.push(gridLine);
        }

        // Bordas da pista
        const borderGeometry = new THREE.PlaneGeometry(0.12, this.trackLength);
        const borderMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 });

        const leftBorder = new THREE.Mesh(borderGeometry, borderMaterial);
        leftBorder.rotation.x = -Math.PI / 2;
        leftBorder.position.set(-this.trackWidth / 2, 0.02, -this.trackLength / 2);
        this.scene.add(leftBorder);

        const rightBorder = new THREE.Mesh(borderGeometry, borderMaterial);
        rightBorder.rotation.x = -Math.PI / 2;
        rightBorder.position.set(this.trackWidth / 2, 0.02, -this.trackLength / 2);
        this.scene.add(rightBorder);

        // Chão lateral
        this.createGround();
    }

    createGround() {
        const groundWidth = 200;
        const groundGeometry = new THREE.PlaneGeometry(groundWidth, this.trackLength);

        this.groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x7ec850,
            roughness: 1
        });

        // Chão esquerdo
        this.leftGround = new THREE.Mesh(groundGeometry, this.groundMaterial);
        this.leftGround.rotation.x = -Math.PI / 2;
        this.leftGround.position.set(-groundWidth / 2 - this.trackWidth / 2, -0.01, -this.trackLength / 2);
        this.leftGround.receiveShadow = true;
        this.scene.add(this.leftGround);

        // Chão direito
        this.rightGround = new THREE.Mesh(groundGeometry, this.groundMaterial);
        this.rightGround.rotation.x = -Math.PI / 2;
        this.rightGround.position.set(groundWidth / 2 + this.trackWidth / 2, -0.01, -this.trackLength / 2);
        this.rightGround.receiveShadow = true;
        this.scene.add(this.rightGround);
    }

    applyScenarioColors(colors) {
        // Pista
        if (this.trackMaterial) {
            this.trackMaterial.color.setHex(colors.track);
        }

        // Linha central
        if (this.lineMaterial) {
            this.lineMaterial.color.setHex(colors.trackLine);
        }

        // Grid lines - mais claras que a linha central
        this.gridLines.forEach(line => {
            const baseColor = new THREE.Color(colors.track);
            baseColor.multiplyScalar(0.9);
            line.material.color.copy(baseColor);
        });

        // Chão
        if (this.groundMaterial) {
            this.groundMaterial.color.setHex(colors.ground);
        }
    }

    // Método chamado pelo ThemeManager
    setGroundColor(color) {
        if (this.groundMaterial) {
            this.groundMaterial.color.setHex(color);
        }
    }

    update(speed) {
        // Grid lines se movem com a pista
        this.gridLines.forEach(line => {
            line.position.z += speed;
            if (line.position.z > 8) {
                line.position.z -= 800;
            }
        });
    }
}
