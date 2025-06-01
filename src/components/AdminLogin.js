// // Login.js
// import React, { useState } from 'react';
// import { Mail, Lock, LogIn, Shield } from 'lucide-react';
// import '../styles/AdminAuth.css'; // Adjust the path as necessary

// const Login = ({ onLoginSuccess }) => {
//   // Form state
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
  
//   // Default admin credentials
//   const DEFAULT_ADMIN_EMAIL = 'admin@gmail.com';
//   const DEFAULT_ADMIN_PASSWORD = 'admin123';
  
//   const handleEmailChange = (e) => {
//     setEmail(e.target.value);
//   };
  
//   const handlePasswordChange = (e) => {
//     setPassword(e.target.value);
//   };
  
//   const handleLogin = (e) => {
//     if (e) e.preventDefault();
    
//     // Validate inputs
//     if (!email || !password) {
//       setError('Please enter both email and password');
//       return;
//     }
    
//     setLoading(true);
//     setError(null);
    
//     // Simulate authentication delay
//     setTimeout(() => {
//       // Check against default admin credentials
//       if (email === DEFAULT_ADMIN_EMAIL && password === DEFAULT_ADMIN_PASSWORD) {
//         // Call the success handler from parent
//         onLoginSuccess(email);
//       } else {
//         setError('Invalid credentials. Please try again.');
//       }
      
//       setLoading(false);
//     }, 800); // Simulate network delay
//   };
  
//   return (
//     <div className="login-container">
//       <div className="login-card">
//         <div className="login-header">
//           <div className="login-icon-container">
//             <Shield size={40} className="login-icon" />
//           </div>
//           <h1 className="login-title">Admin Portal</h1>
//           <p className="login-subtitle">Parking Management System</p>
//         </div>
        
//         <div className="login-body">
//           {error && (
//             <div className="login-error">
//               {error}
//             </div>
//           )}
          
//           <form onSubmit={handleLogin} className="login-form">
//             <div className="form-group">
//               <label htmlFor="admin-email" className="form-label">
//                 Admin Email
//               </label>
//               <div className="input-container">
//                 <Mail size={20} className="input-icon" />
//                 <input
//                   type="email"
//                   id="admin-email"
//                   placeholder="admin@example.com"
//                   value={email}
//                   onChange={handleEmailChange}
//                   disabled={loading}
//                   className="form-input"
//                 />
//               </div>
//             </div>
            
//             <div className="form-group">
//               <label htmlFor="admin-password" className="form-label">
//                 Password
//               </label>
//               <div className="input-container">
//                 <Lock size={20} className="input-icon" />
//                 <input
//                   type="password"
//                   id="admin-password"
//                   placeholder="Enter your password"
//                   value={password}
//                   onChange={handlePasswordChange}
//                   disabled={loading}
//                   className="form-input"
//                 />
//               </div>
//             </div>
            
//             <button
//               type="submit"
//               className="login-button"
//               disabled={loading}
//             >
//               {loading ? 'Signing in...' : 'Admin Login'}
//               {!loading && <LogIn size={18} className="button-icon" />}
//             </button>
            
//             <div className="login-credentials">
//               <p>Default credentials for demo:</p>
//               <p className="credentials-detail">Email: admin@gmail.com</p>
//               <p className="credentials-detail">Password: admin123</p>
//             </div>
//           </form>
//         </div>
        
//         <div className="login-footer">
//           <p>Secured admin portal for parking system management</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;




// Login.js - Complete Responsive Component
import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, LogIn, Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import '../styles/AdminAuth.css'; // Adjust the path as necessary

const Login = ({ onLoginSuccess }) => {
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  
  // Responsive state
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth <= 768,
    isLandscape: window.innerWidth > window.innerHeight
  });
  
  // Refs
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const formRef = useRef(null);
  const initialViewportHeight = useRef(window.innerHeight);
  
  // Default admin credentials
  const DEFAULT_ADMIN_EMAIL = 'admin@gmail.com';
  const DEFAULT_ADMIN_PASSWORD = 'admin123';
  
  // Handle screen resize and keyboard detection
  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      const heightDifference = initialViewportHeight.current - newHeight;
      
      setScreenSize({
        width: newWidth,
        height: newHeight,
        isMobile: newWidth <= 768,
        isLandscape: newWidth > newHeight
      });
      
      // Detect virtual keyboard on mobile
      if (newWidth <= 768) {
        setIsKeyboardOpen(heightDifference > 150);
      }
    };
    
    // Throttled resize handler
    let resizeTimeout;
    const throttledResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 100);
    };
    
    window.addEventListener('resize', throttledResize);
    window.addEventListener('orientationchange', handleResize);
    
    // Initial check
    handleResize();
    
    return () => {
      window.removeEventListener('resize', throttledResize);
      window.removeEventListener('orientationchange', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);
  
  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };
  
  // Handle focus events
  const handleFocus = (field) => {
    setFocusedField(field);
    
    // On mobile, scroll the focused input into view
    if (screenSize.isMobile) {
      setTimeout(() => {
        const activeInput = field === 'email' ? emailRef.current : passwordRef.current;
        if (activeInput) {
          activeInput.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 300); // Wait for keyboard animation
    }
  };
  
  const handleBlur = () => {
    setFocusedField(null);
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Validate form
  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('Please enter your email address');
      emailRef.current?.focus();
      return false;
    }
    
    if (!formData.password.trim()) {
      setError('Please enter your password');
      passwordRef.current?.focus();
      return false;
    }
    
    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      emailRef.current?.focus();
      return false;
    }
    
    return true;
  };
  
  // Email validation
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check against default admin credentials
      if (formData.email === DEFAULT_ADMIN_EMAIL && formData.password === DEFAULT_ADMIN_PASSWORD) {
        // Success animation delay
        await new Promise(resolve => setTimeout(resolve, 200));
        onLoginSuccess(formData.email);
      } else {
        setError('Invalid credentials. Please check your email and password.');
        
        // Shake animation for error
        if (formRef.current) {
          formRef.current.classList.add('shake-error');
          setTimeout(() => {
            formRef.current?.classList.remove('shake-error');
          }, 500);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle Enter key navigation
  const handleKeyDown = (e, field) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (field === 'email') {
        passwordRef.current?.focus();
      } else if (field === 'password') {
        handleSubmit(e);
      }
    }
  };
  
  // Auto-fill demo credentials
  const fillDemoCredentials = () => {
    setFormData({
      email: DEFAULT_ADMIN_EMAIL,
      password: DEFAULT_ADMIN_PASSWORD
    });
    setError(null);
  };
  
  // Get responsive classes
  const getContainerClasses = () => {
    const classes = ['login-container'];
    
    if (screenSize.isMobile) classes.push('mobile');
    if (screenSize.isLandscape && screenSize.isMobile) classes.push('landscape');
    if (isKeyboardOpen) classes.push('keyboard-open');
    
    return classes.join(' ');
  };
  
  const getCardClasses = () => {
    const classes = ['login-card'];
    
    if (loading) classes.push('loading');
    if (error) classes.push('error');
    
    return classes.join(' ');
  };
  
  return (
    <div className={getContainerClasses()}>
      <div className={getCardClasses()}>
        {/* Header */}
        <div className="login-header">
          <div className="login-icon-container">
            <Shield size={screenSize.isMobile ? 32 : 40} className="login-icon" />
          </div>
          <h1 className="login-title">Admin Portal</h1>
          <p className="login-subtitle">Parking Management System</p>
        </div>
        
        {/* Body */}
        <div className="login-body">
          {/* Error Message */}
          {error && (
            <div className="login-error" role="alert" aria-live="polite">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          
          {/* Login Form */}
          <form 
            ref={formRef}
            onSubmit={handleSubmit} 
            className="login-form"
            noValidate
          >
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="admin-email" className="form-label">
                Admin Email
              </label>
              <div className="input-container">
                <Mail 
                  size={20} 
                  className={`input-icon ${focusedField === 'email' ? 'focused' : ''}`} 
                />
                <input
                  ref={emailRef}
                  type="email"
                  id="admin-email"
                  name="email"
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onFocus={() => handleFocus('email')}
                  onBlur={handleBlur}
                  onKeyDown={(e) => handleKeyDown(e, 'email')}
                  disabled={loading}
                  className={`form-input ${focusedField === 'email' ? 'focused' : ''}`}
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  required
                  aria-describedby={error && error.includes('email') ? 'email-error' : undefined}
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="admin-password" className="form-label">
                Password
              </label>
              <div className="input-container">
                <Lock 
                  size={20} 
                  className={`input-icon ${focusedField === 'password' ? 'focused' : ''}`} 
                />
                <input
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  id="admin-password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onFocus={() => handleFocus('password')}
                  onBlur={handleBlur}
                  onKeyDown={(e) => handleKeyDown(e, 'password')}
                  disabled={loading}
                  className={`form-input ${focusedField === 'password' ? 'focused' : ''}`}
                  autoComplete="current-password"
                  required
                  aria-describedby={error && error.includes('password') ? 'password-error' : undefined}
                />
                
                {/* Password Toggle Button */}
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                  disabled={loading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--neutral-400)',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease',
                    zIndex: 2
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = 'var(--neutral-600)';
                    e.target.style.backgroundColor = 'var(--neutral-100)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = 'var(--neutral-400)';
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              className={`login-button ${loading ? 'loading' : ''}`}
              disabled={loading || !formData.email || !formData.password}
              aria-describedby="login-button-desc"
            >
              <span>{loading ? 'Signing in...' : 'Admin Login'}</span>
              {!loading && <LogIn size={18} className="button-icon" />}
              {loading && (
                <div 
                  className="loading-spinner"
                  style={{
                    width: '18px',
                    height: '18px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}
                />
              )}
            </button>
            
            {/* Screen Reader Description */}
            <div id="login-button-desc" className="sr-only">
              Click to sign in to the admin portal
            </div>
          </form>
          
          {/* Demo Credentials */}
          <div className="login-credentials">
            <p>Default credentials for demo:</p>
            <div className="credentials-container">
              <p className="credentials-detail">Email: {DEFAULT_ADMIN_EMAIL}</p>
              <p className="credentials-detail">Password: {DEFAULT_ADMIN_PASSWORD}</p>
            </div>
            
            {/* Auto-fill Button */}
            <button
              type="button"
              className="auto-fill-button"
              onClick={fillDemoCredentials}
              disabled={loading}
              style={{
                marginTop: 'var(--spacing-md)',
                padding: 'var(--spacing-xs) var(--spacing-md)',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-xs)',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                opacity: loading ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = 'var(--primary-dark)';
                  e.target.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'var(--primary)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Auto-fill Demo Credentials
            </button>
          </div>
        </div>
        
        {/* Footer */}
        <div className="login-footer">
          <p>Secured admin portal for parking system management</p>
        </div>
      </div>
      
      {/* Loading Overlay for Mobile */}
      {loading && screenSize.isMobile && (
        <div 
          className="mobile-loading-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(4px)'
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--spacing-xl)',
              textAlign: 'center',
              boxShadow: 'var(--shadow-xl)'
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '3px solid var(--neutral-200)',
                borderTop: '3px solid var(--primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto var(--spacing-md)'
              }}
            />
            <p style={{ margin: 0, color: 'var(--neutral-700)', fontWeight: '500' }}>
              Signing you in...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;