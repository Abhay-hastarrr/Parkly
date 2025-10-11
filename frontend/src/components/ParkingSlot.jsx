import React, { useRef, useMemo, useState, useEffect, useCallback, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, ContactShadows, Text } from "@react-three/drei";
import * as THREE from "three";

// Preload the car model
useGLTF.preload("/car.glb");

// ... (All the other components like Ground, ParkingSpot, Car, etc., remain exactly the same)
// ... (I've omitted them for brevity, but they are unchanged)

const Ground = React.memo(() => {
  const tex = useMemo(() => {
    const canvas = document.createElement("canvas");
    const size = 512;
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d", { alpha: false });

    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, "#2d2d3f");
    gradient.addColorStop(0.5, "#3d3d4f");
    gradient.addColorStop(1, "#2d2d3f");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 1000; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.03})`;
      ctx.fillRect(Math.random() * size, Math.random() * size, 2, 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
    return texture;
  }, []);

  return (
    <>
      <mesh rotation-x={-Math.PI / 2} receiveShadow position={[0, -0.01, 0]}>
        <planeGeometry args={[60, 50]} />
        <meshStandardMaterial map={tex} roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Colorful decorative rings */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow position={[0, 0, 0]}>
        <ringGeometry args={[28, 29, 64]} />
        <meshStandardMaterial color="#9333ea" opacity={0.3} transparent />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} receiveShadow position={[0, 0, 0]}>
        <ringGeometry args={[24, 24.5, 64]} />
        <meshStandardMaterial color="#ec4899" opacity={0.2} transparent />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} receiveShadow position={[0, 0, 0]}>
        <ringGeometry args={[20, 20.5, 64]} />
        <meshStandardMaterial color="#06b6d4" opacity={0.2} transparent />
      </mesh>
    </>
  );
});

const ParkingSpot = React.memo(({ position, rotation, spotNumber, isOccupied, color }) => {
  const spotDepth = 5;

  return (
    <group position={position} rotation={rotation}>
      <mesh rotation-x={-Math.PI / 2} rotation-z={Math.PI / 12}>
        <planeGeometry args={[3, 0.12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 0, spotDepth]} rotation-x={-Math.PI / 2} rotation-z={Math.PI / 12}>
        <planeGeometry args={[3, 0.12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[-1.5, 0, spotDepth / 2]} rotation-x={-Math.PI / 2} rotation-z={Math.PI / 2 + Math.PI / 12}>
        <planeGeometry args={[spotDepth, 0.12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[1.5, 0, spotDepth / 2]} rotation-x={-Math.PI / 2} rotation-z={Math.PI / 2 + Math.PI / 12}>
        <planeGeometry args={[spotDepth, 0.12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
      </mesh>

      <mesh position={[0, 0.03, spotDepth / 2]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.6, 32]} />
        <meshStandardMaterial
          color={isOccupied ? "#ef4444" : "#10b981"}
          emissive={isOccupied ? "#ef4444" : "#10b981"}
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>

      <Text
        position={[0, 0.04, spotDepth / 2]}
        rotation-x={-Math.PI / 2}
        rotation-z={rotation[1] !== 0 ? Math.PI : 0}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {spotNumber}
      </Text>

      <pointLight
        position={[0, 2, spotDepth / 2]}
        color={color}
        intensity={0.3}
        distance={5}
      />
    </group>
  );
});

const ParkingSpots = React.memo(({ occupiedSpots }) => {
  const spots = useMemo(() => {
    const spotsPerRow = 5;
    const spotWidth = 3;
    const spacing = 0.5;
    const result = [];

    // Colorful top row spots
    const topColors = ["#9333ea", "#ec4899", "#3b82f6", "#8b5cf6", "#a855f7"];
    for (let i = 0; i < spotsPerRow; i++) {
      const x = -12 + i * (spotWidth + spacing);
      result.push({
        key: `top-${i}`,
        position: [x, 0.02, -12],
        rotation: [0, 0, 0],
        spotNumber: i + 1,
        color: topColors[i],
        spotIndex: i
      });
    }

    // Colorful bottom row spots
    const bottomColors = ["#ec4899", "#f43f5e", "#fb7185", "#06b6d4", "#0ea5e9"];
    for (let i = 0; i < spotsPerRow; i++) {
      const x = -12 + i * (spotWidth + spacing);
      result.push({
        key: `bottom-${i}`,
        position: [x, 0.02, 12],
        rotation: [0, Math.PI, 0],
        spotNumber: i + 6,
        color: bottomColors[i],
        spotIndex: i + 5
      });
    }

    return result;
  }, []);

  return (
    <>
      {spots.map(spot => (
        <ParkingSpot
          key={spot.key}
          position={spot.position}
          rotation={spot.rotation}
          spotNumber={spot.spotNumber}
          isOccupied={occupiedSpots[spot.spotIndex]}
          color={spot.color}
        />
      ))}
    </>
  );
});

const RoadMarkings = React.memo(() => {
  const dashLines = useMemo(() =>
    Array.from({ length: 25 }, (_, i) => ({
      key: i,
      position: [-30 + i * 2.5, 0.03, 0]
    }))
  , []);

  const arrows = useMemo(() => [-15, 0, 15], []);

  return (
    <group>
      {dashLines.map(({ key, position }) => (
        <mesh key={key} position={position} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[1.5, 0.2]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}

      {arrows.map((x, i) => (
        <group key={`arrow-${i}`} position={[x, 0.04, 0]}>
          <mesh rotation-x={-Math.PI / 2}>
            <planeGeometry args={[0.8, 2]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0.5, 0, 0.8]} rotation-x={-Math.PI / 2} rotation-z={-Math.PI / 4}>
            <planeGeometry args={[0.5, 1.2]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[-0.5, 0, 0.8]} rotation-x={-Math.PI / 2} rotation-z={Math.PI / 4}>
            <planeGeometry args={[0.5, 1.2]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
});

const LightPole = React.memo(({ position, color = "#9333ea" }) => {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.15, 0.2, 6, 8]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 3.5, 0]} castShadow>
        <boxGeometry args={[0.8, 0.3, 0.8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </mesh>
      <pointLight
        position={[0, 3.5, 0]}
        color={color}
        intensity={0.8}
        distance={12}
        castShadow
      />
    </group>
  );
});

const ModernWalls = React.memo(() => {
  // INCREASED GAP: 18 units (z: -9 to 9)
  const walls = useMemo(() => [
    // Front wall
    { pos: [0, 1.5, -20], size: [55, 3, 0.5], color: "#475569" },
    // Back wall
    { pos: [0, 1.5, 20], size: [55, 3, 0.5], color: "#475569" },

    // Left wall (entrance side) - BIGGER GAP
    { pos: [-30, 1.5, -14.5], size: [0.5, 3, 11], color: "#6366f1" }, // Top: ends at z=-9
    { pos: [-30, 1.5, 14.5], size: [0.5, 3, 11], color: "#6366f1" },   // Bottom: starts at z=9

    // Right wall (exit side) - BIGGER GAP
    { pos: [27, 1.5, -14.5], size: [0.5, 3, 11], color: "#ec4899" },  // Top: ends at z=-9
    { pos: [27, 1.5, 14.5], size: [0.5, 3, 11], color: "#ec4899" },    // Bottom: starts at z=9
  ], []);

  const polePositions = useMemo(() => [
    { pos: [-20, -15], color: "#9333ea" },
    { pos: [-10, -15], color: "#ec4899" },
    { pos: [0, -15], color: "#06b6d4" },
    { pos: [10, -15], color: "#8b5cf6" },
    { pos: [20, -15], color: "#f59e0b" },
    { pos: [-20, 15], color: "#10b981" },
    { pos: [-10, 15], color: "#f43f5e" },
    { pos: [0, 15], color: "#3b82f6" },
    { pos: [10, 15], color: "#a855f7" },
    { pos: [20, 15], color: "#06b6d4" },
  ], []);

  return (
    <group>
      {/* Modern barrier walls with bigger gaps */}
      {walls.map((wall, i) => (
        <mesh key={i} position={wall.pos} castShadow receiveShadow>
          <boxGeometry args={wall.size} />
          <meshStandardMaterial
            color={wall.color}
            roughness={0.3}
            metalness={0.6}
            emissive={wall.color}
            emissiveIntensity={0.1}
          />
        </mesh>
      ))}

      {/* Decorative colorful light poles */}
      {polePositions.map((pole, i) => (
        <LightPole key={`pole-${i}`} position={[pole.pos[0], 0, pole.pos[1]]} color={pole.color} />
      ))}

      {/* Entrance gate markers - Updated positions */}
      <mesh position={[-30, 0.5, -9]} castShadow>
        <boxGeometry args={[0.8, 1, 0.8]} />
        <meshStandardMaterial color="#9333ea" emissive="#9333ea" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[-30, 0.5, 9]} castShadow>
        <boxGeometry args={[0.8, 1, 0.8]} />
        <meshStandardMaterial color="#9333ea" emissive="#9333ea" emissiveIntensity={0.5} />
      </mesh>

      {/* Exit gate markers - Updated positions */}
      <mesh position={[24, 0.5, -9]} castShadow>
        <boxGeometry args={[0.8, 1, 0.8]} />
        <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[24, 0.5, 9]} castShadow>
        <boxGeometry args={[0.8, 1, 0.8]} />
        <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.5} />
      </mesh>

      {/* Entrance/Exit ground markers - Updated */}
      <mesh position={[-30, 0.02, 7]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[4, 4]} />
        <meshStandardMaterial
          color="#9333ea"
          emissive="#9333ea"
          emissiveIntensity={0.3}
          transparent
          opacity={0.5}
        />
      </mesh>
      <mesh position={[24, 0.02, 7]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[4, 4]} />
        <meshStandardMaterial
          color="#ec4899"
          emissive="#ec4899"
          emissiveIntensity={0.3}
          transparent
          opacity={0.5}
        />
      </mesh>
    </group>
  );
});

const EntranceSign = React.memo(({ position, text, color }) => {
  return (
    <group position={position}>
      <mesh position={[0, 2, 0]} castShadow>
        <boxGeometry args={[0.3, 4, 0.3]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} />
      </mesh>

      <mesh position={[0, 4, 0]} castShadow>
        <boxGeometry args={[3, 1.5, 0.2]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
        />
      </mesh>

      <Text
        position={[0, 4, 0.15]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {text}
      </Text>

      <pointLight position={[0, 4, 0]} color={color} intensity={1.5} distance={10} />
    </group>
  );
});

const Gate = React.memo(({ position, open }) => {
  const armRef = useRef();
  const lightRef = useRef();

  useFrame(() => {
    if (armRef.current) {
      armRef.current.rotation.x = THREE.MathUtils.lerp(
        armRef.current.rotation.x,
        open ? -Math.PI / 2.1 : 0,
        0.08
      );
    }
    if (lightRef.current) {
      const col = new THREE.Color(open ? "#10b981" : "#ef4444");
      lightRef.current.material.color.lerp(col, 0.1);
      lightRef.current.material.emissive.lerp(col, 0.1);
    }
  });

  const stripePositions = useMemo(() => [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5], []);

  return (
    <group position={position}>
      {/* Gate post */}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[0.6, 2, 0.6]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>

      <mesh position={[0, 2.2, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.35, 0.3, 8]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Gate arm - rotated 90° to block the road perpendicular to car movement */}
      <group position={[0, 2.5, 0]} rotation-y={Math.PI }>
        <group ref={armRef}>
          <mesh position={[0, 0, 3.5]} castShadow>
            <boxGeometry args={[0.2, 0.2, 7]} />
            <meshStandardMaterial
              color="#f59e0b"
              emissive="#f59e0b"
              emissiveIntensity={0.3}
              metalness={0.6}
              roughness={0.3}
            />
          </mesh>

          {/* Warning stripes */}
          {stripePositions.map((z, i) => (
            <mesh key={i} position={[0, 0.11, z]} castShadow>
              <boxGeometry args={[0.22, 0.22, 0.8]} />
              <meshStandardMaterial
                color={Math.floor(z) % 2 === 0 ? "#ef4444" : "#ffffff"}
                emissive={Math.floor(z) % 2 === 0 ? "#ef4444" : "#ffffff"}
                emissiveIntensity={0.4}
              />
            </mesh>
          ))}

          {/* End cap */}
          <mesh position={[0, 0, 7]} castShadow>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.6} />
          </mesh>
        </group>
      </group>

      {/* Status light */}
      <mesh position={[0.4, 2.8, 0]} ref={lightRef} castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color={open ? "#10b981" : "#ef4444"}
          emissive={new THREE.Color(open ? "#10b981" : "#ef4444")}
          emissiveIntensity={3}
          toneMapped={false}
        />
      </mesh>

      <pointLight
        position={[0.4, 2.8, 0]}
        color={open ? "#10b981" : "#ef4444"}
        intensity={open ? 1.5 : 0.8}
        distance={8}
      />
    </group>
  );
});

function Car({ color, parkingSpot, onParked, onExited, entryGateState, exitGateState, canEnter, canExit, carId }) {
  const ref = useRef();
  const { scene } = useGLTF("/car.glb");

  const [phase, setPhase] = useState("waiting");
  const posRef = useRef(new THREE.Vector3(-40, 0.1, 0));

  const spotData = useMemo(() => {
    const isTopRow = parkingSpot < 5;
    const spotIndex = isTopRow ? parkingSpot : parkingSpot - 5;
    const targetX = -12 + spotIndex * 3.5;
    const parkZ = isTopRow ? -10 : 10;
    return { isTopRow, targetX, parkZ };
  }, [parkingSpot]);

  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.castShadow = true;
        child.receiveShadow = true;
        child.material.color = new THREE.Color(color);
        child.material.metalness = 0.6;
        child.material.roughness = 0.4;
      }
    });
    return cloned;
  }, [scene, color]);

  useEffect(() => {
    if (canEnter && phase === "waiting") {
      setPhase("approaching");
    }
  }, [canEnter, phase]);

  useEffect(() => {
    if (canExit && phase === "parked") {
      const timer = setTimeout(() => {
        setPhase("backingOut");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [canExit, phase]);

  useFrame((_, delta) => {
    if (!ref.current) return;

    const pos = posRef.current;
    const speed = delta * 4;
    const { isTopRow, targetX, parkZ } = spotData;

    switch (phase) {
      case "waiting":
        ref.current.rotation.y = Math.PI / 2;
        pos.z = 7; // Start at z=7 (gate position)
        break;

      case "approaching":
        pos.x += speed;
        pos.z = 7; // Keep at z=7 while approaching
        ref.current.rotation.y = Math.PI / 2;
        if (pos.x > -32) entryGateState.setOpen(true);
        if (pos.x > -27) setPhase("enteringGate");
        break;

      case "enteringGate":
        pos.x += speed;
        pos.z = 7; // Stay at z=7 while passing through gate
        ref.current.rotation.y = Math.PI / 2;
        if (pos.x > -23) {
          entryGateState.setOpen(false);
          setPhase("movingToCenter");
        }
        break;

      case "movingToCenter":
        pos.x += speed;
        // Gradually move from z=7 to z=0
        if (Math.abs(pos.z - 0) > 0.1) {
          pos.z += Math.sign(0 - pos.z) * speed * 0.5;
        } else {
          pos.z = 0;
        }
        ref.current.rotation.y = Math.PI / 2;
        if (pos.z === 0 && pos.x >= targetX - 2) {
          setPhase("turningToPark");
        }
        break;

      case "drivingToSpot":
        pos.x += speed;
        ref.current.rotation.y = Math.PI / 2;
        if (pos.x >= targetX - 2) setPhase("turningToPark");
        break;

      case "turningToPark":
        if (Math.abs(pos.x - targetX) > 0.1) {
          pos.x += Math.sign(targetX - pos.x) * speed * 0.5;
          ref.current.rotation.y = Math.PI / 2;
        } else {
          pos.x = targetX;
          ref.current.rotation.y = isTopRow ? Math.PI / 12 : Math.PI - Math.PI / 12;
          setPhase("movingIntoPark");
        }
        break;

      case "movingIntoPark":
        const zDiff = parkZ - pos.z;
        if (Math.abs(zDiff) > 0.05) {
          pos.z += Math.sign(zDiff) * speed * 0.7;
          ref.current.rotation.y = isTopRow ? Math.PI / 12 : Math.PI - Math.PI / 12;
        } else {
          pos.z = parkZ;
          setPhase("parked");
          onParked(carId);
        }
        break;

      case "parked":
        ref.current.rotation.y = isTopRow ? Math.PI / 12 : Math.PI - Math.PI / 12;
        break;

      case "backingOut":
        const zDiff2 = 0 - pos.z;
        if (Math.abs(zDiff2) > 0.1) {
          pos.z += Math.sign(zDiff2) * speed * 0.7;
          ref.current.rotation.y = isTopRow ? Math.PI / 12 : Math.PI - Math.PI / 12;
        } else {
          pos.z = 0;
          setPhase("turningToExit");
        }
        break;

      case "turningToExit":
        ref.current.rotation.y = Math.PI / 2;
        setPhase("movingToExitLane");
        break;

      case "movingToExitLane":
        pos.x += speed;
        // Gradually move from z=0 to z=7
        if (Math.abs(pos.z - 7) > 0.1) {
          pos.z += Math.sign(7 - pos.z) * speed * 0.5;
        } else {
          pos.z = 7;
        }
        ref.current.rotation.y = Math.PI / 2;
        if (pos.z === 7 && pos.x > 20) {
          exitGateState.setOpen(true);
          setPhase("exitingGate");
        }
        break;

      case "exitingGate":
        pos.x += speed;
        pos.z = 7; // Stay at z=7 while exiting
        ref.current.rotation.y = Math.PI / 2;
        if (pos.x > 27) exitGateState.setOpen(false);
        if (pos.x > 32) onExited(carId);
        break;
    }

    ref.current.position.copy(pos);
  });

  return <primitive ref={ref} object={clonedScene} scale={0.05} />;
}

const Lights = React.memo(() => (
  <>
    <ambientLight intensity={0.5} />
    <directionalLight
      position={[25, 30, 20]}
      intensity={1.2}
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-35}
      shadow-camera-right={35}
      shadow-camera-top={30}
      shadow-camera-bottom={-30}
      shadow-bias={-0.0001}
    />
    <hemisphereLight intensity={0.3} color="#a78bfa" groundColor="#1e293b" />
    <directionalLight position={[-20, 15, -20]} intensity={0.4} color="#ec4899" />
    <directionalLight position={[20, 15, 20]} intensity={0.3} color="#06b6d4" />
  </>
));

const LoadingFallback = () => (
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="#9333ea" />
  </mesh>
);

export default function ParkingSlot() {
  const [entryOpen, setEntryOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [occupiedSpots, setOccupiedSpots] = useState(() => Array(10).fill(false));
  const [currentCarIndex, setCurrentCarIndex] = useState(0);
  const [activeCars, setActiveCars] = useState([]);
  const [parkedQueue, setParkedQueue] = useState([]);

  const MAX_CARS_IN_PARKING = 3;

  const entryGateState = useMemo(() => ({
    open: entryOpen,
    setOpen: setEntryOpen
  }), [entryOpen]);

  const exitGateState = useMemo(() => ({
    open: exitOpen,
    setOpen: setExitOpen
  }), [exitOpen]);

  const carColors = useMemo(() => [
    "#9333ea", "#ec4899", "#3b82f6", "#10b981", "#f59e0b",
    "#8b5cf6", "#06b6d4", "#14b8a6", "#f97316", "#ef4444"
  ], []);

  const getNextParkingSpot = useCallback(() => {
    return occupiedSpots.findIndex(spot => !spot);
  }, [occupiedSpots]);

  const spawnNextCar = useCallback(() => {
    const spot = getNextParkingSpot();
    if (spot === -1) {
      setTimeout(() => spawnNextCar(), 3000);
      return;
    }

    setOccupiedSpots(prev => {
      const newOccupied = [...prev];
      newOccupied[spot] = true;
      return newOccupied;
    });

    setActiveCars(prev => [...prev, {
      id: currentCarIndex,
      color: carColors[currentCarIndex % carColors.length],
      parkingSpot: spot,
      canEnter: false,
      canExit: false,
    }]);

    setCurrentCarIndex(prev => prev + 1);
  }, [currentCarIndex, carColors, getNextParkingSpot]);

  useEffect(() => {
    const timer = setTimeout(spawnNextCar, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleCarParked = useCallback((carId) => {
    setParkedQueue(prev => [...prev, carId]);
    setTimeout(spawnNextCar, 2000);
  }, [spawnNextCar]);

  const handleCarExited = useCallback((carId, spot) => {
    setActiveCars(prev => prev.filter(car => car.id !== carId));
    setOccupiedSpots(prev => {
      const newOccupied = [...prev];
      newOccupied[spot] = false;
      return newOccupied;
    });
    setParkedQueue(prev => prev.filter(id => id !== carId));
  }, []);

  useEffect(() => {
    const carsInside = activeCars.filter(car => car.canEnter).length;

    if (carsInside < MAX_CARS_IN_PARKING) {
      setActiveCars(prev => {
        let updated = false;
        const newCars = prev.map(car => {
          if (!car.canEnter && !updated) {
            updated = true;
            return { ...car, canEnter: true };
          }
          return car;
        });
        return updated ? newCars : prev;
      });
    }
  }, [activeCars.length, MAX_CARS_IN_PARKING]);

  useEffect(() => {
    if (parkedQueue.length >= 2) {
      const firstCarId = parkedQueue[0];
      setActiveCars(prev =>
        prev.map(car =>
          car.id === firstCarId ? { ...car, canExit: true } : car
        )
      );
    }
  }, [parkedQueue.length]);

  return (
    <div className="w-full h-full relative">
      {/* --- DECORATIVE GRADIENT BLOBS REMOVED FROM HERE --- */}

      <Canvas
        camera={{ position: [35, 25, 35], fov: 50 }}
        shadows
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Environment preset="sunset" />
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            enableDamping={true}
            dampingFactor={0.05}
            minDistance={25}
            maxDistance={80}
            maxPolarAngle={Math.PI / 2.2}
            autoRotate
            autoRotateSpeed={0.5}
          />
          <Lights />
          <Ground />
          <ParkingSpots occupiedSpots={occupiedSpots} />
          <RoadMarkings />
          <ModernWalls />

          {/* Updated sign positions */}
          <EntranceSign position={[-30, 0, -10]} text="ENTRANCE" color="#9333ea" />
          <EntranceSign position={[24, 0, -10]} text="EXIT" color="#ec4899" />

          {/* GATES MOVED TO Z=7 (near opposite wall from signs) */}
          <Gate position={[-30, 0, 7]} open={entryOpen} />  {/* Was z=0, now z=7 */}
          <Gate position={[24, 0, 7]} open={exitOpen} />    {/* Was z=0, now z=7 */}

          {activeCars.map((car) => (
            <Car
              key={car.id}
              carId={car.id}
              color={car.color}
              parkingSpot={car.parkingSpot}
              canEnter={car.canEnter}
              canExit={car.canExit}
              onParked={handleCarParked}
              onExited={(carId) => handleCarExited(carId, car.parkingSpot)}
              entryGateState={entryGateState}
              exitGateState={exitGateState}
            />
          ))}

          <ContactShadows
            position={[0, 0.01, 0]}
            scale={60}
            blur={2}
            opacity={0.6}
            far={20}
            color="#1e293b"
          />

          <fog attach="fog" args={["#0f172a", 40, 100]} />
        </Suspense>
      </Canvas>
    </div>
  );
}