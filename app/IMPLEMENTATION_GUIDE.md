# Game Theory Analysis Module - Complete Implementation Guide

## 🎯 Project Overview

This is a comprehensive React application that implements **Game Theory** and **Decision Analysis** concepts for analyzing competitive e-commerce strategies between Amazon and Flipkart during festival sales.

## ✨ Features Implemented

### 1. **Payoff Matrix Visualization** ✅
- Interactive 3x3 matrix displaying profit outcomes for both players
- **Nash Equilibrium** identification with green highlighting
- **Dominant Strategy** detection with trophy badges
- Click any cell to trigger Decision Tree analysis
- Expected Monetary Value (EMV) calculations based on demand probabilities

### 2. **Decision Tree Analysis** ✅  
- Dynamic tree visualization triggered by clicking matrix cells
- Shows probability-weighted outcomes across 3 demand scenarios (High, Medium, Low)
- Calculates and displays **Expected Monetary Value (EMV)** at the root node
- Visual breakdown of each branch with:
  - Demand levels with probability weights
  - Profit outcomes for each scenario
  - Clear visual connectors between nodes

### 3. **Sensitivity Analysis Dashboard** ✅
- **Two interactive sliders**:
  - Advertising Cost Adjustment (₹0 - ₹20M)
  - Discount Cost Adjustment (₹0 - ₹20M)
- **Dynamic Line Graph** showing:
  - How each strategy (HD, MD, LD) performs as costs increase
  - The **tipping point** where aggressive discounting (HD) becomes non-viable
  - Real-time visualization of optimal strategy shifts
- Cost multipliers:
  - HD strategy: 100% of cost increase
  - MD strategy: 50% of cost increase
  - LD strategy: 10% of cost increase

## 📁 Project Structure

```
app/
├── public/
│   └── final_festival_mobile_discount_dataset_2021_2025.csv
├── src/
│   ├── components/
│   │   ├── PayoffMatrix.jsx       # 3x3 Game Theory Matrix
│   │   ├── DecisionTree.jsx       # Decision Tree Visualization
│   │   └── SensitivityAnalysis.jsx # Cost Sensitivity Dashboard
│   ├── utils/
│   │   └── gameTheory.js          # Core logic & calculations
│   ├── App.jsx                    # Main application
│   ├── index.css                  # Comprehensive styling
│   └── main.jsx                   # Entry point
├── package.json
└── README.md
```

## 🚀 How to Run

1. **Open Terminal** in VS Code (Ctrl+`)

2. **Navigate to app directory**:
   ```powershell
   cd "app"
   ```

3. **Install dependencies** (if not already done):
   ```powershell
   npm install
   ```

4. **Start the development server**:
   ```powershell
   npm run dev
   ```

5. **Open your browser** and navigate to the local URL shown (usually `http://localhost:5173`)

## 🎮 How to Use the Application

### **Step 1: Select a Festival Year**
- Use the dropdown at the top to select a year (2021-2025)
- The matrix and analysis will update automatically

### **Step 2: View the Payoff Matrix**
- **Green cells** = Nash Equilibrium (best outcome given opponent's strategy)
- **Trophy icons** = Dominant Strategies (best strategy regardless of opponent)
- **Blue underlines** = Amazon's best response
- **Pink underlines** = Flipkart's best response

### **Step 3: Analyze a Specific Strategy** (Optional)
- Click any cell in the matrix
- Scroll down to see the Decision Tree
- View EMV and probability-weighted outcomes

### **Step 4: Perform Sensitivity Analysis**
- Scroll to the bottom
- Adjust the **Advertising Cost** slider
- Adjust the **Discount Cost** slider
- Observe how the line graph changes:
  - **Red line (HD)** drops faster as costs increase
  - **Blue line (MD)** drops slower
  - **Green line (LD)** barely affected
- Identify the **crossover point** where MD becomes more profitable than HD

## 🧮 Game Theory Concepts Demonstrated

1. **Nash Equilibrium**: Strategy pairs where neither player benefits from unilateral deviation
2. **Dominant Strategy**: A strategy that yields the best payoff regardless of opponent's choice
3. **Best Response**: Optimal strategy given opponent's choice
4. **Expected Monetary Value (EMV)**: Probability-weighted average of all possible outcomes
5. **Sensitivity Analysis**: How optimal decisions change as parameters vary

## 📊 Dataset Information

- **Years**: 2021-2025 (5 years of festival data)
- **Strategies**: HD (Heavy Discount), MD (Medium Discount), LD (Low Discount)
- **Demand Levels**: High (40%), Medium (35%), Low (25%)
- **Metrics**: Revenue, Profit, Ad Spend, Sales Volume, Discount Costs

## 🎨 Design Features

- **Dark mode glassmorphism** UI
- **Smooth animations** with Framer Motion
- **Interactive charts** with Recharts
- **Responsive design** for all screen sizes
- **Premium aesthetics** with gradient accents and blur effects

## 📦 Dependencies

- **React 19.2.0** - UI framework
- **Vite 7.3.1** - Build tool
- **Recharts** - Charting library for sensitivity analysis
- **Framer Motion 12.34.0** - Animations
- **Lucide React 0.563.0** - Icons
- **PapaParse 5.5.3** - CSV parsing

## 🔍 Troubleshooting

If you encounter path-related errors:
1. Try running from the `Frontend/app` directory directly
2. Ensure all dependencies are installed: `npm install`
3. Clear node modules and reinstall: `rm -r node_modules; npm install`
4. Check that the CSV file is in `public/` folder

## 📝 Key Insights from Analysis

- **Prisoner's Dilemma**: Both firms end up at (HD, HD) even though (MD, MD) yields higher joint profit
- **Cost Sensitivity**: As marketing costs rise, moderate strategies become optimal
- **Tipping Point**: The graph clearly shows where aggressive discounting stops being viable
- **Risk Analysis**: Decision trees show how uncertainty in demand affects outcomes

## 🎓 Educational Value

This project demonstrates:
- Real-world application of Game Theory in competitive business scenarios
- Data-driven decision making under uncertainty
- Visual communication of complex strategic concepts
- Interactive exploration of mathematical models

---

**Built with ❤️ for Game Theory & Decision Analysis Lab**
