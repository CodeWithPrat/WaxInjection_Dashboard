import React, { useState, useEffect } from 'react';
import { Zap, Power, Gauge, Activity, Wifi, WifiOff, ChevronDown, ChevronUp } from 'lucide-react';
import GaugeComponent from 'react-gauge-component';
import PowerCalculator from '../Calculator/Calculator';

const EnergyManagementDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('connected');
    const [lastUpdate, setLastUpdate] = useState(null);
    const [expandedCard, setExpandedCard] = useState(null);
    const [showPhaseCurrents, setShowPhaseCurrents] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch('https://cmti-edge.online/WaxInjection/testwax.php');
            const data = await response.json();

            if (data.success) {
                setData(data.data);
                setLastUpdate(new Date());
                setConnectionStatus('connected');
            } else {
                throw new Error('API response unsuccessful');
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.message);
            setConnectionStatus('disconnected');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, []);

    const getValue = (field) => {
        if (!data || data[field] === null || data[field] === undefined) return 0;
        return parseFloat(data[field]) || 0;
    };

    const handleTotalCurrentClick = () => {
        setShowPhaseCurrents(!showPhaseCurrents);
    };

    const handleBackgroundClick = (e) => {
        // Close phase currents if clicking outside cards
        if (e.target.classList.contains('dashboard-background')) {
            setShowPhaseCurrents(false);
        }
    };

    if (loading && !data) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-green-500/30 rounded-full animate-spin border-t-green-500 mx-auto mb-4"></div>
                    </div>
                    <div className="text-white text-xl font-semibold animate-pulse">
                        Initializing Energy Monitoring System...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white overflow-x-hidden dashboard-background"
            onClick={handleBackgroundClick}
        >
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
            </div>

            <div className="relative z-10 p-4 md:p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="flex items-center justify-start gap-6 mb-10 p-4 sm:p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-lg border border-green-500/20">
                        {/* Icon with Glow */}
                        <div className="relative flex-shrink-0 w-16 h-16 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full bg-green-500/20 blur-xl animate-ping"></div>
                            <Zap className="text-green-400 w-10 h-10 animate-pulse relative z-10 drop-shadow-lg" />
                        </div>

                        {/* Title and Subtitle */}
                        <div>
                            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-green-400 via-teal-400 to-green-400 bg-clip-text text-transparent tracking-tight leading-tight drop-shadow-sm animate-gradient">
                                Wax Injection Energy Dashboard
                            </h1>
                            <p className="mt-2 text-gray-300 text-sm sm:text-base md:text-lg font-medium leading-snug">
                                Real-time Monitoring of Power, Current & Pressure Analysis
                            </p>
                        </div>
                    </div>

                    {/* Status Bar */}
                    <div className="flex items-center justify-center gap-6 text-sm">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm transition-all duration-300 ${connectionStatus === 'connected'
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                            }`}>
                            {connectionStatus === 'connected' ? (
                                <Wifi className="w-4 h-4 animate-pulse" />
                            ) : (
                                <WifiOff className="w-4 h-4" />
                            )}
                            <span className="capitalize">{connectionStatus}</span>
                        </div>

                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/20 border border-teal-500/30 backdrop-blur-sm">
                            <Activity className="w-4 h-4 text-teal-400 animate-pulse" />
                            <span className="text-teal-300">System Active</span>
                        </div>

                        <div className="text-gray-400">
                            Updated: {lastUpdate ? lastUpdate.toLocaleTimeString() : 'No data'}
                        </div>
                    </div>
                </div>

                {/* Main Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* Power Output Card */}
                    <div className="group relative bg-gradient-to-br from-gray-800/50 via-gray-800/30 to-gray-900/50 rounded-2xl p-6 border border-green-500/20 backdrop-blur-sm hover:border-green-500/40 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-green-500/20">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <Power className="text-green-500 w-8 h-8" />
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-green-400">
                                        {getValue('Total_kW').toFixed(3)}
                                    </div>
                                    <div className="text-green-300 text-sm">kW</div>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Power Output</h3>
                            <div className="w-full bg-gray-700/50 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-700 animate-pulse"
                                    style={{ width: `${Math.min((getValue('Total_kW') / 10) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Total Current Card */}
                    <div
                        className={`group relative bg-gradient-to-br from-gray-800/50 via-gray-800/30 to-gray-900/50 rounded-2xl p-6 border border-teal-500/20 backdrop-blur-sm hover:border-teal-500/40 transition-all duration-500 cursor-pointer hover:scale-[1.02] hover:shadow-2xl hover:shadow-teal-500/20 ${showPhaseCurrents ? 'bg-teal-500/10' : ''
                            }`}
                        onClick={handleTotalCurrentClick}
                    >
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Zap className="text-teal-500 w-8 h-8" />
                                    {showPhaseCurrents ? (
                                        <ChevronUp className="text-teal-400 w-5 h-5" />
                                    ) : (
                                        <ChevronDown className="text-teal-400 w-5 h-5" />
                                    )}
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-teal-400">
                                        {getValue('avg_current').toFixed(2)}
                                    </div>
                                    <div className="text-teal-300 text-sm">A</div>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Total Current</h3>
                            <div className="w-full bg-gray-700/50 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-teal-400 to-teal-600 h-2 rounded-full transition-all duration-700 animate-pulse"
                                    style={{ width: `${Math.min((getValue('avg_current') / 1) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Energy Card */}
                    <div className="group relative bg-gradient-to-br from-gray-800/50 via-gray-800/30 to-gray-900/50 rounded-2xl p-6 border border-green-500/20 backdrop-blur-sm hover:border-green-500/40 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-green-500/20">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <Gauge className="text-green-500 w-8 h-8" />
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-green-400">
                                        {getValue('import_kWh').toFixed(0)}
                                    </div>
                                    <div className="text-green-300 text-sm">kWh</div>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Total Energy</h3>
                            <div className="w-full bg-gray-700/50 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-700 animate-pulse"
                                    style={{ width: `${Math.min((getValue('import_kWh') / 1000) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Phase Currents Overlay */}
                {showPhaseCurrents && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-20 flex items-center justify-center p-4 animate-fadeIn">
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-4xl w-full border border-teal-500/30 relative">
                            <button
                                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                                onClick={() => setShowPhaseCurrents(false)}
                            >
                                ✕
                            </button>

                            <h2 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-teal-400 to-green-500 bg-clip-text text-transparent">
                                Phase Current Analysis
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* R-Phase Current */}
                                <div className="text-center">
                                    <h4 className="text-sm font-medium text-red-400 mb-4">R-Phase Current</h4>
                                    <div className="relative inline-block">
                                        <GaugeComponent
                                            value={getValue('current_I1')}
                                            type="radial"
                                            minValue={0}
                                            maxValue={1}
                                            labels={{
                                                tickLabels: {
                                                    type: "inner",
                                                    ticks: [
                                                        { value: 0.2 },
                                                        { value: 0.4 },
                                                        { value: 0.6 },
                                                        { value: 0.8 },
                                                        { value: 1.0 }
                                                    ]
                                                },
                                                valueLabel: {
                                                    formatTextValue: value => value.toFixed(2) + ' A',
                                                    style: { fontSize: '18px', fill: '#ef4444', fontWeight: 'bold' }
                                                }
                                            }}
                                            arc={{
                                                colorArray: ['#22c55e', '#eab308', '#ef4444'],
                                                subArcs: [{ limit: 0.3 }, { limit: 0.7 }, {}],
                                                padding: 0.02,
                                                width: 0.3
                                            }}
                                            pointer={{
                                                elastic: true,
                                                animationDelay: 0,
                                                color: '#ef4444'
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Y-Phase Current */}
                                <div className="text-center">
                                    <h4 className="text-sm font-medium text-yellow-400 mb-4">Y-Phase Current</h4>
                                    <div className="relative inline-block">
                                        <GaugeComponent
                                            value={getValue('current_I2')}
                                            type="radial"
                                            minValue={0}
                                            maxValue={1}
                                            labels={{
                                                tickLabels: {
                                                    type: "inner",
                                                    ticks: [
                                                        { value: 0.2 },
                                                        { value: 0.4 },
                                                        { value: 0.6 },
                                                        { value: 0.8 },
                                                        { value: 1.0 }
                                                    ]
                                                },
                                                valueLabel: {
                                                    formatTextValue: value => value.toFixed(2) + ' A',
                                                    style: { fontSize: '18px', fill: '#eab308', fontWeight: 'bold' }
                                                }
                                            }}
                                            arc={{
                                                colorArray: ['#22c55e', '#eab308', '#ef4444'],
                                                subArcs: [{ limit: 0.3 }, { limit: 0.7 }, {}],
                                                padding: 0.02,
                                                width: 0.3
                                            }}
                                            pointer={{
                                                elastic: true,
                                                animationDelay: 200,
                                                color: '#eab308'
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* B-Phase Current */}
                                <div className="text-center">
                                    <h4 className="text-sm font-medium text-blue-400 mb-4">B-Phase Current</h4>
                                    <div className="relative inline-block">
                                        <GaugeComponent
                                            value={getValue('Current_I3')}
                                            type="radial"
                                            minValue={0}
                                            maxValue={1}
                                            labels={{
                                                tickLabels: {
                                                    type: "inner",
                                                    ticks: [
                                                        { value: 0.2 },
                                                        { value: 0.4 },
                                                        { value: 0.6 },
                                                        { value: 0.8 },
                                                        { value: 1.0 }
                                                    ]
                                                },
                                                valueLabel: {
                                                    formatTextValue: value => value.toFixed(2) + ' A',
                                                    style: { fontSize: '18px', fill: '#3b82f6', fontWeight: 'bold' }
                                                }
                                            }}
                                            arc={{
                                                colorArray: ['#22c55e', '#eab308', '#ef4444'],
                                                subArcs: [{ limit: 0.3 }, { limit: 0.7 }, {}],
                                                padding: 0.02,
                                                width: 0.3
                                            }}
                                            pointer={{
                                                elastic: true,
                                                animationDelay: 400,
                                                color: '#3b82f6'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* System Intelligence Section */}
                <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">
                        Energy Parameters
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Line-to-Line Voltage */}
                        <div className="text-center group">
                            <div className="relative inline-block mb-4">
                                <GaugeComponent
                                    value={getValue('avg_vtg_LL')}
                                    type="radial"
                                    minValue={300}
                                    maxValue={500}
                                    labels={{
                                        tickLabels: {
                                            type: "inner",
                                            ticks: [
                                                { value: 350 },
                                                { value: 400 },
                                                { value: 450 },
                                                { value: 500 }
                                            ]
                                        },
                                        valueLabel: {
                                            formatTextValue: value => value.toFixed(1) + ' V',
                                            style: { fontSize: '25px', fill: '#22c55e', fontWeight: 'bold' }
                                        }
                                    }}
                                    arc={{
                                        colorArray: ['#ef4444', '#eab308', '#22c55e'],
                                        subArcs: [{ limit: 380 }, { limit: 440 }, {}],
                                        padding: 0.02,
                                        width: 0.25
                                    }}
                                    pointer={{
                                        elastic: true,
                                        animationDelay: 0,
                                        color: '#22c55e'
                                    }}
                                />
                                <div className="absolute inset-0 bg-green-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            </div>
                            <h3 className="font-semibold text-green-400">Line-to-Line Voltage</h3>
                            <p className="text-gray-400 text-sm mt-1">{getValue('avg_vtg_LL').toFixed(1)} V</p>
                        </div>

                        {/* Line-to-Neutral Voltage */}
                        <div className="text-center group">
                            <div className="relative inline-block mb-4">
                                <GaugeComponent
                                    value={getValue('avg_vtg_LN')}
                                    type="radial"
                                    minValue={150}
                                    maxValue={300}
                                    labels={{
                                        tickLabels: {
                                            type: "inner",
                                            ticks: [
                                                { value: 180 },
                                                { value: 210 },
                                                { value: 240 },
                                                { value: 270 },
                                                { value: 300 }
                                            ]
                                        },
                                        valueLabel: {
                                            formatTextValue: value => value.toFixed(1) + ' V',
                                            style: { fontSize: '25px', fill: '#14b8a6', fontWeight: 'bold' }
                                        }
                                    }}
                                    arc={{
                                        colorArray: ['#ef4444', '#eab308', '#22c55e'],
                                        subArcs: [{ limit: 200 }, { limit: 250 }, {}],
                                        padding: 0.02,
                                        width: 0.25
                                    }}
                                    pointer={{
                                        elastic: true,
                                        animationDelay: 100,
                                        color: '#14b8a6'
                                    }}
                                />
                                <div className="absolute inset-0 bg-teal-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            </div>
                            <h3 className="font-semibold text-teal-400">Line-to-Neutral Voltage</h3>
                            <p className="text-gray-400 text-sm mt-1">{getValue('avg_vtg_LN').toFixed(1)} V</p>
                        </div>

                        {/* Power Factor */}
                        <div className="text-center group">
                            <div className="relative inline-block mb-4">
                                <GaugeComponent
                                    value={getValue('avg_PF')}
                                    type="radial"
                                    minValue={0}
                                    maxValue={1}
                                    labels={{
                                        tickLabels: {
                                            type: "inner",
                                            ticks: [
                                                { value: 0.2 },
                                                { value: 0.4 },
                                                { value: 0.6 },
                                                { value: 0.8 },
                                                { value: 1.0 }
                                            ]
                                        },
                                        valueLabel: {
                                            formatTextValue: value => value.toFixed(2),
                                            style: { fontSize: '25px', fill: '#8b5cf6', fontWeight: 'bold' }
                                        }
                                    }}
                                    arc={{
                                        colorArray: ['#ef4444', '#eab308', '#22c55e'],
                                        subArcs: [{ limit: 0.3 }, { limit: 0.7 }, {}],
                                        padding: 0.02,
                                        width: 0.25
                                    }}
                                    pointer={{
                                        elastic: true,
                                        animationDelay: 200,
                                        color: '#8b5cf6'
                                    }}
                                />
                                <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            </div>
                            <h3 className="font-semibold text-purple-400">Power Factor</h3>
                            <p className="text-gray-400 text-sm mt-1">{getValue('avg_PF').toFixed(3)}</p>
                        </div>

                        {/* Total Energy */}
                        <div className="text-center group">
                            <div className="relative inline-block mb-4">
                                <GaugeComponent
                                    value={getValue('import_kWh')}
                                    type="radial"
                                    minValue={0}
                                    maxValue={100}
                                    labels={{
                                        tickLabels: {
                                            type: "inner",
                                            ticks: [
                                                { value: 20 },
                                                { value: 40 },
                                                { value: 60 },
                                                { value: 80 },
                                                { value: 100 }
                                            ]
                                        },
                                        valueLabel: {
                                            formatTextValue: value => value.toFixed(1) + ' kWh',
                                            style: { fontSize: '25px', fill: '#f59e0b', fontWeight: 'bold' }
                                        }
                                    }}
                                    arc={{
                                        colorArray: ['#22c55e', '#eab308', '#ef4444'],
                                        subArcs: [{ limit: 40 }, { limit: 80 }, {}],
                                        padding: 0.02,
                                        width: 0.25
                                    }}
                                    pointer={{
                                        elastic: true,
                                        animationDelay: 300,
                                        color: '#f59e0b'
                                    }}
                                />
                                <div className="absolute inset-0 bg-yellow-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            </div>
                            <h3 className="font-semibold text-yellow-400">Total Energy</h3>
                            <p className="text-gray-400 text-sm mt-1">{getValue('import_kWh').toFixed(1)} kWh</p>
                        </div>
                    </div>
                                            <PowerCalculator/>

                </div>
            </div>

            <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
        </div>
    );
};

export default EnergyManagementDashboard;