import { useEffect, useRef } from 'react';

export default function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: {x: number, y: number, vx: number, vy: number}[] = [];
    let animationFrame: number;
    let width = 0;
    let height = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      
      particles = [];
      // Adjust density based on screen size, limit to 80 to keep it clean
      const numParticles = Math.min(Math.floor((width * height) / 12000), 80);
      for(let i=0; i<numParticles; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.7,
          vy: (Math.random() - 0.5) * 0.7
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(100, 116, 139, 0.4)'; // slate-500 with opacity
        ctx.fill();

        // Connect lines and triangles
        for (let j = i + 1; j < particles.length; j++) {
          let p2 = particles[j];
          let dx = p.x - p2.x;
          let dy = p.y - p2.y;
          let dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(100, 116, 139, ${0.15 - dist/1000})`; // Fade out by distance
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();

            // Draw triangles if a 3rd point is close
            for (let k = j + 1; k < particles.length; k++) {
              let p3 = particles[k];
              let dx3 = p.x - p3.x;
              let dy3 = p.y - p3.y;
              let dist3 = Math.sqrt(dx3 * dx3 + dy3 * dy3);
              
              let dx23 = p2.x - p3.x;
              let dy23 = p2.y - p3.y;
              let dist23 = Math.sqrt(dx23 * dx23 + dy23 * dy23);

              if (dist3 < 150 && dist23 < 150) {
                 ctx.beginPath();
                 ctx.moveTo(p.x, p.y);
                 ctx.lineTo(p2.x, p2.y);
                 ctx.lineTo(p3.x, p3.y);
                 ctx.closePath();
                 ctx.fillStyle = `rgba(100, 116, 139, ${0.05 - (dist+dist3+dist23)/3000})`;
                 ctx.fill();
              }
            }
          }
        }
      }
      animationFrame = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}
