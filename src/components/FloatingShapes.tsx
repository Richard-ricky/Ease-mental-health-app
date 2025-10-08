import { motion } from "framer-motion";
import { Circle, Triangle, Square, Star, Heart } from "lucide-react";

const FLOATING_SHAPES = [
  { id: 1, Icon: Circle, size: 'w-16 h-16', delay: 0, x: '10%', y: '20%', color: 'text-purple-400/60 dark:text-purple-600/40' },
  { id: 2, Icon: Triangle, size: 'w-12 h-12', delay: 2, x: '80%', y: '10%', color: 'text-blue-400/60 dark:text-blue-600/40' },
  { id: 3, Icon: Square, size: 'w-10 h-10', delay: 4, x: '15%', y: '70%', color: 'text-emerald-400/60 dark:text-emerald-600/40' },
  { id: 4, Icon: Circle, size: 'w-8 h-8', delay: 1, x: '85%', y: '60%', color: 'text-pink-400/60 dark:text-pink-600/40' },
  { id: 5, Icon: Star, size: 'w-14 h-14', delay: 3, x: '60%', y: '80%', color: 'text-yellow-400/60 dark:text-yellow-600/40' },
  { id: 6, Icon: Triangle, size: 'w-6 h-6', delay: 5, x: '25%', y: '40%', color: 'text-indigo-400/60 dark:text-indigo-600/40' },
  { id: 7, Icon: Circle, size: 'w-20 h-20', delay: 1.5, x: '75%', y: '30%', color: 'text-purple-400/60 dark:text-purple-600/40' },
  { id: 8, Icon: Square, size: 'w-8 h-8', delay: 4.5, x: '40%', y: '15%', color: 'text-cyan-400/60 dark:text-cyan-600/40' },
  { id: 9, Icon: Star, size: 'w-10 h-10', delay: 2.5, x: '5%', y: '50%', color: 'text-orange-400/60 dark:text-orange-600/40' },
  { id: 10, Icon: Heart, size: 'w-12 h-12', delay: 6, x: '90%', y: '85%', color: 'text-red-400/60 dark:text-red-600/40' },
];

export function FloatingShapes() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {FLOATING_SHAPES.map((shape) => (
        <motion.div
          key={shape.id}
          className={`absolute ${shape.size} opacity-80 dark:opacity-40`}
          style={{ left: shape.x, top: shape.y }}
          animate={{
            y: [0, -30, 0],
            rotate: [0, 360],
            scale: [1, 1.2, 1],
            opacity: [0.8, 0.4, 0.8],
          }}
          transition={{
            duration: 12 + shape.delay * 2,
            repeat: Infinity,
            delay: shape.delay,
            ease: "easeInOut"
          }}
        >
          <shape.Icon className={`w-full h-full ${shape.color} drop-shadow-lg`} />
        </motion.div>
      ))}
    </div>
  );
}