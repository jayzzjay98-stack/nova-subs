"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface LiquidEtherProps {
    colors?: string[];
    mouseForce?: number;
    cursorSize?: number;
    className?: string;
    style?: React.CSSProperties;
}

export function LiquidEther({
    colors = ["#1e40af", "#06b6d4", "#3b82f6", "#0ea5e9"],
    mouseForce = 20,
    cursorSize = 100,
    className,
    style,
}: LiquidEtherProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
    const particlesRef = useRef<Array<{
        x: number;
        y: number;
        vx: number;
        vy: number;
        color: string;
        size: number;
    }>>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas size and initial background
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // Set initial dark background
            ctx.fillStyle = "rgb(8, 8, 20)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        };
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        // Initialize particles
        const particleCount = 200;
        particlesRef.current = Array.from({ length: particleCount }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 3 + 1,
        }));

        // Mouse tracking
        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const newX = e.clientX - rect.left;
            const newY = e.clientY - rect.top;

            mouseRef.current.vx = newX - mouseRef.current.x;
            mouseRef.current.vy = newY - mouseRef.current.y;
            mouseRef.current.x = newX;
            mouseRef.current.y = newY;
        };

        window.addEventListener("mousemove", handleMouseMove);

        // Animation loop
        let animationId: number;
        const animate = () => {
            // Dark background with slight transparency for trail effect
            ctx.fillStyle = "rgba(8, 8, 20, 0.1)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            particlesRef.current.forEach((particle, i) => {
                // Mouse interaction
                const dx = mouseRef.current.x - particle.x;
                const dy = mouseRef.current.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < cursorSize) {
                    const force = (cursorSize - distance) / cursorSize;
                    particle.vx += (mouseRef.current.vx * force * mouseForce) / 1000;
                    particle.vy += (mouseRef.current.vy * force * mouseForce) / 1000;
                }

                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;

                // Apply friction
                particle.vx *= 0.99;
                particle.vy *= 0.99;

                // Bounce off edges
                if (particle.x < 0 || particle.x > canvas.width) {
                    particle.vx *= -0.5;
                    particle.x = Math.max(0, Math.min(canvas.width, particle.x));
                }
                if (particle.y < 0 || particle.y > canvas.height) {
                    particle.vy *= -0.5;
                    particle.y = Math.max(0, Math.min(canvas.height, particle.y));
                }

                // Draw particle with glow
                const gradient = ctx.createRadialGradient(
                    particle.x,
                    particle.y,
                    0,
                    particle.x,
                    particle.y,
                    particle.size * 15
                );
                gradient.addColorStop(0, particle.color + "CC");
                gradient.addColorStop(0.5, particle.color + "66");
                gradient.addColorStop(1, particle.color + "00");

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size * 15, 0, Math.PI * 2);
                ctx.fill();

                // Draw connections
                particlesRef.current.forEach((otherParticle, j) => {
                    if (i >= j) return;

                    const dx = otherParticle.x - particle.x;
                    const dy = otherParticle.y - particle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 150) {
                        const opacity = (1 - distance / 150) * 0.5;
                        ctx.strokeStyle = particle.color + Math.floor(opacity * 255).toString(16).padStart(2, '0');
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(otherParticle.x, otherParticle.y);
                        ctx.stroke();
                    }
                });
            });

            // Decay mouse velocity
            mouseRef.current.vx *= 0.95;
            mouseRef.current.vy *= 0.95;

            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            window.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(animationId);
        };
    }, [colors, mouseForce, cursorSize]);

    return (
        <canvas
            ref={canvasRef}
            className={cn("absolute inset-0 z-0", className)}
            style={style}
        />
    );
}
