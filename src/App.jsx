import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Download, 
  Trash2, 
  Settings, 
  Sparkles, 
  Video,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Bot,
  Zap
} from 'lucide-react'
import toast from 'react-hot-toast'
import VideoGenerator from './components/VideoGenerator'
import VideoLibrary from './components/VideoLibrary'
import Header from './components/Header'
import Footer from './components/Footer'
import { manimApi } from './services/ManimApiService'

function App() {
  const [activeTab, setActiveTab] = useState('generate')
  const [videos, setVideos] = useState([])
  const [aiStatus, setAiStatus] = useState(null)
  const [backendStatus, setBackendStatus] = useState('checking')

  useEffect(() => {
    checkBackendStatus()
    checkAiStatus()
    loadVideoLibrary()
  }, [])

  const checkBackendStatus = async () => {
    try {
      const response = await manimApi.getApiStatus()
      setBackendStatus('connected')
      toast.success('Connected to backend successfully!')
    } catch (error) {
      setBackendStatus('disconnected')
      toast.error('Failed to connect to backend. Please check if the server is running.')
    }
  }

  // Restores the video library from the backend's persisted index, so
  // previously generated videos survive a page refresh.
  const loadVideoLibrary = async () => {
    try {
      const { videos: existing } = await manimApi.listVideos()
      setVideos(existing || [])
    } catch (error) {
      console.error('Failed to load video library:', error)
    }
  }

  const checkAiStatus = async () => {
    try {
      const status = await manimApi.getAiStatus()
      setAiStatus(status)
    } catch (error) {
      console.error('Failed to check AI status:', error)
      setAiStatus({ ready_for_ai: false, error: error.message })
    }
  }

  const handleVideoGenerated = (videoData) => {
    setVideos(prev => [videoData, ...prev])
    toast.success('Video generated successfully!')
  }

  const handleVideoDeleted = (videoId) => {
    setVideos(prev => prev.filter(video => video.video_id !== videoId))
    toast.success('Video deleted successfully')
  }

  const handleRefreshStatus = () => {
    setBackendStatus('checking')
    checkBackendStatus()
    checkAiStatus()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10">
        <Header 
          backendStatus={backendStatus}
          aiStatus={aiStatus}
          onRefreshStatus={handleRefreshStatus}
        />

        <main className="container mx-auto px-4 py-8">
          {/* Navigation Tabs */}
          <div className="flex justify-center mb-8">
            <motion.div 
              className="flex bg-slate-800/50 backdrop-blur-sm rounded-lg p-2 border border-slate-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <button
                onClick={() => setActiveTab('generate')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === 'generate' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                <span>Generate Video</span>
              </button>
              <button
                onClick={() => setActiveTab('library')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === 'library' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Video className="w-5 h-5" />
                <span>Video Library</span>
                {videos.length > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    {videos.length}
                  </span>
                )}
              </button>
            </motion.div>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'generate' && (
                <VideoGenerator 
                  onVideoGenerated={handleVideoGenerated}
                  aiStatus={aiStatus}
                  backendStatus={backendStatus}
                />
              )}
              {activeTab === 'library' && (
                <VideoLibrary 
                  videos={videos}
                  onVideoDeleted={handleVideoDeleted}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Status Bar */}
          <motion.div 
            className="fixed bottom-4 right-4 bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-lg p-4 max-w-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <h3 className="font-semibold text-white mb-2 flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              System Status
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Backend:</span>
                <div className="flex items-center">
                  {backendStatus === 'connected' && (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-green-400">Connected</span>
                    </>
                  )}
                  {backendStatus === 'disconnected' && (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-500 mr-1" />
                      <span className="text-red-400">Disconnected</span>
                    </>
                  )}
                  {backendStatus === 'checking' && (
                    <>
                      <Loader2 className="w-4 h-4 text-yellow-500 mr-1 animate-spin" />
                      <span className="text-yellow-400">Checking...</span>
                    </>
                  )}
                </div>
              </div>
              {aiStatus && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">AI:</span>
                  <div className="flex items-center">
                    {aiStatus.ready_for_ai ? (
                      <>
                        <Bot className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-green-400">Ready</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-yellow-400">Limited</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </main>

        <Footer />
      </div>
    </div>
  )
}

export default App