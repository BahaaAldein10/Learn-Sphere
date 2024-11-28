'use client';

import React, { useRef, useState } from 'react';

const ButtonAnimatedGradient = () => {
  const divRef = useRef<HTMLButtonElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!divRef.current || isFocused) return;
    const div = divRef.current;
    const rect = div.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <>
      <button
        ref={divRef}
        onMouseMove={handleMouseMove}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative z-10 inline-flex h-12 w-fit cursor-pointer items-center justify-center overflow-hidden rounded-md bg-purple-700 px-6 font-medium text-white"
        style={{
          fontSize: 'inherit',
          fontFamily: 'inherit',
          padding: '0.5em 1em',
          outline: 'none',
          border: 'none',
        }}
      >
        <div
          className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
          style={{
            opacity,
            background: `radial-gradient(100px circle at ${position.x}px ${position.y}px, rgba(139, 92, 246, 0.6), rgba(0, 0, 0, 0.15))`,
          }}
        />
        <span className="relative z-20">Start Learning</span>
      </button>
      <style jsx>{`
        button::after {
          content: '';
          z-index: -1;
          background-color: rgba(255, 255, 255, 0.2);
          position: absolute;
          top: -50%;
          bottom: -50%;
          width: 1.25em;
          transform: translate3d(-525%, 0, 0) rotate(35deg);
        }
        button:hover::after {
          transition: transform 0.45s ease-in-out;
          transform: translate3d(200%, 0, 0) rotate(35deg);
        }
      `}</style>
    </>
  );
};

export default ButtonAnimatedGradient;
