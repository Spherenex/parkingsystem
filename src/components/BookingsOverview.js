// // import React, { useState, useEffect } from 'react';
// // import { 
// //   collection, 
// //   query, 
// //   where, 
// //   orderBy, 
// //   limit, 
// //   getDocs 
// // } from 'firebase/firestore';
// // import { db } from '../firebase';
// // import { 
// //   Calendar, 
// //   Clock, 
// //   AlertCircle,
// //   MapPin,
// //   Car
// // } from 'lucide-react';
// // import '../styles/BookingsOverview.css';

// // const BookingsOverview = ({ bookings }) => {
// //   const [activeFilter, setActiveFilter] = useState('recent');
// //   const [filteredBookings, setFilteredBookings] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);
  
// //   useEffect(() => {
// //     filterBookings(activeFilter);
// //   }, [bookings, activeFilter]);
  
// //   const filterBookings = (filterType) => {
// //     setLoading(true);
    
// //     try {
// //       let filtered = [];
      
// //       switch (filterType) {
// //         case 'recent':
// //           filtered = [...bookings].sort((a, b) => {
// //             return new Date(b.bookingTime) - new Date(a.bookingTime);
// //           }).slice(0, 5);
// //           break;
          
// //         case 'active':
// //           filtered = bookings.filter(booking => booking.status === 'active')
// //             .sort((a, b) => {
// //               return new Date(b.bookingTime) - new Date(a.bookingTime);
// //             }).slice(0, 5);
// //           break;
          
// //         case 'completed':
// //           filtered = bookings.filter(booking => booking.status === 'completed')
// //             .sort((a, b) => {
// //               return new Date(b.bookingTime) - new Date(a.bookingTime);
// //             }).slice(0, 5);
// //           break;
          
// //         default:
// //           filtered = [...bookings].sort((a, b) => {
// //             return new Date(b.bookingTime) - new Date(a.bookingTime);
// //           }).slice(0, 5);
// //       }
      
// //       setFilteredBookings(filtered);
// //     } catch (err) {
// //       console.error("Error filtering bookings:", err);
// //       setError("Failed to filter bookings");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };
  
// //   const formatDate = (timestamp) => {
// //     if (!timestamp) return 'N/A';
    
// //     const date = new Date(timestamp);
// //     return date.toLocaleString('en-US', {
// //       month: 'short',
// //       day: 'numeric',
// //       year: 'numeric',
// //       hour: '2-digit',
// //       minute: '2-digit'
// //     });
// //   };
  
// //   return (
// //     <div className="bookings-overview">
// //       <div className="bookings-overview-header">
// //         <h3>Booking Activity</h3>
// //         <div className="booking-filters">
// //           <button 
// //             className={`filter-btn ${activeFilter === 'recent' ? 'active' : ''}`}
// //             onClick={() => setActiveFilter('recent')}
// //           >
// //             Recent
// //           </button>
// //           <button 
// //             className={`filter-btn ${activeFilter === 'active' ? 'active' : ''}`}
// //             onClick={() => setActiveFilter('active')}
// //           >
// //             Active
// //           </button>
// //           <button 
// //             className={`filter-btn ${activeFilter === 'completed' ? 'active' : ''}`}
// //             onClick={() => setActiveFilter('completed')}
// //           >
// //             Completed
// //           </button>
// //         </div>
// //       </div>
      
// //       {loading ? (
// //         <div className="loading-bookings">
// //           <div className="spinner"></div>
// //           <p>Loading bookings...</p>
// //         </div>
// //       ) : error ? (
// //         <div className="error-message">
// //           <AlertCircle size={24} />
// //           <p>{error}</p>
// //         </div>
// //       ) : filteredBookings.length === 0 ? (
// //         <div className="no-bookings">
// //           <AlertCircle size={32} />
// //           <p>No bookings found for the selected filter</p>
// //         </div>
// //       ) : (
// //         <div className="bookings-list">
// //           {filteredBookings.map((booking) => (
// //             <div key={booking.id} className="booking-item">
// //               <div className="booking-item-header">
// //                 <div className="parking-name">
// //                   <MapPin size={16} />
// //                   {booking.parkingLotName || 'Unknown Location'}
// //                 </div>
// //                 <div className={`booking-status ${booking.status}`}>
// //                   {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
// //                 </div>
// //               </div>
              
// //               <div className="booking-item-details">
// //                 <div className="booking-detail">
// //                   <Calendar size={14} />
// //                   <span>Booked: {formatDate(booking.bookingTime)}</span>
// //                 </div>
// //                 <div className="booking-detail">
// //                   <Clock size={14} />
// //                   <span>{formatDate(booking.startTime)} - {formatDate(booking.endTime)}</span>
// //                 </div>
// //                 <div className="booking-detail">
// //                   <Car size={14} />
// //                   <span>Space: #{booking.spaceId || 'N/A'}</span>
// //                 </div>
// //               </div>
              
// //               <div className="booking-item-footer">
// //                 <div className="booking-amount">₹{booking.amount || 0}</div>
// //                 <div className="booking-id">ID: {booking.bookingId || 'Unknown'}</div>
// //               </div>
// //             </div>
// //           ))}
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default BookingsOverview;



// import React, { useState, useEffect } from 'react';
// import { 
//   collection, 
//   query, 
//   where, 
//   orderBy, 
//   limit, 
//   getDocs,
//   doc,
//   updateDoc
// } from 'firebase/firestore';
// import { db, rtdb } from '../firebase';
// import { ref, set, get } from 'firebase/database';
// import { 
//   Calendar, 
//   Clock, 
//   AlertCircle,
//   MapPin,
//   Car,
//   RefreshCw,
//   CheckCircle
// } from 'lucide-react';
// import '../styles/BookingsOverview.css';

// const BookingsOverview = ({ bookings, onBookingsUpdated }) => {
//   const [activeFilter, setActiveFilter] = useState('recent');
//   const [filteredBookings, setFilteredBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState(null);
//   const [refreshSuccess, setRefreshSuccess] = useState(false);
  
//   useEffect(() => {
//     filterBookings(activeFilter);
//   }, [bookings, activeFilter]);
  
//   const filterBookings = (filterType) => {
//     setLoading(true);
    
//     try {
//       let filtered = [];
      
//       switch (filterType) {
//         case 'recent':
//           filtered = [...bookings].sort((a, b) => {
//             return new Date(b.bookingTime) - new Date(a.bookingTime);
//           }).slice(0, 5);
//           break;
          
//         case 'active':
//           filtered = bookings.filter(booking => booking.status === 'active')
//             .sort((a, b) => {
//               return new Date(b.bookingTime) - new Date(a.bookingTime);
//             }).slice(0, 5);
//           break;
          
//         case 'completed':
//           filtered = bookings.filter(booking => booking.status === 'completed')
//             .sort((a, b) => {
//               return new Date(b.bookingTime) - new Date(a.bookingTime);
//             }).slice(0, 5);
//           break;
          
//         case 'available':
//           filtered = bookings.filter(booking => booking.status === 'available')
//             .sort((a, b) => {
//               return new Date(b.bookingTime) - new Date(a.bookingTime);
//             }).slice(0, 5);
//           break;
          
//         default:
//           filtered = [...bookings].sort((a, b) => {
//             return new Date(b.bookingTime) - new Date(a.bookingTime);
//           }).slice(0, 5);
//       }
      
//       setFilteredBookings(filtered);
//     } catch (err) {
//       console.error("Error filtering bookings:", err);
//       setError("Failed to filter bookings");
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   const formatDate = (timestamp) => {
//     if (!timestamp) return 'N/A';
    
//     const date = new Date(timestamp);
//     return date.toLocaleString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };
  
//   const handleRefreshActivity = async () => {
//     setRefreshing(true);
//     setError(null);
//     setRefreshSuccess(false);
    
//     try {
//       // Get all occupied slots
//       const occupiedSlotsRef = ref(rtdb, 'occupied_slots');
//       const occupiedSlotsSnapshot = await get(occupiedSlotsRef);
//       let occupiedSlots = [];
      
//       if (occupiedSlotsSnapshot.exists()) {
//         try {
//           const slotsData = occupiedSlotsSnapshot.val();
//           occupiedSlots = Array.isArray(slotsData) ? 
//             slotsData : 
//             typeof slotsData === 'string' ? 
//               JSON.parse(slotsData) : 
//               [];
//         } catch (error) {
//           console.error("Error parsing occupied slots:", error);
//         }
//       }
      
//       // Release all occupied slots
//       if (occupiedSlots.length > 0) {
//         await set(occupiedSlotsRef, JSON.stringify([]));
        
//         // Reset connection status
//         const connectionRef = ref(rtdb, 'connection_status');
//         await set(connectionRef, 0);
//       }
      
//       // Update active bookings to available status
//       const updatedBookings = bookings.map(booking => {
//         if (booking.status === 'active') {
//           return { ...booking, status: 'available' };
//         }
//         return booking;
//       });
      
//       // If there's a callback to update the parent component, call it
//       if (onBookingsUpdated && typeof onBookingsUpdated === 'function') {
//         onBookingsUpdated(updatedBookings);
//       }
      
//       // Update filtered bookings
//       setFilteredBookings(prev => 
//         prev.map(booking => 
//           booking.status === 'active' 
//             ? { ...booking, status: 'available' } 
//             : booking
//         )
//       );
      
//       setRefreshSuccess(true);
      
//       // After 3 seconds, hide the success message
//       setTimeout(() => {
//         setRefreshSuccess(false);
//       }, 3000);
      
//     } catch (err) {
//       console.error("Error refreshing activity:", err);
//       setError("Failed to refresh bookings. Please try again.");
//     } finally {
//       setRefreshing(false);
//     }
//   };
  
//   return (
//     <div className="bookings-overview">
//       <div className="bookings-overview-header">
//         <div className="overview-title">
//           <h3>Booking Activity</h3>
//           {refreshSuccess && (
//             <div className="refresh-success">
//               <CheckCircle size={16} />
//               <span>Slots refreshed successfully!</span>
//             </div>
//           )}
//         </div>
        
//         <div className="header-actions">
//           <div className="booking-filters">
//             <button 
//               className={`filter-btn ${activeFilter === 'recent' ? 'active' : ''}`}
//               onClick={() => setActiveFilter('recent')}
//             >
//               Recent
//             </button>
//             <button 
//               className={`filter-btn ${activeFilter === 'active' ? 'active' : ''}`}
//               onClick={() => setActiveFilter('active')}
//             >
//               Active
//             </button>
//             <button 
//               className={`filter-btn ${activeFilter === 'completed' ? 'active' : ''}`}
//               onClick={() => setActiveFilter('completed')}
//             >
//               Completed
//             </button>
//             <button 
//               className={`filter-btn ${activeFilter === 'available' ? 'active' : ''}`}
//               onClick={() => setActiveFilter('available')}
//             >
//               Available
//             </button>
//           </div>
          
//           <button 
//             className={`refresh-button ${refreshing ? 'refreshing' : ''}`}
//             onClick={handleRefreshActivity}
//             disabled={refreshing}
//           >
//             <RefreshCw size={16} />
//             <span>{refreshing ? 'Refreshing...' : 'Refresh Slots'}</span>
//           </button>
//         </div>
//       </div>
      
//       {error && (
//         <div className="error-message">
//           <AlertCircle size={24} />
//           <p>{error}</p>
//         </div>
//       )}
      
//       {loading ? (
//         <div className="loading-bookings">
//           <div className="spinner"></div>
//           <p>Loading bookings...</p>
//         </div>
//       ) : filteredBookings.length === 0 ? (
//         <div className="no-bookings">
//           <AlertCircle size={32} />
//           <p>No bookings found for the selected filter</p>
//         </div>
//       ) : (
//         <div className="bookings-list">
//           {filteredBookings.map((booking) => (
//             <div key={booking.id} className="booking-item">
//               <div className="booking-item-header">
//                 <div className="parking-name">
//                   <MapPin size={16} />
//                   {booking.parkingLotName || 'Unknown Location'}
//                 </div>
//                 <div className={`booking-status ${booking.status}`}>
//                   {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
//                 </div>
//               </div>
              
//               <div className="booking-item-details">
//                 <div className="booking-detail">
//                   <Calendar size={14} />
//                   <span>Booked: {formatDate(booking.bookingTime)}</span>
//                 </div>
//                 <div className="booking-detail">
//                   <Clock size={14} />
//                   <span>{formatDate(booking.startTime)} - {formatDate(booking.endTime)}</span>
//                 </div>
//                 <div className="booking-detail">
//                   <Car size={14} />
//                   <span>Space: #{booking.spaceId || 'N/A'}</span>
//                 </div>
//               </div>
              
//               <div className="booking-item-footer">
//                 <div className="booking-amount">₹{booking.amount || 0}</div>
//                 <div className="booking-id">ID: {booking.bookingId || 'Unknown'}</div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default BookingsOverview;




// BookingsOverview.js - Complete Responsive Component
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db, rtdb } from '../firebase';
import { ref, set, get } from 'firebase/database';
import { 
  Calendar, 
  Clock, 
  AlertCircle,
  MapPin,
  Car,
  RefreshCw,
  CheckCircle,
  Activity,
  Filter,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import '../styles/BookingsOverview.css';  

const BookingsOverview = ({ bookings = [], onBookingsUpdated, screenSize }) => {
  // Filter state
  const [activeFilter, setActiveFilter] = useState('recent');
  const [filteredBookings, setFilteredBookings] = useState([]);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);
  
  // Performance state
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  const [filterPerformance, setFilterPerformance] = useState({});
  
  // Refs
  const containerRef = useRef(null);
  const refreshTimeoutRef = useRef(null);
  const filterTimeoutRef = useRef(null);
  const performanceRef = useRef({ filterStart: 0, renderStart: 0 });
  
  // Responsive state management
  const [responsiveState, setResponsiveState] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    showCompactView: false
  });

  // Update responsive state based on screen size
  useEffect(() => {
    if (screenSize) {
      setResponsiveState({
        isMobile: screenSize.isMobile || false,
        isTablet: screenSize.isTablet || false,
        isDesktop: screenSize.isDesktop || true,
        showCompactView: screenSize.isMobile || false
      });
    } else {
      // Fallback if screenSize not provided
      const updateResponsiveState = () => {
        const width = window.innerWidth;
        setResponsiveState({
          isMobile: width <= 767,
          isTablet: width >= 768 && width <= 1023,
          isDesktop: width >= 1024,
          showCompactView: width <= 767
        });
      };
      
      updateResponsiveState();
      window.addEventListener('resize', updateResponsiveState);
      return () => window.removeEventListener('resize', updateResponsiveState);
    }
  }, [screenSize]);

  // Auto-collapse filters on very small screens
  useEffect(() => {
    if (responsiveState.isMobile) {
      const width = window.innerWidth;
      setIsFilterCollapsed(width < 375); // Collapse on very small screens
    }
  }, [responsiveState.isMobile]);

  // Filter configuration
  const filterConfig = useMemo(() => [
    {
      id: 'recent',
      label: responsiveState.showCompactView ? 'Recent' : 'Recent',
      icon: <Clock size={16} />,
      color: 'primary'
    },
    {
      id: 'active',
      label: responsiveState.showCompactView ? 'Active' : 'Active',
      icon: <Activity size={16} />,
      color: 'success'
    },
    {
      id: 'completed',
      label: responsiveState.showCompactView ? 'Done' : 'Completed',
      icon: <CheckCircle size={16} />,
      color: 'info'
    },
    {
      id: 'available',
      label: responsiveState.showCompactView ? 'Free' : 'Available',
      icon: <Car size={16} />,
      color: 'warning'
    }
  ], [responsiveState.showCompactView]);

  // Optimized filter function with performance tracking
  const filterBookings = useCallback((filterType) => {
    performanceRef.current.filterStart = performance.now();
    setLoading(true);
    setError(null);
    
    try {
      let filtered = [];
      
      // Performance optimization: early return for empty bookings
      if (!bookings || bookings.length === 0) {
        setFilteredBookings([]);
        setLoading(false);
        return;
      }
      
      const sortByTime = (a, b) => {
        const timeA = new Date(a.bookingTime || 0).getTime();
        const timeB = new Date(b.bookingTime || 0).getTime();
        return timeB - timeA;
      };
      
      const limit = responsiveState.isMobile ? 3 : 
                   responsiveState.isTablet ? 4 : 6;
      
      switch (filterType) {
        case 'recent':
          filtered = [...bookings]
            .sort(sortByTime)
            .slice(0, limit);
          break;
          
        case 'active':
          filtered = bookings
            .filter(booking => 
              booking.status === 'active' || 
              booking.status === 'confirmed' ||
              booking.status === 'ongoing'
            )
            .sort(sortByTime)
            .slice(0, limit);
          break;
          
        case 'completed':
          filtered = bookings
            .filter(booking => 
              booking.status === 'completed' || 
              booking.status === 'finished'
            )
            .sort(sortByTime)
            .slice(0, limit);
          break;
          
        case 'available':
          filtered = bookings
            .filter(booking => 
              booking.status === 'available' || 
              booking.status === 'open'
            )
            .sort(sortByTime)
            .slice(0, limit);
          break;
          
        default:
          filtered = [...bookings]
            .sort(sortByTime)
            .slice(0, limit);
      }
      
      setFilteredBookings(filtered);
      
      // Performance tracking
      const filterTime = performance.now() - performanceRef.current.filterStart;
      setFilterPerformance(prev => ({
        ...prev,
        [filterType]: filterTime,
        lastFilter: filterType,
        timestamp: Date.now()
      }));
      
    } catch (err) {
      console.error("Error filtering bookings:", err);
      setError("Failed to filter bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [bookings, responsiveState]);

  // Effect to filter bookings when dependencies change
  useEffect(() => {
    // Debounced filtering for better performance
    clearTimeout(filterTimeoutRef.current);
    filterTimeoutRef.current = setTimeout(() => {
      filterBookings(activeFilter);
    }, 100);
    
    return () => clearTimeout(filterTimeoutRef.current);
  }, [bookings, activeFilter, filterBookings]);

  // Handle filter change with animation
  const handleFilterChange = useCallback((filterType) => {
    if (filterType === activeFilter) return;
    
    setActiveFilter(filterType);
    setLastUpdateTime(Date.now());
    
    // Add visual feedback for mobile
    if (responsiveState.isMobile && containerRef.current) {
      containerRef.current.style.transform = 'scale(0.98)';
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.style.transform = 'scale(1)';
        }
      }, 150);
    }
  }, [activeFilter, responsiveState.isMobile]);

  // Date formatting with responsive considerations
  const formatDate = useCallback((timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    
    // Responsive date formatting
    if (responsiveState.isMobile) {
      // More compact format for mobile
      if (diffHours < 1) return 'Now';
      if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
      if (diffDays < 7) return `${Math.floor(diffDays)}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      // Full format for larger screens
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: diffDays > 365 ? 'numeric' : undefined,
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }, [responsiveState.isMobile]);

  // Refresh activity with enhanced error handling
  const handleRefreshActivity = useCallback(async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    setError(null);
    setRefreshSuccess(false);
    
    try {
      // Get all occupied slots
      const occupiedSlotsRef = ref(rtdb, 'occupied_slots');
      const occupiedSlotsSnapshot = await get(occupiedSlotsRef);
      let occupiedSlots = [];
      
      if (occupiedSlotsSnapshot.exists()) {
        try {
          const slotsData = occupiedSlotsSnapshot.val();
          occupiedSlots = Array.isArray(slotsData) ? 
            slotsData : 
            typeof slotsData === 'string' ? 
              JSON.parse(slotsData) : 
              [];
        } catch (parseError) {
          console.error("Error parsing occupied slots:", parseError);
        }
      }
      
      // Release all occupied slots
      if (occupiedSlots.length > 0) {
        await set(occupiedSlotsRef, JSON.stringify([]));
        
        // Reset connection status
        const connectionRef = ref(rtdb, 'connection_status');
        await set(connectionRef, 0);
      }
      
      // Update active bookings to available status
      const updatedBookings = bookings.map(booking => {
        if (booking.status === 'active') {
          return { ...booking, status: 'available' };
        }
        return booking;
      });
      
      // Call parent update function if available
      if (onBookingsUpdated && typeof onBookingsUpdated === 'function') {
        onBookingsUpdated(updatedBookings);
      }
      
      // Update local filtered bookings
      setFilteredBookings(prev => 
        prev.map(booking => 
          booking.status === 'active' 
            ? { ...booking, status: 'available' } 
            : booking
        )
      );
      
      setRefreshSuccess(true);
      setLastUpdateTime(Date.now());
      
      // Auto-hide success message
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = setTimeout(() => {
        setRefreshSuccess(false);
      }, responsiveState.isMobile ? 2000 : 3000);
      
    } catch (err) {
      console.error("Error refreshing activity:", err);
      setError(
        responsiveState.isMobile 
          ? "Refresh failed. Try again." 
          : "Failed to refresh bookings. Please try again."
      );
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, bookings, onBookingsUpdated, responsiveState.isMobile]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      clearTimeout(refreshTimeoutRef.current);
      clearTimeout(filterTimeoutRef.current);
    };
  }, []);

  // Generate statistics for display
  const statistics = useMemo(() => {
    if (!bookings || bookings.length === 0) return null;
    
    const total = bookings.length;
    const active = bookings.filter(b => b.status === 'active').length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const available = bookings.filter(b => b.status === 'available').length;
    
    return { total, active, completed, available };
  }, [bookings]);

  // Render filter buttons
  const renderFilterButtons = () => (
    <div className="booking-filters" role="tablist" aria-label="Booking filters">
      {filterConfig.map((filter) => (
        <button
          key={filter.id}
          className={`filter-btn ${activeFilter === filter.id ? 'active' : ''}`}
          onClick={() => handleFilterChange(filter.id)}
          disabled={loading}
          role="tab"
          aria-selected={activeFilter === filter.id}
          aria-label={`Show ${filter.label.toLowerCase()} bookings`}
          title={responsiveState.isMobile ? filter.label : `Filter by ${filter.label.toLowerCase()}`}
        >
          {responsiveState.showCompactView && filter.icon}
          <span>{filter.label}</span>
        </button>
      ))}
    </div>
  );

  // Render booking item
  const renderBookingItem = useCallback((booking) => {
    const statusClass = booking.status || 'unknown';
    const amount = booking.amount || booking.paymentAmount || '80';
    const bookingId = booking.bookingId || booking.id || 'N/A';
    
    return (
      <div key={booking.id || Math.random()} className="booking-item">
        <div className="booking-item-header">
          <div className="parking-name">
            <MapPin size={responsiveState.isMobile ? 14 : 16} />
            <span>{booking.parkingLotName || 'Unknown Location'}</span>
          </div>
          <div className={`booking-status ${statusClass}`}>
            {statusClass.charAt(0).toUpperCase() + statusClass.slice(1)}
          </div>
        </div>
        
        <div className="booking-item-details">
          <div className="booking-detail">
            <Calendar size={responsiveState.isMobile ? 12 : 14} />
            <span>
              <strong>Booked:</strong> {formatDate(booking.bookingTime)}
            </span>
          </div>
          
          {!responsiveState.showCompactView && (
            <div className="booking-detail">
              <Clock size={14} />
              <span>
                <strong>Duration:</strong> {formatDate(booking.startTime)} - {formatDate(booking.endTime)}
              </span>
            </div>
          )}
          
          <div className="booking-detail">
            <Car size={responsiveState.isMobile ? 12 : 14} />
            <span>
              <strong>Space:</strong> #{booking.spaceId || 'N/A'}
            </span>
          </div>
        </div>
        
        <div className="booking-item-footer">
          <div className="booking-amount">
            ₹{amount}
          </div>
          <div className="booking-id">
            ID: {bookingId.toString().substring(0, responsiveState.isMobile ? 6 : 8)}
            {bookingId.toString().length > (responsiveState.isMobile ? 6 : 8) ? '...' : ''}
          </div>
        </div>
      </div>
    );
  }, [responsiveState, formatDate]);

  // Loading component
  const renderLoading = () => (
    <div className="loading-bookings">
      <div className="loading-spinner" aria-label="Loading bookings"></div>
      <p>{responsiveState.isMobile ? 'Loading...' : 'Loading bookings...'}</p>
    </div>
  );

  // Error component
  const renderError = () => (
    <div className="error-message" role="alert">
      <AlertCircle size={responsiveState.isMobile ? 20 : 24} />
      <p>{error}</p>
    </div>
  );

  // No bookings component
  const renderNoBookings = () => (
    <div className="no-bookings">
      <AlertCircle size={responsiveState.isMobile ? 28 : 32} />
      <h4>No bookings found</h4>
      <p>
        {responsiveState.isMobile 
          ? `No ${activeFilter} bookings to show.`
          : `No bookings found for the selected filter: ${activeFilter}.`
        }
      </p>
    </div>
  );

  return (
    <div 
      ref={containerRef}
      className="bookings-overview"
      role="region"
      aria-label="Bookings overview"
    >
      {/* Header Section */}
      <div className="bookings-overview-header">
        <div className="overview-title">
          <div className="overview-title-icon">
            <BarChart3 size={responsiveState.isMobile ? 16 : 20} />
          </div>
          <h3>
            {responsiveState.isMobile ? 'Bookings' : 'Booking Activity'}
          </h3>
          
          {/* Statistics Display */}
          {statistics && !responsiveState.showCompactView && (
            <div className="booking-stats" style={{
              display: 'flex',
              gap: 'var(--spacing-md)',
              marginLeft: 'var(--spacing-md)',
              fontSize: 'var(--font-xs)',
              color: 'var(--neutral-600)'
            }}>
              <span>Total: {statistics.total}</span>
              <span>Active: {statistics.active}</span>
            </div>
          )}
          
          {/* Success Message */}
          {refreshSuccess && (
            <div className="refresh-success" role="status" aria-live="polite">
              <CheckCircle size={16} />
              <span>
                {responsiveState.isMobile ? 'Updated!' : 'Slots refreshed successfully!'}
              </span>
            </div>
          )}
        </div>
        
        {/* Header Actions */}
        <div className="header-actions">
          {/* Filter Buttons */}
          {!isFilterCollapsed && renderFilterButtons()}
          
          {/* Collapsed Filter Indicator */}
          {isFilterCollapsed && (
            <button
              className="filter-toggle-btn"
              onClick={() => setIsFilterCollapsed(false)}
              aria-label="Show filters"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-xs)',
                padding: 'var(--spacing-sm)',
                background: 'var(--neutral-100)',
                border: '1px solid var(--neutral-200)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-xs)'
              }}
            >
              <Filter size={14} />
              {activeFilter}
            </button>
          )}
          
          {/* Refresh Button */}
          <button 
            className={`refresh-button ${refreshing ? 'refreshing' : ''}`}
            onClick={handleRefreshActivity}
            disabled={refreshing}
            aria-label={refreshing ? 'Refreshing bookings...' : 'Refresh bookings'}
          >
            <RefreshCw size={16} />
            <span>
              {responsiveState.isMobile 
                ? (refreshing ? 'Updating...' : 'Refresh')
                : (refreshing ? 'Refreshing...' : 'Refresh Slots')
              }
            </span>
          </button>
        </div>
      </div>
      
      {/* Error Display */}
      {error && renderError()}
      
      {/* Content Area */}
      {loading ? (
        renderLoading()
      ) : filteredBookings.length === 0 ? (
        renderNoBookings()
      ) : (
        <div 
          className="bookings-list"
          role="list"
          aria-label={`${filteredBookings.length} ${activeFilter} bookings`}
        >
          {filteredBookings.map(renderBookingItem)}
        </div>
      )}
      
      {/* Performance Metrics (Development Only) */}
      {process.env.NODE_ENV === 'development' && filterPerformance.lastFilter && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          fontFamily: 'monospace',
          zIndex: 1000
        }}>
          Filter: {filterPerformance[filterPerformance.lastFilter]?.toFixed(2)}ms
        </div>
      )}
    </div>
  );
};

export default BookingsOverview;