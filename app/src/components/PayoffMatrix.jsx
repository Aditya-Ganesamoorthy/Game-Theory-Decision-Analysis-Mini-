
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Target } from 'lucide-react';
import { formatCurrency } from '../utils/gameTheory';

const PayoffMatrix = ({ matrix, analysis, strategies, onCellClick, activePair }) => {
    if (!matrix) return <div className="loading-container">Loading Matrix...</div>;

    const { nashEquilibria, amazonDominant, flipkartDominant, amazonBestResponses, flipkartBestResponses } = analysis;


    return (
        <div className="matrix-component-container" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem', opacity: 0.8, fontSize: '0.9rem' }}>
                Values shown are <strong data-tooltip="Expected Monetary Value (EMV) = Σ (Demand Probability × Profit across High, Medium, Low demand states).">Expected Monetary Value (EMV) in Crores (₹ Cr)</strong>, calculated as the weighted average of profits across Low, Medium, and High demand scenarios.
            </div>

            <div className="matrix-wrapper">
                <div className="player-label p2">
                    <TrendingUp size={16} /> Flipkart (Player 2)
                </div>
                <div className="player-label p1">
                    <TrendingUp size={16} /> Amazon (Player 1)
                </div>

                <div className="matrix-grid">
                    {/* Top Left Empty */}
                    <div></div>

                    {/* Flipkart Columns */}
                    {strategies.map((strat) => (
                        <div
                            key={`col-${strat}`}
                            className={`header-cell ${flipkartDominant === strat ? 'dominant-p2' : ''}`}
                        >
                            {strat}
                            {flipkartDominant === strat && <Trophy size={14} style={{ marginLeft: '0.5rem', color: '#facc15' }} />}
                        </div>
                    ))}

                    {/* Rows */}
                    {strategies.map((amzStrat) => (
                        <React.Fragment key={`row-${amzStrat}`}>
                            {/* Amazon Row Header */}
                            <div
                                className={`header-cell ${amazonDominant === amzStrat ? 'dominant-p1' : ''}`}
                            >
                                {amzStrat}
                                {amazonDominant === amzStrat && <Trophy size={14} style={{ marginLeft: '0.5rem', color: '#facc15' }} />}
                            </div>

                            {/* Payoff Cells */}
                            {strategies.map((flipStrat) => {
                                const cellData = matrix[amzStrat][flipStrat];
                                const currentId = `${amzStrat}-${flipStrat}`;
                                const isSelected = activePair === currentId;
                                const isNash = nashEquilibria.some(n => n.amazon === amzStrat && n.flipkart === flipStrat);
                                const isAmzBest = amazonBestResponses[flipStrat]?.includes(amzStrat);
                                const isFlipBest = flipkartBestResponses[amzStrat]?.includes(flipStrat);

                                return (
                                    <motion.button
                                        key={currentId}
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{
                                            scale: isSelected ? 1.05 : 1,
                                            opacity: 1,
                                            border: isSelected ? '3px solid #60a5fa' : '1px solid rgba(148, 163, 184, 0.1)',
                                            boxShadow: isSelected ? '0 0 20px rgba(59, 130, 246, 0.4)' : 'none',
                                            backgroundColor: isSelected ? 'rgba(30, 41, 59, 0.8)' : 'rgba(15, 23, 42, 0.4)'
                                        }}
                                        whileHover={{ scale: 1.05, zIndex: 10 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => onCellClick && onCellClick(amzStrat, flipStrat)}
                                        className={`payoff-cell ${isNash ? 'nash' : ''} ${isSelected ? 'active-cell' : ''}`}
                                        style={{
                                            cursor: 'pointer',
                                            position: 'relative',
                                            width: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-start',
                                            outline: 'none'
                                        }}
                                    >
                                        {isNash && (
                                            <div className="nash-badge">
                                                <Trophy size={10} /> Nash Eq.
                                            </div>
                                        )}

                                        {(isAmzBest || isFlipBest) && !isNash && (
                                            <div className="best-response-badge" style={{
                                                position: 'absolute',
                                                top: '-8px',
                                                right: '10px',
                                                background: 'rgba(59, 130, 246, 0.8)',
                                                color: 'white',
                                                fontSize: '0.65rem',
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.25rem',
                                                zIndex: 10
                                            }}>
                                                <Target size={10} /> BR
                                            </div>
                                        )}

                                        <div className="payoff-row">
                                            <span className={`p1-score ${isAmzBest ? 'best-response-p1' : ''}`} data-tooltip="Expected Monetary Value (EMV) = Σ (Demand Probability × Profit across High, Medium, Low demand states).">
                                                A (EMV): {formatCurrency(cellData.amazonProfit)}
                                            </span>
                                        </div>
                                        <div className="payoff-row">
                                            <span className={`p2-score ${isFlipBest ? 'best-response-p2' : ''}`} data-tooltip="Expected Monetary Value (EMV) = Σ (Demand Probability × Profit across High, Medium, Low demand states).">
                                                F (EMV): {formatCurrency(cellData.flipkartProfit)}
                                            </span>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div className="analysis-panel">
                <div className="analysis-card">
                    <div className="analysis-title txt-p1">
                        <TrendingUp size={24} /> Amazon Analysis
                    </div>
                    <div className="analysis-content">
                        <p>Dominant Strategy: <span className="highlight txt-p1">{amazonDominant || "None"}</span></p>
                        <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>
                            {amazonDominant
                                ? `Amazon should always choose ${amazonDominant} for maximum payoff regardless of Flipkart's move.`
                                : "Amazon's best move depends on what Flipkart does."}
                        </p>
                    </div>
                </div>

                <div className="analysis-card">
                    <div className="analysis-title txt-p2">
                        <TrendingUp size={24} /> Flipkart Analysis
                    </div>
                    <div className="analysis-content">
                        <p>Dominant Strategy: <span className="highlight txt-p2">{flipkartDominant || "None"}</span></p>
                        <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>
                            {flipkartDominant
                                ? `Flipkart should always choose ${flipkartDominant} for maximum payoff regardless of Amazon's move.`
                                : "Flipkart's best move depends on what Amazon does."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PayoffMatrix;
