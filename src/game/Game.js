/**
 * Game.js - Main game class
 * Manages the loop, Three.js scene, and game states
 * Com suporte a 10 cenários temáticos e transições dinâmicas
 */

import * as THREE from 'three';
import { Player } from './Player.js';
import { Track } from './Track.js';
import { ObstacleManager } from './Obstacle.js';
import { ScoreManager } from './ScoreManager.js';
import { HUD } from '../ui/HUD.js';
import { Indicator } from '../ui/Indicator.js';
import { ThemeManager } from '../themes/ThemeManager.js';
import { ScenarioManager, SCENARIOS } from '../scenarios/ScenarioManager.js';
import { FBXCharacter } from './FBXCharacter.js';
import { ActionCharacter3D } from './ActionCharacter3D.js';

export class Game {
    constructor() {
        // Game state
        this.isRunning = false;
        this.isPaused = false;

        // Configuration
        this.phaseDurationMinutes = 4;
        this.actionMode = 'progressive';
        this.scenarioMode = 'random'; // random, specific
        this.selectedScenario = null;

        // Actions configuration per level
        this.levelActions = {
            1: ['jump'],
            2: ['jump', 'side'],
            3: ['jump', 'side', 'duck'],
            4: ['jump', 'side', 'duck']
        };

        // 100+ highly varied motivational phrases
        this.motivationalPhrases = [
            // Encorajamento positivo
            "YOU'RE DOING AMAZING!", "KEEP IT UP!", "YOU GOT THIS!",
            "BELIEVE IN YOURSELF!", "STAY STRONG!", "NEVER GIVE UP!",
            "YOU'RE A CHAMPION!", "KEEP GOING!", "ALMOST THERE!",
            "YOU'RE INCREDIBLE!", "SO PROUD OF YOU!", "EXCELLENT WORK!",
            "YOU'RE KILLING IT!", "THAT'S THE SPIRIT!", "AMAZING EFFORT!",
            // Energia e poder
            "FEEL THE ENERGY!", "UNLEASH YOUR POWER!", "LET'S GO!",
            "FULL POWER!", "MAXIMUM EFFORT!", "GIVE IT ALL!",
            "POWER UP!", "ENERGY BOOST!", "FIRE IT UP!",
            "FEEL THE BURN!", "EMBRACE THE FIRE!", "IGNITE YOUR SOUL!",
            "ELECTRIC ENERGY!", "SUPERCHARGED!", "TURBO MODE!",
            // Desafio e superação
            "PUSH YOUR LIMITS!", "CHALLENGE ACCEPTED!", "TIME TO LEVEL UP!",
            "BREAK YOUR RECORDS!", "NO LIMITS!", "GO BEYOND!",
            "PUSH HARDER!", "RISE UP!", "COMPETE WITH YOURSELF!",
            "DEFY YOUR LIMITS!", "BREAK THE BARRIER!", "SHATTER EXPECTATIONS!",
            "YOU CAN DO MORE!", "DIG DEEPER!", "FIND YOUR STRENGTH!",
            // Celebração
            "LEVEL UP!", "NEW PERSONAL BEST!", "INCREDIBLE!",
            "AWESOME WORK!", "FANTASTIC!", "LEGENDARY!",
            "UNSTOPPABLE!", "ON FIRE!", "CRUSHING IT!",
            "PHENOMENAL!", "SPECTACULAR!", "MAGNIFICENT!",
            "BRILLIANT!", "OUTSTANDING!", "EXCEPTIONAL!",
            // Ritmo e foco
            "FIND YOUR RHYTHM!", "STAY IN THE ZONE!", "FEEL THE BEAT!",
            "KEEP THE PACE!", "STEADY AND STRONG!", "IN THE GROOVE!",
            "STAY FOCUSED!", "LOCK IN!", "CONCENTRATE!",
            "MIND OVER MATTER!", "PURE FOCUS!", "LASER SHARP!",
            // Motivação guerreira
            "THIS IS YOUR MOMENT!", "MAKE IT COUNT!", "EVERY REP MATTERS!",
            "STRONGER EVERY DAY!", "BUILT DIFFERENT!", "WARRIOR MODE!",
            "BEAST MODE ON!", "NO EXCUSES!", "JUST DO IT!",
            "FIGHT FOR IT!", "EARN IT!", "OWN THIS MOMENT!",
            "BE RELENTLESS!", "NEVER STOP!", "KEEP FIGHTING!",
            // Inspiração
            "DREAM BIG, WORK HARD!", "SUCCESS IS EARNED!", "BE LEGENDARY!",
            "MAKE YOURSELF PROUD!", "TODAY YOU WIN!", "BE YOUR BEST!",
            "GREATNESS AWAITS!", "WRITE YOUR STORY!", "CREATE YOUR LEGACY!",
            // Fitness específico
            "SWEAT IS SUCCESS!", "PAIN IS TEMPORARY!", "RESULTS ARE FOREVER!",
            "TRAIN INSANE!", "NO PAIN NO GAIN!", "WORK IT OUT!",
            "GET FIT OR DIE TRYING!", "SCULPT YOUR BODY!", "BUILD YOUR POWER!",
            // Divertido
            "LIKE A BOSS!", "TOTALLY AWESOME!", "ROCK STAR!",
            "MVP MATERIAL!", "ABSOLUTE LEGEND!", "PURE GOLD!",
            "NEXT LEVEL!", "TOP TIER!", "ELITE STATUS!",
            // Curtos e impactantes
            "LET'S GOOO!", "YESSS!", "BOOM!",
            "FIRE!", "EPIC!", "PERFECT!",
            "WOW!", "INSANE!", "GODLIKE!"
        ];

        // Frases de descanso para transições
        this.restPhrases = [
            "TAKE A DEEP BREATH...",
            "REST & RECOVER",
            "BREATHE IN... BREATHE OUT...",
            "HYDRATE & PREPARE",
            "CATCH YOUR BREATH",
            "RECOVERY TIME",
            "RELAX YOUR MUSCLES",
            "SHAKE IT OFF",
            "PREPARE FOR NEXT LEVEL",
            "RESET YOUR MIND",
            "INHALE... EXHALE...",
            "RECHARGE YOUR ENERGY",
            "QUICK BREATHER",
            "CALM YOUR HEART RATE",
            "GET READY AGAIN"
        ];
        this.usedPhrases = [];
        this.usedRestPhrases = [];

        // CTAs do YouTube para transições
        this.youtubeCTAs = {
            // Transição 1->2: SUBSCRIBE
            subscribe: [
                { icon: '🔔', message: 'HIT SUBSCRIBE IF YOU\'RE SWEATING!' },
                { icon: '🔔', message: 'SUBSCRIBE TO KEEP THE ENERGY GOING!' },
                { icon: '🔔', message: 'SMASH THAT SUBSCRIBE BUTTON!' },
                { icon: '🔔', message: 'SUBSCRIBE FOR MORE INTENSE WORKOUTS!' },
                { icon: '🔔', message: 'JOIN THE FITNESS FAMILY - SUBSCRIBE!' },
                { icon: '🔔', message: 'DON\'T FORGET TO SUBSCRIBE!' },
                { icon: '🔔', message: 'SUBSCRIBE & GET FIT WITH US!' },
                { icon: '🔔', message: 'TAP SUBSCRIBE TO LEVEL UP YOUR FITNESS!' },
                { icon: '🔔', message: 'SUBSCRIBE IF YOU WANT MORE CHALLENGES!' },
                { icon: '🔔', message: 'HIT THAT BELL ICON - SUBSCRIBE NOW!' }
            ],
            // Transição 2->3: LIKE
            like: [
                { icon: '👍', message: 'SMASH THAT LIKE BUTTON!' },
                { icon: '👍', message: 'IF YOU\'RE FEELING THE BURN, HIT LIKE!' },
                { icon: '👍', message: 'DROP A LIKE IF YOU\'RE CRUSHING IT!' },
                { icon: '👍', message: 'LIKE IF THIS WORKOUT IS AMAZING!' },
                { icon: '👍', message: 'SHOW SOME LOVE - HIT LIKE!' },
                { icon: '👍', message: 'ENJOYING THIS? SMASH LIKE!' },
                { icon: '👍', message: 'THUMBS UP IF YOU\'RE GOING HARD!' },
                { icon: '👍', message: 'LIKE FOR MORE EPIC WORKOUTS!' },
                { icon: '👍', message: 'FEELING IT? TAP THAT LIKE!' },
                { icon: '👍', message: 'GIVE US A LIKE IF YOU\'RE SWEATING!' }
            ],
            // Transição 3->4: COMMENT
            comment: [
                { icon: '💬', message: 'DROP A COMMENT - HOW ARE YOU FEELING?' },
                { icon: '💬', message: 'COMMENT YOUR PROGRESS BELOW!' },
                { icon: '💬', message: 'TELL US IN THE COMMENTS - ARE YOU READY?' },
                { icon: '💬', message: 'LEAVE A COMMENT WITH YOUR GOAL!' },
                { icon: '💬', message: 'COMMENT IF YOU MADE IT THIS FAR!' },
                { icon: '💬', message: 'SHARE YOUR THOUGHTS IN THE COMMENTS!' },
                { icon: '💬', message: 'COMMENT YOUR FAVORITE EXERCISE!' },
                { icon: '💬', message: 'DROP A 🔥 IN THE COMMENTS!' },
                { icon: '💬', message: 'TELL US HOW YOU\'RE DOING - COMMENT!' },
                { icon: '💬', message: 'COMMENT IF YOU\'RE FEELING STRONG!' }
            ]
        };
        this.usedCTAs = {
            subscribe: [],
            like: [],
            comment: []
        };

        // Velocidade base
        this.baseSpeed = 0.30;
        this.speed = this.baseSpeed;
        this.maxSpeed = this.baseSpeed;

        // Tempo de pausa entre fases (10 segundos para descanso)
        this.intermissionDuration = 10;

        // 128 BPM = 469ms por beat
        this.beatInterval = 469;

        // Get Ready Phrases para tela pré-level
        this.getReadyPhrases = [
            "GET READY!",
            "PREPARE YOURSELF!",
            "FOCUS UP!",
            "HERE WE GO!",
            "SHOWTIME!",
            "TIME TO SHINE!",
            "BRING IT ON!",
            "LET'S DO THIS!",
            "GAME ON!",
            "LOCK AND LOAD!",
            "IT'S GO TIME!",
            "READY, SET...",
            "UNLEASH YOUR POWER!",
            "BEAST MODE ACTIVATED!",
            "TIME TO DOMINATE!",
            "SHOW YOUR STRENGTH!"
        ];

        // Three.js
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();

        // Componentes do jogo
        this.player = null;
        this.track = null;
        this.obstacleManager = null;
        this.scoreManager = null;
        this.hud = null;
        this.indicator = null;
        this.themeManager = null;
        this.scenarioManager = null;

        // Persistent 3D character cache (reuse across transitions to save WebGL contexts)
        this.cached3DCharacters = null;

        // Inicialização
        this.init();
    }

    init() {
        this.setupThreeJS();
        this.setupComponents();
        this.setupEventListeners();
        this.animate();
    }

    setupThreeJS() {
        const container = document.getElementById('game-container');

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 1.6, 0);
        this.camera.lookAt(0, 1.6, -100);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
    }

    setupComponents() {
        // Novo ScenarioManager
        this.scenarioManager = new ScenarioManager(this.scene, this);

        this.themeManager = new ThemeManager(this.scene, this);
        this.track = new Track(this.scene);
        this.player = new Player(this);
        this.obstacleManager = new ObstacleManager(this.scene, this);
        this.scoreManager = new ScoreManager();
        this.hud = new HUD(this);
        this.indicator = new Indicator();

        // Aplicar cenário inicial (primeiro da lista)
        const initialScenario = this.scenarioManager.getNextScenario();
        this.scenarioManager.applyScenario(initialScenario);

        this.themeManager.startPhase(1);

        // Setup 3D running indicator
        this.setup3DRunningIndicator();
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onResize());

        // Botão iniciar
        document.getElementById('start-button').addEventListener('click', () => this.startWithIntro());

        // Botão encerrar
        document.getElementById('finish-button').addEventListener('click', () => this.finishWorkout());

        // Seletor de duração
        document.querySelectorAll('.duration-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.duration-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.phaseDurationMinutes = parseInt(e.target.dataset.minutes);
                this.themeManager.phaseDuration = this.phaseDurationMinutes * 60;
            });
        });

        // Seletor de modo de ações
        document.querySelectorAll('.action-mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget;
                document.querySelectorAll('.action-mode-btn').forEach(b => b.classList.remove('active'));
                target.classList.add('active');
                this.actionMode = target.dataset.mode;

                const customConfig = document.getElementById('custom-actions-config');
                if (this.actionMode === 'custom') {
                    customConfig.classList.remove('hidden');
                } else {
                    customConfig.classList.add('hidden');
                }

                this.updateLevelActions();
            });
        });

        // Seletor de cenário
        document.querySelectorAll('.scenario-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget;
                document.querySelectorAll('.scenario-btn').forEach(b => b.classList.remove('active'));
                target.classList.add('active');

                const scenarioId = target.dataset.scenario;
                if (scenarioId === 'random') {
                    this.scenarioMode = 'random';
                    this.selectedScenario = null;
                } else {
                    this.scenarioMode = 'specific';
                    this.selectedScenario = scenarioId; // Sem toUpperCase
                }
            });
        });

        // Checkboxes de ações personalizadas
        document.querySelectorAll('.action-toggle input').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateLevelActions());
        });

        // Controles do teclado
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
    }

    updateLevelActions() {
        if (this.actionMode === 'progressive') {
            this.levelActions = {
                1: ['jump'],
                2: ['jump', 'side'],
                3: ['jump', 'side', 'duck'],
                4: ['jump', 'side', 'duck']
            };
        } else if (this.actionMode === 'all') {
            this.levelActions = {
                1: ['jump', 'side', 'duck'],
                2: ['jump', 'side', 'duck'],
                3: ['jump', 'side', 'duck'],
                4: ['jump', 'side', 'duck']
            };
        } else if (this.actionMode === 'custom') {
            for (let level = 1; level <= 4; level++) {
                const levelConfig = document.querySelector(`.level-config[data-level="${level}"]`);
                const actions = [];

                levelConfig.querySelectorAll('input[data-action]').forEach(checkbox => {
                    if (checkbox.checked) {
                        actions.push(checkbox.dataset.action);
                    }
                });

                this.levelActions[level] = actions;
            }
        }
    }

    getRandomPhrase() {
        const available = this.motivationalPhrases.filter(p => !this.usedPhrases.includes(p));

        if (available.length === 0) {
            this.usedPhrases = [];
            return this.motivationalPhrases[Math.floor(Math.random() * this.motivationalPhrases.length)];
        }

        const phrase = available[Math.floor(Math.random() * available.length)];
        this.usedPhrases.push(phrase);

        if (this.usedPhrases.length > 10) {
            this.usedPhrases.shift();
        }

        return phrase;
    }

    async animatePhraseSequence(phrases, container, delayBetween = 800) {
        container.innerHTML = '';

        for (const phrase of phrases) {
            await this.animatePhraseLine(phrase, container);
            await this.wait(delayBetween);
        }
    }

    async animatePhraseLine(phrase, container) {
        const line = document.createElement('div');
        line.className = 'intro-line';
        container.appendChild(line);

        const words = phrase.split(' ');
        let delay = 0;

        for (const word of words) {
            const wordWrapper = document.createElement('span');
            wordWrapper.className = 'word-wrapper';

            for (const char of word) {
                const span = document.createElement('span');
                span.className = 'char';
                span.textContent = char;
                span.style.animationDelay = `${delay}ms`;
                wordWrapper.appendChild(span);
                delay += 60;
            }

            line.appendChild(wordWrapper);
            // Delay for space
            delay += 60;
        }

        await this.wait(delay + 600);
    }

    animatePhrase(phrase, container) {
        container.innerHTML = '';

        const words = phrase.split(' ');
        let delay = 0;

        words.forEach((word) => {
            const wordWrapper = document.createElement('span');
            wordWrapper.className = 'word-wrapper';

            for (const char of word) {
                const span = document.createElement('span');
                span.className = 'char';
                span.textContent = char;
                span.style.animationDelay = `${delay}ms`;
                wordWrapper.appendChild(span);
                delay += 70;
            }

            container.appendChild(wordWrapper);
            delay += 70;
        });
    }

    getActionIcons() {
        return {
            run: {
                name: 'RUN',
                svg: `<svg viewBox="0 0 80 100">
          <circle cx="40" cy="12" r="8" stroke-width="2"/>
          <path d="M40 20 L35 45 M35 45 L25 75 M35 45 L50 70"/>
          <path d="M35 30 L20 40 M35 30 L55 35"/>
        </svg>`
            },
            jump: {
                name: 'JUMP',
                svg: `<svg viewBox="0 0 80 100">
          <circle cx="40" cy="15" r="8" stroke-width="2"/>
          <path d="M40 23 L40 50"/>
          <path d="M40 33 L25 45 M40 33 L55 45"/>
          <path d="M40 50 L30 75 M40 50 L50 75"/>
          <path d="M25 8 L40 0 L55 8" stroke-width="3"/>
        </svg>`
            },
            duck: {
                name: 'DUCK',
                svg: `<svg viewBox="0 0 80 100">
          <circle cx="40" cy="45" r="8" stroke-width="2"/>
          <path d="M40 53 L40 70"/>
          <path d="M40 60 L25 50 M40 60 L55 50"/>
          <path d="M40 70 L30 85 L25 85 M40 70 L50 85 L55 85"/>
          <path d="M25 35 L40 30 L55 35" stroke-width="3"/>
        </svg>`
            },
            side: {
                name: 'SIDE',
                svg: `<svg viewBox="0 0 80 100">
          <circle cx="40" cy="15" r="8" stroke-width="2"/>
          <path d="M40 23 L40 55"/>
          <path d="M40 33 L25 43 M40 33 L55 43"/>
          <path d="M40 55 L30 80 M40 55 L50 80"/>
          <path d="M10 50 L25 50 M55 50 L70 50" stroke-width="3"/>
          <path d="M15 45 L10 50 L15 55 M65 45 L70 50 L65 55"/>
        </svg>`
            }
        };
    }

    async ensureCached3DCharacters() {
        // Create persistent 3D characters ONCE and reuse them
        if (this.cached3DCharacters) {
            console.log('✅ [3D Cache] Using cached characters');
            return;
        }

        console.log('🎨 [3D Cache] Creating persistent character cache...');
        this.cached3DCharacters = {};

        const actionTypes = ['run', 'jump', 'duck', 'side'];
        for (const action of actionTypes) {
            const canvas = document.createElement('canvas');
            canvas.width = 500;
            canvas.height = 650;

            const character = await ActionCharacter3D.create(action, canvas);
            this.cached3DCharacters[action] = { canvas, character };
            console.log(`✅ [3D Cache] Created ${action} character`);
        }

        console.log('✅ [3D Cache] All characters cached (4 WebGL contexts total)');
    }

    async render3DLevelActions(level, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        // Ensure we have the 3D characters cached
        await this.ensureCached3DCharacters();

        const actions = ['run', ...this.levelActions[level]];

        // Reuse cached 3D characters by copying their canvas content
        for (const action of actions) {
            const wrapper = document.createElement('div');
            wrapper.className = 'action-preview';

            const cached = this.cached3DCharacters[action];
            if (cached) {
                // Create new canvas and copy the rendered 3D content
                const displayCanvas = document.createElement('canvas');
                displayCanvas.width = 500;
                displayCanvas.height = 650;
                displayCanvas.className = 'action-3d-canvas';

                // Copy the cached WebGL rendering to 2D context
                const ctx = displayCanvas.getContext('2d');
                ctx.drawImage(cached.canvas, 0, 0);

                const label = document.createElement('div');
                label.className = 'action-name';
                label.textContent = action.toUpperCase();

                wrapper.appendChild(displayCanvas);
                wrapper.appendChild(label);
            }

            container.appendChild(wrapper);
        }
    }

    // Legacy method kept for backward compatibility if needed
    renderLevelActions(level) {
        // Redirect to 3D version
        this.render3DLevelActions(level, 'level-actions');
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onKeyDown(event) {
        if (!this.isRunning) return;

        const currentLevel = this.themeManager.currentPhase;
        const allowedActions = this.levelActions[currentLevel] || [];

        switch (event.code) {
            case 'ArrowLeft':
            case 'KeyA':
                if (allowedActions.includes('side')) {
                    this.player.moveLeft();
                }
                break;
            case 'ArrowRight':
            case 'KeyD':
                if (allowedActions.includes('side')) {
                    this.player.moveRight();
                }
                break;
            case 'ArrowUp':
            case 'KeyW':
            case 'Space':
                event.preventDefault();
                if (allowedActions.includes('jump')) {
                    this.player.jump();
                }
                break;
            case 'ArrowDown':
            case 'KeyS':
                if (allowedActions.includes('duck')) {
                    this.player.duck();
                }
                break;
            case 'Escape':
                this.togglePause();
                break;
        }
    }

    onKeyUp(event) {
        if (!this.isRunning) return;

        if (event.code === 'ArrowDown' || event.code === 'KeyS') {
            this.player.standUp();
        }
    }

    async startWithIntro() {
        console.log('[DEBUG] startWithIntro called');
        document.getElementById('menu').classList.add('hidden');

        // Mostrar intro com níveis
        console.log('[DEBUG] Starting intro sequence');
        await this.showIntroSequence();
        console.log('[DEBUG] Intro sequence complete');

        this.updateLevelActions();
        this.themeManager.phaseDuration = this.phaseDurationMinutes * 60;

        // Aplicar cenário do primeiro nível
        this.scenarioManager.setMode(this.scenarioMode, this.selectedScenario);
        const scenario = this.scenarioManager.getNextScenario();
        this.scenarioManager.applyScenario(scenario);
        this.obstacleManager.applyScenarioStyle(scenario.colors);

        this.obstacleManager.setAllowedTypes(this.levelActions[1]);

        // Show Pre-Level Screen
        console.log('[DEBUG] Calling showPreLevelScreen(1)');
        await this.showPreLevelScreen(1);
        console.log('[DEBUG] showPreLevelScreen(1) complete');

        // Start phase AFTER Get Ready screen to avoid premature rendering
        this.themeManager.startPhase(1);

        // Show HUD and Running Indicator AFTER Get Ready screen
        document.getElementById('hud').classList.remove('hidden');
        document.getElementById('running-indicator').classList.remove('hidden');

        await this.playCountdown();

        this.isRunning = true;
        this.clock.start();
    }

    async showIntroSequence() {
        const transition = document.getElementById('level-transition');
        const phraseContainer = document.getElementById('motivational-phrase');
        const levelNumber = document.getElementById('level-number');
        const actionsContainer = document.getElementById('level-actions');
        const timerEl = document.getElementById('transition-countdown');
        const timerProgress = document.getElementById('timer-progress');

        // Esconder elementos de nível
        levelNumber.textContent = '';
        actionsContainer.innerHTML = '';
        timerEl.parentElement.style.display = 'none';

        transition.classList.remove('hidden');

        const duration = this.phaseDurationMinutes;
        const phases = [
            { name: 'WARM UP', level: 1 },
            { name: 'CARDIO', level: 2 },
            { name: 'ENDURANCE', level: 3 },
            { name: 'POWER', level: 4 }
        ];

        // Sequência de intro
        await this.animatePhraseSequence([
            "GET READY FOR YOUR WORKOUT!",
            `4 LEVELS • ${duration} MINUTES EACH`,
            "KEEP RUNNING IN PLACE THROUGHOUT!"
        ], phraseContainer, 600);

        await this.wait(500);
        phraseContainer.innerHTML = '';

        // Mostrar cada nível
        for (const phase of phases) {
            await this.animatePhraseLine(`LEVEL ${phase.level}: ${phase.name} (${duration}:00)`, phraseContainer);
            await this.wait(400);
        }

        await this.wait(600);

        // Frase final - LET'S GO! com fonte grande
        phraseContainer.innerHTML = '';
        const letsGoDiv = document.createElement('div');
        letsGoDiv.className = 'fullscreen-text';
        letsGoDiv.textContent = "LET'S GO!";
        phraseContainer.appendChild(letsGoDiv);
        await this.wait(800);

        // Pre-show pre-level screen BEFORE hiding transition
        const preLevelScreen = document.getElementById('pre-level-screen');
        preLevelScreen.classList.remove('hidden');

        // Small delay to let pre-level render
        await this.wait(50);

        // Now hide transition (no black screen!)
        transition.classList.add('hidden');
        timerEl.parentElement.style.display = '';
    }

    async playCountdown() {
        const overlay = document.getElementById('countdown-overlay');
        const numberEl = document.getElementById('countdown-number');

        overlay.classList.remove('hidden');

        const counts = ['4', '3', '2', '1', 'GO!'];

        for (let i = 0; i < counts.length; i++) {
            const count = counts[i];
            numberEl.textContent = count;
            numberEl.className = 'countdown-number' + (count === 'GO!' ? ' go' : '');

            numberEl.style.animation = 'none';
            numberEl.offsetHeight;
            numberEl.style.animation = '';

            await this.wait(this.beatInterval);
        }

        overlay.classList.add('hidden');
    }

    async showLevelTransition(level) {
        const transition = document.getElementById('level-transition');
        const content = transition.querySelector('.transition-content');

        // Get CTA for this level
        const cta = this.getCTAForTransition(level);

        // Get scenario for this level
        const scenario = this.scenarioManager.getNextScenario();

        // Show transition screen
        transition.classList.remove('hidden');
        content.innerHTML = ''; // Clear all content

        // ===== STAGE 1: REST PHRASE (0-2s) =====
        const restPhrase = this.getRandomRestPhrase();
        const restText = document.createElement('div');
        restText.className = 'fullscreen-text';
        restText.textContent = restPhrase;
        content.appendChild(restText);

        await this.wait(1800);
        restText.classList.add('fade-out');
        await this.wait(500);
        content.innerHTML = '';

        // ===== STAGE 2: MOTIVATIONAL PHRASE (2-4s) =====
        const motivationalPhrase = this.getRandomPhrase();
        const motivText = document.createElement('div');
        motivText.className = 'fullscreen-text';
        motivText.textContent = motivationalPhrase;
        content.appendChild(motivText);

        await this.wait(1800);
        motivText.classList.add('fade-out');
        await this.wait(500);
        content.innerHTML = '';

        // ===== STAGE 3: LEVEL + CHARACTERS (6-14s) =====
        // Create level display
        const levelContainer = document.createElement('div');
        levelContainer.style.cssText = 'display: flex; flex-direction: column; align-items: center; gap: 30px;';

        // Add "HOW TO PLAY" header (same as LEVEL 1)
        const howToPlayText = document.createElement('div');
        howToPlayText.className = 'how-to-play-title';
        howToPlayText.textContent = 'HOW TO PLAY';
        levelContainer.appendChild(howToPlayText);

        // Level number (same class and style as LEVEL 1)
        const levelText = document.createElement('div');
        levelText.className = 'pre-level-number';
        levelText.style.whiteSpace = 'nowrap';
        levelText.textContent = `LEVEL ${level}`;
        levelContainer.appendChild(levelText);

        // Create characters container
        const actionsContainer = document.createElement('div');
        actionsContainer.id = 'level-actions-temp';
        actionsContainer.className = 'action-3d-container';
        actionsContainer.style.opacity = '0';
        levelContainer.appendChild(actionsContainer);

        content.appendChild(levelContainer);

        // Render 3D characters
        await this.render3DLevelActions(level, 'level-actions-temp');

        // Fade in characters after level appears
        await this.wait(800);
        actionsContainer.style.transition = 'opacity 0.6s ease';
        actionsContainer.style.opacity = '1';

        await this.wait(6400); // 8 seconds total display time

        // Fade out
        levelContainer.style.transition = 'opacity 0.5s ease';
        levelContainer.style.opacity = '0';
        await this.wait(500);


        content.innerHTML = '';

        // ===== STAGE 4: CTA + SCENARIO + TIMER (14-20s) =====
        const ctaStage = document.createElement('div');
        ctaStage.style.cssText = 'display: flex; flex-direction: column; align-items: center; gap: 30px;';

        // Scenario name display
        const scenarioNameEl = document.createElement('div');
        scenarioNameEl.style.cssText = `
            font-family: 'Lilita One', 'Bebas Neue', cursive;
            font-size: 8rem;
            color: #FFFFFF;
            text-align: center;
            letter-spacing: 2px;
            text-transform: uppercase;
            text-shadow:
                -4px -4px 0 #000,
                4px -4px 0 #000,
                -4px 4px 0 #000,
                4px 4px 0 #000,
                0 6px 12px rgba(0, 0, 0, 0.8);
        `;
        scenarioNameEl.textContent = scenario.name;
        ctaStage.appendChild(scenarioNameEl);

        // CTA if available
        if (cta) {
            // Determine background color based on CTA type
            let bgColor = '#FF0000'; // Red for Subscribe
            if (cta.message.includes('LIKE')) {
                bgColor = '#0066FF'; // Blue for Like
            } else if (cta.message.includes('COMMENT')) {
                bgColor = '#00CC00'; // Green for Comment  
            }

            const ctaBox = document.createElement('div');
            ctaBox.style.cssText = `
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 15px;
                padding: 35px 60px;
                background: ${bgColor};
                border: none;
                border-radius: 25px;
                animation: ctaPulse 2s ease-in-out infinite;
                cursor: pointer;
            `;

            const ctaIconEl = document.createElement('div');
            ctaIconEl.style.cssText = 'font-size: 70px;';
            ctaIconEl.textContent = cta.icon;

            const ctaMessageEl = document.createElement('div');
            ctaMessageEl.style.cssText = `
                font-family: 'Lilita One', 'Bebas Neue', cursive;
                font-size: 4rem;
                color: #FFFFFF;
                text-align: center;
                letter-spacing: 2px;
                text-transform: uppercase;
                text-shadow:
                    -3px -3px 0 #000,
                    3px -3px 0 #000,
                    -3px 3px 0 #000,
                    3px 3px 0 #000,
                    0 4px 8px rgba(0, 0, 0, 0.8);
            `;
            ctaMessageEl.textContent = cta.message;

            ctaBox.appendChild(ctaIconEl);
            ctaBox.appendChild(ctaMessageEl);
            ctaStage.appendChild(ctaBox);
        }

        // Timer
        const timerContainer = document.createElement('div');
        timerContainer.innerHTML = `
            <div class="timer-ring">
                <svg viewBox="0 0 100 100">
                    <circle class="timer-bg" cx="50" cy="50" r="45" style="stroke: rgba(255,255,255,0.2);" />
                    <circle id="timer-progress-temp" class="timer-progress" cx="50" cy="50" r="45" style="stroke: #ffffff;" />
                </svg>
                <span id="countdown-temp" style="color: #ffffff;">5</span>
            </div>
        `;
        timerContainer.style.cssText = 'margin-top: 20px;';
        ctaStage.appendChild(timerContainer);

        content.appendChild(ctaStage);

        // Apply scenario changes BEFORE countdown so scene is ready
        try {
            if (!scenario) {
                console.warn('[Level] Scenario missing! Using fallback.');
                // Fallback to a safe scenario (City)
                const safeScenario = this.scenarioManager.getScenarioList().find(s => s.id === 'city');
                this.scenarioManager.applyScenario(safeScenario);
                this.obstacleManager.applyScenarioStyle(safeScenario.colors);
            } else {
                console.log(`[Level ${level}] Applying scenario: ${scenario.name} (${scenario.id})`);
                this.scenarioManager.applyScenario(scenario);
                this.obstacleManager.applyScenarioStyle(scenario.colors);
            }
        } catch (error) {
            console.error('[Level] Failed to apply scenario:', error);
        }

        // Verify background was set
        console.log('[Level] Current scene background:', this.scene.background ? '#' + this.scene.background.getHexString() : 'NULL');

        // Countdown 5 seconds
        const circumference = 283;
        const timerProgressEl = document.getElementById('timer-progress-temp');
        const countdownEl = document.getElementById('countdown-temp');

        for (let i = 5; i > 0; i--) {
            countdownEl.textContent = i;
            const progress = (5 - i) / 5;
            timerProgressEl.style.strokeDashoffset = circumference * (1 - progress);
            await this.wait(1000);
        }

        // Hide transition
        transition.classList.add('hidden');
        content.innerHTML = '';
    }

    getCTAForTransition(level) {
        // Retorna CTA baseado no nível que está COMEÇANDO
        // level 2 = veio de 1->2 = SUBSCRIBE
        // level 3 = veio de 2->3 = LIKE  
        // level 4 = veio de 3->4 = COMMENT

        let ctaType = null;
        if (level === 2) ctaType = 'subscribe';
        else if (level === 3) ctaType = 'like';
        else if (level === 4) ctaType = 'comment';

        if (!ctaType) return null;

        // Pegar CTA aleatória não usada
        const availableCTAs = this.youtubeCTAs[ctaType];
        const unusedCTAs = availableCTAs.filter((_, index) =>
            !this.usedCTAs[ctaType].includes(index)
        );

        // Se todos foram usados, resetar
        if (unusedCTAs.length === 0) {
            this.usedCTAs[ctaType] = [];
            return availableCTAs[Math.floor(Math.random() * availableCTAs.length)];
        }

        // Pegar uma CTA aleatória dos não usados
        const randomIndex = Math.floor(Math.random() * unusedCTAs.length);
        const selectedCTA = unusedCTAs[randomIndex];
        const originalIndex = availableCTAs.indexOf(selectedCTA);
        this.usedCTAs[ctaType].push(originalIndex);

        return selectedCTA;
    }

    getRandomRestPhrase() {
        const available = this.restPhrases.filter(p => !this.usedRestPhrases.includes(p));

        if (available.length === 0) {
            this.usedRestPhrases = [];
            return this.restPhrases[Math.floor(Math.random() * this.restPhrases.length)];
        }

        const phrase = available[Math.floor(Math.random() * available.length)];
        this.usedRestPhrases.push(phrase);

        if (this.usedRestPhrases.length > 5) {
            this.usedRestPhrases.shift();
        }

        return phrase;
    }

    async showPreLevelScreen(level) {
        console.log(`[DEBUG showPreLevelScreen] Started for level ${level}`);
        const screen = document.getElementById('pre-level-screen');
        const levelNumber = document.getElementById('pre-level-number');
        const actionsContainer = document.getElementById('pre-level-actions');
        const countdown = document.getElementById('pre-level-countdown');
        const timerProgress = document.getElementById('pre-level-timer-progress');

        console.log('[DEBUG showPreLevelScreen] Elements found:', { screen, levelNumber, countdown, timerProgress });

        // Hide game canvas to prevent level from showing in background
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            console.log('[DEBUG showPreLevelScreen] Hiding game canvas');
            gameContainer.style.opacity = '0';
        }

        // Set level number
        levelNumber.textContent = `LEVEL ${level}`;

        // Render 3D character actions for this level (similar to transition screen)
        console.log('[DEBUG showPreLevelScreen] Rendering 3D actions');
        await this.render3DLevelActions(level, 'pre-level-actions');
        console.log('[DEBUG showPreLevelScreen] 3D actions rendered');

        // Show screen
        console.log('[DEBUG showPreLevelScreen] Showing screen');
        screen.classList.remove('hidden');

        // Display for 10 seconds with countdown timer (same as transition intermission)
        const duration = 10; // seconds
        const circumference = 283; // Same as transition timer

        for (let i = duration; i > 0; i--) {
            countdown.textContent = i;
            const progress = (duration - i) / duration;
            timerProgress.style.strokeDashoffset = circumference * (1 - progress);
            await this.wait(1000);
        }

        console.log('[DEBUG showPreLevelScreen] Display duration complete');

        // Cleanup action characters
        if (this.actionCharacters) {
            this.actionCharacters.forEach(char => {
                if (char && char.dispose) {
                    char.dispose();
                }
            });
            this.actionCharacters = [];
        }

        // Hide screen
        console.log('[DEBUG showPreLevelScreen] Hiding screen');
        screen.classList.add('hidden');

        // Show game canvas again
        if (gameContainer) {
            console.log('[DEBUG showPreLevelScreen] Showing game canvas');
            gameContainer.style.opacity = '1';
        }

        console.log('[DEBUG showPreLevelScreen] Complete');
    }


    async setup3DRunningIndicator() {
        try {
            const canvas = document.getElementById('running-character-canvas');
            if (!canvas) return;

            // Setup scene
            const scene = new THREE.Scene();
            scene.background = null; // Transparent background

            // Camera
            const camera = new THREE.PerspectiveCamera(50, canvas.width / canvas.height, 0.1, 1000);
            camera.position.set(0, 1, 2.5);
            camera.lookAt(0, 1, 0);

            // Lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0x00ff88, 0.9);
            directionalLight.position.set(1, 2, 1);
            scene.add(directionalLight);

            // Renderer
            const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
            renderer.setSize(canvas.width, canvas.height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            // Load running character
            const character = new FBXCharacter(scene);
            await character.loadModel('/models/Running.fbx');

            // Position and scale
            character.setPosition(0, 0.2, 0);
            character.setScale(0.008);
            character.setRotation(0, 0, 0); // Face forward

            // Store references
            this.runningIndicatorScene = { scene, camera, renderer, character };

            // Animation loop
            const animate = () => {
                const delta = 0.016;
                character.update(delta);
                renderer.render(scene, camera);
                requestAnimationFrame(animate);
            };
            animate();

            console.log('✅ 3D Running Indicator initialized');

        } catch (error) {
            console.warn('Failed to load 3D running indicator:', error);
            // Fallback: could add SVG or emoji here
        }
    }



    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async onPhaseComplete() {
        this.isRunning = false;
        this.clock.stop();
        this.indicator.hide();

        const currentPhase = this.themeManager.currentPhase;
        const totalPhases = this.themeManager.getTotalPhases();

        if (currentPhase < totalPhases) {
            const nextLevel = currentPhase + 1;

            await this.showLevelTransition(nextLevel);

            this.obstacleManager.setAllowedTypes(this.levelActions[nextLevel]);

            await this.playCountdown();

            this.themeManager.nextPhase();
            this.isRunning = true;
            this.clock.start();
        } else {
            await this.showVictoryScreen();
            this.showFinalResults();
        }
    }

    async showVictoryScreen() {
        const screen = document.getElementById('victory-screen');

        console.log('[Victory] Showing victory screen');

        // Show victory screen
        screen.classList.remove('hidden');

        // Try to load 3D character (non-blocking if it fails)
        let victoryCharacter = null;
        try {
            const canvas = document.getElementById('victory-character-canvas');
            victoryCharacter = await ActionCharacter3D.create('victory', canvas);
            console.log('[Victory] 3D character loaded');
        } catch (error) {
            console.warn('[Victory] Could not load 3D character:', error);
        }

        // Display for 4 seconds
        console.log('[Victory] Waiting 4 seconds');
        await this.wait(4000);

        // Cleanup 3D character if it was created
        if (victoryCharacter) {
            try {
                victoryCharacter.stopAnimation();
                victoryCharacter.dispose();
                console.log('[Victory] 3D character cleaned up');
            } catch (error) {
                console.warn('[Victory] Error cleaning up character:', error);
            }
        }

        // Hide victory screen with fade
        console.log('[Victory] Hiding victory screen');
        screen.style.transition = 'opacity 0.5s ease';
        screen.style.opacity = '0';
        await this.wait(500);
        screen.classList.add('hidden');
        screen.style.opacity = '';

        console.log('[Victory] Victory screen complete');
    }

    showFinalResults() {
        const stats = this.scoreManager.getStats();

        // Update stats
        document.getElementById('complete-time').textContent =
            this.scoreManager.getFormattedTime();
        document.getElementById('complete-calories').textContent =
            `${stats.calories.toFixed(1)} kcal`;
        document.getElementById('complete-jumps').textContent =
            stats.actions.jumps;
        document.getElementById('complete-ducks').textContent =
            stats.actions.ducks;
        document.getElementById('complete-sidesteps').textContent =
            stats.actions.sideSteps;

        // Hide HUD and show CTA
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('phase-complete').classList.remove('hidden');

        // Progressive animation - show sections one by one
        this.animateCTASections();
    }

    async animateCTASections() {
        // Reset all sections to hidden
        const sections = document.querySelectorAll('.cta-section');
        sections.forEach(section => section.classList.remove('visible'));

        // Timing configuration
        const initialDelay = 500;
        const normalDelay = 1500; // Quick for stats and intro
        const ctaDelay = 2500; // Longer for CTAs (Subscribe, Like, Comment)
        const finalDelay = 1800; // Medium for Ready and Video

        // Animate each section in sequence by data-sequence attribute
        for (let i = 1; i <= 9; i++) {
            const section = document.querySelector(`.cta-section[data-sequence="${i}"]`);
            if (section) {
                // Determine delay based on sequence
                let delay;
                if (i === 1) delay = initialDelay;
                else if (i >= 5 && i <= 7) delay = ctaDelay; // CTAs get longer time
                else if (i >= 8) delay = finalDelay;
                else delay = normalDelay;

                await this.wait(delay);
                section.classList.add('visible');
            }
        }
    }

    finishWorkout() {
        document.getElementById('phase-complete').classList.add('hidden');
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('menu').classList.remove('hidden');
        this.reset();
    }

    reset() {
        this.speed = this.baseSpeed;
        this.isRunning = false;
        this.usedPhrases = [];

        this.scoreManager.reset();
        this.player.reset();
        this.obstacleManager.reset();
        this.themeManager.reset();
        this.scenarioManager.reset();
        this.hud.update();
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.clock.stop();
        } else {
            this.clock.start();
        }
    }

    onCollision() {
        // Em modo exercício, não reinicia
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (!this.isRunning || this.isPaused) {
            this.renderer.render(this.scene, this.camera);
            return;
        }

        const delta = this.clock.getDelta();

        this.scoreManager.addTime(delta);
        this.themeManager.update(delta);
        this.scenarioManager.update(this.speed);

        this.player.update(delta);
        this.track.update(this.speed);
        this.obstacleManager.update(delta, this.speed);

        const collision = this.obstacleManager.checkCollision(this.player);
        if (collision) {
            this.onCollision();
        }

        const nextObstacle = this.obstacleManager.getNextObstacle();
        // Show indicator earlier (starting at -45) to give more reaction time "a little bit before"
        if (nextObstacle && nextObstacle.position.z > -45 && nextObstacle.position.z < -5) {
            this.indicator.show(nextObstacle.userData.type, nextObstacle.userData.lane);
        } else {
            this.indicator.hide();
        }

        this.hud.update();
        this.renderer.render(this.scene, this.camera);
    }


}
