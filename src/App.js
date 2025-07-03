import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, Zap, Thermometer, Settings, Power, Gauge, Timer, Factory, Menu, X } from 'lucide-react';
import wax1 from "../src/images/wax1.png"
import wax2 from "../src/images/wax2.png"
import wax3 from "../src/images/wax3.png"
import wax4 from "../src/images/wax4.png"
import wax5 from "../src/images/wax5.png"

import cmtilogo from "../src/images/Logo/CMTILogo.png"
import MHILogo from "../src/images/Logo/MHI3.png"
import PMPLogo from "../src/images/Logo/PMPLogo.png"

import WaxInjectorEnergyDashboard from './Components/EnergyManagement/EM';
import Temperature from './Components/Temperature/Temperature';
import WaxInjectionMachine from './Components/Model/WaxInjectionMachine';
import CylinderStatus from './Components/CylinderStatus/CylinderStatus';

// Home Component
const Home = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Simulated machine images
  const machineImages = [
    wax1,
    wax2,
    wax3,
    wax4,
    wax5
  ];

  useEffect(() => {
    setIsLoaded(true);
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % machineImages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const machineSpecs = [
    { icon: <Factory className="w-5 h-5" />, label: "Model", value: "PHWIP-35" },
    { icon: <Gauge className="w-5 h-5" />, label: "Max Pressure", value: "150 Bar" },
    { icon: <Thermometer className="w-5 h-5" />, label: "Temperature", value: "80-120°C" },
    { icon: <Timer className="w-5 h-5" />, label: "Cycle Time", value: "15-45 sec" },
    { icon: <Power className="w-5 h-5" />, label: "Power", value: "15 KW" },
    { icon: <Settings className="w-5 h-5" />, label: "Control", value: "PLC Based" }
  ];

  
  return (
    <main className="flex-1 relative z-10 px-6 py-8 lg:py-12 lg:pl-0 pl-20">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[calc(100vh-200px)]">

          {/* Left Side - Content */}
          <div className={`space-y-6 lg:space-y-8 transform transition-all duration-1000 delay-500 ${isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>

            {/* Title Section */}
            <div className="space-y-4 lg:space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold bg-gradient-to-r from-white via-green-100 to-teal-200 bg-clip-text text-transparent leading-tight">
                4-Pillar Horizontal
                <span className="block text-green-400">Wax Injection</span>
                <span className="block text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-gray-300">Machine</span>
              </h1>

              <p className="text-lg lg:text-xl text-gray-300 leading-relaxed">
                Experience unparalleled precision in wax injection technology. Our state-of-the-art 4-pillar horizontal design delivers consistent performance,
                exceptional quality, and industry-leading efficiency for your manufacturing needs.
              </p>
            </div>

            {/* Specifications Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {machineSpecs.map((spec, index) => (
                <div
                  key={spec.label}
                  className={`group bg-gradient-to-br from-black/40 to-gray-900/40 backdrop-blur-lg rounded-2xl p-4 lg:p-6 border border-green-500/20 hover:border-green-400/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                  style={{ transitionDelay: `${800 + index * 100}ms` }}
                >
                  <div className="flex items-center space-x-3 lg:space-x-4">
                    <div className="bg-gradient-to-r from-green-500 to-teal-500 p-2 lg:p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      {spec.icon}
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs lg:text-sm font-medium">{spec.label}</p>
                      <p className="text-white text-base lg:text-lg font-bold">{spec.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 lg:pt-6">
              <button className="group flex items-center justify-center space-x-3 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-2xl font-semibold shadow-2xl shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300 hover:scale-105 transform">
                <span>Start Dashboard</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button className="flex items-center justify-center space-x-3 bg-white/10 backdrop-blur-lg hover:bg-white/20 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-2xl font-semibold border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 transform">
                <Settings className="w-5 h-5" />
                <span>Configuration</span>
              </button>
            </div>
          </div>

          {/* Right Side - Machine Images */}
          <div className={`relative transform transition-all duration-1000 delay-700 ${isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>

            {/* Main Image Container */}
            <div className="relative">

              {/* Glowing Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-teal-500 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>

              {/* Image Container - Increased height */}
              <div className="relative bg-gradient-to-br from-gray-800 to-black rounded-3xl p-4 lg:p-8 border border-green-500/30 overflow-hidden min-h-[500px] lg:min-h-[600px]">

                {/* Animated Border */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-teal-500 to-green-500 rounded-3xl opacity-30 animate-pulse"></div>
                <div className="absolute inset-[2px] bg-gradient-to-br from-gray-800 to-black rounded-3xl"></div>

                {/* Image - Adjusted for taller container */}
                <div className="relative z-10 aspect-[4/5] lg:aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl h-[400px] lg:h-[480px]">
                  <img
                    src={machineImages[currentImageIndex]}
                    alt="Wax Injection Machine"
                    className="w-full h-full object-cover object-center transition-all duration-500 hover:scale-110"
                  />
                </div>

                {/* Status Indicators */}
                <div className="relative z-10 mt-4 lg:mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                  <div className="flex flex-wrap gap-3 lg:gap-4">
                    {['Online', 'Ready', 'Optimized'].map((status, index) => (
                      <div key={status} className="flex items-center space-x-2">
                        <div className={`w-2 lg:w-3 h-2 lg:h-3 rounded-full animate-pulse ${index === 0 ? 'bg-green-400' : index === 1 ? 'bg-teal-400' : 'bg-blue-400'
                          }`}></div>
                        <span className="text-gray-300 text-xs lg:text-sm font-medium">{status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 lg:-top-6 -right-4 lg:-right-6 bg-gradient-to-r from-teal-500 to-green-500 rounded-2xl p-3 lg:p-4 shadow-2xl shadow-teal-500/30 animate-bounce">
                <Zap className="w-5 lg:w-6 h-5 lg:h-6 text-white" />
              </div>

              <div className="absolute -bottom-4 lg:-bottom-6 -left-4 lg:-left-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-3 lg:p-4 shadow-2xl shadow-green-500/30 animate-bounce delay-500">
                <Gauge className="w-5 lg:w-6 h-5 lg:h-6 text-white" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
};

// Layout Component
const Layout = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const navItems = [
    { name: "Home", icon: <Factory className="w-5 h-5" />, path: "/" },
    { name: "Energy Management", icon: <Zap className="w-5 h-5" />, path: "/energy-management" },
    { name: "Temperature", icon: <Thermometer className="w-5 h-5" />, path: "/temperature" },
    { name: "Cylinder Status", icon: <Settings className="w-5 h-5" />, path: "/cylinder-status" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 overflow-hidden flex">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl animate-bounce"></div>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-6 left-6 z-50 bg-gradient-to-r from-green-500 to-teal-500 p-3 rounded-xl shadow-2xl transition-all duration-300 hover:scale-105"
      >
        {isSidebarOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
      </button>

      {/* Left Sidebar */}
      <div className={`fixed lg:relative z-40 h-full transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
        <div className="w-80 h-full backdrop-blur-lg bg-black/40 border-r border-green-500/20 flex flex-col">

          {/* Sidebar Header */}
          <div className={`p-8 border-b border-green-500/20 transform transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
            <div className="flex items-center space-x-4 mb-6">
              <div>
                <img
                  src={cmtilogo}
                  alt="Factory"
                  className="w-28 h-24 object-contain"
                />
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">Central Manufacturing</h2>
                <p className="text-green-400 text-sm font-medium">Technology Institute</p>
              </div>
            </div>

            {/* Status Badge */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500/20 to-teal-500/20 backdrop-blur-lg rounded-full px-4 py-2 border border-green-500/30">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-medium text-sm">System Online</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6">
            <div className="space-y-3">
              {navItems.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.name}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] transform ${isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'} ${isActive
                      ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg shadow-green-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/10 border border-transparent hover:border-green-500/20'
                      }`}
                    style={{ transitionDelay: `${300 + index * 100}ms` }}
                  >
                    <div className={`p-2 rounded-xl ${isActive ? 'bg-white/20' : 'bg-gradient-to-r from-green-500/20 to-teal-500/20'}`}>
                      {item.icon}
                    </div>
                    <span className="font-medium text-left flex-1">{item.name}</span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'rotate-90' : ''}`} />
                  </button>
                );
              })}
            </div>
          </nav>

          {/* System Status */}
          <div className="p-6 border-t border-green-500/20 space-y-4">
            {/* Mode Indicator */}
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm font-medium">Mode</span>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">Auto</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                  <span className="text-gray-500 text-sm">Manual</span>
                </div>
              </div>
            </div>

            {/* Cycle Time */}
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm font-medium">Cycle Time</span>
              <div className="bg-gradient-to-r from-green-500/20 to-teal-500/20 backdrop-blur-lg rounded-lg px-3 py-1 border border-green-500/30">
                <span className="text-green-400 font-mono text-sm">02:34:17</span>
              </div>
            </div>

            {/* Job Count */}
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm font-medium">Job Count</span>
              <div className="bg-gradient-to-r from-green-500/20 to-teal-500/20 backdrop-blur-lg rounded-lg px-3 py-1 border border-green-500/30">
                <span className="text-green-400 font-bold text-sm">1,247</span>
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t border-green-500/20">
            <div className="text-center">
              <h3 className="text-gray-400 text-xs font-medium mb-3 uppercase tracking-wide">Industry Partner</h3>
              <p className="text-green-400 text-sm font-medium mb-4">Powered by</p>
              <div className="flex justify-center">
                <img
                  src={PMPLogo}
                  alt="Industry Partner"
                  className="h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity duration-300"
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen relative">

        {/* Right Logo - Positioned in body */}
        <div className="absolute top-6 right-6 z-20">
          <div className={`transform transition-all duration-1000 delay-100 ${isLoaded ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
            <div>
              <img
                src={MHILogo}
                alt="Factory"
                className="w-24 h-auto md:w-28 lg:w-20 xl:w-36 object-contain"
                style={{ filter: 'drop-shadow(0 0 1px white)' }}
              />
            </div>
          </div>
        </div>

        {/* Page Content */}
        {children}
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-green-400 rounded-full animate-pulse opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

// Main App Component with Router
const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/energy-management" element={<WaxInjectorEnergyDashboard />} />
          <Route path="/temperature" element={<Temperature />} />
          <Route path="/cylinder-status" element={<CylinderStatus />} />
          <Route path="/waxinjection" element={<WaxInjectionMachine />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;