

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { rtdb } from '../firebase';
// import { ref, onValue, update, get, set } from 'firebase/database';
// import { db } from '../firebase';
// import { collection, getDocs } from 'firebase/firestore';
// import { 
//   Users, ArrowLeft, Clock, MapPin, Activity, ChevronRight, 
//   CreditCard, Banknote, AlertTriangle, CheckCircle, Camera,
//   Bike, Truck, Car
// } from 'lucide-react';
// import '../styles/UsersList.css';

// const firebaseConfig = {
//   apiKey: "AIzaSyAFsaILmmuOOdvNywnNnBGMmnOkeFW0aEo",
//   authDomain: "npk-values-4a297.firebaseapp.com",
//   databaseURL: "https://npk-values-4a297-default-rtdb.firebaseio.com",
//   projectId: "npk-values-4a297",
//   storageBucket: "npk-values-4a297.firebasestorage.app",
//   messagingSenderId: "767366753983",
//   appId: "1:767366753983:web:8754c232555ee786d6a00a",
//   measurementId: "G-50PHBHYNFR"
// };

// const UsersList = ({ onBack, recentActivity = [] }) => {
//   // State declarations
//   const [users, setUsers] = useState([]);
//   const [allBookings, setAllBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [expandedActivity, setExpandedActivity] = useState(null);
//   const [userBookings, setUserBookings] = useState([]);
//   const [activityError, setActivityError] = useState(null);
//   const [loadingBookings, setLoadingBookings] = useState(true);
//   const [bookingStates, setBookingStates] = useState({});
//   const [paymentProcessing, setPaymentProcessing] = useState({});
//   const [correctedActivity, setCorrectedActivity] = useState([]);
//   const [verificationResults, setVerificationResults] = useState({});
//   const [connectionStatus, setConnectionStatus] = useState(0);
//   const [occupiedSlots, setOccupiedSlots] = useState([]);
//   const [checkinTimeouts, setCheckinTimeouts] = useState({});
//   const [previousStatus, setPreviousStatus] = useState(0);
//   const [hasCheckedInOnce, setHasCheckedInOnce] = useState(false);
//   const [autoStatusResetTimer, setAutoStatusResetTimer] = useState(null);
//   const [statusMessage, setStatusMessage] = useState('');
//   const [bookingOperationState, setBookingOperationState] = useState({
//     checkin: false,
//     checkout: false
//   });
//   const [lastProcessedBookingId, setLastProcessedBookingId] = useState(null);
//   const [zones, setZones] = useState([
//     { id: 1, name: 'Zone A', type: 'Car', occupied: false },
//     { id: 2, name: 'Zone B', type: 'Car', occupied: false },
//     { id: 3, name: 'Zone C', type: 'Car', occupied: false }
//   ]);

//   const videoRefs = useRef({});
//   const canvasRefs = useRef({});

//   // Razorpay Test API Key
//   const RAZORPAY_KEY_ID = 'rzp_test_vg2WzWGNEHJpgj';

//   // Add custom styles for status indicators
//   useEffect(() => {
//     // Add CSS for the status message
//     const style = document.createElement('style');
//     style.textContent = `
//       .status-message-container {
//         margin: 10px 0;
//         padding: 8px 16px;
//         background-color: #f0f9ff;
//         border-radius: 8px;
//         border-left: 4px solid #3b82f6;
//       }
      
//       .status-message {
//         display: flex;
//         align-items: center;
//         color: #1e40af;
//         font-weight: 500;
//       }
      
//       .status-message svg {
//         margin-right: 8px;
//         color: #3b82f6;
//       }
      
//       .firebase-triggered {
//         background-color: #fff7ed !important;
//         color: #9a3412 !important;
//         border-color: #f97316 !important;
//       }
      
//       .check-out-status {
//         background-color: #ecfdf5 !important;
//         color: #065f46 !important;
//         border-color: #10b981 !important;
//       }
      
//       .checkout-message {
//         background-color: #ecfdf5 !important;
//         border-left: 4px solid #10b981 !important;
//       }
      
//       .checkout-message .status-message {
//         color: #065f46 !important;
//       }
      
//       .checkout-message svg {
//         color: #10b981 !important;
//       }
//     `;
//     document.head.appendChild(style);
    
//     return () => {
//       document.head.removeChild(style);
//     };
//   }, []);

//   // Helper Functions
//   const extractBookingInfo = (actionText) => {
//     const spaceMatch = actionText.match(/Space\s+#?(\d+)/);
//     const locationMatch = actionText.match(/at\s+([^,]+)(?:\s+at\s+\d+\/\d+\/\d+|$)/);
//     const dateTimeMatch = actionText.match(/(\d+\/\d+\/\d+,\s+\d+:\d+:\d+\s+[AP]M)/);
    
//     return {
//       location: locationMatch ? locationMatch[1].trim() : null,
//       spaceId: spaceMatch ? spaceMatch[1].trim() : null,
//       dateTime: dateTimeMatch ? dateTimeMatch[1].trim() : null
//     };
//   };

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

//   const getStatusClass = (status) => {
//     switch (status) {
//       case 'active':
//         return 'status-active';
//       case 'completed':
//         return 'status-completed';
//       case 'cancelled':
//         return 'status-cancelled';
//       case 'timeout':
//         return 'status-timeout';
//       default:
//         return '';
//     }
//   };

//   const getTimeDifference = (start, end) => {
//     if (!start || !end) return 'N/A';
//     const diffMs = end - start;
//     const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
//     const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
//     return `${diffHrs}h ${diffMins}m`;
//   };

//   const determineBookingStatus = (booking) => {
//     const now = new Date();
//     const startTime = booking.startTime ? new Date(booking.startTime) : null;
//     const endTime = booking.endTime ? new Date(booking.endTime) : null;

//     if (booking.status === 'cancelled') {
//       return 'cancelled';
//     } else if (booking.status === 'completed') {
//       return 'completed';
//     } else if (booking.status === 'timeout') {
//       return 'timeout';
//     } else if (startTime && endTime) {
//       if (now < startTime) {
//         return 'active';
//       } else if (now >= startTime && now <= endTime) {
//         return 'active';
//       } else if (now > endTime) {
//         return 'completed';
//       }
//     }
//     return booking.status || 'active';
//   };

//   const getVehicleTypeLabel = (type) => {
//     switch (type) {
//       case 2:
//         return 'Car';
//       case 3:
//         return 'Car';
//       case 4:
//         return 'Car';
//       default:
//         return 'Not specified';
//     }
//   };

//   const getVehicleTypeIcon = (type) => {
//     switch (type) {
//       case 2:
//         return <Car size={16} />;
//       case 3:
//         return <Truck size={16} />;
//       case 4:
//         return <Car size={16} />;
//       default:
//         return <Car size={16} />;
//     }
//   };

//   const renderZoneIcon = (zoneId) => {
//     switch (zoneId) {
//       case 1:
//         return <Bike size={24} />;
//       case 2:
//         return <Truck size={24} />;
//       case 3:
//         return <Car size={24} />;
//       default:
//         return null;
//     }
//   };

//   // Firebase Update Functions
//   const updateBookingWithCheckinData = async (bookingId, vehicleNumber, imageData, vehicleType, slotNumber) => {
//     try {
//       console.log(`Updating booking ${bookingId} with check-in data:`, {
//         vehicleNumber,
//         vehicleType,
//         slotNumber
//       });
      
//       const bookingRef = ref(rtdb, `bookings/${bookingId}`);
//       await update(bookingRef, { 
//         checkinVehicleNumber: vehicleNumber,
//         checkinImageData: imageData,
//         vehicleType: vehicleType,
//         checkedIn: true,
//         checkinTime: new Date().toISOString()
//       });
      
//       if (!occupiedSlots.includes(slotNumber)) {
//         const updatedOccupiedSlots = [...occupiedSlots, slotNumber];
        
//         console.log(`Adding slot ${slotNumber} to occupied slots:`, updatedOccupiedSlots);
        
//         const slotsRef = ref(rtdb, 'occupied_slots');
//         await set(slotsRef, JSON.stringify(updatedOccupiedSlots));
        
//         const slotRef = ref(rtdb, 'slot');
//         await set(slotRef, JSON.stringify(slotNumber.toString()));
//       }
      
//       const connectionRef = ref(rtdb, 'connection_status');
//       const connectionSnapshot = await get(connectionRef);
//       const currentValue = connectionSnapshot.exists() ? parseInt(connectionSnapshot.val()) : 0;
//       const newValue = currentValue + 1;
//       console.log(`Incrementing connection status from ${currentValue} to ${newValue}`);
//       await set(connectionRef, newValue);
      
//       setupCheckinTimeout(bookingId, slotNumber);
      
//       setUserBookings(prevBookings =>
//         prevBookings.map(booking =>
//           booking.id === bookingId
//             ? { 
//                 ...booking, 
//                 checkinVehicleNumber: vehicleNumber,
//                 checkinImageData: imageData,
//                 vehicleType: vehicleType,
//                 checkedIn: true,
//                 checkinTime: new Date()
//               }
//             : booking
//         )
//       );
      
//       setLastProcessedBookingId(bookingId);
//       setStatusMessage('Check-in completed successfully!');
//       console.log(`Check-in data updated successfully for booking ${bookingId}`);
//     } catch (error) {
//       console.error("Error updating check-in data in Firebase:", error);
//       setActivityError('Failed to update check-in data in booking.');
      
//       setBookingStates(prev => ({
//         ...prev,
//         [bookingId]: {
//           ...prev[bookingId],
//           webcamActive: false,
//           webcamMode: null,
//           checkinVehicleNumber: null,
//           checkinImageData: null,
//           vehicleType: null,
//           zoneSelected: false,
//         }
//       }));
//       throw error;
//     }
//   };
  
//   const updateBookingWithCheckoutData = async (bookingId, vehicleNumber, imageData, matchValue) => {
//     try {
//       const booking = userBookings.find(b => b.id === bookingId) || 
//         allBookings.find(b => b.id === bookingId);
      
//       const slotNumber = booking?.spaceId;
      
//       const bookingRef = ref(rtdb, `bookings/${bookingId}`);
//       await update(bookingRef, { 
//         checkoutVehicleNumber: vehicleNumber,
//         checkoutImageData: imageData,
//         verificationResult: matchValue,
//         checkedOut: true,
//         checkoutTime: new Date().toISOString(),
//         status: 'completed'  // Update the status to completed on checkout
//       });
      
//       if (slotNumber && occupiedSlots.includes(parseInt(slotNumber))) {
//         const updatedOccupiedSlots = occupiedSlots.filter(id => id !== parseInt(slotNumber));
        
//         const slotsRef = ref(rtdb, 'occupied_slots');
//         await set(slotsRef, JSON.stringify(updatedOccupiedSlots));
        
//         const connectionRef = ref(rtdb, 'connection_status');
//         const connectionSnapshot = await get(connectionRef);
//         const currentValue = connectionSnapshot.exists() ? parseInt(connectionSnapshot.val()) : 0;
//         if (currentValue > 0) {
//           await set(connectionRef, currentValue - 1);
//         }
//       }
      
//       if (checkinTimeouts[bookingId]) {
//         clearTimeout(checkinTimeouts[bookingId]);
//         setCheckinTimeouts(prev => {
//           const newTimeouts = { ...prev };
//           delete newTimeouts[bookingId];
//           return newTimeouts;
//         });
//       }
      
//       // Update both userBookings and allBookings to reflect the completed status
//       setUserBookings(prevBookings =>
//         prevBookings.map(booking =>
//           booking.id === bookingId
//             ? { 
//                 ...booking, 
//                 checkoutVehicleNumber: vehicleNumber,
//                 checkoutImageData: imageData,
//                 verificationResult: matchValue,
//                 checkedOut: true,
//                 checkoutTime: new Date(),
//                 status: 'completed'
//               }
//             : booking
//         )
//       );
      
//       setAllBookings(prevBookings =>
//         prevBookings.map(booking =>
//           booking.id === bookingId
//             ? { 
//                 ...booking, 
//                 checkoutVehicleNumber: vehicleNumber,
//                 checkoutImageData: imageData,
//                 verificationResult: matchValue,
//                 checkedOut: true,
//                 checkoutTime: new Date(),
//                 status: 'completed'
//               }
//             : booking
//         )
//       );
      
//       setLastProcessedBookingId(bookingId);
//       setStatusMessage('Check-out completed successfully!');
//     } catch (error) {
//       console.error("Error updating checkout data in Firebase:", error);
//       setActivityError('Failed to update checkout data in booking.');
//       throw error;
//     }
//   };

//   // Timeout Management
//   const setupCheckinTimeout = (bookingId, slotNumber) => {
//     if (checkinTimeouts[bookingId]) {
//       clearTimeout(checkinTimeouts[bookingId]);
//     }
    
//     const timeoutId = setTimeout(async () => {
//       try {
//         console.log(`15-minute timeout reached for booking ${bookingId}`);
        
//         const bookingRef = ref(rtdb, `bookings/${bookingId}`);
//         const bookingSnapshot = await get(bookingRef);
        
//         if (bookingSnapshot.exists()) {
//           const bookingData = bookingSnapshot.val();
          
//           if (!bookingData.checkedOut) {
//             console.log(`Auto-releasing slot ${slotNumber} for booking ${bookingId}`);
            
//             const updatedOccupiedSlots = occupiedSlots.filter(id => id !== parseInt(slotNumber));
//             const slotsRef = ref(rtdb, 'occupied_slots');
//             await set(slotsRef, JSON.stringify(updatedOccupiedSlots));
            
//             const connectionRef = ref(rtdb, 'connection_status');
//             const connectionSnapshot = await get(connectionRef);
//             const currentValue = connectionSnapshot.exists() ? parseInt(connectionSnapshot.val()) : 0;
//             if (currentValue > 0) {
//               await set(connectionRef, currentValue - 1);
//             }
            
//             await update(bookingRef, {
//               status: 'timeout',
//               timeoutAt: new Date().toISOString(),
//               autoReleased: true
//             });
            
//             console.log(`Slot ${slotNumber} automatically released due to 15-minute timeout`);
//           }
//         }
//       } catch (error) {
//         console.error("Error during automatic slot release:", error);
//       }
      
//       setCheckinTimeouts(prev => {
//         const newTimeouts = { ...prev };
//         delete newTimeouts[bookingId];
//         return newTimeouts;
//       });
//     }, 15 * 60 * 1000); // 15 minutes
    
//     setCheckinTimeouts(prev => ({
//       ...prev,
//       [bookingId]: timeoutId
//     }));
//   };

//   // Reset Firebase status after 3 seconds
//   const autoResetFirebaseStatus = useCallback(() => {
//     if (autoStatusResetTimer) {
//       clearTimeout(autoStatusResetTimer);
//     }
    
//     const timer = setTimeout(async () => {
//       try {
//         console.log("Auto-resetting Firebase status to 0 after 3 seconds");
//         const statusRef = ref(rtdb, 'Car_Parking/Status/status');
//         await set(statusRef, 0);
//         console.log("Firebase status reset to 0");
//       } catch (error) {
//         console.error("Error resetting Firebase status:", error);
//       }
//     }, 3000); // 3 seconds
    
//     setAutoStatusResetTimer(timer);
//   }, [autoStatusResetTimer]);

//   // Automatic Check-in/Check-out Functions
//   const handleAutomaticCheckin = useCallback(async () => {
//     try {
//       console.log("Starting automatic check-in process");
      
//       if (allBookings.length === 0) {
//         console.log("No bookings available yet - waiting for data to load");
//         return;
//       }
      
//       const activeBooking = allBookings.find(booking => 
//         (booking.status === 'active' || booking.status === 'confirmed') && 
//         !booking.checkedIn
//       );
      
//       if (!activeBooking) {
//         console.log("No eligible bookings found for automatic check-in");
//         return;
//       }
      
//       console.log(`Found eligible booking for check-in: ${activeBooking.id}`);
      
//       const spaceId = activeBooking.spaceId ? parseInt(activeBooking.spaceId) : 1;
//       const vehicleType = 2; // Car
//       const slotNumber = spaceId <= 3 ? spaceId : 1;
//       const vehicleNumber = "AUTO-CHECK-IN";
      
//       await updateBookingWithCheckinData(
//         activeBooking.id,
//         vehicleNumber,
//         null,
//         vehicleType,
//         slotNumber
//       );
      
//       setBookingStates(prev => ({
//         ...prev,
//         [activeBooking.id]: {
//           ...prev[activeBooking.id],
//           webcamActive: false,
//           webcamMode: null,
//           checkinVehicleNumber: vehicleNumber,
//           vehicleType: vehicleType,
//           zoneSelected: true,
//           successMessage: 'Automatic check-in completed successfully.',
//         }
//       }));
      
//       setBookingOperationState(prev => ({
//         ...prev,
//         checkin: true,
//         checkout: false
//       }));
      
//       console.log(`Automatic check-in completed for booking ${activeBooking.id}`);
//       return activeBooking.id;
//     } catch (error) {
//       console.error("Error during automatic check-in:", error);
//       return null;
//     }
//   }, [allBookings, occupiedSlots]);
  
//   const handleAutomaticCheckout = useCallback(async () => {
//     try {
//       console.log("Starting automatic check-out process");
      
//       if (allBookings.length === 0) {
//         console.log("No bookings available yet - waiting for data to load");
//         return null;
//       }
      
//       const activeBooking = allBookings.find(booking => 
//         (booking.status === 'active' || booking.status === 'confirmed') && 
//         booking.checkedIn && 
//         !booking.checkedOut
//       );
      
//       if (!activeBooking) {
//         console.log("No eligible bookings found for automatic check-out");
//         return null;
//       }
      
//       console.log(`Found eligible booking for check-out: ${activeBooking.id}`);
      
//       const vehicleNumber = "AUTO-CHECK-OUT";
      
//       await updateBookingWithCheckoutData(
//         activeBooking.id,
//         vehicleNumber,
//         null,
//         1
//       );
      
//       setVerificationResults(prev => ({
//         ...prev,
//         [activeBooking.id]: {
//           isMatch: true,
//           matchValue: 1,
//           message: 'Vehicle automatically verified by system!',
//           checkoutVehicleNumber: vehicleNumber,
//           checkoutImageData: null
//         }
//       }));
      
//       setBookingStates(prev => ({
//         ...prev,
//         [activeBooking.id]: {
//           ...prev[activeBooking.id],
//           checkoutVehicleNumber: vehicleNumber,
//           successMessage: 'Automatic check-out completed successfully.',
//         }
//       }));
      
//       setBookingOperationState(prev => ({
//         ...prev,
//         checkout: true
//       }));
      
//       console.log(`Automatic check-out completed for booking ${activeBooking.id}`);
//       return activeBooking.id;
//     } catch (error) {
//       console.error("Error during automatic check-out:", error);
//       return null;
//     }
//   }, [allBookings]);

//   // Event Handlers
//   const handleZoneClick = (zoneId) => {
//     const zoneBookings = allBookings.filter(booking => {
//       if (zoneId === 1 && booking.vehicleType === 2) return true;
//       if (zoneId === 2 && booking.vehicleType === 3) return true;
//       if (zoneId === 3 && booking.vehicleType === 4) return true;
//       return false;
//     });
    
//     if (occupiedSlots.includes(zoneId) && connectionStatus > 0) {
//       const activeBooking = zoneBookings.find(booking => 
//         booking.status === 'active' || booking.status === 'confirmed'
//       );
      
//       if (activeBooking) {
//         const activity = correctedActivity.find(a => 
//           a.action && a.action.includes(`Space #${activeBooking.spaceId}`)
//         );
        
//         if (activity) {
//           handleActivityClick(activity);
//         }
//       }
//     }
//   };

//   const handleActivityClick = (activity) => {
//     if (expandedActivity === activity.id) {
//       setExpandedActivity(null);
//       setUserBookings([]);
//       setActivityError(null);
//       setBookingStates({});
//       return;
//     }

//     setExpandedActivity(activity.id);
//     setActivityError(null);
//     setBookingStates({});
    
//     try {
//       if (loadingBookings) {
//         setActivityError("Still loading booking data. Please wait...");
//         return;
//       }

//       if (allBookings.length === 0) {
//         setActivityError("No booking data available.");
//         return;
//       }

//       const { location, spaceId, dateTime } = extractBookingInfo(activity.action);
//       const userObj = users.find(user => user.name === activity.user);
//       const userId = userObj ? userObj.id : null;
      
//       let filteredBookings = [];
      
//       if (userId && spaceId) {
//         filteredBookings = allBookings.filter(booking => 
//           booking.userId === userId && 
//           String(booking.spaceId) === String(spaceId)
//         );
//       }
      
//       if (filteredBookings.length === 0 && (spaceId || location)) {
//         filteredBookings = allBookings.filter(booking => {
//           const spaceMatch = spaceId ? String(booking.spaceId) === String(spaceId) : false;
//           const locationMatch = location && booking.parkingLotName ? 
//             booking.parkingLotName.includes(location) : false;
          
//           return spaceMatch || locationMatch;
//         });
//       }
      
//       if (filteredBookings.length === 0 && userId) {
//         filteredBookings = allBookings.filter(booking => booking.userId === userId);
//       }
      
//       if (filteredBookings.length === 0) {
//         const firstName = activity.user.split(' ')[0];
        
//         filteredBookings = allBookings.filter(booking => {
//           const bookingValues = Object.values(booking).map(val => 
//             typeof val === 'string' ? val.toLowerCase() : ''
//           );
          
//           const hasUserName = bookingValues.some(val => 
//             val.includes(firstName.toLowerCase())
//           );
          
//           let timeMatch = false;
//           if (dateTime) {
//             const activityTime = new Date(dateTime);
//             const bookingTime = booking.bookingTime;
//             if (bookingTime) {
//               timeMatch = Math.abs(bookingTime - activityTime) < 1000 * 60 * 60;
//             }
//           }
          
//           return hasUserName || timeMatch;
//         });
//       }
      
//       setUserBookings(filteredBookings);
      
//       if (filteredBookings.length === 0) {
//         setActivityError(`No bookings found related to this activity for ${activity.user}.`);
//       }
//     } catch (error) {
//       console.error("Error processing activity:", error);
//       setActivityError('Failed to process user activity data: ' + error.message);
//     }
//   };

//   // Image Capture Functions
//   const captureCheckinImage = (bookingId) => {
//     const video = videoRefs.current[bookingId];
//     const canvas = canvasRefs.current[bookingId];
    
//     if (!video || !canvas) {
//       console.error('Video or canvas reference not found.');
//       return;
//     }
    
//     const context = canvas.getContext('2d');
    
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
//     const imageDataUrl = canvas.toDataURL('image/jpeg');
    
//     const stream = video.srcObject;
//     if (stream) {
//       const tracks = stream.getTracks();
//       tracks.forEach(track => track.stop());
//       video.srcObject = null;
//     }
    
//     const stateCode = ['KA', 'MH', 'TN', 'AP', 'DL'][Math.floor(Math.random() * 5)];
//     const regionCode = `${Math.floor(1 + Math.random() * 99)}`.padStart(2, '0');
//     const letterCode = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + 
//                       String.fromCharCode(65 + Math.floor(Math.random() * 26));
//     const numberCode = `${Math.floor(1000 + Math.random() * 9000)}`;
    
//     const simulatedVehicleNumber = `${stateCode}-${regionCode}-${letterCode}-${numberCode}`;
    
//     setBookingStates(prev => ({
//       ...prev,
//       [bookingId]: {
//         ...prev[bookingId],
//         webcamActive: true,
//         webcamMode: 'zonepicker',
//         checkinVehicleNumber: simulatedVehicleNumber,
//         checkinImageData: imageDataUrl,
//         successMessage: null,
//       }
//     }));
//   };

//   const selectZone = (bookingId, zoneType) => {
//     let vehicleType;
//     let slotNumber;
    
//     switch (zoneType) {
//       case 'A':
//         vehicleType = 2;
//         slotNumber = 1;
//         break;
//       case 'B':
//         vehicleType = 3;
//         slotNumber = 2;
//         break;
//       case 'C':
//         vehicleType = 4;
//         slotNumber = 3;
//         break;
//       default:
//         vehicleType = null;
//         slotNumber = null;
//     }
    
//     setBookingStates(prev => ({
//       ...prev,
//       [bookingId]: {
//         ...prev[bookingId],
//         webcamActive: false,
//         webcamMode: null,
//         vehicleType: vehicleType,
//         zoneSelected: true,
//         successMessage: 'Check-in successful! Vehicle number plate captured.',
//       }
//     }));
    
//     updateBookingWithCheckinData(
//       bookingId, 
//       bookingStates[bookingId].checkinVehicleNumber, 
//       bookingStates[bookingId].checkinImageData, 
//       vehicleType,
//       slotNumber
//     );
//   };

//   // Payment Functions
//   const handlePaymentMethod = async (bookingId, method) => {
//     setBookingStates(prev => ({
//       ...prev,
//       [bookingId]: {
//         ...prev[bookingId],
//         paymentMethod: method,
//         successMessage: null,
//       }
//     }));

//     if (method === 'cash') {
//       processCashPayment(bookingId);
//     } else if (method === 'razorpay') {
//       await initiateRazorpayPayment(bookingId);
//     }
//   };

//   const processCashPayment = async (bookingId) => {
//     setPaymentProcessing(prev => ({ ...prev, [bookingId]: true }));
//     try {
//       const bookingRef = ref(rtdb, `bookings/${bookingId}`);
//       await update(bookingRef, { 
//         status: 'completed',
//         paymentMethod: 'cash',
//         endTime: new Date().toISOString(),
//         paidAt: new Date().toISOString()
//       });
      
//       setUserBookings(prevBookings =>
//         prevBookings.map(booking =>
//           booking.id === bookingId
//             ? { 
//                 ...booking, 
//                 status: 'completed', 
//                 paymentMethod: 'cash', 
//                 endTime: new Date(),
//                 paidAt: new Date()
//               }
//             : booking
//         )
//       );
      
//       setAllBookings(prevBookings =>
//         prevBookings.map(booking =>
//           booking.id === bookingId
//             ? { 
//                 ...booking, 
//                 status: 'completed', 
//                 paymentMethod: 'cash', 
//                 endTime: new Date(),
//                 paidAt: new Date()
//               }
//             : booking
//         )
//       );
      
//       setBookingStates(prev => ({
//         ...prev,
//         [bookingId]: {
//           ...prev[bookingId],
//           webcamActive: false,
//           webcamMode: null,
//           successMessage: 'Payment successful!',
//         }
//       }));
//     } catch (error) {
//       console.error("Error updating booking status for cash payment:", error);
//       setActivityError('Failed to process cash payment. Please try again.');
      
//       setBookingStates(prev => ({
//         ...prev,
//         [bookingId]: {
//           ...prev[bookingId],
//           paymentMethod: null,
//         }
//       }));
//     } finally {
//       setPaymentProcessing(prev => ({ ...prev, [bookingId]: false }));
//     }
//   };

//   const loadRazorpayScript = () => {
//     return new Promise((resolve) => {
//       if (window.Razorpay) {
//         resolve(true);
//         return;
//       }
      
//       const script = document.createElement('script');
//       script.src = 'https://checkout.razorpay.com/v1/checkout.js';
//       script.async = true;
      
//       script.onload = () => {
//         console.log("Razorpay SDK loaded successfully");
//         resolve(true);
//       };
      
//       script.onerror = () => {
//         console.error("Failed to load Razorpay SDK");
//         resolve(false);
//       };
      
//       document.body.appendChild(script);
//     });
//   };

//   const initiateRazorpayPayment = async (bookingId) => {
//     setPaymentProcessing(prev => ({ ...prev, [bookingId]: true }));
//     try {
//       const razorpayLoaded = await loadRazorpayScript();
//       if (!razorpayLoaded) {
//         setActivityError('Razorpay SDK failed to load. Please check your internet connection.');
//         setPaymentProcessing(prev => ({ ...prev, [bookingId]: false }));
//         setBookingStates(prev => ({
//           ...prev,
//           [bookingId]: {
//             ...prev[bookingId],
//             paymentMethod: null,
//           }
//         }));
//         return;
//       }

//       const booking = userBookings.find(b => b.id === bookingId);
//       if (!booking) {
//         setActivityError('Booking not found. Please try again.');
//         setPaymentProcessing(prev => ({ ...prev, [bookingId]: false }));
//         return;
//       }

//       const user = users.find(user => user.id === booking.userId) || {};
      
//       let durationText = 'Parking';
//       if (booking.startTime && booking.endTime) {
//         const durationMs = booking.endTime - booking.startTime;
//         const diffHrs = Math.floor(durationMs / (1000 * 60 * 60));
//         const diffMins = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
//         durationText = `${diffHrs}h ${diffMins}m Parking`;
//       }

//       const orderIdPrefix = 'ord';
//       const randomId = Math.random().toString(36).substring(2, 10);
//       const orderId = `${orderIdPrefix}_${Date.now()}_${randomId}`;

//       const amount = booking.amount || 80;

//       const options = {
//         key: RAZORPAY_KEY_ID,
//         amount: amount * 100,
//         currency: 'INR',
//         name: 'Smart Parking',
//         description: `Payment for ${durationText} at ${booking.parkingLotName || 'Parking Lot'}`,
//         order_id: orderId,
//         handler: function(response) {
//           console.log("Payment successful", response);
//           handleRazorpaySuccess(bookingId, response);
//         },
//         prefill: {
//           name: user.name || 'Customer',
//           email: user.email || '',
//           contact: user.phone || '',
//         },
//         notes: {
//           bookingId: booking.id,
//           parkingLotName: booking.parkingLotName,
//           spaceId: booking.spaceId,
//           startTime: booking.startTime ? booking.startTime.toISOString() : '',
//         },
//         theme: {
//           color: '#3b82f6',
//         },
//         modal: {
//           ondismiss: function() {
//             console.log('Payment dismissed');
//             setPaymentProcessing(prev => ({ ...prev, [bookingId]: false }));
//             setBookingStates(prev => ({
//               ...prev,
//               [bookingId]: {
//                 ...prev[bookingId],
//                 paymentMethod: null,
//               }
//             }));
//           }
//         }
//       };

//       const razorpay = new window.Razorpay(options);
      
//       razorpay.on('payment.failed', function(response) {
//         console.error('Payment failed', response.error);
//         handleRazorpayFailure(bookingId, response.error);
//       });
      
//       razorpay.open();
//     } catch (error) {
//       console.error("Error initiating Razorpay payment:", error);
//       setActivityError(`Failed to initiate payment: ${error.message}`);
//       setPaymentProcessing(prev => ({ ...prev, [bookingId]: false }));
//       setBookingStates(prev => ({
//         ...prev,
//         [bookingId]: {
//           ...prev[bookingId],
//           paymentMethod: null,
//         }
//       }));
//     }
//   };

//   const handleRazorpaySuccess = async (bookingId, paymentResponse) => {
//     console.log("Processing successful payment", bookingId, paymentResponse);
//     try {
//       const bookingRef = ref(rtdb, `bookings/${bookingId}`);
//       await update(bookingRef, { 
//         status: 'completed',
//         paymentMethod: 'razorpay',
//         paymentId: paymentResponse.razorpay_payment_id,
//         orderId: paymentResponse.razorpay_order_id,
//         paymentSignature: paymentResponse.razorpay_signature,
//         endTime: new Date().toISOString(),
//         paidAt: new Date().toISOString()
//       });

//       setUserBookings(prevBookings =>
//         prevBookings.map(booking =>
//           booking.id === bookingId
//             ? { 
//                 ...booking, 
//                 status: 'completed', 
//                 paymentMethod: 'razorpay',
//                 paymentId: paymentResponse.razorpay_payment_id,
//                 endTime: new Date(),
//                 paidAt: new Date()
//               }
//             : booking
//         )
//       );
      
//       setAllBookings(prevBookings =>
//         prevBookings.map(booking =>
//           booking.id === bookingId
//             ? { 
//                 ...booking, 
//                 status: 'completed', 
//                 paymentMethod: 'razorpay',
//                 paymentId: paymentResponse.razorpay_payment_id,
//                 endTime: new Date(),
//                 paidAt: new Date()
//               }
//             : booking
//         )
//       );
      
//       setBookingStates(prev => ({
//         ...prev,
//         [bookingId]: {
//           ...prev[bookingId],
//           webcamActive: false,
//           webcamMode: null,
//           paymentMethod: null,
//           successMessage: 'Payment successful!',
//         }
//       }));
//     } catch (error) {
//       console.error("Error updating booking after payment:", error);
//       setActivityError('Payment was successful, but we had trouble updating your booking. Please contact support.');
//     } finally {
//       setPaymentProcessing(prev => ({ ...prev, [bookingId]: false }));
//     }
//   };

//   const handleRazorpayFailure = (bookingId, error) => {
//     console.error("Payment failed", error);
    
//     setActivityError(`Payment failed: ${error.description || 'Unknown error occurred'}`);
//     setPaymentProcessing(prev => ({ ...prev, [bookingId]: false }));
    
//     setBookingStates(prev => ({
//       ...prev,
//       [bookingId]: {
//         ...prev[bookingId],
//         paymentMethod: null,
//       }
//     }));
//   };

//   // Updated Effects with improved Firebase status handling
//   useEffect(() => {
//     const connectionRef = ref(rtdb, 'connection_status');
//     const connectionUnsubscribe = onValue(connectionRef, (snapshot) => {
//       if (snapshot.exists()) {
//         const status = snapshot.val();
//         setConnectionStatus(parseInt(status));
//       }
//     });

//     const statusRef = ref(rtdb, 'Car_Parking/Status/status');
//     const statusUnsubscribe = onValue(statusRef, (snapshot) => {
//       if (snapshot.exists()) {
//         try {
//           const currentStatus = parseInt(snapshot.val());
//           console.log(`Status value: ${currentStatus} (Previous: ${previousStatus})`);
          
//           if (currentStatus === 1) {
//             console.log("Status is 1 - checking if action needed");
            
//             if (!hasCheckedInOnce) {
//               console.log("No check-in recorded yet - performing automatic check-in");
              
//               // Perform check-in and save the booking ID
//               handleAutomaticCheckin().then(bookingId => {
//                 setHasCheckedInOnce(true);
//                 setStatusMessage('Check-in completed successfully!');
                
//                 setBookingOperationState(prev => ({
//                   ...prev,
//                   checkin: true,
//                   checkout: false
//                 }));
                
//                 // Automatically reset status to 0 after 3 seconds
//                 autoResetFirebaseStatus();
//               });
//             } 
//             else {
//               // Check if there's an active booking that's checked in but not checked out
//               const activeBookingForCheckout = allBookings.find(booking => 
//                 (booking.status === 'active' || booking.status === 'confirmed') && 
//                 booking.checkedIn && 
//                 !booking.checkedOut
//               );
              
//               if (activeBookingForCheckout) {
//                 console.log("Found active booking that needs checkout - performing automatic check-out");
                
//                 // Perform checkout and save the booking ID
//                 handleAutomaticCheckout().then(bookingId => {
//                   if (bookingId) {
//                     setStatusMessage('Check-out completed successfully!');
                    
//                     setBookingOperationState(prev => ({
//                       ...prev,
//                       checkout: true
//                     }));
                    
//                     // Automatically reset status to 0 after 3 seconds
//                     autoResetFirebaseStatus();
//                   }
//                 });
//               } else {
//                 console.log("No eligible bookings found for checkout");
//               }
//             }
//           }
          
//           setPreviousStatus(currentStatus);
//         } catch (error) {
//           console.error("Error processing status change:", error);
//         }
//       }
//     });

//     const slotsRef = ref(rtdb, 'occupied_slots');
//     const slotsUnsubscribe = onValue(slotsRef, (snapshot) => {
//       if (snapshot.exists()) {
//         try {
//           const slotsData = snapshot.val();
//           const occupiedSlotsList = Array.isArray(slotsData) ? 
//             slotsData : 
//             typeof slotsData === 'string' ? 
//               JSON.parse(slotsData) : 
//               [];
          
//           setOccupiedSlots(occupiedSlotsList);
          
//           setZones(prevZones => 
//             prevZones.map(zone => ({
//               ...zone,
//               occupied: occupiedSlotsList.includes(zone.id)
//             }))
//           );
//         } catch (error) {
//           console.error("Error parsing occupied slots:", error);
//         }
//       } else {
//         set(slotsRef, JSON.stringify([]));
//         setOccupiedSlots([]);
//       }
//     });

//     const slotRef = ref(rtdb, 'slot');
//     const slotUnsubscribe = onValue(slotRef, (snapshot) => {
//       if (snapshot.exists()) {
//         try {
//           const slotValue = snapshot.val();
//           const slotNumber = parseInt(slotValue.replace(/"/g, ''));
          
//           if (!isNaN(slotNumber)) {
//             if (!occupiedSlots.includes(slotNumber)) {
//               const updatedSlots = [...occupiedSlots, slotNumber];
//               const slotsRef = ref(rtdb, 'occupied_slots');
//               set(slotsRef, JSON.stringify(updatedSlots));
//             }
//           }
//         } catch (error) {
//           console.error("Error handling legacy slot:", error);
//         }
//       }
//     });

//     // Cleanup function
//     return () => {
//       connectionUnsubscribe();
//       statusUnsubscribe();
//       slotsUnsubscribe();
//       slotUnsubscribe();
      
//       if (autoStatusResetTimer) {
//         clearTimeout(autoStatusResetTimer);
//       }
//     };
//   }, [occupiedSlots, previousStatus, hasCheckedInOnce, allBookings, handleAutomaticCheckin, handleAutomaticCheckout, autoResetFirebaseStatus, autoStatusResetTimer]);

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const usersCollection = collection(db, 'users');
//         const usersSnapshot = await getDocs(usersCollection);
//         const usersList = usersSnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data()
//         }));
//         setUsers(usersList);
//       } catch (error) {
//         console.error("Error fetching users:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUsers();
//   }, []);

//   useEffect(() => {
//     if (recentActivity.length > 0 && users.length > 0) {
//       const processedActivity = recentActivity.map(activity => {
//         if (activity.userId) {
//           const user = users.find(u => u.id === activity.userId);
//           if (user) {
//             return {
//               ...activity,
//               user: user.name
//             };
//           }
//         }
//         return activity;
//       });
      
//       setCorrectedActivity(processedActivity);
//     } else {
//       setCorrectedActivity(recentActivity);
//     }
//   }, [recentActivity, users]);

//   useEffect(() => {
//     const fetchAllBookings = () => {
//       setLoadingBookings(true);
//       try {
//         const bookingsRef = ref(rtdb, 'bookings');
        
//         const unsubscribe = onValue(bookingsRef, (snapshot) => {
//           const bookingsList = [];
//           if (snapshot.exists()) {
//             snapshot.forEach((childSnapshot) => {
//               const bookingData = childSnapshot.val();
//               bookingsList.push({
//                 id: childSnapshot.key,
//                 ...bookingData,
//                 bookingTime: bookingData.bookingTime
//                   ? new Date(bookingData.bookingTime)
//                   : null,
//                 startTime: bookingData.startTime
//                   ? new Date(bookingData.startTime)
//                   : null,
//                 endTime: bookingData.endTime
//                   ? new Date(bookingData.endTime)
//                   : null,
//               });
//             });

//             bookingsList.sort((a, b) => {
//               const timeA = a.bookingTime ? a.bookingTime.getTime() : 0;
//               const timeB = b.bookingTime ? b.bookingTime.getTime() : 0;
//               return timeB - timeA;
//             });
//           }

//           setAllBookings(bookingsList);
//           setLoadingBookings(false);
//         }, (err) => {
//           console.error("Error fetching all bookings:", err);
//           setError('Failed to load booking data. Please try again later.');
//           setLoadingBookings(false);
//         });

//         return () => unsubscribe();
//       } catch (err) {
//         console.error("Error setting up bookings listener:", err);
//         setError('Failed to load booking data. Please try again later.');
//         setLoadingBookings(false);
//       }
//     };

//     fetchAllBookings();
//   }, []);

//   return (
//     <div className="users-list-container">
//       <div className="users-list-header">
//         <button className="back-button" onClick={onBack}>
//           <ArrowLeft size={18} />
//           Back to Dashboard
//         </button>
//         <h1>
//           <Users size={24} style={{ marginRight: '8px' }} />
//           Parking Lists
//         </h1>
//       </div>

//       {loading || loadingBookings ? (
//         <div className="loading-container">
//           <div className="loading-spinner"></div>
//           <p>Loading data...</p>
//         </div>
//       ) : (
//         <>
//           {/* Zone Dashboard Section */}
//           <div className="dashboard-card">
//             <div className="card-header">
//               <h2 className="card-title">Parking Zones</h2>
//               <div className="connection-status">
//                 <span>Active Vehicles: {connectionStatus}</span>
//               </div>
//             </div>
            
//             {statusMessage && (
//               <div className={`status-message-container ${bookingOperationState.checkout ? 'checkout-message' : ''}`}>
//                 <div className="status-message">
//                   <CheckCircle size={18} />
//                   {statusMessage}
//                 </div>
//               </div>
//             )}
            
//             <div className="zones-container">
//               {zones.map(zone => (
//                 <div 
//                   key={zone.id}
//                   className={`zone-card ${zone.occupied ? 'zone-occupied' : 'zone-available'}`}
//                   onClick={() => handleZoneClick(zone.id)}
//                 >
//                   <div className="zone-icon">
//                     {renderZoneIcon(zone.id)}
//                   </div>
//                   <div className="zone-info">
//                     <h3>Slot {zone.id}</h3>
//                     <p>{zone.name} ({zone.type})</p>
//                     <div className="zone-status">
//                       <span className="zone-vehicles">
//                         {zone.occupied ? '1 Vehicle' : '0 Vehicles'}
//                       </span>
//                       <span className={`zone-indicator ${zone.occupied ? 'status-occupied' : 'status-available'}`}>
//                         {zone.occupied ? 'Occupied' : 'Available'}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="users-table-container">
//             {users.length > 0 ? (
//               <table className="users-table">
//                 <thead>
//                   <tr>
//                     <th>Name</th>
//                     <th>Email</th>
//                     <th>Role</th>
//                     <th>Joined</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {users.map((user) => (
//                     <tr key={user.id}>
//                       <td>
//                         <div className="user-avatar">
//                           {user.name ? user.name.charAt(0) : 'U'}
//                         </div>
//                         {user.name || 'Unknown User'}
//                       </td>
//                       <td>{user.email || 'N/A'}</td>
//                       <td>
//                         <span className={`role-badge ${user.role}`}>
//                           {user.role || 'N/A'}
//                         </span>
//                       </td>
//                       <td>
//                         {user.createdAt
//                           ? new Date(user.createdAt.seconds * 1000).toLocaleDateString('en-US', {
//                               year: 'numeric',
//                               month: 'short',
//                               day: 'numeric'
//                             })
//                           : 'N/A'}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             ) : users.length === 0 && correctedActivity.length === 0 ? (
//               <div className="no-users">
//                 <p>No users found.</p>
//               </div>
//             ) : null}
//           </div>

//           {error && <div className="error-message">{error}</div>}

//           <div className="dashboard-card" style={{ marginTop: '20px' }}>
//             <div className="card-header">
//               <h2 className="card-title">Recent Activity</h2>
//               <div className="view-all">View All</div>
//             </div>
            
//             <div className="activity-list">
//               {correctedActivity.length > 0 ? (
//                 correctedActivity.map((activity) => (
//                   <div key={activity.id}>
//                     <div
//                       className="activity-item activity-card"
//                       onClick={() => handleActivityClick(activity)}
//                     >
//                       <div className="activity-avatar">
//                         {activity.user.charAt(0)}
//                       </div>
//                       <div className="activity-details">
//                         <p className="activity-text">
//                           <span className="activity-user">{activity.user}</span> {activity.action}
//                         </p>
//                         <p className="activity-time">{activity.time}</p>
//                       </div>
//                       <ChevronRight
//                         size={20}
//                         className={`expand-icon ${expandedActivity === activity.id ? 'rotated' : ''}`}
//                       />
//                     </div>

//                     {expandedActivity === activity.id && (
//                       <div className="activity-details-expanded">
//                         <h3>{activity.user}'s Parking History</h3>
//                         {activityError && (
//                           <div className="error-message">{activityError}</div>
//                         )}

//                         {userBookings.length === 0 ? (
//                           <div className="no-bookings">
//                             <Activity size={48} />
//                             <h4>No bookings found</h4>
//                             <p>No booking history available for this user.</p>
//                           </div>
//                         ) : (
//                           <div className="bookings-list">
//                             {userBookings.map((booking) => {
//                               const displayStatus = determineBookingStatus(booking);
//                               const bookingState = bookingStates[booking.id] || {};
//                               const verificationResult = verificationResults[booking.id];
//                               const isProcessingPayment = paymentProcessing[booking.id];
                              
//                               const hasCheckedIn = booking.checkedIn || 
//                                 booking.checkinVehicleNumber || 
//                                 (bookingState && bookingState.zoneSelected);
                              
//                               const hasCheckedOut = booking.checkedOut || 
//                                 booking.checkoutVehicleNumber || 
//                                 (verificationResult && verificationResult.checkoutVehicleNumber);

//                               // For highlighting the last processed booking
//                               const isLastProcessed = booking.id === lastProcessedBookingId;

//                               return (
//                                 <div key={booking.id} className={`booking-card ${isLastProcessed ? 'last-processed' : ''}`}>
//                                   <div className="booking-card-header">
//                                     <div className="booking-basic-info">
//                                       <h4>{booking.parkingLotName || 'Parking Lot'}</h4>
//                                       <div className="booking-meta">
//                                         <span className="booking-id">ID: {booking.bookingId || booking.id || 'N/A'}</span>
//                                         <span className={`booking-status ${getStatusClass(displayStatus)}`}>
//                                           {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
//                                         </span>
//                                       </div>
//                                     </div>
//                                   </div>

//                                   <div className="booking-details">
//                                     <div className="detail-section">
//                                       <h5>Location</h5>
//                                       <div className="detail-item">
//                                         <MapPin size={16} />
//                                         <span>{booking.location || booking.parkingLotLocation || 'Location not available'}</span>
//                                       </div>
//                                     </div>

//                                     <div className="detail-section">
//                                       <h5>Timing Details</h5>
//                                       <div className="detail-item">
//                                         <Clock size={16} />
//                                         <div className="time-details">
//                                           <div className="time-range">
//                                             <span>Start: {formatDateTime(booking.startTime)}</span>
//                                             <span>End: {formatDateTime(booking.endTime)}</span>
//                                           </div>
//                                           <div className="duration">
//                                             Duration: {getTimeDifference(booking.startTime, booking.endTime)}
//                                           </div>
//                                         </div>
//                                       </div>
//                                     </div>

//                                     <div className="detail-section payment-details">
//                                       <div className="payment-info">
//                                         <h5>Payment Details</h5>
//                                         <div className="payment-amount">₹{booking.amount || booking.paymentAmount || '80'}</div>
//                                       </div>
//                                       <div className="payment-method">
//                                         {booking.paymentMethod ? 
//                                           `${booking.paymentMethod.charAt(0).toUpperCase() + booking.paymentMethod.slice(1)} Payment` : 
//                                           (booking.status === 'completed' ? 'Payment Completed' : 'Payment Pending')
//                                         }
//                                         {booking.paymentId && (
//                                           <div className="payment-id">
//                                             Transaction ID: {booking.paymentId.substring(0, 10)}...
//                                           </div>
//                                         )}
//                                       </div>
//                                     </div>

//                                     <div className="detail-section">
//                                       <h5>Parking Space</h5>
//                                       <div className="space-info">
//                                         <div className="space-number">Space #{booking.spaceId || 'N/A'}</div>
                                        
//                                         {(booking.vehicleType || (bookingState && bookingState.vehicleType)) && (
//                                           <div className="vehicle-type">
//                                             {getVehicleTypeIcon(booking.vehicleType || bookingState.vehicleType)}
//                                             <span>Type: {getVehicleTypeLabel(booking.vehicleType || bookingState.vehicleType)}</span>
//                                           </div>
//                                         )}
                                        
//                                         {(booking.checkinVehicleNumber || (bookingState && bookingState.checkinVehicleNumber)) && (
//                                           <div className="vehicle-info">
//                                             Check-in Vehicle: {booking.checkinVehicleNumber || bookingState.checkinVehicleNumber}
//                                           </div>
//                                         )}
                                        
//                                         {(booking.checkoutVehicleNumber || 
//                                           (bookingState && bookingState.checkoutVehicleNumber) ||
//                                           (verificationResult && verificationResult.checkoutVehicleNumber)) && (
//                                           <div className="vehicle-info">
//                                             Checkout Vehicle: {booking.checkoutVehicleNumber || 
//                                               bookingState.checkoutVehicleNumber || 
//                                               (verificationResult && verificationResult.checkoutVehicleNumber)}
//                                           </div>
//                                         )}
//                                       </div>
//                                     </div>

//                                     {(booking.checkinImageData || (bookingState && bookingState.checkinImageData)) && (
//                                       <div className="image-preview-section">
//                                         <h5>Check-in Image</h5>
//                                         <div className="image-preview">
//                                           <img 
//                                             src={booking.checkinImageData || bookingState.checkinImageData} 
//                                             alt="Check-in Vehicle" 
//                                             className="captured-image"
//                                           />
//                                         </div>
//                                       </div>
//                                     )}

//                                     {(booking.checkoutImageData || 
//                                       (bookingState && bookingState.checkoutImageData) ||
//                                       (verificationResult && verificationResult.checkoutImageData)) && (
//                                       <div className="image-preview-section">
//                                         <h5>Checkout Image</h5>
//                                         <div className="image-preview">
//                                           <img 
//                                             src={booking.checkoutImageData || 
//                                               bookingState.checkoutImageData || 
//                                               (verificationResult && verificationResult.checkoutImageData)} 
//                                             alt="Checkout Vehicle" 
//                                             className="captured-image"
//                                           />
//                                         </div>
//                                       </div>
//                                     )}

//                                     {verificationResult && (
//                                       <div className={`verification-result ${verificationResult.isMatch ? 'verification-success' : 'verification-error'}`}>
//                                         {verificationResult.isMatch ? (
//                                           <div className="verification-success-content">
//                                             <CheckCircle size={24} />
//                                             <span>{verificationResult.message}</span>
//                                           </div>
//                                         ) : (
//                                           <div className="verification-error-content">
//                                             <AlertTriangle size={24} />
//                                             <span>{verificationResult.message}</span>
//                                           </div>
//                                         )}
//                                       </div>
//                                     )}

//                                     {bookingState.webcamMode === 'zonepicker' && (
//                                       <div className="zone-selection">
//                                         <h5>Select Vehicle Zone</h5>
//                                         {bookingState.checkinImageData && (
//                                           <div className="vehicle-image-container">
//                                             <img 
//                                               src={bookingState.checkinImageData} 
//                                               alt="Vehicle" 
//                                               className="vehicle-image"
//                                             />
//                                           </div>
//                                         )}
//                                         <div className="zone-buttons">
//                                           <button 
//                                             className="zone-button zone-a"
//                                             onClick={() => selectZone(booking.id, 'A')}
//                                           >
//                                             <Bike size={20} />
//                                             <span>Zone A (Car)</span>
//                                           </button>
//                                           <button 
//                                             className="zone-button zone-b"
//                                             onClick={() => selectZone(booking.id, 'B')}
//                                           >
//                                             <Truck size={20} />
//                                             <span>Zone B (Car)</span>
//                                           </button>
//                                           <button 
//                                             className="zone-button zone-c"
//                                             onClick={() => selectZone(booking.id, 'C')}
//                                           >
//                                             <Car size={20} />
//                                             <span>Zone C (Car)</span>
//                                           </button>
//                                         </div>
//                                       </div>
//                                     )}

//                                     {bookingState.successMessage && !verificationResult && (
//                                       <div className="success-message-card">
//                                         {bookingState.successMessage}
//                                       </div>
//                                     )}

//                                     {bookingState.checkinError && (
//                                       <div className="error-message">
//                                         {bookingState.checkinError}
//                                       </div>
//                                     )}

//                                     {bookingState.checkoutError && (
//                                       <div className="error-message">
//                                         {bookingState.checkoutError}
//                                       </div>
//                                     )}

//                                     <div className="status-indicators">
//                                       {hasCheckedIn && !hasCheckedOut && (
//                                         <div className="status-tag check-in-status">
//                                           <CheckCircle size={14} />
//                                           <span>Check-in Complete</span>
//                                         </div>
//                                       )}
                                      
//                                       {hasCheckedOut && (
//                                         <div className="status-tag check-out-status">
//                                           <CheckCircle size={14} />
//                                           <span>Check-out Complete</span>
//                                         </div>
//                                       )}
                                      
//                                       <div className="status-tag firebase-status">
//                                         <Activity size={14} />
//                                         <span>Firebase Status: {previousStatus}</span>
//                                       </div>
                                      
//                                       {previousStatus === 1 && (
//                                         <div className="status-tag firebase-triggered">
//                                           <CheckCircle size={14} />
//                                           <span>Firebase triggered (Status=1)</span>
//                                         </div>
//                                       )}
//                                     </div>
                                    
//                                     {displayStatus === 'active' && 
//                                      !hasCheckedIn && 
//                                      !bookingState.webcamActive && 
//                                      !isProcessingPayment && (
//                                       <button
//                                         className="checkin-btn"
//                                         onClick={() => {
//                                           const statusRef = ref(rtdb, 'Car_Parking/Status/status');
//                                           set(statusRef, 0)
//                                             .then(() => {
//                                               setTimeout(() => {
//                                                 set(statusRef, 1);
//                                                 console.log("Set status to 1 for check-in");
//                                               }, 1000);
//                                             });
//                                         }}
//                                       >
//                                         <CheckCircle size={16} />
//                                         Trigger Check-in
//                                       </button>
//                                     )}
                                    
//                                     {displayStatus === 'active' && 
//                                      hasCheckedIn && 
//                                      !hasCheckedOut && 
//                                      !bookingState.webcamActive && 
//                                      !isProcessingPayment && (
//                                       <button
//                                         className="checkout-btn"
//                                         onClick={() => {
//                                           const statusRef = ref(rtdb, 'Car_Parking/Status/status');
//                                           set(statusRef, 0)
//                                             .then(() => {
//                                               setTimeout(() => {
//                                                 set(statusRef, 1);
//                                                 console.log("Set status to 1 for check-out");
//                                               }, 1000);
//                                             });
//                                         }}
//                                       >
//                                         <CheckCircle size={16} />
//                                         Trigger Check-out
//                                       </button>
//                                     )}
//                                   </div>
//                                 </div>
//                               );
//                             })}
//                           </div>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 ))
//               ) : (
//                 <div className="no-activity">
//                   <p>No recent activity to display</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default UsersList;


import React, { useState, useEffect } from 'react';
import { rtdb } from '../firebase';
import { ref, onValue, get } from 'firebase/database';
import { Users, ArrowLeft, RefreshCw } from 'lucide-react';
import '../styles/UserDetails.css';

const UserDetails = ({ onBack }) => {
  // State declarations
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Reference to the users path in Realtime Database
      const usersRef = ref(rtdb, 'users');
      
      // Get the data once
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const usersData = [];
        snapshot.forEach((childSnapshot) => {
          usersData.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        setUsers(usersData);
      } else {
        setUsers([]);
        console.log("No users data available");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  // Initialize data on component mount
  useEffect(() => {
    fetchUsers();
    
    // Set up real-time listener for changes
    const usersRef = ref(rtdb, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const usersData = [];
        snapshot.forEach((childSnapshot) => {
          usersData.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        setUsers(usersData);
      } else {
        setUsers([]);
      }
      setLoading(false);
    }, (err) => {
      console.error("Error in users listener:", err);
      setError('Failed to load users. Please try again.');
      setLoading(false);
    });

    // Clean up listener on unmount
    return () => unsubscribe();
  }, []);

  return (
    <div className="users-list-container">
      <div className="users-list-header">
        <h1>
          <Users size={24} style={{ marginRight: '8px' }} />
          Users List
        </h1>
        
        <div className="header-actions">
          {/* <button className="back-button" onClick={onBack}>
            <ArrowLeft size={18} />
            Back to Dashboard
          </button> */}
          
          <button 
            className={`refresh-button ${refreshing ? 'refreshing' : ''}`} 
            onClick={handleRefresh}
            disabled={loading || refreshing}
          >
            <RefreshCw size={18} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {loading && !refreshing ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      ) : (
        <>
          {error && <div className="error-message">{error}</div>}
          
          <div className="users-table-container">
            {/* Table view (shows on desktop) */}
            {users.length > 0 ? (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-avatar">
                          {user.name ? user.name.charAt(0) : 'U'}
                        </div>
                        {user.name || 'Unknown User'}
                      </td>
                      <td>
                        <span className={`role-badge ${user.role || 'user'}`}>
                          {user.role || 'User'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
            
            {/* Card view (shows on mobile) */}
            {users.length > 0 ? (
              <div className="mobile-users-list">
                {users.map((user) => (
                  <div key={user.id} className="user-card">
                    <div className="user-card-header">
                      <div className="user-avatar">
                        {user.name ? user.name.charAt(0) : 'U'}
                      </div>
                      <span className="user-card-name">{user.name || 'Unknown User'}</span>
                    </div>
                    <div className="user-card-details">
                      <div>
                        <div className="user-card-label">Role</div>
                        <span className={`role-badge ${user.role || 'user'}`}>
                          {user.role || 'User'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-users">
                <p>No users found. Add some users to get started.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default UserDetails;

