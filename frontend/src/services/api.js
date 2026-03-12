import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Generic service methods for potential endpoints
export const stockService = {
    getPortfolio: () => api.get('/portfolio/').catch(() => ({ data: getMockPortfolio() })),
    getClustering: () => api.get('/clustering/').catch(() => ({ data: getMockClustering() })),
    getPredictions: () => api.get('/predictions/').catch(() => ({ data: getMockPredictions() })),
    getStockDetails: (symbol) => api.get(`/stocks/${symbol}/`).catch(() => ({ data: getMockStock(symbol) })),
    getSectors: () => api.get('/sectors/').catch(() => ({ data: getMockSectors() })),
    getGoldSilverCorrelation: (days = 120) => api.get(`/gold-silver-correlation/?days=${days}`).catch(() => ({ data: getMockGoldSilverCorrelation() })),
    getForecastAnalysis: (ticker, model) => api.get(`/forecast/?ticker=${ticker}&model=${model}`).catch(() => ({ data: getMockForecasting(ticker, model) })),
    getPredictionAnalysis: (ticker, model) => api.get(`/prediction/?ticker=${ticker}&model=${model}`).catch(() => ({ data: getMockForecasting(ticker, model) })),
};

function getMockForecasting(ticker, model) {
    const basePrice = ticker === 'RELIANCE' ? 3000 : 150;
    const actual = [];
    const predicted = [];
    const dates = [];
    const fDates = [];

    // 90 days history
    for (let i = 0; i < 90; i++) {
        const d = new Date(); d.setDate(d.getDate() - (90 - i));
        dates.push(d.toISOString().split('T')[0]);
        actual.push(basePrice + Math.sin(i / 10) * 50 + (Math.random() * 10));
    }

    // 30 days future
    let lastActual = actual[actual.length - 1];
    for (let i = 1; i <= 30; i++) {
        const d = new Date(); d.setDate(d.getDate() + i);
        fDates.push(d.toISOString().split('T')[0]);
        let step = (model === 'arima') ? (Math.random() * 2 - 0.5) : (i * 1.5 + Math.random() * 5);
        lastActual += step;
        predicted.push(lastActual);
    }

    return {
        ticker: ticker,
        model_used: model.toUpperCase(),
        historical_dates: dates,
        historical_prices: actual,
        future_dates: fDates,
        future_predicted_prices: predicted,
        latest_close: actual[actual.length - 1],
        metrics: { mae: 15.2, rmse: 20.4, r2: 0.88, directional_accuracy: 65.5 }
    };
}

// Fallback mock data in case API is down or endpoints differ
function getMockPortfolio() {
    return {
        totalValue: 124500.50,
        dailyChange: 2450.25,
        dailyChangePercent: 2.1,
        holdings: [
            { id: 1, symbol: 'AAPL', name: 'Apple Inc.', price: 175.50, quantity: 100, peRatio: 28.5, opportunityScore: 85 },
            { id: 2, symbol: 'MSFT', name: 'Microsoft Corp.', price: 330.20, quantity: 50, peRatio: 32.1, opportunityScore: 78 },
            { id: 3, symbol: 'GOOGL', name: 'Alphabet Inc.', price: 135.40, quantity: 200, peRatio: 25.4, opportunityScore: 92 },
            { id: 4, symbol: 'TSLA', name: 'Tesla Inc.', price: 210.80, quantity: 75, peRatio: 65.2, opportunityScore: 60 },
        ],
        growthData: [
            { date: '2026-01', value: 105000 },
            { date: '2026-02', value: 108000 },
            { date: '2026-03', value: 106500 },
            { date: '2026-04', value: 112000 },
            { date: '2026-05', value: 118000 },
            { date: '2026-06', value: 124500 },
        ]
    };
}

function getMockClustering() {
    return {
        clusters: [
            { id: 0, name: 'Value Blue-Chips', description: 'Stable, dividend paying large caps' },
            { id: 1, name: 'High Growth Tech', description: 'Volatile, high PE tech stocks' },
            { id: 2, name: 'Speculative', description: 'Small cap or turnaround plays' }
        ],
        data: [
            { symbol: 'AAPL', pca1: 2.5, pca2: 1.2, cluster: 0, opportunity: 85 },
            { symbol: 'JNJ', pca1: 3.1, pca2: -0.5, cluster: 0, opportunity: 70 },
            { symbol: 'NVDA', pca1: -2.1, pca2: 4.5, cluster: 1, opportunity: 95 },
            { symbol: 'AMD', pca1: -1.8, pca2: 3.2, cluster: 1, opportunity: 88 },
            { symbol: 'PLTR', pca1: -3.5, pca2: -1.2, cluster: 2, opportunity: 65 },
        ]
    };
}

function getMockPredictions() {
    return {
        featureImportance: [
            { feature: 'Volume Match', value: 0.35 },
            { feature: 'RSI 14', value: 0.25 },
            { feature: 'MACD', value: 0.20 },
            { feature: 'P/E Ratio', value: 0.15 },
            { feature: 'Market Cap', value: 0.05 },
        ],
        forecasts: [
            { date: '2026-07-01', actual: 175.50, predicted: 175.50 },
            { date: '2026-07-02', actual: 176.20, predicted: 176.00 },
            { date: '2026-07-03', actual: null, predicted: 178.50 },
            { date: '2026-07-04', actual: null, predicted: 180.20 },
            { date: '2026-07-05', actual: null, predicted: 179.80 },
        ]
    };
}

function getMockStock(symbol) {
    return {
        symbol,
        name: symbol === 'AAPL' ? 'Apple Inc.' : 'Sample Stock',
        price: 150.00,
        peRatio: 25.0,
        discountLevel: 'Moderate',
        opportunityScore: 75,
        history: [
            { date: '2026-01', price: 130 },
            { date: '2026-02', price: 145 },
            { date: '2026-03', price: 140 },
            { date: '2026-04', price: 155 },
            { date: '2026-05', price: 150 },
        ]
    };
}

function getMockSectors() {
    const generateStockData = (symbol, name, basePrice, pe) => {
        const currentPrice = basePrice + (Math.random() * 50 - 25);
        const low52 = currentPrice * 0.7 + (Math.random() * 20);
        const high52 = currentPrice * 1.3 + (Math.random() * 20);
        const maxPrice = high52;
        const discount = Math.max(0, high52 - currentPrice);
        const discountPercent = ((discount / high52) * 100).toFixed(2);

        return {
            symbol: `${symbol}.NS`, // Match image notation
            name,
            currentPrice: currentPrice.toFixed(2),
            maxPrice: maxPrice.toFixed(2),
            discount: discount.toFixed(2),
            discountPercent: discountPercent,
            peRatio: pe.toFixed(2),
            low52: low52.toFixed(2),
            high52: high52.toFixed(2),
            premium: Math.random() > 0.5
        };
    };

    return [
        {
            id: 1,
            name: 'IT',
            stocks: [
                generateStockData('TCS', 'Tata Consultancy Services', 3500, 28),
                generateStockData('INFY', 'Infosys Limited', 1400, 24),
                generateStockData('WIPRO', 'Wipro Limited', 450, 19),
                generateStockData('HCLTECH', 'HCL Technologies', 1200, 22),
                generateStockData('TECHM', 'Tech Mahindra Limited', 1100, 18),
                generateStockData('LTIM', 'LTIMindtree Limited', 5200, 31),
                generateStockData('OFSS', 'Oracle Financial Services', 4100, 15),
                generateStockData('MPHASIS', 'Mphasis Limited', 2400, 25),
                generateStockData('PERSISTENT', 'Persistent Systems', 5500, 42),
                generateStockData('COFORGE', 'Coforge Limited', 5100, 38),
            ]
        },
        {
            id: 2,
            name: 'BANKING',
            stocks: [
                generateStockData('HDFCBANK', 'HDFC Bank Limited', 1600, 18),
                generateStockData('ICICIBANK', 'ICICI Bank Limited', 1000, 19),
                generateStockData('SBIN', 'State Bank of India', 600, 9),
                generateStockData('AXISBANK', 'Axis Bank Limited', 1050, 14),
                generateStockData('KOTAKBANK', 'Kotak Mahindra Bank', 1800, 26),
                generateStockData('INDUSINDBK', 'IndusInd Bank', 1400, 15),
                generateStockData('BANKBARODA', 'Bank of Baroda', 200, 7),
                generateStockData('PNB', 'Punjab National Bank', 80, 8),
                generateStockData('IDFCFIRSTB', 'IDFC First Bank', 90, 20),
                generateStockData('FEDERALBNK', 'Federal Bank', 150, 10),
            ]
        },
        {
            id: 3,
            name: 'AUTOMOBILE',
            stocks: [
                generateStockData('MARUTI', 'Maruti Suzuki India', 10500, 30),
                generateStockData('M&M', 'Mahindra & Mahindra', 1600, 22),
                generateStockData('TATAMOTORS', 'Tata Motors Limited', 650, 18),
                generateStockData('BAJAJ-AUTO', 'Bajaj Auto Limited', 5500, 24),
                generateStockData('EICHERMOT', 'Eicher Motors Limited', 3400, 32),
                generateStockData('HEROMOTOCO', 'Hero MotoCorp Limited', 3100, 19),
                generateStockData('TVSMOTOR', 'TVS Motor Company', 1600, 45),
                generateStockData('ASHOKLEY', 'Ashok Leyland Limited', 180, 25),
                generateStockData('BOSCHLTD', 'Bosch Limited', 19000, 35),
                generateStockData('MRF', 'MRF Limited', 105000, 50),
            ]
        },
        {
            id: 4,
            name: 'TATA',
            stocks: [
                generateStockData('TATAMOTORS', 'Tata Motors Limited', 650, 18),
                generateStockData('TATASTEEL', 'Tata Steel Limited', 130, 25),
                generateStockData('TATAPOWER', 'Tata Power Co. Ltd', 250, 30),
                generateStockData('TITAN', 'Titan Company Limited', 3200, 80),
                generateStockData('TCS', 'Tata Consultancy Services', 3500, 28),
                generateStockData('TATACONSUM', 'Tata Consumer Products', 850, 60),
                generateStockData('TATACHEM', 'Tata Chemicals Limited', 1000, 15),
                generateStockData('TATACOMM', 'Tata Communications Ltd', 1700, 22),
                generateStockData('TRENT', 'Trent Limited', 2100, 110),
                generateStockData('INDIANHOTEL', 'The Indian Hotels Company', 400, 55),
            ]
        },
        {
            id: 5,
            name: 'ADANI',
            stocks: [
                generateStockData('ADANIENT', 'Adani Enterprises Ltd', 2161.80, 19.53),
                generateStockData('ADANIPORTS', 'Adani Ports & SEZ Ltd.', 1521.00, 26.31),
                generateStockData('ADANIGREEN', 'Adani Green Energy Ltd.', 1100.00, 100), // Adjusted mock for numeric compatibility
                generateStockData('ATGL', 'Adani Total Gas Ltd.', 650.00, 75),
                generateStockData('ADANIPOWER', 'Adani Power Ltd.', 140.11, 23.87),
                generateStockData('AWL', 'Adani Wilmar Limited', 350.00, 45),
                generateStockData('AMBUJACEM', 'Ambuja Cements Limited', 450.00, 35),
                generateStockData('ACC', 'ACC Ltd. (Acquired by Adani)', 1592.40, 11.32),
                generateStockData('NDTV', 'New Delhi Television Limited', 220.00, 50),
                generateStockData('ADANIENSOL', 'Adani Energy Solutions Ltd.', 1011.55, 54.36),
            ]
        }
    ];
}

function getMockGoldSilverCorrelation() {
    // Generate synthetic scattered points that loosely follow a linear trend
    const scatter = [];
    const trendline = [];
    let minGold = Infinity;
    let maxGold = -Infinity;

    // y = mx + b pattern
    const m = 0.55;
    const b = 5000;

    for (let i = 0; i < 120; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (120 - i));

        const g = 140000 + (Math.random() * 30000); // Between 140k and 170k
        const s = (g * m) + b + (Math.random() * 15000 - 7500); // Add noise
        const p = (g * m) + b;

        if (g < minGold) minGold = g;
        if (g > maxGold) maxGold = g;

        scatter.push({
            date: date.toISOString().split('T')[0],
            x_gold: g,
            y_silver: s,
            y_predicted: p
        });
    }

    trendline.push({ x_gold: minGold, y_predicted: (minGold * m) + b });
    trendline.push({ x_gold: maxGold, y_predicted: (maxGold * m) + b });

    return {
        status: "success",
        pearson_r: 0.842,
        r_squared: 0.708,
        slope: m,
        intercept: b,
        data_points: 120,
        scatter: scatter,
        trendline: trendline
    };
}

export default api;
