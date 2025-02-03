import React, { useState, useEffect, useRef } from "react";

const StarAnimation = () => {
  const [gameOver, setGameOver] = useState(false);
  const canvasRef = useRef(null);
  const [t, setT] = useState(0);
  const [direction, setDirection] = useState(1);
  const ballSize = 30;
  const speed = 0.01;
  const [blinkCountState, setBlinkCountState] = useState(0);
  const gameStartRef = useRef(Date.now());

  // Function to stop the game after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setGameOver(true);
    }, 10000); // Stop game after 10 sec

    return () => clearTimeout(timer);
  }, []);

  // Fetch blink data from backend
  useEffect(() => {
    if (gameOver) return; // Stop fetching if game is over

    const fetchBlinkData = async () => {
      try {
        const response = await fetch("http://localhost:5000/blink-data");
        const data = await response.json();
        console.log("Backend Response:", data);

        setBlinkCountState(data.blink_count);
      } catch (error) {
        console.error("Error fetching blink data:", error);
      }
    };

    const interval = setInterval(fetchBlinkData, 500);
    return () => clearInterval(interval);
  }, [gameOver]);

  // Animate the ball movement along the star's path
  useEffect(() => {
    if (gameOver) return; // Stop animation when game is over

    const animate = () => {
      setT((prevT) => {
        let newT = prevT + direction * speed;
        if (newT >= 5 || newT < 0) {
          setDirection((prevDirection) => -prevDirection);
          newT = Math.max(0, Math.min(newT, 4));
        }
        return newT;
      });
    };

    const interval = setInterval(animate, 16); // Animation speed (approx 60 FPS)
    return () => clearInterval(interval);
  }, [direction, gameOver]);

  // Drawing the star and ball
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || gameOver) return;

    const ctx = canvas.getContext("2d");
    const centerX = 400;
    const centerY = 300;
    const radius = 200;
    const numPoints = 5;
    const points = [];

    for (let i = 0; i < numPoints; i++) {
      const angle = (i * 144 * Math.PI) / 180;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      points.push({ x, y });
    }

    const drawStar = () => {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();
      ctx.strokeStyle = "black";
      ctx.lineWidth = 3;
      ctx.stroke();
    };

    const drawBall = () => {
      const progress = t;
      const segment = Math.floor(progress) % numPoints;
      const segmentProgress = progress - segment;
      const { x: x1, y: y1 } = points[segment];
      const { x: x2, y: y2 } = points[(segment + 1) % numPoints];
      const x = x1 + (x2 - x1) * segmentProgress;
      const y = y1 + (y2 - y1) * segmentProgress;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawStar();

      ctx.beginPath();
      ctx.arc(x, y, ballSize / 2, 0, 2 * Math.PI);
      ctx.fillStyle = "red";
      ctx.fill();
      ctx.closePath();
    };

    drawBall();
  }, [t, gameOver]);

  return (
    <div>
      <h1>Eye Tracking Star Game</h1>
      <canvas ref={canvasRef} width={800} height={600}></canvas>
      <p>Blink Count: {blinkCountState}</p>
      {gameOver && <h2>Game Over</h2>}
    </div>
  );
};

export default StarAnimation;
