'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

function GoldenEagleCore() {
    const group = useRef<THREE.Group>(null);
    const mesh = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (group.current) {
            // Gentle floating rotation
            group.current.rotation.y = Math.sin(t / 4) * 0.2;
            group.current.rotation.x = Math.cos(t / 4) * 0.1;

            // Mouse interaction (parallax)
            const mouseX = (state.mouse.x * Math.PI) / 10;
            const mouseY = (state.mouse.y * Math.PI) / 10;
            group.current.rotation.y += mouseX;
            group.current.rotation.x -= mouseY;
        }
    });

    // Procedural Wing Geometry logic
    const wingShape = useMemo(() => {
        const shape = new THREE.Shape();
        // Simplified eagle wing shape
        shape.moveTo(0, 0);
        shape.quadraticCurveTo(2, 2, 4, 1);
        shape.quadraticCurveTo(5, -1, 3, -2);
        shape.quadraticCurveTo(1, -1, 0, 0);
        return shape;
    }, []);

    return (
        <group ref={group} dispose={null}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                {/* Core Body (Golden Sphere) */}
                <mesh position={[0, 0, 0]}>
                    <octahedronGeometry args={[1.2, 0]} />
                    <meshStandardMaterial
                        color="#FFD700"
                        metalness={1}
                        roughness={0.1}
                        emissive="#B8860B"
                        emissiveIntensity={0.2}
                    />
                </mesh>

                {/* Left Wing */}
                <mesh position={[-1.5, 0.5, 0]} rotation={[0, 0, Math.PI / 6]}>
                    <coneGeometry args={[0.8, 3, 4]} />
                    <meshStandardMaterial
                        color="#DAA520"
                        metalness={0.9}
                        roughness={0.2}
                    />
                </mesh>

                {/* Right Wing */}
                <mesh position={[1.5, 0.5, 0]} rotation={[0, 0, -Math.PI / 6]}>
                    <coneGeometry args={[0.8, 3, 4]} />
                    <meshStandardMaterial
                        color="#DAA520"
                        metalness={0.9}
                        roughness={0.2}
                    />
                </mesh>

                {/* Head */}
                <mesh position={[0, 1.2, 0.5]}>
                    <dodecahedronGeometry args={[0.6, 0]} />
                    <meshStandardMaterial
                        color="#F4D03F"
                        metalness={1}
                        roughness={0.1}
                    />
                </mesh>
            </Float>

            {/* Dynamic Lighting */}
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#FFD700" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="blue" />
            <ambientLight intensity={0.5} />
        </group>
    );
}

export function Hero3D() {
    return (
        <div className="absolute inset-0 w-full h-[500px] -z-10 opacity-60 pointer-events-none">
            <Canvas camera={{ position: [0, 0, 8], fov: 45 }} gl={{ alpha: true, antialias: true }}>
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
                <GoldenEagleCore />
                <Environment preset="city" />
                <Sparkles count={50} scale={10} size={4} speed={0.4} opacity={0.5} color="#FFD700" />
            </Canvas>
        </div>
    );
}
