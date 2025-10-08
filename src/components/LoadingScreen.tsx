import { motion } from "framer-motion";
import { Heart, Sparkles, Brain, Shield, Zap, Star, Circle, Triangle } from "lucide-react";
import { SyncStatus } from "../../utils/appHelpers";

interface LoadingScreenProps {
  syncStatus: SyncStatus;
}

const FloatingIcon = ({ icon: Icon, delay = 0, x = "50%", y = "50%" }: { 
  icon: any; 
  delay?: number; 
  x?: string; 
  y?: string; 
}) => (
  <motion.div
    className="absolute"
    style={{ left: x, top: y }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      rotate: [0, 180, 360],
    }}
    transition={{
      duration: 3,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    <Icon className="w-6 h-6 text-purple-400 dark:text-purple-300" />
  </motion.div>
);

const PulsingDot = ({ delay = 0, size = "w-2 h-2" }: { delay?: number; size?: string }) => (
  <motion.div
    className={`${size} bg-gradient-to-r from-purple-500 to-blue-600 rounded-full`}
    animate={{
      scale: [1, 1.5, 1],
      opacity: [0.5, 1, 0.5],
    }}
    transition={{
      duration: 1.5,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  />
);

export function LoadingScreen({ syncStatus }: LoadingScreenProps) {
  const getStatusMessage = () => {
    switch (syncStatus) {
      case 'syncing':
        return {
          title: "Syncing Your Data",
          subtitle: "Connecting to cloud services...",
          icon: Zap,
          color: "from-amber-500 to-orange-600"
        };
      case 'offline':
        return {
          title: "Starting Offline Mode",
          subtitle: "Ready to work without internet...",
          icon: Shield,
          color: "from-slate-500 to-gray-600"
        };
      default:
        return {
          title: "Loading Ease",
          subtitle: "Preparing your wellness journey...",
          icon: Heart,
          color: "from-purple-500 to-blue-600"
        };
    }
  };

  const status = getStatusMessage();
  const StatusIcon = status.icon;

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900">
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute rounded-full top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-300/30 to-pink-300/30 dark:from-purple-600/20 dark:to-pink-600/20 filter blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute rounded-full bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-tr from-blue-300/30 to-cyan-300/30 dark:from-blue-600/20 dark:to-cyan-600/20 filter blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <FloatingIcon icon={Sparkles} delay={0} x="20%" y="20%" />
        <FloatingIcon icon={Brain} delay={1} x="80%" y="30%" />
        <FloatingIcon icon={Heart} delay={2} x="15%" y="70%" />
        <FloatingIcon icon={Star} delay={3} x="85%" y="60%" />
        <FloatingIcon icon={Circle} delay={1.5} x="70%" y="15%" />
        <FloatingIcon icon={Triangle} delay={2.5} x="30%" y="80%" />
      </div>

      {/* Main Content */}
      <motion.div
        className="relative z-10 px-8 space-y-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Logo Section */}
        <motion.div
          className="space-y-6"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        >
          {/* Animated Logo */}
          <motion.div
            className={`w-24 h-24 mx-auto bg-gradient-to-br ${status.color} rounded-3xl flex items-center justify-center shadow-2xl relative`}
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Glow effect */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-br ${status.color} rounded-3xl blur-xl opacity-50`}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <StatusIcon className="relative z-10 w-12 h-12 text-white" />
            </motion.div>
          </motion.div>

          {/* App Name */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 dark:from-purple-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text">
              Ease
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Mental Health & Wellness
            </p>
          </motion.div>
        </motion.div>

        {/* Status Section */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <h2 className="text-xl font-medium text-gray-800 dark:text-gray-200">
            {status.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {status.subtitle}
          </p>
        </motion.div>

        {/* Loading Animation */}
        <motion.div
          className="flex items-center justify-center space-x-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <PulsingDot delay={0} />
          <PulsingDot delay={0.2} />
          <PulsingDot delay={0.4} />
          <PulsingDot delay={0.6} size="w-3 h-3" />
          <PulsingDot delay={0.8} />
          <PulsingDot delay={1} />
          <PulsingDot delay={1.2} />
        </motion.div>

        {/* Features Preview */}
        <motion.div
          className="max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { icon: Brain, label: "AI Support", color: "text-purple-500" },
              { icon: Heart, label: "Mood Tracking", color: "text-pink-500" },
              { icon: Shield, label: "Privacy First", color: "text-blue-500" },
            ].map((feature, index) => (
              <motion.div
                key={feature.label}
                className="space-y-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5 + index * 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className={`w-10 h-10 mx-auto bg-white/10 dark:bg-gray-800/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20 dark:border-gray-700/30`}>
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {feature.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Loading Progress */}
        <motion.div
          className="max-w-xs mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          <div className="w-full h-1 rounded-full bg-gray-200/50 dark:bg-gray-700/30 backdrop-blur-sm">
            <motion.div
              className={`h-1 bg-gradient-to-r ${status.color} rounded-full`}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ 
                duration: 3, 
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          </div>
        </motion.div>

        {/* Motivational Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.8 }}
          className="max-w-sm mx-auto"
        >
          <p className="text-sm italic text-gray-500 dark:text-gray-400">
            "Every step forward is a step towards better mental health"
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}