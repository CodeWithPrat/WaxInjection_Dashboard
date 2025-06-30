import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, AlertTriangle, Power, Settings, Activity, Gauge, Zap, Thermometer, Droplets } from 'lucide-react';

const EnhancedCylinderDashboard = () => {
    // Hydraulic Cylinder Dashboard States
    const [extensionLevel, setExtensionLevel] = useState(25);
    const [targetLevel, setTargetLevel] = useState(25);
    const [operationMode, setOperationMode] = useState('Manual');
    const [systemStatus, setSystemStatus] = useState('Active');
    const [isRunning, setIsRunning] = useState(false);
    const [pressure, setPressure] = useState(150);
    const [temperature, setTemperature] = useState(68);
    const [emergencyStop, setEmergencyStop] = useState(false);
    const [cycleCount, setCycleCount] = useState(1247);
    const [flowRate, setFlowRate] = useState(0);
    const intervalRef = useRef(null);

    // Cylinder Status States
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Animation states
    const [pulseActive, setPulseActive] = useState(false);
    const [sparkles, setSparkles] = useState([]);
    const [ripples, setRipples] = useState([]);

    // Generate sparkles animation
    useEffect(() => {
        const generateSparkles = () => {
            const newSparkles = Array.from({ length: 8 }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                delay: Math.random() * 2,
                duration: 2 + Math.random() * 2
            }));
            setSparkles(newSparkles);
        };

        generateSparkles();
        const sparkleInterval = setInterval(generateSparkles, 4000);
        return () => clearInterval(sparkleInterval);
    }, []);

    // Generate fluid ripples
    useEffect(() => {
        if (isRunning) {
            const rippleInterval = setInterval(() => {
                setRipples(prev => [
                    ...prev.slice(-3), // Keep only last 3 ripples
                    {
                        id: Date.now(),
                        size: 5 + Math.random() * 10,
                        opacity: 0.3 + Math.random() * 0.4,
                        left: 10 + Math.random() * 80
                    }
                ]);
            }, 800);

            return () => clearInterval(rippleInterval);
        }
    }, [isRunning]);

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('https://cmti-edge.online/WaxInjection/testwax.php');
                const result = await response.json();
                if (result.success) {
                    setData(result.data);
                    const level = Math.min(100, Math.max(0, (parseInt(result.data.loadcell_out) / 300) * 100));
                    setExtensionLevel(level || 25);
                    setTargetLevel(level || 25);
                } else {
                    setError('Failed to fetch data');
                }
            } catch (err) {
                setError('Network error');
                setData({
                    loadcell_out: "150",
                    loadcell_to_plc: "150",
                    horizontal_fwd: "1",
                    horizontal_rev: "0",
                    die_eject_forward: "0",
                    die_eject_rev: "1",
                    injection_fwd: "1",
                    injection_rev: "0",
                    clamping_fwd: "0",
                    clamping_rev: "1",
                    vertical1_down: "1",
                    vertical1_up: "0"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    // Auto mode operation
    useEffect(() => {
        if (operationMode === 'Auto' && isRunning && !emergencyStop) {
            setPulseActive(true);
            intervalRef.current = setInterval(() => {
                setExtensionLevel(prev => {
                    const diff = targetLevel - prev;
                    if (Math.abs(diff) < 0.5) {
                        setIsRunning(false);
                        setFlowRate(0);
                        setPulseActive(false);
                        return targetLevel;
                    }
                    const step = diff > 0 ? 1.5 : -1.5;
                    setFlowRate(Math.abs(step) * 10);
                    return prev + step;
                });

                setPressure(prev => {
                    const basePressure = 150;
                    const loadPressure = (extensionLevel / 100) * 200;
                    return basePressure + loadPressure + (Math.random() - 0.5) * 10;
                });

                setTemperature(prev => {
                    const baseTemp = 68;
                    const runningTemp = isRunning ? 15 : 0;
                    return baseTemp + runningTemp + (Math.random() - 0.5) * 3;
                });
            }, 100);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            setFlowRate(0);
            setPulseActive(false);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [operationMode, isRunning, targetLevel, emergencyStop, extensionLevel]);

    // Manual control
    const handleManualControl = (value) => {
        if (operationMode === 'Manual' && !emergencyStop) {
            setExtensionLevel(parseFloat(value));
            setTargetLevel(parseFloat(value));
        }
    };

    const handleExtend = () => {
        if (!emergencyStop) {
            const newTarget = Math.min(targetLevel + 10, 100);
            setTargetLevel(newTarget);
            if (operationMode === 'Auto') {
                setIsRunning(true);
            }
        }
    };

    const handleRetract = () => {
        if (!emergencyStop) {
            const newTarget = Math.max(targetLevel - 10, 0);
            setTargetLevel(newTarget);
            if (operationMode === 'Auto') {
                setIsRunning(true);
            }
        }
    };

    const handleEmergencyStop = () => {
        setEmergencyStop(!emergencyStop);
        setIsRunning(false);
        if (!emergencyStop) {
            setSystemStatus('Emergency Stop');
        } else {
            setSystemStatus('Active');
        }
    };

    const getStatusColor = () => {
        if (emergencyStop) return 'text-red-400';
        if (isRunning) return 'text-green-400';
        return 'text-blue-400';
    };

    const getPressureColor = () => {
        if (pressure > 300) return 'text-red-400';
        if (pressure > 200) return 'text-yellow-400';
        return 'text-green-400';
    };

    const getTemperatureColor = () => {
        if (temperature > 85) return 'text-red-400';
        if (temperature > 75) return 'text-yellow-400';
        return 'text-green-400';
    };

    const getCylinderStatus = (value) => {
        return parseInt(value) === 1;
    };

    const CylinderStatusCard = ({ title, status, isActive }) => (
        <div className={`relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-xl p-4 border transition-all duration-500 hover:scale-105 hover:shadow-2xl group ${isActive
            ? 'border-green-500/50 shadow-green-500/20 shadow-lg'
            : 'border-red-500/50 shadow-red-500/20 shadow-lg'
            }`}>
            {/* Animated background glow */}
            <div className={`absolute inset-0 rounded-xl opacity-20 blur-xl transition-all duration-500 ${isActive ? 'bg-green-500' : 'bg-red-500'
                }`}></div>

            <div className="relative z-10 flex flex-col items-center space-y-3">
                <h3 className="text-white text-xs font-semibold text-center leading-tight tracking-wide">{title}</h3>

                <div className="relative">
                    {/* Outer ring animation */}
                    <div className={`absolute inset-0 rounded-full animate-pulse ${isActive ? 'bg-green-500/30' : 'bg-red-500/30'
                        } scale-125`}></div>

                    {/* Main status indicator */}
                    <div className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 transform hover:rotate-12 ${isActive
                        ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-green-500/50 shadow-xl'
                        : 'bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/50 shadow-xl'
                        }`}>
                        {/* Inner pattern */}
                        <div className="relative">
                            <div className={`w-6 h-6 rounded-full border-2 ${isActive ? 'border-green-100' : 'border-red-100'
                                } flex items-center justify-center`}>
                                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-100' : 'bg-red-100'
                                    } ${isActive ? 'animate-ping' : ''}`}></div>
                            </div>
                        </div>

                        {/* Sparkle effect */}
                        {isActive && (
                            <div className="absolute inset-0">
                                {[...Array(4)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute w-1 h-1 bg-white rounded-full animate-ping"
                                        style={{
                                            top: `${20 + i * 15}%`,
                                            left: `${20 + i * 15}%`,
                                            animationDelay: `${i * 0.3}s`
                                        }}
                                    ></div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-center space-y-1">
                    <span className={`text-xs font-bold tracking-wider transition-all duration-300 ${isActive ? 'text-green-400' : 'text-red-400'
                        }`}>
                        {isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                    <div className={`h-1 w-8 rounded-full transition-all duration-500 ${isActive ? 'bg-green-400' : 'bg-red-400'
                        }`}></div>
                </div>
            </div>
        </div>
    );

    const WeightCard = ({ title, value, unit }) => (
        <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-xl p-4 border border-slate-600/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl group overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

            <div className="relative z-10 flex flex-col items-center space-y-3">
                <h3 className="text-white text-xs font-semibold text-center tracking-wide">{title}</h3>

                <div className="relative bg-black/60 rounded-lg px-4 py-3 min-w-[80px] border border-slate-700/50">
                    <div className="text-center">
                        <span className="text-white text-xl font-bold tracking-wider">{value}</span>
                        <span className="text-slate-400 text-xs ml-1 font-medium">{unit}</span>
                    </div>

                    {/* Subtle glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-lg"></div>
                </div>

                {/* Value indicator bar */}
                <div className="w-full bg-slate-700/50 rounded-full h-1">
                    <div
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-1 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(parseInt(value) / 300 * 100, 100)}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                <div className="text-white text-xl animate-pulse">Loading Dashboard...</div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
            {/* Animated background sparkles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {sparkles.map(sparkle => (
                    <div
                        key={sparkle.id}
                        className="absolute w-1 h-1 bg-white rounded-full animate-ping opacity-30"
                        style={{
                            left: `${sparkle.x}%`,
                            top: `${sparkle.y}%`,
                            animationDelay: `${sparkle.delay}s`,
                            animationDuration: `${sparkle.duration}s`
                        }}
                    ></div>
                ))}
            </div>

            <div className="relative z-10 p-4 lg:p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Enhanced Header */}
                    <div className="mb-8">
                        <div className="relative bg-gradient-to-r from-slate-800/80 via-slate-800/60 to-slate-800/80 backdrop-blur-2xl rounded-3xl p-6 lg:p-8 border border-slate-700/50 shadow-2xl overflow-hidden">
                            {/* Header background animation */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 animate-pulse"></div>

                            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                <div className="text-center lg:text-left">
                                    <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 mb-3 animate-none">
                                        Hydraulic Cylinder Control System
                                    </h1>
                                    <p className="text-slate-400 text-lg lg:text-xl">Advanced Industrial Automation & Monitoring</p>
                                </div>

                                <div className="flex flex-col lg:flex-row items-center gap-6 mt-6 lg:mt-0">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded-full ${emergencyStop ? 'bg-red-500 animate-pulse' : 'bg-green-500 animate-pulse'} shadow-lg`}></div>
                                        <span className={`text-lg font-semibold ${getStatusColor()} tracking-wide`}>{systemStatus}</span>
                                    </div>
                                    <div className="bg-slate-700/50 rounded-full px-4 py-2 border border-slate-600/50">
                                        <span className="text-slate-300 text-sm font-medium">Cycle: </span>
                                        <span className="text-blue-400 font-bold">{cycleCount}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content - Side by Side Layout */}
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Left Side - Cylinder Visualization and Controls */}
                        {/* Left Side - Cylinder Visualization and Controls */}
                        <div className="lg:w-2/3 flex flex-col gap-6">
                            {/* Cylinder Visualization with Side Controls */}
                            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-2xl rounded-3xl p-6 lg:p-8 border border-slate-700/50 shadow-2xl flex-1">
                                <div className="text-center mb-6">
                                    <h2 className="text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400 mb-3">
                                        Cylinder Visualization
                                    </h2>
                                    <p className="text-slate-400 text-lg">Real-time Position & Status Monitoring</p>
                                </div>

                                {/* Main Content - Cylinder with Side Controls */}
                                <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start">
                                    {/* Cylinder Visualization */}
                                    <div className="flex-1 flex flex-col items-center justify-center">
                                        {/* Cylinder Assembly */}
                                        <div className="relative flex flex-col items-center">
                                            {/* Load Indicator */}
                                            <div className="mb-4">
                                                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm lg:text-base px-4 py-2 rounded-full font-bold shadow-2xl animate-pulse">
                                                    LOAD: {(extensionLevel * 15).toFixed(0)} tons
                                                </div>
                                            </div>

                                            {/* Pressure Line with animation */}
                                            <div className="relative">
                                                <div className={`w-3 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-t-full mb-2 shadow-lg transition-all duration-300 ${pulseActive ? 'animate-pulse' : ''}`}></div>
                                                {pulseActive && (
                                                    <div className="absolute inset-0 w-3 h-6 bg-blue-300 rounded-t-full animate-ping opacity-75"></div>
                                                )}
                                            </div>

                                            {/* Cylinder Head */}
                                            <div className="w-28 h-5 bg-gradient-to-b from-gray-400 to-gray-500 rounded-lg shadow-2xl border-2 border-gray-300 mb-2"></div>

                                            {/* Main Cylinder Body - Reduced height */}
                                            <div className="relative w-20 h-80 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 rounded-xl border-4 border-gray-400 shadow-2xl overflow-hidden">
                                                {/* Hydraulic Fluid with enhanced animation */}
                                                <div
                                                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-emerald-500 via-emerald-400 to-emerald-300 transition-all duration-500 ease-out"
                                                    style={{ height: `${extensionLevel}%` }}
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                                                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent animate-bounce opacity-60"></div>

                                                    {/* Fluid ripples */}
                                                    {ripples.map(ripple => (
                                                        <div
                                                            key={ripple.id}
                                                            className="absolute bottom-0 rounded-full bg-white/30 animate-ripple"
                                                            style={{
                                                                width: `${ripple.size}px`,
                                                                height: `${ripple.size}px`,
                                                                left: `${ripple.left}%`,
                                                                opacity: ripple.opacity,
                                                                animationDuration: '1.5s',
                                                                animationFillMode: 'forwards'
                                                            }}
                                                        ></div>
                                                    ))}
                                                </div>

                                                {/* Enhanced Piston */}
                                                <div
                                                    className="absolute left-1 right-1 h-3 bg-gradient-to-b from-gray-600 to-gray-800 rounded-sm shadow-2xl transition-all duration-500 ease-out border-2 border-gray-500"
                                                    style={{ bottom: `${extensionLevel}%` }}
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-sm"></div>
                                                </div>

                                                {/* Level Indicators */}
                                                <div className="absolute -left-10 top-0 h-full flex flex-col justify-between py-2">
                                                    {[100, 75, 50, 25, 0].map(level => (
                                                        <span key={level} className="text-white text-xs font-bold">{level}%</span>
                                                    ))}
                                                </div>

                                                {/* Enhanced Scale Markers */}
                                                {[0, 25, 50, 75, 100].map(level => (
                                                    <div key={level}>
                                                        <div
                                                            className="absolute -right-3 w-2 h-0.5 bg-white shadow-lg"
                                                            style={{ bottom: `${level}%` }}
                                                        ></div>
                                                        <div
                                                            className={`absolute -right-6 text-xs font-medium text-white ${extensionLevel >= level ? 'text-green-400' : 'text-gray-500'}`}
                                                            style={{ bottom: `${level}%` }}
                                                        >
                                                            {level}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Cylinder Base */}
                                            <div className="w-28 h-6 bg-gradient-to-b from-gray-500 to-gray-600 rounded-lg shadow-2xl border-2 border-gray-400 mt-2"></div>

                                            {/* Return Line with animation */}
                                            <div className="relative mt-2">
                                                <div className={`w-3 h-6 bg-gradient-to-b from-red-500 to-red-600 rounded-b-full shadow-lg transition-all duration-300 ${pulseActive ? 'animate-pulse' : ''}`}></div>
                                                {pulseActive && (
                                                    <div className="absolute inset-0 w-3 h-6 bg-red-300 rounded-b-full animate-ping opacity-75"></div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Side Controls Panel */}
                                    <div className="w-full lg:w-80 flex flex-col gap-4">
                                        {/* Enhanced Status Display */}
                                        <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-4 border border-slate-600/50 shadow-2xl">
                                            <div className="text-center mb-4">
                                                <div className="text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400 mb-2 animate-pulse">
                                                    {extensionLevel.toFixed(1)}%
                                                </div>
                                                <div className="text-slate-400 text-sm font-medium">Current Extension</div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded-lg">
                                                    <span className="text-slate-400 font-medium text-sm">Target:</span>
                                                    <span className="text-blue-400 font-bold">{targetLevel.toFixed(1)}%</span>
                                                </div>
                                                <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded-lg">
                                                    <span className="text-slate-400 font-medium text-sm">Flow Rate:</span>
                                                    <span className="text-yellow-400 font-bold">{flowRate.toFixed(1)} L/min</span>
                                                </div>
                                                <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded-lg">
                                                    <span className="text-slate-400 font-medium text-sm">Speed:</span>
                                                    <span className="text-purple-400 font-bold">{isRunning ? '15 mm/s' : '0 mm/s'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Compact System Metrics */}
                                        <div className="bg-black/40 backdrop-blur-lg rounded-xl p-4 border border-slate-600/50 shadow-2xl">
                                            <h3 className="text-white text-sm font-bold mb-3 flex items-center gap-2">
                                                <Activity className="w-4 h-4 text-blue-400" />
                                                System Metrics
                                            </h3>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <Gauge className="w-3 h-3 text-blue-400" />
                                                        <span className="text-slate-400 text-xs">Pressure</span>
                                                    </div>
                                                    <div className={`text-sm font-bold ${getPressureColor()}`}>
                                                        {pressure.toFixed(0)} PSI
                                                    </div>
                                                </div>
                                                <div className="w-full bg-slate-700/50 rounded-full h-1">
                                                    <div
                                                        className={`h-1 rounded-full transition-all duration-1000 ${pressure > 300 ? 'bg-red-500' : pressure > 200 ? 'bg-yellow-500' : 'bg-green-500'
                                                            }`}
                                                        style={{ width: `${Math.min(pressure / 400 * 100, 100)}%` }}
                                                    ></div>
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <Thermometer className="w-3 h-3 text-orange-400" />
                                                        <span className="text-slate-400 text-xs">Temperature</span>
                                                    </div>
                                                    <div className={`text-sm font-bold ${getTemperatureColor()}`}>
                                                        {temperature.toFixed(1)}°F
                                                    </div>
                                                </div>
                                                <div className="w-full bg-slate-700/50 rounded-full h-1">
                                                    <div
                                                        className={`h-1 rounded-full transition-all duration-1000 ${temperature > 85 ? 'bg-red-500' : temperature > 75 ? 'bg-yellow-500' : 'bg-green-500'
                                                            }`}
                                                        style={{ width: `${Math.min(temperature / 100 * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Compact Operation Mode */}
                                        <div className="bg-black/40 backdrop-blur-lg rounded-xl p-4 border border-slate-600/50 shadow-2xl">
                                            <h3 className="text-white text-sm font-bold mb-3 flex items-center gap-2">
                                                <Settings className="w-4 h-4 text-purple-400" />
                                                Operation Mode
                                            </h3>

                                            <div className="flex gap-2 mb-3">
                                                <button
                                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-300 ${operationMode === 'Manual'
                                                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-500/50 shadow-lg'
                                                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600/50'
                                                        }`}
                                                    onClick={() => setOperationMode('Manual')}
                                                    disabled={emergencyStop}
                                                >
                                                    Manual
                                                </button>
                                                <button
                                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-300 ${operationMode === 'Auto'
                                                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-500/50 shadow-lg'
                                                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600/50'
                                                        }`}
                                                    onClick={() => setOperationMode('Auto')}
                                                    disabled={emergencyStop}
                                                >
                                                    Auto
                                                </button>
                                            </div>

                                            {operationMode === 'Auto' && (
                                                <div className="mb-3">
                                                    <label className="text-slate-400 font-medium mb-2 block text-xs">Target Position:</label>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="100"
                                                        value={targetLevel}
                                                        onChange={(e) => setTargetLevel(parseFloat(e.target.value))}
                                                        className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
                                                        disabled={emergencyStop}
                                                    />
                                                    <div className="text-center text-green-400 font-bold text-sm mt-1">{targetLevel.toFixed(1)}%</div>
                                                </div>
                                            )}

                                            {/* Control Buttons */}
                                            <div className="grid grid-cols-2 gap-2 mb-3">
                                                <button
                                                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 text-white text-xs font-semibold py-2 px-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-1"
                                                    onClick={handleExtend}
                                                    disabled={emergencyStop}
                                                >
                                                    ↑ Extend
                                                </button>
                                                <button
                                                    className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 disabled:from-gray-600 disabled:to-gray-700 text-white text-xs font-semibold py-2 px-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-1"
                                                    onClick={handleRetract}
                                                    disabled={emergencyStop}
                                                >
                                                    ↓ Retract
                                                </button>
                                            </div>

                                            {operationMode === 'Auto' && (
                                                <button
                                                    className={`w-full text-xs font-semibold py-2 px-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 mb-3 ${isRunning
                                                        ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white'
                                                        : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                                                        }`}
                                                    onClick={() => setIsRunning(!isRunning)}
                                                    disabled={emergencyStop}
                                                >
                                                    {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                                    {isRunning ? 'Pause' : 'Start'}
                                                </button>
                                            )}

                                            <button
                                                className={`w-full text-xs font-bold py-3 px-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${emergencyStop
                                                    ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                                                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white animate-pulse'
                                                    }`}
                                                onClick={handleEmergencyStop}
                                            >
                                                {emergencyStop ? <Power className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                                {emergencyStop ? 'RESET' : 'E-STOP'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Cylinder Status Grid Only */}
                        <div className="lg:w-1/2">
                            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-2xl rounded-3xl p-6 lg:p-8 border border-slate-700/50 shadow-2xl h-full">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-3">
                                        Cylinder Status Grid
                                    </h2>
                                    <p className="text-slate-400 text-lg">Real-time Cylinder State Monitoring</p>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                                    {/* Weight Display */}
                                    <div className="col-span-2 sm:col-span-1">
                                        <WeightCard
                                            title="Hopper Weight"
                                            value={data?.loadcell_out || "0"}
                                            unit="kg"
                                        />
                                    </div>

                                    {/* Horizontal Cylinders */}
                                    <CylinderStatusCard
                                        title="Horizontal FWD"
                                        status={data?.horizontal_fwd}
                                        isActive={getCylinderStatus(data?.horizontal_fwd)}
                                    />
                                    <CylinderStatusCard
                                        title="Horizontal REV"
                                        status={data?.horizontal_rev}
                                        isActive={getCylinderStatus(data?.horizontal_rev)}
                                    />

                                    {/* Die Ejector */}
                                    <CylinderStatusCard
                                        title="Die Ejector FWD"
                                        status={data?.die_eject_forward}
                                        isActive={getCylinderStatus(data?.die_eject_forward)}
                                    />
                                    <CylinderStatusCard
                                        title="Die Ejector REV"
                                        status={data?.die_eject_rev}
                                        isActive={getCylinderStatus(data?.die_eject_rev)}
                                    />

                                    {/* Injection Cylinders */}
                                    <CylinderStatusCard
                                        title="Injection FWD"
                                        status={data?.injection_fwd}
                                        isActive={getCylinderStatus(data?.injection_fwd)}
                                    />
                                    <CylinderStatusCard
                                        title="Injection REV"
                                        status={data?.injection_rev}
                                        isActive={getCylinderStatus(data?.injection_rev)}
                                    />

                                    {/* Clamping Cylinders */}
                                    <CylinderStatusCard
                                        title="Clamping FWD"
                                        status={data?.clamping_fwd}
                                        isActive={getCylinderStatus(data?.clamping_fwd)}
                                    />
                                    <CylinderStatusCard
                                        title="Clamping REV"
                                        status={data?.clamping_rev}
                                        isActive={getCylinderStatus(data?.clamping_rev)}
                                    />

                                    {/* Vertical Cylinders */}
                                    <CylinderStatusCard
                                        title="Vertical Down"
                                        status={data?.vertical1_down}
                                        isActive={getCylinderStatus(data?.vertical1_down)}
                                    />
                                    <CylinderStatusCard
                                        title="Vertical UP"
                                        status={data?.vertical1_up}
                                        isActive={getCylinderStatus(data?.vertical1_up)}
                                    />
                                </div>

                                {/* Enhanced Status Footer */}
                                <div className="bg-gradient-to-r from-slate-700/50 to-slate-800/50 backdrop-blur-lg rounded-xl p-4 border border-slate-600/50">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400 font-medium">Last Updated:</span>
                                            <span className="text-white font-semibold">{new Date().toLocaleTimeString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400 font-medium">Load Cell PLC:</span>
                                            <span className="text-blue-400 font-bold">{data?.loadcell_to_plc || "0"}</span>
                                        </div>
                                        {/* <div className="flex justify-between items-center">
                                            <span className="text-slate-400 font-medium">System Health:</span>
                                            <span className="text-green-400 font-bold">98.7%</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400 font-medium">Uptime:</span>
                                            <span className="text-purple-400 font-bold">24h 15m</span>
                                        </div> */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom CSS for slider */}
            <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3b82f6, #1d4ed8);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
          transition: all 0.3s ease;
        }
        
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.8);
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3b82f6, #1d4ed8);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
          transition: all 0.3s ease;
        }
        
        .slider::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.8);
        }
        
        @keyframes ripple {
          0% {
            transform: scale(0.5);
            opacity: 1;
          }
          100% {
            transform: scale(3);
            opacity: 0;
          }
        }
        
        .animate-ripple {
          animation: ripple 1.5s linear forwards;
        }
      `}</style>
        </div>
    );
};

export default EnhancedCylinderDashboard;