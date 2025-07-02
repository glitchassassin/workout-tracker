# Workout Tracker

A mobile-optimized web application for tracking your weekly workout progress. Built as a static web page that stores data locally in your browser.

## Features

- **Three Workout Types**: Strength & Grip, Endurance & Core, and Full Body Power
- **Week Overview**: View past weeks with completion status indicators
- **Set Tracking**: Record reps/time and weight for each exercise set
- **Data Persistence**: Automatically saves to browser localStorage
- **Export/Import**: Backup and restore your data as JSON files
- **Copy Workout**: Generate a text summary of today's completed exercises
- **Mobile Optimized**: Responsive design that works great on phones and tablets

## Color Scheme

- Primary: `#ffb900` (Golden yellow)
- Secondary: `#fe9a00` (Orange)
- Background: `#1b1718` (Dark gray/black)

## Usage

1. **Select a Week**: Click on any week in the Week Overview section
2. **Choose Workout**: Use the tabs to switch between Workout 1, 2, or 3
3. **Record Sets**: Enter your reps/time and weight for each exercise
4. **Add Sets**: Click "Add Set" to add more sets to an exercise
5. **Copy Results**: Use "Copy Today's Workout" to get a text summary
6. **Backup Data**: Use Export/Import buttons to save your progress

## Workout Plan

### Workout 1: Strength & Grip (40-45 min)
- **Warm-up**: Incline walk/row, Dynamic stretches
- **Circuit**: Deadlifts, Pull-ups, Dumbbell Rows, Farmer's Carries
- **Finisher**: Hanging hold, Towel curls/plate pinches

### Workout 2: Endurance & Core (30-40 min)
- **Warm-up**: Treadmill jog/bike, Mobility drills
- **Circuit**: 2-min run, Burpees, Box jumps, Russian Twists, Push-ups
- **Finisher**: Plank, Hanging knee raises, Side planks

### Workout 3: Full Body Power (40-45 min)
- **Warm-up**: Jump rope/row/treadmill, Shoulder and hip mobility
- **Circuit**: Dumbbell Thrusters, Walking Lunges, TRX Rows, Kettlebell Swings
- **Finisher**: Ground-to-Overhead, Goblet Squats, Mountain Climbers, 200m Run

## Status Indicators

- 🟢 **Complete**: All exercises have sets recorded with complete data
- 🟡 **Partial**: Some exercises have sets recorded but not all complete
- ⚪ **Incomplete**: No exercises have sets recorded

## Data Format

The application stores data in the following structure:

```json
{
  "weeks": {
    "weekNumber": {
      "workouts": {
        "1": { "exercises": {} },
        "2": { "exercises": {} },
        "3": { "exercises": {} }
      }
    }
  }
}
```

## Deployment

This is a static web application that can be deployed to any web hosting service:

- **Cloudflare Pages** (recommended)
- **GitHub Pages**
- **Netlify**
- **Vercel**

Simply upload the `index.html`, `styles.css`, and `script.js` files to your hosting provider.

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## Local Development

1. Clone or download the files
2. Open `index.html` in your web browser
3. No build process or dependencies required

## License

This project is open source and available under the MIT License. 