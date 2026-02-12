
# Game Theory Analysis Module

This project is a React application powered by Vite that analyzes strategic pricing decisions between Amazon and Flipkart during festival sales.

## Features

- **3x3 Payoff Matrix UI**: Displays profit outcomes for High, Medium, and Low Discount strategies.
- **Game Theory Analysis**: Automatically calculates Nash Equilibrium and Dominant Strategies based on expected payoffs.
- **Dynamic Data**: Loads data from `final_festival_mobile_discount_dataset_2021_2025.csv`.
- **Interactive UI**: Select different Festival Years to see how strategies evolve.
- **Rich Aesthetics**: Modern dark mode design with glassmorphism effects.

## Setup & Running

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start Development Server**:
    ```bash
    npm run dev
    ```

3.  **Build for Production**:
    ```bash
    npm run build
    ```

## Project Structure

- `src/App.jsx`: Main application component.
- `src/components/PayoffMatrix.jsx`: Matrix visualization component.
- `src/utils/gameTheory.js`: Logic for Nash Equilibrium and Dominant Strategy calculation.
- `public/final_festival_mobile_discount_dataset_2021_2025.csv`: The dataset.

## Logic Explanation

- **Expected Payoff**: The application calculates the expected profit for each strategy pair by aggregating results across different market demand scenarios (High, Medium, Low) weighted by probability.
- **Nash Equilibrium**: Identified where neither player has an incentive to deviate given the other player's strategy.
- **Dominant Strategy**: Identified if a strategy yields a higher or equal payoff compared to all other strategies, regardless of the opponent's choice.
