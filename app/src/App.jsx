
import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Calendar, AlertCircle } from 'lucide-react';
import PayoffMatrix from './components/PayoffMatrix';
import DecisionTree from './components/DecisionTree';
import SensitivityAnalysis from './components/SensitivityAnalysis';
import StrategicAdvice from './components/StrategicAdvice';
import JointProfitAnalysis from './components/JointProfitAnalysis';
import TheoreticalValidation from './components/TheoreticalValidation';
import { processData, processDataForYear, analyzeGame, getDecisionTreeData, calculateMixedStrategy, STRATEGIES } from './utils/gameTheory';
import './index.css';

const panelStyles = {
  container: {
    background: 'rgba(30, 41, 59, 0.5)',
    border: '1px solid rgba(148, 163, 184, 0.1)',
    borderRadius: '1.5rem',
    padding: '2.5rem',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.4)',
    width: '100%',
    marginTop: '3rem'
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem'
  },
  title: {
    fontSize: '1.75rem',
    margin: 0,
    color: '#e2e8f0',
    background: 'linear-gradient(to right, #fff, #94a3b8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  subtitle: {
    color: '#3b82f6',
    fontWeight: 600,
    marginTop: '0.5rem',
    fontFamily: "'DM Mono', monospace"
  }
};

function App() {
  const [rawData, setRawData] = useState([]);
  const [selectedYear, setSelectedYear] = useState('2021');
  const [adMultiplier, setAdMultiplier] = useState(1.0);
  const [treePerspective, setTreePerspective] = useState('Amazon'); // Perspective toggle state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [active_pair, setActivePair] = useState('HD-HD');

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/final_festival_mobile_discount_dataset_2021_2025.csv');
        if (!response.ok) {
          throw new Error(`Failed to fetch CSV: ${response.statusText}`);
        }
        const text = await response.text();

        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setRawData(results.data);
            setLoading(false);
          },
          error: (err) => {
            setError(err.message);
            setLoading(false);
          }
        });
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Reactive Year Filter
  const filteredData = useMemo(() =>
    rawData.filter(row => String(row.Festival_Year) === String(selectedYear))
    , [rawData, selectedYear]);

  // Memoize Matrix and Analysis for stability
  const currentMatrix = useMemo(() =>
    filteredData.length > 0 ? processDataForYear(filteredData, adMultiplier) : null
    , [filteredData, adMultiplier]);

  const analysis = useMemo(() =>
    currentMatrix ? analyzeGame(currentMatrix) : null
    , [currentMatrix]);

  // Sync Active Pair to Nash Equilibrium on data change
  useEffect(() => {
    if (analysis && analysis.nashEquilibria.length > 0) {
      const primaryNash = analysis.nashEquilibria[0];
      const nashId = `${primaryNash.amazon}-${primaryNash.flipkart}`;
      setActivePair(nashId);
    }
  }, [analysis]); // Depend on analysis result for consistent sync

  const handleCellClick = (amazon, flipkart) => {
    setActivePair(`${amazon}-${flipkart}`);
  };

  const years = useMemo(() =>
    [...new Set(rawData.map(row => String(row.Festival_Year)))].sort()
    , [rawData]);

  // Split active_pair back for logic
  const [activeAmz, activeFlip] = active_pair.split('-');

  const decisionTreeData = useMemo(() => {
    if (!active_pair || filteredData.length === 0) return null;
    return getDecisionTreeData(filteredData, selectedYear, activeAmz, activeFlip, adMultiplier, treePerspective);
  }, [filteredData, selectedYear, activeAmz, activeFlip, adMultiplier, treePerspective]);

  const mixedStrategy = useMemo(() =>
    currentMatrix ? calculateMixedStrategy(currentMatrix) : null
    , [currentMatrix]);

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-content">
          <div className="logo-area">
            <div className="logo-icon">
              <Gamepad2 size={28} color="white" />
            </div>
            <div className="app-title">
              <h1>Game Theory Lab</h1>
              <p className="app-subtitle">E-Commerce Strategy Analysis</p>
            </div>
          </div>

          <div className="legend">
            <div className="legend-item">
              <span className="dot nash"></span>
              Nash Equilibria
            </div>
            <div className="legend-item">
              <span className="dot dominant"></span>
              Dominant Strategies
            </div>
            <div className="legend-item">
              <span className="dot best-response"></span>
              Best Responses
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="loading-container"
            >
              <div className="spinner"></div>
              <p>Loading Analysis Module...</p>
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="error-box"
            >
              <AlertCircle size={32} style={{ display: 'block', margin: '0 auto 1rem' }} />
              <h3>Error Loading Data</h3>
              <p>{error}</p>
              <button onClick={() => window.location.reload()} style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'inherit', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
                Retry
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <div className="controls-section">
                <div className="year-selector">
                  <div className="icon-wrapper">
                    <Calendar color="#60a5fa" size={24} />
                  </div>
                  <div className="select-wrapper">
                    <span className="select-label">Select Festival Year</span>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                    >
                      {years.map(year => (
                        <option key={year} value={year}>
                          Festival Year {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="instruction-text" style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '0.5rem', color: '#94a3b8' }}>
                  Select a cell to view specific Decision Tree details. Highlighted cells represent <strong>Best Responses</strong>.
                </p>
              </div>

              {currentMatrix && (
                <motion.div
                  key={selectedYear}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                  <PayoffMatrix
                    matrix={currentMatrix}
                    analysis={analysis}
                    strategies={STRATEGIES}
                    onCellClick={handleCellClick}
                    activePair={active_pair}
                  />

                  <TheoreticalValidation
                    matrix={currentMatrix}
                    analysis={analysis}
                    rawData={rawData}
                    year={selectedYear}
                    adMultiplier={adMultiplier}
                  />

                  <JointProfitAnalysis
                    matrix={currentMatrix}
                    analysis={analysis}
                  />

                  <StrategicAdvice
                    mixedStrategy={mixedStrategy}
                    selectedYear={selectedYear}
                    analysis={analysis}
                    currentMatrix={currentMatrix}
                  />
                </motion.div>
              )}

              <AnimatePresence>
                {decisionTreeData && (
                  <motion.div
                    id="selected-strategy-panel"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={panelStyles.container}
                  >
                    <div style={panelStyles.header}>
                      <h3 style={panelStyles.title}>Selected Strategy Details</h3>
                      <p style={panelStyles.subtitle}>
                        Amazon: {activeAmz} vs Flipkart: {activeFlip}
                      </p>
                    </div>

                    {/* Perspective Toggle */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                      <div className="perspective-toggle" style={{
                        background: 'rgba(15, 23, 42, 0.4)',
                        padding: '0.25rem',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        gap: '0.25rem',
                        border: '1px solid rgba(148, 163, 184, 0.1)'
                      }}>
                        {['Amazon', 'Flipkart'].map(p => (
                          <button
                            key={p}
                            onClick={() => setTreePerspective(p)}
                            style={{
                              padding: '0.6rem 1.5rem',
                              borderRadius: '0.6rem',
                              border: 'none',
                              fontSize: '0.85rem',
                              fontWeight: '700',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              background: treePerspective === p ? (p === 'Amazon' ? '#3b82f6' : '#ec4899') : 'transparent',
                              color: treePerspective === p ? '#fff' : '#94a3b8',
                              boxShadow: treePerspective === p ? `0 4px 12px ${p === 'Amazon' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(236, 72, 153, 0.3)'}` : 'none'
                            }}
                          >
                            {p} View
                          </button>
                        ))}
                      </div>
                    </div>

                    <DecisionTree data={decisionTreeData} />
                  </motion.div>
                )}
              </AnimatePresence>

              {filteredData.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{ width: '100%', marginTop: '3rem' }}
                >
                  <SensitivityAnalysis
                    rawData={rawData}
                    adMultiplier={adMultiplier}
                    setAdMultiplier={setAdMultiplier}
                  />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="footer">
        <p>Game Theory & Decision Analysis Lab Project • Analysis for Strategic Pricing</p>
      </footer>
    </div>
  );
}

export default App;
