# Getting Started with Frontend App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) (migrated to Vite).

## Available Scripts

In the project directory, you can run:

### `npm install`
Installs all dependencies.

### `npm run dev`
Runs the app in the development mode.\
Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm run build`
Builds the app for production to the `dist` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## Helper Accounts (Demo)
By default, the logic in `src/pages/Login.tsx` uses a simple plaintext match for demo purposes.
- **Username**: `admin`
- **Password**: `admin1`

## Supabase Setup
1. Create a Supabase Project.
2. Create tables (`users`, `products`, `transactions`) or run the provided schema.
3. Create a `.env` file based on `.env.example`.
4. Fill in your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

## How to Run (for new clones/forks)
1. Clone the repo.
2. Run `npm install` to download dependencies (recreates `node_modules`).
3. Set up `.env` as above.
4. Run `npm run dev`.


## Features
- **Dashboard**: Sales overview & stock alerts.
- **Products**: CRUD management with image upload (Base64/Firestore).
- **POS**: Point of Sale interface with cart and stock validation.
- **History**: Transaction logs.
- **Reports**: Daily sales summary & automated cash reconciliation.

## Roadmap (Upcoming Features)
The following features are planned for the next iteration to enhance store management:

1.  **Advanced Dashboard Visualization**:
    - Add graphical charts (Line/Bar) for weekly/monthly sales trends.
    - Visualize top-selling products.

2.  **Realtime Cash Balance**:
    - Show current drawer balance in real-time on the Dashboard.
    - "Live" status indicator for open/closed shifts.

3.  **Shift Management**:
    - Employee shift scheduling and clock-in/out features.
    - Shift-based sales reports (who sold what during which shift).

4.  **Enhanced Navigation**:
    - Direct shortcuts from Reports/Cash Balance logic to the Dashboard for better visibility.
