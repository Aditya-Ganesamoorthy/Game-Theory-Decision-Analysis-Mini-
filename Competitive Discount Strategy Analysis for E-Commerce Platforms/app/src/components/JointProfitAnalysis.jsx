import React from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, AlertCircle, Info } from 'lucide-react';
import { formatCurrency, STRATEGIES } from '../utils/gameTheory';

const JointProfitAnalysis = ({ matrix, analysis }) => {
    if (!matrix || !analysis) return null;

    const { nashEquilibria } = analysis;
    const jointProfits = [];

    // Calculate joint profits for all strategy pairs
    STRATEGIES.forEach(amz => {
        STRATEGIES.forEach(flip => {
            const joint = matrix[amz][flip].amazonProfit + matrix[amz][flip].flipkartProfit;
            jointProfits.push({
                amazon: amz,
                flipkart: flip,
                jointProfit: joint,
                isNash: nashEquilibria.some(n => n.amazon === amz && n.flipkart === flip)
            });
        });
    });

    // Find highest joint profit
    const highestJoint = [...jointProfits].sort((a, b) => b.jointProfit - a.jointProfit)[0];

    // Find the primary Nash Equilibrium joint profit (take the first one if multiple exist)
    const nashPair = jointProfits.find(p => p.isNash);

    const isNashSuboptimal = nashPair && highestJoint && nashPair.jointProfit < highestJoint.jointProfit;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="joint-profit-panel"
        >
            <div className="panel-header">
                <Users className="header-icon" />
                <h3>Joint Profit Analysis</h3>
                <p>Evaluating Total Market Value Creation (Social Optimum)</p>
            </div>

            <div className="joint-grid">
                {jointProfits.map((item, idx) => (
                    <div
                        key={`${item.amazon}-${item.flipkart}`}
                        className={`joint-item ${item.isNash ? 'is-nash' : ''} ${item === highestJoint ? 'is-highest' : ''}`}
                    >
                        <div className="joint-label">
                            {item.amazon} × {item.flipkart}
                        </div>
                        <div className="joint-value">
                            {formatCurrency(item.jointProfit)}
                        </div>
                        <div className="badges">
                            {item.isNash && <span className="badge nash">Nash Eq.</span>}
                            {item === highestJoint && <span className="badge social">Social Opt.</span>}
                        </div>
                    </div>
                ))}
            </div>

            <div className="cooperation-insight">
                <div className="insight-header">
                    <Info size={20} />
                    <h4>Strategic Insight</h4>
                </div>
                <div className="insight-content">
                    {isNashSuboptimal ? (
                        <div className="comparison-statement critical">
                            <AlertCircle size={24} className="warning-icon" />
                            <p>
                                <strong>Comparison:</strong> Strategic competition leads to suboptimal collective outcome (Prisoner’s Dilemma structure).
                            </p>
                            <p className="academic-note">
                                The Nash Equilibrium profit ({formatCurrency(nashPair.jointProfit)}) is significantly lower than the Social Optimum ({formatCurrency(highestJoint.jointProfit)}).
                            </p>
                        </div>
                    ) : (
                        <div className="comparison-statement optimal">
                            <TrendingUp size={24} className="success-icon" />
                            <p>
                                <strong>Comparison:</strong> Individual competition aligns with collective efficiency.
                            </p>
                            <p className="academic-note">
                                The Nash Equilibrium successfully captures the maximum available market value of {formatCurrency(highestJoint.jointProfit)}.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default JointProfitAnalysis;
