// Workout Tracker Application - 5x5 Routine
class WorkoutTracker {
  constructor() {
    this.data = this.loadData();
    this.today = this.getCurrentDate();
    this.selectedDate = this.today;
    this.currentWorkout = this.getNextWorkoutType();

    this.initializeEventListeners();
    this.render();
  }

  // Data Management
  loadData() {
    const saved = localStorage.getItem("workoutTrackerData");
    return saved ? JSON.parse(saved) : { workouts: [] };
  }

  saveData() {
    localStorage.setItem("workoutTrackerData", JSON.stringify(this.data));
  }

  // Helper method to check if a value has data (handles 0 correctly)
  hasValue(value) {
    return value !== "" && value !== null && value !== undefined;
  }

  // Get the most recent weight for a specific exercise
  getMostRecentWeight(exerciseName) {
    // Workouts are already sorted from earliest to latest, so iterate backwards to find the most recent
    for (let i = this.data.workouts.length - 1; i >= 0; i--) {
      const workout = this.data.workouts[i];
      const exerciseData = workout.exercises[exerciseName];
      if (exerciseData && exerciseData.weight && this.hasValue(exerciseData.weight)) {
        return exerciseData.weight;
      }
    }
    
    return ""; // No previous weight found
  }

  getCurrentDate() {
    const now = new Date();
    return now.toISOString().split("T")[0]; // YYYY-MM-DD format
  }

  getNextWorkoutType() {
    // Get the most recent workout from history to determine the next type
    if (this.data.workouts.length === 0) {
      // No previous workouts, start with A
      return "A";
    }

    // Get the most recent workout type and alternate
    const mostRecentWorkout = this.data.workouts[this.data.workouts.length - 1];
    return mostRecentWorkout.type === "A" ? "B" : "A";
  }

  // Workout Plan Definition
  getWorkoutPlan(workoutType) {
    if (workoutType === "A") {
      return {
        name: "Workout A",
        exercises: [
          { name: "Squat", type: "5x5", weight: true },
          { name: "Overhead Press", type: "5x5", weight: true },
          { name: "Deadlift", type: "5x5", weight: true },
          { name: "Pull-ups", type: "pullups", weight: false },
        ],
      };
    } else {
      return {
        name: "Workout B",
        exercises: [
          { name: "Squat", type: "5x5", weight: true },
          { name: "Bench Press", type: "5x5", weight: true },
          { name: "Deadlift", type: "5x5", weight: true },
          { name: "Pull-ups", type: "pullups", weight: false },
        ],
      };
    }
  }

  // Workout Data Management
  getWorkoutData(date) {
    let workoutData = this.data.workouts.find(
      (workout) => workout.date === date
    );

    if (!workoutData) {
      // Create new workout data
      workoutData = {
        date: date,
        type: this.getWorkoutTypeForDate(date),
        exercises: {},
      };
      this.data.workouts.push(workoutData);
    }

    return workoutData;
  }

  getWorkoutTypeForDate(date) {
    // For existing workouts, use their stored type
    const existingWorkout = this.data.workouts.find(
      (workout) => workout.date === date
    );
    if (existingWorkout) {
      return existingWorkout.type;
    }

    // For new dates, determine based on workout history
    return this.getNextWorkoutType();
  }

  getWorkoutStatus(date) {
    const workoutData = this.data.workouts.find(
      (workout) => workout.date === date
    );
    if (!workoutData) return "incomplete";

    let exercisesWithData = 0;
    let totalExercises = 0;

    const workoutPlan = this.getWorkoutPlan(workoutData.type);
    workoutPlan.exercises.forEach((exercise) => {
      totalExercises++;
      const exerciseData = workoutData.exercises[exercise.name];

      if (exerciseData) {
        if (exercise.type === "5x5") {
          // Check if weight is filled and at least one rep field has data
          if (
            this.hasValue(exerciseData.weight) &&
            exerciseData.reps &&
            exerciseData.reps.some((rep) => this.hasValue(rep))
          ) {
            exercisesWithData++;
          }
        } else if (exercise.type === "pullups") {
          // Check if pullups reps are filled
          if (this.hasValue(exerciseData.reps)) {
            exercisesWithData++;
          }
        }
      }
    });

    if (exercisesWithData === 0) return "incomplete";
    if (exercisesWithData === totalExercises) return "complete";
    return "partial";
  }

  // UI Rendering
  render() {
    this.renderWorkoutHistory();
    this.renderCurrentWorkoutHeader();
    this.renderWorkoutContent();
  }

  renderWorkoutHistory() {
    const workoutHistory = document.getElementById("workoutHistory");
    workoutHistory.innerHTML = "";

    // Get workouts with data
    const workoutsWithData = this.data.workouts.filter((workout) =>
      this.hasWorkoutData(workout.date)
    );

    // Always include today if it's not already in the list
    let allWorkouts = [...workoutsWithData];
    const todayExists = allWorkouts.some(
      (workout) => workout.date === this.today
    );

    if (!todayExists) {
      // Add today's workout (even if empty) to the end
      allWorkouts.push({
        date: this.today,
        type: this.getWorkoutTypeForDate(this.today),
        exercises: {},
      });
    }

    // Show last 10 workouts (newest first), ensuring today is included
    const recentWorkouts = allWorkouts.slice(-10);

    recentWorkouts.forEach((workout) => {
      const status = this.getWorkoutStatus(workout.date);
      const shortDate = this.formatShortDate(workout.date);
      const isSelected = workout.date === this.selectedDate;
      const isToday = workout.date === this.today;

      const workoutItem = document.createElement("div");
      workoutItem.className = `workout-history-item ${
        isSelected ? "selected" : ""
      } ${isToday ? "today" : ""}`;

      workoutItem.innerHTML = `
                <div class="workout-history-header">
                    <div class="workout-date">${shortDate}</div>
                    <div class="workout-type">${workout.type}</div>
                    <span class="status-dot ${status}"></span>
                </div>
            `;

      workoutItem.addEventListener("click", () => {
        this.selectedDate = workout.date;
        this.currentWorkout = workout.type;
        this.render();
      });

      workoutHistory.appendChild(workoutItem);
    });

    // Scroll to the most recent workout (right side)
    setTimeout(() => {
      workoutHistory.scrollLeft = workoutHistory.scrollWidth;
    }, 100);
  }

  renderCurrentWorkoutHeader() {
    const workoutTitle = document.getElementById("currentWorkoutTitle");
    const workoutDate = document.getElementById("currentWorkoutDate");
    const workout = this.getWorkoutPlan(this.currentWorkout);

    workoutTitle.textContent = workout.name;
    workoutDate.textContent = this.formatShortDate(this.selectedDate);
  }

  renderWorkoutContent() {
    const content = document.getElementById("workoutContent");
    const workout = this.getWorkoutPlan(this.currentWorkout);
    const workoutData = this.getWorkoutData(this.selectedDate);

    content.innerHTML = `
            ${workout.exercises
              .map((exercise) => this.renderExercise(exercise, workoutData))
              .join("")}
        `;

    // Add event listeners to inputs
    this.addInputEventListeners();
  }

  renderExercise(exercise, workoutData) {
    const exerciseData = workoutData.exercises[exercise.name] || {};

    if (exercise.type === "5x5") {
      return this.render5x5Exercise(exercise, exerciseData);
    } else if (exercise.type === "pullups") {
      return this.renderPullupsExercise(exercise, exerciseData);
    }

    return "";
  }

  render5x5Exercise(exercise, exerciseData) {
    const weight = exerciseData.weight || "";
    const reps = exerciseData.reps || ["", "", "", "", ""];
    const placeholderWeight = this.getMostRecentWeight(exercise.name);

    return `
            <div class="exercise-item">
                <div class="exercise-header">
                    <div class="exercise-name">${exercise.name}</div>
                    <div>
                        <input type="number" class="weight-input" data-exercise="${
                          exercise.name
                        }" data-field="weight" 
                            value="${weight}" placeholder="${placeholderWeight || '0'}">
                        <span class="weight-unit">lb</span>
                    </div>
                </div>
                <div class="exercise-5x5">
                    <div class="sets-row">
                        <div class="set-inputs-5x5">
                            ${reps
                              .map(
                                (rep, index) => `
                                <div class="rep-field">
                                    <div class="set-number-5x5">${
                                      index + 1
                                    }</div>
                                    <input type="number" class="set-input-5x5" data-exercise="${
                                      exercise.name
                                    }" data-field="reps" data-set="${index}" 
                                           value="${rep}" placeholder="0">
                                </div>
                            `
                              )
                              .join("")}
                        </div>
                    </div>
                </div>
            </div>
        `;
  }

  renderPullupsExercise(exercise, exerciseData) {
    const reps = exerciseData.reps || "";

    return `
            <div class="exercise-item">
                <div class="exercise-header">
                    <div class="exercise-name">${exercise.name}</div>
                    <div>
                        <input type="number" class="pullups-input" data-exercise="${exercise.name}" data-field="reps" 
                               value="${reps}" placeholder="0">
                        <span class="pullups-unit">reps</span>
                    </div>
                </div>
            </div>
        `;
  }

  // Event Listeners
  initializeEventListeners() {
    document
      .getElementById("exportBtn")
      .addEventListener("click", () => this.exportData());
    document
      .getElementById("importBtn")
      .addEventListener("click", () =>
        document.getElementById("importInput").click()
      );
    document
      .getElementById("importInput")
      .addEventListener("change", (e) => this.importData(e));
    document
      .getElementById("copyWorkoutBtn")
      .addEventListener("click", () => this.copyWorkout());
  }

  addInputEventListeners() {
    // Weight inputs for 5x5 exercises
    document.querySelectorAll(".weight-input").forEach((input) => {
      input.addEventListener("input", (e) => {
        this.updateExerciseData(
          e.target.dataset.exercise,
          e.target.dataset.field,
          e.target.value
        );
      });
    });

    // Rep inputs for 5x5 exercises
    document.querySelectorAll(".set-input-5x5").forEach((input) => {
      input.addEventListener("input", (e) => {
        this.updateExerciseData(
          e.target.dataset.exercise,
          "reps",
          e.target.value,
          parseInt(e.target.dataset.set)
        );
      });
    });

    // Pullups reps input
    document.querySelectorAll(".pullups-input").forEach((input) => {
      input.addEventListener("input", (e) => {
        this.updateExerciseData(
          e.target.dataset.exercise,
          e.target.dataset.field,
          e.target.value
        );
      });
    });
  }

  // Data Updates
  updateExerciseData(exerciseName, field, value, setIndex = null) {
    const workoutData = this.getWorkoutData(this.selectedDate);

    if (!workoutData.exercises[exerciseName]) {
      workoutData.exercises[exerciseName] = {};
    }

    if (field === "reps" && setIndex !== null) {
      // Handle 5x5 reps array
      if (!workoutData.exercises[exerciseName].reps) {
        workoutData.exercises[exerciseName].reps = ["", "", "", "", ""];
      }
      workoutData.exercises[exerciseName].reps[setIndex] = value;
    } else {
      // Handle other fields (weight, pullups reps)
      workoutData.exercises[exerciseName][field] = value;
    }

    this.saveData();
    this.renderWorkoutHistory();
    this.renderCurrentWorkoutHeader();
  }

  // Helper methods
  hasWorkoutData(date) {
    const workoutData = this.data.workouts.find(
      (workout) => workout.date === date
    );
    if (!workoutData) return false;

    // Check if any exercise has data
    return Object.values(workoutData.exercises).some((exercise) => {
      if (exercise.weight && this.hasValue(exercise.weight)) return true;
      if (exercise.reps) {
        if (Array.isArray(exercise.reps)) {
          // 5x5 exercise
          return exercise.reps.some((rep) => this.hasValue(rep));
        } else {
          // Pullups exercise
          return this.hasValue(exercise.reps);
        }
      }
      return false;
    });
  }

  formatShortDate(dateString) {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }

  // Export/Import
  exportData() {
    const dataStr = JSON.stringify(this.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `workout-tracker-${
      new Date().toISOString().split("T")[0]
    }.json`;
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
        alert("Data imported successfully!");
      } catch (error) {
        alert("Error importing data. Please check the file format.");
      }
    };
    reader.readAsText(file);
    event.target.value = ""; // Reset file input
  }

  // Copy Workout
  copyWorkout() {
    const workout = this.getWorkoutPlan(this.currentWorkout);
    const workoutData = this.getWorkoutData(this.selectedDate);

    const today = new Date(this.selectedDate).toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });

    let workoutText = `${today} | ${workout.name}\n`;

    workout.exercises.forEach((exercise) => {
      const exerciseData = workoutData.exercises[exercise.name];
      if (exerciseData) {
        if (exercise.type === "5x5") {
          const weight = exerciseData.weight || "0";
          const reps = exerciseData.reps || ["", "", "", "", ""];
          const completedReps = reps.filter((rep) => this.hasValue(rep));

          if (completedReps.length > 0) {
            // Group sets by rep count
            const repGroups = {};
            completedReps.forEach((rep) => {
              const repCount = parseInt(rep);
              repGroups[repCount] = (repGroups[repCount] || 0) + 1;
            });

            // Format the groups
            const formattedGroups = Object.entries(repGroups)
              .sort(([a], [b]) => parseInt(b) - parseInt(a)) // Sort by reps descending
              .map(([reps, sets]) => `${weight}x${sets}x${reps}`)
              .join(", ");

            workoutText += `${exercise.name}: ${formattedGroups}\n`;
          }
        } else if (exercise.type === "pullups") {
          const reps = exerciseData.reps || "0";
          if (this.hasValue(reps)) {
            workoutText += `${exercise.name}: ${reps} reps\n`;
          }
        }
      }
    });

    navigator.clipboard
      .writeText(workoutText)
      .then(() => {
        alert("Workout copied to clipboard!");
      })
      .catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = workoutText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        alert("Workout copied to clipboard!");
      });
  }
}

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  new WorkoutTracker();
});
