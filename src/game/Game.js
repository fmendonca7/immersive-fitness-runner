/**
 * Game.js - Classe principal do jogo
 * Gerencia o loop, cena Three.js, e estados do jogo
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

export class Game {
    constructor() {
        // Estado do jogo
        this.isRunning = false;
        this.isPaused = false;

        // Configurações
        this.phaseDurationMinutes = 4;
        this.actionMode = 'progressive';
        this.scenarioMode = 'random'; // random, specific
        this.selectedScenario = null;

        // Configuração de ações por nível
        this.levelActions = {
            1: ['jump'],
            2: ['jump', 'side'],
            3: ['jump', 'side', 'duck'],
            4: ['jump', 'side', 'duck']
        };

        // 100+ Frases motivacionais super variadas
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

        // Velocidade base
        this.baseSpeed = 0.30;
        this.speed = this.baseSpeed;
        this.maxSpeed = this.baseSpeed;

        // Tempo de pausa entre fases (10 segundos para descanso)
        this.intermissionDuration = 10;

        // 128 BPM = 469ms por beat
        this.beatInterval = 469;

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

        const chars = phrase.split('');
        let delay = 0;

        for (const char of chars) {
            if (char === ' ') {
                const space = document.createElement('span');
                space.className = 'space';
                line.appendChild(space);
            } else {
                const span = document.createElement('span');
                span.className = 'char';
                span.textContent = char;
                span.style.animationDelay = `${delay}ms`;
                line.appendChild(span);
                delay += 30;
            }
        }

        await this.wait(delay + 300);
    }

    animatePhrase(phrase, container) {
        container.innerHTML = '';

        const chars = phrase.split('');
        let delay = 0;

        chars.forEach((char) => {
            if (char === ' ') {
                const space = document.createElement('span');
                space.className = 'space';
                container.appendChild(space);
            } else {
                const span = document.createElement('span');
                span.className = 'char';
                span.textContent = char;
                span.style.animationDelay = `${delay}ms`;
                container.appendChild(span);
                delay += 35;
            }
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

    renderLevelActions(level) {
        const container = document.getElementById('level-actions');
        container.innerHTML = '';

        const icons = this.getActionIcons();
        const actions = ['run', ...this.levelActions[level]];

        actions.forEach(action => {
            const actionData = icons[action];
            if (!actionData) return;

            const div = document.createElement('div');
            div.className = 'action-preview';
            div.innerHTML = `
        <div class="action-icon">${actionData.svg}</div>
        <div class="action-name">${actionData.name}</div>
      `;
            container.appendChild(div);
        });
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
        document.getElementById('menu').classList.add('hidden');

        // Mostrar intro com níveis
        await this.showIntroSequence();

        // Mostrar HUD
        document.getElementById('hud').classList.remove('hidden');

        this.updateLevelActions();
        this.themeManager.phaseDuration = this.phaseDurationMinutes * 60;
        this.themeManager.startPhase(1);

        // Aplicar cenário do primeiro nível
        this.scenarioManager.setMode(this.scenarioMode, this.selectedScenario);
        const scenario = this.scenarioManager.getNextScenario();
        this.scenarioManager.applyScenario(scenario);
        this.obstacleManager.applyScenarioStyle(scenario.colors);

        this.obstacleManager.setAllowedTypes(this.levelActions[1]);

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
            `4 LEVELS • ${duration} MINUTES EACH`
        ], phraseContainer, 600);

        await this.wait(500);
        phraseContainer.innerHTML = '';

        // Mostrar cada nível
        for (const phase of phases) {
            await this.animatePhraseLine(`LEVEL ${phase.level}: ${phase.name} (${duration}:00)`, phraseContainer);
            await this.wait(400);
        }

        await this.wait(600);

        // Frase final
        phraseContainer.innerHTML = '';
        await this.animatePhraseLine("LET'S GO!", phraseContainer);
        await this.wait(800);

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
        const levelNumber = document.getElementById('level-number');
        const phraseContainer = document.getElementById('motivational-phrase');
        const countdown = document.getElementById('transition-countdown');
        const timerProgress = document.getElementById('timer-progress');

        // Novo cenário para o nível
        const scenario = this.scenarioManager.getNextScenario();

        // Atualizar texto do nível
        levelNumber.textContent = `LEVEL ${level}`;
        levelNumber.style.animation = 'none';
        levelNumber.offsetHeight;
        levelNumber.style.animation = '';

        // Primeiro: Frase de descanso
        const restPhrase = this.getRandomRestPhrase();
        this.animatePhrase(restPhrase, phraseContainer);

        // Renderizar ações do nível
        this.renderLevelActions(level);

        transition.classList.remove('hidden');

        // Countdown de 10 segundos com timer circular
        const circumference = 283;
        const halfTime = Math.floor(this.intermissionDuration / 2);

        for (let i = this.intermissionDuration; i > 0; i--) {
            countdown.textContent = i;
            const progress = (this.intermissionDuration - i) / this.intermissionDuration;
            timerProgress.style.strokeDashoffset = circumference * (1 - progress);

            // Na metade: trocar para frase motivacional
            if (i === halfTime) {
                const motivationalPhrase = this.getRandomPhrase();
                this.animatePhrase(motivationalPhrase, phraseContainer);
                this.scenarioManager.applyScenario(scenario);
                this.obstacleManager.applyScenarioStyle(scenario.colors);
            }

            await this.wait(1000);
        }

        transition.classList.add('hidden');
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
            this.showFinalResults();
        }
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
