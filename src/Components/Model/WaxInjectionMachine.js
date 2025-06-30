import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';

const WaxInjectionMachine = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const frameRef = useRef(null);
  
  // Machine state
  const [machineState, setMachineState] = useState({
    clampPosition: 0, // 0 = up, 1 = down
    nozzlePosition: 0, // 0 = retracted, 1 = extended
    nozzleHeight: 0.5, // 0 = bottom, 1 = top
    injectionActive: false,
    suction: false,
    stirrerRotation: 0,
    ejectorPosition: 0, // 0 = retracted, 1 = extended
    temperature: 85, // Celsius
    pressure: 2.5, // Bar
    waxLevel: 0.7, // 0 = empty, 1 = full
    heatingElement: false,
    coolingSystem: false,
    safetyDoors: false,
    machineRunning: false,
    cycleCount: 0,
    powerOn: false
  });
  
  // Component refs for animation
  const componentsRef = useRef({});
  const animationSpeed = useRef(1);
  
  useEffect(() => {
    if (!mountRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;
    
    // Camera setup - positioned further back for larger machine
    const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
    camera.position.set(12, 8, 12);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;
    
    // Renderer setup with enhanced settings
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(800, 600);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.physicallyCorrectLights = true;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);
    
    // Enhanced lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 1.2);
    scene.add(ambientLight);
    
    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
    directionalLight.position.set(20, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -25;
    directionalLight.shadow.camera.right = 25;
    directionalLight.shadow.camera.top = 25;
    directionalLight.shadow.camera.bottom = -25;
    scene.add(directionalLight);
    
    // Additional fill lights
    const fillLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    fillLight1.position.set(-15, 15, -10);
    scene.add(fillLight1);
    
    const fillLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
    fillLight2.position.set(10, -10, 15);
    scene.add(fillLight2);
    
    // Spot lights for dramatic effect
    const spotLight1 = new THREE.SpotLight(0xffffff, 1.5);
    spotLight1.position.set(0, 15, 0);
    spotLight1.target.position.set(0, 0, 0);
    spotLight1.angle = Math.PI / 4;
    spotLight1.penumbra = 0.3;
    spotLight1.castShadow = true;
    scene.add(spotLight1);
    scene.add(spotLight1.target);
    
    // Enhanced materials with better reflection and metallic properties
    const materials = {
      frame: new THREE.MeshStandardMaterial({ 
        color: 0x2d5a5a, 
        metalness: 0.3, 
        roughness: 0.4,
        envMapIntensity: 0.5
      }),
      steel: new THREE.MeshStandardMaterial({ 
        color: 0x888888, 
        metalness: 0.8, 
        roughness: 0.2,
        envMapIntensity: 1.0
      }),
      controlPanel: new THREE.MeshStandardMaterial({ 
        color: 0xdddddd, 
        metalness: 0.1, 
        roughness: 0.3
      }),
      wax: new THREE.MeshStandardMaterial({ 
        color: 0xffaa00, 
        transparent: true, 
        opacity: 0.9,
        metalness: 0.0,
        roughness: 0.1
      }),
      tank: new THREE.MeshStandardMaterial({ 
        color: 0x4a4a4a, 
        metalness: 0.7, 
        roughness: 0.3
      }),
      hydraulic: new THREE.MeshStandardMaterial({ 
        color: 0x1a4a1a, 
        metalness: 0.4, 
        roughness: 0.4
      }),
      nozzle: new THREE.MeshStandardMaterial({ 
        color: 0x333333, 
        metalness: 0.9, 
        roughness: 0.1
      }),
      heated: new THREE.MeshStandardMaterial({
        color: 0xff4400,
        emissive: 0x330000
      })
    };
    
    // Larger base platform (scaled up 2x)
    const baseGeometry = new THREE.BoxGeometry(8, 0.4, 6);
    const base = new THREE.Mesh(baseGeometry, materials.frame);
    base.position.y = -2;
    base.receiveShadow = true;
    scene.add(base);
    
    // Main frame pillars (scaled up)
    const pillarGeometry = new THREE.CylinderGeometry(0.16, 0.16, 6);
    const pillars = [];
    const pillarPositions = [
      [-3, 1, -2], [3, 1, -2], 
      [-3, 1, 2], [3, 1, 2]
    ];
    
    pillarPositions.forEach((pos, i) => {
      const pillar = new THREE.Mesh(pillarGeometry, materials.frame);
      pillar.position.set(...pos);
      pillar.castShadow = true;
      pillars.push(pillar);
      scene.add(pillar);
    });
    
    // Top plate (fixed) - larger
    const topPlateGeometry = new THREE.BoxGeometry(6.4, 0.6, 4.4);
    const topPlate = new THREE.Mesh(topPlateGeometry, materials.steel);
    topPlate.position.set(0, 4, 0);
    topPlate.castShadow = true;
    scene.add(topPlate);
    
    // Bottom plate (movable - clamping) - larger
    const bottomPlateGeometry = new THREE.BoxGeometry(6.4, 0.6, 4.4);
    const bottomPlate = new THREE.Mesh(bottomPlateGeometry, materials.steel);
    bottomPlate.position.set(0, -0.6, 0);
    bottomPlate.castShadow = true;
    scene.add(bottomPlate);
    componentsRef.current.bottomPlate = bottomPlate;
    
    // Hydraulic cylinders for clamping - larger
    const cylinderGeometry = new THREE.CylinderGeometry(0.24, 0.24, 2);
    const clampCylinders = [];
    pillarPositions.forEach((pos) => {
      const cylinder = new THREE.Mesh(cylinderGeometry, materials.hydraulic);
      cylinder.position.set(pos[0], 3, pos[2]);
      cylinder.castShadow = true;
      clampCylinders.push(cylinder);
      scene.add(cylinder);
    });
    componentsRef.current.clampCylinders = clampCylinders;
    
    // Larger wax tank
    const tankGeometry = new THREE.CylinderGeometry(1.2, 1.2, 2.4);
    const waxTank = new THREE.Mesh(tankGeometry, materials.tank);
    waxTank.position.set(-5, 1, 0);
    waxTank.castShadow = true;
    scene.add(waxTank);
    
    // Wax inside tank - larger
    const waxGeometry = new THREE.CylinderGeometry(1.1, 1.1, 1.6);
    const waxInTank = new THREE.Mesh(waxGeometry, materials.wax);
    waxInTank.position.set(-5, 0.6, 0);
    scene.add(waxInTank);
    componentsRef.current.waxInTank = waxInTank;
    
    // Stirrer in tank - larger
    const stirrerGeometry = new THREE.BoxGeometry(0.04, 1.6, 1.6);
    const stirrer = new THREE.Mesh(stirrerGeometry, materials.steel);
    stirrer.position.set(-5, 1, 0);
    scene.add(stirrer);
    componentsRef.current.stirrer = stirrer;
    
    // Heating element around tank
    const heatingElementGeometry = new THREE.TorusGeometry(1.3, 0.05, 8, 32);
    const heatingElement = new THREE.Mesh(heatingElementGeometry, materials.heated);
    heatingElement.position.set(-5, 1, 0);
    heatingElement.rotation.x = Math.PI / 2;
    scene.add(heatingElement);
    componentsRef.current.heatingElement = heatingElement;
    
    // Injection system housing - larger
    const injectionHousingGeometry = new THREE.BoxGeometry(3, 1.6, 1.6);
    const injectionHousing = new THREE.Mesh(injectionHousingGeometry, materials.steel);
    injectionHousing.position.set(0, 1.6, -3.6);
    injectionHousing.castShadow = true;
    scene.add(injectionHousing);
    
    // Nozzle assembly - larger
    const nozzleBaseGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1);
    const nozzleBase = new THREE.Mesh(nozzleBaseGeometry, materials.nozzle);
    nozzleBase.position.set(0, 1.6, -2.4);
    nozzleBase.rotation.x = Math.PI / 2;
    scene.add(nozzleBase);
    componentsRef.current.nozzleBase = nozzleBase;
    
    // Nozzle tip - larger
    const nozzleTipGeometry = new THREE.ConeGeometry(0.1, 0.6);
    const nozzleTip = new THREE.Mesh(nozzleTipGeometry, materials.nozzle);
    nozzleTip.position.set(0, 1.6, -1.6);
    nozzleTip.rotation.x = Math.PI / 2;
    scene.add(nozzleTip);
    componentsRef.current.nozzleTip = nozzleTip;
    
    // Wax flow visualization
    const waxFlowGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.8);
    const waxFlow = new THREE.Mesh(waxFlowGeometry, materials.wax);
    waxFlow.position.set(0, 1.6, -1.2);
    waxFlow.visible = false;
    scene.add(waxFlow);
    componentsRef.current.waxFlow = waxFlow;
    
    // Vertical adjustment mechanism for nozzle - larger
    const nozzleSlideGeometry = new THREE.BoxGeometry(0.6, 3, 0.6);
    const nozzleSlide = new THREE.Mesh(nozzleSlideGeometry, materials.steel);
    nozzleSlide.position.set(0, 1.6, -3.6);
    scene.add(nozzleSlide);
    
    // Control panel - larger
    const controlPanelGeometry = new THREE.BoxGeometry(2.4, 3, 0.2);
    const controlPanel = new THREE.Mesh(controlPanelGeometry, materials.controlPanel);
    controlPanel.position.set(5, 1, 0);
    controlPanel.castShadow = true;
    scene.add(controlPanel);
    
    // Safety doors
    const doorGeometry = new THREE.BoxGeometry(3, 3, 0.1);
    const leftDoor = new THREE.Mesh(doorGeometry, materials.controlPanel);
    leftDoor.position.set(-1.5, 2, 2.5);
    scene.add(leftDoor);
    const rightDoor = new THREE.Mesh(doorGeometry, materials.controlPanel);
    rightDoor.position.set(1.5, 2, 2.5);
    scene.add(rightDoor);
    componentsRef.current.doors = [leftDoor, rightDoor];
    
    // Ejector pins (in bottom plate) - larger
    const ejectorGeometry = new THREE.CylinderGeometry(0.04, 0.04, 1);
    const ejectors = [];
    for (let i = -1; i <= 1; i += 0.5) {
      for (let j = -1; j <= 1; j += 0.5) {
        const ejector = new THREE.Mesh(ejectorGeometry, materials.steel);
        ejector.position.set(i, -0.2, j);
        ejectors.push(ejector);
        scene.add(ejector);
      }
    }
    componentsRef.current.ejectors = ejectors;
    
    // Mold (example) - larger
    const moldGeometry = new THREE.BoxGeometry(1.6, 0.8, 1.6);
    const mold = new THREE.Mesh(moldGeometry, materials.steel);
    mold.position.set(0, 0.2, 0);
    scene.add(mold);
    
    // Cooling lines
    const coolingGeometry = new THREE.TorusGeometry(0.8, 0.02, 8, 32);
    const coolingLines = new THREE.Mesh(coolingGeometry, materials.steel);
    coolingLines.position.set(0, 0.2, 0);
    coolingLines.rotation.x = Math.PI / 2;
    scene.add(coolingLines);
    componentsRef.current.coolingLines = coolingLines;
    
    // Pressure gauges
    const gaugeGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1);
    const pressureGauge = new THREE.Mesh(gaugeGeometry, materials.controlPanel);
    pressureGauge.position.set(5, 2, 0.5);
    pressureGauge.rotation.z = Math.PI / 2;
    scene.add(pressureGauge);
    
    const tempGauge = new THREE.Mesh(gaugeGeometry, materials.controlPanel);
    tempGauge.position.set(5, 1.5, 0.5);
    tempGauge.rotation.z = Math.PI / 2;
    scene.add(tempGauge);
    
    // Status lights
    const lightGeometry = new THREE.SphereGeometry(0.1);
    const powerLight = new THREE.Mesh(lightGeometry, new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
    powerLight.position.set(5, 2.5, 0.5);
    scene.add(powerLight);
    componentsRef.current.powerLight = powerLight;
    
    const warningLight = new THREE.Mesh(lightGeometry, new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    warningLight.position.set(5, 2.3, 0.5);
    scene.add(warningLight);
    componentsRef.current.warningLight = warningLight;
    
    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      // Update stirrer rotation
      if (componentsRef.current.stirrer) {
        componentsRef.current.stirrer.rotation.y = machineState.stirrerRotation;
      }
      
      // Update heating element glow
      if (componentsRef.current.heatingElement) {
        if (machineState.heatingElement) {
          componentsRef.current.heatingElement.material.emissive.setHex(0x440000);
        } else {
          componentsRef.current.heatingElement.material.emissive.setHex(0x000000);
        }
      }
      
      // Update status lights
      if (componentsRef.current.powerLight) {
        componentsRef.current.powerLight.visible = machineState.powerOn;
      }
      
      if (componentsRef.current.warningLight) {
        componentsRef.current.warningLight.visible = machineState.injectionActive || machineState.clampPosition > 0.5;
      }
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Enhanced mouse controls for camera
    let mouseDown = false;
    let mouseX = 0;
    let mouseY = 0;
    
    const handleMouseDown = (event) => {
      mouseDown = true;
      mouseX = event.clientX;
      mouseY = event.clientY;
    };
    
    const handleMouseUp = () => {
      mouseDown = false;
    };
    
    const handleMouseMove = (event) => {
      if (!mouseDown) return;
      
      const deltaX = event.clientX - mouseX;
      const deltaY = event.clientY - mouseY;
      
      // Rotate camera around the center
      const spherical = new THREE.Spherical();
      spherical.setFromVector3(camera.position);
      spherical.theta -= deltaX * 0.01;
      spherical.phi += deltaY * 0.01;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
      
      camera.position.setFromSpherical(spherical);
      camera.lookAt(0, 0, 0);
      
      mouseX = event.clientX;
      mouseY = event.clientY;
    };
    
    const handleWheel = (event) => {
      const scale = event.deltaY > 0 ? 1.1 : 0.9;
      camera.position.multiplyScalar(scale);
      camera.position.clampLength(5, 50);
    };
    
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('wheel', handleWheel);
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);
  
  // Update machine components based on state
  useEffect(() => {
    if (!componentsRef.current) return;
    
    // Update clamping position
    if (componentsRef.current.bottomPlate) {
      const targetY = -0.6 + (machineState.clampPosition * 3);
      componentsRef.current.bottomPlate.position.y = targetY;
    }
    
    // Update hydraulic cylinders
    if (componentsRef.current.clampCylinders) {
      componentsRef.current.clampCylinders.forEach(cylinder => {
        cylinder.scale.y = 1 + (machineState.clampPosition * 0.5);
      });
    }
    
    // Update nozzle position and height
    if (componentsRef.current.nozzleBase && componentsRef.current.nozzleTip) {
      const nozzleZ = -2.4 + (machineState.nozzlePosition * 1.2);
      const nozzleY = 0.6 + (machineState.nozzleHeight * 2.0);
      
      componentsRef.current.nozzleBase.position.z = nozzleZ;
      componentsRef.current.nozzleBase.position.y = nozzleY;
      componentsRef.current.nozzleTip.position.z = nozzleZ + 0.8;
      componentsRef.current.nozzleTip.position.y = nozzleY;
    }
    
    // Update wax flow visualization
    if (componentsRef.current.waxFlow) {
      componentsRef.current.waxFlow.visible = machineState.injectionActive;
      if (machineState.injectionActive) {
        const nozzleZ = -2.4 + (machineState.nozzlePosition * 1.2);
        const nozzleY = 0.6 + (machineState.nozzleHeight * 2.0);
        componentsRef.current.waxFlow.position.z = nozzleZ + 0.4;
        componentsRef.current.waxFlow.position.y = nozzleY - 0.4;
      }
    }
    
    // Update ejector position
    if (componentsRef.current.ejectors) {
      componentsRef.current.ejectors.forEach(ejector => {
        ejector.position.y = -0.2 + (machineState.ejectorPosition * 0.6);
      });
    }
    
    // Update wax level
    if (componentsRef.current.waxInTank) {
      const scale = machineState.waxLevel;
      componentsRef.current.waxInTank.scale.y = scale;
      componentsRef.current.waxInTank.position.y = 0.2 + (scale * 0.8);
    }
    
    // Update safety doors
    if (componentsRef.current.doors) {
      const doorAngle = machineState.safetyDoors ? Math.PI / 3 : 0;
      componentsRef.current.doors[0].rotation.y = doorAngle;
      componentsRef.current.doors[1].rotation.y = -doorAngle;
    }
    
    // Continuous stirrer rotation when machine is running
    if (machineState.machineRunning || machineState.powerOn) {
      setMachineState(prev => ({
        ...prev,
        stirrerRotation: prev.stirrerRotation + (0.02 * animationSpeed.current)
      }));
    }
  }, [machineState.clampPosition, machineState.nozzlePosition, machineState.nozzleHeight, 
      machineState.ejectorPosition, machineState.waxLevel, machineState.safetyDoors,
      machineState.injectionActive, machineState.heatingElement, machineState.powerOn]);
  
  const handleControl = (control, value) => {
    setMachineState(prev => ({
      ...prev,
      [control]: value
    }));
  };
  
  const runAutoSequence = async () => {
    setMachineState(prev => ({ ...prev, machineRunning: true }));
    
    const steps = [
      () => handleControl('powerOn', true),
      () => new Promise(resolve => setTimeout(resolve, 500)),
      () => handleControl('heatingElement', true),
      () => new Promise(resolve => setTimeout(resolve, 1000)),
      () => handleControl('safetyDoors', true),
      () => new Promise(resolve => setTimeout(resolve, 500)),
      () => handleControl('clampPosition', 1),
      () => new Promise(resolve => setTimeout(resolve, 1500)),
      () => handleControl('suction', true),
      () => new Promise(resolve => setTimeout(resolve, 500)),
      () => handleControl('nozzlePosition', 1),
      () => new Promise(resolve => setTimeout(resolve, 800)),
      () => handleControl('injectionActive', true),
      () => new Promise(resolve => setTimeout(resolve, 3000)),
      () => handleControl('injectionActive', false),
      () => handleControl('coolingSystem', true),
      () => new Promise(resolve => setTimeout(resolve, 2000)),
      () => handleControl('nozzlePosition', 0),
      () => new Promise(resolve => setTimeout(resolve, 800)),
      () => handleControl('clampPosition', 0),
      () => new Promise(resolve => setTimeout(resolve, 1000)),
      () => handleControl('ejectorPosition', 1),
      () => new Promise(resolve => setTimeout(resolve, 800)),
      () => handleControl('ejectorPosition', 0),
      () => handleControl('suction', false),
      () => handleControl('coolingSystem', false),
      () => handleControl('safetyDoors', false),
      () => handleControl('heatingElement', false),
      () => setMachineState(prev => ({ ...prev, cycleCount: prev.cycleCount + 1, machineRunning: false }))
    ];
    
    for (const step of steps) {
      await step();
    }
  };
  
  const emergencyStop = () => {
    setMachineState(prev => ({
      ...prev,
      clampPosition: 0,
      nozzlePosition: 0,
      injectionActive: false,
      suction: false,
      ejectorPosition: 0,
      heatingElement: false,
      coolingSystem: false,
      machineRunning: false,
      powerOn: false
    }));
  };
  
  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 bg-gray-900 min-h-screen">
      {/* 3D Viewer */}
      <div className="flex-1">
        <div className="bg-black rounded-lg overflow-hidden shadow-lg">
          <div ref={mountRef} className="w-full h-[600px]" />
        </div>
        
        {/* Component Labels */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div className="bg-gray-800 p-2 rounded text-white">
            <div className="w-3 h-3 bg-teal-600 rounded mb-1"></div>
            <span>Main Frame</span>
          </div>
          <div className="bg-gray-800 p-2 rounded text-white">
            <div className="w-3 h-3 bg-gray-500 rounded mb-1"></div>
            <span>Clamping System</span>
          </div>
          <div className="bg-gray-800 p-2 rounded text-white">
            <div className="w-3 h-3 bg-green-700 rounded mb-1"></div>
            <span>Hydraulic System</span>
          </div>
          <div className="bg-gray-800 p-2 rounded text-white">
            <div className="w-3 h-3 bg-orange-500 rounded mb-1"></div>
            <span>Wax Tank & Heater</span>
          </div>
          <div className="bg-gray-800 p-2 rounded text-white">
            <div className="w-3 h-3 bg-gray-800 rounded mb-1"></div>
            <span>Injection Nozzle</span>
          </div>
          <div className="bg-gray-800 p-2 rounded text-white">
            <div className="w-3 h-3 bg-gray-300 rounded mb-1"></div>
            <span>Control Panel</span>
          </div>
          <div className="bg-gray-800 p-2 rounded text-white">
            <div className="w-3 h-3 bg-gray-600 rounded mb-1"></div>
            <span>Ejector System</span>
          </div>
          <div className="bg-gray-800 p-2 rounded text-white">
            <div className="w-3 h-3 bg-blue-500 rounded mb-1"></div>
            <span>Safety Doors</span>
          </div>
        </div>
      </div>
      
      {/* Control Panel */}
      <div className="w-full lg:w-80 space-y-4">
        {/* Main Power */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-bold text-white mb-4">Main Power</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => handleControl('powerOn', !machineState.powerOn)}
              className={`flex-1 py-3 rounded font-bold ${machineState.powerOn ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
            >
              {machineState.powerOn ? 'POWER ON' : 'POWER OFF'}
            </button>
            <button
              onClick={emergencyStop}
              className="px-4 py-3 bg-red-800 text-white rounded font-bold hover:bg-red-700"
            >
              E-STOP
            </button>
          </div>
        </div>
        
        {/* Manual Controls */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-bold text-white mb-4">Manual Controls</h2>
          
          {/* Heating System */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Heating Element
            </label>
            <button
              onClick={() => handleControl('heatingElement', !machineState.heatingElement)}
              className={`w-full py-2 rounded text-sm font-medium ${machineState.heatingElement ? 'bg-orange-600 text-white' : 'bg-gray-600 text-gray-300'}`}
            >
              {machineState.heatingElement ? 'HEATING ON' : 'HEATING OFF'}
            </button>
          </div>
          
          {/* Safety Doors */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Safety Doors
            </label>
            <button
              onClick={() => handleControl('safetyDoors', !machineState.safetyDoors)}
              className={`w-full py-2 rounded text-sm font-medium ${machineState.safetyDoors ? 'bg-yellow-600 text-white' : 'bg-gray-600 text-gray-300'}`}
            >
              {machineState.safetyDoors ? 'DOORS OPEN' : 'DOORS CLOSED'}
            </button>
          </div>
          
          {/* Clamping Control */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Clamping Position
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => handleControl('clampPosition', 0)}
                className={`px-3 py-2 rounded text-sm ${machineState.clampPosition === 0 ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'}`}
              >
                UP
              </button>
              <button
                onClick={() => handleControl('clampPosition', 1)}
                className={`px-3 py-2 rounded text-sm ${machineState.clampPosition === 1 ? 'bg-red-600 text-white' : 'bg-gray-600 text-gray-300'}`}
              >
                DOWN
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={machineState.clampPosition}
              onChange={(e) => handleControl('clampPosition', parseFloat(e.target.value))}
              className="w-full mt-2"
            />
          </div>
          
          {/* Nozzle Horizontal Position */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nozzle Horizontal Position
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={machineState.nozzlePosition}
              onChange={(e) => handleControl('nozzlePosition', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Retracted</span>
              <span>Extended</span>
            </div>
          </div>
          
          {/* Nozzle Height */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nozzle Height Adjustment
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={machineState.nozzleHeight}
              onChange={(e) => handleControl('nozzleHeight', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Bottom</span>
              <span>Top</span>
            </div>
          </div>
          
          {/* Injection Control */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Wax Injection
            </label>
            <button
              onClick={() => handleControl('injectionActive', !machineState.injectionActive)}
              className={`w-full py-2 rounded text-sm font-medium ${machineState.injectionActive ? 'bg-orange-600 text-white animate-pulse' : 'bg-gray-600 text-gray-300'}`}
            >
              {machineState.injectionActive ? 'INJECTING WAX' : 'START INJECTION'}
            </button>
          </div>
          
          {/* Cooling System */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cooling System
            </label>
            <button
              onClick={() => handleControl('coolingSystem', !machineState.coolingSystem)}
              className={`w-full py-2 rounded text-sm font-medium ${machineState.coolingSystem ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'}`}
            >
              {machineState.coolingSystem ? 'COOLING ON' : 'COOLING OFF'}
            </button>
          </div>
          
          {/* Ejector Control */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ejector Pins
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={machineState.ejectorPosition}
              onChange={(e) => handleControl('ejectorPosition', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Retracted</span>
              <span>Extended</span>
            </div>
          </div>
          
          {/* Suction Control */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Vacuum Suction
            </label>
            <button
              onClick={() => handleControl('suction', !machineState.suction)}
              className={`w-full py-2 rounded text-sm font-medium ${machineState.suction ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-300'}`}
            >
              {machineState.suction ? 'SUCTION ON' : 'SUCTION OFF'}
            </button>
          </div>
          
          {/* Auto Sequence */}
          <div className="mb-4">
            <button
              onClick={runAutoSequence}
              disabled={machineState.machineRunning}
              className={`w-full py-3 rounded font-bold ${machineState.machineRunning ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              {machineState.machineRunning ? 'RUNNING AUTO SEQUENCE...' : 'RUN AUTO SEQUENCE'}
            </button>
          </div>
        </div>
        
        {/* Status Display */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-bold text-white mb-3">Machine Status</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Power Status:</span>
              <span className={machineState.powerOn ? 'text-green-400' : 'text-red-400'}>
                {machineState.powerOn ? 'ON' : 'OFF'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Temperature:</span>
              <span className={machineState.heatingElement ? 'text-red-400' : 'text-green-400'}>
                {machineState.temperature}°C
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Pressure:</span>
              <span className="text-blue-400">{machineState.pressure} Bar</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Wax Level:</span>
              <span className="text-orange-400">{Math.round(machineState.waxLevel * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Suction:</span>
              <span className={machineState.suction ? 'text-purple-400' : 'text-gray-400'}>
                {machineState.suction ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Cooling:</span>
              <span className={machineState.coolingSystem ? 'text-blue-400' : 'text-gray-400'}>
                {machineState.coolingSystem ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Safety Doors:</span>
              <span className={machineState.safetyDoors ? 'text-yellow-400' : 'text-green-400'}>
                {machineState.safetyDoors ? 'OPEN' : 'CLOSED'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Cycle Count:</span>
              <span className="text-white">{machineState.cycleCount}</span>
            </div>
          </div>
        </div>
        
        {/* Process Parameters */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-bold text-white mb-3">Process Parameters</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Injection Temperature</label>
              <input
                type="range"
                min="70"
                max="120"
                value={machineState.temperature}
                onChange={(e) => handleControl('temperature', parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>70°C</span>
                <span>120°C</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-300 mb-1">Injection Pressure</label>
              <input
                type="range"
                min="1"
                max="5"
                step="0.1"
                value={machineState.pressure}
                onChange={(e) => handleControl('pressure', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>1 Bar</span>
                <span>5 Bar</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-300 mb-1">Wax Tank Level</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={machineState.waxLevel}
                onChange={(e) => handleControl('waxLevel', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>10%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Machine Specifications */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-bold text-white mb-3">PHWIP-20 Enhanced Specifications</h3>
          <div className="space-y-1 text-xs text-gray-300">
            <div className="flex justify-between">
              <span>Clamping Force:</span>
              <span className="text-white">20 Ton</span>
            </div>
            <div className="flex justify-between">
              <span>Injection Force:</span>
              <span className="text-white">5 Ton</span>
            </div>
            <div className="flex justify-between">
              <span>Single Shot:</span>
              <span className="text-white">2000 cc</span>
            </div>
            <div className="flex justify-between">
              <span>Wax Tank Capacity:</span>
              <span className="text-white">30 Ltr</span>
            </div>
            <div className="flex justify-between">
              <span>Power Consumption:</span>
              <span className="text-white">8 KVA</span>
            </div>
            <div className="flex justify-between">
              <span>Daylight Opening:</span>
              <span className="text-white">550 mm</span>
            </div>
            <div className="flex justify-between">
              <span>Machine Weight:</span>
              <span className="text-white">2500 Kg</span>
            </div>
            <div className="flex justify-between">
              <span>Dimensions (L×W×H):</span>
              <span className="text-white">2.5×1.8×2.2 m</span>
            </div>
          </div>
        </div>
        
        {/* Controls Info */}
        <div className="bg-gray-700 rounded-lg p-3">
          <h4 className="text-sm font-bold text-white mb-2">3D View Controls</h4>
          <div className="text-xs text-gray-300 space-y-1">
            <div>• Click & drag to rotate view</div>
            <div>• Mouse wheel to zoom in/out</div>
            <div>• Use manual controls to operate machine</div>
            <div>• Run auto sequence for full cycle demo</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaxInjectionMachine;