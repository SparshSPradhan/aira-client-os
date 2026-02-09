// 'use client';

// import React from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Search, X } from 'lucide-react';
// import { Input } from '@/components/ui/input';
// import { cn } from '@/lib/utils';
// import { UserMenu } from './user-menu';

// interface HubHeaderProps {
//   userName?: string;
//   userAvatar?: string;
//   searchQuery: string;
//   onSearchChange: (query: string) => void;
//   isSearchFocused: boolean;
//   onSearchFocus: () => void;
//   onSearchBlur: () => void;
//   className?: string;
// }

// function getGreeting(): string {
//   const hour = new Date().getHours();
//   if (hour < 12) return 'Good morning';
//   if (hour < 18) return 'Good afternoon';
//   return 'Good evening';
// }

// export function HubHeader({
//   userName = 'there',
//   userAvatar,
//   searchQuery,
//   onSearchChange,
//   isSearchFocused,
//   onSearchFocus,
//   onSearchBlur,
//   className,
// }: HubHeaderProps) {
//   const greeting = getGreeting();

//   return (
//     <header className={cn('space-y-4', className)}>
//       {/* Top row: Greeting and Avatar */}
//       <AnimatePresence>
//         {!isSearchFocused && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: 'auto' }}
//             exit={{ opacity: 0, height: 0 }}
//             className="flex items-center justify-between"
//           >
//             <div>
//               <p className="text-muted-foreground">{greeting}</p>
//               <h1 className="text-2xl font-bold text-foreground">{userName}</h1>
//             </div>
//             <UserMenu userName={userName} userAvatar={userAvatar} />
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Search bar */}
//       <div className="relative">
//         <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//         <Input
//           type="text"
//           placeholder="Search tasks, rules..."
//           value={searchQuery}
//           onChange={e => onSearchChange(e.target.value)}
//           onFocus={onSearchFocus}
//           onBlur={onSearchBlur}
//           className="h-12 pl-11 pr-10"
//         />
//         <AnimatePresence>
//           {searchQuery && (
//             <motion.button
//               initial={{ opacity: 0, scale: 0.8 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.8 }}
//               onClick={() => onSearchChange('')}
//               className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
//             >
//               <X className="h-4 w-4" />
//             </motion.button>
//           )}
//         </AnimatePresence>
//       </div>
//     </header>
//   );
// }



'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Search, X, Sparkles, TrendingUp, Zap, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { UserMenu } from './user-menu';

interface HubHeaderProps {
  userName?: string;
  userAvatar?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSearchFocused: boolean;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  className?: string;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getGreetingIcon(): React.ReactNode {
  const hour = new Date().getHours();
  if (hour < 12) return '🌅';
  if (hour < 18) return '☀️';
  return '🌙';
}

function getCurrentDate(): string {
  const date = new Date();
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });
}

export function HubHeader({
  userName = 'there',
  userAvatar,
  searchQuery,
  onSearchChange,
  isSearchFocused,
  onSearchFocus,
  onSearchBlur,
  className,
}: HubHeaderProps) {
  const greeting = getGreeting();
  const greetingIcon = getGreetingIcon();
  const currentDate = getCurrentDate();
  const [isHovered, setIsHovered] = useState(false);
  const [time, setTime] = useState(new Date());
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const backgroundX = useTransform(mouseX, [0, 400], [-10, 10]);
  const backgroundY = useTransform(mouseY, [0, 200], [-5, 5]);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <header className={cn('space-y-6', className)}>
      {/* Animated background gradient */}
      <div className="absolute -top-40 left-0 right-0 h-96 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [-20, 20, -20],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
            x: [20, -20, 20],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
      </div>

      {/* Top row: Enhanced Greeting Card and Avatar */}
      <AnimatePresence mode="wait">
        {!isSearchFocused && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ 
              duration: 0.4, 
              ease: [0.25, 0.1, 0.25, 1],
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
            className="relative"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Main glass card */}
            <motion.div
              className="relative backdrop-blur-2xl bg-gradient-to-br from-background/95 via-background/80 to-background/95 rounded-3xl p-6 border border-white/10 shadow-2xl overflow-hidden"
              style={{
                x: backgroundX,
                y: backgroundY,
              }}
              whileHover={{ scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              {/* Animated mesh gradient background */}
              <div className="absolute inset-0 opacity-50">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20"
                  animate={{
                    background: [
                      'linear-gradient(to bottom right, rgba(var(--primary-rgb, 59 130 246) / 0.2), rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))',
                      'linear-gradient(to bottom right, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2), rgba(var(--primary-rgb, 59 130 246) / 0.2))',
                      'linear-gradient(to bottom right, rgba(236, 72, 153, 0.2), rgba(var(--primary-rgb, 59 130 246) / 0.2), rgba(168, 85, 247, 0.2))',
                    ],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              </div>

              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                  repeatDelay: 2,
                }}
              />

              {/* Grid pattern overlay */}
              <div 
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, currentColor 1px, transparent 1px),
                    linear-gradient(to bottom, currentColor 1px, transparent 1px)
                  `,
                  backgroundSize: '24px 24px',
                }}
              />

              <div className="relative flex items-start justify-between gap-4">
                {/* Left side: Greeting content */}
                <div className="flex-1 space-y-3">
                  {/* Greeting with icon */}
                  <motion.div
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <motion.span
                      className="text-3xl"
                      animate={{ 
                        rotate: [0, 10, -10, 10, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3,
                      }}
                    >
                      {greetingIcon}
                    </motion.span>
                    
                    <div className="flex flex-col">
                      <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                        {greeting}
                        <AnimatePresence>
                          {isHovered && (
                            <motion.span
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: 180 }}
                              transition={{ type: 'spring', stiffness: 400 }}
                            >
                              <Sparkles className="h-3.5 w-3.5 text-primary" />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </p>
                      
                      {/* Date and time */}
                      <motion.div 
                        className="flex items-center gap-2 mt-0.5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Calendar className="h-3 w-3 text-muted-foreground/60" />
                        <span className="text-xs text-muted-foreground/80">
                          {currentDate} • {time.toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit',
                            hour12: true 
                          })}
                        </span>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Username with gradient */}
                  <motion.h1
                    className="text-4xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent bg-[length:200%_auto] leading-tight"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      backgroundPosition: ['0% center', '100% center', '0% center'],
                    }}
                    transition={{ 
                      opacity: { delay: 0.2 },
                      x: { delay: 0.2 },
                      backgroundPosition: {
                        duration: 8,
                        repeat: Infinity,
                        ease: 'linear',
                      },
                    }}
                  >
                    {userName}
                  </motion.h1>

                  {/* Quick stats */}
                  <motion.div
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-sm bg-emerald-500/10 border border-emerald-500/20">
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      >
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                      </motion.div>
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        5 tasks today
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-sm bg-primary/10 border border-primary/20">
                      <motion.div
                        animate={{
                          rotate: [0, 360],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      >
                        <Zap className="h-3.5 w-3.5 text-primary" />
                      </motion.div>
                      <span className="text-xs font-semibold text-primary">
                        Productive
                      </span>
                    </div>
                  </motion.div>
                </div>

                {/* Right side: User Menu */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ 
                    delay: 0.3, 
                    type: 'spring', 
                    stiffness: 400,
                    damping: 20,
                  }}
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  className="relative"
                >
                  {/* Glow ring */}
                  <motion.div
                    className="absolute -inset-2 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded-full blur-lg"
                    animate={{
                      opacity: [0.5, 0.8, 0.5],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  <UserMenu userName={userName} userAvatar={userAvatar} />
                </motion.div>
              </div>

              {/* Bottom decorative bar */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Search bar */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <motion.div
          className="relative group"
          animate={isSearchFocused ? { scale: 1.02 } : { scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {/* Multi-layered glass background */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            {/* Base glass layer */}
            <div className="absolute inset-0 backdrop-blur-xl bg-gradient-to-r from-background/60 via-background/80 to-background/60 border border-white/10" />
            
            {/* Animated gradient overlay */}
            <motion.div
              className="absolute inset-0"
              animate={isSearchFocused ? {
                background: [
                  'linear-gradient(90deg, transparent, rgba(var(--primary-rgb, 59 130 246) / 0.1), transparent)',
                  'linear-gradient(90deg, transparent, rgba(var(--primary-rgb, 59 130 246) / 0.1), transparent)',
                ],
                backgroundPosition: ['0% 0%', '200% 0%'],
              } : {}}
              transition={{
                duration: 2,
                repeat: isSearchFocused ? Infinity : 0,
                ease: 'linear',
              }}
            />

            {/* Glow effect when focused */}
            <AnimatePresence>
              {isSearchFocused && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0"
                >
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    animate={{
                      boxShadow: [
                        '0 0 0 0 rgba(var(--primary-rgb, 59 130 246) / 0)',
                        '0 0 0 4px rgba(var(--primary-rgb, 59 130 246) / 0.1)',
                        '0 0 0 0 rgba(var(--primary-rgb, 59 130 246) / 0)',
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search content */}
          <div className="relative">
            {/* Search icon with animation */}
            <motion.div
              className="absolute left-5 top-1/2 -translate-y-1/2 z-10"
              animate={isSearchFocused ? {
                scale: [1, 1.15, 1],
                rotate: [0, 5, -5, 0],
              } : { scale: 1, rotate: 0 }}
              transition={{
                duration: 0.5,
                repeat: isSearchFocused ? Infinity : 0,
                repeatDelay: 2,
              }}
            >
              <Search className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </motion.div>

            {/* Input field */}
            <Input
              type="text"
              placeholder="Search tasks, rules, or just explore..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              onFocus={onSearchFocus}
              onBlur={onSearchBlur}
              className="relative h-14 pl-14 pr-14 bg-transparent border-0 text-base placeholder:text-muted-foreground/70 focus-visible:ring-0 z-10 rounded-2xl"
            />

            {/* Clear button with advanced animation */}
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0, rotate: -180 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0, rotate: 180 }}
                  whileHover={{ 
                    scale: 1.15, 
                    rotate: 90,
                    backgroundColor: 'rgba(var(--destructive-rgb, 239 68 68) / 0.1)',
                  }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  onClick={() => onSearchChange('')}
                  className="absolute right-5 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full backdrop-blur-sm bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Typing indicator particles */}
            <AnimatePresence>
              {isSearchFocused && !searchQuery && (
                <motion.div
                  className="absolute right-5 top-1/2 -translate-y-1/2 flex gap-1 z-10"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-primary/60"
                      animate={{
                        y: [0, -8, 0],
                        scale: [1, 1.3, 1],
                        opacity: [0.4, 1, 0.4],
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: i * 0.15,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom highlight bar */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={isSearchFocused ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>

        {/* Search suggestions hint */}
        <AnimatePresence>
          {isSearchFocused && !searchQuery && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-3 flex flex-wrap gap-2"
            >
              {['Recent tasks', 'High priority', 'Today\'s goals'].map((suggestion, i) => (
                <motion.button
                  key={suggestion}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSearchChange(suggestion)}
                  className="px-3 py-1.5 text-xs font-medium rounded-full backdrop-blur-sm bg-muted/50 hover:bg-muted border border-border/50 hover:border-primary/50 transition-all"
                >
                  {suggestion}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </header>
  );
}

