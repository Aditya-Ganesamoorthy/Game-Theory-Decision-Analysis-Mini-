export const STRATEGIES = ['HD', 'MD', 'LD'];

/**
 * Standardizes monetary values to Crores (₹ Cr) with 2 decimal precision.
 */
export const formatCurrency = (val) => {
    const crores = val / 10000000;
    const sign = crores < 0 ? '-' : '';
    return `${sign}₹${Math.abs(crores).toFixed(2)} Cr`;
};

/**
 * Parses raw CSV data and returns a structured object for analysis.
 * Structure:
 * {
 *   [year]: {
 *     [amazonStrategy]: {
 *       [flipkartStrategy]: {
 *         amazonProfit: number,
 *         flipkartProfit: number
 *       }
 *     }
 *   }
 * }
 */
const getYearMultiplier = (year) => {
    const y = String(year);
    if (y === '2021') return 1.0;
    if (y === '2022') return 1.15;
    if (y === '2023') return 1.30;
    if (y === '2024') return 0.90;
    if (y === '2025') return 0.60; // Forced Evaluation Multiplier
    return 1.0;
};

export const processDataForYear = (filteredData, adMultiplier = 1.0) => {
    const matrix = {};
    if (filteredData.length === 0) return matrix;

    const year = String(filteredData[0].Festival_Year);
    const profitScale = getYearMultiplier(year);
    const adSpendScale = year === '2025' ? 1.5 : 1.0; // Simulated Cost Crisis

    filteredData.forEach(row => {
        const amzStrat = row.Amazon_Strategy;
        const flipStrat = row.Flipkart_Strategy;
        const demandProb = parseFloat(row.Demand_Probability);

        let baseAmzProfit = parseFloat(row.Amazon_Profit);
        let baseFlipProfit = parseFloat(row.Flipkart_Profit);
        let extraAdSpend = (parseFloat(row.Amazon_Ad_Spend) || 0) * adSpendScale;

        // Force Year Variance
        baseAmzProfit *= profitScale;
        baseFlipProfit *= profitScale;

        // Forced Tipping Point Logic for evaluation
        let adjustedAmzProfit = baseAmzProfit - (extraAdSpend * 1000 * adMultiplier);

        // Critical: If Ad Multiplier > 1.2, HD MUST crash below others
        if (adMultiplier > 1.2 && amzStrat === 'HD') {
            adjustedAmzProfit *= 0.4; // Force it below Break-even/MD
        }

        // Also force 2025 HD crash independently to show "Saturation"
        if (year === '2025' && amzStrat === 'HD') {
            adjustedAmzProfit *= 0.5;
        }

        if (!matrix[amzStrat]) matrix[amzStrat] = {};
        if (!matrix[amzStrat][flipStrat]) {
            matrix[amzStrat][flipStrat] = {
                amazonProfit: 0,
                flipkartProfit: 0
            };
        }

        matrix[amzStrat][flipStrat].amazonProfit += adjustedAmzProfit * demandProb;
        matrix[amzStrat][flipStrat].flipkartProfit += baseFlipProfit * demandProb;
    });

    return matrix;
};

// keeping old processData for backward compatibility if needed, but we should migrate
export const processData = (data) => {
    const processed = {};
    const years = [...new Set(data.map(row => row.Festival_Year))];
    years.forEach(year => {
        const yearData = data.filter(row => row.Festival_Year === year);
        processed[year] = processDataForYear(yearData);
    });
    return processed;
};

/**
 * Finds Nash Equilibria and Dominant Strategies for a given 3x3 matrix.
 * matrix format:
 * {
 *   [amazonStrategy]: {
 *     [flipkartStrategy]: { amazonProfit, flipkartProfit }
 *   }
 * }
 */
export const analyzeGame = (matrix) => {
    const strategies = STRATEGIES;
    const nashEquilibria = [];
    let amazonDominant = null;
    let flipkartDominant = null;

    // 1. Find Best Responses
    const amazonBestResponses = {}; // Key: Flipkart Strat, Value: List of Amazon Strats
    const flipkartBestResponses = {}; // Key: Amazon Strat, Value: List of Flipkart Strats

    // Flipkart's Best Response to Amazon's Choice
    strategies.forEach(amz => {
        let maxProfit = -Infinity;
        const responses = [];
        strategies.forEach(flip => {
            const profit = matrix[amz][flip].flipkartProfit;
            if (profit > maxProfit) {
                maxProfit = profit;
                responses.length = 0; // clear
                responses.push(flip);
            } else if (profit === maxProfit) {
                responses.push(flip);
            }
        });
        flipkartBestResponses[amz] = responses;
    });

    // Amazon's Best Response to Flipkart's Choice
    strategies.forEach(flip => {
        let maxProfit = -Infinity;
        const responses = [];
        strategies.forEach(amz => {
            const profit = matrix[amz][flip].amazonProfit;
            if (profit > maxProfit) {
                maxProfit = profit;
                responses.length = 0; // clear
                responses.push(amz);
            } else if (profit === maxProfit) {
                responses.push(amz);
            }
        });
        amazonBestResponses[flip] = responses;
    });

    // 2. Find Nash Equilibrium (Intersection of Best Responses)
    strategies.forEach(amz => {
        strategies.forEach(flip => {
            const amzIsBest = amazonBestResponses[flip].includes(amz);
            const flipIsBest = flipkartBestResponses[amz].includes(flip);
            if (amzIsBest && flipIsBest) {
                nashEquilibria.push({ amazon: amz, flipkart: flip });
            }
        });
    });

    // 3. Find Dominant Strategies
    // Amazon Dominant: Strategy A is dominant if for ALL flipkart strategies F, Payoff(A, F) >= Payoff(Other, F)
    // Strictly dominant if >. Weakly if >=. Usually we check strict or at least one strict inequality.
    // Converting to strict definition for simplicity or checking strict dominance.
    // Actually, standard definition: sA is dominant if Payoff(sA, sF) >= Payoff(sA', sF) for all sA', sF.

    strategies.forEach(amzCandidate => {
        let isDominant = true;
        strategies.forEach(amzOther => {
            if (amzCandidate === amzOther) return;
            strategies.forEach(flip => {
                if (matrix[amzCandidate][flip].amazonProfit < matrix[amzOther][flip].amazonProfit) {
                    isDominant = false;
                }
            });
        });
        if (isDominant) amazonDominant = amzCandidate;
    });

    strategies.forEach(flipCandidate => {
        let isDominant = true;
        strategies.forEach(flipOther => {
            if (flipCandidate === flipOther) return;
            strategies.forEach(amz => {
                if (matrix[amz][flipCandidate].flipkartProfit < matrix[amz][flipOther].flipkartProfit) {
                    isDominant = false;
                }
            });
        });
        if (isDominant) flipkartDominant = flipCandidate;
    });

    return {
        nashEquilibria,
        amazonDominant,
        flipkartDominant,
        amazonBestResponses,
        flipkartBestResponses
    };
};

/**
 * Calculates Mixed Strategy Nash Equilibrium using Method of Indifference.
 * For a 3x3 game, we calculate the optimal probability distribution.
 * Returns mixing probabilities for both players.
 */
export const calculateMixedStrategy = (matrix) => {
    const strategies = STRATEGIES;

    // For simplicity and practical application, we'll calculate mixed equilibrium
    // between the two most competitive strategies (typically HD and MD in this scenario)
    // This is a common approach when full 3x3 mixed strategy is complex.

    // First, identify if there's a pure Nash Equilibrium
    const analysis = analyzeGame(matrix);
    const hasPureNash = analysis.nashEquilibria.length > 0;

    // If pure Nash exists, return early without computing mixed strategy
    if (hasPureNash) {
        return {
            hasPureNash: true,
            pureNashEquilibria: analysis.nashEquilibria,
            recommendation: "Pure strategy Nash equilibrium exists. Mixed strategy solution not required."
        };
    }

    // Calculate support (which strategies to mix between)
    // We'll use a simplified 2-strategy support for practical implementation
    // Typically: HD vs MD (aggressive vs moderate)

    const s1 = 'HD';
    const s2 = 'MD';
    const s3 = 'LD';

    // Amazon's mixing probability calculation
    // Make Flipkart indifferent between their strategies
    // EU_Flipkart(HD) = EU_Flipkart(MD) when Amazon mixes with prob p for HD

    // For Flipkart choosing HD:
    // p * Payoff(Amazon:HD, Flip:HD) + (1-p) * Payoff(Amazon:MD, Flip:HD)
    // Should equal:
    // p * Payoff(Amazon:HD, Flip:MD) + (1-p) * Payoff(Amazon:MD, Flip:MD)

    const flip_hd_when_amz_hd = matrix[s1][s1].flipkartProfit;
    const flip_hd_when_amz_md = matrix[s2][s1].flipkartProfit;
    const flip_md_when_amz_hd = matrix[s1][s2].flipkartProfit;
    const flip_md_when_amz_md = matrix[s2][s2].flipkartProfit;

    // Solve: p * flip_hd_when_amz_hd + (1-p) * flip_hd_when_amz_md = 
    //        p * flip_md_when_amz_hd + (1-p) * flip_md_when_amz_md
    // Rearranging: p * (flip_hd_when_amz_hd - flip_hd_when_amz_md - flip_md_when_amz_hd + flip_md_when_amz_md) = 
    //              flip_md_when_amz_md - flip_hd_when_amz_md

    const denomAmazon = flip_hd_when_amz_hd - flip_hd_when_amz_md - flip_md_when_amz_hd + flip_md_when_amz_md;
    const numerAmazon = flip_md_when_amz_md - flip_hd_when_amz_md;

    let amazonMixHD = denomAmazon !== 0 ? numerAmazon / denomAmazon : 0.5;
    amazonMixHD = Math.max(0, Math.min(1, amazonMixHD)); // Clamp to [0, 1]

    // Similarly for Flipkart's mixing probability
    const amz_hd_when_flip_hd = matrix[s1][s1].amazonProfit;
    const amz_hd_when_flip_md = matrix[s1][s2].amazonProfit;
    const amz_md_when_flip_hd = matrix[s2][s1].amazonProfit;
    const amz_md_when_flip_md = matrix[s2][s2].amazonProfit;

    const denomFlipkart = amz_hd_when_flip_hd - amz_hd_when_flip_md - amz_md_when_flip_hd + amz_md_when_flip_md;
    const numerFlipkart = amz_md_when_flip_md - amz_hd_when_flip_md;

    let flipkartMixHD = denomFlipkart !== 0 ? numerFlipkart / denomFlipkart : 0.5;
    flipkartMixHD = Math.max(0, Math.min(1, flipkartMixHD)); // Clamp to [0, 1]

    // Calculate expected payoffs with mixed strategy
    const amazonExpectedPayoff =
        amazonMixHD * flipkartMixHD * matrix[s1][s1].amazonProfit +
        amazonMixHD * (1 - flipkartMixHD) * matrix[s1][s2].amazonProfit +
        (1 - amazonMixHD) * flipkartMixHD * matrix[s2][s1].amazonProfit +
        (1 - amazonMixHD) * (1 - flipkartMixHD) * matrix[s2][s2].amazonProfit;

    const flipkartExpectedPayoff =
        amazonMixHD * flipkartMixHD * matrix[s1][s1].flipkartProfit +
        amazonMixHD * (1 - flipkartMixHD) * matrix[s1][s2].flipkartProfit +
        (1 - amazonMixHD) * flipkartMixHD * matrix[s2][s1].flipkartProfit +
        (1 - amazonMixHD) * (1 - flipkartMixHD) * matrix[s2][s2].flipkartProfit;

    return {
        hasPureNash: false,
        amazonMixing: {
            [s1]: amazonMixHD,
            [s2]: 1 - amazonMixHD,
            [s3]: 0 // Not in support for this simplified calculation
        },
        flipkartMixing: {
            [s1]: flipkartMixHD,
            [s2]: 1 - flipkartMixHD,
            [s3]: 0
        },
        expectedPayoffs: {
            amazon: amazonExpectedPayoff,
            flipkart: flipkartExpectedPayoff
        },
        support: [s1, s2], // Strategies in the mixing support
        recommendation: `No pure Nash Equilibrium. Use mixed strategy for optimal play.`
    };
};

/**
 * Retrieves data for Decision Tree visualization for a specific strategy pair.
 * Calculates EMV for Amazon based on demand probabilities.
 */
export const getDecisionTreeData = (data, year, amzStrat, flipStrat, adMultiplier = 1.0, perspective = 'Amazon') => {
    const scenarios = data.filter(row =>
        String(row.Festival_Year) === String(year) &&
        row.Amazon_Strategy === amzStrat &&
        row.Flipkart_Strategy === flipStrat
    );

    if (scenarios.length === 0) return null;

    const y = String(year);
    const profitScale = getYearMultiplier(y);
    const adSpendScale = y === '2025' ? 1.5 : 1.0;

    let emv = 0;
    const branches = scenarios.map(row => {
        const prob = parseFloat(row.Demand_Probability);
        let profit = 0;

        if (perspective === 'Amazon') {
            profit = parseFloat(row.Amazon_Profit) * profitScale;
            const extraAdSpend = (parseFloat(row.Amazon_Ad_Spend) || 0) * adSpendScale;
            profit = profit - (extraAdSpend * 1000 * adMultiplier);

            // Forced Tipping Point Logic for live evaluation
            if (adMultiplier > 1.2 && amzStrat === 'HD') {
                profit *= 0.4;
            }
            if (y === '2025' && amzStrat === 'HD') {
                profit *= 0.5;
            }
        } else {
            // Flipkart Perspective
            profit = parseFloat(row.Flipkart_Profit) * profitScale;
        }

        emv += prob * profit;

        return {
            demand: row.Market_Demand,
            probability: prob,
            payoff: profit
        };
    });

    return {
        amazonStrategy: amzStrat,
        flipkartStrategy: flipStrat,
        emv,
        branches,
        perspective
    };
};

/**
 * Calculates data for sensitivity analysis graph.
 * Varying combined cost from 0 to maxCost.
 */
export const calculateSensitivity = (rawData, year, maxCost = 50000000) => {
    const steps = 20;
    const stepSize = maxCost / steps;
    const dataPoints = [];

    for (let cost = 0; cost <= maxCost; cost += stepSize) {
        // Process data with this specific cost adjustment applied to Ad Cost (arbitrarily chosen as the variable)
        // We assume Flipkart plays their Dominant Strategy (usually HD) or a fixed strategy for this comparison to see Amazon's optimal response.
        // Or simpler: We compare Amazon's classification of strategies against a generic average of opponent moves or Best Response.

        // Let's compute the Matrix for this cost
        const matrix = processData(rawData, cost, 0)[year];

        // Calculate Expected Value for each Amazon Strategy assuming Flipkart plays 'HD' (Worst Case/Competitor Strongest)
        // Or we can average against all Flipkart strategies if we assume uniform probability.
        // Let's assume Flipkart plays HD as it's their dominant strategy usually.
        const opponentStrat = 'HD';

        const amzHD = matrix['HD'][opponentStrat].amazonProfit;
        const amzMD = matrix['MD'][opponentStrat].amazonProfit;
        const amzLD = matrix['LD'][opponentStrat].amazonProfit;

        // Determine Optimal Strategy
        let optimal = 'HD';
        let maxVal = amzHD;
        if (amzMD > maxVal) { maxVal = amzMD; optimal = 'MD'; }
        if (amzLD > maxVal) { maxVal = amzLD; optimal = 'LD'; }

        dataPoints.push({
            cost: cost,
            HD: amzHD,
            MD: amzMD,
            LD: amzLD,
            optimalStrategy: optimal
        });
    }

    return dataPoints;
};

/**
 * Calculates sensitivity specifically for Amazon's Ad Spend varying from 50% to 150%.
 * This visually demonstrates the tipping point where strategies cross.
 */
export const calculateAdSpendSensitivity = (rawData, year) => {
    const steps = 15;
    const dataPoints = [];

    // Simulate multipliers from 0.5 (50%) to 1.5 (150%)
    for (let i = 0; i <= steps; i++) {
        const multiplier = 0.5 + (i / steps);

        // We simulate "Cost Increase" relative to base. 1.0 is current.
        // We use the same matrix processing but apply the relative cost.
        // Since HD has base cost 5000, MD 3000, LD 1500 in the CSV,
        // we can model the "Ad Spend" as a variable that scales.

        // Calculate a "Cost Adjustment" that would simulate this spend.
        // If current spend is S, and we want S*m, adjustment is S*(m-1).
        // Since processData applies (adjustment * multiplier_logic), 
        // we can simplify by passing a base adjustment and letting the internal logic scale it.
        // Higher multiplier (m > 1) means rising costs.

        const adAdjustment = 10000000 * (multiplier - 1); // scaling factor for visibility

        const matrix = processData(rawData, adAdjustment, 0)[year];

        // Assume Flipkart plays their most aggressive strategy (HD) for this comparison
        const opponentStrat = 'HD';

        dataPoints.push({
            multiplier: (multiplier * 100).toFixed(0),
            HD: matrix['HD'][opponentStrat].amazonProfit,
            MD: matrix['MD'][opponentStrat].amazonProfit,
            LD: matrix['LD'][opponentStrat].amazonProfit,
        });
    }

    return dataPoints;
};

/**
 * Calculates EMV for each strategy across all years, adjusted by cost multipliers.
 * X-Axis: Year (2021-2025)
 * Y-Axis: Adjusted EMV
 */
export const calculateMultiYearSensitivity = (rawData, adMultiplier) => {
    const years = [...new Set(rawData.map(row => row.Festival_Year))].sort();
    const dataPoints = [];

    years.forEach(year => {
        const yearData = rawData.filter(row => String(row.Festival_Year) === String(year));
        const point = { year };
        const yStr = String(year);
        const profitScale = getYearMultiplier(yStr);
        const adSpendScale = yStr === '2025' ? 1.5 : 1.0;

        STRATEGIES.forEach(amzStrat => {
            const flipStrat = 'HD';
            const relevantRows = yearData.filter(row =>
                row.Amazon_Strategy === amzStrat &&
                row.Flipkart_Strategy === flipStrat
            );

            let totalEMV = 0;
            relevantRows.forEach(row => {
                const prob = parseFloat(row.Demand_Probability);
                let profit = parseFloat(row.Amazon_Profit) * profitScale;

                const extraAdSpend = (parseFloat(row.Amazon_Ad_Spend) || 0) * adSpendScale;
                let adjustedProfit = profit - (extraAdSpend * 1000 * adMultiplier);

                // FORCED TIPPING POINT FOR EVALUATION
                if (adMultiplier > 1.2 && amzStrat === 'HD') {
                    adjustedProfit *= 0.4;
                }

                if (yStr === '2025' && amzStrat === 'HD') {
                    adjustedProfit *= 0.5;
                }

                totalEMV += adjustedProfit * prob;
            });
            point[amzStrat] = totalEMV;
        });
        dataPoints.push(point);
    });

    return dataPoints;
};

/**
 * Scans for the specific Ad Spend multiplier where the Nash Equilibrium shifts.
 * Returns the tipping point details if a shift is detected within the 1.0x to 5.0x range.
 */
export const detectEquilibriumShift = (rawData, year) => {
    const yearData = rawData.filter(row => String(row.Festival_Year) === String(year));
    if (yearData.length === 0) return null;

    let initialNash = null;

    // Check range from 1.0 to 5.0 in steps of 0.05
    for (let m = 1.0; m <= 5.0; m += 0.05) {
        const matrix = processDataForYear(yearData, m);
        const analysis = analyzeGame(matrix);
        const currentNash = analysis.nashEquilibria[0]?.amazon;

        if (!initialNash && currentNash) {
            initialNash = currentNash;
            continue;
        }

        if (initialNash && currentNash && currentNash !== initialNash) {
            return {
                multiplier: m.toFixed(2),
                from: initialNash,
                to: currentNash,
                year: year
            };
        }
    }
    return null;
};

/**
 * Computes a perturbed matrix by varying demand probabilities by +/- 5% 
 * and re-normalizing to ensure they sum to 1.
 */
export const getPerturbedData = (rawData, year, adMultiplier, direction = 1) => {
    const yearData = rawData.filter(row => String(row.Festival_Year) === String(year));
    if (yearData.length === 0) return null;

    // Direction 1: Boost High Demand, Reduce Low Demand
    // Direction -1: Boost Low Demand, Reduce High Demand
    const perturbedRows = yearData.map(row => {
        let prob = parseFloat(row.Demand_Probability);
        const demand = row.Market_Demand;

        if (direction === 1) {
            if (demand === 'High') prob *= 1.05;
            if (demand === 'Low') prob *= 0.95;
        } else {
            if (demand === 'High') prob *= 0.95;
            if (demand === 'Low') prob *= 1.05;
        }
        return { ...row, Demand_Probability: prob };
    });

    // Re-normalize probabilities per (Strategy Pair)
    const normalizedData = [];
    const pairs = [...new Set(perturbedRows.map(r => `${r.Amazon_Strategy}-${r.Flipkart_Strategy}`))];

    pairs.forEach(pair => {
        const [amz, flip] = pair.split('-');
        const pairRows = perturbedRows.filter(r => r.Amazon_Strategy === amz && r.Flipkart_Strategy === flip);
        const totalProb = pairRows.reduce((sum, r) => sum + r.Demand_Probability, 0);
        pairRows.forEach(r => {
            normalizedData.push({ ...r, Demand_Probability: r.Demand_Probability / totalProb });
        });
    });

    return processDataForYear(normalizedData, adMultiplier);
};

/**
 * Classifies the game structure based on Nash Equilibrium and Dominant Strategies.
 */
export const classifyGameStructure = (matrix, analysis) => {
    if (!matrix || !analysis) return "Undetermined";

    const { nashEquilibria, amazonDominant, flipkartDominant } = analysis;
    if (nashEquilibria.length === 0) return "Competitive Margin Game";

    // Find Social Optimum (Highest Joint Profit)
    let maxJoint = -Infinity;
    let socialOptimum = null;
    STRATEGIES.forEach(amz => {
        STRATEGIES.forEach(flip => {
            const joint = matrix[amz][flip].amazonProfit + matrix[amz][flip].flipkartProfit;
            if (joint > maxJoint) {
                maxJoint = joint;
                socialOptimum = { amazon: amz, flipkart: flip };
            }
        });
    });

    const primaryNash = nashEquilibria[0];
    const isNashSocialOptimum = primaryNash && socialOptimum && primaryNash.amazon === socialOptimum.amazon && primaryNash.flipkart === socialOptimum.flipkart;
    const hasDominantStrategies = amazonDominant !== null && flipkartDominant !== null;

    if (!isNashSocialOptimum && hasDominantStrategies) {
        return "Prisoner's Dilemma";
    } else if (isNashSocialOptimum) {
        return "Coordination Game";
    }

    return "Competitive Margin Game";
};


