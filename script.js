// Workout Tracker Application
class WorkoutTracker {
    constructor() {
        this.data = this.loadData();
        this.currentWeek = this.getCurrentWeek();
        this.currentWorkout = 1;
        this.workoutPlan = this.getWorkoutPlan();
        
        this.initializeEventListeners();
        this.render();
    }

    // Data Management
    loadData() {
        const saved = localStorage.getItem('workoutTrackerData');
        return saved ? JSON.parse(saved) : { weeks: {} };
    }

    saveData() {
        localStorage.setItem('workoutTrackerData', JSON.stringify(this.data));
    }

    getCurrentWeek() {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
        return Math.ceil((days + startOfYear.getDay() + 1) / 7);
    }

    // Workout Plan Definition
    getWorkoutPlan() {
        return {
            1: {
                name: "Strength & Grip",
                duration: "40-45 min",
                warmup: {
                    title: "Warm-up (5 min)",
                    exercises: [
                        { name: "Incline walk or row", type: "time", target: "5 min" },
                        { name: "Dynamic stretches", type: "time", target: "5 min" }
                    ]
                },
                circuit: {
                    title: "Strength Circuit (3 rounds, 20-25 min total)",
                    exercises: [
                        { name: "Deadlifts", type: "reps", target: "6 reps" },
                        { name: "Pull-ups (or assisted)", type: "reps", target: "max reps" },
                        { name: "Dumbbell Rows", type: "reps", target: "10/side" },
                        { name: "Farmer's Carries", type: "time", target: "30 sec walk" }
                    ]
                },
                finisher: {
                    title: "Grip Finisher (5-10 min)",
                    exercises: [
                        { name: "Hanging hold", type: "time", target: "2x max" },
                        { name: "Towel curls or plate pinches", type: "reps", target: "2x10" }
                    ]
                }
            },
            2: {
                name: "Endurance & Core",
                duration: "30-40 min",
                warmup: {
                    title: "Warm-up (5 min)",
                    exercises: [
                        { name: "Treadmill jog or bike", type: "time", target: "5 min" },
                        { name: "Mobility drills", type: "time", target: "5 min" }
                    ]
                },
                circuit: {
                    title: "Conditioning Circuit (3 rounds, 20-25 min)",
                    exercises: [
                        { name: "2-min run or 400m", type: "time", target: "2 min" },
                        { name: "Burpees", type: "reps", target: "10" },
                        { name: "Box jumps or step-ups", type: "reps", target: "15" },
                        { name: "Russian Twists (weighted)", type: "reps", target: "20" },
                        { name: "Push-ups", type: "reps", target: "10" }
                    ]
                },
                finisher: {
                    title: "Core Finisher (5-10 min)",
                    exercises: [
                        { name: "Plank", type: "time", target: "1 min" },
                        { name: "Hanging knee raises", type: "reps", target: "10 reps" },
                        { name: "Side planks", type: "time", target: "30 sec/side" }
                    ]
                }
            },
            3: {
                name: "Full Body Power",
                duration: "40-45 min",
                warmup: {
                    title: "Warm-up (5 min)",
                    exercises: [
                        { name: "Jump rope, row, or treadmill", type: "time", target: "5 min" },
                        { name: "Shoulder and hip mobility", type: "time", target: "5 min" }
                    ]
                },
                circuit: {
                    title: "Compound Strength Circuit (3 rounds)",
                    exercises: [
                        { name: "Dumbbell Thrusters or Push Press", type: "reps", target: "8 reps" },
                        { name: "Walking Lunges (weighted or bodyweight)", type: "reps", target: "20 steps" },
                        { name: "TRX Rows or Inverted Rows", type: "reps", target: "10-12 reps" },
                        { name: "Kettlebell Swings or Dumbbell Snatches", type: "reps", target: "10 reps/side" }
                    ]
                },
                finisher: {
                    title: "MetCon Finisher (1 round, 5-10 min)",
                    exercises: [
                        { name: "Ground-to-Overhead", type: "reps", target: "10" },
                        { name: "Goblet Squats", type: "reps", target: "15" },
                        { name: "Mountain Climbers", type: "reps", target: "20" },
                        { name: "200m Run", type: "time", target: "200m" }
                    ]
                }
            }
        };
    }

    // Week Management
    getWeekData(weekNumber) {
        if (!this.data.weeks[weekNumber]) {
            this.data.weeks[weekNumber] = {
                workouts: {
                    1: { exercises: {} },
                    2: { exercises: {} },
                    3: { exercises: {} }
                }
            };
        }
        return this.data.weeks[weekNumber];
    }

    getWeekStatus(weekNumber) {
        const weekData = this.getWeekData(weekNumber);
        const workoutStatuses = [1, 2, 3].map(workoutNum => {
            const workout = weekData.workouts[workoutNum];
            const exercises = this.workoutPlan[workoutNum];
            
            let exercisesWithSets = 0;
            let totalExercises = 0;
            
            // Check warm-up, circuit, and finisher exercises
            ['warmup', 'circuit', 'finisher'].forEach(section => {
                exercises[section].exercises.forEach(exercise => {
                    totalExercises++;
                    const exerciseData = workout.exercises[exercise.name];
                    if (exerciseData && exerciseData.sets && exerciseData.sets.length > 0) {
                        exercisesWithSets++;
                    }
                });
            });
            
            if (exercisesWithSets === 0) return 'incomplete';
            if (exercisesWithSets === totalExercises) return 'complete';
            return 'partial';
        });
        
        return workoutStatuses;
    }

    // UI Rendering
    render() {
        this.renderWeekList();
        this.renderWorkoutTabs();
        this.renderWorkoutContent();
    }

    renderWeekList() {
        const weekList = document.getElementById('weekList');
        weekList.innerHTML = '';
        
        // Determine the range of weeks to show based on current date
        const currentWeekOfYear = this.getCurrentWeek();
        const oldestWeekWithData = this.getOldestWeekWithData();
        const twoWeeksAgo = Math.max(1, currentWeekOfYear - 2);
        const startWeek = Math.min(twoWeeksAgo, oldestWeekWithData - 1);
        
        const weeksToShow = [];
        for (let i = startWeek; i <= currentWeekOfYear; i++) {
            weeksToShow.push(i);
        }
        
        weeksToShow.forEach(weekNum => {
            const weekItem = document.createElement('div');
            weekItem.className = `week-item ${weekNum === this.currentWeek ? 'selected' : ''}`;
            
            const weekDate = this.getWeekDateRange(weekNum);
            const statuses = this.getWeekStatus(weekNum);
            
            weekItem.innerHTML = `
                <div class="week-header">
                    <div class="week-date">${weekDate}</div>
                    <div class="week-status">
                        ${statuses.map(status => `<span class="status-dot ${status}"></span>`).join('')}
                    </div>
                </div>
            `;
            
            weekItem.addEventListener('click', () => {
                this.currentWeek = weekNum;
                this.render();
            });
            
            weekList.appendChild(weekItem);
        });
        
        // Scroll to the most recent week (right side)
        setTimeout(() => {
            weekList.scrollLeft = weekList.scrollWidth;
        }, 100);
    }

    renderWorkoutTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const statuses = this.getWeekStatus(this.currentWeek);
        
        tabBtns.forEach((btn, index) => {
            const workoutNum = index + 1;
            const status = statuses[index];
            
            btn.className = `tab-btn ${workoutNum === this.currentWorkout ? 'active' : ''}`;
            btn.querySelector('.status-dot').className = `status-dot ${status}`;
            
            btn.onclick = () => {
                this.currentWorkout = workoutNum;
                this.renderWorkoutTabs();
                this.renderWorkoutContent();
            };
        });
    }

    renderWorkoutContent() {
        const content = document.getElementById('workoutContent');
        const workout = this.workoutPlan[this.currentWorkout];
        const weekData = this.getWeekData(this.currentWeek);
        const workoutData = weekData.workouts[this.currentWorkout];
        
        content.innerHTML = `
            <h3>${workout.name} - ${workout.duration}</h3>
            ${this.renderSection('warmup', workout.warmup, workoutData)}
            ${this.renderSection('circuit', workout.circuit, workoutData)}
            ${this.renderSection('finisher', workout.finisher, workoutData)}
        `;
        
        // Add event listeners to inputs
        this.addInputEventListeners();
    }

    renderSection(sectionKey, section, workoutData) {
        return `
            <div class="workout-section-title">${section.title}</div>
            ${section.exercises.map(exercise => this.renderExercise(exercise, workoutData)).join('')}
        `;
    }

    renderExercise(exercise, workoutData) {
        const exerciseData = workoutData.exercises[exercise.name] || { sets: [] };
        const sets = exerciseData.sets;
        
        return `
            <div class="exercise-item">
                <div class="exercise-header">
                    <div class="exercise-name">${exercise.name}</div>
                    <div class="exercise-target">${exercise.target}</div>
                </div>
                <div class="sets-container">
                    ${sets.map((set, index) => this.renderSet(exercise, set, index)).join('')}
                </div>
                <button class="add-set-btn" data-exercise="${exercise.name}">Add Set</button>
            </div>
        `;
    }

    renderSet(exercise, set, index) {
        const isTimeBased = exercise.type === 'time';
        const inputType = isTimeBased ? 'time' : 'reps';
        const inputValue = isTimeBased ? (set.time || '') : (set.reps || '');
        
        return `
            <div class="set-row">
                <div class="set-inputs">
                    <span class="set-number">${index + 1}</span>
                    <input type="number" class="set-input" data-exercise="${exercise.name}" data-set="${index}" data-field="${inputType}" 
                           value="${inputValue}" placeholder="${isTimeBased ? 'sec' : 'reps'}">
                    <span class="set-unit">${isTimeBased ? 'sec' : 'reps'}</span>
                    <input type="number" class="set-input" data-exercise="${exercise.name}" data-set="${index}" data-field="weight" 
                           value="${set.weight || ''}" placeholder="weight">
                    <span class="set-unit">${set.unit || 'lb'}</span>
                </div>
                <button class="remove-set-btn" data-exercise="${exercise.name}" data-set="${index}">×</button>
            </div>
        `;
    }

    // Event Listeners
    initializeEventListeners() {
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
        document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importInput').click());
        document.getElementById('importInput').addEventListener('change', (e) => this.importData(e));
        document.getElementById('copyWorkoutBtn').addEventListener('click', () => this.copyWorkout());
        
        // Add set buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-set-btn')) {
                this.addSet(e.target.dataset.exercise);
            }
            if (e.target.classList.contains('remove-set-btn')) {
                this.removeSet(e.target.dataset.exercise, parseInt(e.target.dataset.set));
            }
        });
    }

    addInputEventListeners() {
        document.querySelectorAll('.set-input').forEach(input => {
            input.addEventListener('input', (e) => {
                this.updateSet(
                    e.target.dataset.exercise,
                    parseInt(e.target.dataset.set),
                    e.target.dataset.field,
                    e.target.value
                );
            });
        });
    }

    // Data Updates
    updateSet(exerciseName, setIndex, field, value) {
        const weekData = this.getWeekData(this.currentWeek);
        const workoutData = weekData.workouts[this.currentWorkout];
        
        if (!workoutData.exercises[exerciseName]) {
            workoutData.exercises[exerciseName] = { sets: [] };
        }
        
        if (!workoutData.exercises[exerciseName].sets[setIndex]) {
            workoutData.exercises[exerciseName].sets[setIndex] = {};
        }
        
        workoutData.exercises[exerciseName].sets[setIndex][field] = value;
        this.saveData();
        this.renderWeekList();
        this.renderWorkoutTabs();
    }

    addSet(exerciseName) {
        const weekData = this.getWeekData(this.currentWeek);
        const workoutData = weekData.workouts[this.currentWorkout];
        
        if (!workoutData.exercises[exerciseName]) {
            workoutData.exercises[exerciseName] = { sets: [] };
        }
        
        workoutData.exercises[exerciseName].sets.push({
            reps: '',
            time: '',
            weight: '',
            unit: 'lb'
        });
        
        this.saveData();
        this.renderWeekList();
        this.renderWorkoutTabs();
        this.renderWorkoutContent();
    }

    removeSet(exerciseName, setIndex) {
        const weekData = this.getWeekData(this.currentWeek);
        const workoutData = weekData.workouts[this.currentWorkout];
        
        if (workoutData.exercises[exerciseName] && workoutData.exercises[exerciseName].sets) {
            workoutData.exercises[exerciseName].sets.splice(setIndex, 1);
            this.saveData();
            this.renderWeekList();
            this.renderWorkoutTabs();
            this.renderWorkoutContent();
        }
    }

    // Export/Import
    exportData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `workout-tracker-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                this.data = importedData;
                this.saveData();
                this.render();
                alert('Data imported successfully!');
            } catch (error) {
                alert('Error importing data. Please check the file format.');
            }
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset file input
    }

    // Copy Workout
    copyWorkout() {
        const workout = this.workoutPlan[this.currentWorkout];
        const weekData = this.getWeekData(this.currentWeek);
        const workoutData = weekData.workouts[this.currentWorkout];
        
        const today = new Date().toLocaleDateString('en-US', { 
            month: 'numeric', 
            day: 'numeric', 
            year: 'numeric' 
        });
        
        let workoutText = `${today} | ${workout.name}\n`;
        
        // Only include circuit and finisher exercises with recorded sets
        ['circuit', 'finisher'].forEach(section => {
            workout[section].exercises.forEach(exercise => {
                const exerciseData = workoutData.exercises[exercise.name];
                if (exerciseData && exerciseData.sets && exerciseData.sets.length > 0) {
                    const recordedSets = exerciseData.sets.filter(set => 
                        (set.reps || set.time) && set.weight
                    );
                    
                    if (recordedSets.length > 0) {
                        const setsText = recordedSets.map(set => {
                            const value = set.reps || set.time;
                            const unit = set.reps ? 'x' : 'sx';
                            return `1x${value}${unit}${set.weight}lb`;
                        }).join(', ');
                        
                        workoutText += `${exercise.name}: ${setsText}\n`;
                    }
                }
            });
        });
        
        navigator.clipboard.writeText(workoutText).then(() => {
            alert('Workout copied to clipboard!');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = workoutText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('Workout copied to clipboard!');
        });
    }

    // Utility
    getOldestWeekWithData() {
        const weekNumbers = Object.keys(this.data.weeks)
            .map(Number)
            .filter(num => !isNaN(num))
            .filter(weekNum => {
                const weekData = this.data.weeks[weekNum];
                // Check if any workout has any exercises with sets
                return [1, 2, 3].some(workoutNum => {
                    const workout = weekData.workouts[workoutNum];
                    return Object.values(workout.exercises).some(exercise => 
                        exercise.sets && exercise.sets.length > 0
                    );
                });
            });
        
        if (weekNumbers.length === 0) {
            return this.currentWeek;
        }
        return Math.min(...weekNumbers);
    }

    getWeekDateRange(weekNumber) {
        const year = new Date().getFullYear();
        const startOfYear = new Date(year, 0, 1);
        const startOfWeek = new Date(startOfYear);
        startOfWeek.setDate(startOfYear.getDate() + (weekNumber - 1) * 7);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        return `${startOfWeek.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}-${endOfWeek.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}`;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new WorkoutTracker();
}); 