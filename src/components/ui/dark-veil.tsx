"use client";

import React, { useEffect, useRef } from "react";
import { Renderer, Camera, Transform, Mesh, Program, Geometry, Vec2 } from "ogl";
import { cn } from "@/lib/utils";

interface DarkVeilProps {
    speed?: number;
    hueShift?: number;
    noiseIntensity?: number;
    scanlineFrequency?: number;
    scanlineIntensity?: number;
    warpAmount?: number;
    className?: string;
    style?: React.CSSProperties;
}

export function DarkVeil({
    speed = 0.5,
    hueShift = 0,
    noiseIntensity = 0.3,
    scanlineFrequency = 100,
    scanlineIntensity = 0.1,
    warpAmount = 0.2,
    className,
    style,
}: DarkVeilProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const renderer = new Renderer({ canvas, alpha: false });
        const gl = renderer.gl;
        gl.clearColor(0.03, 0.03, 0.08, 1);

        const camera = new Camera(gl, { fov: 35 });
        camera.position.set(0, 0, 5);

        const scene = new Transform();

        const resize = () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
        };
        resize();
        window.addEventListener("resize", resize);

        // Vertex shader
        const vertex = `
      attribute vec2 uv;
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 0, 1);
      }
    `;

        // Fragment shader with dark veil effect
        const fragment = `
      precision highp float;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform float uSpeed;
      uniform float uHueShift;
      uniform float uNoiseIntensity;
      uniform float uScanlineFreq;
      uniform float uScanlineInt;
      uniform float uWarpAmount;
      varying vec2 vUv;

      // Noise function
      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      void main() {
        vec2 st = vUv;
        
        // Warp effect
        float warp = noise(st * 3.0 + uTime * uSpeed * 0.1) * uWarpAmount;
        st += warp;
        
        // Multiple layers of noise
        float n = 0.0;
        n += noise(st * 2.0 + uTime * uSpeed * 0.2) * 0.5;
        n += noise(st * 4.0 - uTime * uSpeed * 0.3) * 0.25;
        n += noise(st * 8.0 + uTime * uSpeed * 0.4) * 0.125;
        
        // Scanlines
        float scanline = sin(st.y * uScanlineFreq + uTime * uSpeed) * uScanlineInt;
        n += scanline;
        
        // Dark veil gradient
        float veil = 1.0 - length(st - 0.5) * 0.8;
        n *= veil;
        
        // Color with hue shift
        vec3 color1 = vec3(0.05, 0.05, 0.15); // Dark blue
        vec3 color2 = vec3(0.1, 0.15, 0.3);   // Medium blue
        vec3 color3 = vec3(0.15, 0.2, 0.4);   // Light blue
        
        vec3 finalColor = mix(color1, color2, n);
        finalColor = mix(finalColor, color3, n * n);
        
        // Apply hue shift
        finalColor.r += uHueShift * 0.1;
        finalColor.g += uHueShift * 0.05;
        
        // Add noise intensity
        finalColor += (random(st + uTime) - 0.5) * uNoiseIntensity * 0.1;
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

        const geometry = new Geometry(gl, {
            position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
            uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
        });

        const program = new Program(gl, {
            vertex,
            fragment,
            uniforms: {
                uTime: { value: 0 },
                uResolution: { value: new Vec2(gl.canvas.width, gl.canvas.height) },
                uSpeed: { value: speed },
                uHueShift: { value: hueShift },
                uNoiseIntensity: { value: noiseIntensity },
                uScanlineFreq: { value: scanlineFrequency },
                uScanlineInt: { value: scanlineIntensity },
                uWarpAmount: { value: warpAmount },
            },
        });

        const mesh = new Mesh(gl, { geometry, program });
        mesh.setParent(scene);

        let time = 0;
        const animate = (t: number) => {
            time = t * 0.001;
            program.uniforms.uTime.value = time;
            renderer.render({ scene, camera });
            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);

        return () => {
            window.removeEventListener("resize", resize);
            geometry.remove();
            program.remove();
            renderer.gl.getExtension("WEBGL_lose_context")?.loseContext();
        };
    }, [speed, hueShift, noiseIntensity, scanlineFrequency, scanlineIntensity, warpAmount]);

    return (
        <canvas
            ref={canvasRef}
            className={cn("absolute inset-0 z-0", className)}
            style={style}
        />
    );
}
