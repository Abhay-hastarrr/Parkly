'use client';

import React from 'react'; 
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Children, cloneElement, useEffect, useMemo, useRef, useState } from 'react';

function DockItem({ children, className = '', onClick, mouseX, spring, distance, magnification, baseItemSize }) {
  const ref = useRef(null);
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, val => {
    const rect = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      width: baseItemSize
    };
    return val - rect.x - baseItemSize / 2;
  });

  const targetSize = useTransform(mouseDistance, [-distance, 0, distance], [baseItemSize, magnification, baseItemSize]);
  const size = useSpring(targetSize, spring);

  return (
    <motion.div
      ref={ref}
      style={{
        width: size,
        height: size
      }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={onClick}
      // 🎨 DOCK ITEM STYLING: Light default with purple-pink gradient on hover
      className={`relative inline-flex items-center justify-center rounded-full transition-all duration-300
        bg-slate-100/50 border-slate-300 border 
        hover:bg-gradient-to-br hover:from-purple-600 hover:via-pink-600 hover:to-purple-600 hover:text-white
        hover:shadow-lg hover:shadow-purple-500/50 focus:shadow-lg focus:shadow-purple-500/50
        hover:border-transparent
        ${className}`}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
    >
      {Children.map(children, child => cloneElement(child, { isHovered }))}
    </motion.div>
  );
}

function DockLabel({ children, className = '', ...rest }) {
  const { isHovered } = rest;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = isHovered.on('change', latest => {
      setIsVisible(latest === 1);
    });
    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          // 🎨 LABEL STYLING: Purple-pink gradient background
          className={`${className} absolute -top-6 left-1/2 w-fit whitespace-pre rounded-md border border-purple-400/30 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-0.5 text-xs text-white shadow-lg`}
          role="tooltip"
          style={{ x: '-50%' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ✅ Enhanced DockIcon - Corrected to use currentColor
function DockIcon({ children, className = '' }) {
  const applyPropsToIcon = (child) => {
    if (!React.isValidElement(child)) return child;

    // Detect Lucide-style icons (they use `stroke`)
    if (
      child.type &&
      typeof child.type === 'function' &&
      (child.props.stroke !== undefined || child.props.color !== undefined)
    ) {
      return React.cloneElement(child, {
        color: 'currentColor', // Use currentColor to inherit the parent's text color
        stroke: 'currentColor',
        fill: 'none',
        ...child.props,
      });
    }

    // Handle wrapper elements (like divs containing icons)
    if (child.props.children) {
      return React.cloneElement(child, {
        children: React.Children.map(child.props.children, applyPropsToIcon),
      });
    }

    return child;
  };

  return (
    // 🎨 TEXT COLOR: Slate for neutral default, inherits white on hover
    <div className={`flex items-center justify-center text-slate-700 ${className}`}> 
      {React.Children.map(children, applyPropsToIcon)}
    </div>
  );
}

export default function Dock({
  items,
  className = '',
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 64,
  distance = 120,
  panelHeight = 48,
  dockHeight = 80,
  baseItemSize = 40
}) {
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);

  const maxHeight = useMemo(
    () => Math.max(dockHeight, magnification + magnification / 2 + 4),
    [magnification, dockHeight]
  );
  const heightRow = useTransform(isHovered, [0, 1], [panelHeight, maxHeight]);
  const height = useSpring(heightRow, spring);

  return (
    <motion.div style={{ height, scrollbarWidth: 'none' }} className="mx-2 flex max-w-full items-center justify-center w-full">
      <motion.div
        onMouseMove={({ pageX }) => {
          isHovered.set(1);
          mouseX.set(pageX);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mouseX.set(Infinity);
        }}
        // 🎨 MAIN DOCK PANEL STYLING: Enhanced with purple-pink accents, wider with centered items
        className={`${className} flex items-center justify-center gap-6 rounded-2xl py-2 px-8 min-w-fit`}
        style={{ height: panelHeight }}
        role="toolbar"
        aria-label="Application dock"
      >
        {/* Subtle gradient border effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        {items.map((item, index) => (
          <DockItem
            key={index}
            onClick={item.onClick}
            className={item.className}
            mouseX={mouseX}
            spring={spring}
            distance={distance}
            magnification={magnification}
            baseItemSize={baseItemSize}
          >
            <DockIcon>{item.icon}</DockIcon>
            <DockLabel>{item.label}</DockLabel>
          </DockItem>
        ))}
      </motion.div>
    </motion.div>
  );
}