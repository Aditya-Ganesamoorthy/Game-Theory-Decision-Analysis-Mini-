import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../utils/gameTheory';

const DecisionTree = ({ data }) => {
    if (!data) return null;

    const { amazonStrategy, flipkartStrategy, emv, branches, perspective = 'Amazon' } = data;

    // Perspective Colors
    const isAmazon = perspective === 'Amazon';
    const primaryColor = isAmazon ? '#3b82f6' : '#ec4899';
    const secondaryColor = isAmazon ? '#2563eb' : '#db2777';

    // SVG dimensions and scaling
    const width = 900;
    const height = 450;
    const margin = { top: 40, right: 150, bottom: 40, left: 180 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Node coordinates
    const rootX = margin.left;
    const rootY = height / 2;

    // Chance node coordinates (Middle column)
    const chanceX = margin.left + innerWidth / 2;
    // Leaf node coordinates (Right column)
    const leafX = margin.left + innerWidth;

    const branchSpacing = innerHeight / (branches.length - 1 || 1);

    return (
        <div className="decision-tree-svg-container" style={{ width: '100%', overflow: 'hidden' }}>
            <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
                <defs>
                    <linearGradient id="dynamicGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={primaryColor} />
                        <stop offset="100%" stopColor={secondaryColor} />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* Main Connections */}
                {branches.map((branch, i) => {
                    const y = margin.top + (i * branchSpacing);
                    return (
                        <g key={`branch-${i}`}>
                            {/* Line from Root to Chance Node */}
                            <motion.line
                                x1={rootX} y1={rootY}
                                x2={chanceX} y2={y}
                                stroke="rgba(148, 163, 184, 0.3)"
                                strokeWidth="2"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.8, delay: i * 0.1 }}
                            />
                            {/* Line from Chance Node to Leaf */}
                            <motion.line
                                x1={chanceX} y1={y}
                                x2={leafX} y2={y}
                                stroke="rgba(148, 163, 184, 0.2)"
                                strokeWidth="2"
                                strokeDasharray="4 4"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
                            />

                            {/* Probability Label on Branch */}
                            <motion.g
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                            >
                                <rect
                                    x={(rootX + chanceX) / 2 - 25}
                                    y={(rootY + y) / 2 - 12}
                                    width="50" height="24"
                                    rx="12" fill="#1e293b"
                                    stroke={`${primaryColor}66`}
                                />
                                <text
                                    x={(rootX + chanceX) / 2}
                                    y={(rootY + y) / 2 + 5}
                                    textAnchor="middle"
                                    fill={primaryColor}
                                    fontSize="11"
                                    fontWeight="bold"
                                    style={{ fontFamily: "'DM Mono', monospace" }}
                                >
                                    {(branch.probability * 100).toFixed(0)}%
                                </text>
                            </motion.g>

                            {/* Chance Node (Demand Label) */}
                            <motion.g
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', damping: 12, delay: 0.7 + i * 0.1 }}
                            >
                                <circle cx={chanceX} cy={y} r="8" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
                                <text
                                    x={chanceX} y={y - 15}
                                    textAnchor="middle"
                                    fill="#cbd5e1"
                                    fontSize="12"
                                    fontWeight="600"
                                >
                                    {branch.demand} Demand
                                </text>
                            </motion.g>

                            {/* Leaf Node (Profit) */}
                            <motion.g
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1.2 + i * 0.1 }}
                            >
                                <rect
                                    x={leafX} y={y - 18}
                                    width="140" height="36"
                                    rx="8" fill="rgba(30, 41, 59, 0.8)"
                                    stroke="rgba(148, 163, 184, 0.1)"
                                />
                                <text
                                    x={leafX + 10} y={y + 5}
                                    fill="#e2e8f0"
                                    fontSize="13"
                                    fontWeight="600"
                                    style={{ fontFamily: "'DM Mono', monospace" }}
                                >
                                    {formatCurrency(branch.payoff)}
                                </text>
                            </motion.g>
                        </g>
                    );
                })}

                {/* Root Node (Strategy Pair) */}
                <motion.g
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                >
                    <rect
                        x={rootX - 160} y={rootY - 40}
                        width="160" height="80"
                        rx="16" fill="url(#dynamicGradient)"
                        filter="url(#glow)"
                    />
                    <text x={rootX - 80} y={rootY - 10} textAnchor="middle" fill="#fff" fontSize="14" fontWeight="800">
                        {amazonStrategy} vs {flipkartStrategy}
                    </text>
                    <text x={rootX - 80} y={rootY + 15} textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="10" fontWeight="bold">
                        Payoff for {perspective}
                    </text>
                    <text x={rootX - 80} y={rootY + 30} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="800">
                        EMV: {formatCurrency(emv)}
                    </text>
                </motion.g>
            </svg>

            {/* EMV Breakdown Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                style={{
                    marginTop: '2rem',
                    padding: '1.5rem',
                    background: 'rgba(15, 23, 42, 0.4)',
                    borderRadius: '1rem',
                    border: '1px solid rgba(148, 163, 184, 0.1)',
                    fontFamily: "'DM Mono', monospace"
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ width: '4px', height: '16px', background: primaryColor, borderRadius: '2px' }}></div>
                    <h4 style={{ margin: 0, color: isAmazon ? '#60a5fa' : '#f472b6', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        {perspective} EMV Calculation Breakdown
                    </h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', color: '#94a3b8' }}>
                        <span style={{ fontWeight: 'bold' }}>Formula:</span>
                        <span>Σ (Demand Probability × {perspective} Profit)</span>
                    </div>

                    <div style={{
                        padding: '1.25rem',
                        background: 'rgba(0, 0, 0, 0.2)',
                        borderRadius: '0.75rem',
                        border: `1px solid ${primaryColor}22`,
                        lineHeight: '1.8'
                    }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px', color: '#cbd5e1' }}>
                            <span style={{ color: isAmazon ? '#60a5fa' : '#f472b6', fontWeight: 'bold', marginRight: '8px' }}>EMV =</span>
                            {branches.map((branch, i) => (
                                <React.Fragment key={i}>
                                    <span style={{ color: '#e2e8f0' }}>
                                        ({branch.probability.toFixed(2)} × {formatCurrency(branch.payoff)})
                                    </span>
                                    {i < branches.length - 1 && <span style={{ color: '#64748b', margin: '0 4px' }}>+</span>}
                                </React.Fragment>
                            ))}
                        </div>
                        <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(148, 163, 184, 0.1)', paddingTop: '0.5rem', color: '#fff', fontSize: '1rem', fontWeight: 'bold' }}>
                            Result: {formatCurrency(emv)}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default DecisionTree;
