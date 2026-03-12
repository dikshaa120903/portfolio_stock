import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { stockService } from '../services/api';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ArrowLeft, Activity, Target } from 'lucide-react';
import MetricCard from '../components/cards/MetricCard';

const StockDetails = () => {
    const { symbol } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        stockService.getStockDetails(symbol).then(res => {
            setData(res.data);
            setLoading(false);
        });
    }, [symbol]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-lg bg-[var(--surface-bg)] hover:bg-[var(--surface-border)] border border-[var(--surface-border)] transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{data.name} ({data.symbol})</h1>
                    <p className="text-[var(--text-muted)] mt-1">Detailed metrics and historical performance.</p>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Current Price"
                    value={formatCurrency(data.price)}
                />
                <MetricCard
                    title="P/E Ratio"
                    value={data.peRatio.toFixed(2)}
                    change="vs sector avg 22.4"
                    changeType="neutral"
                />
                <MetricCard
                    title="Discount Level"
                    value={data.discountLevel}
                    icon={Activity}
                    change={data.discountLevel === 'High' ? 'Undervalued' : 'Fairly Valued'}
                    changeType={data.discountLevel === 'High' ? 'positive' : 'neutral'}
                />
                <MetricCard
                    title="Opportunity Score"
                    value={`${data.opportunityScore}/100`}
                    icon={Target}
                    changeType={data.opportunityScore > 80 ? 'positive' : data.opportunityScore > 60 ? 'warning' : 'danger'}
                />
            </div>

            {/* Detail Chart */}
            <div className="glass-panel p-6 mt-6 w-full">
                <h2 className="text-xl font-semibold mb-6">Price History (6 Months)</h2>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="detailValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--surface-border)" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                domain={['auto', 'auto']}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                                tickFormatter={(val) => `₹${val}`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--surface-bg)', borderRadius: '8px', border: '1px solid var(--surface-border)', color: 'var(--text-main)' }}
                                itemStyle={{ color: 'var(--color-primary)' }}
                            />
                            <Area type="monotone" dataKey="price" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#detailValue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
};

export default StockDetails;
