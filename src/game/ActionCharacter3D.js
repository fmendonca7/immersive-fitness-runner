/**
 * ActionCharacter3D.js - Specialized class for rendering 3D action preview characters
 * Extends FBXCharacter with optimized settings for small icon-sized displays
 */

import * as THREE from 'three';
import { FBXCharacter } from './FBXCharacter.js';

export class ActionCharacter3D {
    /**
     * Map action types to FBX file paths
     * @param {string} action - Action type (run, jump, side, duck)
     * @returns {string} Path to FBX file
     */
    static getFBXPath(action) {
        const paths = {
            run: '/models/Running.fbx',
            jump: '/models/Jump.fbx',
            side: '/models/Dodging.fbx',
            duck: '/models/Air Squat.fbx',
            victory: '/models/Victory.fbx'
        };

        const path = paths[action.toLowerCase()];
        if (!path) {
            console.warn(`Unknown action type: ${action}`);
            return paths.run; // Fallback to running
        }

        return path;
    }

    /**
     * Factory method to create a complete action character with scene, camera, and renderer
     * @param {string} action - Action type (run, jump, side, duck)
     * @param {HTMLCanvasElement} canvas - Canvas element to render to
     * @returns {Promise<Object>} Object containing scene, camera, renderer, and character
     */
    static async create(action, canvas) {
        try {
            // Create scene with transparent background
            const scene = new THREE.Scene();
            scene.background = null; // Transparent background

            // Create camera optimized for small display
            const aspect = canvas.width / canvas.height;
            const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);

            // Adjust camera for Victory character which might be larger
            if (action === 'victory') {
                camera.position.set(0, 1.5, 4.0); // Further back
            } else {
                camera.position.set(0, 1.2, 2.5);
            }
            camera.lookAt(0, 1, 0);

            // Add much brighter lighting for better character visibility
            const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
            scene.add(ambientLight);

            const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
            mainLight.position.set(1.5, 2, 1.5);
            scene.add(mainLight);

            const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
            fillLight.position.set(-1.5, 1, 1);
            scene.add(fillLight);

            const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
            rimLight.position.set(-1, 1, -1);
            scene.add(rimLight);

            // Create renderer with transparency enabled
            const renderer = new THREE.WebGLRenderer({
                canvas,
                antialias: true,
                alpha: true // Enable transparency
            });
            renderer.setSize(canvas.width, canvas.height, false);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            // Load character
            const character = new FBXCharacter(scene);
            const modelPath = ActionCharacter3D.getFBXPath(action);

            await character.loadModel(modelPath);

            // Position and scale for icon display
            character.setPosition(0, 0, 0);

            // Special scaling for Victory character
            if (action === 'victory') {
                character.setScale(0.005); // Smaller scale for victory
            } else {
                character.setScale(0.01);
            }

            character.setRotation(0, 0, 0); // Face forward

            // Slow down animation speed for better visibility on transition screens
            character.setAnimationSpeed(0.6); // 60% of normal speed

            // Create animation loop
            const animate = () => {
                const delta = 0.016; // ~60fps
                character.update(delta);
                renderer.render(scene, camera);
                requestAnimationFrame(animate);
            };
            animate();

            console.log(`✅ Action character created: ${action}`);

            return {
                scene,
                camera,
                renderer,
                character,
                dispose: () => {
                    character.dispose();
                    renderer.dispose();
                }
            };

        } catch (error) {
            console.error(`Failed to create action character for ${action}:`, error);
            return null;
        }
    }
}
