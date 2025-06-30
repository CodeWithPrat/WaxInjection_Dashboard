import React, { useState, useEffect } from 'react';
import { Activity, Thermometer, Zap, Gauge, Clock, Database, TrendingUp, AlertCircle, Wifi, WifiOff, Factory, Beaker, Settings } from 'lucide-react';

const WaxInjectorDashboard = () => {
  const [data, setData] = useState([]);
  const [currentData, setCurrentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('Total_kW');

  const API_BASE_URL = 'https://cmti-edge.online/WaxInjection/testwax.php';

  // Updated field mapping to match API response (without Tags_ prefix)
  const fieldMapping = {
    'Current_I3': 'B-Phase Current',
    'Total_kW': 'Power',
    'avg_PF': 'Power Factor',
    'avg_current': 'Total Current',
    'avg_vtg_LL': 'LL Voltage',
    'avg_vtg_LN': 'LN Voltage',
    'clamping_fwd': 'Clamping Forward',
    'clamping_rev': 'Clamping Reverse',
    'current_I1': 'R-Phase Current',
    'current_I2': 'Y-Phase Current',
    'die_eject_forward': 'Die Eject Forward',
    'die_eject_rev': 'Die Eject Reverse',
    'horizontal_fwd': 'Horizontal Forward',
    'horizontal_rev': 'Horizontal Reverse',
    'import_kWh': 'Energy',
    'injection_fwd': 'Injection Forward',
    'injection_rev': 'Injection Reverse',
    'loadcell_out': 'Hopper Weight',
    'loadcell_to_plc': 'LoadCell to PLC',
    'pressure_output_from_plc': 'Injection Pressure',
    'pv': 'Cylinder Temperature PV',
    'pv_valve2': 'Reducer Process Value',
    'pv_valve3': 'Piston Process Value',
    'pv_valve4': 'Nozzle Process Value',
    'set_valve1': 'Cylinder Temperature SV',
    'set_valve2': 'Reducer Set Value',
    'set_valve3': 'Piston Set Value',
    'set_valve4': 'Nozzle Set Value',
    'vertical1_down': 'Vertical 1 Down',
    'vertical1_up': 'Vertical 1 Up',
    'vertical2_down': 'Vertical 2 Down',
    'vertical2_up': 'Vertical 2 Up',
    'weight_to_be_discharged': 'Weight to be Discharged'
  };

  // System indicators (tinyint fields) - updated field names
  const indicators = [
    'clamping_fwd', 'clamping_rev', 'die_eject_forward', 'die_eject_rev',
    'horizontal_fwd', 'horizontal_rev', 'injection_fwd', 'injection_rev',
    'vertical1_down', 'vertical1_up', 'vertical2_down', 'vertical2_up'
  ];

  // Value metrics for chart selection (float fields) - updated field names
  const valueMetrics = [
    'Total_kW', 'Current_I3', 'avg_PF', 'avg_current', 'avg_vtg_LL', 'avg_vtg_LN',
    'current_I1', 'current_I2', 'import_kWh', 'loadcell_out', 'loadcell_to_plc',
    'pressure_output_from_plc', 'pv', 'pv_valve2', 'pv_valve3', 'pv_valve4',
    'set_valve1', 'set_valve2', 'set_valve3', 'set_valve4', 'weight_to_be_discharged'
  ];

  // Fetch latest data
  const fetchLatestData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}?endpoint=latest`);
      const result = await response.json();
      
      if (result.success && result.data) {
        // Add timestamp if not present
        const dataWithTimestamp = {
          ...result.data,
          timestamp: result.data.created_at || new Date().toISOString()
        };
        setCurrentData(dataWithTimestamp);
        setLastUpdate(new Date());
        setConnectionStatus('connected');
        setError(null);
        return dataWithTimestamp;
      } else {
        throw new Error(result.error || 'No data available');
      }
    } catch (err) {
      console.error('Error fetching latest data:', err);
      setError(err.message);
      setConnectionStatus('disconnected');
      return null;
    }
  };

  // Fetch historical data
  const fetchHistoricalData = async (limit = 50) => {
    try {
      const response = await fetch(`${API_BASE_URL}?endpoint=all&limit=${limit}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        // Add timestamps to historical data if not present
        const dataWithTimestamps = result.data.map(item => ({
          ...item,
          timestamp: item.created_at || new Date().toISOString()
        }));
        setData(dataWithTimestamps.reverse());
        return dataWithTimestamps;
      } else {
        throw new Error(result.error || 'No historical data available');
      }
    } catch (err) {
      console.error('Error fetching historical data:', err);
      return [];
    }
  };

  // Initial data fetch
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      setConnectionStatus('connecting');
      
      const [latest, historical] = await Promise.all([
        fetchLatestData(),
        fetchHistoricalData()
      ]);
      
      setLoading(false);
    };

    initializeData();
  }, []);

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(async () => {
      const latestData = await fetchLatestData();
      
      if (latestData) {
        setData(prevData => {
          const newData = [...prevData];
          const lastTimestamp = newData.length > 0 ? newData[newData.length - 1].timestamp : null;
          
          if (!lastTimestamp || latestData.timestamp !== lastTimestamp) {
            newData.push(latestData);
            return newData.slice(-50);
          }
          return newData;
        });
      }
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const getValue = (field) => {
    if (!currentData || currentData[field] === null || currentData[field] === undefined) return 0;
    return parseFloat(currentData[field]) || 0;
  };

  const getIndicatorStatus = () => {
    if (!currentData) return {};
    return indicators.reduce((acc, indicator) => {
      acc[indicator] = parseInt(currentData[indicator]) || 0;
      return acc;
    }, {});
  };

  const formatFieldName = (field) => {
    return fieldMapping[field] || field.replace(/_/g, ' ');
  };

  // Simple line chart component
  const SimpleLineChart = ({ data, metric }) => {
    const recentData = data.slice(-10);
    const values = recentData.map(d => parseFloat(d[metric]) || 0);
    const maxValue = Math.max(...values, 1);
    const minValue = Math.min(...values, 0);
    const range = maxValue - minValue || 1;

    return (
      <div className="h-48 flex items-end justify-between bg-gray-700 p-4 rounded">
        {recentData.map((point, index) => {
          const value = parseFloat(point[metric]) || 0;
          const height = ((value - minValue) / range) * 140 + 10;
          
          return (
            <div key={index} className="flex flex-col items-center">
              <div 
                className="bg-blue-400 w-4 rounded-t transition-all duration-300"
                style={{ height: `${height}px` }}
                title={`${value} at ${new Date(point.timestamp).toLocaleTimeString()}`}
              ></div>
              <span className="text-xs text-gray-400 mt-1">
                {new Date(point.timestamp).toLocaleTimeString().slice(0, 5)}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Progress bar component
  const ProgressBar = ({ value, max, label, color = 'blue', unit = '' }) => {
    const percentage = Math.min((Math.abs(value) / max) * 100, 100);
    const colorClasses = {
      blue: 'bg-blue-400',
      green: 'bg-green-400',
      yellow: 'bg-yellow-400',
      red: 'bg-red-400',
      purple: 'bg-purple-400',
      cyan: 'bg-cyan-400',
      orange: 'bg-orange-400',
      pink: 'bg-pink-400'
    };

    return (
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-300">{label}</span>
          <span className="text-white font-semibold">{value.toFixed(2)} {unit}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`${colorClasses[color]} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          Loading Real-Time Data...
        </div>
      </div>
    );
  }

  const indicatorStatus = getIndicatorStatus();
  const activeCount = Object.values(indicatorStatus).filter(v => v === 1).length;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Factory className="text-blue-400" />
                Wax Injector Machine Dashboard
              </h1>
              <p className="text-gray-400">Real-time monitoring and data visualization - All Attributes</p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-3 py-2 rounded ${
                connectionStatus === 'connected' ? 'bg-green-900 text-green-300' : 
                connectionStatus === 'connecting' ? 'bg-yellow-900 text-yellow-300' : 
                'bg-red-900 text-red-300'
              }`}>
                {connectionStatus === 'connected' ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                <span className="text-sm capitalize">{connectionStatus}</span>
              </div>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Last updated: {lastUpdate ? lastUpdate.toLocaleString() : 'No data'}
            {error && <span className="text-red-400 ml-4">Error: {error}</span>}
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Power</p>
                <p className="text-2xl font-bold text-blue-400">
                  {getValue('Total_kW').toFixed(3)} kW
                </p>
              </div>
              <Zap className="text-blue-400 w-8 h-8" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-green-500 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Current</p>
                <p className="text-2xl font-bold text-green-400">
                  {getValue('avg_current').toFixed(2)} A
                </p>
              </div>
              <Gauge className="text-green-400 w-8 h-8" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-yellow-500 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Injection Pressure</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {getValue('pressure_output_from_plc').toFixed(0)} bar
                </p>
              </div>
              <Settings className="text-yellow-400 w-8 h-8" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-red-500 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Indicators</p>
                <p className="text-2xl font-bold text-red-400">
                  {activeCount}/{indicators.length}
                </p>
              </div>
              <AlertCircle className="text-red-400 w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* System Indicators */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Database className="text-blue-400" />
              System Indicators
            </h2>
            <div className="grid grid-cols-1 gap-2">
              {indicators.map(indicator => (
                <div key={indicator} className="flex items-center justify-between p-3 bg-gray-700 rounded hover:bg-gray-600 transition-colors">
                  <span className="text-sm">{formatFieldName(indicator)}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      indicatorStatus[indicator] === 1 
                        ? 'bg-green-900 text-green-300' 
                        : 'bg-red-900 text-red-300'
                    }`}>
                      {indicatorStatus[indicator] === 1 ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                    <div className={`w-4 h-4 rounded-full ${
                      indicatorStatus[indicator] === 1 ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                    }`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Values - Electrical Parameters */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Zap className="text-blue-400" />
              Electrical Parameters
            </h2>
            <div className="space-y-3">
              <ProgressBar value={getValue('Total_kW')} max={50} label="Power" color="blue" unit="kW" />
              <ProgressBar value={getValue('avg_current')} max={200} label="Total Current" color="green" unit="A" />
              <ProgressBar value={getValue('current_I1')} max={100} label="R-Phase Current" color="red" unit="A" />
              <ProgressBar value={getValue('current_I2')} max={100} label="Y-Phase Current" color="yellow" unit="A" />
              <ProgressBar value={getValue('Current_I3')} max={100} label="B-Phase Current" color="blue" unit="A" />
              <ProgressBar value={Math.abs(getValue('avg_PF'))} max={1} label="Power Factor" color="purple" />
              <ProgressBar value={getValue('avg_vtg_LL')} max={500} label="LL Voltage" color="cyan" unit="V" />
              <ProgressBar value={getValue('avg_vtg_LN')} max={300} label="LN Voltage" color="orange" unit="V" />
              <ProgressBar value={getValue('import_kWh')} max={1000} label="Energy" color="pink" unit="kWh" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Process Parameters */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Settings className="text-yellow-400" />
              Process Parameters
            </h2>
            <div className="space-y-3">
              <ProgressBar value={getValue('pressure_output_from_plc')} max={1000} label="Injection Pressure" color="red" unit="bar" />
              <ProgressBar value={getValue('loadcell_out')} max={500} label="Hopper Weight" color="green" unit="kg" />
              <ProgressBar value={getValue('loadcell_to_plc')} max={100} label="LoadCell to PLC" color="blue" />
              <ProgressBar value={getValue('weight_to_be_discharged')} max={100} label="Weight to Discharge" color="purple" unit="kg" />
            </div>
          </div>

          {/* Temperature Parameters */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Thermometer className="text-red-400" />
              Temperature Control
            </h2>
            <div className="space-y-3">
              <ProgressBar value={getValue('pv')} max={300} label="Cylinder Temp PV" color="red" unit="°C" />
              <ProgressBar value={getValue('set_valve1')} max={300} label="Cylinder Temp SV" color="orange" unit="°C" />
              <ProgressBar value={getValue('pv_valve2')} max={300} label="Reducer PV" color="yellow" unit="°C" />
              <ProgressBar value={getValue('set_valve2')} max={300} label="Reducer SV" color="green" unit="°C" />
              <ProgressBar value={getValue('pv_valve3')} max={300} label="Piston PV" color="blue" unit="°C" />
              <ProgressBar value={getValue('set_valve3')} max={300} label="Piston SV" color="purple" unit="°C" />
              <ProgressBar value={getValue('pv_valve4')} max={300} label="Nozzle PV" color="cyan" unit="°C" />
              <ProgressBar value={getValue('set_valve4')} max={300} label="Nozzle SV" color="pink" unit="°C" />
            </div>
          </div>
        </div>

        {/* Comprehensive Data Table */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">All Current Values</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-2">Parameter</th>
                  <th className="text-left p-2">Value</th>
                  <th className="text-left p-2">Unit</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {valueMetrics.map((field, index) => (
                  <tr key={field} className="border-b border-gray-700 hover:bg-gray-700 transition-colors">
                    <td className="p-2 font-medium">{formatFieldName(field)}</td>
                    <td className="p-2 text-blue-400 font-semibold">{getValue(field).toFixed(3)}</td>
                    <td className="p-2 text-gray-400">
                      {field.includes('kW') ? 'kW' : 
                       field.includes('current') || field.includes('Current') ? 'A' : 
                       field.includes('vtg') ? 'V' : 
                       field.includes('kWh') ? 'kWh' : 
                       field.includes('pressure') ? 'bar' : 
                       field.includes('weight') || field.includes('loadcell') ? 'kg' : 
                       field.includes('pv') || field.includes('set') ? '°C' : '-'}
                    </td>
                    <td className="p-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        getValue(field) > 0 ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'
                      }`}>
                        {getValue(field) > 0 ? 'ACTIVE' : 'IDLE'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaxInjectorDashboard;