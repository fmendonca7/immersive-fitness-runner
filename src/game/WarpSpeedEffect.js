/**
 * WarpSpeedEffect.js - Particle system for speed sensation
 * Creates "wind lines" or "star streaks" that move past the camera
 */

import * as THREE from 'three';

export class WarpSpeedEffect {
    constructor(scene) {
        this.scene = scene;
        this.particleCount = 200;
        this.particles = null;
        this.geometry = null;
        this.material = null;
        this.positions = [];
        this.velocities = [];

        // Configuration
        this.speed = 0.5;
        this.color = 0xffffff;
        this.opacity = 0.6;

        this.init();
    }

    init() {
        // Create geometry for lines
        // We use BufferGeometry with line segments
        // Each particle is a line segment defined by 2 vertices
        this.geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 6); // 2 points * 3 coords per particle

        // Reset positions scattered around the center (tunnel effect)
        for (let i = 0; i < this.particleCount; i++) {
            this.resetParticle(positions, i);
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // Material
        this.material = new THREE.LineBasicMaterial({
            color: this.color,
            transparent: true,
            opacity: this.opacity,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        // Mesh
        this.particles = new THREE.LineSegments(this.geometry, this.material);
        this.scene.add(this.particles);
    }

    resetParticle(positions, i) {
        // Random position in a wide tunnel around the camera
        // x: -20 to -5 OR 5 to 20 (avoid center)
        // y: 0 to 15
        // z: -100 to 0

        let x = (Math.random() - 0.5) * 50;
        // Keep away from center track (width ~10)
        if (Math.abs(x) < 8) x = x < 0 ? -8 - Math.random() * 5 : 8 + Math.random() * 5;

        const y = Math.random() * 20;
        const z = -Math.random() * 200; // Start far ahead

        // Point 1 (Head)
        positions[i * 6] = x;
        positions[i * 6 + 1] = y;
        positions[i * 6 + 2] = z;

        // Point 2 (Tail) - initially same as head, stretches with speed
        positions[i * 6 + 3] = x;
        positions[i * 6 + 4] = y;
        positions[i * 6 + 5] = z - 2; // Initial length
    }

    update(gameSpeed) {
        if (!this.particles) return;

        // Update positions based on speed
        const positions = this.geometry.attributes.position.array;

        // Enhance speed effect visually
        // Real game speed is slow (0.2 - 0.5), we want fast streak visual
        const visualSpeed = gameSpeed * 5;
        const streakLength = gameSpeed * 15;

        for (let i = 0; i < this.particleCount; i++) {
            // Get current Z
            let z = positions[i * 6 + 2];

            // Move towards camera (+z)
            z += visualSpeed;

            // If passed camera (z > 5), reset to far back
            if (z > 10) {
                // Reset X/Y/Z
                let x = (Math.random() - 0.5) * 60;
                if (Math.abs(x) < 8) x = x < 0 ? -8 - Math.random() * 5 : 8 + Math.random() * 5;
                const y = Math.random() * 25;
                z = -150 - Math.random() * 50;

                positions[i * 6] = x;
                positions[i * 6 + 1] = y;
                positions[i * 6 + 3] = x;
                positions[i * 6 + 4] = y;
            }

            // Update Z positions
            // Head
            positions[i * 6 + 2] = z;

            // Tail (drags behind head)
            positions[i * 6 + 5] = z - streakLength;
        }

        this.geometry.attributes.position.needsUpdate = true;
    }

    setVisibility(visible) {
        if (this.particles) {
            this.particles.visible = visible;
        }
    }
}
