import React from 'react'
import { motion } from 'framer-motion'
import { 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Bot,
  Zap,
  Video
} from 'lucide-react'

const Header = ({ backendStatus, aiStatus, onRefreshStatus }) => {
  return (
    <motion.header 
      className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-40"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="relative">
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
              >
                <Video className="w-6 h-6 text-white" />
              </motion.div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">
                AI Video Studio
              </h1>
              <p className="text-slate-400 text-sm">
                Transform prompts into stunning animations
              </p>
            </div>
          </motion.div>

          {/* Status Indicators */}
          <div className="flex items-center space-x-4">
            {/* Backend Status */}
            <motion.div 
              className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="flex items-center space-x-2">
                {backendStatus === 'connected' && (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-400 text-sm font-medium">Backend Online</span>
                  </>
                )}
                {backendStatus === 'disconnected' && (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-red-400 text-sm font-medium">Backend Offline</span>
                  </>
                )}
                {backendStatus === 'checking' && (
                  <>
                    <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />
                    <span className="text-yellow-400 text-sm font-medium">Checking...</span>
                  </>
                )}
              </div>
            </motion.div>

            {/* AI Status */}
            {aiStatus && (
              <motion.div 
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="flex items-center space-x-2">
                  {aiStatus.ready_for_ai ? (
                    <>
                      <Bot className="w-4 h-4 text-green-500" />
                      <span className="text-green-400 text-sm font-medium">AI Ready</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                      <span className="text-yellow-400 text-sm font-medium">AI Limited</span>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {/* Refresh Button */}
            <motion.button
              onClick={onRefreshStatus}
              className="p-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Status Details */}
        {aiStatus && (
          <motion.div 
            className="mt-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="text-slate-300">AI Enhancement:</span>
                <span className={aiStatus.ready_for_ai ? 'text-green-400' : 'text-yellow-400'}>
                  {aiStatus.ready_for_ai ? 'Available' : 'Fallback Mode'}
                </span>
              </div>
              {aiStatus.message && (
                <span className="text-slate-400 text-xs">
                  {aiStatus.message}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  )
}

export default Header