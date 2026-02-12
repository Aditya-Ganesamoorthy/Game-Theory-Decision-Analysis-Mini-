import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../utils/gameTheory';

const StrategicAdvice = ({ mixedStrategy, selectedYear, analysis, currentMatrix }) => {
    if (!mixedStrategy) return null;

    const {
        hasPureNash,
        pureNashEquilibria,
        amazonMixing,
        flipkartMixing,
        expectedPayoffs,
        support,
        recommendation
    } = mixedStrategy;

    const formatPercent = (val) => `${(val * 100).toFixed(1)}%`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="strategic-advice-container"
        >
            <div className="advice-header">
                <Lightbulb size={32} className="advice-icon" />
                <h2>Strategy & Equilibrium Analysis</h2>
                <p>Mixed Strategy Nash Equilibrium Analysis</p>
            </div>

            <div className="advice-content">
                {/* Recommendation Banner */}
                {hasPureNash ? (
                    <div className="recommendation-banner pure">
                        <TrendingUp size={20} />
                        <span>Pure Strategy Equilibrium Found</span>
                    </div>
                ) : (
                    <div className="recommendation-banner mixed">
                        <AlertTriangle size={20} />
                        <span>{recommendation}</span>
                    </div>
                )}

                {/* Pure Nash Equilibrium (if exists) */}
                {hasPureNash && pureNashEquilibria.length > 0 && (
                    <div className="nash-section">
                        <h3>Pure Strategy Equilibrium</h3>
                        <div className="nash-list">
                            {pureNashEquilibria.map((nash, idx) => (
                                <div key={idx} className="nash-item">
                                    <strong>Amazon: {nash.amazon}</strong> vs <strong>Flipkart: {nash.flipkart}</strong>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Mixed Strategy Solution */}
                {!hasPureNash ? (
                    <div className="mixed-strategy-section">
                        <h3>Mixed Strategy Solution</h3>
                        <p className="method-note">
                            Using <strong>Method of Indifference</strong> - Each player makes the opponent indifferent between strategies
                        </p>

                        <div className="players-grid">
                            {/* Amazon's Mixing */}
                            <div className="player-mixing">
                                <h4 className="player-name amazon">Amazon's Optimal Mix</h4>
                                <div className="mixing-bars">
                                    {support.map((strategy) => (
                                        <div key={strategy} className="mix-bar-row">
                                            <span className="strategy-label">{strategy}</span>
                                            <div className="mix-bar-container">
                                                <motion.div
                                                    className="mix-bar amazon"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${amazonMixing[strategy] * 100}%` }}
                                                    transition={{ duration: 0.5, delay: 0.2 }}
                                                />
                                            </div>
                                            <span className="mix-percent">{formatPercent(amazonMixing[strategy])}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="expected-payoff">
                                    <TrendingUp size={16} />
                                    <span>Expected Payoff: <strong>{formatCurrency(expectedPayoffs.amazon)}</strong></span>
                                </div>
                            </div>

                            {/* Flipkart's Mixing */}
                            <div className="player-mixing">
                                <h4 className="player-name flipkart">Flipkart's Optimal Mix</h4>
                                <div className="mixing-bars">
                                    {support.map((strategy) => (
                                        <div key={strategy} className="mix-bar-row">
                                            <span className="strategy-label">{strategy}</span>
                                            <div className="mix-bar-container">
                                                <motion.div
                                                    className="mix-bar flipkart"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${flipkartMixing[strategy] * 100}%` }}
                                                    transition={{ duration: 0.5, delay: 0.3 }}
                                                />
                                            </div>
                                            <span className="mix-percent">{formatPercent(flipkartMixing[strategy])}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="expected-payoff">
                                    <TrendingUp size={16} />
                                    <span>Expected Payoff: <strong>{formatCurrency(expectedPayoffs.flipkart)}</strong></span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mixed-strategy-section disabled">
                        <div className="info-banner">
                            <AlertTriangle size={20} />
                            <span>Pure strategy Nash equilibrium exists. Mixed strategy solution not required.</span>
                        </div>
                    </div>
                )}

                {/* Interpretation */}
                <div className="interpretation-box">
                    <h4>Interpretation</h4>
                    <ul>
                        {/* Dynamic Equilibrium Interpretations from Analysis */}
                        {analysis && analysis.nashEquilibria.map((nash, idx) => (
                            <li key={idx} className="market-insight" style={{
                                color: nash.amazon === 'HD' ? '#60a5fa' :
                                    nash.amazon === 'LD' ? '#10b981' : '#3b82f6',
                                borderLeft: `3px solid ${nash.amazon === 'HD' ? '#60a5fa' :
                                    nash.amazon === 'LD' ? '#10b981' : '#3b82f6'}`,
                                paddingLeft: '0.75rem',
                                marginBottom: '0.75rem'
                            }}>
                                🎯 <strong>Nash Equilibrium Found: {nash.amazon}-{nash.flipkart}</strong>
                                <br />
                                <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                                    {nash.amazon === 'HD' && nash.flipkart === 'HD' && "Aggressive high-discount equilibrium: Market share acquisition at the expense of profit margins."}
                                    {nash.amazon === 'MD' && nash.flipkart === 'MD' && "Moderate-intensity equilibrium: Balanced approach between volume and margin sustainability."}
                                    {nash.amazon === 'LD' && nash.flipkart === 'LD' && "Conservative low-discount equilibrium: Prioritizing margin protection and profitability over volume."}
                                    {(nash.amazon !== nash.flipkart) && `Asymmetric equilibrium: One player adopts a ${nash.amazon === 'HD' ? 'more aggressive' : 'more conservative'} stance than the other.`}
                                </span>
                            </li>
                        ))}

                        {/* Market Phase Context */}
                        {selectedYear === '2021' && (
                            <li className="market-insight" style={{ color: '#94a3b8', fontStyle: 'italic', borderTop: '1px solid rgba(148,163,184,0.1)', paddingTop: '0.5rem' }}>
                                📅 <strong>2021 Phase:</strong> Market entry/growth phase. Strategic stability depends on current operational subsidies.
                            </li>
                        )}
                        {selectedYear === '2025' && (
                            <li className="market-insight" style={{ color: '#ef4444', fontStyle: 'italic', borderTop: '1px solid rgba(148,163,184,0.1)', paddingTop: '0.5rem' }}>
                                ⚠️ <strong>2025 Phase:</strong> Mature/Saturation phase. Elevated marketing costs often force a move away from aggressive discounting.
                            </li>
                        )}

                        {/* Prisoner's Dilemma Special Case */}
                        {(() => {
                            if (selectedYear === '2021' && analysis && currentMatrix) {
                                const isHDHDNash = analysis.nashEquilibria.some(n => n.amazon === 'HD' && n.flipkart === 'HD');
                                const hdhdPayoff = currentMatrix['HD']['HD'].amazonProfit;

                                // Check if HD-HD is the "least worst" of negative outcomes
                                if (isHDHDNash && hdhdPayoff < 0) {
                                    return (
                                        <li className="critical-insight" style={{ color: '#ef4444', animation: 'pulse 2s infinite' }}>
                                            <strong>OBSERVATION:</strong> The market configuration represents a classic <strong>Prisoner's Dilemma</strong>.
                                            The HD-HD Nash Equilibrium represents a collectively suboptimal state characterized by negative expected utility.
                                        </li>
                                    );
                                }
                            }
                            return null;
                        })()}
                        {!hasPureNash && support && (
                            <>
                                {support.map(strat => (
                                    <li key={`amz-${strat}`}>
                                        <strong>Amazon</strong> should play <strong>{strat}</strong> {formatPercent(amazonMixing[strat])} of the time
                                        to keep Flipkart indifferent.
                                    </li>
                                ))}
                                {support.map(strat => (
                                    <li key={`flip-${strat}`}>
                                        <strong>Flipkart</strong> should play <strong>{strat}</strong> {formatPercent(flipkartMixing[strat])} of the time
                                        to keep Amazon indifferent.
                                    </li>
                                ))}
                                <li>
                                    This mixing creates <strong>strategic unpredictability</strong>, preventing the opponent from exploiting your strategy.
                                </li>
                            </>
                        )}
                    </ul>

                    <div className="simulation-note" style={{ marginTop: '1.5rem', padding: '0.75rem', borderTop: '1px solid rgba(148, 163, 184, 0.1)', fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic', textAlign: 'center' }}>
                        * Simulating market variance for academic demonstration.
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default StrategicAdvice;
