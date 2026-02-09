// 'use client';

// import React, { useMemo, useCallback, useState } from 'react';
// import {
//   AnimatePresence,
//   motion,
//   useMotionValue,
//   useTransform,
//   useAnimation,
//   type PanInfo,
// } from 'framer-motion';
// import { Inbox } from 'lucide-react';
// import { Card, CardContent } from '@/components/ui/card';
// import { SendMessageCard, type Attachment } from './send-message-card';
// import { cn } from '@/lib/utils';
// import { SPRING_CONFIG } from '@/lib/constants';

// // Swipe configuration
// const SWIPE_THRESHOLD = 150;
// const SWIPE_VELOCITY_THRESHOLD = 500;

// // Card data types matching mobile app
// export interface BaseCardData {
//   id: string;
//   type: 'message' | 'approve' | 'file' | 'image';
//   title: string;
//   subtitle?: string;
//   category: string;
//   timestamp: string;
//   priority?: 'high' | 'medium' | 'low';
// }

// export interface MessageCardData extends BaseCardData {
//   type: 'message';
//   recipient: string;
//   platform: 'whatsapp' | 'sms';
// }

// export type CardData = MessageCardData | BaseCardData;

// interface CardStackProps {
//   cards: CardData[];
//   onSendMessage?: (
//     id: string,
//     message: string,
//     attachments: Attachment[],
//   ) => void;
//   onDismiss?: (id: string, direction: number) => void;
//   className?: string;
//   isFiltered?: boolean;
//   activeCategory?: string;
//   otherCategoryTasks?: { id: string; label: string; count: number }[];
//   onCategoryPress?: (categoryId: string) => void;
// }

// // Priority colors
// const priorityColors = {
//   high: 'bg-destructive',
//   medium: 'bg-primary',
//   low: 'bg-emerald-500',
// };

// // Empty state component
// function EmptyState({
//   isFiltered = false,
//   activeCategory,
//   otherCategoryTasks = [],
//   onCategoryPress,
// }: {
//   isFiltered?: boolean;
//   activeCategory?: string;
//   otherCategoryTasks?: { id: string; label: string; count: number }[];
//   onCategoryPress?: (categoryId: string) => void;
// }) {
//   const totalOtherTasks = otherCategoryTasks.reduce(
//     (sum, cat) => sum + cat.count,
//     0,
//   );

//   const getEmptyMessage = () => {
//     if (!isFiltered) {
//       return {
//         title: 'All caught up!',
//         subtitle: 'No workflows pending review',
//       };
//     }

//     if (totalOtherTasks > 0) {
//       return {
//         title: `${activeCategory} cleared!`,
//         subtitle: `${totalOtherTasks} task${totalOtherTasks !== 1 ? 's' : ''} in other categories`,
//       };
//     }

//     return {
//       title: 'All caught up!',
//       subtitle: 'No workflows pending review',
//     };
//   };

//   const { title, subtitle } = getEmptyMessage();

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="flex flex-col items-center justify-center py-16 text-center"
//     >
//       <motion.div
//         initial={{ scale: 0.8 }}
//         animate={{ scale: 1 }}
//         transition={{ type: 'spring', damping: 18, stiffness: 150 }}
//         className="mb-4 rounded-2xl bg-card p-6"
//       >
//         <Inbox className="h-12 w-12 text-muted-foreground" />
//       </motion.div>
//       <motion.h3
//         initial={{ opacity: 0, y: 10 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.1 }}
//         className="text-lg font-semibold text-foreground"
//       >
//         {title}
//       </motion.h3>
//       <motion.p
//         initial={{ opacity: 0, y: 8 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.2 }}
//         className="mt-1 text-sm text-muted-foreground"
//       >
//         {subtitle}
//       </motion.p>

//       {/* Category chips for filtered empty state */}
//       {isFiltered && totalOtherTasks > 0 && (
//         <motion.div
//           initial={{ opacity: 0, y: 15 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.35 }}
//           className="mt-6 flex flex-col items-center"
//         >
//           <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
//             Jump to:
//           </p>
//           <div className="flex flex-wrap justify-center gap-2">
//             {otherCategoryTasks.map(category => (
//               <button
//                 key={category.id}
//                 onClick={() => onCategoryPress?.(category.id)}
//                 className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border hover:bg-accent/50 transition-colors"
//               >
//                 <span className="text-sm font-medium text-foreground">
//                   {category.label}
//                 </span>
//                 <span className="px-1.5 py-0.5 text-xs font-semibold rounded bg-primary text-primary-foreground">
//                   {category.count}
//                 </span>
//               </button>
//             ))}
//           </div>
//         </motion.div>
//       )}
//     </motion.div>
//   );
// }

// // Stacked card wrapper
// interface StackedCardProps {
//   index: number;
//   isTopCard: boolean;
//   totalCards: number;
//   children: React.ReactNode;
//   priority?: 'high' | 'medium' | 'low';
//   onDismiss?: (direction: number) => void;
// }

// function StackedCard({
//   index,
//   isTopCard,
//   totalCards: _totalCards,
//   children,
//   priority,
//   onDismiss,
// }: StackedCardProps) {
//   const scale = isTopCard ? 1 : 1 - index * 0.03;
//   const translateY = isTopCard ? 0 : index * 8;
//   const opacity = isTopCard ? 1 : 1 - index * 0.15;
//   const zIndex = 10 - index;

//   // Animation controls for programmatic animation
//   const controls = useAnimation();
//   const [isDismissing, setIsDismissing] = useState(false);

//   // Motion values for drag
//   const x = useMotionValue(0);
//   const rotate = useTransform(x, [-300, 0, 300], [-15, 0, 15]);
//   const dragOpacity = useTransform(
//     x,
//     [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
//     [0.7, 1, 0.7],
//   );

//   const handleDragEnd = useCallback(
//     async (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
//       const shouldDismiss =
//         Math.abs(info.offset.x) > SWIPE_THRESHOLD ||
//         Math.abs(info.velocity.x) > SWIPE_VELOCITY_THRESHOLD;

//       if (shouldDismiss && onDismiss) {
//         const direction = info.offset.x > 0 ? 1 : -1;
//         setIsDismissing(true);

//         // Animate card off-screen
//         await controls.start({
//           x: direction * 500,
//           opacity: 0,
//           rotate: direction * 20,
//           transition: { duration: 0.25, ease: 'easeOut' },
//         });

//         onDismiss(direction);
//       } else {
//         // Spring back to center
//         controls.start({
//           x: 0,
//           transition: { type: 'spring', damping: 20, stiffness: 300 },
//         });
//       }
//     },
//     [onDismiss, controls],
//   );

//   return (
//     <motion.div
//       layout={!isDismissing}
//       initial={{ opacity: 0, y: 30, scale: 0.96 }}
//       animate={
//         isDismissing
//           ? controls
//           : {
//               opacity,
//               y: translateY,
//               scale,
//             }
//       }
//       exit={{ opacity: 0, x: -300, scale: 0.9, transition: { duration: 0.2 } }}
//       transition={{ ...SPRING_CONFIG, duration: 0.3 }}
//       style={{
//         zIndex,
//         x: isTopCard ? x : 0,
//         rotate: isTopCard ? rotate : 0,
//         opacity: isTopCard ? dragOpacity : opacity,
//       }}
//       drag={isTopCard && !isDismissing ? 'x' : false}
//       dragConstraints={{ left: 0, right: 0 }}
//       dragElastic={1}
//       onDragEnd={isTopCard ? handleDragEnd : undefined}
//       whileDrag={{ cursor: 'grabbing' }}
//       className={cn(
//         'absolute inset-0',
//         !isTopCard && 'pointer-events-none',
//         isTopCard && 'cursor-grab',
//       )}
//     >
//       <Card className="relative h-full w-full overflow-hidden">
//         {/* Priority indicator */}
//         {priority && (
//           <div
//             className={cn(
//               'absolute top-3 right-3 h-2 w-2 rounded-full',
//               priorityColors[priority],
//             )}
//           />
//         )}

//         <CardContent className="h-full p-5 flex flex-col">
//           {children}
//         </CardContent>

//         {/* Disabled overlay for non-top cards */}
//         {!isTopCard && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 0.65 }}
//             transition={{ duration: 0.8 }}
//             className="absolute inset-0 bg-card rounded-lg"
//           />
//         )}
//       </Card>
//     </motion.div>
//   );
// }

// export function CardStack({
//   cards,
//   onSendMessage,
//   onDismiss,
//   className,
//   isFiltered = false,
//   activeCategory,
//   otherCategoryTasks = [],
//   onCategoryPress,
// }: CardStackProps) {
//   // Only show top 3 cards for visual stack
//   const visibleCards = useMemo(() => cards.slice(0, 3), [cards]);

//   // Handle swipe dismiss
//   const handleSwipeDismiss = useCallback(
//     (cardId: string, direction: number) => {
//       onDismiss?.(cardId, direction);
//     },
//     [onDismiss],
//   );

//   if (cards.length === 0) {
//     return (
//       <EmptyState
//         isFiltered={isFiltered}
//         activeCategory={activeCategory}
//         otherCategoryTasks={otherCategoryTasks}
//         onCategoryPress={onCategoryPress}
//       />
//     );
//   }

//   // Render cards in reverse order so top card is rendered last (on top)
//   const cardElements = visibleCards
//     .map((card, index) => {
//       const isTopCard = index === 0;

//       // Handle message card type
//       if (card.type === 'message') {
//         return (
//           <StackedCard
//             key={card.id}
//             index={index}
//             isTopCard={isTopCard}
//             totalCards={visibleCards.length}
//             priority={card.priority}
//             onDismiss={direction => handleSwipeDismiss(card.id, direction)}
//           >
//             <SendMessageCard
//               id={card.id}
//               title={card.title}
//               subtitle={card.subtitle}
//               category={card.category}
//               timestamp={card.timestamp}
//               onSend={(message, attachments) =>
//                 onSendMessage?.(card.id, message, attachments)
//               }
//             />
//           </StackedCard>
//         );
//       }

//       // Default card type (approve, file, image, etc.) - fallback
//       return (
//         <StackedCard
//           key={card.id}
//           index={index}
//           isTopCard={isTopCard}
//           totalCards={visibleCards.length}
//           priority={card.priority}
//           onDismiss={direction => handleSwipeDismiss(card.id, direction)}
//         >
//           <div className="h-full flex flex-col space-y-3">
//             <h3 className="text-lg font-semibold text-foreground line-clamp-2">
//               {card.title}
//             </h3>
//             {card.subtitle && (
//               <p className="text-sm text-muted-foreground line-clamp-1">
//                 {card.subtitle}
//               </p>
//             )}
//             <div className="flex items-center gap-2 text-xs text-muted-foreground">
//               <span className="capitalize">{card.category}</span>
//               <span>|</span>
//               <span>{card.timestamp}</span>
//             </div>
//           </div>
//         </StackedCard>
//       );
//     })
//     .reverse();

//   // Calculate container height based on card stack - use flex-1 to fill available space
//   const stackOffset = (Math.min(visibleCards.length, 3) - 1) * 8;

//   return (
//     <div
//       className={cn(
//         'relative w-full flex-1 min-h-[400px] overflow-y-hidden overflow-x-hidden',
//         className,
//       )}
//       style={{ paddingBottom: stackOffset }}
//     >
//       <AnimatePresence mode="popLayout">{cardElements}</AnimatePresence>
//     </div>
//   );
// }



'use client';

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
  useAnimation,
  type PanInfo,
} from 'framer-motion';
import { Inbox, Flame, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { SendMessageCard, type Attachment } from './send-message-card';
import { cn } from '@/lib/utils';
import { SPRING_CONFIG } from '@/lib/constants';

// Swipe configuration
const SWIPE_THRESHOLD = 150;
const SWIPE_VELOCITY_THRESHOLD = 500;

// Card data types matching mobile app
export interface BaseCardData {
  id: string;
  type: 'message' | 'approve' | 'file' | 'image';
  title: string;
  subtitle?: string;
  category: string;
  timestamp: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface MessageCardData extends BaseCardData {
  type: 'message';
  recipient: string;
  platform: 'whatsapp' | 'sms';
}

export type CardData = MessageCardData | BaseCardData;

interface CardStackProps {
  cards: CardData[];
  onSendMessage?: (
    id: string,
    message: string,
    attachments: Attachment[],
  ) => void;
  onDismiss?: (id: string, direction: number) => void;
  className?: string;
  isFiltered?: boolean;
  activeCategory?: string;
  otherCategoryTasks?: { id: string; label: string; count: number }[];
  onCategoryPress?: (categoryId: string) => void;
}

// Priority colors with glow effects
const priorityColors = {
  high: 'bg-destructive shadow-[0_0_15px_rgba(239,68,68,0.5)]',
  medium: 'bg-primary shadow-[0_0_15px_rgba(59,130,246,0.5)]',
  low: 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]',
};

// Floating particles component
function FloatingParticles({ count = 20 }: { count?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary/30 rounded-full"
          initial={{
            x: Math.random() * 100 + '%',
            y: '100%',
            opacity: 0,
          }}
          animate={{
            y: '-10%',
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}

// Enhanced empty state component
function EmptyState({
  isFiltered = false,
  activeCategory,
  otherCategoryTasks = [],
  onCategoryPress,
}: {
  isFiltered?: boolean;
  activeCategory?: string;
  otherCategoryTasks?: { id: string; label: string; count: number }[];
  onCategoryPress?: (categoryId: string) => void;
}) {
  const totalOtherTasks = otherCategoryTasks.reduce(
    (sum, cat) => sum + cat.count,
    0,
  );

  const getEmptyMessage = () => {
    if (!isFiltered) {
      return {
        title: 'All caught up!',
        subtitle: 'No workflows pending review',
      };
    }

    if (totalOtherTasks > 0) {
      return {
        title: `${activeCategory} cleared!`,
        subtitle: `${totalOtherTasks} task${totalOtherTasks !== 1 ? 's' : ''} in other categories`,
      };
    }

    return {
      title: 'All caught up!',
      subtitle: 'No workflows pending review',
    };
  };

  const { title, subtitle } = getEmptyMessage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center relative"
    >
      {/* Animated background glow */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <motion.div
          className="w-64 h-64 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>

      <motion.div
        initial={{ scale: 0.8, rotateY: -180 }}
        animate={{ scale: 1, rotateY: 0 }}
        transition={{ type: 'spring', damping: 18, stiffness: 150 }}
        className="relative mb-4 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-card/80 via-card/60 to-card/80 p-6 border border-white/10 shadow-2xl"
      >
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Inbox className="h-12 w-12 text-muted-foreground" />
        </motion.div>
        
        {/* Sparkle effect */}
        <motion.div
          className="absolute -top-2 -right-2"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        >
          <Sparkles className="h-5 w-5 text-primary" />
        </motion.div>
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-lg font-semibold text-foreground"
      >
        {title}
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-1 text-sm text-muted-foreground"
      >
        {subtitle}
      </motion.p>

      {/* Category chips with glass effect */}
      {isFiltered && totalOtherTasks > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-6 flex flex-col items-center relative z-10"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
            Jump to:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {otherCategoryTasks.map((category, index) => (
              <motion.button
                key={category.id}
                onClick={() => onCategoryPress?.(category.id)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md bg-card/50 border border-white/20 hover:bg-accent/50 transition-all shadow-lg"
              >
                <span className="text-sm font-medium text-foreground">
                  {category.label}
                </span>
                <motion.span
                  className="px-1.5 py-0.5 text-xs font-semibold rounded bg-primary text-primary-foreground"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.3,
                  }}
                >
                  {category.count}
                </motion.span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// Enhanced stacked card with glass morphism
interface StackedCardProps {
  index: number;
  isTopCard: boolean;
  totalCards: number;
  children: React.ReactNode;
  priority?: 'high' | 'medium' | 'low';
  onDismiss?: (direction: number) => void;
}

function StackedCard({
  index,
  isTopCard,
  totalCards: _totalCards,
  children,
  priority,
  onDismiss,
}: StackedCardProps) {
  const scale = isTopCard ? 1 : 1 - index * 0.03;
  const translateY = isTopCard ? 0 : index * 8;
  const opacity = isTopCard ? 1 : 1 - index * 0.15;
  const zIndex = 10 - index;

  const controls = useAnimation();
  const [isDismissing, setIsDismissing] = useState(false);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-15, 0, 15]);
  const dragOpacity = useTransform(
    x,
    [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
    [0.7, 1, 0.7],
  );

  // Track drag direction for visual feedback
  useEffect(() => {
    const unsubscribe = x.on('change', (latest) => {
      if (Math.abs(latest) > 50) {
        setDragDirection(latest > 0 ? 'right' : 'left');
      } else {
        setDragDirection(null);
      }
    });
    return unsubscribe;
  }, [x]);

  const handleDragEnd = useCallback(
    async (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const shouldDismiss =
        Math.abs(info.offset.x) > SWIPE_THRESHOLD ||
        Math.abs(info.velocity.x) > SWIPE_VELOCITY_THRESHOLD;

      if (shouldDismiss && onDismiss) {
        const direction = info.offset.x > 0 ? 1 : -1;
        setIsDismissing(true);

        await controls.start({
          x: direction * 500,
          opacity: 0,
          rotate: direction * 20,
          scale: 0.8,
          transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] },
        });

        onDismiss(direction);
      } else {
        setDragDirection(null);
        controls.start({
          x: 0,
          transition: { type: 'spring', damping: 20, stiffness: 300 },
        });
      }
    },
    [onDismiss, controls],
  );

  return (
    <motion.div
      layout={!isDismissing}
      initial={{ opacity: 0, y: 30, scale: 0.96, rotateX: -10 }}
      animate={
        isDismissing
          ? controls
          : {
              opacity,
              y: translateY,
              scale,
              rotateX: 0,
            }
      }
      exit={{ 
        opacity: 0, 
        x: -300, 
        scale: 0.7,
        rotateZ: -10,
        transition: { duration: 0.25, ease: 'easeIn' } 
      }}
      transition={{ ...SPRING_CONFIG, duration: 0.3 }}
      style={{
        zIndex,
        x: isTopCard ? x : 0,
        rotate: isTopCard ? rotate : 0,
        opacity: isTopCard ? dragOpacity : opacity,
      }}
      drag={isTopCard && !isDismissing ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={1}
      onDragEnd={isTopCard ? handleDragEnd : undefined}
      whileDrag={{ 
        cursor: 'grabbing',
        scale: 1.02,
      }}
      className={cn(
        'absolute inset-0',
        !isTopCard && 'pointer-events-none',
        isTopCard && 'cursor-grab',
      )}
    >
      <Card className="relative h-full w-full overflow-hidden backdrop-blur-xl bg-gradient-to-br from-card/90 via-card/70 to-card/90 border-white/10 shadow-2xl">
        {/* Shimmer effect on drag */}
        <AnimatePresence>
          {isTopCard && dragDirection && (
            <motion.div
              initial={{ x: dragDirection === 'left' ? '100%' : '-100%' }}
              animate={{ x: dragDirection === 'left' ? '-100%' : '100%' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'linear' }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-20"
            />
          )}
        </AnimatePresence>

        {/* Glow border effect */}
        <motion.div
          className="absolute inset-0 rounded-lg"
          animate={{
            boxShadow: isTopCard
              ? [
                  '0 0 20px rgba(var(--primary-rgb, 59 130 246) / 0.1)',
                  '0 0 40px rgba(var(--primary-rgb, 59 130 246) / 0.2)',
                  '0 0 20px rgba(var(--primary-rgb, 59 130 246) / 0.1)',
                ]
              : 'none',
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Priority indicator with pulse */}
        {priority && (
          <motion.div
            className={cn(
              'absolute top-3 right-3 h-2.5 w-2.5 rounded-full z-10',
              priorityColors[priority],
            )}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}

        <CardContent className="h-full p-5 flex flex-col relative z-10">
          {children}
        </CardContent>

        {/* Glass overlay for non-top cards with slide effect */}
        {!isTopCard && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 backdrop-blur-sm bg-card/80 rounded-lg"
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
                delay: index * 0.5,
              }}
            />
          </>
        )}

        {/* Drag direction indicator */}
        <AnimatePresence>
          {isTopCard && dragDirection && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={cn(
                'absolute top-1/2 -translate-y-1/2 z-30 px-6 py-3 rounded-full backdrop-blur-xl border-2 font-bold text-lg',
                dragDirection === 'right'
                  ? 'right-8 bg-emerald-500/20 border-emerald-500 text-emerald-500'
                  : 'left-8 bg-red-500/20 border-red-500 text-red-500',
              )}
            >
              {dragDirection === 'right' ? '✓' : '✗'}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

export function CardStack({
  cards,
  onSendMessage,
  onDismiss,
  className,
  isFiltered = false,
  activeCategory,
  otherCategoryTasks = [],
  onCategoryPress,
}: CardStackProps) {
  const [isBurning, setIsBurning] = useState(true);
  const visibleCards = useMemo(() => cards.slice(0, 3), [cards]);

  const handleSwipeDismiss = useCallback(
    (cardId: string, direction: number) => {
      onDismiss?.(cardId, direction);
    },
    [onDismiss],
  );

  // Remove burning effect after animation
  useEffect(() => {
    const timer = setTimeout(() => setIsBurning(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (cards.length === 0) {
    return (
      <EmptyState
        isFiltered={isFiltered}
        activeCategory={activeCategory}
        otherCategoryTasks={otherCategoryTasks}
        onCategoryPress={onCategoryPress}
      />
    );
  }

  const cardElements = visibleCards
    .map((card, index) => {
      const isTopCard = index === 0;

      if (card.type === 'message') {
        return (
          <StackedCard
            key={card.id}
            index={index}
            isTopCard={isTopCard}
            totalCards={visibleCards.length}
            priority={card.priority}
            onDismiss={direction => handleSwipeDismiss(card.id, direction)}
          >
            <SendMessageCard
              id={card.id}
              title={card.title}
              subtitle={card.subtitle}
              category={card.category}
              timestamp={card.timestamp}
              // priority={card.priority}
              onSend={(message, attachments) =>
                onSendMessage?.(card.id, message, attachments)
              }
            />
          </StackedCard>
        );
      }

      return (
        <StackedCard
          key={card.id}
          index={index}
          isTopCard={isTopCard}
          totalCards={visibleCards.length}
          priority={card.priority}
          onDismiss={direction => handleSwipeDismiss(card.id, direction)}
        >
          <div className="h-full flex flex-col space-y-3">
            <h3 className="text-lg font-semibold text-foreground line-clamp-2">
              {card.title}
            </h3>
            {card.subtitle && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {card.subtitle}
              </p>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="capitalize">{card.category}</span>
              <span>|</span>
              <span>{card.timestamp}</span>
            </div>
          </div>
        </StackedCard>
      );
    })
    .reverse();

  const stackOffset = (Math.min(visibleCards.length, 3) - 1) * 8;

  return (
    <>
      {/* Burning Effect Overlay */}
      <AnimatePresence>
        {isBurning && (
          <motion.div
            className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, delay: 1 }}
          >
            {/* Fire gradient layer */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-red-600 via-black-500 to-white-400"
              initial={{ y: '0%' }}
              animate={{ y: '-100%' }}
              transition={{ duration: 2, ease: [0.32, 0, 0.67, 0] }}
            />
            
            {/* Flame particles */}
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute bottom-0"
                initial={{
                  x: `${Math.random() * 100}%`,
                  y: '100%',
                  opacity: 1,
                }}
                animate={{
                  y: '-100%',
                  opacity: [1, 0],
                }}
                transition={{
                  duration: Math.random() * 1 + 1,
                  delay: Math.random() * 0.5,
                  ease: 'easeOut',
                }}
              >
                <Flame 
                  className="text-black-500" 
                  size={Math.random() * 30 + 20}
                />
              </motion.div>
            ))}

            {/* Ember particles */}
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={`ember-${i}`}
                className="absolute w-1 h-1 bg-orange-400 rounded-full"
                initial={{
                  x: `${Math.random() * 100}%`,
                  y: '100%',
                }}
                animate={{
                  y: '-20%',
                  opacity: [1, 0],
                  scale: [1, 0],
                }}
                transition={{
                  duration: Math.random() * 2 + 1,
                  delay: Math.random() * 1,
                  ease: 'easeOut',
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Card Stack Container */}
      <motion.div
        className={cn(
          'relative w-full flex-1 min-h-[400px] overflow-hidden',
          className,
        )}
        style={{ paddingBottom: stackOffset }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        {/* Floating particles background */}
        <FloatingParticles count={15} />

        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none"
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <AnimatePresence mode="popLayout">{cardElements}</AnimatePresence>
      </motion.div>
    </>
  );
}