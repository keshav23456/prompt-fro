import React from 'react'
import { motion } from 'framer-motion'
import { 
  Heart, 
  Code, 
  Zap, 
  Github, 
  Twitter, 
  Mail,
  ExternalLink
} from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <motion.footer 
      className="border-t border-slate-800/50 bg-slate-900/50 backdrop-blur-lg mt-20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <motion.div 
              className="flex items-center space-x-3 mb-4"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">AI Video Studio</h3>
            </motion.div>
            <p className="text-slate-400 mb-6 max-w-md">
              Transform your ideas into stunning mathematical animations with the power of AI. 
              Built with Manim and powered by advanced language models.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {[
                { icon: Github, href: '#', label: 'GitHub' },
                { icon: Twitter, href: '#', label: 'Twitter' },
                { icon: Mail, href: '#', label: 'Email' }
              ].map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  className="p-2 bg-slate-800/50 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-lg text-slate-400 hover:text-white transition-all"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-white font-semibold mb-4">Features</h4>
            <ul className="space-y-3">
              {[
                'AI-Enhanced Prompts',
                'HD Video Generation',
                'Manim Integration',
                'Real-time Preview',
                'Video Library',
                'Multiple Formats'
              ].map((feature) => (
                <motion.li 
                  key={feature}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                  whileHover={{ x: 5 }}
                >
                  {feature}
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-3">
              {[
                { name: 'Documentation', href: '#' },
                { name: 'API Reference', href: '#' },
                { name: 'Examples', href: '#' },
                { name: 'Tutorials', href: '#' },
                { name: 'Support', href: '#' },
                { name: 'Updates', href: '#' }
              ].map(({ name, href }) => (
                <motion.li key={name}>
                  <a 
                    href={href}
                    className="text-slate-400 hover:text-white transition-colors inline-flex items-center group"
                  >
                    <motion.span
                      whileHover={{ x: 5 }}
                    >
                      {name}
                    </motion.span>
                    <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tech Stack & Credits */}
        <motion.div 
          className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <p className="text-slate-500 text-sm">
            © {currentYear} AI Video Studio. All rights reserved.
          </p>
          <div className="flex items-center space-x-2 text-slate-500 text-sm">
            <span>Built with</span>
            <Code className="w-4 h-4" />
            <span>and</span>
            <Heart className="w-4 h-4 text-red-500" />
          </div>
        </motion.div>
      </div>
    </motion.footer>
  )
}

export default Footer
