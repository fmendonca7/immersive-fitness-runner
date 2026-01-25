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
        // Create seamless grid texture
        const texture = this.createGridTexture();
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 40); // Repeat vertically 40 times

        // Material da pista - claro com textura
        this.trackMaterial = new THREE.MeshStandardMaterial({
            color: 0xf0f0f0,
            roughness: 0.6,
            metalness: 0.1,
            map: texture
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

    createGridTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const context = canvas.getContext('2d');

        // Draw white background
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, 512, 512);

        // Draw horizontal grid line at bottom
        context.fillStyle = '#cccccc';
        context.fillRect(0, 500, 512, 12);

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    createGround() {
        const groundWidth = 200;
        const groundGeometry = new THREE.PlaneGeometry(groundWidth, this.trackLength);

        // Create scrolling grass texture
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const context = canvas.getContext('2d');

        // Base color
        context.fillStyle = '#7ec850';
        context.fillRect(0, 0, 512, 512);

        // Noise/Texture details
        context.fillStyle = '#70b545';
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const w = 10 + Math.random() * 40;
            const h = 5 + Math.random() * 10;
            context.fillRect(x, y, w, h);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(20, 40);

        this.groundMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff, // Use white so texture color shows true
            map: texture,
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
        // Scroll track texture
        if (this.trackMaterial && this.trackMaterial.map) {
            // Adjust offset to simulate movement
            // Speed is ~0.3 per frame. Map repeats 40 times over 800 units -> 1 repeat per 20 units
            // So offset change = speed / 20
            // Increment offset to move texture "towards" camera (assuming standard UVs)
            this.trackMaterial.map.offset.y += speed / 20;
        }

        // Scroll ground texture
        if (this.groundMaterial && this.groundMaterial.map) {
            this.groundMaterial.map.offset.y += speed / 20;
        }
    }
}
