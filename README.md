# FTMS Recorder

A web-based application to connect to Fitness Machine Service (FTMS) and Heart Rate (HR) Bluetooth LE devices, record your workouts, and save them as FIT files.

## Features

- Connect to FTMS and HR Bluetooth LE devices.
- Live view of your workout data (power, cadence, speed, heart rate, etc.).
- Record your workouts and save them as FIT files.
- Store and manage your recorded rides in the browser.
- Simulation mode to generate random workout data for testing.
- Dark mode and unit selection (metric/imperial).

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) version 20.19+ or 22.12+.
- A modern browser with Web Bluetooth support (e.g., Chrome, Edge).

### Developing

Once you've cloned the project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

## Deployment

This application is automatically deployed to GitHub Pages on every push to the `main` branch.

You can access the live application at: [https://david-thiesen.github.io/ftms-recorder/](https://david-thiesen.github.io/ftms-recorder/)