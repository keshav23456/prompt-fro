import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Download, 
  Trash2, 
  Play, 
  Eye,
  Clock,
  Bot,
  Sparkles,
  AlertCircle,
  Film,
  FileText
} from 'lucide-react'
import toast from 'react-hot-toast'
import  manimApi from '../services/ManimApiService'

const VideoLibrary = ({ videos, onVideoDeleted }) => {
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [isDeleting, setIsDeleting] = useState(null)
  const [isDownloading, setIsDownloading] = useState(null)

  const handleDownload = async (video) => {
    setIsDownloading(video.video_id)
    try {
      toast.loading('Preparing download...', { id: 'download' })
      
      // Use the new API service method
      const result = await manimApi.downloadVideoBlob(
        video.video_id, 
        `manim_animation_${video.video_id}.mp4`
      )
      
      toast.success('Download started!', { id: 'download' })
    } catch (error) {
      console.error('Download error:', error)
      toast.error(error.message || 'Failed to download video', { id: 'download' })
    } finally {
      setIsDownloading(null)
    }
  }

  const handleDelete = async (video) => {
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return
    }

    setIsDeleting(video.video_id)
    try {
      await manimApi.deleteVideo(video.video_id)
      onVideoDeleted(video.video_id)
      toast.success('Video deleted successfully')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error(error.message || 'Failed to delete video')
    } finally {
      setIsDeleting(null)
    }
  }

  const handlePreview = (video) => {
    setSelectedVideo(video)
  }

  // Helper function to get video URL
  const getVideoUrl = (videoId) => {
    return `${manimApi.baseURL}/download/${videoId}`
  }

  if (videos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="mb-6"
        >
          <Film className="w-24 h-24 text-slate-600 mx-auto" />
        </motion.div>
        <h3 className="text-2xl font-bold text-white mb-4">No Videos Yet</h3>
        <p className="text-slate-400 max-w-md mx-auto">
          Generate your first video to see it appear here. All your created animations will be stored in this library.
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.h2 
          className="text-3xl font-bold text-white mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Your Video Library
        </motion.h2>
        <motion.p 
          className="text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {videos.length} video{videos.length !== 1 ? 's' : ''} generated
        </motion.p>
      </div>

      {/* Video Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {videos.map((video, index) => (
            <motion.div
              key={video.video_id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-xl p-6 hover:bg-slate-800/30 transition-all"
            >
              {/* Video Preview */}
              <div className="relative mb-4">
                <div className="aspect-video bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700">
                  <video
                    className="w-full h-full object-cover rounded-lg"
                    poster="/api/placeholder/320/180"
                    preload="none"
                  >
                    <source src={getVideoUrl(video.video_id)} type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                    <button
                      onClick={() => handlePreview(video)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors"
                    >
                      <Play className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Video Info */}
              <div className="mb-4">
                <h3 className="text-white font-semibold mb-2 line-clamp-2">
                  {video.enhanced_prompt || video.message || 'Generated Animation'}
                </h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-slate-400">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Video ID: {video.video_id}</span>
                  </div>
                  
                  {video.used_ai_enhancement && (
                    <div className="flex items-center text-green-400">
                      <Bot className="w-4 h-4 mr-2" />
                      <span>AI Enhanced</span>
                    </div>
                  )}
                  
                  {video.used_ai_code && (
                    <div className="flex items-center text-purple-400">
                      <Sparkles className="w-4 h-4 mr-2" />
                      <span>AI Generated Code</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePreview(video)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </button>
                
                <button
                  onClick={() => handleDownload(video)}
                  disabled={isDownloading === video.video_id}
                  className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isDownloading === video.video_id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </button>
                
                <button
                  onClick={() => handleDelete(video)}
                  disabled={isDeleting === video.video_id}
                  className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isDeleting === video.video_id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Video Preview Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Video Preview
                  </h3>
                  <p className="text-slate-400 text-sm">
                    ID: {selectedVideo.video_id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="text-slate-400 hover:text-white p-2"
                >
                  ×
                </button>
              </div>

              {/* Video Player */}
              <div className="mb-6">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    controls
                    autoPlay
                    className="w-full h-full"
                    src={getVideoUrl(selectedVideo.video_id)}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>

              {/* Enhanced Prompt */}
              {selectedVideo.enhanced_prompt && (
                <div className="mb-6">
                  <h4 className="text-white font-semibold mb-2 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Enhanced Prompt
                  </h4>
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {selectedVideo.enhanced_prompt}
                    </p>
                  </div>
                </div>
              )}

              {/* AI Features Used */}
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-3">AI Features Used</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedVideo.used_ai_enhancement ? (
                    <span className="bg-green-600/20 text-green-400 px-3 py-1 rounded-full text-sm flex items-center">
                      <Bot className="w-3 h-3 mr-1" />
                      AI Enhancement
                    </span>
                  ) : (
                    <span className="bg-slate-600/20 text-slate-400 px-3 py-1 rounded-full text-sm flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      No AI Enhancement
                    </span>
                  )}
                  
                  {selectedVideo.used_ai_code ? (
                    <span className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm flex items-center">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Code Generation
                    </span>
                  ) : (
                    <span className="bg-slate-600/20 text-slate-400 px-3 py-1 rounded-full text-sm flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Fallback Code
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => handleDownload(selectedVideo)}
                  disabled={isDownloading === selectedVideo.video_id}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isDownloading === selectedVideo.video_id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>Download</span>
                </button>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default VideoLibrary