

// export default VideoGenerator
import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Loader2, 
  Sparkles, 
  Bot,
  AlertTriangle,
  Settings,
  Zap,
  CheckCircle,
  FileText,
  Play,
  Code,
  Lightbulb,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

import { QUALITY_OPTIONS } from '../services/apiConfig'
import { ApiError } from '../services/apiUtils'
import manimApi from '../services/ManimApiService'

const VideoGenerator = ({ onVideoGenerated, aiStatus, backendStatus }) => {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentStep, setCurrentStep] = useState('')
  const [generationProgress, setGenerationProgress] = useState(0)
  const [useAi, setUseAi] = useState(true)
  const [quality, setQuality] = useState(QUALITY_OPTIONS.MEDIUM)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [generatedVideo, setGeneratedVideo] = useState(null)
  const [videoStatus, setVideoStatus] = useState(null)
  const [abortController, setAbortController] = useState(null)
  const textareaRef = useRef(null)

  const qualityOptions = [
    { 
      value: QUALITY_OPTIONS.LOW, 
      label: 'Low (480p)', 
      description: 'Fast generation, smaller file (15 FPS)' 
    },
    { 
      value: QUALITY_OPTIONS.MEDIUM, 
      label: 'Medium (720p)', 
      description: 'Good balance of quality and speed (30 FPS)' 
    },
    { 
      value: QUALITY_OPTIONS.HIGH, 
      label: 'High (1080p)', 
      description: 'Best quality, longer generation time (60 FPS)' 
    }
  ]

  const examplePrompts = [
    "A sine wave transforming into a cosine wave with colorful gradient",
    "Mathematical equation solving animation with step-by-step visualization",
    "Geometric shapes morphing into each other with smooth transitions",
    "Data visualization showing growth over time with animated charts",
    "Physics simulation of pendulum motion with equations",
    "Abstract mathematical concept visualization with particles"
  ]

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortController) {
        abortController.abort()
      }
    }
  }, [abortController])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!prompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    if (backendStatus !== 'connected') {
      toast.error('Backend is not connected. Please check your server.')
      return
    }

    // Create abort controller for cancellation
    const controller = new AbortController()
    setAbortController(controller)
    
    setIsGenerating(true)
    setCurrentStep('Initializing...')
    setGenerationProgress(0)
    setVideoStatus(null)
    
    try {
      // Use the API service with progress tracking
      const response = await manimApi.generateVideoWithPolling({
        prompt: prompt.trim(),
        quality,
        useAi: useAi && aiStatus?.ready_for_ai,
        onProgress: (status) => {
          setVideoStatus(status)
          
          // Update UI based on status
          if (status.status === 'generating') {
            setCurrentStep('Generating video...')
            setGenerationProgress(50)
          } else if (status.status === 'ready') {
            setCurrentStep('Video ready!')
            setGenerationProgress(100)
          }
        },
        signal: controller.signal
      })

      // Handle successful generation
      if (response.status === 'success') {
        setCurrentStep('Complete!')
        setGenerationProgress(100)
        setGeneratedVideo(response)
        
        // Pass the full response to parent component
        onVideoGenerated({
          ...response,
          finalStatus: response.finalStatus
        })
        
        toast.success('Video generated successfully!')
        setPrompt('')
        
        // Show success message for 5 seconds
        setTimeout(() => setGeneratedVideo(null), 5000)
      } else {
        throw new Error(response.message || 'Generation failed')
      }
      
    } catch (error) {
      console.error('Generation error:', error)
      
      if (error instanceof ApiError) {
        if (error.status === 499) {
          toast.error('Video generation was cancelled')
        } else if (error.status === 408) {
          toast.error('Generation timed out. Please try again with a simpler prompt.')
        } else {
          toast.error(error.message || 'Failed to generate video')
        }
      } else if (error.name === 'AbortError') {
        toast.error('Video generation was cancelled')
      } else {
        toast.error(error.message || 'An unexpected error occurred')
      }
    } finally {
      setIsGenerating(false)
      setCurrentStep('')
      setGenerationProgress(0)
      setVideoStatus(null)
      setAbortController(null)
    }
  }

  const handleCancel = () => {
    if (abortController) {
      abortController.abort()
      toast.info('Cancelling video generation...')
    }
  }

  const handlePromptChange = (e) => {
    setPrompt(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }

  const handleExampleClick = (example) => {
    setPrompt(example)
    if (textareaRef.current) {
      textareaRef.current.focus()
      // Auto-resize textarea
      setTimeout(() => {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
      }, 0)
    }
  }

  // Update progress based on different generation stages
  const getProgressFromStep = (step) => {
    const stepMap = {
      'Initializing...': 5,
      'Processing prompt...': 15,
      'Enhancing prompt with AI...': 25,
      'Generating Manim code with AI...': 40,
      'Generating video...': 60,
      'Rendering video...': 80,
      'Video ready!': 95,
      'Complete!': 100
    }
    return stepMap[step] || 0
  }

  // Get user-friendly step messages
  const getStepMessage = (step) => {
    const messages = {
      'Initializing...': 'Starting generation process...',
      'Processing prompt...': 'Analyzing your request...',
      'Enhancing prompt with AI...': 'AI is enhancing your prompt...',
      'Generating Manim code with AI...': 'AI is writing animation code...',
      'Generating video...': 'Creating your animation...',
      'Rendering video...': 'Rendering high-quality video...',
      'Video ready!': 'Your video is ready!',
      'Complete!': 'Generation complete!'
    }
    return messages[step] || step
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-6"
    >
      <AnimatePresence>
        {generatedVideo && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-green-800">
                  Video Generated Successfully!
                </h3>
                <p className="text-green-600">
                  Your video has been created and added to your library.
                  {generatedVideo.used_ai_enhancement && (
                    <span className="ml-2 text-sm">✨ AI Enhanced</span>
                  )}
                </p>
                {generatedVideo.enhanced_prompt && (
                  <details className="mt-2">
                    <summary className="text-sm text-green-700 cursor-pointer">
                      View enhanced prompt
                    </summary>
                    <p className="text-sm text-green-600 mt-1 italic">
                      "{generatedVideo.enhanced_prompt}"
                    </p>
                  </details>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Generate Your Video</h2>
        <p className="text-gray-600">
          Describe what you want to animate and let AI create it for you
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4" />
            <span>Animation Description</span>
          </label>
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={handlePromptChange}
            placeholder="Describe the animation you want to create... Be specific about mathematical concepts, colors, movements, and visual elements you'd like to see."
            disabled={isGenerating}
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none min-h-[120px] disabled:bg-gray-100 disabled:cursor-not-allowed"
            maxLength={1000}
          />
          <div className="flex justify-between items-center mt-2 text-sm">
            <span className={`${prompt.length > 800 ? 'text-orange-600' : 'text-gray-500'}`}>
              {prompt.length}/1000 characters
            </span>
            {prompt.length > 800 && (
              <span className="text-orange-600">
                Consider keeping it concise for better results
              </span>
            )}
          </div>
        </div>

        {!isGenerating && prompt.length === 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <h3 className="flex items-center space-x-2 text-lg font-semibold text-gray-700">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <span>Example Prompts</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {examplePrompts.map((example, index) => (
                <motion.button
                  key={index}
                  type="button"
                  onClick={() => handleExampleClick(example)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-3 text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors text-sm"
                >
                  <span className="text-gray-400">"</span>
                  {example}
                  <span className="text-gray-400">"</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Advanced Settings</span>
            <motion.div
              animate={{ rotate: showAdvanced ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-gray-400"
            >
              ▼
            </motion.div>
          </button>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6 p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Video Quality
                  </label>
                  <div className="space-y-2">
                    {qualityOptions.map((option) => (
                      <motion.label
                        key={option.value}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-white transition-colors"
                      >
                        <input
                          type="radio"
                          name="quality"
                          value={option.value}
                          checked={quality === option.value}
                          onChange={(e) => setQuality(e.target.value)}
                          disabled={isGenerating}
                          className="text-purple-600 focus:ring-purple-500"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{option.label}</div>
                          <div className="text-sm text-gray-600">{option.description}</div>
                        </div>
                      </motion.label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    AI Enhancement
                  </label>
                  <motion.label
                    whileHover={{ scale: 1.02 }}
                    className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-white transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={useAi}
                      onChange={(e) => setUseAi(e.target.checked)}
                      disabled={isGenerating || !aiStatus?.ready_for_ai}
                      className="mt-1 text-purple-600 focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Bot className="w-4 h-4 text-purple-600" />
                        <span className="font-medium text-gray-800">Use AI Enhancement</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {aiStatus?.ready_for_ai 
                          ? 'Enhance prompts and generate better code with AI'
                          : 'AI enhancement is currently unavailable'
                        }
                      </div>
                    </div>
                  </motion.label>

                  {!aiStatus?.ready_for_ai && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm text-yellow-800">
                          AI features are limited. Fallback mode will be used.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <div className="flex justify-between items-center">
                <span className="text-blue-800 font-medium">
                  {getStepMessage(currentStep)}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-600 text-sm">{generationProgress}%</span>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="text-red-600 hover:text-red-700 p-1"
                    title="Cancel generation"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <motion.div
                  className="bg-blue-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${generationProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="flex items-center space-x-2 text-blue-700">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">
                  This may take a few minutes... You can cancel anytime.
                </span>
              </div>
              {videoStatus && (
                <div className="text-xs text-blue-600">
                  Status: {videoStatus.status}
                  {videoStatus.file_size_mb && (
                    <span className="ml-2">• Size: {videoStatus.file_size_mb} MB</span>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex space-x-4">
          <motion.button
            type="submit"
            disabled={isGenerating || !prompt.trim() || backendStatus !== 'connected'}
            whileHover={{ scale: isGenerating ? 1 : 1.05 }}
            whileTap={{ scale: isGenerating ? 1 : 0.95 }}
            className="flex-1 flex items-center justify-center space-x-2 py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating Video...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>Generate Video</span>
              </>
            )}
          </motion.button>
        </div>

        {backendStatus !== 'connected' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-red-800">
                Backend is not connected. Please check if the server is running.
              </span>
            </div>
          </div>
        )}
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <Bot className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">AI-Powered</h3>
          <p className="text-gray-600 text-sm">
            Advanced AI enhances your prompts and generates optimized animation code
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <Code className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Manim Engine</h3>
          <p className="text-gray-600 text-sm">
            Powered by Manim for professional-quality mathematical animations
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <Play className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">HD Quality</h3>
          <p className="text-gray-600 text-sm">
            Generate videos in multiple quality options up to 1080p resolution
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default VideoGenerator