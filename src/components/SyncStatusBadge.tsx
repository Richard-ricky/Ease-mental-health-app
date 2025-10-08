import { motion } from "framer-motion";
import { Cloud, Zap, Database } from "lucide-react";
import { SyncStatus } from "../../utils/appHelpers";

interface SyncStatusBadgeProps {
  syncStatus: SyncStatus;
}

const getSyncStatusConfig = (syncStatus: SyncStatus) => {
  switch (syncStatus) {
    case 'synced':
      return {
        bg: 'bg-gradient-to-r from-emerald-500 to-green-600',
        text: 'text-white',
        icon: Cloud,
        label: 'Cloud Synced',
        pulse: false,
        glow: 'shadow-emerald-500/50'
      };
    case 'syncing':
      return {
        bg: 'bg-gradient-to-r from-amber-500 to-orange-600',
        text: 'text-white',
        icon: Zap,
        label: 'Syncing...',
        pulse: true,
        glow: 'shadow-amber-500/50'
      };
    default:
      return {
        bg: 'bg-gradient-to-r from-slate-500 to-gray-600',
        text: 'text-white',
        icon: Database,
        label: 'Offline Mode',
        pulse: false,
        glow: 'shadow-slate-500/50'
      };
  }
};

export function SyncStatusBadge({ syncStatus }: SyncStatusBadgeProps) {
  const config = getSyncStatusConfig(syncStatus);
  const Icon = config.icon;

  return (
    <motion.div
      className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium ${config.bg} ${config.text} shadow-lg ${config.glow} backdrop-blur-sm`}
      animate={config.pulse ? { 
        scale: [1, 1.05, 1],
        boxShadow: [
          `0 4px 20px rgba(245, 158, 11, 0.3)`,
          `0 6px 25px rgba(245, 158, 11, 0.5)`,
          `0 4px 20px rgba(245, 158, 11, 0.3)`
        ]
      } : {}}
      transition={config.pulse ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
      whileHover={{ scale: 1.05 }}
    >
      <motion.div
        animate={config.pulse ? { rotate: 360 } : { rotate: [0, 5, -5, 0] }}
        transition={config.pulse ? { duration: 2, repeat: Infinity, ease: "linear" } : { duration: 4, repeat: Infinity }}
      >
        <Icon className="w-4 h-4 drop-shadow-sm" />
      </motion.div>
      <span className="font-medium tracking-wide">{config.label}</span>
    </motion.div>
  );
}