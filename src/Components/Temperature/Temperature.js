import React, { useState, useEffect, useRef } from 'react';
import { Thermometer, Zap, Gauge, Activity, TrendingUp, AlertCircle, CheckCircle, Loader, Cpu, Settings, Power } from 'lucide-react';

const Temperature = () => {
  const [data, setData] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const intervalRef = useRef(null);

  const fetchData = async () => {
    try {
      // Fetch real data from API
      const response = await fetch('https://cmti-edge.online/WaxInjection/testwax.php');
      const jsonData = await response.json();
      
      if (jsonData.success) {
        setData(prevData => {
          // If we have previous data, smoothly update without visual disruption
          if (prevData) {
            return { ...jsonData.data };
          }
          return jsonData.data;
        });
        setError(null);
        setLastUpdate(new Date());
        
        // Only turn off initial loading after first successful fetch
        if (initialLoading) {
          setInitialLoading(false);
        }
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (err) {
      setError('Connection error');
      console.error('Error fetching data:', err);
      
      // Only turn off initial loading if we don't have any data yet
      if (initialLoading) {
        setInitialLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, 5000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const temperatureData = data ? [
    {
      name: 'Cylinder Temperature',
      dataKey: 'pv',
      icon: Thermometer,
      color: '#3B82F6',
      gradientColors: ['#60A5FA', '#3B82F6', '#1D4ED8'],
      unit: '°C',
      min: 0,
      max: 100
    },
    {
      name: 'Reducer Temperature',
      dataKey: 'pv_valve2',
      icon: Gauge,
      color: '#10B981',
      gradientColors: ['#34D399', '#10B981', '#047857'],
      unit: '°C',
      min: 0,
      max: 100
    },
    {
      name: 'Nozzle Temperature',
      dataKey: 'pv_valve4',
      icon: TrendingUp,
      color: '#EF4444',
      gradientColors: ['#F87171', '#EF4444', '#DC2626'],
      unit: '°C',
      min: 0,
      max: 100
    }, 
    {
      name: 'Piston Temperature',
      dataKey: 'pv_valve3',
      icon: Activity,
      color: '#F59E0B',
      gradientColors: ['#FBBF24', '#F59E0B', '#D97706'],
      unit: '°C',
      min: 0,
      max: 100
    },
  ] : [];

  const systemSetData = data ? [
    {
      name: 'Cylinder Temperature Set',
      dataKey: 'set_valve1',
      unit: '°C',
      icon: Thermometer,
      color: '#3B82F6'
    },
    {
      name: 'Reducer Set Value',
      dataKey: 'set_valve2',
      unit: '°C',
      icon: Gauge,
      color: '#10B981'
    },
    {
      name: 'Nozzle Set Value',
      dataKey: 'set_valve4',
      unit: '°C',
      icon: TrendingUp,
      color: '#EF4444'
    },
    {
      name: 'Piston Set Value',
      dataKey: 'set_valve3',
      unit: '°C',
      icon: Activity,
      color: '#F59E0B'
    },
  ] : [];

  const ThermometerCard = ({ temp }) => {
    const Icon = temp.icon;
    const temperature = parseFloat(data[temp.dataKey] || 0);
    
    // Calculate percentage for thermometer fill
    const fillPercentage = ((temperature - temp.min) / (temp.max - temp.min)) * 100;
    
    // Status based on temperature range (you can adjust these ranges as needed)
    const isNormal = temperature > 0 && temperature < temp.max * 0.9;
    
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl shadow-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div 
              className="p-3 rounded-xl shadow-lg"
              style={{ backgroundColor: temp.color + '20', border: `1px solid ${temp.color}40` }}
            >
              <Icon className="w-6 h-6" style={{ color: temp.color }} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{temp.name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                {isNormal ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                )}
                <span className={`text-xs font-medium ${isNormal ? 'text-green-400' : 'text-amber-400'}`}>
                  {isNormal ? 'Normal' : 'Check Range'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Thermometer Visualization */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            {/* Thermometer Container */}
            <div className="relative w-16 h-48 mx-auto">
              {/* Thermometer Body */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-40 bg-gray-700 rounded-t-full border-2 border-gray-600">
                {/* Temperature Scale Marks */}
                <div className="absolute -left-8 top-0 h-full">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="absolute flex items-center" style={{ top: `${i * 20}%` }}>
                      <div className="w-2 h-px bg-gray-500"></div>
                      <span className="text-xs text-gray-400 ml-1">
                        {Math.round(temp.max - (i * (temp.max - temp.min) / 4))}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Mercury Fill */}
                <div 
                  className="absolute bottom-0 left-0 w-full rounded-t-full transition-all duration-2000 ease-in-out"
                  style={{ 
                    height: `${Math.max(0, Math.min(100, fillPercentage))}%`,
                    background: `linear-gradient(to top, ${temp.gradientColors[2]}, ${temp.gradientColors[1]}, ${temp.gradientColors[0]})`
                  }}
                />
                
                {/* Mercury Glow Effect */}
                <div 
                  className="absolute bottom-0 left-0 w-full rounded-t-full opacity-50 blur-sm transition-all duration-2000 ease-in-out"
                  style={{ 
                    height: `${Math.max(0, Math.min(100, fillPercentage))}%`,
                    background: `linear-gradient(to top, ${temp.gradientColors[2]}, ${temp.gradientColors[1]}, ${temp.gradientColors[0]})`
                  }}
                />
              </div>
              
              {/* Thermometer Bulb */}
              <div 
                className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-10 h-10 rounded-full border-2 border-gray-600 transition-all duration-2000"
                style={{ backgroundColor: temp.gradientColors[1] }}
              >
                <div 
                  className="absolute inset-1 rounded-full opacity-60 blur-sm"
                  style={{ backgroundColor: temp.gradientColors[0] }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Temperature Reading */}
        <div className="space-y-3">
          <div className="flex justify-center items-center p-4 bg-gray-800/50 rounded-lg">
            <span 
              className="text-3xl font-bold transition-all duration-1000 ease-in-out"
              style={{ color: temp.color }}
            >
              {temperature}°C
            </span>
          </div>
          
          <div className="text-center">
            <span className="text-sm text-gray-400">Current Temperature</span>
          </div>
        </div>
      </div>
    );
  };

  const SystemCard = ({ system }) => {
    const Icon = system.icon;
    const value = parseFloat(data[system.dataKey] || 0);
    
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl shadow-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div 
            className="p-3 rounded-xl shadow-lg"
            style={{ backgroundColor: system.color + '20', border: `1px solid ${system.color}40` }}
          >
            <Icon className="w-6 h-6" style={{ color: system.color }} />
          </div>
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
        </div>
        
        <h3 className="text-lg font-semibold text-white mb-2">{system.name}</h3>
        
        <div className="flex items-baseline space-x-2 mb-4">
          <span 
            className="text-3xl font-bold transition-all duration-1000 ease-in-out"
            style={{ color: system.color }}
          >
            {value.toFixed(1)}
          </span>
          {/* <span className="text-lg text-gray-300 font-medium">{system.unit}</span> */}
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="h-full rounded-full transition-all duration-2000 ease-in-out"
            style={{ 
              width: `${Math.min(100, (value / 600) * 100)}%`,
              backgroundColor: system.color
            }}
          />
        </div>
      </div>
    );
  };

  // Show initial loading screen only on first load
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-16 h-16 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300 text-xl">Loading machine data...</p>
        </div>
      </div>
    );
  }

  // If no data after initial load, show error state
  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-300 text-xl mb-4">Unable to load machine data</p>
          <p className="text-gray-400">Please check your connection and try again</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-2xl border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                <Cpu className="inline w-10 h-10 mr-3 text-cyan-400" />
                Wax Injection Machine
              </h1>
              <p className="text-gray-300 mt-2 text-lg">Real-time Temperature & System Monitoring</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400 font-medium">Live</span>
              </div>
              {lastUpdate && (
                <div className="text-sm text-gray-400">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </div>
              )}
              <div className="flex space-x-2">
                <Settings className="w-5 h-5 text-gray-400 hover:text-gray-300 cursor-pointer transition-colors" />
                <Power className="w-5 h-5 text-gray-400 hover:text-gray-300 cursor-pointer transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-900/30 border border-red-600/50 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-300">{error}</span>
            </div>
          </div>
        )}

        {/* Temperature Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
            <Thermometer className="w-8 h-8 mr-4 text-cyan-400" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Temperature Control
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {temperatureData.map((temp) => (
              <ThermometerCard key={temp.name} temp={temp} />
            ))}
          </div>
        </div>

        {/* System Set Values Section */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
            <Settings className="w-8 h-8 mr-4 text-yellow-400" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              System Set Values
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {systemSetData.map((system) => (
              <SystemCard key={system.name} system={system} />
            ))}
          </div>
        </div>

        {/* Status Footer */}
        <div className="mt-12 bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl shadow-2xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                System Status: Operational
              </span>
            </div>
            <div className="text-sm text-gray-400">
              Auto-refresh every 5 seconds
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Temperature;