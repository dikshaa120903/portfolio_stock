from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer
import datetime
import math
import random
import requests
from .ml_models import get_real_forecasting, TICKER_MAP

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def portfolio(request):
    symbols = ["AAPL", "MSFT", "GOOGL", "TSLA"]
    quantities = {"AAPL": 100, "MSFT": 50, "GOOGL": 200, "TSLA": 75}
    pe_ratios = {"AAPL": 28.5, "MSFT": 32.1, "GOOGL": 25.4, "TSLA": 65.2}
    scores = {"AAPL": 85, "MSFT": 78, "GOOGL": 92, "TSLA": 60}
    
    holdings = []
    total_value = 0
    daily_change = 0
    
    try:
        # Fetch current real prices from Binance
        for i, sym in enumerate(symbols):
            binance_symbol = TICKER_MAP.get(sym, "BTCUSDT")
            url = f"https://api.binance.com/api/v3/ticker/24hr?symbol={binance_symbol}"
            resp = requests.get(url).json()
            
            current_price = float(resp['lastPrice'])
            prev_close = float(resp['prevClosePrice'])
            
            qty = quantities[sym]
            value = current_price * qty
            total_value += value
            daily_change += (current_price - prev_close) * qty
            
            holdings.append({
                "id": i + 1, "symbol": sym, "name": f"Crypto ({binance_symbol})",
                "price": round(current_price, 2), "quantity": qty, 
                "peRatio": pe_ratios[sym], "opportunityScore": scores[sym]
            })
            
        daily_change_percent = (daily_change / (total_value - daily_change)) * 100 if total_value > 0 else 0
    except Exception as e:
        print(f"Error fetching real portfolio data: {e}")
        # Fallback to mock on error
        total_value = 124500.50
        daily_change = 2450.25
        daily_change_percent = 2.1
        holdings = [
            { "id": 1, "symbol": "AAPL", "name": "Apple Inc.", "price": 175.50, "quantity": 100, "peRatio": 28.5, "opportunityScore": 85 },
            { "id": 2, "symbol": "MSFT", "name": "Microsoft Corp.", "price": 330.20, "quantity": 50, "peRatio": 32.1, "opportunityScore": 78 },
            { "id": 3, "symbol": "GOOGL", "name": "Alphabet Inc.", "price": 135.40, "quantity": 200, "peRatio": 25.4, "opportunityScore": 92 },
            { "id": 4, "symbol": "TSLA", "name": "Tesla Inc.", "price": 210.80, "quantity": 75, "peRatio": 65.2, "opportunityScore": 60 },
        ]

    return Response({
        "totalValue": round(total_value, 2),
        "dailyChange": round(daily_change, 2),
        "dailyChangePercent": round(daily_change_percent, 2),
        "holdings": holdings,
        "growthData": [
            { "date": "2026-01", "value": total_value * 0.85 },
            { "date": "2026-02", "value": total_value * 0.88 },
            { "date": "2026-03", "value": total_value * 0.86 },
            { "date": "2026-04", "value": total_value * 0.92 },
            { "date": "2026-05", "value": total_value * 0.95 },
            { "date": "2026-06", "value": total_value },
        ]
    })

@api_view(['GET'])
def clustering(request):
    return Response({
        "clusters": [
            { "id": 0, "name": "Value Blue-Chips", "description": "Stable, dividend paying large caps" },
            { "id": 1, "name": "High Growth Tech", "description": "Volatile, high PE tech stocks" },
            { "id": 2, "name": "Speculative", "description": "Small cap or turnaround plays" }
        ],
        "data": [
            { "symbol": "AAPL", "pca1": 2.5, "pca2": 1.2, "cluster": 0, "opportunity": 85 },
            { "symbol": "JNJ", "pca1": 3.1, "pca2": -0.5, "cluster": 0, "opportunity": 70 },
            { "symbol": "NVDA", "pca1": -2.1, "pca2": 4.5, "cluster": 1, "opportunity": 95 },
            { "symbol": "AMD", "pca1": -1.8, "pca2": 3.2, "cluster": 1, "opportunity": 88 },
            { "symbol": "PLTR", "pca1": -3.5, "pca2": -1.2, "cluster": 2, "opportunity": 65 },
        ]
    })

@api_view(['GET'])
def predictions(request):
    return Response({
        "featureImportance": [
            { "feature": "Volume Match", "value": 0.35 },
            { "feature": "RSI 14", "value": 0.25 },
            { "feature": "MACD", "value": 0.20 },
            { "feature": "P/E Ratio", "value": 0.15 },
            { "feature": "Market Cap", "value": 0.05 },
        ],
        "forecasts": [
            { "date": "2026-07-01", "actual": 175.50, "predicted": 175.50 },
            { "date": "2026-07-02", "actual": 176.20, "predicted": 176.00 },
            { "date": "2026-07-03", "actual": None, "predicted": 178.50 },
            { "date": "2026-07-04", "actual": None, "predicted": 180.20 },
            { "date": "2026-07-05", "actual": None, "predicted": 179.80 },
        ]
    })

@api_view(['GET'])
def stock_details(request, symbol):
    try:
        binance_symbol = TICKER_MAP.get(symbol, "BTCUSDT")
        
        # Get 24hr ticker
        ticker_url = f"https://api.binance.com/api/v3/ticker/24hr?symbol={binance_symbol}"
        ticker_resp = requests.get(ticker_url).json()
        current_price = float(ticker_resp['lastPrice'])
        
        # Get last 6 months of monthly klines (using 1M interval, limit 6)
        klines_url = f"https://api.binance.com/api/v3/klines?symbol={binance_symbol}&interval=1M&limit=6"
        klines_resp = requests.get(klines_url).json()
        
        history_data = []
        for k in klines_resp:
            d = datetime.datetime.fromtimestamp(k[0] / 1000.0)
            history_data.append({
                "date": d.strftime("%Y-%m"),
                "price": round(float(k[4]), 2)
            })
        
        return Response({
            "symbol": symbol,
            "name": f"Crypto ({binance_symbol})",
            "price": round(current_price, 2),
            "peRatio": 25.0,
            "discountLevel": "Moderate",
            "opportunityScore": 75,
            "history": history_data
        })
    except Exception as e:
        print(f"Error fetching stock details for {symbol}: {e}")
        return Response({
            "symbol": symbol,
            "name": "Apple Inc." if symbol == "AAPL" else "Sample Stock",
            "price": 150.00,
            "peRatio": 25.0,
            "discountLevel": "Moderate",
            "opportunityScore": 75,
            "history": [
                { "date": "2026-01", "price": 130 },
                { "date": "2026-02", "price": 145 },
                { "date": "2026-03", "price": 140 },
                { "date": "2026-04", "price": 155 },
                { "date": "2026-05", "price": 150 },
            ]
        })

def generate_stock_data(symbol, name, base_price, pe):
    current_price = base_price + (random.random() * 50 - 25)
    low52 = current_price * 0.7 + (random.random() * 20)
    high52 = current_price * 1.3 + (random.random() * 20)
    max_price = high52
    discount = max(0, high52 - current_price)
    discount_percent = "{:.2f}".format((discount / high52) * 100) if high52 > 0 else "0.00"

    return {
        "symbol": f"{symbol}.NS",
        "name": name,
        "currentPrice": "{:.2f}".format(current_price),
        "maxPrice": "{:.2f}".format(max_price),
        "discount": "{:.2f}".format(discount),
        "discountPercent": discount_percent,
        "peRatio": "{:.2f}".format(pe),
        "low52": "{:.2f}".format(low52),
        "high52": "{:.2f}".format(high52),
        "premium": random.random() > 0.5
    }

@api_view(['GET'])
def sectors(request):
    return Response([
        {
            "id": 1,
            "name": "IT",
            "stocks": [
                generate_stock_data('TCS', 'Tata Consultancy Services', 3500, 28),
                generate_stock_data('INFY', 'Infosys Limited', 1400, 24),
                generate_stock_data('WIPRO', 'Wipro Limited', 450, 19),
                generate_stock_data('HCLTECH', 'HCL Technologies', 1200, 22),
                generate_stock_data('TECHM', 'Tech Mahindra Limited', 1100, 18),
                generate_stock_data('LTIM', 'LTIMindtree Limited', 5200, 31),
                generate_stock_data('OFSS', 'Oracle Financial Services', 4100, 15),
                generate_stock_data('MPHASIS', 'Mphasis Limited', 2400, 25),
                generate_stock_data('PERSISTENT', 'Persistent Systems', 5500, 42),
                generate_stock_data('COFORGE', 'Coforge Limited', 5100, 38),
            ]
        },
        {
            "id": 2,
            "name": "BANKING",
            "stocks": [
                generate_stock_data('HDFCBANK', 'HDFC Bank Limited', 1600, 18),
                generate_stock_data('ICICIBANK', 'ICICI Bank Limited', 1000, 19),
                generate_stock_data('SBIN', 'State Bank of India', 600, 9),
                generate_stock_data('AXISBANK', 'Axis Bank Limited', 1050, 14),
                generate_stock_data('KOTAKBANK', 'Kotak Mahindra Bank', 1800, 26),
                generate_stock_data('INDUSINDBK', 'IndusInd Bank', 1400, 15),
                generate_stock_data('BANKBARODA', 'Bank of Baroda', 200, 7),
                generate_stock_data('PNB', 'Punjab National Bank', 80, 8),
                generate_stock_data('IDFCFIRSTB', 'IDFC First Bank', 90, 20),
                generate_stock_data('FEDERALBNK', 'Federal Bank', 150, 10),
            ]
        },
        {
            "id": 3,
            "name": "AUTOMOBILE",
            "stocks": [
                generate_stock_data('MARUTI', 'Maruti Suzuki India', 10500, 30),
                generate_stock_data('M&M', 'Mahindra & Mahindra', 1600, 22),
                generate_stock_data('TATAMOTORS', 'Tata Motors Limited', 650, 18),
                generate_stock_data('BAJAJ-AUTO', 'Bajaj Auto Limited', 5500, 24),
                generate_stock_data('EICHERMOT', 'Eicher Motors Limited', 3400, 32),
                generate_stock_data('HEROMOTOCO', 'Hero MotoCorp Limited', 3100, 19),
                generate_stock_data('TVSMOTOR', 'TVS Motor Company', 1600, 45),
                generate_stock_data('ASHOKLEY', 'Ashok Leyland Limited', 180, 25),
                generate_stock_data('BOSCHLTD', 'Bosch Limited', 19000, 35),
                generate_stock_data('MRF', 'MRF Limited', 105000, 50),
            ]
        },
        {
            "id": 4,
            "name": "TATA",
            "stocks": [
                generate_stock_data('TATAMOTORS', 'Tata Motors Limited', 650, 18),
                generate_stock_data('TATASTEEL', 'Tata Steel Limited', 130, 25),
                generate_stock_data('TATAPOWER', 'Tata Power Co. Ltd', 250, 30),
                generate_stock_data('TITAN', 'Titan Company Limited', 3200, 80),
                generate_stock_data('TCS', 'Tata Consultancy Services', 3500, 28),
                generate_stock_data('TATACONSUM', 'Tata Consumer Products', 850, 60),
                generate_stock_data('TATACHEM', 'Tata Chemicals Limited', 1000, 15),
                generate_stock_data('TATACOMM', 'Tata Communications Ltd', 1700, 22),
                generate_stock_data('TRENT', 'Trent Limited', 2100, 110),
                generate_stock_data('INDIANHOTEL', 'The Indian Hotels Company', 400, 55),
            ]
        },
        {
            "id": 5,
            "name": "ADANI",
            "stocks": [
                generate_stock_data('ADANIENT', 'Adani Enterprises Ltd', 2161.80, 19.53),
                generate_stock_data('ADANIPORTS', 'Adani Ports & SEZ Ltd.', 1521.00, 26.31),
                generate_stock_data('ADANIGREEN', 'Adani Green Energy Ltd.', 1100.00, 100),
                generate_stock_data('ATGL', 'Adani Total Gas Ltd.', 650.00, 75),
                generate_stock_data('ADANIPOWER', 'Adani Power Ltd.', 140.11, 23.87),
                generate_stock_data('AWL', 'Adani Wilmar Limited', 350.00, 45),
                generate_stock_data('AMBUJACEM', 'Ambuja Cements Limited', 450.00, 35),
                generate_stock_data('ACC', 'ACC Ltd.', 1592.40, 11.32),
                generate_stock_data('NDTV', 'New Delhi Television Limited', 220.00, 50),
                generate_stock_data('ADANIENSOL', 'Adani Energy Solutions Ltd.', 1011.55, 54.36),
            ]
        }
    ])

@api_view(['GET'])
def gold_silver_correlation(request):
    days = int(request.GET.get('days', 120))
    scatter = []
    trendline = []
    min_gold = float('inf')
    max_gold = float('-inf')

    m = 0.55
    b = 5000

    for i in range(days):
        date = datetime.datetime.now() - datetime.timedelta(days=(days - i))
        
        g = 140000 + (random.random() * 30000)
        s = (g * m) + b + (random.random() * 15000 - 7500)
        p = (g * m) + b

        if g < min_gold: min_gold = g
        if g > max_gold: max_gold = g

        scatter.append({
            "date": date.strftime('%Y-%m-%d'),
            "x_gold": g,
            "y_silver": s,
            "y_predicted": p
        })

    trendline.append({"x_gold": min_gold, "y_predicted": (min_gold * m) + b})
    trendline.append({"x_gold": max_gold, "y_predicted": (max_gold * m) + b})

    return Response({
        "status": "success",
        "pearson_r": 0.842,
        "r_squared": 0.708,
        "slope": m,
        "intercept": b,
        "data_points": days,
        "scatter": scatter,
        "trendline": trendline
    })

@api_view(['GET'])
def forecast(request):
    ticker = request.GET.get('ticker', 'AAPL')
    model = request.GET.get('model', 'linear')
    res = get_real_forecasting(ticker, model)
    if res is None:
        # Generate mock if yfinance fails
        res = {
            "ticker": ticker, "model_used": model.upper(),
            "historical_dates": [], "historical_prices": [],
            "future_dates": [], "future_predicted_prices": [],
            "latest_close": 150, "metrics": {"mae": 0, "rmse": 0, "r2": 0, "directional_accuracy": 0}
        }
    return Response(res)

@api_view(['GET'])
def prediction(request):
    ticker = request.GET.get('ticker', 'AAPL')
    model = request.GET.get('model', 'logistic')
    res = get_real_forecasting(ticker, model)
    if res is None:
        # Generate mock if yfinance fails
        res = {
            "ticker": ticker, "model_used": model.upper(),
            "historical_dates": [], "historical_prices": [],
            "future_dates": [], "future_predicted_prices": [],
            "latest_close": 150, "metrics": {"mae": 0, "rmse": 0, "r2": 0, "directional_accuracy": 0}
        }
    return Response(res)
