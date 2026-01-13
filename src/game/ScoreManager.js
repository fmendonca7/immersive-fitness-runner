/**
 * ScoreManager.js - Gerenciamento de pontuação e calorias
 * Calorias calculadas de forma realista para exercício
 */

export class ScoreManager {
    constructor() {
        // Tempo de treino em segundos
        this.totalTime = 0;

        // Calorias estimadas (baseado em exercício real)
        this.calories = 0;

        // Calorias por ação (valores realistas para exercício)
        // Baseado em estudos de gasto calórico por movimento
        this.actionCalories = {
            jump: 0.8,       // Um pulo gasta ~0.8 kcal
            duck: 0.5,       // Um agachamento gasta ~0.5 kcal
            sideStep: 0.3    // Uma esquiva lateral gasta ~0.3 kcal
        };

        // Taxa base de calorias por minuto (corrida parada leve)
        // Aproximadamente 8-10 kcal/min para corrida parada moderada
        this.baseCaloriesPerMinute = 8;

        // Contador de ações
        this.actions = {
            jumps: 0,
            ducks: 0,
            sideSteps: 0
        };
    }

    addTime(delta) {
        this.totalTime += delta;
        // Adicionar calorias base (corrida parada)
        this.calories += (this.baseCaloriesPerMinute / 60) * delta;
    }

    addAction(type) {
        switch (type) {
            case 'jump':
                this.actions.jumps++;
                this.calories += this.actionCalories.jump;
                break;
            case 'duck':
                this.actions.ducks++;
                this.calories += this.actionCalories.duck;
                break;
            case 'sideStep':
                this.actions.sideSteps++;
                this.calories += this.actionCalories.sideStep;
                break;
        }
    }

    getFormattedTime() {
        const mins = Math.floor(this.totalTime / 60);
        const secs = Math.floor(this.totalTime % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    getFormattedCalories() {
        return `${this.calories.toFixed(1)} kcal`;
    }

    getStats() {
        return {
            time: this.totalTime,
            calories: this.calories,
            actions: { ...this.actions },
            totalActions: this.actions.jumps + this.actions.ducks + this.actions.sideSteps
        };
    }

    reset() {
        this.totalTime = 0;
        this.calories = 0;
        this.actions = {
            jumps: 0,
            ducks: 0,
            sideSteps: 0
        };
    }
}
