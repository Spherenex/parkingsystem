




// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { 
//   Users, ArrowLeft, Clock, MapPin, Activity, ChevronRight, 
//   CheckCircle, Camera, Bike, Truck, Car, RefreshCw, X, Video, Eye,
//   AlertCircle, StopCircle, XCircle, Play
// } from 'lucide-react';

// const UsersList = ({ onBack, recentActivity = [] }) => {
//   // All state declarations
//   const [users, setUsers] = useState([]);
//   const [allBookings, setAllBookings] = useState([
//     {
//       id: 'booking_001',
//       parkingLotName: 'Tech Park Main',
//       spaceId: '1',
//       userId: 'user_001',
//       location: 'Bangalore Tech Park, Whitefield',
//       startTime: new Date(),
//       endTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
//       amount: 80,
//       status: 'active',
//       vehicleType: 2,
//       bookingId: 'BP001'
//     }
//   ]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [expandedActivity, setExpandedActivity] = useState(null);
//   const [userBookings, setUserBookings] = useState([]);
//   const [activityError, setActivityError] = useState(null);
//   const [loadingBookings, setLoadingBookings] = useState(false);
//   const [connectionStatus, setConnectionStatus] = useState(0);
//   const [occupiedSlots, setOccupiedSlots] = useState([]);
//   const [statusMessage, setStatusMessage] = useState('');
//   const [firebaseStatus, setFirebaseStatus] = useState(0);
  
//   // Camera and simulation states
//   const [activeCameras, setActiveCameras] = useState({});
//   const [detectedPlates, setDetectedPlates] = useState({});
//   const [cameraTimers, setCameraTimers] = useState({});
//   const [plateDetectionInterval, setPlateDetectionInterval] = useState({});
//   const [wrongPlateDetections, setWrongPlateDetections] = useState({});
//   const [cameraStartTimes, setCameraStartTimes] = useState({});
//   const [simulationTimers, setSimulationTimers] = useState({});
//   const [simulationStatus, setSimulationStatus] = useState({});
  
//   const [zones, setZones] = useState([
//     { id: 1, name: 'Zone A', type: 'Car', occupied: false },
//     { id: 2, name: 'Zone B', type: 'Car', occupied: false },
//     { id: 3, name: 'Zone C', type: 'Car', occupied: false }
//   ]);

//   // Refs for camera functionality
//   const videoRefs = useRef({});
//   const canvasRefs = useRef({});
//   const streamRefs = useRef({});
//   const cleanupFlags = useRef({});

//   // Constants
//   const authorizedPlates = [
//     'KA-01-HB-1234',
//     'KA-05-MN-5678', 
//     'KA-02-CD-9012',
//     'KA19EQ1316' // Hardcoded simulation plate
//   ];

//   const allSimulatedPlates = [
//     ...authorizedPlates,
//     'KA-03-EF-7890',
//     'KA-04-GH-2468',
//     'TN-09-AB-3456',
//     'MH-12-CD-7890'
//   ];

//   // Initialize with sample data
//   useEffect(() => {
//     setUserBookings(allBookings);
//     setLoading(false);
//     setLoadingBookings(false);
//   }, []);

//   // Helper functions
//   const formatDateTime = (date) => {
//     if (!date) return 'N/A';
//     return date.toLocaleString('en-US', {
//       weekday: 'short',
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//       timeZone: 'Asia/Kolkata'
//     });
//   };

//   const getTimeDifference = (start, end) => {
//     if (!start || !end) return 'N/A';
//     const diffMs = end - start;
//     const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
//     const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
//     return `${diffHrs}h ${diffMins}m`;
//   };

//   const formatRemainingTime = useCallback((ms) => {
//     const minutes = Math.floor(ms / 60000);
//     const seconds = Math.floor((ms % 60000) / 1000);
//     return `${minutes}:${seconds.toString().padStart(2, '0')}`;
//   }, []);

//   const getRemainingTime = useCallback((bookingId) => {
//     const startTime = cameraStartTimes[bookingId];
//     if (!startTime) return 0;
    
//     const now = new Date();
//     const elapsed = now - startTime;
//     const remaining = 300000 - elapsed; // 5 minutes - elapsed
    
//     return Math.max(0, remaining);
//   }, [cameraStartTimes]);

//   const getSimulationProgress = useCallback((bookingId) => {
//     const simulation = simulationStatus[bookingId];
//     if (!simulation) return null;
    
//     const now = new Date();
//     const elapsed = now - simulation.startTime;
    
//     if (simulation.phase === 'waiting_checkin') {
//       const timeToCheckin = 20000 - elapsed; // 20 seconds
//       if (timeToCheckin > 0) {
//         return {
//           phase: 'waiting_checkin',
//           timeRemaining: timeToCheckin,
//           message: `Check-in in ${Math.ceil(timeToCheckin / 1000)}s`
//         };
//       }
//     } else if (simulation.phase === 'checkin') {
//       const timeToCheckout = 140000 - elapsed; // 2m20s total
//       if (timeToCheckout > 0) {
//         return {
//           phase: 'waiting_checkout',
//           timeRemaining: timeToCheckout,
//           message: `Checkout in ${Math.ceil(timeToCheckout / 1000)}s`
//         };
//       }
//     }
    
//     return null;
//   }, [simulationStatus]);

//   const determineBookingStatus = useCallback((booking) => {
//     if (!booking) return 'active';
    
//     const bookingId = booking.id;
//     const simulation = simulationStatus[bookingId];
//     const detectedPlate = detectedPlates[bookingId];
    
//     if (simulation?.completed || (detectedPlate?.isSimulated && detectedPlate?.checkoutTime)) {
//       return 'completed';
//     }
    
//     if (detectedPlate?.isSimulated && detectedPlate?.checkinTime && !detectedPlate?.checkoutTime) {
//       return 'active';
//     }
    
//     return booking.status || 'active';
//   }, [simulationStatus, detectedPlates]);

//   // Core camera functions
//   const captureImageFromVideo = useCallback((bookingId) => {
//     const video = videoRefs.current[bookingId];
//     const canvas = canvasRefs.current[bookingId];
    
//     if (!video || !canvas) return null;
    
//     const context = canvas.getContext('2d');
//     canvas.width = video.videoWidth || 640;
//     canvas.height = video.videoHeight || 480;
    
//     try {
//       context.drawImage(video, 0, 0, canvas.width, canvas.height);
//       return canvas.toDataURL('image/jpeg');
//     } catch (error) {
//       console.error('Error capturing image:', error);
//       return null;
//     }
//   }, []);

//   // Simulation functions
//   const simulateCheckin = useCallback(async (bookingId) => {
//     const hardcodedPlate = 'KA19EQ1316';
    
//     console.log(`🎬 SIMULATION: Starting check-in for booking ${bookingId}`);
    
//     setSimulationStatus(prev => ({
//       ...prev,
//       [bookingId]: {
//         ...prev[bookingId],
//         phase: 'checkin',
//         plateNumber: hardcodedPlate,
//         checkinTime: new Date()
//       }
//     }));
    
//     setActiveCameras(prev => ({
//       ...prev,
//       [bookingId]: {
//         ...prev[bookingId],
//         simulatingCheckin: true,
//         simulationPlate: hardcodedPlate
//       }
//     }));
    
//     const imageData = captureImageFromVideo(bookingId) || 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//2Q=';
    
//     setStatusMessage(`🎬 SIMULATION: Check-in successful! Vehicle ${hardcodedPlate} detected at ${new Date().toLocaleTimeString()}`);
    
//     setDetectedPlates(prev => ({
//       ...prev,
//       [bookingId]: {
//         plateNumber: hardcodedPlate,
//         checkinTime: new Date(),
//         imageData: imageData,
//         isAuthorized: true,
//         isSimulated: true
//       }
//     }));
    
//     setActiveCameras(prev => ({
//       ...prev,
//       [bookingId]: {
//         ...prev[bookingId],
//         mode: 'waiting_checkout',
//         checkedIn: true,
//         simulatingCheckin: false,
//         waitingForCheckout: true
//       }
//     }));
    
//     console.log(`🎬 SIMULATION: Check-in completed for booking ${bookingId}`);
//   }, [captureImageFromVideo]);

//   const simulateCheckout = useCallback(async (bookingId) => {
//     const hardcodedPlate = 'KA19EQ1316';
    
//     console.log(`🎬 SIMULATION: Starting checkout for booking ${bookingId}`);
    
//     setSimulationStatus(prev => ({
//       ...prev,
//       [bookingId]: {
//         ...prev[bookingId],
//         phase: 'checkout',
//         checkoutTime: new Date()
//       }
//     }));
    
//     setActiveCameras(prev => ({
//       ...prev,
//       [bookingId]: {
//         ...prev[bookingId],
//         simulatingCheckout: true,
//         waitingForCheckout: false
//       }
//     }));
    
//     const imageData = captureImageFromVideo(bookingId) || 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//2Q=';
    
//     setStatusMessage(`🎬 SIMULATION: Checkout successful! Vehicle ${hardcodedPlate} departed at ${new Date().toLocaleTimeString()}`);
    
//     setDetectedPlates(prev => ({
//       ...prev,
//       [bookingId]: {
//         ...prev[bookingId],
//         checkoutTime: new Date(),
//         completed: true
//       }
//     }));
    
//     setSimulationStatus(prev => ({
//       ...prev,
//       [bookingId]: {
//         ...prev[bookingId],
//         phase: 'completed',
//         completed: true
//       }
//     }));
    
//     setTimeout(() => {
//       stopCameraMonitoring(bookingId);
//       setStatusMessage(`🎬 SIMULATION: Complete! Booking ${bookingId} marked as completed.`);
//       setTimeout(() => setStatusMessage(''), 5000);
//     }, 2000);
    
//     console.log(`🎬 SIMULATION: Checkout completed for booking ${bookingId}`);
//   }, [captureImageFromVideo]);

//   const setupSimulationTimers = useCallback((bookingId) => {
//     console.log(`🎬 SIMULATION: Setting up timers for booking ${bookingId}`);
    
//     setSimulationStatus(prev => ({
//       ...prev,
//       [bookingId]: {
//         phase: 'waiting_checkin',
//         startTime: new Date()
//       }
//     }));
    
//     const checkinTimer = setTimeout(() => {
//       simulateCheckin(bookingId);
//     }, 20000); // 20 seconds
    
//     const checkoutTimer = setTimeout(() => {
//       simulateCheckout(bookingId);
//     }, 140000); // 2 minutes 20 seconds
    
//     setSimulationTimers(prev => ({
//       ...prev,
//       [bookingId]: {
//         checkinTimer,
//         checkoutTimer
//       }
//     }));
    
//     console.log(`🎬 SIMULATION: Timers set for booking ${bookingId}`);
//   }, [simulateCheckin, simulateCheckout]);

//   const clearSimulationTimers = useCallback((bookingId) => {
//     const timers = simulationTimers[bookingId];
//     if (timers) {
//       if (timers.checkinTimer) clearTimeout(timers.checkinTimer);
//       if (timers.checkoutTimer) clearTimeout(timers.checkoutTimer);
      
//       setSimulationTimers(prev => {
//         const newTimers = { ...prev };
//         delete newTimers[bookingId];
//         return newTimers;
//       });
//     }
    
//     setSimulationStatus(prev => {
//       const newStatus = { ...prev };
//       delete newStatus[bookingId];
//       return newStatus;
//     });
//   }, [simulationTimers]);

//   // Camera monitoring functions
//   const stopCameraMonitoring = useCallback((bookingId) => {
//     if (cleanupFlags.current[bookingId]) {
//       return;
//     }
    
//     cleanupFlags.current[bookingId] = true;
//     console.log(`Stopping camera monitoring for booking ${bookingId}`);
    
//     try {
//       clearSimulationTimers(bookingId);
      
//       if (streamRefs.current[bookingId]) {
//         const tracks = streamRefs.current[bookingId].getTracks();
//         tracks.forEach(track => track.stop());
//         delete streamRefs.current[bookingId];
//       }
      
//       if (videoRefs.current[bookingId]) {
//         videoRefs.current[bookingId].srcObject = null;
//       }
      
//       if (plateDetectionInterval[bookingId]) {
//         clearInterval(plateDetectionInterval[bookingId]);
//         setPlateDetectionInterval(prev => {
//           const newIntervals = { ...prev };
//           delete newIntervals[bookingId];
//           return newIntervals;
//         });
//       }
      
//       if (cameraTimers[bookingId]) {
//         clearTimeout(cameraTimers[bookingId]);
//         setCameraTimers(prev => {
//           const newTimers = { ...prev };
//           delete newTimers[bookingId];
//           return newTimers;
//         });
//       }
      
//       setCameraStartTimes(prev => {
//         const newTimes = { ...prev };
//         delete newTimes[bookingId];
//         return newTimes;
//       });
      
//       setActiveCameras(prev => {
//         const newCameras = { ...prev };
//         delete newCameras[bookingId];
//         return newCameras;
//       });
      
//     } catch (error) {
//       console.error(`Error during cleanup for booking ${bookingId}:`, error);
//     } finally {
//       setTimeout(() => {
//         if (cleanupFlags.current[bookingId]) {
//           delete cleanupFlags.current[bookingId];
//         }
//       }, 1000);
//     }
//   }, [clearSimulationTimers, plateDetectionInterval, cameraTimers]);

//   const startCameraMonitoring = useCallback(async (bookingId, mode) => {
//     try {
//       console.log(`Starting camera monitoring for booking ${bookingId} in ${mode} mode`);
      
//       const startTime = new Date();
//       setCameraStartTimes(prev => ({
//         ...prev,
//         [bookingId]: startTime
//       }));
      
//       setActiveCameras(prev => ({
//         ...prev,
//         [bookingId]: {
//           active: true,
//           mode: mode,
//           startTime: startTime,
//           monitoring: true,
//           loading: true,
//           error: null,
//           persistent: true,
//           hasSimulation: true
//         }
//       }));
      
//       setupSimulationTimers(bookingId);
      
//       // Set 5-minute timer
//       const mainTimer = setTimeout(() => {
//         console.log(`5-minute timer expired for booking ${bookingId}`);
//         stopCameraMonitoring(bookingId);
//         setStatusMessage(`Camera monitoring ended after 5 minutes for booking ${bookingId}`);
//         setTimeout(() => setStatusMessage(''), 3000);
//       }, 300000);
      
//       setCameraTimers(prev => ({
//         ...prev,
//         [bookingId]: mainTimer
//       }));
      
//       // First ensure video element exists
//       await new Promise(resolve => setTimeout(resolve, 100));
      
//       const videoElement = videoRefs.current[bookingId];
//       if (!videoElement) {
//         console.error(`Video element not found for booking ${bookingId}`);
//         setActiveCameras(prev => ({
//           ...prev,
//           [bookingId]: {
//             ...prev[bookingId],
//             loading: false,
//             error: 'Video element not ready. Please try again.',
//             ready: false
//           }
//         }));
//         return;
//       }
      
//       console.log('Video element found, requesting camera access...');
      
//       // Request camera access with better constraints
//       let stream;
//       try {
//         // Try different camera constraints for better compatibility
//         const constraints = {
//           video: {
//             width: { ideal: 1280, min: 640 },
//             height: { ideal: 720, min: 480 },
//             frameRate: { ideal: 30, min: 15 },
//             facingMode: { ideal: 'environment', exact: undefined }
//           },
//           audio: false
//         };
        
//         stream = await navigator.mediaDevices.getUserMedia(constraints);
//         console.log(`✅ Camera stream obtained for booking ${bookingId}`, stream);
        
//         // Log stream details
//         const videoTrack = stream.getVideoTracks()[0];
//         console.log('Video track settings:', videoTrack.getSettings());
        
//       } catch (cameraError) {
//         console.error('❌ Camera access error:', cameraError);
        
//         // Try fallback with any available camera
//         try {
//           console.log('Trying fallback camera constraints...');
//           stream = await navigator.mediaDevices.getUserMedia({
//             video: true,
//             audio: false
//           });
//           console.log('✅ Fallback camera stream obtained');
//         } catch (fallbackError) {
//           console.error('❌ Fallback camera also failed:', fallbackError);
          
//           setActiveCameras(prev => ({
//             ...prev,
//             [bookingId]: {
//               ...prev[bookingId],
//               loading: false,
//               error: `Camera access denied. Please allow camera permissions in your browser and refresh the page.`,
//               ready: false,
//               persistent: true,
//               hasSimulation: true,
//               needsPermission: true
//             }
//           }));
//           return;
//         }
//       }
      
//       // Store stream reference
//       streamRefs.current[bookingId] = stream;
//       console.log('Stream stored in refs');
      
//       // Set up video element immediately
//       videoElement.srcObject = stream;
//       videoElement.muted = true;
//       videoElement.playsInline = true;
//       videoElement.autoplay = true;
      
//       console.log('Video element configured with stream');
      
//       // Force video to play and handle the result
//       try {
//         // Wait for metadata to load
//         await new Promise((resolve, reject) => {
//           const timeout = setTimeout(() => {
//             reject(new Error('Metadata loading timeout'));
//           }, 5000);
          
//           const onLoadedMetadata = () => {
//             console.log('✅ Video metadata loaded');
//             clearTimeout(timeout);
//             videoElement.removeEventListener('loadedmetadata', onLoadedMetadata);
//             videoElement.removeEventListener('error', onError);
//             resolve();
//           };
          
//           const onError = (error) => {
//             console.error('❌ Video metadata error:', error);
//             clearTimeout(timeout);
//             videoElement.removeEventListener('loadedmetadata', onLoadedMetadata);
//             videoElement.removeEventListener('error', onError);
//             reject(error);
//           };
          
//           if (videoElement.readyState >= 1) {
//             console.log('Video metadata already available');
//             onLoadedMetadata();
//           } else {
//             videoElement.addEventListener('loadedmetadata', onLoadedMetadata);
//             videoElement.addEventListener('error', onError);
//           }
//         });
        
//         // Now try to play the video
//         console.log('Attempting to play video...');
//         await videoElement.play();
//         console.log('✅ Video is now playing!');
        
//         // Video is successfully playing
//         setActiveCameras(prev => ({
//           ...prev,
//           [bookingId]: {
//             ...prev[bookingId],
//             loading: false,
//             ready: true,
//             error: null,
//             videoReady: true,
//             persistent: true,
//             hasSimulation: true,
//             streamActive: true,
//             playing: true
//           }
//         }));
        
//         console.log(`🎥 Camera setup completed successfully for booking ${bookingId}`);
        
//       } catch (playError) {
//         console.error('❌ Video play error:', playError);
        
//         // Video loaded but autoplay failed - show click to play
//         setActiveCameras(prev => ({
//           ...prev,
//           [bookingId]: {
//             ...prev[bookingId],
//             loading: false,
//             ready: false,
//             error: null,
//             videoReady: false,
//             needsUserInteraction: true,
//             persistent: true,
//             hasSimulation: true,
//             streamLoaded: true
//           }
//         }));
        
//         console.log('Video loaded but needs user interaction to play');
//       }
      
//     } catch (error) {
//       console.error('❌ Error in camera monitoring setup:', error);
      
//       setActiveCameras(prev => ({
//         ...prev,
//         [bookingId]: {
//           active: true,
//           mode: mode,
//           startTime: cameraStartTimes[bookingId] || new Date(),
//           loading: false,
//           error: `Setup failed: ${error.message}. Try refreshing the page.`,
//           ready: false,
//           videoReady: false,
//           persistent: true,
//           hasSimulation: true
//         }
//       }));
//     }
//   }, [setupSimulationTimers, stopCameraMonitoring, cameraStartTimes]);

//   const handleStartCheckin = useCallback(async (bookingId) => {
//     console.log(`Starting check-in process for booking ${bookingId}`);
    
//     try {
//       if (activeCameras[bookingId]?.active && activeCameras[bookingId]?.persistent) {
//         setStatusMessage(`Camera is already monitoring for booking ${bookingId}`);
//         setTimeout(() => setStatusMessage(''), 3000);
//         return;
//       }
      
//       if (activeCameras[bookingId]?.active) {
//         stopCameraMonitoring(bookingId);
//         await new Promise(resolve => setTimeout(resolve, 1000));
//       }
      
//       await startCameraMonitoring(bookingId, 'checkin');
      
//       setStatusMessage(`🎬 Started 5-minute camera monitoring with simulation for booking ${bookingId}`);
//       setTimeout(() => setStatusMessage(''), 5000);
      
//     } catch (error) {
//       console.error(`Error starting check-in for booking ${bookingId}:`, error);
//       setActivityError(`Failed to start camera monitoring: ${error.message}`);
//     }
//   }, [startCameraMonitoring, activeCameras, stopCameraMonitoring]);

//   const handleStopCamera = useCallback((bookingId) => {
//     console.log(`Manual stop requested for booking ${bookingId}`);
//     stopCameraMonitoring(bookingId);
//     setStatusMessage('Camera monitoring and simulation stopped manually.');
//     setTimeout(() => setStatusMessage(''), 3000);
//   }, [stopCameraMonitoring]);

//   const handleVideoClick = useCallback(async (bookingId) => {
//     const videoElement = videoRefs.current[bookingId];
//     if (videoElement) {
//       try {
//         console.log('Manual video play attempt...');
        
//         if (videoElement.paused) {
//           await videoElement.play();
//           console.log('✅ Manual video play successful');
          
//           setActiveCameras(prev => ({
//             ...prev,
//             [bookingId]: {
//               ...prev[bookingId],
//               ready: true,
//               error: null,
//               videoReady: true,
//               needsUserInteraction: false,
//               persistent: true,
//               hasSimulation: true,
//               playing: true
//             }
//           }));
//         }
//       } catch (error) {
//         console.error('❌ Manual video play failed:', error);
//         setActiveCameras(prev => ({
//           ...prev,
//           [bookingId]: {
//             ...prev[bookingId],
//             error: 'Failed to start video. Please check camera permissions.'
//           }
//         }));
//       }
//     }
//   }, []);

//   // Check camera permissions
//   const checkCameraPermissions = useCallback(async () => {
//     try {
//       const result = await navigator.permissions.query({ name: 'camera' });
//       console.log('Camera permission state:', result.state);
//       return result.state;
//     } catch (error) {
//       console.log('Permission query not supported');
//       return 'unknown';
//     }
//   }, []);

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       Object.keys(streamRefs.current).forEach(bookingId => {
//         stopCameraMonitoring(bookingId);
//       });
//     };
//   }, [stopCameraMonitoring]);

//   // Update timer display every second
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setActiveCameras(prev => ({ ...prev }));
//     }, 1000);
    
//     return () => clearInterval(interval);
//   }, []);

//   // Enhanced video element renderer with better live streaming
//   const renderVideoElement = (bookingId) => {
//     const camera = activeCameras[bookingId];
//     const remainingTime = getRemainingTime(bookingId);
//     const simulationProgress = getSimulationProgress(bookingId);
    
//     if (!camera || !camera.active) return null;
    
//     return (
//       <div style={{ 
//         width: '100%', 
//         maxWidth: '600px', 
//         borderRadius: '12px',
//         marginBottom: '15px',
//         backgroundColor: '#000',
//         position: 'relative',
//         aspectRatio: '16/9',
//         overflow: 'hidden',
//         border: '2px solid #10b981',
//         boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
//       }}>
//         {camera.loading ? (
//           <div style={{
//             width: '100%',
//             height: '100%',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             backgroundColor: '#1f2937',
//             color: 'white',
//             flexDirection: 'column',
//             position: 'relative'
//           }}>
//             {/* Always create video element */}
//             <video 
//               ref={el => {
//                 if (el) {
//                   console.log(`📹 Creating video ref for booking ${bookingId} during loading`);
//                   videoRefs.current[bookingId] = el;
                  
//                   // Set up video element properties immediately
//                   el.playsInline = true;
//                   el.muted = true;
//                   el.controls = false;
//                   el.style.width = '100%';
//                   el.style.height = '100%';
//                   el.style.objectFit = 'cover';
//                   el.style.position = 'absolute';
//                   el.style.top = '0';
//                   el.style.left = '0';
//                   el.style.zIndex = '1';
//                 }
//               }}
//               playsInline
//               muted
//               autoPlay
//               style={{
//                 position: 'absolute',
//                 top: 0,
//                 left: 0,
//                 width: '100%',
//                 height: '100%',
//                 objectFit: 'cover',
//                 zIndex: 1
//               }}
//             />
//             <div style={{ 
//               position: 'relative', 
//               zIndex: 10, 
//               display: 'flex', 
//               flexDirection: 'column', 
//               alignItems: 'center',
//               backgroundColor: 'rgba(31, 41, 55, 0.8)',
//               padding: '20px',
//               borderRadius: '8px'
//             }}>
//               <RefreshCw size={48} style={{ 
//                 marginBottom: '15px',
//                 animation: 'spin 1s linear infinite'
//               }} />
//               <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Starting Camera...</div>
//               <div style={{ fontSize: '0.9rem', marginTop: '10px', color: '#10b981' }}>
//                 Timer: {formatRemainingTime(remainingTime)} remaining
//               </div>
//               {camera.hasSimulation && simulationProgress && (
//                 <div style={{ fontSize: '0.9rem', marginTop: '10px', color: '#f59e0b', fontWeight: 'bold' }}>
//                   🎬 {simulationProgress.message}
//                 </div>
//               )}
//             </div>
//           </div>
//         ) : camera.error || camera.needsPermission ? (
//           <div style={{
//             width: '100%',
//             height: '100%',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             backgroundColor: '#1f2937',
//             color: 'white',
//             flexDirection: 'column',
//             padding: '30px',
//             textAlign: 'center',
//             position: 'relative'
//           }}>
//             {/* Video element still available for retry */}
//             <video 
//               ref={el => {
//                 if (el) {
//                   console.log(`📹 Creating video ref for booking ${bookingId} during error`);
//                   videoRefs.current[bookingId] = el;
//                   el.playsInline = true;
//                   el.muted = true;
//                   el.controls = false;
//                 }
//               }}
//               playsInline
//               muted
//               autoPlay
//               style={{
//                 position: 'absolute',
//                 top: 0,
//                 left: 0,
//                 width: '100%',
//                 height: '100%',
//                 objectFit: 'cover',
//                 zIndex: 1
//               }}
//             />
            
//             <div style={{ 
//               position: 'relative', 
//               zIndex: 10,
//               backgroundColor: 'rgba(31, 41, 55, 0.9)',
//               padding: '20px',
//               borderRadius: '8px'
//             }}>
//               <AlertCircle size={48} style={{ 
//                 marginBottom: '15px',
//                 color: '#f59e0b'
//               }} />
//               <div style={{ fontSize: '1.1rem', marginBottom: '15px', fontWeight: 'bold' }}>
//                 {camera.needsPermission ? 'Camera Permission Required' : 'Camera Error'}
//               </div>
//               <div style={{ fontSize: '0.9rem', color: '#d1d5db', marginBottom: '15px' }}>
//                 {camera.needsPermission ? 
//                   'Please allow camera access in your browser and click "Enable Camera" below.' :
//                   camera.error
//                 }
//               </div>
//               <div style={{ fontSize: '0.9rem', marginBottom: '15px', color: '#10b981', fontWeight: 'bold' }}>
//                 Timer: {formatRemainingTime(remainingTime)} remaining
//               </div>
//               {camera.hasSimulation && simulationProgress && (
//                 <div style={{ fontSize: '0.9rem', marginBottom: '15px', color: '#f59e0b', fontWeight: 'bold' }}>
//                   🎬 {simulationProgress.message}
//                 </div>
//               )}
              
//               <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
//                 <button
//                   onClick={() => handleStartCheckin(bookingId)}
//                   style={{
//                     padding: '12px 24px',
//                     background: '#4f46e5',
//                     color: 'white',
//                     border: 'none',
//                     borderRadius: '8px',
//                     cursor: 'pointer',
//                     fontSize: '1rem',
//                     fontWeight: 'bold',
//                     display: 'flex',
//                     alignItems: 'center',
//                     gap: '8px'
//                   }}
//                 >
//                   <Camera size={20} />
//                   {camera.needsPermission ? 'Enable Camera' : 'Retry Camera'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         ) : camera.needsUserInteraction || camera.streamLoaded ? (
//           <div style={{
//             width: '100%',
//             height: '100%',
//             position: 'relative'
//           }}>
//             {/* Video element - should show stream */}
//             <video 
//               ref={el => {
//                 if (el) {
//                   console.log(`📹 Creating video ref for booking ${bookingId} - needs interaction`);
//                   videoRefs.current[bookingId] = el;
//                   el.playsInline = true;
//                   el.muted = true;
//                   el.controls = false;
//                 }
//               }}
//               playsInline
//               muted
//               onClick={() => handleVideoClick(bookingId)}
//               style={{
//                 width: '100%',
//                 height: '100%',
//                 objectFit: 'cover',
//                 backgroundColor: '#000',
//                 cursor: 'pointer'
//               }}
//             />
            
//             {/* Play button overlay */}
//             <div style={{
//               position: 'absolute',
//               top: '50%',
//               left: '50%',
//               transform: 'translate(-50%, -50%)',
//               zIndex: 10,
//               backgroundColor: 'rgba(0, 0, 0, 0.8)',
//               padding: '20px',
//               borderRadius: '50%',
//               cursor: 'pointer'
//             }}
//             onClick={() => handleVideoClick(bookingId)}
//             >
//               <Play size={40} color="white" />
//             </div>
            
//             {/* Timer overlay */}
//             <div style={{
//               position: 'absolute',
//               top: '15px',
//               left: '15px',
//               background: 'rgba(239, 68, 68, 0.95)',
//               color: 'white',
//               padding: '8px 16px',
//               borderRadius: '8px',
//               fontSize: '0.9rem',
//               fontWeight: 'bold',
//               zIndex: 5
//             }}>
//               READY • {formatRemainingTime(remainingTime)}
//             </div>
            
//             {/* Simulation overlay */}
//             {camera.hasSimulation && simulationProgress && (
//               <div style={{
//                 position: 'absolute',
//                 top: '70px',
//                 left: '15px',
//                 right: '15px',
//                 background: 'rgba(245, 158, 11, 0.95)',
//                 color: 'white',
//                 padding: '12px 16px',
//                 borderRadius: '8px',
//                 fontSize: '1rem',
//                 textAlign: 'center',
//                 fontWeight: 'bold',
//                 zIndex: 5
//               }}>
//                 🎬 SIMULATION: {simulationProgress.message}
//               </div>
//             )}
//           </div>
//         ) : (
//           <div style={{
//             width: '100%',
//             height: '100%',
//             position: 'relative'
//           }}>
//             {/* MAIN VIDEO ELEMENT - LIVE FEED */}
//             <video 
//               ref={el => {
//                 if (el) {
//                   console.log(`📹 Creating LIVE video ref for booking ${bookingId}`);
//                   videoRefs.current[bookingId] = el;
                  
//                   // Ensure video properties are set correctly
//                   el.playsInline = true;
//                   el.muted = true;
//                   el.controls = false;
//                   el.autoplay = true;
                  
//                   // Debug video element
//                   el.addEventListener('loadstart', () => console.log('📹 Video loadstart'));
//                   el.addEventListener('loadedmetadata', () => console.log('📹 Video metadata loaded'));
//                   el.addEventListener('canplay', () => console.log('📹 Video can play'));
//                   el.addEventListener('playing', () => console.log('📹 Video is playing'));
//                   el.addEventListener('error', (e) => console.error('📹 Video error:', e));
//                 }
//               }}
//               playsInline
//               muted
//               autoPlay
//               onClick={() => handleVideoClick(bookingId)}
//               style={{
//                 width: '100%',
//                 height: '100%',
//                 objectFit: 'cover',
//                 backgroundColor: '#000',
//                 display: 'block',
//                 position: 'absolute',
//                 top: 0,
//                 left: 0,
//                 zIndex: 1
//               }}
//             />
            
//             {/* LIVE indicator with timer */}
//             {camera.videoReady && (
//               <div style={{
//                 position: 'absolute',
//                 top: '15px',
//                 left: '15px',
//                 background: 'rgba(239, 68, 68, 0.95)',
//                 color: 'white',
//                 padding: '8px 16px',
//                 borderRadius: '8px',
//                 fontSize: '0.9rem',
//                 fontWeight: 'bold',
//                 display: 'flex',
//                 alignItems: 'center',
//                 boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
//                 zIndex: 10
//               }}>
//                 <div style={{
//                   width: '10px',
//                   height: '10px',
//                   borderRadius: '50%',
//                   background: 'white',
//                   marginRight: '8px',
//                   animation: 'pulse 1s infinite'
//                 }} />
//                 LIVE • {formatRemainingTime(remainingTime)}
//               </div>
//             )}
            
//             {/* Simulation status overlay */}
//             {camera.hasSimulation && simulationProgress && camera.videoReady && (
//               <div style={{
//                 position: 'absolute',
//                 top: '70px',
//                 left: '15px',
//                 right: '15px',
//                 background: 'rgba(245, 158, 11, 0.95)',
//                 color: 'white',
//                 padding: '12px 16px',
//                 borderRadius: '8px',
//                 fontSize: '1rem',
//                 textAlign: 'center',
//                 fontWeight: 'bold',
//                 boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
//                 zIndex: 10
//               }}>
//                 🎬 SIMULATION: {simulationProgress.message}
//               </div>
//             )}
            
//             {/* Detection status overlay */}
//             {camera.videoReady && (
//               <div style={{
//                 position: 'absolute',
//                 bottom: '15px',
//                 left: '15px',
//                 right: '15px',
//                 background: 'rgba(0, 0, 0, 0.85)',
//                 color: 'white',
//                 padding: '12px 16px',
//                 borderRadius: '8px',
//                 fontSize: '0.95rem',
//                 textAlign: 'center',
//                 fontWeight: '500',
//                 boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
//                 zIndex: 10
//               }}>
//                 {camera.simulatingCheckin ? 
//                   '🎬 SIMULATING CHECK-IN...' :
//                   camera.simulatingCheckout ?
//                   '🎬 SIMULATING CHECKOUT...' :
//                   camera.mode === 'checkin' ? 
//                     '🔍 Scanning for authorized vehicle plates...' :
//                     `🚗 Waiting for vehicle: ${detectedPlates[bookingId]?.plateNumber || 'Unknown'}`
//                 }
//               </div>
//             )}
            
//             {/* Controls overlay */}
//             <div style={{
//               position: 'absolute',
//               top: '15px',
//               right: '15px',
//               display: 'flex',
//               gap: '8px',
//               zIndex: 10
//             }}>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   handleStopCamera(bookingId);
//                 }}
//                 style={{
//                   background: 'rgba(220, 38, 38, 0.9)',
//                   color: 'white',
//                   border: 'none',
//                   borderRadius: '6px',
//                   padding: '8px 12px',
//                   cursor: 'pointer',
//                   display: 'flex',
//                   alignItems: 'center',
//                   fontSize: '0.8rem',
//                   fontWeight: 'bold'
//                 }}
//               >
//                 <StopCircle size={16} style={{ marginRight: '4px' }} />
//                 Stop
//               </button>
//             </div>
//           </div>
//         )}
        
//         {/* Hidden canvas for image capture */}
//         <canvas 
//           ref={el => {
//             if (el) {
//               canvasRefs.current[bookingId] = el;
//             }
//           }}
//           style={{ display: 'none' }} 
//         />
//       </div>
//     );
//   };

//   return (
//     <div style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
//       {/* Header */}
//       <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
//         <button 
//           onClick={onBack}
//           style={{ 
//             display: 'flex', 
//             alignItems: 'center', 
//             background: 'none', 
//             border: 'none', 
//             cursor: 'pointer',
//             color: '#4f46e5',
//             marginRight: '20px',
//             fontSize: '1rem'
//           }}
//         >
//           <ArrowLeft size={20} />
//           <span style={{ marginLeft: '8px' }}>Back to Dashboard</span>
//         </button>
//         <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', fontSize: '2rem' }}>
//           <Users size={28} style={{ marginRight: '12px' }} />
//           Live Camera Monitoring System
//         </h1>
//       </div>

//       {/* Enhanced Simulation Info */}
//       <div style={{ 
//         background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', 
//         borderRadius: '16px', 
//         padding: '30px', 
//         boxShadow: '0 8px 32px rgba(0,0,0,0.1)', 
//         marginBottom: '30px',
//         border: '2px solid #0ea5e9'
//       }}>
//         <h2 style={{ margin: '0 0 20px 0', fontSize: '1.8rem', color: '#0c4a6e' }}>🎬 Live Camera Simulation System</h2>
//         <p style={{ margin: '0 0 20px 0', color: '#0c4a6e', fontSize: '1.1rem' }}>
//           Real-time camera streaming
//         </p>
//         <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
          
//           <div style={{
//             background: '#dcfce7',
//             color: '#047857',
//             padding: '12px 20px',
//             borderRadius: '12px',
//             fontWeight: 'bold',
//             fontSize: '1rem',
//             boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
//           }}>
//             ✅ Live Video Feed + Completion
//           </div>
//         </div>
//         <div style={{ 
//           background: 'rgba(255,255,255,0.8)', 
//           padding: '15px', 
//           borderRadius: '12px',
//           fontSize: '1rem',
//           color: '#0c4a6e'
//         }}>
//           📹 <strong>Live Camera Features:</strong> Real-time video streaming, automatic plate detection simulation, 5-minute persistent monitoring, interactive controls
//         </div>
//       </div>

//       {/* Status Messages */}
//       {statusMessage && (
//         <div style={{ 
//           margin: '0 0 20px 0', 
//           padding: '15px 20px', 
//           backgroundColor: statusMessage.includes('❌') ? '#fee2e2' : '#ecfdf5', 
//           borderRadius: '12px', 
//           borderLeft: statusMessage.includes('❌') ? '4px solid #dc2626' : '4px solid #10b981',
//           display: 'flex',
//           alignItems: 'center',
//           fontSize: '1rem'
//         }}>
//           {statusMessage.includes('❌') ? 
//             <XCircle size={20} style={{ marginRight: '12px', color: '#dc2626' }} /> :
//             <CheckCircle size={20} style={{ marginRight: '12px', color: '#10b981' }} />
//           }
//           <span style={{ 
//             color: statusMessage.includes('❌') ? '#b91c1c' : '#065f46', 
//             fontWeight: 600 
//           }}>
//             {statusMessage}
//           </span>
//         </div>
//       )}

//       {/* Main Content */}
//       <div style={{ 
//         background: 'white', 
//         borderRadius: '16px', 
//         padding: '30px', 
//         boxShadow: '0 8px 32px rgba(0,0,0,0.1)', 
//         marginBottom: '30px' 
//       }}>
//         <h2 style={{ margin: '0 0 25px 0', fontSize: '1.8rem' }}>Parking Activity Monitor</h2>
        
//         <div>
//           {recentActivity.length > 0 ? (
//             recentActivity.map((activity) => (
//               <div key={activity.id} style={{ marginBottom: '20px' }}>
//                 <div style={{ 
//                   display: 'flex', 
//                   alignItems: 'center',
//                   padding: '20px',
//                   borderRadius: '12px',
//                   border: '2px solid #e5e7eb',
//                   cursor: 'pointer',
//                   transition: 'all 0.3s',
//                   background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)'
//                 }}
//                 onClick={() => setExpandedActivity(expandedActivity === activity.id ? null : activity.id)}
//                 >
//                   <div style={{ 
//                     width: '50px', 
//                     height: '50px', 
//                     borderRadius: '50%', 
//                     background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', 
//                     color: 'white',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     marginRight: '20px',
//                     fontSize: '1.5rem',
//                     fontWeight: 'bold'
//                   }}>
//                     {activity.user ? activity.user.charAt(0).toUpperCase() : 'U'}
//                   </div>
//                   <div style={{ flex: 1 }}>
//                     <p style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>
//                       <span style={{ fontWeight: 'bold' }}>{activity.user}</span> {activity.action}
//                     </p>
//                     <p style={{ margin: 0, fontSize: '0.9rem', color: '#6b7280' }}>{activity.time}</p>
//                   </div>
//                   <ChevronRight 
//                     size={20} 
//                     style={{ 
//                       transform: expandedActivity === activity.id ? 'rotate(90deg)' : 'rotate(0deg)',
//                       transition: 'transform 0.3s'
//                     }} 
//                   />
//                 </div>

//                 {/* Show expanded view for selected activity */}
//                 {expandedActivity === activity.id && (
//                   <div style={{ 
//                     padding: '30px', 
//                     border: '2px solid #e5e7eb',
//                     borderTop: 'none',
//                     borderBottomLeftRadius: '12px',
//                     borderBottomRightRadius: '12px',
//                     background: '#f9fafb'
//                   }}>
//                     <h3 style={{ marginTop: 0, fontSize: '1.5rem' }}>{activity.user}'s Live Monitoring</h3>
                    
//                     <div>
//                       {userBookings.map((booking) => {
//                         const displayStatus = determineBookingStatus(booking);
//                         const cameraActive = activeCameras[booking.id]?.active;
//                         const detectedPlate = detectedPlates[booking.id];
//                         const remainingTime = getRemainingTime(booking.id);
//                         const isCompleted = displayStatus === 'completed' && detectedPlate?.isSimulated;

//                         return (
//                           <div key={booking.id} style={{ 
//                             background: 'white', 
//                             borderRadius: '16px', 
//                             boxShadow: '0 8px 32px rgba(0,0,0,0.1)', 
//                             marginBottom: '20px',
//                             overflow: 'hidden',
//                             border: '2px solid #e5e7eb'
//                           }}>
//                             <div style={{ 
//                               padding: '25px', 
//                               borderBottom: '2px solid #e5e7eb'
//                             }}>
//                               <div>
//                                 <h4 style={{ margin: '0 0 10px 0', fontSize: '1.3rem' }}>{booking.parkingLotName || 'Parking Lot'}</h4>
//                                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                                   <span style={{ fontSize: '1rem', color: '#6b7280' }}>ID: {booking.bookingId || booking.id || 'N/A'}</span>
//                                   <span style={{ 
//                                     padding: '6px 16px', 
//                                     borderRadius: '999px',
//                                     fontSize: '0.9rem',
//                                     fontWeight: 'bold',
//                                     background: 
//                                       displayStatus === 'active' ? '#dbeafe' : 
//                                       displayStatus === 'completed' ? '#d1fae5' : '#f3f4f6',
//                                     color: 
//                                       displayStatus === 'active' ? '#1e40af' : 
//                                       displayStatus === 'completed' ? '#047857' : '#374151'
//                                   }}>
//                                     {displayStatus === 'completed' && detectedPlate?.isSimulated ? 
//                                       '🎬 Simulation Completed' : 
//                                       displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)
//                                     }
//                                   </span>
//                                 </div>
//                               </div>
//                             </div>

//                             <div style={{ padding: '25px' }}>
//                               {/* Simulation Status Display */}
//                               {detectedPlate?.isSimulated && (
//                                 <div style={{ marginBottom: '25px' }}>
//                                   <h5 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#6b7280' }}>🎬 Simulation Results</h5>
//                                   <div style={{ 
//                                     background: displayStatus === 'completed' ? '#dcfce7' : '#fef3c7',
//                                     padding: '20px',
//                                     borderRadius: '12px',
//                                     border: displayStatus === 'completed' ? '2px solid #10b981' : '2px solid #f59e0b'
//                                   }}>
//                                     {detectedPlate?.checkinTime && (
//                                       <div style={{ fontSize: '1rem', marginBottom: '10px', color: displayStatus === 'completed' ? '#047857' : '#92400e' }}>
//                                         ✅ <strong>Check-in:</strong> {detectedPlate.checkinTime.toLocaleTimeString()} - KA19EQ1316
//                                       </div>
//                                     )}
//                                     {detectedPlate?.checkoutTime && (
//                                       <div style={{ fontSize: '1rem', marginBottom: '10px', color: '#047857' }}>
//                                         ✅ <strong>Checkout:</strong> {detectedPlate.checkoutTime.toLocaleTimeString()} - KA19EQ1316
//                                       </div>
//                                     )}
//                                     {displayStatus === 'completed' && (
//                                       <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#047857' }}>
//                                         🎉 <strong>LIVE SIMULATION COMPLETED SUCCESSFULLY!</strong>
//                                       </div>
//                                     )}
//                                   </div>
//                                 </div>
//                               )}

//                               {/* Camera Debug Info (for testing) */}
//                               {cameraActive && (
//                                 <div style={{ 
//                                   marginBottom: '20px',
//                                   background: '#f8fafc',
//                                   padding: '15px',
//                                   borderRadius: '8px',
//                                   border: '1px solid #e2e8f0',
//                                   fontSize: '0.85rem'
//                                 }}>
//                                   <h6 style={{ margin: '0 0 10px 0', color: '#475569' }}>Camera Debug Info:</h6>
//                                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', color: '#64748b' }}>
//                                     <div>Status: {activeCameras[booking.id]?.videoReady ? '✅ Ready' : '⏳ Loading'}</div>
//                                     <div>Stream: {activeCameras[booking.id]?.streamActive ? '✅ Active' : '❌ Inactive'}</div>
//                                     <div>Mode: {activeCameras[booking.id]?.mode}</div>
//                                     <div>Playing: {activeCameras[booking.id]?.playing ? '✅ Yes' : '❌ No'}</div>
//                                     <div>Error: {activeCameras[booking.id]?.error ? '❌ Yes' : '✅ None'}</div>
//                                     <div>Timer: {formatRemainingTime(remainingTime)}</div>
//                                   </div>
//                                   {activeCameras[booking.id]?.error && (
//                                     <div style={{ marginTop: '8px', padding: '8px', background: '#fee2e2', borderRadius: '4px', color: '#dc2626' }}>
//                                       Error: {activeCameras[booking.id].error}
//                                     </div>
//                                   )}
//                                 </div>
//                               )}

//                               {/* Live Camera Feed */}
//                               {cameraActive && (
//                                 <div style={{ 
//                                   marginBottom: '25px',
//                                   background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
//                                   padding: '25px',
//                                   borderRadius: '16px',
//                                   border: '2px solid #10b981'
//                                 }}>
//                                   <h5 style={{ 
//                                     margin: '0 0 20px 0', 
//                                     display: 'flex', 
//                                     alignItems: 'center',
//                                     justifyContent: 'space-between',
//                                     fontSize: '1.2rem'
//                                   }}>
//                                     <div style={{ display: 'flex', alignItems: 'center' }}>
//                                       <Video size={24} style={{ marginRight: '12px', color: '#10b981' }} />
//                                       <span style={{ color: '#10b981', fontWeight: 'bold' }}>
//                                         🔴 LIVE CAMERA MONITORING
//                                       </span>
//                                     </div>
//                                     <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
//                                       <div style={{
//                                         padding: '8px 16px',
//                                         background: '#10b981',
//                                         color: 'white',
//                                         borderRadius: '8px',
//                                         fontSize: '0.9rem',
//                                         fontWeight: 'bold'
//                                       }}>
//                                         ⏱️ {formatRemainingTime(remainingTime)}
//                                       </div>
//                                     </div>
//                                   </h5>
                                  
//                                   <div style={{ 
//                                     display: 'flex',
//                                     flexDirection: 'column',
//                                     alignItems: 'center'
//                                   }}>
//                                     {renderVideoElement(booking.id)}
//                                   </div>
//                                 </div>
//                               )}

//                               {/* Start Button and Camera Info - Only show if not completed */}
//                               {displayStatus === 'active' && 
//                                !cameraActive && 
//                                !isCompleted && (
//                                 <div style={{ textAlign: 'center' }}>
//                                   {/* Camera Permission Check */}
//                                   <div style={{ 
//                                     marginBottom: '20px',
//                                     padding: '15px',
//                                     background: '#f0f9ff',
//                                     borderRadius: '8px',
//                                     border: '1px solid #0ea5e9'
//                                   }}>
//                                     <h6 style={{ margin: '0 0 10px 0', color: '#0c4a6e' }}>📹 Camera Requirements:</h6>
//                                     <ul style={{ margin: '0', paddingLeft: '20px', color: '#0c4a6e', textAlign: 'left' }}>
//                                       <li>Allow camera permissions when prompted</li>
//                                       <li>Ensure no other apps are using your camera</li>
//                                       <li>Use a supported browser (Chrome, Firefox, Safari)</li>
//                                       <li>Enable HTTPS for camera access</li>
//                                     </ul>
//                                   </div>
                                  
//                                   <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
//                                     <button
//                                       onClick={() => handleStartCheckin(booking.id)}
//                                       style={{
//                                         background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
//                                         color: 'white',
//                                         border: 'none',
//                                         padding: '16px 32px',
//                                         borderRadius: '12px',
//                                         cursor: 'pointer',
//                                         display: 'flex',
//                                         alignItems: 'center',
//                                         fontWeight: 'bold',
//                                         fontSize: '1.1rem',
//                                         boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)'
//                                       }}
//                                     >
//                                       <Video size={20} style={{ marginRight: '12px' }} />
//                                       Start Live Camera Monitoring
//                                     </button>
                                    
//                                     <button
//                                       onClick={async () => {
//                                         const permission = await checkCameraPermissions();
//                                         alert(`Camera permission status: ${permission}`);
//                                       }}
//                                       style={{
//                                         background: '#f3f4f6',
//                                         color: '#374151',
//                                         border: '1px solid #d1d5db',
//                                         padding: '16px 24px',
//                                         borderRadius: '12px',
//                                         cursor: 'pointer',
//                                         display: 'flex',
//                                         alignItems: 'center',
//                                         fontWeight: 'bold',
//                                         fontSize: '0.9rem'
//                                       }}
//                                     >
//                                       <Camera size={18} style={{ marginRight: '8px' }} />
//                                       Check Camera Access
//                                     </button>
//                                   </div>
//                                 </div>
//                               )}
                              
//                               {/* Completion Message */}
//                               {isCompleted && (
//                                 <div style={{
//                                   padding: '25px',
//                                   background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
//                                   border: '3px solid #10b981',
//                                   borderRadius: '16px',
//                                   textAlign: 'center'
//                                 }}>
//                                   <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#047857', marginBottom: '10px' }}>
//                                     🎉 Live Camera Simulation Successfully Completed!
//                                   </div>
//                                   <div style={{ fontSize: '1.1rem', color: '#065f46' }}>
//                                     Vehicle KA19EQ1316 completed full check-in and checkout cycle with live camera monitoring
//                                   </div>
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ))
//           ) : (
//             <div style={{ 
//               textAlign: 'center', 
//               padding: '40px 20px',
//               color: '#6b7280'
//             }}>
//               <Activity size={48} style={{ marginBottom: '16px' }} />
//               <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem' }}>No Recent Activity</h3>
//               <p style={{ margin: 0, fontSize: '1rem' }}>
//                 No parking activities found. Activities will appear here when users book parking spots.
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
      
//       {/* Enhanced CSS animations */}
//       <style jsx>{`
//         @keyframes spin {
//           from { transform: rotate(0deg); }
//           to { transform: rotate(360deg); }
//         }
        
//         @keyframes pulse {
//           0%, 100% { opacity: 1; }
//           50% { opacity: 0.5; }
//         }
        
//         .loading-spinner {
//           animation: spin 1s linear infinite;
//         }
        
//         button:hover {
//           transform: translateY(-2px);
//           transition: all 0.2s ease;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default UsersList;




import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Users, ArrowLeft, Clock, MapPin, Activity, ChevronRight, 
  CheckCircle, Camera, Bike, Truck, Car, RefreshCw, X, Video, Eye,
  AlertCircle, StopCircle, XCircle, Play
} from 'lucide-react';

const UsersList = ({ onBack, recentActivity = [] }) => {
  // All state declarations
  const [users, setUsers] = useState([]);
  const [allBookings, setAllBookings] = useState([
    {
      id: 'booking_001',
      parkingLotName: 'Tech Park Main',
      spaceId: '1',
      userId: 'user_001',
      location: 'Bangalore Tech Park, Whitefield',
      startTime: new Date(),
      endTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
      amount: 80,
      status: 'active',
      vehicleType: 2,
      bookingId: 'BP001'
    },
    {
      id: 'booking_002',
      parkingLotName: 'Central Business District',
      spaceId: '5',
      userId: 'user_002',
      location: 'MG Road, CBD Area',
      startTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      endTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
      amount: 120,
      status: 'active',
      vehicleType: 1,
      bookingId: 'BP002'
    },
    {
      id: 'booking_003',
      parkingLotName: 'Indiranagar Metro',
      spaceId: '12',
      userId: 'user_003',
      location: 'Near Indiranagar Metro Station',
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      endTime: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour from now
      amount: 60,
      status: 'active',
      vehicleType: 3,
      bookingId: 'BP003'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedActivity, setExpandedActivity] = useState(null);
  const [userBookings, setUserBookings] = useState({});
  const [activityError, setActivityError] = useState(null);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(0);
  const [occupiedSlots, setOccupiedSlots] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [firebaseStatus, setFirebaseStatus] = useState(0);
  
  // Camera and simulation states
  const [activeCameras, setActiveCameras] = useState({});
  const [detectedPlates, setDetectedPlates] = useState({});
  const [cameraTimers, setCameraTimers] = useState({});
  const [plateDetectionInterval, setPlateDetectionInterval] = useState({});
  const [wrongPlateDetections, setWrongPlateDetections] = useState({});
  const [cameraStartTimes, setCameraStartTimes] = useState({});
  const [simulationTimers, setSimulationTimers] = useState({});
  const [simulationStatus, setSimulationStatus] = useState({});
  
  const [zones, setZones] = useState([
    { id: 1, name: 'Zone A', type: 'Car', occupied: false },
    { id: 2, name: 'Zone B', type: 'Car', occupied: false },
    { id: 3, name: 'Zone C', type: 'Car', occupied: false }
  ]);

  // Refs for camera functionality
  const videoRefs = useRef({});
  const canvasRefs = useRef({});
  const streamRefs = useRef({});
  const cleanupFlags = useRef({});

  // Constants
  const authorizedPlates = [
    'KA-01-HB-1234',
    'KA-05-MN-5678', 
    'KA-02-CD-9012',
    'KA19EQ1316' // Hardcoded simulation plate
  ];

  const allSimulatedPlates = [
    ...authorizedPlates,
    'KA-03-EF-7890',
    'KA-04-GH-2468',
    'TN-09-AB-3456',
    'MH-12-CD-7890'
  ];

  // Initialize with booking data mapped to activities based on activity details
  useEffect(() => {
    // Create a mapping of user bookings based on activity information
    const bookingsMap = {};
    
    // Populate bookings for each activity with matching location and space info
    recentActivity.forEach((activity) => {
      // Parse the activity action text to extract location and space info
      // Example format: "completed payment for Space #3" or "booked Space #1 at Kengeri Bus Terminal"
      const spaceMatch = activity.action?.match(/Space #(\d+)/i);
      const spaceNumber = spaceMatch ? spaceMatch[1] : '1';
      
      let locationName = '';
      if (activity.action?.includes('at ')) {
        const locationMatch = activity.action.match(/at\s+([^,]+)(?:,|$)/i);
        locationName = locationMatch ? locationMatch[1].trim() : '';
      }
      
      // Create a booking that matches the activity description
      const customBooking = {
        id: `booking_${activity.id}`,
        parkingLotName: locationName || 'Parking Lot',
        spaceId: spaceNumber,
        userId: activity.user ? `user_${activity.user.toLowerCase()}` : 'user_001',
        location: locationName ? `${locationName}, Bengaluru` : 'Bengaluru, Karnataka',
        startTime: new Date(activity.time || Date.now()),
        endTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
        amount: 80,
        status: 'active',
        vehicleType: Math.floor(Math.random() * 3) + 1, // Random vehicle type
        bookingId: `BP${activity.id.toString().padStart(3, '0')}`
      };
      
      bookingsMap[activity.id] = [customBooking];
    });
    
    setUserBookings(bookingsMap);
    setLoading(false);
    setLoadingBookings(false);
  }, [recentActivity]);

  // Helper functions
  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
  };

  const getTimeDifference = (start, end) => {
    if (!start || !end) return 'N/A';
    const diffMs = end - start;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHrs}h ${diffMins}m`;
  };

  const formatRemainingTime = useCallback((ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const getRemainingTime = useCallback((bookingId) => {
    const startTime = cameraStartTimes[bookingId];
    if (!startTime) return 0;
    
    const now = new Date();
    const elapsed = now - startTime;
    const remaining = 300000 - elapsed; // 5 minutes - elapsed
    
    return Math.max(0, remaining);
  }, [cameraStartTimes]);

  const getSimulationProgress = useCallback((bookingId) => {
    const simulation = simulationStatus[bookingId];
    if (!simulation) return null;
    
    const now = new Date();
    const elapsed = now - simulation.startTime;
    
    if (simulation.phase === 'waiting_checkin') {
      const timeToCheckin = 20000 - elapsed; // 20 seconds
      if (timeToCheckin > 0) {
        return {
          phase: 'waiting_checkin',
          timeRemaining: timeToCheckin,
          message: `Check-in in ${Math.ceil(timeToCheckin / 1000)}s`
        };
      }
    } else if (simulation.phase === 'checkin') {
      const timeToCheckout = 140000 - elapsed; // 2m20s total
      if (timeToCheckout > 0) {
        return {
          phase: 'waiting_checkout',
          timeRemaining: timeToCheckout,
          message: `Checkout in ${Math.ceil(timeToCheckout / 1000)}s`
        };
      }
    }
    
    return null;
  }, [simulationStatus]);

  const determineBookingStatus = useCallback((booking) => {
    if (!booking) return 'active';
    
    const bookingId = booking.id;
    const simulation = simulationStatus[bookingId];
    const detectedPlate = detectedPlates[bookingId];
    
    if (simulation?.completed || (detectedPlate?.isSimulated && detectedPlate?.checkoutTime)) {
      return 'completed';
    }
    
    if (detectedPlate?.isSimulated && detectedPlate?.checkinTime && !detectedPlate?.checkoutTime) {
      return 'active';
    }
    
    return booking.status || 'active';
  }, [simulationStatus, detectedPlates]);

  // Core camera functions
  const captureImageFromVideo = useCallback((bookingId) => {
    const video = videoRefs.current[bookingId];
    const canvas = canvasRefs.current[bookingId];
    
    if (!video || !canvas) return null;
    
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    try {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg');
    } catch (error) {
      console.error('Error capturing image:', error);
      return null;
    }
  }, []);

  // Simulation functions
  const simulateCheckin = useCallback(async (bookingId) => {
    const hardcodedPlate = 'KA19EQ1316';
    
    console.log(`🎬 SIMULATION: Starting check-in for booking ${bookingId}`);
    
    setSimulationStatus(prev => ({
      ...prev,
      [bookingId]: {
        ...prev[bookingId],
        phase: 'checkin',
        plateNumber: hardcodedPlate,
        checkinTime: new Date()
      }
    }));
    
    setActiveCameras(prev => ({
      ...prev,
      [bookingId]: {
        ...prev[bookingId],
        simulatingCheckin: true,
        simulationPlate: hardcodedPlate
      }
    }));
    
    const imageData = captureImageFromVideo(bookingId) || 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//2Q=';
    
    setStatusMessage(`🎬 SIMULATION: Check-in successful! Vehicle ${hardcodedPlate} detected at ${new Date().toLocaleTimeString()}`);
    
    setDetectedPlates(prev => ({
      ...prev,
      [bookingId]: {
        plateNumber: hardcodedPlate,
        checkinTime: new Date(),
        imageData: imageData,
        isAuthorized: true,
        isSimulated: true
      }
    }));
    
    setActiveCameras(prev => ({
      ...prev,
      [bookingId]: {
        ...prev[bookingId],
        mode: 'waiting_checkout',
        checkedIn: true,
        simulatingCheckin: false,
        waitingForCheckout: true
      }
    }));
    
    console.log(`🎬 SIMULATION: Check-in completed for booking ${bookingId}`);
  }, [captureImageFromVideo]);

  const simulateCheckout = useCallback(async (bookingId) => {
    const hardcodedPlate = 'KA19EQ1316';
    
    console.log(`🎬 SIMULATION: Starting checkout for booking ${bookingId}`);
    
    setSimulationStatus(prev => ({
      ...prev,
      [bookingId]: {
        ...prev[bookingId],
        phase: 'checkout',
        checkoutTime: new Date()
      }
    }));
    
    setActiveCameras(prev => ({
      ...prev,
      [bookingId]: {
        ...prev[bookingId],
        simulatingCheckout: true,
        waitingForCheckout: false
      }
    }));
    
    const imageData = captureImageFromVideo(bookingId) || 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//2Q=';
    
    setStatusMessage(`🎬 SIMULATION: Checkout successful! Vehicle ${hardcodedPlate} departed at ${new Date().toLocaleTimeString()}`);
    
    setDetectedPlates(prev => ({
      ...prev,
      [bookingId]: {
        ...prev[bookingId],
        checkoutTime: new Date(),
        completed: true
      }
    }));
    
    setSimulationStatus(prev => ({
      ...prev,
      [bookingId]: {
        ...prev[bookingId],
        phase: 'completed',
        completed: true
      }
    }));
    
    setTimeout(() => {
      stopCameraMonitoring(bookingId);
      setStatusMessage(`🎬 SIMULATION: Complete! Booking ${bookingId} marked as completed.`);
      setTimeout(() => setStatusMessage(''), 5000);
    }, 2000);
    
    console.log(`🎬 SIMULATION: Checkout completed for booking ${bookingId}`);
  }, [captureImageFromVideo]);

  const setupSimulationTimers = useCallback((bookingId) => {
    console.log(`🎬 SIMULATION: Setting up timers for booking ${bookingId}`);
    
    setSimulationStatus(prev => ({
      ...prev,
      [bookingId]: {
        phase: 'waiting_checkin',
        startTime: new Date()
      }
    }));
    
    const checkinTimer = setTimeout(() => {
      simulateCheckin(bookingId);
    }, 20000); // 20 seconds
    
    const checkoutTimer = setTimeout(() => {
      simulateCheckout(bookingId);
    }, 140000); // 2 minutes 20 seconds
    
    setSimulationTimers(prev => ({
      ...prev,
      [bookingId]: {
        checkinTimer,
        checkoutTimer
      }
    }));
    
    console.log(`🎬 SIMULATION: Timers set for booking ${bookingId}`);
  }, [simulateCheckin, simulateCheckout]);

  const clearSimulationTimers = useCallback((bookingId) => {
    const timers = simulationTimers[bookingId];
    if (timers) {
      if (timers.checkinTimer) clearTimeout(timers.checkinTimer);
      if (timers.checkoutTimer) clearTimeout(timers.checkoutTimer);
      
      setSimulationTimers(prev => {
        const newTimers = { ...prev };
        delete newTimers[bookingId];
        return newTimers;
      });
    }
    
    setSimulationStatus(prev => {
      const newStatus = { ...prev };
      delete newStatus[bookingId];
      return newStatus;
    });
  }, [simulationTimers]);

  // Camera monitoring functions
  const stopCameraMonitoring = useCallback((bookingId) => {
    if (cleanupFlags.current[bookingId]) {
      return;
    }
    
    cleanupFlags.current[bookingId] = true;
    console.log(`Stopping camera monitoring for booking ${bookingId}`);
    
    try {
      clearSimulationTimers(bookingId);
      
      if (streamRefs.current[bookingId]) {
        const tracks = streamRefs.current[bookingId].getTracks();
        tracks.forEach(track => track.stop());
        delete streamRefs.current[bookingId];
      }
      
      if (videoRefs.current[bookingId]) {
        videoRefs.current[bookingId].srcObject = null;
      }
      
      if (plateDetectionInterval[bookingId]) {
        clearInterval(plateDetectionInterval[bookingId]);
        setPlateDetectionInterval(prev => {
          const newIntervals = { ...prev };
          delete newIntervals[bookingId];
          return newIntervals;
        });
      }
      
      if (cameraTimers[bookingId]) {
        clearTimeout(cameraTimers[bookingId]);
        setCameraTimers(prev => {
          const newTimers = { ...prev };
          delete newTimers[bookingId];
          return newTimers;
        });
      }
      
      setCameraStartTimes(prev => {
        const newTimes = { ...prev };
        delete newTimes[bookingId];
        return newTimes;
      });
      
      setActiveCameras(prev => {
        const newCameras = { ...prev };
        delete newCameras[bookingId];
        return newCameras;
      });
      
    } catch (error) {
      console.error(`Error during cleanup for booking ${bookingId}:`, error);
    } finally {
      setTimeout(() => {
        if (cleanupFlags.current[bookingId]) {
          delete cleanupFlags.current[bookingId];
        }
      }, 1000);
    }
  }, [clearSimulationTimers, plateDetectionInterval, cameraTimers]);

  const startCameraMonitoring = useCallback(async (bookingId, mode) => {
    try {
      console.log(`Starting camera monitoring for booking ${bookingId} in ${mode} mode`);
      
      const startTime = new Date();
      setCameraStartTimes(prev => ({
        ...prev,
        [bookingId]: startTime
      }));
      
      setActiveCameras(prev => ({
        ...prev,
        [bookingId]: {
          active: true,
          mode: mode,
          startTime: startTime,
          monitoring: true,
          loading: true,
          error: null,
          persistent: true,
          hasSimulation: true
        }
      }));
      
      setupSimulationTimers(bookingId);
      
      // Set 5-minute timer
      const mainTimer = setTimeout(() => {
        console.log(`5-minute timer expired for booking ${bookingId}`);
        stopCameraMonitoring(bookingId);
        setStatusMessage(`Camera monitoring ended after 5 minutes for booking ${bookingId}`);
        setTimeout(() => setStatusMessage(''), 3000);
      }, 300000);
      
      setCameraTimers(prev => ({
        ...prev,
        [bookingId]: mainTimer
      }));
      
      // First ensure video element exists
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const videoElement = videoRefs.current[bookingId];
      if (!videoElement) {
        console.error(`Video element not found for booking ${bookingId}`);
        setActiveCameras(prev => ({
          ...prev,
          [bookingId]: {
            ...prev[bookingId],
            loading: false,
            error: 'Video element not ready. Please try again.',
            ready: false
          }
        }));
        return;
      }
      
      console.log('Video element found, requesting camera access...');
      
      // Request camera access with better constraints
      let stream;
      try {
        // Try different camera constraints for better compatibility
        const constraints = {
          video: {
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 },
            frameRate: { ideal: 30, min: 15 },
            facingMode: { ideal: 'environment', exact: undefined }
          },
          audio: false
        };
        
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log(`✅ Camera stream obtained for booking ${bookingId}`, stream);
        
        // Log stream details
        const videoTrack = stream.getVideoTracks()[0];
        console.log('Video track settings:', videoTrack.getSettings());
        
      } catch (cameraError) {
        console.error('❌ Camera access error:', cameraError);
        
        // Try fallback with any available camera
        try {
          console.log('Trying fallback camera constraints...');
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
          console.log('✅ Fallback camera stream obtained');
        } catch (fallbackError) {
          console.error('❌ Fallback camera also failed:', fallbackError);
          
          setActiveCameras(prev => ({
            ...prev,
            [bookingId]: {
              ...prev[bookingId],
              loading: false,
              error: `Camera access denied. Please allow camera permissions in your browser and refresh the page.`,
              ready: false,
              persistent: true,
              hasSimulation: true,
              needsPermission: true
            }
          }));
          return;
        }
      }
      
      // Store stream reference
      streamRefs.current[bookingId] = stream;
      console.log('Stream stored in refs');
      
      // Set up video element immediately
      videoElement.srcObject = stream;
      videoElement.muted = true;
      videoElement.playsInline = true;
      videoElement.autoplay = true;
      
      console.log('Video element configured with stream');
      
      // Force video to play and handle the result
      try {
        // Wait for metadata to load
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Metadata loading timeout'));
          }, 5000);
          
          const onLoadedMetadata = () => {
            console.log('✅ Video metadata loaded');
            clearTimeout(timeout);
            videoElement.removeEventListener('loadedmetadata', onLoadedMetadata);
            videoElement.removeEventListener('error', onError);
            resolve();
          };
          
          const onError = (error) => {
            console.error('❌ Video metadata error:', error);
            clearTimeout(timeout);
            videoElement.removeEventListener('loadedmetadata', onLoadedMetadata);
            videoElement.removeEventListener('error', onError);
            reject(error);
          };
          
          if (videoElement.readyState >= 1) {
            console.log('Video metadata already available');
            onLoadedMetadata();
          } else {
            videoElement.addEventListener('loadedmetadata', onLoadedMetadata);
            videoElement.addEventListener('error', onError);
          }
        });
        
        // Now try to play the video
        console.log('Attempting to play video...');
        await videoElement.play();
        console.log('✅ Video is now playing!');
        
        // Video is successfully playing
        setActiveCameras(prev => ({
          ...prev,
          [bookingId]: {
            ...prev[bookingId],
            loading: false,
            ready: true,
            error: null,
            videoReady: true,
            persistent: true,
            hasSimulation: true,
            streamActive: true,
            playing: true
          }
        }));
        
        console.log(`🎥 Camera setup completed successfully for booking ${bookingId}`);
        
      } catch (playError) {
        console.error('❌ Video play error:', playError);
        
        // Video loaded but autoplay failed - show click to play
        setActiveCameras(prev => ({
          ...prev,
          [bookingId]: {
            ...prev[bookingId],
            loading: false,
            ready: false,
            error: null,
            videoReady: false,
            needsUserInteraction: true,
            persistent: true,
            hasSimulation: true,
            streamLoaded: true
          }
        }));
        
        console.log('Video loaded but needs user interaction to play');
      }
      
    } catch (error) {
      console.error('❌ Error in camera monitoring setup:', error);
      
      setActiveCameras(prev => ({
        ...prev,
        [bookingId]: {
          active: true,
          mode: mode,
          startTime: cameraStartTimes[bookingId] || new Date(),
          loading: false,
          error: `Setup failed: ${error.message}. Try refreshing the page.`,
          ready: false,
          videoReady: false,
          persistent: true,
          hasSimulation: true
        }
      }));
    }
  }, [setupSimulationTimers, stopCameraMonitoring, cameraStartTimes]);

  const handleStartCheckin = useCallback(async (bookingId) => {
    console.log(`Starting check-in process for booking ${bookingId}`);
    
    try {
      if (activeCameras[bookingId]?.active && activeCameras[bookingId]?.persistent) {
        setStatusMessage(`Camera is already monitoring for booking ${bookingId}`);
        setTimeout(() => setStatusMessage(''), 3000);
        return;
      }
      
      if (activeCameras[bookingId]?.active) {
        stopCameraMonitoring(bookingId);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      await startCameraMonitoring(bookingId, 'checkin');
      
      setStatusMessage(`🎬 Started 5-minute camera monitoring with simulation for booking ${bookingId}`);
      setTimeout(() => setStatusMessage(''), 5000);
      
    } catch (error) {
      console.error(`Error starting check-in for booking ${bookingId}:`, error);
      setActivityError(`Failed to start camera monitoring: ${error.message}`);
    }
  }, [startCameraMonitoring, activeCameras, stopCameraMonitoring]);

  const handleStopCamera = useCallback((bookingId) => {
    console.log(`Manual stop requested for booking ${bookingId}`);
    stopCameraMonitoring(bookingId);
    setStatusMessage('Camera monitoring and simulation stopped manually.');
    setTimeout(() => setStatusMessage(''), 3000);
  }, [stopCameraMonitoring]);

  const handleVideoClick = useCallback(async (bookingId) => {
    const videoElement = videoRefs.current[bookingId];
    if (videoElement) {
      try {
        console.log('Manual video play attempt...');
        
        if (videoElement.paused) {
          await videoElement.play();
          console.log('✅ Manual video play successful');
          
          setActiveCameras(prev => ({
            ...prev,
            [bookingId]: {
              ...prev[bookingId],
              ready: true,
              error: null,
              videoReady: true,
              needsUserInteraction: false,
              persistent: true,
              hasSimulation: true,
              playing: true
            }
          }));
        }
      } catch (error) {
        console.error('❌ Manual video play failed:', error);
        setActiveCameras(prev => ({
          ...prev,
          [bookingId]: {
            ...prev[bookingId],
            error: 'Failed to start video. Please check camera permissions.'
          }
        }));
      }
    }
  }, []);

  // Check camera permissions
  const checkCameraPermissions = useCallback(async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' });
      console.log('Camera permission state:', result.state);
      return result.state;
    } catch (error) {
      console.log('Permission query not supported');
      return 'unknown';
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.keys(streamRefs.current).forEach(bookingId => {
        stopCameraMonitoring(bookingId);
      });
    };
  }, [stopCameraMonitoring]);

  // Update timer display every second
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCameras(prev => ({ ...prev }));
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Enhanced video element renderer with better live streaming
  const renderVideoElement = (bookingId) => {
    const camera = activeCameras[bookingId];
    const remainingTime = getRemainingTime(bookingId);
    const simulationProgress = getSimulationProgress(bookingId);
    
    if (!camera || !camera.active) return null;
    
    return (
      <div style={{ 
        width: '100%', 
        maxWidth: '600px', 
        borderRadius: '12px',
        marginBottom: '15px',
        backgroundColor: '#000',
        position: 'relative',
        aspectRatio: '16/9',
        overflow: 'hidden',
        border: '2px solid #10b981',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        {camera.loading ? (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1f2937',
            color: 'white',
            flexDirection: 'column',
            position: 'relative'
          }}>
            {/* Always create video element */}
            <video 
              ref={el => {
                if (el) {
                  console.log(`📹 Creating video ref for booking ${bookingId} during loading`);
                  videoRefs.current[bookingId] = el;
                  
                  // Set up video element properties immediately
                  el.playsInline = true;
                  el.muted = true;
                  el.controls = false;
                  el.style.width = '100%';
                  el.style.height = '100%';
                  el.style.objectFit = 'cover';
                  el.style.position = 'absolute';
                  el.style.top = '0';
                  el.style.left = '0';
                  el.style.zIndex = '1';
                }
              }}
              playsInline
              muted
              autoPlay
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                zIndex: 1
              }}
            />
            <div style={{ 
              position: 'relative', 
              zIndex: 10, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              backgroundColor: 'rgba(31, 41, 55, 0.8)',
              padding: '20px',
              borderRadius: '8px'
            }}>
              <RefreshCw size={48} style={{ 
                marginBottom: '15px',
                animation: 'spin 1s linear infinite'
              }} />
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Starting Camera...</div>
              <div style={{ fontSize: '0.9rem', marginTop: '10px', color: '#10b981' }}>
                Timer: {formatRemainingTime(remainingTime)} remaining
              </div>
              {camera.hasSimulation && simulationProgress && (
                <div style={{ fontSize: '0.9rem', marginTop: '10px', color: '#f59e0b', fontWeight: 'bold' }}>
                  🎬 {simulationProgress.message}
                </div>
              )}
            </div>
          </div>
        ) : camera.error || camera.needsPermission ? (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1f2937',
            color: 'white',
            flexDirection: 'column',
            padding: '30px',
            textAlign: 'center',
            position: 'relative'
          }}>
            {/* Video element still available for retry */}
            <video 
              ref={el => {
                if (el) {
                  console.log(`📹 Creating video ref for booking ${bookingId} during error`);
                  videoRefs.current[bookingId] = el;
                  el.playsInline = true;
                  el.muted = true;
                  el.controls = false;
                }
              }}
              playsInline
              muted
              autoPlay
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                zIndex: 1
              }}
            />
            
            <div style={{ 
              position: 'relative', 
              zIndex: 10,
              backgroundColor: 'rgba(31, 41, 55, 0.9)',
              padding: '20px',
              borderRadius: '8px'
            }}>
              <AlertCircle size={48} style={{ 
                marginBottom: '15px',
                color: '#f59e0b'
              }} />
              <div style={{ fontSize: '1.1rem', marginBottom: '15px', fontWeight: 'bold' }}>
                {camera.needsPermission ? 'Camera Permission Required' : 'Camera Error'}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#d1d5db', marginBottom: '15px' }}>
                {camera.needsPermission ? 
                  'Please allow camera access in your browser and click "Enable Camera" below.' :
                  camera.error
                }
              </div>
              <div style={{ fontSize: '0.9rem', marginBottom: '15px', color: '#10b981', fontWeight: 'bold' }}>
                Timer: {formatRemainingTime(remainingTime)} remaining
              </div>
              {camera.hasSimulation && simulationProgress && (
                <div style={{ fontSize: '0.9rem', marginBottom: '15px', color: '#f59e0b', fontWeight: 'bold' }}>
                  🎬 {simulationProgress.message}
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                  onClick={() => handleStartCheckin(bookingId)}
                  style={{
                    padding: '12px 24px',
                    background: '#4f46e5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Camera size={20} />
                  {camera.needsPermission ? 'Enable Camera' : 'Retry Camera'}
                </button>
              </div>
            </div>
          </div>
        ) : camera.needsUserInteraction || camera.streamLoaded ? (
          <div style={{
            width: '100%',
            height: '100%',
            position: 'relative'
          }}>
            {/* Video element - should show stream */}
            <video 
              ref={el => {
                if (el) {
                  console.log(`📹 Creating video ref for booking ${bookingId} - needs interaction`);
                  videoRefs.current[bookingId] = el;
                  el.playsInline = true;
                  el.muted = true;
                  el.controls = false;
                }
              }}
              playsInline
              muted
              onClick={() => handleVideoClick(bookingId)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                backgroundColor: '#000',
                cursor: 'pointer'
              }}
            />
            
            {/* Play button overlay */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: '20px',
              borderRadius: '50%',
              cursor: 'pointer'
            }}
            onClick={() => handleVideoClick(bookingId)}
            >
              <Play size={40} color="white" />
            </div>
            
            {/* Timer overlay */}
            <div style={{
              position: 'absolute',
              top: '15px',
              left: '15px',
              background: 'rgba(239, 68, 68, 0.95)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              zIndex: 5
            }}>
              READY • {formatRemainingTime(remainingTime)}
            </div>
            
            {/* Simulation overlay */}
            {camera.hasSimulation && simulationProgress && (
              <div style={{
                position: 'absolute',
                top: '70px',
                left: '15px',
                right: '15px',
                background: 'rgba(245, 158, 11, 0.95)',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '1rem',
                textAlign: 'center',
                fontWeight: 'bold',
                zIndex: 5
              }}>
                🎬 SIMULATION: {simulationProgress.message}
              </div>
            )}
          </div>
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            position: 'relative'
          }}>
            {/* MAIN VIDEO ELEMENT - LIVE FEED */}
            <video 
              ref={el => {
                if (el) {
                  console.log(`📹 Creating LIVE video ref for booking ${bookingId}`);
                  videoRefs.current[bookingId] = el;
                  
                  // Ensure video properties are set correctly
                  el.playsInline = true;
                  el.muted = true;
                  el.controls = false;
                  el.autoplay = true;
                  
                  // Debug video element
                  el.addEventListener('loadstart', () => console.log('📹 Video loadstart'));
                  el.addEventListener('loadedmetadata', () => console.log('📹 Video metadata loaded'));
                  el.addEventListener('canplay', () => console.log('📹 Video can play'));
                  el.addEventListener('playing', () => console.log('📹 Video is playing'));
                  el.addEventListener('error', (e) => console.error('📹 Video error:', e));
                }
              }}
              playsInline
              muted
              autoPlay
              onClick={() => handleVideoClick(bookingId)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                backgroundColor: '#000',
                display: 'block',
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 1
              }}
            />
            
            {/* LIVE indicator with timer */}
            {camera.videoReady && (
              <div style={{
                position: 'absolute',
                top: '15px',
                left: '15px',
                background: 'rgba(239, 68, 68, 0.95)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                zIndex: 10
              }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: 'white',
                  marginRight: '8px',
                  animation: 'pulse 1s infinite'
                }} />
                LIVE • {formatRemainingTime(remainingTime)}
              </div>
            )}
            
            {/* Simulation status overlay */}
            {camera.hasSimulation && simulationProgress && camera.videoReady && (
              <div style={{
                position: 'absolute',
                top: '70px',
                left: '15px',
                right: '15px',
                background: 'rgba(245, 158, 11, 0.95)',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '1rem',
                textAlign: 'center',
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                zIndex: 10
              }}>
                🎬 SIMULATION: {simulationProgress.message}
              </div>
            )}
            
            {/* Detection status overlay */}
            {camera.videoReady && (
              <div style={{
                position: 'absolute',
                bottom: '15px',
                left: '15px',
                right: '15px',
                background: 'rgba(0, 0, 0, 0.85)',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '0.95rem',
                textAlign: 'center',
                fontWeight: '500',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                zIndex: 10
              }}>
                {camera.simulatingCheckin ? 
                  '🎬 SIMULATING CHECK-IN...' :
                  camera.simulatingCheckout ?
                  '🎬 SIMULATING CHECKOUT...' :
                  camera.mode === 'checkin' ? 
                    '🔍 Scanning for authorized vehicle plates...' :
                    `🚗 Waiting for vehicle: ${detectedPlates[bookingId]?.plateNumber || 'Unknown'}`
                }
              </div>
            )}
            
            {/* Controls overlay */}
            <div style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              display: 'flex',
              gap: '8px',
              zIndex: 10
            }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStopCamera(bookingId);
                }}
                style={{
                  background: 'rgba(220, 38, 38, 0.9)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}
              >
                <StopCircle size={16} style={{ marginRight: '4px' }} />
                Stop
              </button>
            </div>
          </div>
        )}
        
        {/* Hidden canvas for image capture */}
        <canvas 
          ref={el => {
            if (el) {
              canvasRefs.current[bookingId] = el;
            }
          }}
          style={{ display: 'none' }} 
        />
      </div>
    );
  };

  // Vehicle type icons
  const getVehicleIcon = (type) => {
    switch(type) {
      case 1:
        return <Bike size={18} style={{ marginRight: '4px' }} />;
      case 2:
        return <Car size={18} style={{ marginRight: '4px' }} />;
      case 3:
        return <Truck size={18} style={{ marginRight: '4px' }} />;
      default:
        return <Car size={18} style={{ marginRight: '4px' }} />;
    }
  };

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
        <button 
          onClick={onBack}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer',
            color: '#4f46e5',
            marginRight: '20px',
            fontSize: '1rem'
          }}
        >
          <ArrowLeft size={20} />
          <span style={{ marginLeft: '8px' }}>Back to Dashboard</span>
        </button>
        <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', fontSize: '2rem' }}>
          <Users size={28} style={{ marginRight: '12px' }} />
          Live Camera Monitoring System
        </h1>
      </div>

      {/* Enhanced Simulation Info */}
      <div style={{ 
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', 
        borderRadius: '16px', 
        padding: '30px', 
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)', 
        marginBottom: '30px',
        border: '2px solid #0ea5e9'
      }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '1.8rem', color: '#0c4a6e' }}>🎬 Live Camera Simulation System</h2>
        <p style={{ margin: '0 0 20px 0', color: '#0c4a6e', fontSize: '1.1rem' }}>
          Real-time camera streaming
        </p>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
          
          <div style={{
            background: '#dcfce7',
            color: '#047857',
            padding: '12px 20px',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '1rem',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}>
            ✅ Live Video Feed + Completion
          </div>
        </div>
        <div style={{ 
          background: 'rgba(255,255,255,0.8)', 
          padding: '15px', 
          borderRadius: '12px',
          fontSize: '1rem',
          color: '#0c4a6e'
        }}>
          📹 <strong>Live Camera Features:</strong> Real-time video streaming, automatic plate detection simulation, 5-minute persistent monitoring, interactive controls
        </div>
      </div>

      {/* Status Messages */}
      {statusMessage && (
        <div style={{ 
          margin: '0 0 20px 0', 
          padding: '15px 20px', 
          backgroundColor: statusMessage.includes('❌') ? '#fee2e2' : '#ecfdf5', 
          borderRadius: '12px', 
          borderLeft: statusMessage.includes('❌') ? '4px solid #dc2626' : '4px solid #10b981',
          display: 'flex',
          alignItems: 'center',
          fontSize: '1rem'
        }}>
          {statusMessage.includes('❌') ? 
            <XCircle size={20} style={{ marginRight: '12px', color: '#dc2626' }} /> :
            <CheckCircle size={20} style={{ marginRight: '12px', color: '#10b981' }} />
          }
          <span style={{ 
            color: statusMessage.includes('❌') ? '#b91c1c' : '#065f46', 
            fontWeight: 600 
          }}>
            {statusMessage}
          </span>
        </div>
      )}

      {/* Main Content */}
      <div style={{ 
        background: 'white', 
        borderRadius: '16px', 
        padding: '30px', 
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)', 
        marginBottom: '30px' 
      }}>
        <h2 style={{ margin: '0 0 25px 0', fontSize: '1.8rem' }}>Parking Activity Monitor</h2>
        
        <div>
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div key={activity.id} style={{ marginBottom: '20px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)'
                }}
                onClick={() => setExpandedActivity(expandedActivity === activity.id ? null : activity.id)}
                >
                  <div style={{ 
                    width: '50px', 
                    height: '50px', 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '20px',
                    fontSize: '1.5rem',
                    fontWeight: 'bold'
                  }}>
                    {activity.user ? activity.user.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>
                      <span style={{ fontWeight: 'bold' }}>{activity.user}</span> {activity.action}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#6b7280' }}>{activity.time}</p>
                  </div>
                  <ChevronRight 
                    size={20} 
                    style={{ 
                      transform: expandedActivity === activity.id ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s'
                    }} 
                  />
                </div>

                {/* Show expanded view for selected activity */}
                {expandedActivity === activity.id && (
                  <div style={{ 
                    padding: '30px', 
                    border: '2px solid #e5e7eb',
                    borderTop: 'none',
                    borderBottomLeftRadius: '12px',
                    borderBottomRightRadius: '12px',
                    background: '#f9fafb'
                  }}>
                    <h3 style={{ marginTop: 0, fontSize: '1.5rem' }}>{activity.user}'s Live Monitoring</h3>
                    
                    <div>
                      {userBookings[activity.id] && userBookings[activity.id].map((booking) => {
                        const displayStatus = determineBookingStatus(booking);
                        const cameraActive = activeCameras[booking.id]?.active;
                        const detectedPlate = detectedPlates[booking.id];
                        const remainingTime = getRemainingTime(booking.id);
                        const isCompleted = displayStatus === 'completed' && detectedPlate?.isSimulated;

                        return (
                          <div key={booking.id} style={{ 
                            background: 'white', 
                            borderRadius: '16px', 
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)', 
                            marginBottom: '20px',
                            overflow: 'hidden',
                            border: '2px solid #e5e7eb'
                          }}>
                            <div style={{ 
                              padding: '25px', 
                              borderBottom: '2px solid #e5e7eb'
                            }}>
                              <div>
                                <h4 style={{ margin: '0 0 10px 0', fontSize: '1.3rem' }}>{booking.parkingLotName || 'Parking Lot'}</h4>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <span style={{ fontSize: '1rem', color: '#6b7280' }}>ID: {booking.bookingId || booking.id || 'N/A'}</span>
                                    <span style={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      fontSize: '0.9rem', 
                                      color: '#6b7280',
                                      background: '#f3f4f6',
                                      padding: '4px 12px',
                                      borderRadius: '999px'
                                    }}>
                                      {getVehicleIcon(booking.vehicleType)}
                                      {booking.vehicleType === 1 ? 'Bike' : 
                                       booking.vehicleType === 2 ? 'Car' : 
                                       booking.vehicleType === 3 ? 'Truck' : 'Vehicle'}
                                    </span>
                                  </div>
                                  <span style={{ 
                                    padding: '6px 16px', 
                                    borderRadius: '999px',
                                    fontSize: '0.9rem',
                                    fontWeight: 'bold',
                                    background: 
                                      displayStatus === 'active' ? '#dbeafe' : 
                                      displayStatus === 'completed' ? '#d1fae5' : '#f3f4f6',
                                    color: 
                                      displayStatus === 'active' ? '#1e40af' : 
                                      displayStatus === 'completed' ? '#047857' : '#374151'
                                  }}>
                                    {displayStatus === 'completed' && detectedPlate?.isSimulated ? 
                                      '🎬 Simulation Completed' : 
                                      displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)
                                    }
                                  </span>
                                </div>
                              </div>
                              
                              {/* Location and timing details */}
                              <div style={{ 
                                marginTop: '15px',
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '15px',
                                fontSize: '0.9rem'
                              }}>
                                <div style={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  color: '#4b5563'
                                }}>
                                  <MapPin size={16} style={{ marginRight: '6px', color: '#6b7280' }} />
                                  {booking.location || 'Location not available'}
                                </div>
                                <div style={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  color: '#4b5563'
                                }}>
                                  <Clock size={16} style={{ marginRight: '6px', color: '#6b7280' }} />
                                  {booking.startTime ? formatDateTime(booking.startTime) : 'Time not available'}
                                </div>
                              </div>
                            </div>

                            <div style={{ padding: '25px' }}>
                              {/* Simulation Status Display */}
                              {detectedPlate?.isSimulated && (
                                <div style={{ marginBottom: '25px' }}>
                                  <h5 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#6b7280' }}>🎬 Simulation Results</h5>
                                  <div style={{ 
                                    background: displayStatus === 'completed' ? '#dcfce7' : '#fef3c7',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    border: displayStatus === 'completed' ? '2px solid #10b981' : '2px solid #f59e0b'
                                  }}>
                                    {detectedPlate?.checkinTime && (
                                      <div style={{ fontSize: '1rem', marginBottom: '10px', color: displayStatus === 'completed' ? '#047857' : '#92400e' }}>
                                        ✅ <strong>Check-in:</strong> {detectedPlate.checkinTime.toLocaleTimeString()} - KA19EQ1316
                                      </div>
                                    )}
                                    {detectedPlate?.checkoutTime && (
                                      <div style={{ fontSize: '1rem', marginBottom: '10px', color: '#047857' }}>
                                        ✅ <strong>Checkout:</strong> {detectedPlate.checkoutTime.toLocaleTimeString()} - KA19EQ1316
                                      </div>
                                    )}
                                    {displayStatus === 'completed' && (
                                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#047857' }}>
                                        🎉 <strong>LIVE SIMULATION COMPLETED SUCCESSFULLY!</strong>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Camera Debug Info (for testing) */}
                              {cameraActive && (
                                <div style={{ 
                                  marginBottom: '20px',
                                  background: '#f8fafc',
                                  padding: '15px',
                                  borderRadius: '8px',
                                  border: '1px solid #e2e8f0',
                                  fontSize: '0.85rem'
                                }}>
                                  <h6 style={{ margin: '0 0 10px 0', color: '#475569' }}>Camera Debug Info:</h6>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', color: '#64748b' }}>
                                    <div>Status: {activeCameras[booking.id]?.videoReady ? '✅ Ready' : '⏳ Loading'}</div>
                                    <div>Stream: {activeCameras[booking.id]?.streamActive ? '✅ Active' : '❌ Inactive'}</div>
                                    <div>Mode: {activeCameras[booking.id]?.mode}</div>
                                    <div>Playing: {activeCameras[booking.id]?.playing ? '✅ Yes' : '❌ No'}</div>
                                    <div>Error: {activeCameras[booking.id]?.error ? '❌ Yes' : '✅ None'}</div>
                                    <div>Timer: {formatRemainingTime(remainingTime)}</div>
                                  </div>
                                  {activeCameras[booking.id]?.error && (
                                    <div style={{ marginTop: '8px', padding: '8px', background: '#fee2e2', borderRadius: '4px', color: '#dc2626' }}>
                                      Error: {activeCameras[booking.id].error}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Live Camera Feed */}
                              {cameraActive && (
                                <div style={{ 
                                  marginBottom: '25px',
                                  background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                                  padding: '25px',
                                  borderRadius: '16px',
                                  border: '2px solid #10b981'
                                }}>
                                  <h5 style={{ 
                                    margin: '0 0 20px 0', 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    fontSize: '1.2rem'
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                      <Video size={24} style={{ marginRight: '12px', color: '#10b981' }} />
                                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                                        🔴 LIVE CAMERA MONITORING
                                      </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                      <div style={{
                                        padding: '8px 16px',
                                        background: '#10b981',
                                        color: 'white',
                                        borderRadius: '8px',
                                        fontSize: '0.9rem',
                                        fontWeight: 'bold'
                                      }}>
                                        ⏱️ {formatRemainingTime(remainingTime)}
                                      </div>
                                    </div>
                                  </h5>
                                  
                                  <div style={{ 
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center'
                                  }}>
                                    {renderVideoElement(booking.id)}
                                  </div>
                                </div>
                              )}

                              {/* Start Button and Camera Info - Only show if not completed */}
                              {displayStatus === 'active' && 
                               !cameraActive && 
                               !isCompleted && (
                                <div style={{ textAlign: 'center' }}>
                                  {/* Camera Permission Check */}
                                  <div style={{ 
                                    marginBottom: '20px',
                                    padding: '15px',
                                    background: '#f0f9ff',
                                    borderRadius: '8px',
                                    border: '1px solid #0ea5e9'
                                  }}>
                                    <h6 style={{ margin: '0 0 10px 0', color: '#0c4a6e' }}>📹 Camera Requirements:</h6>
                                    <ul style={{ margin: '0', paddingLeft: '20px', color: '#0c4a6e', textAlign: 'left' }}>
                                      <li>Allow camera permissions when prompted</li>
                                      <li>Ensure no other apps are using your camera</li>
                                      <li>Use a supported browser (Chrome, Firefox, Safari)</li>
                                      <li>Enable HTTPS for camera access</li>
                                    </ul>
                                  </div>
                                  
                                  <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                    <button
                                      onClick={() => handleStartCheckin(booking.id)}
                                      style={{
                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '16px 32px',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        fontWeight: 'bold',
                                        fontSize: '1.1rem',
                                        boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)'
                                      }}
                                    >
                                      <Video size={20} style={{ marginRight: '12px' }} />
                                      Start Live Camera Monitoring
                                    </button>
                                    
                                    <button
                                      onClick={async () => {
                                        const permission = await checkCameraPermissions();
                                        alert(`Camera permission status: ${permission}`);
                                      }}
                                      style={{
                                        background: '#f3f4f6',
                                        color: '#374151',
                                        border: '1px solid #d1d5db',
                                        padding: '16px 24px',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        fontWeight: 'bold',
                                        fontSize: '0.9rem'
                                      }}
                                    >
                                      <Camera size={18} style={{ marginRight: '8px' }} />
                                      Check Camera Access
                                    </button>
                                  </div>
                                </div>
                              )}
                              
                              {/* Completion Message */}
                              {isCompleted && (
                                <div style={{
                                  padding: '25px',
                                  background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                                  border: '3px solid #10b981',
                                  borderRadius: '16px',
                                  textAlign: 'center'
                                }}>
                                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#047857', marginBottom: '10px' }}>
                                    🎉 Live Camera Simulation Successfully Completed!
                                  </div>
                                  <div style={{ fontSize: '1.1rem', color: '#065f46' }}>
                                    Vehicle KA19EQ1316 completed full check-in and checkout cycle with live camera monitoring
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px',
              color: '#6b7280'
            }}>
              <Activity size={48} style={{ marginBottom: '16px' }} />
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem' }}>No Recent Activity</h3>
              <p style={{ margin: 0, fontSize: '1rem' }}>
                No parking activities found. Activities will appear here when users book parking spots.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Enhanced CSS animations */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .loading-spinner {
          animation: spin 1s linear infinite;
        }
        
        button:hover {
          transform: translateY(-2px);
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default UsersList;