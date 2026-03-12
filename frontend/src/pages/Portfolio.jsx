import React, { useEffect, useState } from 'react';
import { stockService } from '../services/api';
import { BarChart2, FolderOpen, ArrowLeft, CheckSquare, Square } from 'lucide-react';

const Portfolio = () => {
    const [sectors, setSectors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list', 'detail', 'compare'
    const [activeSector, setActiveSector] = useState(null);

    useEffect(() => {
        stockService.getSectors().then(res => {
            setSectors(res.data);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const formatRupee = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

    // View 1: Sector List
    if (viewMode === 'list') {
        return (
            <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <BarChart2 className="text-primary w-8 h-8" />
                        <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
                    </div>
                    <button
                        onClick={() => setViewMode('compare')}
                        className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-4 py-2 rounded shadow-md flex items-center gap-2 font-medium transition-colors"
                    >
                        <CheckSquare size={18} />
                        Compare All Stocks
                    </button>
                </div>

                <div className="glass-panel overflow-hidden">
                    <div className="divide-y divide-[var(--surface-border)]">
                        {sectors.map((sector) => (
                            <div key={sector.id} className="flex items-center justify-between p-6 bg-[var(--surface-bg)] hover:bg-[#00000008] dark:hover:bg-[#ffffff05] transition-colors">
                                <div>
                                    <h2 className="text-xl font-bold mb-1 uppercase text-[var(--text-main)]">{sector.name}</h2>
                                    <p className="text-sm text-[var(--text-muted)]">ID: {sector.id} • {sector.stocks.length} stocks</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setActiveSector(sector);
                                        setViewMode('detail');
                                    }}
                                    className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-5 py-2 rounded shadow transition-colors font-medium text-sm"
                                >
                                    View &rarr;
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // View 2: Sector Detail
    if (viewMode === 'detail' && activeSector) {
        return (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 max-w-6xl mx-auto">
                <div className="mb-6">
                    <button
                        onClick={() => setViewMode('list')}
                        className="text-[#0ea5e9] hover:text-[#0284c7] flex items-center gap-2 font-medium mb-4 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back to Portfolio
                    </button>
                    <div className="flex items-center gap-3">
                        <span className="text-4xl">📁</span>
                        <h1 className="text-3xl font-bold uppercase">{activeSector.name}</h1>
                    </div>
                </div>

                <div className="glass-panel overflow-hidden">
                    <div className="divide-y divide-[var(--surface-border)]">
                        {activeSector.stocks.map((stock, idx) => (
                            <div key={stock.symbol} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-6 bg-[var(--surface-bg)] hover:bg-[#00000008] dark:hover:bg-[#ffffff05] transition-colors items-center">
                                {/* Col 1: Name & Button */}
                                <div className="space-y-3 col-span-1 md:col-span-2">
                                    <div>
                                        <h3 className="font-bold text-lg text-[var(--text-main)]">{stock.name}</h3>
                                        <p className="text-sm text-[var(--text-muted)]">{stock.symbol} • ID: {stock.id || (idx + 10)}</p>
                                    </div>
                                    <button className="border border-[#0ea5e9] text-[#0ea5e9] hover:bg-[#0ea5e9] hover:text-white px-3 py-1.5 rounded transition-colors text-sm font-medium">
                                        Add to Analysis
                                    </button>
                                </div>

                                {/* Col 2: Current Price */}
                                <div className="text-center">
                                    <p className="text-xs text-[var(--text-muted)] mb-1">Current Price</p>
                                    <p className="font-bold text-lg">{formatRupee(stock.currentPrice)}</p>
                                    <p className="text-xs text-[var(--text-muted)]">(0% of max)</p>
                                </div>

                                {/* Col 3: Max Price */}
                                <div className="text-center">
                                    <p className="text-xs text-[var(--text-muted)] mb-1">Max Price</p>
                                    <p className="font-bold text-lg">{formatRupee(stock.maxPrice)}</p>
                                    <p className="text-xs text-[var(--text-muted)]">100%</p>
                                </div>

                                {/* Col 4: Discount & Status */}
                                <div className="flex items-center justify-between text-center">
                                    <div>
                                        <p className="text-xs text-[var(--text-muted)] mb-1">Discount</p>
                                        <p className="font-bold text-lg text-danger">{formatRupee(stock.discount)}</p>
                                        <p className="text-xs text-danger">{stock.discountPercent}%</p>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-xs text-[var(--text-muted)] mb-1">Status</p>
                                        <div className="flex items-center gap-1 bg-danger/10 text-danger px-2 py-1 rounded text-sm font-medium">
                                            {stock.premium ? <CheckSquare size={14} /> : <Square size={14} />} Premium
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // View 3: Compare All
    if (viewMode === 'compare') {
        const allStocks = sectors.flatMap(s => s.stocks);

        return (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => setViewMode('list')}
                        className="text-[#0ea5e9] hover:text-[#0284c7] flex items-center gap-2 font-medium transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back to Portfolios
                    </button>
                    <h1 className="text-2xl font-bold">Compare All Stocks</h1>
                </div>

                <div className="w-full overflow-x-auto rounded-xl border border-[var(--surface-border)] bg-[var(--surface-bg)] shadow-sm">
                    <table className="w-full text-left border-collapse min-w-max">
                        <thead className="bg-[#00000008] dark:bg-[#ffffff05] border-b border-[var(--surface-border)] font-bold text-sm text-[var(--text-muted)] uppercase tracking-wider">
                            <tr>
                                <th className="py-4 px-6 text-left">Symbol</th>
                                <th className="py-4 px-6 text-left">Name</th>
                                <th className="py-4 px-6 text-right">Current Price</th>
                                <th className="py-4 px-6 text-right">PE Ratio</th>
                                <th className="py-4 px-6 text-right">52-Wk Low</th>
                                <th className="py-4 px-6 text-right">52-Wk High</th>
                                <th className="py-4 px-6 text-right">Discount %</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--surface-border)] text-sm">
                            {allStocks.map((stock, idx) => (
                                <tr key={`${stock.symbol}-${idx}`} className="hover:bg-[#00000008] dark:hover:bg-[#ffffff05] transition-colors">
                                    <td className="py-4 px-6 font-bold text-[var(--text-main)]">{stock.symbol}</td>
                                    <td className="py-4 px-6 text-[var(--text-muted)]">{stock.name}</td>
                                    <td className="py-4 px-6 text-right font-medium text-success">{formatRupee(stock.currentPrice)}</td>
                                    <td className="py-4 px-6 text-right text-[var(--text-muted)]">{stock.peRatio}</td>
                                    <td className="py-4 px-6 text-right text-[var(--text-muted)]">{formatRupee(stock.low52)}</td>
                                    <td className="py-4 px-6 text-right text-[var(--text-muted)]">{formatRupee(stock.high52)}</td>
                                    <td className="py-4 px-6 text-right">
                                        <span className={`px-2 py-1 rounded text-white font-bold text-xs ${stock.discountPercent > 15 ? 'bg-[#10b981]' : stock.discountPercent > 5 ? 'bg-[#3b82f6]' : 'bg-[#64748b]'}`}>
                                            {stock.discountPercent}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return null;
};

export default Portfolio;
