import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Send, Phone, CheckCircle } from 'lucide-react';

function Contact() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      // Reset after showing success message
      setTimeout(() => {
        setIsSubmitted(false);
        setFormState({ name: '', email: '', message: '' });
      }, 3000);
    }, 1500);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="py-24 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 relative overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-purple-400 dark:bg-purple-700 rounded-full opacity-10 filter blur-3xl"></div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-400 dark:bg-blue-700 rounded-full opacity-10 filter blur-3xl"></div>
      </div>
      
      {/* SVG pattern */}
      <div className="absolute inset-0 z-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="contact-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#contact-grid)" />
        </svg>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div className="text-center mb-16">
          <div className="inline-block mb-3">
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-sm font-medium py-1 px-3 rounded-full">Contact Us</span>
          </div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            Get in Touch
          </motion.h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Have questions about our cloud pricing comparison tool? Our team is ready to assist you with any inquiries.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-gray-100 dark:border-gray-800 p-8 rounded-2xl shadow-lg flex flex-col justify-center"
          >
            <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Contact Information</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Reach out to our team for support, feature requests, or partnership inquiries. We're here to help you optimize your cloud infrastructure costs.
            </p>
            
            <div className="space-y-6">
              <motion.div 
                className="flex items-center gap-4" 
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-xl">
                  <Mail className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-gray-800 dark:text-gray-200 font-medium">support@cloudprice.com</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-4"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-xl">
                  <Phone className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="text-gray-800 dark:text-gray-200 font-medium">+1 (555) 123-4567</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-4"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-xl">
                  <MessageSquare className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Live Chat</p>
                  <p className="text-gray-800 dark:text-gray-200 font-medium">Available 24/7</p>
                </div>
              </motion.div>
            </div>
            
            <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                {['twitter', 'linkedin', 'github', 'slack'].map((social, i) => (
                  <motion.a 
                    key={i} 
                    href="#" 
                    className="bg-gray-100 dark:bg-gray-800 h-10 w-10 rounded-full flex items-center justify-center"
                    whileHover={{ y: -5, scale: 1.1 }}
                  >
                    <span className="text-blue-600 dark:text-blue-400">{social[0].toUpperCase()}</span>
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
          
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-gray-100 dark:border-gray-800 p-8 rounded-2xl shadow-lg"
          >
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-6"
              >
                <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3 mb-6">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Message Sent!</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Thank you for reaching out. We'll get back to you as soon as possible.
                </p>
              </motion.div>
            ) : (
              <>
                <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Send a Message</h2>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formState.name}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 dark:border-gray-700 rounded-lg p-3 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-all"
                      placeholder="Your Name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formState.email}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 dark:border-gray-700 rounded-lg p-3 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-all"
                      placeholder="Your Email"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Message</label>
                    <textarea
                      name="message"
                      value={formState.message}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 dark:border-gray-700 rounded-lg p-3 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-all"
                      rows="4"
                      placeholder="How can we help you?"
                      required
                    ></textarea>
                  </div>
                  
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting}
                    className="custom-gradient btn-3d text-white font-semibold py-3 px-6 rounded-lg w-full shadow-md hover:shadow-xl transition-all text-lg flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        Send Message <Send className="h-5 w-5 ml-1" />
                      </>
                    )}
                  </motion.button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

export default Contact;