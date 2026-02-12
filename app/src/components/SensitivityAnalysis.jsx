import React, { useState, useEffect } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";
import { Sliders, TrendingDown, Info, ShieldAlert } from "lucide-react";
import { calculateMultiYearSensitivity, formatCurrency, detectEquilibriumShift } from "../utils/gameTheory";

const SensitivityAnalysis = ({ rawData, adMultiplier, setAdMultiplier }) => {
    const [chartData, setChartData] = useState([]);
    const [equilibriumShifts, setEquilibriumShifts] = useState([]);

    useEffect(() => {
        if (rawData) {
            const data = calculateMultiYearSensitivity(rawData, adMultiplier);
            setChartData(data);

            // Detect shifts for all years
            const years = [...new Set(rawData.map(r => String(r.Festival_Year)))].sort();
            const shifts = years.map(y => detectEquilibriumShift(rawData, y)).filter(Boolean);
            setEquilibriumShifts(shifts);
        }
    }, [rawData, adMultiplier]);



    return (
        <div className="sensitivity-container">
            <div className="sensitivity-header">
                <h2 data-tooltip="Expected Monetary Value (EMV) = Σ (Demand Probability × Profit across High, Medium, Low demand states).">Multi-Year EMV Analysis</h2>
                <p>Dynamic sensitivity of strategy outcomes across market phases (2021-2025)</p>
            </div>

            <div className="sensitivity-content" style={{ gridTemplateColumns: '350px 1fr' }}>
                <div className="controls-panel">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', color: '#60a5fa' }}>
                        <Sliders size={24} />
                        <h3 style={{ margin: 0 }}>Cost Multipliers</h3>
                    </div>

                    <div className="slider-group">
                        <label>
                            Ad Spend Multiplier
                            <span className="cost-value">{adMultiplier.toFixed(2)}x</span>
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="5"
                            step="0.05"
                            value={adMultiplier}
                            onChange={(e) => setAdMultiplier(parseFloat(e.target.value))}
                        />
                        <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                            Simulates rising CPM and customer acquisition costs.
                        </p>
                    </div>


                    {/* Equilibrium Shift Alerts */}
                    {equilibriumShifts.length > 0 && (
                        <div className="equilibrium-alerts" style={{ marginTop: '2rem' }}>
                            {equilibriumShifts.map((shift, idx) => {
                                const isTriggered = adMultiplier >= parseFloat(shift.multiplier);
                                return (
                                    <div
                                        key={idx}
                                        className={`shift-alert ${isTriggered ? 'triggered' : ''}`}
                                        style={{
                                            padding: '1rem',
                                            borderRadius: '0.75rem',
                                            marginBottom: '0.75rem',
                                            background: isTriggered ? 'rgba(245, 158, 11, 0.1)' : 'rgba(15, 23, 42, 0.3)',
                                            border: `1px solid ${isTriggered ? 'rgba(245, 158, 11, 0.4)' : 'rgba(148, 163, 184, 0.1)'}`,
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isTriggered ? '#f59e0b' : '#94a3b8', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                            <ShieldAlert size={16} />
                                            <strong>{shift.year} Strategic Shift</strong>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: isTriggered ? '#fbbf24' : '#64748b' }}>
                                            {isTriggered
                                                ? `Equilibrium shift detected at multiplier ${shift.multiplier}.`
                                                : `Tipping Point forecast at multiplier ${shift.multiplier}.`}
                                        </p>
                                        {isTriggered && (
                                            <div style={{ fontSize: '0.7rem', marginTop: '0.5rem', color: '#f59e0b', opacity: 0.8 }}>
                                                <strong>Previous Equilibrium:</strong> {shift.from} <br />
                                                <strong>New Equilibrium:</strong> {shift.to}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="info-box" style={{ marginTop: '2.5rem', padding: '1.25rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '1rem', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#ef4444' }}>
                            <ShieldAlert size={18} />
                            <strong style={{ fontSize: '0.9rem' }}>Strategic Liability</strong>
                        </div>
                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5' }}>
                            As the **Ad Spend Multiplier** increases, notice how the **High Discount (HD)** line drops precipitously. This visualizes the tipping point where heavy discounting becomes a financial liability.
                        </p>
                    </div>
                </div>

                <div className="chart-wrapper">
                    <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                            <TrendingDown size={16} />
                            <span>Expected Profit Trend (EMV)</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                            Data Source: 2021-2025 Simulations
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height={450}>
                        <LineChart
                            data={chartData}
                            margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" vertical={false} />
                            <XAxis
                                dataKey="year"
                                stroke="#94a3b8"
                                label={{ value: 'Festival Year', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 12 }}
                            />
                            <YAxis
                                tickFormatter={formatCurrency}
                                stroke="#94a3b8"
                                domain={['auto', 'auto']}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#f1f5f9', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)' }}
                                formatter={(value) => [formatCurrency(value), "EMV Profit"]}
                                labelFormatter={(label) => `Year: ${label}`}
                            />
                            <Legend verticalAlign="top" iconType="circle" wrapperStyle={{ paddingBottom: '30px' }} />
                            <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'right', value: 'Break-even', fill: '#ef4444', fontSize: 10 }} />

                            <Line
                                type="monotone"
                                dataKey="HD"
                                stroke="#ef4444"
                                name="High Discount (HD)"
                                strokeWidth={4}
                                dot={{ r: 6, fill: '#ef4444' }}
                                activeDot={{ r: 8 }}
                                animationDuration={500}
                            />
                            <Line
                                type="monotone"
                                dataKey="MD"
                                stroke="#3b82f6"
                                name="Moderate (MD)"
                                strokeWidth={3}
                                dot={{ r: 4 }}
                                animationDuration={500}
                            />
                            <Line
                                type="monotone"
                                dataKey="LD"
                                stroke="#10b981"
                                name="Low Discount (LD)"
                                strokeWidth={3}
                                dot={{ r: 4 }}
                                animationDuration={500}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default SensitivityAnalysis;
