


// import React, { useState, useEffect, useRef } from 'react';
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

// const UsersList = ({ onBack, recentActivity = [] }) => {
//   const [users, setUsers] = useState([]);
//   const [allBookings, setAllBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [expandedActivity, setExpandedActivity] = useState(null);
//   const [userBookings, setUserBookings] = useState([]);
//   const [activityError, setActivityError] = useState(null);
//   const [loadingBookings, setLoadingBookings] = useState(true);
//   const [bookingStates, setBookingStates] = useState({});
//   const videoRefs = useRef({});
//   const canvasRefs = useRef({});
//   const [paymentProcessing, setPaymentProcessing] = useState({});
  
//   // Add state for corrected activity data
//   const [correctedActivity, setCorrectedActivity] = useState([]);
  
//   // Add state for verification results
//   const [verificationResults, setVerificationResults] = useState({});

//   // Add state for firebase status values
//   const [connectionStatus, setConnectionStatus] = useState(0);
//   const [activeSlot, setActiveSlot] = useState(null);
//   const [zones, setZones] = useState([
//     { id: 1, name: 'Zone A', type: 'Car', occupied: false },
//     { id: 2, name: 'Zone B', type: 'Car', occupied: false },
//     { id: 3, name: 'Zone C', type: 'Car', occupied: false }
//   ]);

//   // Razorpay Test API Key (replace with your own from Razorpay Dashboard in Test Mode)
//   const RAZORPAY_KEY_ID = 'rzp_test_vg2WzWGNEHJpgj'; // This is a dummy test key for example purposes

//   // Listen for Firebase data changes
//   useEffect(() => {
//     // Listen for connection_status
//     const connectionRef = ref(rtdb, 'connection_status');
//     const connectionUnsubscribe = onValue(connectionRef, (snapshot) => {
//       if (snapshot.exists()) {
//         const status = snapshot.val();
//         setConnectionStatus(parseInt(status));
//       }
//     });

//     // Listen for slot
//     const slotRef = ref(rtdb, 'slot');
//     const slotUnsubscribe = onValue(slotRef, (snapshot) => {
//       if (snapshot.exists()) {
//         const slotValue = snapshot.val();
//         // Remove quotes and convert to number
//         const slotNumber = parseInt(slotValue.replace(/"/g, ''));
//         setActiveSlot(slotNumber);
        
//         // Update zones based on the active slot
//         setZones(prevZones => 
//           prevZones.map(zone => ({
//             ...zone,
//             occupied: zone.id === slotNumber
//           }))
//         );
//       }
//     });

//     return () => {
//       connectionUnsubscribe();
//       slotUnsubscribe();
//     };
//   }, []);

//   // Fetch all users from Firestore
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
//         // setError('Failed to load users. Please refresh the page.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUsers();
//   }, []);

//   // Process recent activity data to ensure correct user names
//   useEffect(() => {
//     if (recentActivity.length > 0 && users.length > 0) {
//       // Process activity data to ensure user names are correct
//       const processedActivity = recentActivity.map(activity => {
//         // If the activity has a userId, find the corresponding user
//         if (activity.userId) {
//           const user = users.find(u => u.id === activity.userId);
//           if (user) {
//             return {
//               ...activity,
//               user: user.name // Use the correct user name from users collection
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

//   // Fetch ALL bookings from the Realtime Database
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

//   // Handle zone click
//   const handleZoneClick = (zoneId) => {
//     // Find corresponding bookings for this zone
//     const zoneBookings = allBookings.filter(booking => {
//       if (zoneId === 1 && booking.vehicleType === 2) return true;  // Zone A - Bikes
//       if (zoneId === 2 && booking.vehicleType === 3) return true;  // Zone B - Autos
//       if (zoneId === 3 && booking.vehicleType === 4) return true;  // Zone C - Cars
//       return false;
//     });
    
//     // If this is the active slot, try to find active booking and show details
//     if (activeSlot === zoneId && connectionStatus > 0) {
//       const activeBooking = zoneBookings.find(booking => 
//         booking.status === 'active' || booking.status === 'confirmed'
//       );
      
//       if (activeBooking) {
//         // Try to find matching activity
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

//   // Function to start webcam for check-in
//   const startWebcamForCheckin = async (bookingId) => {
//     setBookingStates(prev => ({
//       ...prev,
//       [bookingId]: {
//         ...prev[bookingId],
//         webcamActive: true,
//         webcamMode: 'checkin',
//         webcamError: null,
//         checkinVehicleNumber: null,
//         successMessage: null,
//         zoneSelected: false,
//       }
//     }));

//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ 
//         video: { 
//           width: { ideal: 1280 },
//           height: { ideal: 720 },
//           facingMode: "environment" // Prefer back camera if available
//         } 
//       });
      
//       if (videoRefs.current[bookingId]) {
//         videoRefs.current[bookingId].srcObject = stream;
//         videoRefs.current[bookingId].onloadedmetadata = () => {
//           videoRefs.current[bookingId].play();
//         };
//       }
//     } catch (error) {
//       console.error("Error accessing webcam:", error);
//       setBookingStates(prev => ({
//         ...prev,
//         [bookingId]: {
//           ...prev[bookingId],
//           webcamActive: false,
//           webcamError: 'Failed to access camera. Please ensure camera permissions are granted.'
//         }
//       }));
//     }
//   };

//   // Function to start webcam for checkout
//   const startWebcamForCheckout = async (bookingId) => {
//     setBookingStates(prev => ({
//       ...prev,
//       [bookingId]: {
//         ...prev[bookingId],
//         webcamActive: true,
//         webcamMode: 'checkout',
//         webcamError: null,
//         checkoutVehicleNumber: null,
//         successMessage: null,
//       }
//     }));

//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ 
//         video: { 
//           width: { ideal: 1280 },
//           height: { ideal: 720 },
//           facingMode: "environment" // Prefer back camera if available
//         } 
//       });
      
//       if (videoRefs.current[bookingId]) {
//         videoRefs.current[bookingId].srcObject = stream;
//         videoRefs.current[bookingId].onloadedmetadata = () => {
//           videoRefs.current[bookingId].play();
//         };
//       }
//     } catch (error) {
//       console.error("Error accessing webcam:", error);
//       setBookingStates(prev => ({
//         ...prev,
//         [bookingId]: {
//           ...prev[bookingId],
//           webcamActive: false,
//           webcamError: 'Failed to access camera. Please ensure camera permissions are granted.'
//         }
//       }));
//     }
//   };

//   // Function to capture image for check-in
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
    
//     // Save the captured image data URL
//     const imageDataUrl = canvas.toDataURL('image/jpeg');
    
//     // Stop the webcam stream
//     const stream = video.srcObject;
//     if (stream) {
//       const tracks = stream.getTracks();
//       tracks.forEach(track => track.stop());
//       video.srcObject = null;
//     }
    
//     // In a real app, you would send the image to a backend OCR service
//     // For this example, we'll generate a random vehicle number
//     const stateCode = ['KA', 'MH', 'TN', 'AP', 'DL'][Math.floor(Math.random() * 5)];
//     const regionCode = `${Math.floor(1 + Math.random() * 99)}`.padStart(2, '0');
//     const letterCode = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + 
//                       String.fromCharCode(65 + Math.floor(Math.random() * 26));
//     const numberCode = `${Math.floor(1000 + Math.random() * 9000)}`;
    
//     const simulatedVehicleNumber = `${stateCode}-${regionCode}-${letterCode}-${numberCode}`;
    
//     // Update state
//     setBookingStates(prev => ({
//       ...prev,
//       [bookingId]: {
//         ...prev[bookingId],
//         webcamActive: true, // Keep webcam active for zone selection
//         webcamMode: 'zonepicker',
//         checkinVehicleNumber: simulatedVehicleNumber,
//         checkinImageData: imageDataUrl,
//         successMessage: null,
//       }
//     }));
//   };

//   // Function to select vehicle zone
//   const selectZone = (bookingId, zoneType) => {
//     let vehicleType;
//     let slotNumber;
    
//     switch (zoneType) {
//       case 'A':
//         vehicleType = 2; // Bike
//         slotNumber = 1;
//         break;
//       case 'B':
//         vehicleType = 3; // Auto
//         slotNumber = 2;
//         break;
//       case 'C':
//         vehicleType = 4; // Car
//         slotNumber = 3;
//         break;
//       default:
//         vehicleType = null;
//         slotNumber = null;
//     }
    
//     // Update state
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
    
//     // Update Firebase with check-in data and slot information
//     updateBookingWithCheckinData(
//       bookingId, 
//       bookingStates[bookingId].checkinVehicleNumber, 
//       bookingStates[bookingId].checkinImageData, 
//       vehicleType,
//       slotNumber
//     );
//   };

//   // Function to capture image for checkout
//   const captureCheckoutImage = (bookingId) => {
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
    
//     // Save the captured image data URL
//     const imageDataUrl = canvas.toDataURL('image/jpeg');
    
//     // Stop the webcam stream
//     const stream = video.srcObject;
//     if (stream) {
//       const tracks = stream.getTracks();
//       tracks.forEach(track => track.stop());
//       video.srcObject = null;
//     }
    
//     // In a real app, you would send the image to a backend OCR service
//     // For this example, we'll generate a random vehicle number
//     const stateCode = ['KA', 'MH', 'TN', 'AP', 'DL'][Math.floor(Math.random() * 5)];
//     const regionCode = `${Math.floor(1 + Math.random() * 99)}`.padStart(2, '0');
//     const letterCode = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + 
//                       String.fromCharCode(65 + Math.floor(Math.random() * 26));
//     const numberCode = `${Math.floor(1000 + Math.random() * 9000)}`;
    
//     const simulatedVehicleNumber = `${stateCode}-${regionCode}-${letterCode}-${numberCode}`;
    
//     // Get the booking to access check-in vehicle number
//     const booking = userBookings.find(b => b.id === bookingId);
//     const checkinVehicleNumber = booking.checkinVehicleNumber || 
//       (bookingStates[bookingId] && bookingStates[bookingId].checkinVehicleNumber);
    
//     // For demo purposes, let's determine match with a random result (50% chance of match)
//     // In a real application, this would be an actual comparison using computer vision
//     const isMatch = Math.random() > 0.5;
//     const matchValue = isMatch ? 1 : 0;
    
//     // Set verification result
//     setVerificationResults({
//       ...verificationResults,
//       [bookingId]: {
//         isMatch,
//         matchValue,
//         message: isMatch 
//           ? 'Vehicle number plate verified successfully!' 
//           : 'Vehicle number plate does not match check-in record!',
//         checkoutVehicleNumber: simulatedVehicleNumber,
//         checkoutImageData: imageDataUrl
//       }
//     });
    
//     // Update state
//     setBookingStates(prev => ({
//       ...prev,
//       [bookingId]: {
//         ...prev[bookingId],
//         webcamActive: false,
//         webcamMode: null,
//         checkoutVehicleNumber: simulatedVehicleNumber,
//         checkoutImageData: imageDataUrl,
//         successMessage: null, // We'll use verification results instead
//       }
//     }));
    
//     // Update Firebase with verification result
//     updateBookingWithCheckoutData(
//       bookingId, 
//       simulatedVehicleNumber, 
//       imageDataUrl, 
//       matchValue
//     );
//   };

//   // Function to update Firebase with check-in data - FIXED
//   const updateBookingWithCheckinData = async (bookingId, vehicleNumber, imageData, vehicleType, slotNumber) => {
//     try {
//       // First update the booking with check-in data
//       const bookingRef = ref(rtdb, `bookings/${bookingId}`);
//       await update(bookingRef, { 
//         checkinVehicleNumber: vehicleNumber,
//         checkinImageData: imageData,
//         vehicleType: vehicleType,
//         checkedIn: true,
//         checkinTime: new Date().toISOString()
//       });
      
//       // Update slot in Firebase - Using set() with the string value directly
//       const slotRef = ref(rtdb, 'slot');
//       await set(slotRef, JSON.stringify(slotNumber.toString()));
      
//       // Increment connection status - Using update() with an object
//       const connectionRef = ref(rtdb, 'connection_status');
//       const connectionSnapshot = await get(connectionRef);
//       const currentValue = connectionSnapshot.exists() ? parseInt(connectionSnapshot.val()) : 0;
//       await set(connectionRef, currentValue + 1);
      
//       // Update local state
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
//     } catch (error) {
//       console.error("Error updating check-in data in Firebase:", error);
//       setActivityError('Failed to update check-in data in booking.');
      
//       // Reset check-in data in local state
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
//     }
//   };

//   // Function to update Firebase with checkout data
//   const updateBookingWithCheckoutData = async (bookingId, vehicleNumber, imageData, matchValue) => {
//     try {
//       const bookingRef = ref(rtdb, `bookings/${bookingId}`);
//       await update(bookingRef, { 
//         checkoutVehicleNumber: vehicleNumber,
//         checkoutImageData: imageData,
//         verificationResult: matchValue,
//         checkedOut: true,
//         checkoutTime: new Date().toISOString()
//       });
      
//       // Update local state
//       setUserBookings(prevBookings =>
//         prevBookings.map(booking =>
//           booking.id === bookingId
//             ? { 
//                 ...booking, 
//                 checkoutVehicleNumber: vehicleNumber,
//                 checkoutImageData: imageData,
//                 verificationResult: matchValue,
//                 checkedOut: true,
//                 checkoutTime: new Date()
//               }
//             : booking
//         )
//       );
//     } catch (error) {
//       console.error("Error updating checkout data in Firebase:", error);
//       setActivityError('Failed to update checkout data in booking.');
//     }
//   };

//   const handlePaymentMethod = async (bookingId, method) => {
//     setBookingStates(prev => ({
//       ...prev,
//       [bookingId]: {
//         ...prev[bookingId],
//         paymentMethod: method,
//         successMessage: null, // Reset success message
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
      
//       // Set success message for this booking
//       setBookingStates(prev => ({
//         ...prev,
//         [bookingId]: {
//           ...prev[bookingId],
//           webcamActive: false,
//           webcamMode: null,
//           successMessage: 'Payment successful!', // Set per-booking success message
//         }
//       }));
//     } catch (error) {
//       console.error("Error updating booking status for cash payment:", error);
//       setActivityError('Failed to process cash payment. Please try again.');
      
//       // Reset payment method
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
//       // Load Razorpay script if not already loaded
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

//       // Get user details for prefill
//       const user = users.find(user => user.id === booking.userId) || {};
      
//       // Calculate parking duration in hours (for receipt)
//       let durationText = 'Parking';
//       if (booking.startTime && booking.endTime) {
//         const durationMs = booking.endTime - booking.startTime;
//         const diffHrs = Math.floor(durationMs / (1000 * 60 * 60));
//         const diffMins = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
//         durationText = `${diffHrs}h ${diffMins}m Parking`;
//       }

//       // Create a unique order ID for this transaction
//       const orderIdPrefix = 'ord';
//       const randomId = Math.random().toString(36).substring(2, 10);
//       const orderId = `${orderIdPrefix}_${Date.now()}_${randomId}`;

//       // Get amount from booking (default to 80 if not available)
//       const amount = booking.amount || 80;

//       const options = {
//         key: RAZORPAY_KEY_ID,
//         amount: amount * 100, // Amount in paise
//         currency: 'INR',
//         name: 'Smart Parking',
//         description: `Payment for ${durationText} at ${booking.parkingLotName || 'Parking Lot'}`,
//         order_id: orderId, // Normally you would create this on your server
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
//           color: '#3b82f6', // Blue color matching your UI
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
      
//       // Open Razorpay payment form
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
//       // Update booking in Firebase
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

//       // Update local state
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
      
//       // Set success message for this booking
//       setBookingStates(prev => ({
//         ...prev,
//         [bookingId]: {
//           ...prev[bookingId],
//           webcamActive: false,
//           webcamMode: null,
//           paymentMethod: null,
//           successMessage: 'Payment successful!', // Set per-booking success message
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
    
//     // Reset payment method selection
//     setBookingStates(prev => ({
//       ...prev,
//       [bookingId]: {
//         ...prev[bookingId],
//         paymentMethod: null,
//       }
//     }));
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

//   // Helper function to get vehicle type label
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

//   // Helper function to get vehicle type icon
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

//   // Helper function to render zone icon
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

//   return (
//     <div className="users-list-container">
//       <div className="users-list-header">
//         <button className="back-button" onClick={onBack}>
//           <ArrowLeft size={18} />
//           Back to Dashboard
//         </button>
//         <h1>
//           <Users size={24} style={{ marginRight: '8px' }} />
//          Parking Lists
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
//             <div className="zones-container">
//               {zones.map(zone => (
//                 <div 
//                   key={zone.id}
//                   className={`zone-card ${zone.occupied ? 'zone-occupied' : 'zone-available'} ${activeSlot === zone.id ? 'zone-selected' : ''}`}
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
                              
//                               // Check if user has checked in
//                               const hasCheckedIn = booking.checkedIn || 
//                                 booking.checkinVehicleNumber || 
//                                 (bookingState && bookingState.zoneSelected);
                              
//                               // Check if user has checked out
//                               const hasCheckedOut = booking.checkedOut || 
//                                 booking.checkoutVehicleNumber || 
//                                 (verificationResult && verificationResult.checkoutVehicleNumber);

//                               return (
//                                 <div key={booking.id} className="booking-card">
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
                                        
//                                         {/* Vehicle Type Display */}
//                                         {(booking.vehicleType || (bookingState && bookingState.vehicleType)) && (
//                                           <div className="vehicle-type">
//                                             {getVehicleTypeIcon(booking.vehicleType || bookingState.vehicleType)}
//                                             <span>Type: {getVehicleTypeLabel(booking.vehicleType || bookingState.vehicleType)}</span>
//                                           </div>
//                                         )}
                                        
//                                         {/* Check-in Vehicle Number Display */}
//                                         {(booking.checkinVehicleNumber || (bookingState && bookingState.checkinVehicleNumber)) && (
//                                           <div className="vehicle-info">
//                                             Check-in Vehicle: {booking.checkinVehicleNumber || bookingState.checkinVehicleNumber}
//                                           </div>
//                                         )}
                                        
//                                         {/* Checkout Vehicle Number Display */}
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

//                                     {/* Check-in Image Display */}
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

//                                     {/* Checkout Image Display */}
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

//                                     {/* Verification Result Display */}
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

//                                     {/* Zone Selection UI */}
//                                     {bookingState.webcamMode === 'zonepicker' && (
//                                       <div className="zone-selection">
//                                         <h5>Select Vehicle Zone</h5>
//                                         <div className="vehicle-image-container">
//                                           <img 
//                                             src={bookingState.checkinImageData} 
//                                             alt="Vehicle" 
//                                             className="vehicle-image"
//                                           />
//                                         </div>
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

//                                     {/* Success Message */}
//                                     {bookingState.successMessage && !verificationResult && (
//                                       <div className="success-message-card">
//                                         {bookingState.successMessage}
//                                       </div>
//                                     )}

//                                     {/* Check-in Button - Only show for active bookings without check-in */}
//                                     {displayStatus === 'active' && 
//                                      !hasCheckedIn && 
//                                      !bookingState.webcamActive && 
//                                      !isProcessingPayment && (
//                                       <button
//                                         className="checkin-btn"
//                                         onClick={() => startWebcamForCheckin(booking.id)}
//                                       >
//                                         <Camera size={16} />
//                                         Check-in
//                                       </button>
//                                     )}

//                                     {/* Checkout Button - Only show for active bookings with check-in but no checkout */}
//                                     {displayStatus === 'active' && 
//                                      hasCheckedIn && 
//                                      !hasCheckedOut && 
//                                      !bookingState.webcamActive && 
//                                      !isProcessingPayment && (
//                                       <button
//                                         className="checkout-btn"
//                                         onClick={() => startWebcamForCheckout(booking.id)}
//                                       >
//                                         <Camera size={16} />
//                                         Checkout
//                                       </button>
//                                     )}

//                                     {/* Webcam Section */}
//                                     {bookingState.webcamActive && bookingState.webcamMode !== 'zonepicker' && (
//                                       <div className="webcam-container">
//                                         <h5>
//                                           {bookingState.webcamMode === 'checkin' 
//                                             ? 'Capturing Check-in Vehicle Number Plate' 
//                                             : 'Capturing Checkout Vehicle Number Plate'}
//                                         </h5>
//                                         {bookingState.webcamError && (
//                                           <div className="error-message">{bookingState.webcamError}</div>
//                                         )}
//                                         <video
//                                           ref={el => (videoRefs.current[booking.id] = el)}
//                                           autoPlay
//                                           playsInline
//                                           className="webcam-video"
//                                         />
//                                         <canvas
//                                           ref={el => (canvasRefs.current[booking.id] = el)}
//                                           style={{ display: 'none' }}
//                                         />
//                                         <button
//                                           className="capture-btn"
//                                           onClick={() => 
//                                             bookingState.webcamMode === 'checkin' 
//                                               ? captureCheckinImage(booking.id) 
//                                               : captureCheckoutImage(booking.id)
//                                           }
//                                         >
//                                           Capture
//                                         </button>
//                                       </div>
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




// import React, { useState, useEffect, useRef } from 'react';
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

// const UsersList = ({ onBack, recentActivity = [] }) => {
//   const [users, setUsers] = useState([]);
//   const [allBookings, setAllBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [expandedActivity, setExpandedActivity] = useState(null);
//   const [userBookings, setUserBookings] = useState([]);
//   const [activityError, setActivityError] = useState(null);
//   const [loadingBookings, setLoadingBookings] = useState(true);
//   const [bookingStates, setBookingStates] = useState({});
//   const videoRefs = useRef({});
//   const canvasRefs = useRef({});
//   const [paymentProcessing, setPaymentProcessing] = useState({});
  
//   // Add state for corrected activity data
//   const [correctedActivity, setCorrectedActivity] = useState([]);
  
//   // Add state for verification results
//   const [verificationResults, setVerificationResults] = useState({});

//   // Add state for firebase status values
//   const [connectionStatus, setConnectionStatus] = useState(0);
  
//   // Track occupied slots instead of just activeSlot
//   const [occupiedSlots, setOccupiedSlots] = useState([]);
  
//   const [zones, setZones] = useState([
//     { id: 1, name: 'Zone A', type: 'Car', occupied: false },
//     { id: 2, name: 'Zone B', type: 'Car', occupied: false },
//     { id: 3, name: 'Zone C', type: 'Car', occupied: false }
//   ]);

//   // Razorpay Test API Key (replace with your own from Razorpay Dashboard in Test Mode)
//   const RAZORPAY_KEY_ID = 'rzp_test_vg2WzWGNEHJpgj'; // This is a dummy test key for example purposes

//   // Listen for Firebase data changes
//   useEffect(() => {
//     // Listen for connection_status
//     const connectionRef = ref(rtdb, 'connection_status');
//     const connectionUnsubscribe = onValue(connectionRef, (snapshot) => {
//       if (snapshot.exists()) {
//         const status = snapshot.val();
//         setConnectionStatus(parseInt(status));
//       }
//     });

//     // Listen for occupied slots
//     const slotsRef = ref(rtdb, 'occupied_slots');
//     const slotsUnsubscribe = onValue(slotsRef, (snapshot) => {
//       if (snapshot.exists()) {
//         try {
//           // Parse the occupied slots from Firebase
//           const slotsData = snapshot.val();
//           const occupiedSlotsList = Array.isArray(slotsData) ? 
//             slotsData : 
//             typeof slotsData === 'string' ? 
//               JSON.parse(slotsData) : 
//               [];
          
//           setOccupiedSlots(occupiedSlotsList);
          
//           // Update zones based on the occupied slots
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
//         // If no data exists, create initial empty array
//         set(slotsRef, JSON.stringify([]));
//         setOccupiedSlots([]);
//       }
//     });

//     // For backwards compatibility, also listen to the old slot value
//     const slotRef = ref(rtdb, 'slot');
//     const slotUnsubscribe = onValue(slotRef, (snapshot) => {
//       if (snapshot.exists()) {
//         // We'll handle both the new and old systems during transition
//         try {
//           const slotValue = snapshot.val();
//           const slotNumber = parseInt(slotValue.replace(/"/g, ''));
          
//           if (!isNaN(slotNumber)) {
//             // Check if this slot is already in our occupied slots
//             if (!occupiedSlots.includes(slotNumber)) {
//               // Add this slot to occupied slots
//               const updatedSlots = [...occupiedSlots, slotNumber];
              
//               // Update the new occupied_slots node in Firebase
//               const slotsRef = ref(rtdb, 'occupied_slots');
//               set(slotsRef, JSON.stringify(updatedSlots));
//             }
//           }
//         } catch (error) {
//           console.error("Error handling legacy slot:", error);
//         }
//       }
//     });

//     return () => {
//       connectionUnsubscribe();
//       slotsUnsubscribe();
//       slotUnsubscribe();
//     };
//   }, [occupiedSlots]);

//   // Fetch all users from Firestore
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
//         // setError('Failed to load users. Please refresh the page.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUsers();
//   }, []);

//   // Process recent activity data to ensure correct user names
//   useEffect(() => {
//     if (recentActivity.length > 0 && users.length > 0) {
//       // Process activity data to ensure user names are correct
//       const processedActivity = recentActivity.map(activity => {
//         // If the activity has a userId, find the corresponding user
//         if (activity.userId) {
//           const user = users.find(u => u.id === activity.userId);
//           if (user) {
//             return {
//               ...activity,
//               user: user.name // Use the correct user name from users collection
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

//   // Fetch ALL bookings from the Realtime Database
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

//   // Handle zone click
//   const handleZoneClick = (zoneId) => {
//     // Find corresponding bookings for this zone
//     const zoneBookings = allBookings.filter(booking => {
//       if (zoneId === 1 && booking.vehicleType === 2) return true;  // Zone A - Bikes
//       if (zoneId === 2 && booking.vehicleType === 3) return true;  // Zone B - Autos
//       if (zoneId === 3 && booking.vehicleType === 4) return true;  // Zone C - Cars
//       return false;
//     });
    
//     // If this zone is occupied, try to find active booking and show details
//     if (occupiedSlots.includes(zoneId) && connectionStatus > 0) {
//       const activeBooking = zoneBookings.find(booking => 
//         booking.status === 'active' || booking.status === 'confirmed'
//       );
      
//       if (activeBooking) {
//         // Try to find matching activity
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

//   // Function to start webcam for check-in
//   const startWebcamForCheckin = async (bookingId) => {
//     setBookingStates(prev => ({
//       ...prev,
//       [bookingId]: {
//         ...prev[bookingId],
//         webcamActive: true,
//         webcamMode: 'checkin',
//         webcamError: null,
//         checkinVehicleNumber: null,
//         successMessage: null,
//         zoneSelected: false,
//       }
//     }));

//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ 
//         video: { 
//           width: { ideal: 1280 },
//           height: { ideal: 720 },
//           facingMode: "environment" // Prefer back camera if available
//         } 
//       });
      
//       if (videoRefs.current[bookingId]) {
//         videoRefs.current[bookingId].srcObject = stream;
//         videoRefs.current[bookingId].onloadedmetadata = () => {
//           videoRefs.current[bookingId].play();
//         };
//       }
//     } catch (error) {
//       console.error("Error accessing webcam:", error);
//       setBookingStates(prev => ({
//         ...prev,
//         [bookingId]: {
//           ...prev[bookingId],
//           webcamActive: false,
//           webcamError: 'Failed to access camera. Please ensure camera permissions are granted.'
//         }
//       }));
//     }
//   };

//   // Function to start webcam for checkout
//   const startWebcamForCheckout = async (bookingId) => {
//     setBookingStates(prev => ({
//       ...prev,
//       [bookingId]: {
//         ...prev[bookingId],
//         webcamActive: true,
//         webcamMode: 'checkout',
//         webcamError: null,
//         checkoutVehicleNumber: null,
//         successMessage: null,
//       }
//     }));

//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ 
//         video: { 
//           width: { ideal: 1280 },
//           height: { ideal: 720 },
//           facingMode: "environment" // Prefer back camera if available
//         } 
//       });
      
//       if (videoRefs.current[bookingId]) {
//         videoRefs.current[bookingId].srcObject = stream;
//         videoRefs.current[bookingId].onloadedmetadata = () => {
//           videoRefs.current[bookingId].play();
//         };
//       }
//     } catch (error) {
//       console.error("Error accessing webcam:", error);
//       setBookingStates(prev => ({
//         ...prev,
//         [bookingId]: {
//           ...prev[bookingId],
//           webcamActive: false,
//           webcamError: 'Failed to access camera. Please ensure camera permissions are granted.'
//         }
//       }));
//     }
//   };

//   // Function to capture image for check-in
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
    
//     // Save the captured image data URL
//     const imageDataUrl = canvas.toDataURL('image/jpeg');
    
//     // Stop the webcam stream
//     const stream = video.srcObject;
//     if (stream) {
//       const tracks = stream.getTracks();
//       tracks.forEach(track => track.stop());
//       video.srcObject = null;
//     }
    
//     // In a real app, you would send the image to a backend OCR service
//     // For this example, we'll generate a random vehicle number
//     const stateCode = ['KA', 'MH', 'TN', 'AP', 'DL'][Math.floor(Math.random() * 5)];
//     const regionCode = `${Math.floor(1 + Math.random() * 99)}`.padStart(2, '0');
//     const letterCode = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + 
//                       String.fromCharCode(65 + Math.floor(Math.random() * 26));
//     const numberCode = `${Math.floor(1000 + Math.random() * 9000)}`;
    
//     const simulatedVehicleNumber = `${stateCode}-${regionCode}-${letterCode}-${numberCode}`;
    
//     // Update state
//     setBookingStates(prev => ({
//       ...prev,
//       [bookingId]: {
//         ...prev[bookingId],
//         webcamActive: true, // Keep webcam active for zone selection
//         webcamMode: 'zonepicker',
//         checkinVehicleNumber: simulatedVehicleNumber,
//         checkinImageData: imageDataUrl,
//         successMessage: null,
//       }
//     }));
//   };

//   // Function to select vehicle zone
//   const selectZone = (bookingId, zoneType) => {
//     let vehicleType;
//     let slotNumber;
    
//     switch (zoneType) {
//       case 'A':
//         vehicleType = 2; // Bike
//         slotNumber = 1;
//         break;
//       case 'B':
//         vehicleType = 3; // Auto
//         slotNumber = 2;
//         break;
//       case 'C':
//         vehicleType = 4; // Car
//         slotNumber = 3;
//         break;
//       default:
//         vehicleType = null;
//         slotNumber = null;
//     }
    
//     // Update state
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
    
//     // Update Firebase with check-in data and slot information
//     updateBookingWithCheckinData(
//       bookingId, 
//       bookingStates[bookingId].checkinVehicleNumber, 
//       bookingStates[bookingId].checkinImageData, 
//       vehicleType,
//       slotNumber
//     );
//   };

//   // Function to capture image for checkout
//   const captureCheckoutImage = (bookingId) => {
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
    
//     // Save the captured image data URL
//     const imageDataUrl = canvas.toDataURL('image/jpeg');
    
//     // Stop the webcam stream
//     const stream = video.srcObject;
//     if (stream) {
//       const tracks = stream.getTracks();
//       tracks.forEach(track => track.stop());
//       video.srcObject = null;
//     }
    
//     // In a real app, you would send the image to a backend OCR service
//     // For this example, we'll generate a random vehicle number
//     const stateCode = ['KA', 'MH', 'TN', 'AP', 'DL'][Math.floor(Math.random() * 5)];
//     const regionCode = `${Math.floor(1 + Math.random() * 99)}`.padStart(2, '0');
//     const letterCode = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + 
//                       String.fromCharCode(65 + Math.floor(Math.random() * 26));
//     const numberCode = `${Math.floor(1000 + Math.random() * 9000)}`;
    
//     const simulatedVehicleNumber = `${stateCode}-${regionCode}-${letterCode}-${numberCode}`;
    
//     // Get the booking to access check-in vehicle number
//     const booking = userBookings.find(b => b.id === bookingId);
//     const checkinVehicleNumber = booking.checkinVehicleNumber || 
//       (bookingStates[bookingId] && bookingStates[bookingId].checkinVehicleNumber);
    
//     // For demo purposes, let's determine match with a random result (50% chance of match)
//     // In a real application, this would be an actual comparison using computer vision
//     const isMatch = Math.random() > 0.5;
//     const matchValue = isMatch ? 1 : 0;
    
//     // Set verification result
//     setVerificationResults({
//       ...verificationResults,
//       [bookingId]: {
//         isMatch,
//         matchValue,
//         message: isMatch 
//           ? 'Vehicle number plate verified successfully!' 
//           : 'Vehicle number plate does not match check-in record!',
//         checkoutVehicleNumber: simulatedVehicleNumber,
//         checkoutImageData: imageDataUrl
//       }
//     });
    
//     // Update state
//     setBookingStates(prev => ({
//       ...prev,
//       [bookingId]: {
//         ...prev[bookingId],
//         webcamActive: false,
//         webcamMode: null,
//         checkoutVehicleNumber: simulatedVehicleNumber,
//         checkoutImageData: imageDataUrl,
//         successMessage: null, // We'll use verification results instead
//       }
//     }));
    
//     // Update Firebase with verification result
//     updateBookingWithCheckoutData(
//       bookingId, 
//       simulatedVehicleNumber, 
//       imageDataUrl, 
//       matchValue
//     );
//   };

//   // Function to update Firebase with check-in data - FIXED
//   const updateBookingWithCheckinData = async (bookingId, vehicleNumber, imageData, vehicleType, slotNumber) => {
//     try {
//       // First update the booking with check-in data
//       const bookingRef = ref(rtdb, `bookings/${bookingId}`);
//       await update(bookingRef, { 
//         checkinVehicleNumber: vehicleNumber,
//         checkinImageData: imageData,
//         vehicleType: vehicleType,
//         checkedIn: true,
//         checkinTime: new Date().toISOString()
//       });
      
//       // Add this slot to occupied slots if not already present
//       if (!occupiedSlots.includes(slotNumber)) {
//         const updatedOccupiedSlots = [...occupiedSlots, slotNumber];
        
//         // Update occupied_slots in Firebase
//         const slotsRef = ref(rtdb, 'occupied_slots');
//         await set(slotsRef, JSON.stringify(updatedOccupiedSlots));
        
//         // For backward compatibility, also update the slot value
//         const slotRef = ref(rtdb, 'slot');
//         await set(slotRef, JSON.stringify(slotNumber.toString()));
//       }
      
//       // Increment connection status
//       const connectionRef = ref(rtdb, 'connection_status');
//       const connectionSnapshot = await get(connectionRef);
//       const currentValue = connectionSnapshot.exists() ? parseInt(connectionSnapshot.val()) : 0;
//       await set(connectionRef, currentValue + 1);
      
//       // Update local state
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
//     } catch (error) {
//       console.error("Error updating check-in data in Firebase:", error);
//       setActivityError('Failed to update check-in data in booking.');
      
//       // Reset check-in data in local state
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
//     }
//   };

//   // Function to update Firebase with checkout data
//   const updateBookingWithCheckoutData = async (bookingId, vehicleNumber, imageData, matchValue) => {
//     try {
//       // Get the booking to identify which slot number to remove
//       const booking = userBookings.find(b => b.id === bookingId);
//       const slotNumber = booking.spaceId;
      
//       const bookingRef = ref(rtdb, `bookings/${bookingId}`);
//       await update(bookingRef, { 
//         checkoutVehicleNumber: vehicleNumber,
//         checkoutImageData: imageData,
//         verificationResult: matchValue,
//         checkedOut: true,
//         checkoutTime: new Date().toISOString()
//       });
      
//       // Remove this slot from occupied slots
//       if (slotNumber && occupiedSlots.includes(parseInt(slotNumber))) {
//         const updatedOccupiedSlots = occupiedSlots.filter(id => id !== parseInt(slotNumber));
        
//         // Update occupied_slots in Firebase
//         const slotsRef = ref(rtdb, 'occupied_slots');
//         await set(slotsRef, JSON.stringify(updatedOccupiedSlots));
        
//         // Decrement connection status
//         const connectionRef = ref(rtdb, 'connection_status');
//         const connectionSnapshot = await get(connectionRef);
//         const currentValue = connectionSnapshot.exists() ? parseInt(connectionSnapshot.val()) : 0;
//         if (currentValue > 0) {
//           await set(connectionRef, currentValue - 1);
//         }
//       }
      
//       // Update local state
//       setUserBookings(prevBookings =>
//         prevBookings.map(booking =>
//           booking.id === bookingId
//             ? { 
//                 ...booking, 
//                 checkoutVehicleNumber: vehicleNumber,
//                 checkoutImageData: imageData,
//                 verificationResult: matchValue,
//                 checkedOut: true,
//                 checkoutTime: new Date()
//               }
//             : booking
//         )
//       );
//     } catch (error) {
//       console.error("Error updating checkout data in Firebase:", error);
//       setActivityError('Failed to update checkout data in booking.');
//     }
//   };

//   const handlePaymentMethod = async (bookingId, method) => {
//     setBookingStates(prev => ({
//       ...prev,
//       [bookingId]: {
//         ...prev[bookingId],
//         paymentMethod: method,
//         successMessage: null, // Reset success message
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
      
//       // Set success message for this booking
//       setBookingStates(prev => ({
//         ...prev,
//         [bookingId]: {
//           ...prev[bookingId],
//           webcamActive: false,
//           webcamMode: null,
//           successMessage: 'Payment successful!', // Set per-booking success message
//         }
//       }));
//     } catch (error) {
//       console.error("Error updating booking status for cash payment:", error);
//       setActivityError('Failed to process cash payment. Please try again.');
      
//       // Reset payment method
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
//       // Load Razorpay script if not already loaded
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

//       // Get user details for prefill
//       const user = users.find(user => user.id === booking.userId) || {};
      
//       // Calculate parking duration in hours (for receipt)
//       let durationText = 'Parking';
//       if (booking.startTime && booking.endTime) {
//         const durationMs = booking.endTime - booking.startTime;
//         const diffHrs = Math.floor(durationMs / (1000 * 60 * 60));
//         const diffMins = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
//         durationText = `${diffHrs}h ${diffMins}m Parking`;
//       }

//       // Create a unique order ID for this transaction
//       const orderIdPrefix = 'ord';
//       const randomId = Math.random().toString(36).substring(2, 10);
//       const orderId = `${orderIdPrefix}_${Date.now()}_${randomId}`;

//       // Get amount from booking (default to 80 if not available)
//       const amount = booking.amount || 80;

//       const options = {
//         key: RAZORPAY_KEY_ID,
//         amount: amount * 100, // Amount in paise
//         currency: 'INR',
//         name: 'Smart Parking',
//         description: `Payment for ${durationText} at ${booking.parkingLotName || 'Parking Lot'}`,
//         order_id: orderId, // Normally you would create this on your server
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
//           color: '#3b82f6', // Blue color matching your UI
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
      
//       // Open Razorpay payment form
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
//       // Update booking in Firebase
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

//       // Update local state
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
      
//       // Set success message for this booking
//       setBookingStates(prev => ({
//         ...prev,
//         [bookingId]: {
//           ...prev[bookingId],
//           webcamActive: false,
//           webcamMode: null,
//           paymentMethod: null,
//           successMessage: 'Payment successful!', // Set per-booking success message
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
    
//     // Reset payment method selection
//     setBookingStates(prev => ({
//       ...prev,
//       [bookingId]: {
//         ...prev[bookingId],
//         paymentMethod: null,
//       }
//     }));
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

//   // Helper function to get vehicle type label
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

//   // Helper function to get vehicle type icon
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

//   // Helper function to render zone icon
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

//   return (
//     <div className="users-list-container">
//       <div className="users-list-header">
//         <button className="back-button" onClick={onBack}>
//           <ArrowLeft size={18} />
//           Back to Dashboard
//         </button>
//         <h1>
//           <Users size={24} style={{ marginRight: '8px' }} />
//          Parking Lists
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
                              
//                               // Check if user has checked in
//                               const hasCheckedIn = booking.checkedIn || 
//                                 booking.checkinVehicleNumber || 
//                                 (bookingState && bookingState.zoneSelected);
                              
//                               // Check if user has checked out
//                               const hasCheckedOut = booking.checkedOut || 
//                                 booking.checkoutVehicleNumber || 
//                                 (verificationResult && verificationResult.checkoutVehicleNumber);

//                               return (
//                                 <div key={booking.id} className="booking-card">
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
                                        
//                                         {/* Vehicle Type Display */}
//                                         {(booking.vehicleType || (bookingState && bookingState.vehicleType)) && (
//                                           <div className="vehicle-type">
//                                             {getVehicleTypeIcon(booking.vehicleType || bookingState.vehicleType)}
//                                             <span>Type: {getVehicleTypeLabel(booking.vehicleType || bookingState.vehicleType)}</span>
//                                           </div>
//                                         )}
                                        
//                                         {/* Check-in Vehicle Number Display */}
//                                         {(booking.checkinVehicleNumber || (bookingState && bookingState.checkinVehicleNumber)) && (
//                                           <div className="vehicle-info">
//                                             Check-in Vehicle: {booking.checkinVehicleNumber || bookingState.checkinVehicleNumber}
//                                           </div>
//                                         )}
                                        
//                                         {/* Checkout Vehicle Number Display */}
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

//                                     {/* Check-in Image Display */}
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

//                                     {/* Checkout Image Display */}
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

//                                     {/* Verification Result Display */}
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

//                                     {/* Zone Selection UI */}
//                                     {bookingState.webcamMode === 'zonepicker' && (
//                                       <div className="zone-selection">
//                                         <h5>Select Vehicle Zone</h5>
//                                         <div className="vehicle-image-container">
//                                           <img 
//                                             src={bookingState.checkinImageData} 
//                                             alt="Vehicle" 
//                                             className="vehicle-image"
//                                           />
//                                         </div>
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

//                                     {/* Success Message */}
//                                     {bookingState.successMessage && !verificationResult && (
//                                       <div className="success-message-card">
//                                         {bookingState.successMessage}
//                                       </div>
//                                     )}

//                                     {/* Check-in Button - Only show for active bookings without check-in */}
//                                     {displayStatus === 'active' && 
//                                      !hasCheckedIn && 
//                                      !bookingState.webcamActive && 
//                                      !isProcessingPayment && (
//                                       <button
//                                         className="checkin-btn"
//                                         onClick={() => startWebcamForCheckin(booking.id)}
//                                       >
//                                         <Camera size={16} />
//                                         Check-in
//                                       </button>
//                                     )}

//                                     {/* Checkout Button - Only show for active bookings with check-in but no checkout */}
//                                     {displayStatus === 'active' && 
//                                      hasCheckedIn && 
//                                      !hasCheckedOut && 
//                                      !bookingState.webcamActive && 
//                                      !isProcessingPayment && (
//                                       <button
//                                         className="checkout-btn"
//                                         onClick={() => startWebcamForCheckout(booking.id)}
//                                       >
//                                         <Camera size={16} />
//                                         Checkout
//                                       </button>
//                                     )}

//                                     {/* Webcam Section */}
//                                     {bookingState.webcamActive && bookingState.webcamMode !== 'zonepicker' && (
//                                       <div className="webcam-container">
//                                         <h5>
//                                           {bookingState.webcamMode === 'checkin' 
//                                             ? 'Capturing Check-in Vehicle Number Plate' 
//                                             : 'Capturing Checkout Vehicle Number Plate'}
//                                         </h5>
//                                         {bookingState.webcamError && (
//                                           <div className="error-message">{bookingState.webcamError}</div>
//                                         )}
//                                         <video
//                                           ref={el => (videoRefs.current[booking.id] = el)}
//                                           autoPlay
//                                           playsInline
//                                           className="webcam-video"
//                                         />
//                                         <canvas
//                                           ref={el => (canvasRefs.current[booking.id] = el)}
//                                           style={{ display: 'none' }}
//                                         />
//                                         <button
//                                           className="capture-btn"
//                                           onClick={() => 
//                                             bookingState.webcamMode === 'checkin' 
//                                               ? captureCheckinImage(booking.id) 
//                                               : captureCheckoutImage(booking.id)
//                                           }
//                                         >
//                                           Capture
//                                         </button>
//                                       </div>
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




import React, { useState, useEffect, useRef, useCallback } from 'react';
import { rtdb } from '../firebase';
import { ref, onValue, update, get, set, off } from 'firebase/database';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { 
  Users, ArrowLeft, Clock, MapPin, Activity, ChevronRight, 
  CreditCard, Banknote, AlertTriangle, CheckCircle, Camera,
  Bike, Truck, Car
} from 'lucide-react';
import '../styles/UsersList.css';

// Firebase configuration
const firebaseConfig = {  
  apiKey: "AIzaSyB9ererNsNonAzH0zQo_GS79XPOyCoMxr4",  
  authDomain: "waterdtection.firebaseapp.com",  
  databaseURL: "https://waterdtection-default-rtdb.firebaseio.com",  
  projectId: "waterdtection",  
  storageBucket: "waterdtection.firebasestorage.app",  
  messagingSenderId: "690886375729",  
  appId: "1:690886375729:web:172c3a47dda6585e4e1810",  
  measurementId: "G-TXF33Y6XY0"
};

const UsersList = ({ onBack, recentActivity = [] }) => {
  // State declarations
  const [users, setUsers] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedActivity, setExpandedActivity] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [activityError, setActivityError] = useState(null);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingStates, setBookingStates] = useState({});
  const [paymentProcessing, setPaymentProcessing] = useState({});
  const [correctedActivity, setCorrectedActivity] = useState([]);
  const [verificationResults, setVerificationResults] = useState({});
  const [connectionStatus, setConnectionStatus] = useState(0);
  const [occupiedSlots, setOccupiedSlots] = useState([]);
  const [checkinTimeouts, setCheckinTimeouts] = useState({});
  const [previousStatus, setPreviousStatus] = useState(0);
  const [hasCheckedInOnce, setHasCheckedInOnce] = useState(false);
  const [lastCheckedInBooking, setLastCheckedInBooking] = useState(null);
  const [processingAction, setProcessingAction] = useState(false);
  const [zones, setZones] = useState([
    { id: 1, name: 'Zone A', type: 'Car', occupied: false },
    { id: 2, name: 'Zone B', type: 'Car', occupied: false },
    { id: 3, name: 'Zone C', type: 'Car', occupied: false }
  ]);
  
  // References for Firebase nodes
  const statusRef = useRef(null);
  const videoRefs = useRef({});
  const canvasRefs = useRef({});

  // Razorpay Test API Key
  const RAZORPAY_KEY_ID = 'rzp_test_vg2WzWGNEHJpgj';

  // Helper Functions
  const extractBookingInfo = (actionText) => {
    const spaceMatch = actionText.match(/Space\s+#?(\d+)/);
    const locationMatch = actionText.match(/at\s+([^,]+)(?:\s+at\s+\d+\/\d+\/\d+|$)/);
    const dateTimeMatch = actionText.match(/(\d+\/\d+\/\d+,\s+\d+:\d+:\d+\s+[AP]M)/);
    
    return {
      location: locationMatch ? locationMatch[1].trim() : null,
      spaceId: spaceMatch ? spaceMatch[1].trim() : null,
      dateTime: dateTimeMatch ? dateTimeMatch[1].trim() : null
    };
  };

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

  const getStatusClass = (status) => {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      case 'timeout':
        return 'status-timeout';
      default:
        return '';
    }
  };

  const getTimeDifference = (start, end) => {
    if (!start || !end) return 'N/A';
    const diffMs = end - start;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHrs}h ${diffMins}m`;
  };

  const determineBookingStatus = (booking) => {
    const now = new Date();
    const startTime = booking.startTime ? new Date(booking.startTime) : null;
    const endTime = booking.endTime ? new Date(booking.endTime) : null;

    if (booking.status === 'cancelled') {
      return 'cancelled';
    } else if (booking.status === 'completed') {
      return 'completed';
    } else if (booking.status === 'timeout') {
      return 'timeout';
    } else if (startTime && endTime) {
      if (now < startTime) {
        return 'active';
      } else if (now >= startTime && now <= endTime) {
        return 'active';
      } else if (now > endTime) {
        return 'completed';
      }
    }
    return booking.status || 'active';
  };

  const getVehicleTypeLabel = (type) => {
    switch (type) {
      case 2:
        return 'Car';
      case 3:
        return 'Car';
      case 4:
        return 'Car';
      default:
        return 'Not specified';
    }
  };

  const getVehicleTypeIcon = (type) => {
    switch (type) {
      case 2:
        return <Car size={16} />;
      case 3:
        return <Truck size={16} />;
      case 4:
        return <Car size={16} />;
      default:
        return <Car size={16} />;
    }
  };

  const renderZoneIcon = (zoneId) => {
    switch (zoneId) {
      case 1:
        return <Bike size={24} />;
      case 2:
        return <Truck size={24} />;
      case 3:
        return <Car size={24} />;
      default:
        return null;
    }
  };

  // Firebase Update Functions
  const updateBookingWithCheckinData = async (bookingId, vehicleNumber, imageData, vehicleType, slotNumber) => {
    try {
      console.log(`Updating booking ${bookingId} with check-in data:`, {
        vehicleNumber,
        vehicleType,
        slotNumber
      });
      
      const bookingRef = ref(rtdb, `bookings/${bookingId}`);
      await update(bookingRef, { 
        checkinVehicleNumber: vehicleNumber,
        checkinImageData: imageData,
        vehicleType: vehicleType,
        checkedIn: true,
        checkinTime: new Date().toISOString()
      });
      
      if (!occupiedSlots.includes(slotNumber)) {
        const updatedOccupiedSlots = [...occupiedSlots, slotNumber];
        
        console.log(`Adding slot ${slotNumber} to occupied slots:`, updatedOccupiedSlots);
        
        const slotsRef = ref(rtdb, 'occupied_slots');
        await set(slotsRef, JSON.stringify(updatedOccupiedSlots));
        
        const slotRef = ref(rtdb, 'slot');
        await set(slotRef, JSON.stringify(slotNumber.toString()));
      }
      
      const connectionRef = ref(rtdb, 'connection_status');
      const connectionSnapshot = await get(connectionRef);
      const currentValue = connectionSnapshot.exists() ? parseInt(connectionSnapshot.val()) : 0;
      const newValue = currentValue + 1;
      console.log(`Incrementing connection status from ${currentValue} to ${newValue}`);
      await set(connectionRef, newValue);
      
      setupCheckinTimeout(bookingId, slotNumber);
      
      // Update userBookings state
      setUserBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === bookingId
            ? { 
                ...booking, 
                checkinVehicleNumber: vehicleNumber,
                checkinImageData: imageData,
                vehicleType: vehicleType,
                checkedIn: true,
                checkinTime: new Date()
              }
            : booking
        )
      );
      
      // Update allBookings state
      setAllBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === bookingId
            ? { 
                ...booking, 
                checkinVehicleNumber: vehicleNumber,
                checkinImageData: imageData,
                vehicleType: vehicleType,
                checkedIn: true,
                checkinTime: new Date()
              }
            : booking
        )
      );
      
      // Store the booking ID as the last checked in booking
      setLastCheckedInBooking(bookingId);
      
      console.log(`Check-in data updated successfully for booking ${bookingId}`);
      return true;
    } catch (error) {
      console.error("Error updating check-in data in Firebase:", error);
      setActivityError('Failed to update check-in data in booking.');
      
      setBookingStates(prev => ({
        ...prev,
        [bookingId]: {
          ...prev[bookingId],
          webcamActive: false,
          webcamMode: null,
          checkinVehicleNumber: null,
          checkinImageData: null,
          vehicleType: null,
          zoneSelected: false,
        }
      }));
      return false;
    }
  };
  
  const updateBookingWithCheckoutData = async (bookingId, vehicleNumber, imageData, matchValue) => {
    try {
      // Find the booking in allBookings if not found in userBookings
      const booking = userBookings.find(b => b.id === bookingId) || 
                     allBookings.find(b => b.id === bookingId);
                     
      if (!booking) {
        console.error(`Booking ${bookingId} not found for checkout`);
        return false;
      }
      
      const slotNumber = booking?.spaceId;
      
      const bookingRef = ref(rtdb, `bookings/${bookingId}`);
      await update(bookingRef, { 
        checkoutVehicleNumber: vehicleNumber,
        checkoutImageData: imageData,
        verificationResult: matchValue,
        checkedOut: true,
        checkoutTime: new Date().toISOString()
      });
      
      if (slotNumber && occupiedSlots.includes(parseInt(slotNumber))) {
        const updatedOccupiedSlots = occupiedSlots.filter(id => id !== parseInt(slotNumber));
        
        const slotsRef = ref(rtdb, 'occupied_slots');
        await set(slotsRef, JSON.stringify(updatedOccupiedSlots));
        
        const connectionRef = ref(rtdb, 'connection_status');
        const connectionSnapshot = await get(connectionRef);
        const currentValue = connectionSnapshot.exists() ? parseInt(connectionSnapshot.val()) : 0;
        if (currentValue > 0) {
          await set(connectionRef, currentValue - 1);
        }
      }
      
      if (checkinTimeouts[bookingId]) {
        clearTimeout(checkinTimeouts[bookingId]);
        setCheckinTimeouts(prev => {
          const newTimeouts = { ...prev };
          delete newTimeouts[bookingId];
          return newTimeouts;
        });
      }
      
      // Update userBookings state
      setUserBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === bookingId
            ? { 
                ...booking, 
                checkoutVehicleNumber: vehicleNumber,
                checkoutImageData: imageData,
                verificationResult: matchValue,
                checkedOut: true,
                checkoutTime: new Date()
              }
            : booking
        )
      );
      
      // Update allBookings state
      setAllBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === bookingId
            ? { 
                ...booking, 
                checkoutVehicleNumber: vehicleNumber,
                checkoutImageData: imageData,
                verificationResult: matchValue,
                checkedOut: true,
                checkoutTime: new Date()
              }
            : booking
        )
      );
      
      // Reset the last checked in booking since we've checked out
      setLastCheckedInBooking(null);
      setHasCheckedInOnce(false);
      
      return true;
    } catch (error) {
      console.error("Error updating checkout data in Firebase:", error);
      setActivityError('Failed to update checkout data in booking.');
      return false;
    }
  };

  // Timeout Management
  const setupCheckinTimeout = (bookingId, slotNumber) => {
    if (checkinTimeouts[bookingId]) {
      clearTimeout(checkinTimeouts[bookingId]);
    }
    
    const timeoutId = setTimeout(async () => {
      try {
        console.log(`15-minute timeout reached for booking ${bookingId}`);
        
        const bookingRef = ref(rtdb, `bookings/${bookingId}`);
        const bookingSnapshot = await get(bookingRef);
        
        if (bookingSnapshot.exists()) {
          const bookingData = bookingSnapshot.val();
          
          if (!bookingData.checkedOut) {
            console.log(`Auto-releasing slot ${slotNumber} for booking ${bookingId}`);
            
            const updatedOccupiedSlots = occupiedSlots.filter(id => id !== parseInt(slotNumber));
            const slotsRef = ref(rtdb, 'occupied_slots');
            await set(slotsRef, JSON.stringify(updatedOccupiedSlots));
            
            const connectionRef = ref(rtdb, 'connection_status');
            const connectionSnapshot = await get(connectionRef);
            const currentValue = connectionSnapshot.exists() ? parseInt(connectionSnapshot.val()) : 0;
            if (currentValue > 0) {
              await set(connectionRef, currentValue - 1);
            }
            
            await update(bookingRef, {
              status: 'timeout',
              timeoutAt: new Date().toISOString(),
              autoReleased: true
            });
            
            console.log(`Slot ${slotNumber} automatically released due to 15-minute timeout`);
          }
        }
      } catch (error) {
        console.error("Error during automatic slot release:", error);
      }
      
      setCheckinTimeouts(prev => {
        const newTimeouts = { ...prev };
        delete newTimeouts[bookingId];
        return newTimeouts;
      });
    }, 15 * 60 * 1000); // 15 minutes
    
    setCheckinTimeouts(prev => ({
      ...prev,
      [bookingId]: timeoutId
    }));
  };

  // Automatic Check-in/Check-out Functions
  const handleAutomaticCheckin = useCallback(async () => {
    if (processingAction) return;
    setProcessingAction(true);
    
    try {
      console.log("Starting automatic check-in process");
      
      if (allBookings.length === 0) {
        console.log("No bookings available yet - waiting for data to load");
        setProcessingAction(false);
        return;
      }
      
      // Find the most recent active booking that hasn't been checked in
      const activeBookings = allBookings.filter(booking => 
        (booking.status === 'active' || booking.status === 'confirmed') && 
        !booking.checkedIn
      );
      
      // Sort by booking time descending to get the most recent one
      activeBookings.sort((a, b) => {
        const timeA = a.bookingTime ? a.bookingTime.getTime() : 0;
        const timeB = b.bookingTime ? b.bookingTime.getTime() : 0;
        return timeB - timeA;
      });
      
      const activeBooking = activeBookings[0];
      
      if (!activeBooking) {
        console.log("No eligible bookings found for automatic check-in");
        setProcessingAction(false);
        return;
      }
      
      console.log(`Found eligible booking for check-in: ${activeBooking.id}`);
      
      const spaceId = activeBooking.spaceId ? parseInt(activeBooking.spaceId) : 1;
      const vehicleType = 2; // Car
      const slotNumber = spaceId <= 3 ? spaceId : 1;
      const vehicleNumber = "AUTO-CHECK-IN";
      
      const success = await updateBookingWithCheckinData(
        activeBooking.id,
        vehicleNumber,
        null,
        vehicleType,
        slotNumber
      );
      
      if (success) {
        setBookingStates(prev => ({
          ...prev,
          [activeBooking.id]: {
            ...prev[activeBooking.id],
            webcamActive: false,
            webcamMode: null,
            checkinVehicleNumber: vehicleNumber,
            vehicleType: vehicleType,
            zoneSelected: true,
            successMessage: 'Automatic check-in completed successfully.',
          }
        }));
        
        // Set the last checked in booking
        setLastCheckedInBooking(activeBooking.id);
        
        console.log(`Automatic check-in completed for booking ${activeBooking.id}`);
        
        // Reset Firebase status to 0 after 3 seconds
        setTimeout(() => {
          try {
            const statusRef = ref(rtdb, 'Car_Parking/Status/status');
            set(statusRef, 0)
              .then(() => {
                console.log("Auto-reset status to 0 after check-in");
              })
              .catch(error => {
                console.error("Error resetting status to 0 after check-in:", error);
              })
              .finally(() => {
                setProcessingAction(false);
              });
          } catch (error) {
            console.error("Error in status reset timeout:", error);
            setProcessingAction(false);
          }
        }, 3000);
      } else {
        setProcessingAction(false);
      }
    } catch (error) {
      console.error("Error during automatic check-in:", error);
      setProcessingAction(false);
    }
  }, [allBookings, occupiedSlots, processingAction]);
  
  const handleAutomaticCheckout = useCallback(async () => {
    if (processingAction) return;
    setProcessingAction(true);
    
    try {
      console.log("Starting automatic check-out process");
      
      if (!lastCheckedInBooking) {
        console.log("No previously checked-in booking found for checkout");
        setProcessingAction(false);
        return;
      }
      
      // Find the booking that was previously checked in
      const bookingToCheckout = allBookings.find(b => b.id === lastCheckedInBooking);
      
      if (!bookingToCheckout) {
        console.log(`Previously checked-in booking ${lastCheckedInBooking} not found`);
        setProcessingAction(false);
        return;
      }
      
      if (bookingToCheckout.checkedOut) {
        console.log(`Booking ${lastCheckedInBooking} already checked out`);
        setProcessingAction(false);
        return;
      }
      
      console.log(`Found eligible booking for check-out: ${bookingToCheckout.id}`);
      
      const vehicleNumber = "AUTO-CHECK-OUT";
      
      const success = await updateBookingWithCheckoutData(
        bookingToCheckout.id,
        vehicleNumber,
        null,
        1
      );
      
      if (success) {
        setVerificationResults(prev => ({
          ...prev,
          [bookingToCheckout.id]: {
            isMatch: true,
            matchValue: 1,
            message: 'Vehicle automatically verified by system!',
            checkoutVehicleNumber: vehicleNumber,
            checkoutImageData: null
          }
        }));
        
        setBookingStates(prev => ({
          ...prev,
          [bookingToCheckout.id]: {
            ...prev[bookingToCheckout.id],
            checkoutVehicleNumber: vehicleNumber,
            successMessage: 'Automatic check-out completed successfully.',
          }
        }));
        
        console.log(`Automatic check-out completed for booking ${bookingToCheckout.id}`);
        
        // Reset Firebase status to 0 after 3 seconds
        setTimeout(() => {
          try {
            const statusRef = ref(rtdb, 'Car_Parking/Status/status');
            set(statusRef, 0)
              .then(() => {
                console.log("Auto-reset status to 0 after check-out");
              })
              .catch(error => {
                console.error("Error resetting status to 0 after check-out:", error);
              })
              .finally(() => {
                setProcessingAction(false);
              });
          } catch (error) {
            console.error("Error in status reset timeout:", error);
            setProcessingAction(false);
          }
        }, 3000);
      } else {
        setProcessingAction(false);
      }
    } catch (error) {
      console.error("Error during automatic check-out:", error);
      setProcessingAction(false);
    }
  }, [allBookings, lastCheckedInBooking, processingAction]);

  // Event Handlers
  const handleZoneClick = (zoneId) => {
    const zoneBookings = allBookings.filter(booking => {
      if (zoneId === 1 && booking.vehicleType === 2) return true;
      if (zoneId === 2 && booking.vehicleType === 3) return true;
      if (zoneId === 3 && booking.vehicleType === 4) return true;
      return false;
    });
    
    if (occupiedSlots.includes(zoneId) && connectionStatus > 0) {
      const activeBooking = zoneBookings.find(booking => 
        booking.status === 'active' || booking.status === 'confirmed'
      );
      
      if (activeBooking) {
        const activity = correctedActivity.find(a => 
          a.action && a.action.includes(`Space #${activeBooking.spaceId}`)
        );
        
        if (activity) {
          handleActivityClick(activity);
        }
      }
    }
  };

  const handleActivityClick = (activity) => {
    if (expandedActivity === activity.id) {
      setExpandedActivity(null);
      setUserBookings([]);
      setActivityError(null);
      setBookingStates({});
      return;
    }

    setExpandedActivity(activity.id);
    setActivityError(null);
    setBookingStates({});
    
    try {
      if (loadingBookings) {
        setActivityError("Still loading booking data. Please wait...");
        return;
      }

      if (allBookings.length === 0) {
        setActivityError("No booking data available.");
        return;
      }

      const { location, spaceId, dateTime } = extractBookingInfo(activity.action);
      const userObj = users.find(user => user.name === activity.user);
      const userId = userObj ? userObj.id : null;
      
      let filteredBookings = [];
      
      if (userId && spaceId) {
        filteredBookings = allBookings.filter(booking => 
          booking.userId === userId && 
          String(booking.spaceId) === String(spaceId)
        );
      }
      
      if (filteredBookings.length === 0 && (spaceId || location)) {
        filteredBookings = allBookings.filter(booking => {
          const spaceMatch = spaceId ? String(booking.spaceId) === String(spaceId) : false;
          const locationMatch = location && booking.parkingLotName ? 
            booking.parkingLotName.includes(location) : false;
          
          return spaceMatch || locationMatch;
        });
      }
      
      if (filteredBookings.length === 0 && userId) {
        filteredBookings = allBookings.filter(booking => booking.userId === userId);
      }
      
      if (filteredBookings.length === 0) {
        const firstName = activity.user.split(' ')[0];
        
        filteredBookings = allBookings.filter(booking => {
          const bookingValues = Object.values(booking).map(val => 
            typeof val === 'string' ? val.toLowerCase() : ''
          );
          
          const hasUserName = bookingValues.some(val => 
            val.includes(firstName.toLowerCase())
          );
          
          let timeMatch = false;
          if (dateTime) {
            const activityTime = new Date(dateTime);
            const bookingTime = booking.bookingTime;
            if (bookingTime) {
              timeMatch = Math.abs(bookingTime - activityTime) < 1000 * 60 * 60;
            }
          }
          
          return hasUserName || timeMatch;
        });
      }
      
      setUserBookings(filteredBookings);
      
      if (filteredBookings.length === 0) {
        setActivityError(`No bookings found related to this activity for ${activity.user}.`);
      }
    } catch (error) {
      console.error("Error processing activity:", error);
      setActivityError('Failed to process user activity data: ' + error.message);
    }
  };

  // Image Capture Functions
  const captureCheckinImage = (bookingId) => {
    const video = videoRefs.current[bookingId];
    const canvas = canvasRefs.current[bookingId];
    
    if (!video || !canvas) {
      console.error('Video or canvas reference not found.');
      return;
    }
    
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageDataUrl = canvas.toDataURL('image/jpeg');
    
    const stream = video.srcObject;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      video.srcObject = null;
    }
    
    const stateCode = ['KA', 'MH', 'TN', 'AP', 'DL'][Math.floor(Math.random() * 5)];
    const regionCode = `${Math.floor(1 + Math.random() * 99)}`.padStart(2, '0');
    const letterCode = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + 
                      String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const numberCode = `${Math.floor(1000 + Math.random() * 9000)}`;
    
    const simulatedVehicleNumber = `${stateCode}-${regionCode}-${letterCode}-${numberCode}`;
    
    setBookingStates(prev => ({
      ...prev,
      [bookingId]: {
        ...prev[bookingId],
        webcamActive: true,
        webcamMode: 'zonepicker',
        checkinVehicleNumber: simulatedVehicleNumber,
        checkinImageData: imageDataUrl,
        successMessage: null,
      }
    }));
  };

  const selectZone = (bookingId, zoneType) => {
    let vehicleType;
    let slotNumber;
    
    switch (zoneType) {
      case 'A':
        vehicleType = 2;
        slotNumber = 1;
        break;
      case 'B':
        vehicleType = 3;
        slotNumber = 2;
        break;
      case 'C':
        vehicleType = 4;
        slotNumber = 3;
        break;
      default:
        vehicleType = null;
        slotNumber = null;
    }
    
    setBookingStates(prev => ({
      ...prev,
      [bookingId]: {
        ...prev[bookingId],
        webcamActive: false,
        webcamMode: null,
        vehicleType: vehicleType,
        zoneSelected: true,
        successMessage: 'Check-in successful! Vehicle number plate captured.',
      }
    }));
    
    updateBookingWithCheckinData(
      bookingId, 
      bookingStates[bookingId].checkinVehicleNumber, 
      bookingStates[bookingId].checkinImageData, 
      vehicleType,
      slotNumber
    );
  };

  // Payment Functions
  const handlePaymentMethod = async (bookingId, method) => {
    setBookingStates(prev => ({
      ...prev,
      [bookingId]: {
        ...prev[bookingId],
        paymentMethod: method,
        successMessage: null,
      }
    }));

    if (method === 'cash') {
      processCashPayment(bookingId);
    } else if (method === 'razorpay') {
      await initiateRazorpayPayment(bookingId);
    }
  };

  const processCashPayment = async (bookingId) => {
    setPaymentProcessing(prev => ({ ...prev, [bookingId]: true }));
    try {
      const bookingRef = ref(rtdb, `bookings/${bookingId}`);
      await update(bookingRef, { 
        status: 'completed',
        paymentMethod: 'cash',
        endTime: new Date().toISOString(),
        paidAt: new Date().toISOString()
      });
      
      setUserBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === bookingId
            ? { 
                ...booking, 
                status: 'completed', 
                paymentMethod: 'cash', 
                endTime: new Date(),
                paidAt: new Date()
              }
            : booking
        )
      );
      
      setBookingStates(prev => ({
        ...prev,
        [bookingId]: {
          ...prev[bookingId],
          webcamActive: false,
          webcamMode: null,
          successMessage: 'Payment successful!',
        }
      }));
    } catch (error) {
      console.error("Error updating booking status for cash payment:", error);
      setActivityError('Failed to process cash payment. Please try again.');
      
      setBookingStates(prev => ({
        ...prev,
        [bookingId]: {
          ...prev[bookingId],
          paymentMethod: null,
        }
      }));
    } finally {
      setPaymentProcessing(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      
      script.onload = () => {
        console.log("Razorpay SDK loaded successfully");
        resolve(true);
      };
      
      script.onerror = () => {
        console.error("Failed to load Razorpay SDK");
        resolve(false);
      };
      
      document.body.appendChild(script);
    });
  };

  const initiateRazorpayPayment = async (bookingId) => {
    setPaymentProcessing(prev => ({ ...prev, [bookingId]: true }));
    try {
      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded) {
        setActivityError('Razorpay SDK failed to load. Please check your internet connection.');
        setPaymentProcessing(prev => ({ ...prev, [bookingId]: false }));
        setBookingStates(prev => ({
          ...prev,
          [bookingId]: {
            ...prev[bookingId],
            paymentMethod: null,
          }
        }));
        return;
      }

      const booking = userBookings.find(b => b.id === bookingId);
      if (!booking) {
        setActivityError('Booking not found. Please try again.');
        setPaymentProcessing(prev => ({ ...prev, [bookingId]: false }));
        return;
      }

      const user = users.find(user => user.id === booking.userId) || {};
      
      let durationText = 'Parking';
      if (booking.startTime && booking.endTime) {
        const durationMs = booking.endTime - booking.startTime;
        const diffHrs = Math.floor(durationMs / (1000 * 60 * 60));
        const diffMins = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        durationText = `${diffHrs}h ${diffMins}m Parking`;
      }

      const orderIdPrefix = 'ord';
      const randomId = Math.random().toString(36).substring(2, 10);
      const orderId = `${orderIdPrefix}_${Date.now()}_${randomId}`;

      const amount = booking.amount || 80;

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency: 'INR',
        name: 'Smart Parking',
        description: `Payment for ${durationText} at ${booking.parkingLotName || 'Parking Lot'}`,
        order_id: orderId,
        handler: function(response) {
          console.log("Payment successful", response);
          handleRazorpaySuccess(bookingId, response);
        },
        prefill: {
          name: user.name || 'Customer',
          email: user.email || '',
          contact: user.phone || '',
        },
        notes: {
          bookingId: booking.id,
          parkingLotName: booking.parkingLotName,
          spaceId: booking.spaceId,
          startTime: booking.startTime ? booking.startTime.toISOString() : '',
        },
        theme: {
          color: '#3b82f6',
        },
        modal: {
          ondismiss: function() {
            console.log('Payment dismissed');
            setPaymentProcessing(prev => ({ ...prev, [bookingId]: false }));
            setBookingStates(prev => ({
              ...prev,
              [bookingId]: {
                ...prev[bookingId],
                paymentMethod: null,
              }
            }));
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', function(response) {
        console.error('Payment failed', response.error);
        handleRazorpayFailure(bookingId, response.error);
      });
      
      razorpay.open();
    } catch (error) {
      console.error("Error initiating Razorpay payment:", error);
      setActivityError(`Failed to initiate payment: ${error.message}`);
      setPaymentProcessing(prev => ({ ...prev, [bookingId]: false }));
      setBookingStates(prev => ({
        ...prev,
        [bookingId]: {
          ...prev[bookingId],
          paymentMethod: null,
        }
      }));
    }
  };

  const handleRazorpaySuccess = async (bookingId, paymentResponse) => {
    console.log("Processing successful payment", bookingId, paymentResponse);
    try {
      const bookingRef = ref(rtdb, `bookings/${bookingId}`);
      await update(bookingRef, { 
        status: 'completed',
        paymentMethod: 'razorpay',
        paymentId: paymentResponse.razorpay_payment_id,
        orderId: paymentResponse.razorpay_order_id,
        paymentSignature: paymentResponse.razorpay_signature,
        endTime: new Date().toISOString(),
        paidAt: new Date().toISOString()
      });

      setUserBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === bookingId
            ? { 
                ...booking, 
                status: 'completed', 
                paymentMethod: 'razorpay',
                paymentId: paymentResponse.razorpay_payment_id,
                endTime: new Date(),
                paidAt: new Date()
              }
            : booking
        )
      );
      
      setBookingStates(prev => ({
        ...prev,
        [bookingId]: {
          ...prev[bookingId],
          webcamActive: false,
          webcamMode: null,
          paymentMethod: null,
          successMessage: 'Payment successful!',
        }
      }));
    } catch (error) {
      console.error("Error updating booking after payment:", error);
      setActivityError('Payment was successful, but we had trouble updating your booking. Please contact support.');
    } finally {
      setPaymentProcessing(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const handleRazorpayFailure = (bookingId, error) => {
    console.error("Payment failed", error);
    
    setActivityError(`Payment failed: ${error.description || 'Unknown error occurred'}`);
    setPaymentProcessing(prev => ({ ...prev, [bookingId]: false }));
    
    setBookingStates(prev => ({
      ...prev,
      [bookingId]: {
        ...prev[bookingId],
        paymentMethod: null,
      }
    }));
  };

  // Force a status check when needed
  const forceStatusCheck = useCallback(async () => {
    try {
      if (!statusRef.current) {
        statusRef.current = ref(rtdb, 'Car_Parking/Status/status');
      }
      
      console.log("Performing force status check");
      const snapshot = await get(statusRef.current);
      
      if (snapshot.exists()) {
        const currentStatus = parseInt(snapshot.val());
        console.log(`Force status check: Current value = ${currentStatus}, Previous value = ${previousStatus}`);
        
        if (currentStatus !== previousStatus) {
          console.log(`Updating status from ${previousStatus} to ${currentStatus}`);
          setPreviousStatus(currentStatus);
          
          // If status is 1 and we haven't processed it yet, handle it
          if (currentStatus === 1 && !processingAction) {
            if (!hasCheckedInOnce || !lastCheckedInBooking) {
              console.log("Force trigger: Starting automatic check-in");
              handleAutomaticCheckin();
              setHasCheckedInOnce(true);
            } else {
              console.log("Force trigger: Starting automatic check-out");
              handleAutomaticCheckout();
            }
          }
        }
      } else {
        console.error("Firebase status node doesn't exist!");
      }
    } catch (error) {
      console.error("Error in force status check:", error);
    }
  }, [previousStatus, processingAction, hasCheckedInOnce, lastCheckedInBooking, handleAutomaticCheckin, handleAutomaticCheckout]);

  // Set up Firebase listeners and initial data loading
  useEffect(() => {
    // Initialize Firebase refs
    statusRef.current = ref(rtdb, 'Car_Parking/Status/status');
    const connectionRef = ref(rtdb, 'connection_status');
    const slotsRef = ref(rtdb, 'occupied_slots');
    const slotRef = ref(rtdb, 'slot');
    
    // Set up connection status listener
    const connectionUnsubscribe = onValue(connectionRef, (snapshot) => {
      if (snapshot.exists()) {
        const status = snapshot.val();
        setConnectionStatus(parseInt(status));
      }
    }, (error) => {
      console.error("Error in connection_status listener:", error);
    });
    
    // Set up status listener
    const statusUnsubscribe = onValue(statusRef.current, (snapshot) => {
      if (snapshot.exists()) {
        try {
          const currentStatus = parseInt(snapshot.val());
          console.log(`Status value changed (from listener): ${currentStatus} (Previous: ${previousStatus})`);
          
          // Update the status state
          setPreviousStatus(currentStatus);
          
          // Skip processing if we're already handling an action
          if (processingAction) {
            console.log("Already processing an action - will not trigger new action");
            return;
          }
          
          // Only trigger actions when status is 1
          if (currentStatus === 1) {
            console.log("Status is 1 - checking if action needed");
            
            // If no check-in has happened yet, do a check-in
            if (!hasCheckedInOnce || !lastCheckedInBooking) {
              console.log("No check-in recorded yet - performing automatic check-in");
              handleAutomaticCheckin();
              setHasCheckedInOnce(true);
            } 
            // If we already checked in, do a check-out
            else {
              console.log(`Previous check-in exists (booking ${lastCheckedInBooking}) - performing automatic check-out`);
              handleAutomaticCheckout();
            }
          }
        } catch (error) {
          console.error("Error processing status change:", error);
        }
      } else {
        console.log("Status node doesn't exist in the database");
      }
    }, (error) => {
      console.error("Error in Car_Parking/Status/status listener:", error);
    });
    
    // Set up occupied slots listener
    const slotsUnsubscribe = onValue(slotsRef, (snapshot) => {
      if (snapshot.exists()) {
        try {
          const slotsData = snapshot.val();
          const occupiedSlotsList = Array.isArray(slotsData) ? 
            slotsData : 
            typeof slotsData === 'string' ? 
              JSON.parse(slotsData) : 
              [];
          
          setOccupiedSlots(occupiedSlotsList);
          
          setZones(prevZones => 
            prevZones.map(zone => ({
              ...zone,
              occupied: occupiedSlotsList.includes(zone.id)
            }))
          );
        } catch (error) {
          console.error("Error parsing occupied slots:", error);
        }
      } else {
        set(slotsRef, JSON.stringify([]));
        setOccupiedSlots([]);
      }
    }, (error) => {
      console.error("Error in occupied_slots listener:", error);
    });
    
    // Set up slot listener
    const slotUnsubscribe = onValue(slotRef, (snapshot) => {
      if (snapshot.exists()) {
        try {
          const slotValue = snapshot.val();
          const slotNumber = parseInt(slotValue.replace(/"/g, ''));
          
          if (!isNaN(slotNumber)) {
            if (!occupiedSlots.includes(slotNumber)) {
              const updatedSlots = [...occupiedSlots, slotNumber];
              const slotsRef = ref(rtdb, 'occupied_slots');
              set(slotsRef, JSON.stringify(updatedSlots));
            }
          }
        } catch (error) {
          console.error("Error handling legacy slot:", error);
        }
      }
    }, (error) => {
      console.error("Error in slot listener:", error);
    });
    
    // Check the initial status
    const checkInitialStatus = async () => {
      try {
        const snapshot = await get(statusRef.current);
        if (snapshot.exists()) {
          const currentStatus = parseInt(snapshot.val());
          console.log(`Initial status value: ${currentStatus}`);
          setPreviousStatus(currentStatus);
          
          // If status is already 1 on load, trigger action
          if (currentStatus === 1 && !processingAction) {
            console.log("Status is already 1 on load - will process actions");
            // We'll let the regular status listener handle this
          }
        }
      } catch (error) {
        console.error("Error checking initial status:", error);
      }
    };
    
    // Run initial status check
    checkInitialStatus();
    
    // Clean up all listeners on component unmount
    return () => {
      connectionUnsubscribe();
      statusUnsubscribe();
      slotsUnsubscribe();
      slotUnsubscribe();
    };
  }, [occupiedSlots, previousStatus, hasCheckedInOnce, lastCheckedInBooking, handleAutomaticCheckin, handleAutomaticCheckout, processingAction]);
  
  // Set up polling mechanism as a backup to ensure status changes are caught
  useEffect(() => {
    const statusCheckInterval = setInterval(() => {
      forceStatusCheck();
    }, 2000); // Check every 2 seconds
    
    return () => {
      clearInterval(statusCheckInterval);
    };
  }, [forceStatusCheck]);

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Process activity data
  useEffect(() => {
    if (recentActivity.length > 0 && users.length > 0) {
      const processedActivity = recentActivity.map(activity => {
        if (activity.userId) {
          const user = users.find(u => u.id === activity.userId);
          if (user) {
            return {
              ...activity,
              user: user.name
            };
          }
        }
        return activity;
      });
      
      setCorrectedActivity(processedActivity);
    } else {
      setCorrectedActivity(recentActivity);
    }
  }, [recentActivity, users]);

  // Fetch all bookings
  useEffect(() => {
    const fetchAllBookings = () => {
      setLoadingBookings(true);
      try {
        const bookingsRef = ref(rtdb, 'bookings');
        
        const unsubscribe = onValue(bookingsRef, (snapshot) => {
          const bookingsList = [];
          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              const bookingData = childSnapshot.val();
              bookingsList.push({
                id: childSnapshot.key,
                ...bookingData,
                bookingTime: bookingData.bookingTime
                  ? new Date(bookingData.bookingTime)
                  : null,
                startTime: bookingData.startTime
                  ? new Date(bookingData.startTime)
                  : null,
                endTime: bookingData.endTime
                  ? new Date(bookingData.endTime)
                  : null,
              });
            });

            bookingsList.sort((a, b) => {
              const timeA = a.bookingTime ? a.bookingTime.getTime() : 0;
              const timeB = b.bookingTime ? b.bookingTime.getTime() : 0;
              return timeB - timeA;
            });
          }

          setAllBookings(bookingsList);
          setLoadingBookings(false);
        }, (err) => {
          console.error("Error fetching all bookings:", err);
          setError('Failed to load booking data. Please try again later.');
          setLoadingBookings(false);
        });

        return () => unsubscribe();
      } catch (err) {
        console.error("Error setting up bookings listener:", err);
        setError('Failed to load booking data. Please try again later.');
        setLoadingBookings(false);
      }
    };

    fetchAllBookings();
  }, []);

  return (
    <div className="users-list-container">
      <div className="users-list-header">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>
        <h1>
          <Users size={24} style={{ marginRight: '8px' }} />
          Parking Lists
        </h1>
      </div>

      {loading || loadingBookings ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading data...</p>
        </div>
      ) : (
        <>
          {/* Zone Dashboard Section */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2 className="card-title">Parking Zones</h2>
              <div className="connection-status">
                <span>Active Vehicles: {connectionStatus}</span>
                <button 
                  className={`firebase-status-indicator ${previousStatus === 1 ? 'status-active' : ''}`}
                  onClick={forceStatusCheck}
                >
                  <Activity size={16} className={processingAction ? "spinning" : ""} />
                  Firebase Status: {previousStatus}
                  {processingAction && <span className="processing-badge">Processing</span>}
                </button>
              </div>
            </div>
            <div className="zones-container">
              {zones.map(zone => (
                <div 
                  key={zone.id}
                  className={`zone-card ${zone.occupied ? 'zone-occupied' : 'zone-available'}`}
                  onClick={() => handleZoneClick(zone.id)}
                >
                  <div className="zone-icon">
                    {renderZoneIcon(zone.id)}
                  </div>
                  <div className="zone-info">
                    <h3>Slot {zone.id}</h3>
                    <p>{zone.name} ({zone.type})</p>
                    <div className="zone-status">
                      <span className="zone-vehicles">
                        {zone.occupied ? '1 Vehicle' : '0 Vehicles'}
                      </span>
                      <span className={`zone-indicator ${zone.occupied ? 'status-occupied' : 'status-available'}`}>
                        {zone.occupied ? 'Occupied' : 'Available'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="users-table-container">
            {users.length > 0 ? (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
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
                      <td>{user.email || 'N/A'}</td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {user.role || 'N/A'}
                        </span>
                      </td>
                      <td>
                        {user.createdAt
                          ? new Date(user.createdAt.seconds * 1000).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : users.length === 0 && correctedActivity.length === 0 ? (
              <div className="no-users">
                <p>No users found.</p>
              </div>
            ) : null}
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="dashboard-card" style={{ marginTop: '20px' }}>
            <div className="card-header">
              <h2 className="card-title">Recent Activity</h2>
              <div className="view-all">View All</div>
            </div>
            
            <div className="activity-list">
              {correctedActivity.length > 0 ? (
                correctedActivity.map((activity) => (
                  <div key={activity.id}>
                    <div
                      className="activity-item activity-card"
                      onClick={() => handleActivityClick(activity)}
                    >
                      <div className="activity-avatar">
                        {activity.user.charAt(0)}
                      </div>
                      <div className="activity-details">
                        <p className="activity-text">
                          <span className="activity-user">{activity.user}</span> {activity.action}
                        </p>
                        <p className="activity-time">{activity.time}</p>
                      </div>
                      <ChevronRight
                        size={20}
                        className={`expand-icon ${expandedActivity === activity.id ? 'rotated' : ''}`}
                      />
                    </div>

                    {expandedActivity === activity.id && (
                      <div className="activity-details-expanded">
                        <h3>{activity.user}'s Parking History</h3>
                        {activityError && (
                          <div className="error-message">{activityError}</div>
                        )}

                        {userBookings.length === 0 ? (
                          <div className="no-bookings">
                            <Activity size={48} />
                            <h4>No bookings found</h4>
                            <p>No booking history available for this user.</p>
                          </div>
                        ) : (
                          <div className="bookings-list">
                            {userBookings.map((booking) => {
                              const displayStatus = determineBookingStatus(booking);
                              const bookingState = bookingStates[booking.id] || {};
                              const verificationResult = verificationResults[booking.id];
                              const isProcessingPayment = paymentProcessing[booking.id];
                              
                              const hasCheckedIn = booking.checkedIn || 
                                booking.checkinVehicleNumber || 
                                (bookingState && bookingState.zoneSelected);
                              
                              const hasCheckedOut = booking.checkedOut || 
                                booking.checkoutVehicleNumber || 
                                (verificationResult && verificationResult.checkoutVehicleNumber);

                              const isLastCheckedIn = lastCheckedInBooking === booking.id;

                              return (
                                <div key={booking.id} className="booking-card">
                                  <div className="booking-card-header">
                                    <div className="booking-basic-info">
                                      <h4>{booking.parkingLotName || 'Parking Lot'}</h4>
                                      <div className="booking-meta">
                                        <span className="booking-id">ID: {booking.bookingId || booking.id || 'N/A'}</span>
                                        <span className={`booking-status ${getStatusClass(displayStatus)}`}>
                                          {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="booking-details">
                                    <div className="detail-section">
                                      <h5>Location</h5>
                                      <div className="detail-item">
                                        <MapPin size={16} />
                                        <span>{booking.location || booking.parkingLotLocation || 'Location not available'}</span>
                                      </div>
                                    </div>

                                    <div className="detail-section">
                                      <h5>Timing Details</h5>
                                      <div className="detail-item">
                                        <Clock size={16} />
                                        <div className="time-details">
                                          <div className="time-range">
                                            <span>Start: {formatDateTime(booking.startTime)}</span>
                                            <span>End: {formatDateTime(booking.endTime)}</span>
                                          </div>
                                          <div className="duration">
                                            Duration: {getTimeDifference(booking.startTime, booking.endTime)}
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="detail-section payment-details">
                                      <div className="payment-info">
                                        <h5>Payment Details</h5>
                                        <div className="payment-amount">{booking.amount || booking.paymentAmount || '80'}</div>
                                      </div>
                                      <div className="payment-method">
                                        {booking.paymentMethod ? 
                                          `${booking.paymentMethod.charAt(0).toUpperCase() + booking.paymentMethod.slice(1)} Payment` : 
                                          (booking.status === 'completed' ? 'Payment Completed' : 'Payment Pending')
                                        }
                                        {booking.paymentId && (
                                          <div className="payment-id">
                                            Transaction ID: {booking.paymentId.substring(0, 10)}...
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="detail-section">
                                      <h5>Parking Space</h5>
                                      <div className="space-info">
                                        <div className="space-number">Space #{booking.spaceId || 'N/A'}</div>
                                        
                                        {(booking.vehicleType || (bookingState && bookingState.vehicleType)) && (
                                          <div className="vehicle-type">
                                            {getVehicleTypeIcon(booking.vehicleType || bookingState.vehicleType)}
                                            <span>Type: {getVehicleTypeLabel(booking.vehicleType || bookingState.vehicleType)}</span>
                                          </div>
                                        )}
                                        
                                        {(booking.checkinVehicleNumber || (bookingState && bookingState.checkinVehicleNumber)) && (
                                          <div className="vehicle-info">
                                            Check-in Vehicle: {booking.checkinVehicleNumber || bookingState.checkinVehicleNumber}
                                          </div>
                                        )}
                                        
                                        {(booking.checkoutVehicleNumber || 
                                          (bookingState && bookingState.checkoutVehicleNumber) ||
                                          (verificationResult && verificationResult.checkoutVehicleNumber)) && (
                                          <div className="vehicle-info">
                                            Checkout Vehicle: {booking.checkoutVehicleNumber || 
                                              bookingState.checkoutVehicleNumber || 
                                              (verificationResult && verificationResult.checkoutVehicleNumber)}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {(booking.checkinImageData || (bookingState && bookingState.checkinImageData)) && (
                                      <div className="image-preview-section">
                                        <h5>Check-in Image</h5>
                                        <div className="image-preview">
                                          <img 
                                            src={booking.checkinImageData || bookingState.checkinImageData} 
                                            alt="Check-in Vehicle" 
                                            className="captured-image"
                                          />
                                        </div>
                                      </div>
                                    )}

                                    {(booking.checkoutImageData || 
                                      (bookingState && bookingState.checkoutImageData) ||
                                      (verificationResult && verificationResult.checkoutImageData)) && (
                                      <div className="image-preview-section">
                                        <h5>Checkout Image</h5>
                                        <div className="image-preview">
                                          <img 
                                            src={booking.checkoutImageData || 
                                              bookingState.checkoutImageData || 
                                              (verificationResult && verificationResult.checkoutImageData)} 
                                            alt="Checkout Vehicle" 
                                            className="captured-image"
                                          />
                                        </div>
                                      </div>
                                    )}

                                    {verificationResult && (
                                      <div className={`verification-result ${verificationResult.isMatch ? 'verification-success' : 'verification-error'}`}>
                                        {verificationResult.isMatch ? (
                                          <div className="verification-success-content">
                                            <CheckCircle size={24} />
                                            <span>{verificationResult.message}</span>
                                          </div>
                                        ) : (
                                          <div className="verification-error-content">
                                            <AlertTriangle size={24} />
                                            <span>{verificationResult.message}</span>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {bookingState.webcamMode === 'zonepicker' && (
                                      <div className="zone-selection">
                                        <h5>Select Vehicle Zone</h5>
                                        {bookingState.checkinImageData && (
                                          <div className="vehicle-image-container">
                                            <img 
                                              src={bookingState.checkinImageData} 
                                              alt="Vehicle" 
                                              className="vehicle-image"
                                            />
                                          </div>
                                        )}
                                        <div className="zone-buttons">
                                          <button 
                                            className="zone-button zone-a"
                                            onClick={() => selectZone(booking.id, 'A')}
                                          >
                                            <Bike size={20} />
                                            <span>Zone A (Car)</span>
                                          </button>
                                          <button 
                                            className="zone-button zone-b"
                                            onClick={() => selectZone(booking.id, 'B')}
                                          >
                                            <Truck size={20} />
                                            <span>Zone B (Car)</span>
                                          </button>
                                          <button 
                                            className="zone-button zone-c"
                                            onClick={() => selectZone(booking.id, 'C')}
                                          >
                                            <Car size={20} />
                                            <span>Zone C (Car)</span>
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                    {bookingState.successMessage && !verificationResult && (
                                      <div className="success-message-card">
                                        {bookingState.successMessage}
                                      </div>
                                    )}

                                    {bookingState.checkinError && (
                                      <div className="error-message">
                                        {bookingState.successMessage}
                                      </div>
                                    )}

                                    {bookingState.checkoutError && (
                                      <div className="error-message">
                                        {bookingState.successMessage}
                                      </div>
                                    )}

                                    <div className="status-indicators">
                                      {isLastCheckedIn && (
                                        <div className="status-tag check-in-status">
                                          <CheckCircle size={14} />
                                          <span>Last Checked-in Booking</span>
                                        </div>
                                      )}
                                      
                                      <div className="status-tag firebase-status">
                                        <Activity size={14} />
                                        <span>Firebase Status: {previousStatus}</span>
                                      </div>
                                      
                                      <div className="status-tag action-status">
                                        {processingAction ? (
                                          <>
                                            <Activity size={14} className="spinning" />
                                            <span>Processing...</span>
                                          </>
                                        ) : previousStatus === 0 ? (
                                          <>
                                            <Clock size={14} />
                                            <span>Waiting for Firebase trigger (Status=1)</span>
                                          </>
                                        ) : (
                                          <>
                                            <CheckCircle size={14} />
                                            <span>Firebase triggered (Status=1)</span>
                                          </>
                                        )}
                                      </div>
                                    </div>

                                    {displayStatus === 'active' && 
                                     !hasCheckedIn && 
                                     !bookingState.webcamActive && 
                                     !isProcessingPayment && (
                                      <div className="status-pending">
                                        <Activity size={16} />
                                        <span>Waiting for automatic check-in...</span>
                                      </div>
                                    )}
                                    
                                    {displayStatus === 'active' && 
                                     hasCheckedIn && 
                                     !hasCheckedOut && 
                                     !bookingState.webcamActive && 
                                     !isProcessingPayment && 
                                     isLastCheckedIn && (
                                      <div className="status-pending">
                                        <Activity size={16} />
                                        <span>Waiting for automatic check-out...</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-activity">
                  <p>No recent activity to display</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
      
      <style jsx>{`
        .connection-status {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .firebase-status-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          background-color: #f0f4f8;
          padding: 4px 10px;
          border-radius: 16px;
          font-size: 14px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .firebase-status-indicator:hover {
          background-color: #e6edf5;
        }
        
        .firebase-status-indicator.status-active {
          background-color: #e6f7ee;
          color: #0d8a42;
        }
        
        .processing-badge {
          background-color: #f59e0b;
          color: white;
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 10px;
          margin-left: 6px;
        }
        
        .status-tag {
          display: flex;
          align-items: center;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          margin-right: 8px;
          margin-bottom: 4px;
          background-color: #f5f5f5;
          color: #333;
        }
        
        .status-indicators {
          display: flex;
          flex-wrap: wrap;
          margin-top: 12px;
          margin-bottom: 8px;
        }
        
        .check-in-status {
          background-color: #e6f7ee;
          color: #0d8a42;
        }
        
        .firebase-status {
          background-color: #e6f0f7;
          color: #2a7ab9;
        }
        
        .action-status {
          background-color: #f9f2e8;
          color: #b95a2a;
        }
        
        .spinning {
          animation: spin 1.5s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .status-pending {
          display: flex;
          align-items: center;
          margin-top: 12px;
          padding: 10px;
          background-color: #f5f7f9;
          border-radius: 6px;
          border-left: 3px solid #3b82f6;
        }
        
        .status-pending svg {
          margin-right: 8px;
          color: #3b82f6;
        }
        
        .status-pending span {
          font-size: 14px;
          color: #4b5563;
        }
      `}</style>
    </div>
  );
};

export default UsersList;