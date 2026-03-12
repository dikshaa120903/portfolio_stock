import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import BaseLayout from './components/layout/BaseLayout';

// Pages
import Portfolio from './pages/Portfolio';
import Clustering from './pages/Clustering';
import Forecasting from './pages/Forecasting';
import Prediction from './pages/Prediction';
import StockDetails from './pages/StockDetails';
import GoldSilverCorrelation from './pages/GoldSilverCorrelation';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<BaseLayout />}>
            <Route index element={<Navigate to="/portfolio" replace />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="clustering" element={<Clustering />} />
            <Route path="forecasting" element={<Forecasting />} />
            <Route path="prediction" element={<Prediction />} />
            <Route path="gold-silver" element={<GoldSilverCorrelation />} />
            <Route path="stock/:symbol" element={<StockDetails />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
