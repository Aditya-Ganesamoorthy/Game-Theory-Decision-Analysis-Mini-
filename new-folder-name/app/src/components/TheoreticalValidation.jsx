import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ChevronDown, ChevronUp, AlertCircle, RefreshCw, BarChart2 } from 'lucide-react';
import { formatCurrency, analyzeGame, getPerturbedData, classifyGameStructure, STRATEGIES } from '../utils/gameTheory';

const TheoreticalValidation = ({ matrix, analysis, rawData, year, adMultiplier }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const primaryNash = analysis?.nashEquilibria[0];

    // 1. Nash Equilibrium Verification Logic
    const verification = useMemo(() => {
        if (!matrix || !primaryNash) return null;
        const sA_star = primaryNash.amazon;
        const sF_star = primaryNash.flipkart;

        const amzPayoff_star = matrix[sA_star][sF_star].amazonProfit;
        const flipPayoff_star = matrix[sA_star][sF_star].flipkartProfit;

        // Amazon deviations given sF*
        const amzDeviations = STRATEGIES.map(s => ({
            strategy: s,
            payoff: matrix[s][sF_star].amazonProfit,
            isStar: s === sA_star
        }));

        // Flipkart deviations given sA*
        const flipDeviations = STRATEGIES.map(s => ({
            strategy: s,
            payoff: matrix[sA_star][s].flipkartProfit,
            isStar: s === sF_star
        }));

        return { sA_star, sF_star, amzPayoff_star, flipPayoff_star, amzDeviations, flipDeviations };
    }, [matrix, primaryNash]);

    // 2. Robustness Test Logic
    const robustness = useMemo(() => {
        if (!rawData || !year || !primaryNash) return null;

        // Test in both directions (+5% and -5%)
        const matrixPos = getPerturbedData(rawData, year, adMultiplier, 1);
        const matrixNeg = getPerturbedData(rawData, year, adMultiplier, -1);

        const analysisPos = analyzeGame(matrixPos);
        const analysisNeg = analyzeGame(matrixNeg);

        const nashPos = analysisPos.nashEquilibria[0];
        const nashNeg = analysisNeg.nashEquilibria[0];

        const isRobust = (nashPos?.amazon === primaryNash.amazon && nashPos?.flipkart === primaryNash.flipkart) &&
            (nashNeg?.amazon === primaryNash.amazon && nashNeg?.flipkart === primaryNash.flipkart);

        return { isRobust };
    }, [rawData, year, primaryNash, adMultiplier]);

    // 3. Classification
    const classification = useMemo(() => classifyGameStructure(matrix, analysis), [matrix, analysis]);

    if (!primaryNash) return null;

    return (
        <div className="theoretical-validation-panel" style={{ width: '100%', maxWidth: '1000px', margin: '1.5rem auto' }}>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="validation-toggle-btn"
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.25rem 2rem',
                    background: 'rgba(30, 41, 59, 0.4)',
                    border: '1px solid rgba(148, 163, 184, 0.1)',
                    borderRadius: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <ShieldCheck size={20} color="#3b82f6" />
                    <span style={{ fontWeight: '700', color: '#e2e8f0', letterSpacing: '0.05em' }}>
                        THEORETICAL VALIDATION & ROBUSTNESS PANEL
                    </span>
                </div>
                {isExpanded ? <ChevronUp size={20} color="#94a3b8" /> : <ChevronDown size={20} color="#94a3b8" />}
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{
                            padding: '2.5rem',
                            background: 'rgba(15, 23, 42, 0.3)',
                            border: '1px solid rgba(148, 163, 184, 0.05)',
                            borderTop: 'none',
                            borderBottomLeftRadius: '1rem',
                            borderBottomRightRadius: '1rem',
                            backdropFilter: 'blur(10px)'
                        }}>

                            {/* 1. Formal Verification */}
                            <div className="validation-section" style={{ marginBottom: '2.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                    <RefreshCw size={18} color="#60a5fa" />
                                    <h4 style={{ margin: 0, color: '#60a5fa', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.1em' }}>
                                        Nash Equilibrium Formal Verification
                                    </h4>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                    {/* Amazon Logic */}
                                    <div className="dev-box" style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1rem' }}>
                                            π<sub>A</sub>(s<sub>A</sub>*, s<sub>F</sub>*) ≥ π<sub>A</sub>(s<sub>A</sub>, s<sub>F</sub>*) ∀ s<sub>A</sub>
                                        </div>
                                        {verification.amzDeviations.map(dev => (
                                            <div key={dev.strategy} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', opacity: dev.isStar ? 1 : 0.6 }}>
                                                <span style={{ fontSize: '0.85rem', color: dev.isStar ? '#fff' : '#94a3b8' }}>
                                                    {dev.isStar ? '→' : ' '} π<sub>A</sub>({dev.strategy}, {verification.sF_star})
                                                </span>
                                                <span style={{ fontWeight: dev.isStar ? '800' : '400', color: dev.isStar ? '#60a5fa' : '#cbd5e1' }}>
                                                    {formatCurrency(dev.payoff)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Flipkart Logic */}
                                    <div className="dev-box" style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1rem' }}>
                                            π<sub>F</sub>(s<sub>A</sub>*, s<sub>F</sub>*) ≥ π<sub>F</sub>(s<sub>A</sub>*, s<sub>F</sub>) ∀ s<sub>F</sub>
                                        </div>
                                        {verification.flipDeviations.map(dev => (
                                            <div key={dev.strategy} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', opacity: dev.isStar ? 1 : 0.6 }}>
                                                <span style={{ fontSize: '0.85rem', color: dev.isStar ? '#fff' : '#94a3b8' }}>
                                                    {dev.isStar ? '→' : ' '} π<sub>F</sub>({verification.sA_star}, {dev.strategy})
                                                </span>
                                                <span style={{ fontWeight: dev.isStar ? '800' : '400', color: dev.isStar ? '#60a5fa' : '#cbd5e1' }}>
                                                    {formatCurrency(dev.payoff)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                {/* 2. Robustness Test */}
                                <div className="validation-section">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                        <AlertCircle size={18} color="#f59e0b" />
                                        <h4 style={{ margin: 0, color: '#f59e0b', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.1em' }}>
                                            Equilibrium Robustness Test
                                        </h4>
                                    </div>
                                    <div style={{ padding: '1.25rem', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '0.75rem', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: robustness.isRobust ? '#fbbf24' : '#ef4444', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {robustness.isRobust ? '✔️ Equilibrium is robust to small probability variations (±5%)' : '❌ Equilibrium shifts under probability perturbation'}
                                        </p>
                                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                            Sensitivity check indicates that the {primaryNash.amazon}-{primaryNash.flipkart} equilibrium is {robustness.isRobust ? 'computationally stable' : 'sensitive'} under noise.
                                        </p>
                                    </div>
                                </div>

                                {/* 3. Game Structure */}
                                <div className="validation-section">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                        <BarChart2 size={18} color="#10b981" />
                                        <h4 style={{ margin: 0, color: '#10b981', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.1em' }}>
                                            Game Structure Classification
                                        </h4>
                                    </div>
                                    <div style={{ padding: '1.25rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '0.75rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                        <p style={{ margin: 0, fontSize: '1.1rem', color: '#34d399', fontWeight: '800' }}>
                                            {classification}
                                        </p>
                                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                                            Classified based on dominant strategy existence and Nash vs Social Optimum alignment.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* 4. Conclusion */}
                            <div className="conclusion-panel" style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(148, 163, 184, 0.1)' }}>
                                <p style={{ margin: 0, color: '#fff', fontSize: '0.95rem', lineHeight: '1.6', borderLeft: '3px solid #3b82f6', paddingLeft: '1.5rem', fontStyle: 'italic' }}>
                                    "The equilibrium outcome demonstrates that under the current cost and demand structure, rational profit-maximizing behavior leads to
                                    <strong> {primaryNash.amazon} (Amazon) vs {primaryNash.flipkart} (Flipkart)</strong>,
                                    and this equilibrium is <strong>{robustness.isRobust ? 'robust' : 'sensitive'}</strong> to moderate parameter changes."
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TheoreticalValidation;
