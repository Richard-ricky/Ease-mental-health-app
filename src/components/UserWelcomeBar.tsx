import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { SyncStatusBadge } from "./SyncStatusBadge";
import { LogOut, Heart, Sparkles } from "lucide-react";
import { User, SyncStatus } from "../../utils/appHelpers";

interface UserWelcomeBarProps {
  user: User;
  syncStatus: SyncStatus;
  onSignOut: () => void;
}

export function UserWelcomeBar({ user, syncStatus, onSignOut }: UserWelcomeBarProps) {
  return (
    <motion.div 
      className="relative z-30 border-b bg-white/15 dark:bg-gray-900/25 border-white/25 dark:border-gray-700/35 backdrop-blur-2xl"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/8 via-purple-500/8 to-pink-500/8 dark:from-blue-600/15 dark:via-purple-600/15 dark:to-pink-600/15" />
      
      {/* Animated top border */}
      <motion.div
        className="absolute top-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/60 to-transparent"
        animate={{ width: ["0%", "100%", "0%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-5">
          <motion.div 
            className="flex items-center space-x-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="flex items-center space-x-4"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <motion.div 
                className="flex items-center justify-center w-12 h-12 rounded-full shadow-lg bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600"
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Heart className="w-6 h-6 text-white drop-shadow-lg" />
              </motion.div>
              <div>
                <motion.span 
                  className="text-xl font-semibold tracking-wide text-gray-800 dark:text-gray-200"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Welcome back, {user.name}! ✨
                </motion.span>
                <motion.div 
                  className="flex items-center mt-1 space-x-2 text-sm text-gray-600 dark:text-gray-400"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span>Ready to continue your wellness journey?</span>
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <SyncStatusBadge syncStatus={syncStatus} />
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onSignOut}
              className="px-4 py-2 text-gray-700 transition-all duration-300 border shadow-lg dark:text-gray-300 hover:bg-white/25 dark:hover:bg-gray-800/35 backdrop-blur-sm border-white/15 dark:border-gray-700/35 hover:shadow-xl rounded-xl"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}