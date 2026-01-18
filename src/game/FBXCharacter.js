/**
 * FBXCharacter.js - Helper class for loading and managing FBX character models
 * Handles loading Mixamo FBX files and playing animations
 */

import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

export class FBXCharacter {
    constructor(scene) {
        this.scene = scene;
        this.loader = new FBXLoader();
        this.model = null;
        this.mixer = null;
        this.currentAction = null;
        this.clock = new THREE.Clock();
    }

    /**
     * Load an FBX model file
     * @param {string} url - Path to the FBX file
     * @returns {Promise<THREE.Group>}
     */
    async loadModel(url) {
        return new Promise((resolve, reject) => {
            this.loader.load(
                url,
                (fbx) => {
                    this.model = fbx;

                    // Setup animation mixer if animations exist
                    if (fbx.animations && fbx.animations.length > 0) {
                        this.mixer = new THREE.AnimationMixer(fbx);
                        this.currentAction = this.mixer.clipAction(fbx.animations[0]);
                        this.currentAction.play();
                    }

                    // Add to scene
                    this.scene.add(fbx);

                    console.log('✅ FBX model loaded:', url);
                    resolve(fbx);
                },
                (progress) => {
                    const percent = (progress.loaded / progress.total) * 100;
                    console.log(`Loading FBX: ${percent.toFixed(0)}%`);
                },
                (error) => {
                    console.error('❌ Error loading FBX:', error);
                    reject(error);
                }
            );
        });
    }

    /**
     * Update animations (call in render loop)
     * @param {number} delta - Time delta
     */
    update(delta) {
        if (this.mixer) {
            this.mixer.update(delta);
        }
    }

    /**
     * Set position of the model
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    setPosition(x, y, z) {
        if (this.model) {
            this.model.position.set(x, y, z);
        }
    }

    /**
     * Set scale of the model
     * @param {number} scale - Uniform scale
     */
    setScale(scale) {
        if (this.model) {
            this.model.scale.set(scale, scale, scale);
        }
    }

    /**
     * Set rotation of the model
     * @param {number} x - Rotation around X axis (radians)
     * @param {number} y - Rotation around Y axis (radians)
     * @param {number} z - Rotation around Z axis (radians)
     */
    setRotation(x, y, z) {
        if (this.model) {
            this.model.rotation.set(x, y, z);
        }
    }

    /**
     * Remove model from scene
     */
    dispose() {
        if (this.model) {
            this.scene.remove(this.model);

            // Cleanup geometries and materials
            this.model.traverse((child) => {
                if (child.isMesh) {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(mat => mat.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                }
            });

            this.model = null;
        }

        if (this.mixer) {
            this.mixer.stopAllAction();
            this.mixer = null;
        }
    }

    /**
     * Show/hide the model
     * @param {boolean} visible
     */
    setVisible(visible) {
        if (this.model) {
            this.model.visible = visible;
        }
    }
}
