# FlowFli Dashboard

This is a React-based UI for the FlowFli system.

## Quick Setup

This project was generated without a standard build tool (`create-react-app` or `Vite`). To make it runnable, you should use `create-react-app` to scaffold a new project and then overwrite the generated files with the ones in this directory.

1.  **Create a new React project:**
    ```bash
    npx create-react-app flowfli-dashboard --template typescript
    ```

2.  **Navigate into the new project directory:**
    ```bash
    cd flowfli-dashboard
    ```

3.  **Copy the generated files from this `dashboard` folder into the `flowfli-dashboard/src` folder.**
    Replace `App.tsx`, `index.tsx`, etc. with the files from this directory. You will also need to copy the `components` directory.

4.  **Install additional dependencies:**
    This dashboard uses `axios` for API calls and `chart.js` with `react-chartjs-2` for data visualization.
    ```bash
    npm install axios chart.js react-chartjs-2
    ```

5.  **Start the development server:**
    ```bash
    npm start
    ```

The dashboard will now be running on `http://localhost:3001` (or another port if 3001 is busy) and will be able to communicate with the backend API.
