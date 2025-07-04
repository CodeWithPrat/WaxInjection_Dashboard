import React, { useState } from 'react';
import { Calculator, Zap, AlertTriangle } from 'lucide-react';

export default function PowerCalculator() {
  const [goodProducts, setGoodProducts] = useState('');
  const [scrapProducts, setScrapProducts] = useState('');
  const [emergencyBreakTime, setEmergencyBreakTime] = useState('');
  const [results, setResults] = useState(null);

  // Constants
  const TOTAL_POWER_TIME = 480; // minutes
  const PERFORMANCE = 100; // percentage
  const REGULAR_BREAK_TIME = 60; // minutes

  const calculatePowerLoss = () => {
    const goodCount = parseInt(goodProducts) || 0;
    const scrapCount = parseInt(scrapProducts) || 0;
    const emergencyBreak = parseInt(emergencyBreakTime) || 0;

    // Calculate total products
    const totalProducts = goodCount + scrapCount;
    
    // Calculate scrap percentage
    const scrapPercentage = totalProducts > 0 ? (scrapCount / totalProducts) * 100 : 0;
    
    // Calculate effective working time
    const totalBreakTime = REGULAR_BREAK_TIME + emergencyBreak;
    const effectiveWorkingTime = TOTAL_POWER_TIME - totalBreakTime;
    
    // Calculate power consumption for good products
    const goodProductPowerTime = totalProducts > 0 ? (goodCount / totalProducts) * effectiveWorkingTime : 0;
    
    // Calculate power loss due to scrap
    const scrapPowerLoss = totalProducts > 0 ? (scrapCount / totalProducts) * effectiveWorkingTime : 0;
    
    // Calculate power loss due to emergency break
    const emergencyBreakPowerLoss = emergencyBreak;
    
    // Calculate total power loss
    const totalPowerLoss = scrapPowerLoss + emergencyBreakPowerLoss;
    
    // Calculate power efficiency
    const powerEfficiency = effectiveWorkingTime > 0 ? (goodProductPowerTime / effectiveWorkingTime) * 100 : 0;

    setResults({
      totalProducts,
      scrapPercentage: scrapPercentage.toFixed(2),
      effectiveWorkingTime,
      goodProductPowerTime: goodProductPowerTime.toFixed(2),
      scrapPowerLoss: scrapPowerLoss.toFixed(2),
      emergencyBreakPowerLoss,
      totalPowerLoss: totalPowerLoss.toFixed(2),
      powerEfficiency: powerEfficiency.toFixed(2),
      totalBreakTime
    });
  };

  const resetCalculator = () => {
    setGoodProducts('');
    setScrapProducts('');
    setEmergencyBreakTime('');
    setResults(null);
  };

  return (
    <div className="bg-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-black rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Calculator className="w-12 h-12 text-indigo-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-200">Power Loss Calculator</h1>
            </div>
          </div>

          {/* Constants Display */}
          <div className="bg-gray-900 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-indigo-800 mb-2">System Constants</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center">
                <Zap className="w-4 h-4 text-indigo-600 mr-2" />
                <span>Total Power Time: {TOTAL_POWER_TIME} minutes</span>
              </div>
              <div className="flex items-center">
                <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
                <span>Performance: {PERFORMANCE}%</span>
              </div>
              <div className="flex items-center">
                <span className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></span>
                <span>Regular Break: {REGULAR_BREAK_TIME} minutes</span>
              </div>
            </div>
          </div>

          {/* Input Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Good Products
              </label>
              <input
                type="number"
                value={goodProducts}
                onChange={(e) => setGoodProducts(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-white bg-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter number of good products"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Scrap Products
              </label>
              <input
                type="number"
                value={scrapProducts}
                onChange={(e) => setScrapProducts(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-white bg-black focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter number of scrap products"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Emergency Break Time (minutes)
              </label>
              <input
                type="number"
                value={emergencyBreakTime}
                onChange={(e) => setEmergencyBreakTime(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-white bg-black focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Enter emergency break time (default: 0)"
                min="0"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-6 mb-8">
            <button
              onClick={calculatePowerLoss}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Calculate Power Loss
            </button>
            <button
              onClick={resetCalculator}
              className="px-8 py-4 bg-slate-700 border border-slate-600 text-gray-300 rounded-xl hover:bg-slate-600 transition-all duration-300 font-semibold hover:scale-105"
            >
              Reset
            </button>
          </div>

          {/* Results Display */}
          {results && (
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-8 border border-slate-600 animate-fade-in">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                {/* <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-full mr-3">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div> */}
                Calculation Results
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-slate-900 to-black p-6 rounded-xl border border-slate-600 hover:border-blue-400 transition-all duration-300 hover:scale-105">
                  <h4 className="font-semibold text-blue-400 mb-3 text-lg">Production Summary</h4>
                  <div className="space-y-2">
                    <p className="text-gray-300">Total Products: <span className="font-bold text-white text-lg">{results.totalProducts}</span></p>
                    <p className="text-gray-300">Scrap Rate: <span className="font-bold text-red-400 text-lg">{results.scrapPercentage}%</span></p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-black p-6 rounded-xl border border-slate-600 hover:border-green-400 transition-all duration-300 hover:scale-105">
                  <h4 className="font-semibold text-green-400 mb-3 text-lg">Time Analysis</h4>
                  <div className="space-y-2">
                    <p className="text-gray-300">Working Time: <span className="font-bold text-white text-lg">{results.effectiveWorkingTime} min</span></p>
                    <p className="text-gray-300">Total Break Time: <span className="font-bold text-yellow-400 text-lg">{results.totalBreakTime} min</span></p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-black p-6 rounded-xl border border-slate-600 hover:border-purple-400 transition-all duration-300 hover:scale-105">
                  <h4 className="font-semibold text-purple-400 mb-3 text-lg">Power Efficiency</h4>
                  <div className="space-y-2">
                    <p className="text-gray-300">Efficiency: <span className="font-bold text-green-400 text-lg">{results.powerEfficiency}%</span></p>
                    <p className="text-gray-300">Good Product Power: <span className="font-bold text-white text-lg">{results.goodProductPowerTime} min</span></p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-black p-6 rounded-xl border border-slate-600 hover:border-red-400 transition-all duration-300 hover:scale-105">
                  <h4 className="font-semibold text-red-400 mb-3 text-lg">Scrap Power Loss</h4>
                  <div className="space-y-2">
                    <p className="text-gray-300">Scrap Loss: <span className="font-bold text-red-400 text-lg">{results.scrapPowerLoss} min</span></p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-black p-6 rounded-xl border border-slate-600 hover:border-yellow-400 transition-all duration-300 hover:scale-105">
                  <h4 className="font-semibold text-yellow-400 mb-3 text-lg">Emergency Break Loss</h4>
                  <div className="space-y-2">
                    <p className="text-gray-300">Emergency Loss: <span className="font-bold text-yellow-400 text-lg">{results.emergencyBreakPowerLoss} min</span></p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-900 to-red-800 p-6 rounded-xl border-2 border-red-500 hover:border-red-400 transition-all duration-300 hover:scale-105 shadow-lg">
                  <h4 className="font-semibold text-red-200 mb-3 text-lg">Total Power Loss</h4>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-red-300">{results.totalPowerLoss}</p>
                    <p className="text-red-200 text-sm">minutes</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}