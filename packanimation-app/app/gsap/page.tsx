'use client'

import { useRef, useEffect } from "react";
import gsap from "gsap";

const CanvasAnimation = () => {
    const canvasRef = useRef(null);
    const objectsRef = useRef<{ image: HTMLImageElement; x: number; y: number }[]>([]);

    useEffect(() => {

        const canvas = canvasRef.current as HTMLCanvasElement | null;
        const ctx = canvas?.getContext("2d");

       

        // Load images
        const image1 = new Image();
        const image2 = new Image();

        image1.src = "pokemonpack.jpeg";
        image2.src = "pikachu_card.jpeg";

        image1.onload = () => {
            objectsRef.current.push({ image: image1, x: 50, y: 50 });
            // drawCanvas(); // Initial draw
        };

        image2.onload = () => {
            objectsRef.current.push({ image: image2, x: 150, y: 150 });
            // drawCanvas(); // Redraw when new image is added
        };

        // Function to redraw the canvas
        const drawCanvas = () => {
            if (!ctx || !canvas) return; 
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
            objectsRef.current.forEach((obj) => {
                ctx.drawImage(obj.image, obj.x, obj.y);
            });
        };

        drawCanvas(); // Initial draw
        // GSAP Animation
        gsap.set(canvas, { x: 0, y: 0 });
        gsap.timeline()
        .to(image1, {
            x: 600,
            y: 0,
            duration: 10,
            onUpdate: drawCanvas,
        })
        .to(image2, {
            x: 300,
            duration: 2,
            onUpdate: drawCanvas,
        });
    }, []);

    return <canvas ref={canvasRef} width={500} height={500} />;
};

export default CanvasAnimation;
