
// // AdminDashboard.js - Complete Responsive Component
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { 
//   LayoutDashboard, 
//   Settings, 
//   Users, 
//   FileText, 
//   BarChart3, 
//   LogOut, 
//   Bell, 
//   Shield,
//   Menu,
//   X,
//   Activity,
//   TrendingUp,
//   TrendingDown,
//   Car,
//   MapPin,
//   Clock
// } from 'lucide-react';
// import { rtdb, signOut } from '../firebase';
// import { ref, onValue, get, set, update } from 'firebase/database';
// import UsersList from './UsersList';
// import UserDetails from './UserDetails';
// import BookingsOverview from './BookingsOverview';
// import '../styles/AdminDashboard.css';

// const AdminDashboard = ({ currentUser, onLogout, allBookings }) => {
//   // Dashboard state
//   const [stats, setStats] = useState({
//     totalSpots: 50,
//     activeUsers: 0,
//     dailyRevenue: 0,
//     vacantSpots: 45,
//     occupiedSpots: 5,
//     reservedSpots: 0
//   });
  
//   const [recentActivity, setRecentActivity] = useState([]);
//   const [usersMap, setUsersMap] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [currentView, setCurrentView] = useState('dashboard');
//   const [parkingEnabled, setParkingEnabled] = useState(true);
  
//   // Responsive state
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [screenSize, setScreenSize] = useState({
//     width: window.innerWidth,
//     height: window.innerHeight,
//     isMobile: window.innerWidth <= 767,
//     isTablet: window.innerWidth >= 768 && window.innerWidth <= 1023,
//     isDesktop: window.innerWidth >= 1024
//   });
  
//   // Performance tracking
//   const [performanceMetrics, setPerformanceMetrics] = useState({
//     loadTime: 0,
//     renderTime: 0,
//     lastUpdate: Date.now()
//   });
  
//   // Refs
//   const sidebarRef = useRef(null);
//   const overlayRef = useRef(null);
//   const dashboardRef = useRef(null);
//   const resizeTimeout = useRef(null);
  
//   // Firebase listeners cleanup
//   const firebaseListeners = useRef([]);
  
//   // Handle screen resize
//   const handleResize = useCallback(() => {
//     clearTimeout(resizeTimeout.current);
//     resizeTimeout.current = setTimeout(() => {
//       const newWidth = window.innerWidth;
//       const newHeight = window.innerHeight;
      
//       setScreenSize(prev => ({
//         ...prev,
//         width: newWidth,
//         height: newHeight,
//         isMobile: newWidth <= 767,
//         isTablet: newWidth >= 768 && newWidth <= 1023,
//         isDesktop: newWidth >= 1024
//       }));
      
//       // Close mobile menu when resizing to desktop
//       if (newWidth >= 768 && isMobileMenuOpen) {
//         setIsMobileMenuOpen(false);
//       }
//     }, 150);
//   }, [isMobileMenuOpen]);
  
//   // Setup resize listener
//   useEffect(() => {
//     window.addEventListener('resize', handleResize);
//     window.addEventListener('orientationchange', handleResize);
    
//     return () => {
//       window.removeEventListener('resize', handleResize);
//       window.removeEventListener('orientationchange', handleResize);
//       clearTimeout(resizeTimeout.current);
//     };
//   }, [handleResize]);
  
//   // Mobile menu management
//   const toggleMobileMenu = useCallback(() => {
//     setIsMobileMenuOpen(prev => {
//       const newState = !prev;
      
//       // Prevent body scroll when menu is open
//       if (newState) {
//         document.body.style.overflow = 'hidden';
//         document.body.style.touchAction = 'none';
//       } else {
//         document.body.style.overflow = '';
//         document.body.style.touchAction = '';
//       }
      
//       return newState;
//     });
//   }, []);
  
//   const closeMobileMenu = useCallback(() => {
//     setIsMobileMenuOpen(false);
//     document.body.style.overflow = '';
//     document.body.style.touchAction = '';
//   }, []);
  
//   // Handle navigation
//   const handleNavigation = useCallback((view) => {
//     setCurrentView(view);
//     closeMobileMenu();
    
//     // Track navigation for analytics
//     console.log(`Navigation: ${view} - Screen: ${screenSize.isMobile ? 'Mobile' : screenSize.isTablet ? 'Tablet' : 'Desktop'}`);
//   }, [closeMobileMenu, screenSize]);
  
//   // Fetch users data
//   useEffect(() => {
//     const startTime = performance.now();
    
//     const usersRef = ref(rtdb, 'users');
//     const usersUnsubscribe = onValue(usersRef, (snapshot) => {
//       try {
//         if (snapshot.exists()) {
//           const usersData = snapshot.val();
//           setUsersMap(usersData);
          
//           // Update performance metrics
//           const renderTime = performance.now() - startTime;
//           setPerformanceMetrics(prev => ({
//             ...prev,
//             renderTime,
//             lastUpdate: Date.now()
//           }));
//         }
//       } catch (error) {
//         console.error("Error processing users data:", error);
//       }
//     }, (error) => {
//       console.error("Firebase users listener error:", error);
//     });

//     firebaseListeners.current.push(usersUnsubscribe);
//     return () => usersUnsubscribe();
//   }, []);

//   // Listen for parking enabled status
//   useEffect(() => {
//     const parkingEnabledRef = ref(rtdb, 'parking_enabled');
    
//     const parkingEnabledUnsubscribe = onValue(parkingEnabledRef, (snapshot) => {
//       try {
//         if (snapshot.exists()) {
//           setParkingEnabled(snapshot.val());
//         } else {
//           // Initialize in Firebase if it doesn't exist
//           set(parkingEnabledRef, true);
//           setParkingEnabled(true);
//         }
//       } catch (error) {
//         console.error("Error processing parking status:", error);
//       }
//     }, (error) => {
//       console.error("Firebase parking status listener error:", error);
//     });

//     firebaseListeners.current.push(parkingEnabledUnsubscribe);
//     return () => parkingEnabledUnsubscribe();
//   }, []);

//   // Dashboard data listeners
//   useEffect(() => {
//     if (currentView !== 'dashboard') return;

//     const statsRef = ref(rtdb, 'dashboardStats');
//     const statsUnsubscribe = onValue(statsRef, (snapshot) => {
//       try {
//         const data = snapshot.val();
//         if (data) {
//           setStats(prev => ({
//             ...prev,
//             totalSpots: data.totalSpots || 50,
//             activeUsers: data.activeUsers || 0,
//             dailyRevenue: data.dailyRevenue || 0,
//             vacantSpots: data.vacantSpots || 45,
//             occupiedSpots: data.occupiedSpots || 5,
//             reservedSpots: data.reservedSpots || 0
//           }));
//         }
//       } catch (error) {
//         console.error("Error processing stats data:", error);
//       }
//     }, (error) => {
//       console.error("Firebase stats listener error:", error);
//     });

//     const activitiesRef = ref(rtdb, 'recentActivities');
//     const activitiesUnsubscribe = onValue(activitiesRef, (snapshot) => {
//       try {
//         if (snapshot.exists()) {
//           const activitiesData = snapshot.val();
          
//           const activitiesArray = Object.entries(activitiesData).map(([id, activity]) => {
//             let userName = "User";
            
//             if (activity.userId && usersMap[activity.userId]) {
//               userName = usersMap[activity.userId].name || userName;
//             } else if (activity.user && activity.user !== "User") {
//               userName = activity.user;
//             }
            
//             return {
//               id,
//               user: userName,
//               userId: activity.userId || null,
//               action: activity.action,
//               time: activity.time,
//               timestamp: activity.timestamp || 0
//             };
//           });
          
//           // Sort by timestamp (newest first)
//           activitiesArray.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
//           setRecentActivity(activitiesArray.slice(0, 10)); // Show more activities
//         } else {
//           setRecentActivity([]);
//         }
//       } catch (error) {
//         console.error("Error processing activities data:", error);
//       } finally {
//         setLoading(false);
//       }
//     }, (error) => {
//       console.error("Firebase activities listener error:", error);
//       setLoading(false);
//     });

//     firebaseListeners.current.push(statsUnsubscribe, activitiesUnsubscribe);
    
//     return () => {
//       statsUnsubscribe();
//       activitiesUnsubscribe();
//     };
//   }, [currentView, usersMap]);

//   // Handle logout
//   const handleLogout = async () => {
//     try {
//       // Cleanup Firebase listeners
//       firebaseListeners.current.forEach(unsubscribe => {
//         if (typeof unsubscribe === 'function') {
//           unsubscribe();
//         }
//       });
      
//       // Clear body styles
//       document.body.style.overflow = '';
//       document.body.style.touchAction = '';
      
//       await signOut();
//       onLogout();
//     } catch (error) {
//       console.error("Logout error:", error);
//     }
//   };

//   // Toggle parking enabled status
//   const toggleParkingEnabled = async () => {
//     try {
//       const newStatus = !parkingEnabled;
//       const parkingEnabledRef = ref(rtdb, 'parking_enabled');
//       await set(parkingEnabledRef, newStatus);
//     } catch (error) {
//       console.error("Error toggling parking status:", error);
//     }
//   };

//   // Handle escape key
//   useEffect(() => {
//     const handleKeyDown = (event) => {
//       if (event.key === 'Escape' && isMobileMenuOpen) {
//         closeMobileMenu();
//       }
//     };

//     document.addEventListener('keydown', handleKeyDown);
//     return () => document.removeEventListener('keydown', handleKeyDown);
//   }, [isMobileMenuOpen, closeMobileMenu]);

//   // Handle click outside sidebar
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         isMobileMenuOpen &&
//         sidebarRef.current &&
//         !sidebarRef.current.contains(event.target) &&
//         screenSize.isMobile
//       ) {
//         closeMobileMenu();
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     document.addEventListener('touchstart', handleClickOutside);
    
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//       document.removeEventListener('touchstart', handleClickOutside);
//     };
//   }, [isMobileMenuOpen, closeMobileMenu, screenSize.isMobile]);

//   // Generate formatted stats with trends
//   const formattedStats = [
//     { 
//       title: 'Total Parking Spots', 
//       value: stats.totalSpots, 
//       change: '+4%', 
//       trend: 'up',
//       icon: <BarChart3 size={screenSize.isMobile ? 20 : 24} />,
//       color: 'primary'
//     },
//     { 
//       title: 'Vacant Spots', 
//       value: stats.vacantSpots, 
//       change: '+7%', 
//       trend: 'up',
//       icon: <Car size={screenSize.isMobile ? 20 : 24} />,
//       color: 'success'
//     },
//     { 
//       title: 'Occupied Spots', 
//       value: stats.occupiedSpots, 
//       change: '-12%', 
//       trend: 'down',
//       icon: <MapPin size={screenSize.isMobile ? 20 : 24} />,
//       color: 'warning'
//     },
//     { 
//       title: 'Daily Revenue', 
//       value: `₹${stats.dailyRevenue.toLocaleString()}`, 
//       change: '+23%', 
//       trend: 'up',
//       icon: <TrendingUp size={screenSize.isMobile ? 20 : 24} />,
//       color: 'info'
//     }
//   ];

//   // Navigation items
//   const navigationItems = [
//     {
//       id: 'dashboard',
//       label: 'Dashboard',
//       icon: <LayoutDashboard className="nav-icon" size={20} />,
//       view: 'dashboard'
//     },
//     {
//       id: 'users',
//       label: screenSize.isMobile ? 'Records' : 'Parking Records',
//       icon: <Users className="nav-icon" size={20} />,
//       view: 'users'
//     },
//     {
//       id: 'userProfiles',
//       label: screenSize.isMobile ? 'Profiles' : 'User Profiles',
//       icon: <FileText className="nav-icon" size={20} />,
//       view: 'userProfiles'
//     }
//   ];

//   // Render content based on current view
//   const renderContent = () => {
//     switch (currentView) {
//       case 'users':
//         return (
//           <UsersList 
//             onBack={() => handleNavigation('dashboard')} 
//             recentActivity={recentActivity}
//             screenSize={screenSize}
//           />
//         );
      
//       case 'userProfiles':
//         return (
//           <UserDetails 
//             userId={currentUser?.uid}
//             onBack={() => handleNavigation('dashboard')}
//             screenSize={screenSize}
//           />
//         );
      
//       case 'dashboard':
//       default:
//         return (
//           <main className="dashboard-content">
//             {loading ? (
//               <div className="loading-container">
//                 <div className="loading-spinner"></div>
//                 <p>Loading dashboard data...</p>
//               </div>
//             ) : (
//               <>
//                 {/* Stats Grid */}
//                 <div className="stats-grid">
//                   {formattedStats.map((stat, index) => (
//                     <div key={index} className={`stat-card stat-${stat.color}`}>
//                       <div className="stat-header">
//                         <div>
//                           <p className="stat-title">{stat.title}</p>
//                           <p className="stat-value">{stat.value}</p>
//                         </div>
//                         <div className="stat-icon">
//                           {stat.icon}
//                         </div>
//                       </div>
//                       <div className={`stat-change ${stat.trend === 'up' ? 'positive' : 'negative'}`}>
//                         {stat.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
//                         {stat.change} from last month
//                       </div>
//                     </div>
//                   ))}
//                 </div>
                
//                 {/* Dashboard Grid */}
//                 <div className="dashboard-grid">
//                   {/* Parking Status Card */}
//                   <div className="dashboard-card">
//                     <div className="card-header">
//                       <h2 className="card-title">
//                         <Activity size={24} />
//                         Parking Status
//                       </h2>
//                     </div>
//                     <div className="parking-status">
//                       <div className="status-container">
//                         <div className="status-item available">
//                           <p className="status-label">Available</p>
//                           <p className="status-count">{stats.vacantSpots}</p>
//                         </div>
//                         <div className="status-item occupied">
//                           <p className="status-label">Occupied</p>
//                           <p className="status-count">{stats.occupiedSpots}</p>
//                         </div>
//                         {!screenSize.isMobile && (
//                           <div className="status-item reserved">
//                             <p className="status-label">Reserved</p>
//                             <p className="status-count">{stats.reservedSpots}</p>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
                  
//                   {/* Recent Activity Card */}
//                   <div className="dashboard-card">
//                     <div className="card-header">
//                       <h2 className="card-title">
//                         <Clock size={24} />
//                         Recent Activity
//                       </h2>
//                       <div className="view-all" onClick={() => handleNavigation('users')}>
//                         View All
//                       </div>
//                     </div>
                    
//                     <div className="activity-list">
//                       {recentActivity.length > 0 ? (
//                         recentActivity.slice(0, screenSize.isMobile ? 3 : 5).map((activity) => (
//                           <div key={activity.id} className="activity-item">
//                             <div className="activity-avatar">
//                               {activity.user.charAt(0).toUpperCase()}
//                             </div>
//                             <div className="activity-details">
//                               <p className="activity-text">
//                                 <span className="activity-user">{activity.user}</span> {activity.action}
//                               </p>
//                               <p className="activity-time">{activity.time}</p>
//                             </div>
//                           </div>
//                         ))
//                       ) : (
//                         <div className="no-activity">
//                           <p>No recent activity to display</p>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
                
//                 {/* Bookings Overview */}
//                 {allBookings && (
//                   <BookingsOverview 
//                     bookings={allBookings} 
//                     screenSize={screenSize}
//                   />
//                 )}
                
//                 {/* Master Toggle */}
//                 <div className="master-toggle-container">
//                   <div className="master-toggle-content">
//                     <div className="master-toggle-label">
//                       <span>Parking System</span>
//                       <span className={`toggle-status ${parkingEnabled ? 'enabled' : 'disabled'}`}>
//                         {parkingEnabled ? 'Enabled' : 'Disabled'}
//                       </span>
//                     </div>
//                     <div 
//                       className={`master-toggle ${parkingEnabled ? 'on' : 'off'}`}
//                       onClick={toggleParkingEnabled}
//                       role="switch"
//                       aria-checked={parkingEnabled}
//                       aria-label={`Parking system is ${parkingEnabled ? 'enabled' : 'disabled'}`}
//                       tabIndex={0}
//                       onKeyDown={(e) => {
//                         if (e.key === 'Enter' || e.key === ' ') {
//                           e.preventDefault();
//                           toggleParkingEnabled();
//                         }
//                       }}
//                     >
//                       <div className="master-toggle-slider"></div>
//                     </div>
//                   </div>
//                 </div>
                
//                 {/* Performance Metrics (Development Only) */}
//                 {process.env.NODE_ENV === 'development' && (
//                   <div className="performance-metrics" style={{
//                     position: 'fixed',
//                     bottom: '10px',
//                     right: '10px',
//                     background: 'rgba(0, 0, 0, 0.8)',
//                     color: 'white',
//                     padding: '8px',
//                     borderRadius: '4px',
//                     fontSize: '12px',
//                     fontFamily: 'monospace',
//                     zIndex: 9999
//                   }}>
//                     <div>Render: {performanceMetrics.renderTime.toFixed(2)}ms</div>
//                     <div>Screen: {screenSize.width}x{screenSize.height}</div>
//                     <div>Device: {screenSize.isMobile ? 'Mobile' : screenSize.isTablet ? 'Tablet' : 'Desktop'}</div>
//                   </div>
//                 )}
//               </>
//             )}
//           </main>
//         );
//     }
//   };

//   return (
//     <div className="dashboard-container">
//       {/* Mobile Overlay */}
//       {isMobileMenuOpen && (
//         <div 
//           ref={overlayRef}
//           className="mobile-sidebar-overlay active"
//           onClick={closeMobileMenu}
//           aria-hidden="true"
//         />
//       )}

//       {/* Sidebar */}
//       <aside 
//         ref={sidebarRef}
//         className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}
//         aria-label="Main navigation"
//       >
//         <div className="sidebar-header">
//           <Shield className="sidebar-logo" size={24} />
//           <h1 className="sidebar-title">
//             {screenSize.isMobile ? 'Admin' : 'Parking Admin'}
//           </h1>
//         </div>
        
//         <nav className="sidebar-nav" role="navigation">
//           <div className="nav-section-title">
//             Main
//           </div>
          
//           {navigationItems.map((item) => (
//             <div
//               key={item.id}
//               className={`nav-item ${currentView === item.view ? 'active' : ''}`}
//               onClick={() => handleNavigation(item.view)}
//               role="button"
//               tabIndex={0}
//               aria-label={item.label}
//               onKeyDown={(e) => {
//                 if (e.key === 'Enter' || e.key === ' ') {
//                   e.preventDefault();
//                   handleNavigation(item.view);
//                 }
//               }}
//             >
//               {item.icon}
//               {item.label}
//             </div>
//           ))}
          
//           <div 
//             className="nav-item logout" 
//             onClick={handleLogout}
//             role="button"
//             tabIndex={0}
//             aria-label="Logout"
//             onKeyDown={(e) => {
//               if (e.key === 'Enter' || e.key === ' ') {
//                 e.preventDefault();
//                 handleLogout();
//               }
//             }}
//           >
//             <LogOut className="nav-icon" size={20} />
//             Logout
//           </div>
//         </nav>
//       </aside>
      
//       {/* Main Content */}
//       <div className="main-content">
//         {/* Header */}
//         <header className="dashboard-header">
//           <div className="header-left">
//             <button 
//               className="menu-button"
//               onClick={toggleMobileMenu}
//               aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
//               aria-expanded={isMobileMenuOpen}
//             >
//               {isMobileMenuOpen ? (
//                 <X className="menu-icon" />
//               ) : (
//                 <Menu className="menu-icon" />
//               )}
//             </button>
//             <h2 className="welcome-text">
//               Welcome back{screenSize.isMobile ? '' : `, ${currentUser?.name || 'Admin'}`}
//             </h2>
//           </div>
          
//           <div className="header-right">
//             <button 
//               className="notification-icon"
//               aria-label="Notifications"
//               onClick={() => {
//                 // Handle notifications
//                 console.log('Notifications clicked');
//               }}
//             >
//               <Bell size={20} />
//             </button>
            
//             <div className="user-profile">
//               <div className="avatar">
//                 {currentUser?.name?.charAt(0) || 'A'}
//               </div>
              
//               {/* Hide user info on mobile */}
//               {!screenSize.isMobile && (
//                 <div className="user-info">
//                   <p className="user-name">{currentUser?.name || 'Admin User'}</p>
//                   <p className="user-role">{currentUser?.email}</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </header>
        
//         {/* Dynamic Content */}
//         <div ref={dashboardRef}>
//           {renderContent()}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;




// AdminDashboard.js - Complete Responsive Component with Refresh Functionality
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  FileText, 
  BarChart3, 
  LogOut, 
  Bell, 
  Shield,
  Menu,
  X,
  Activity,
  TrendingUp,
  TrendingDown,
  Car,
  MapPin,
  Clock,
  RefreshCw,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { rtdb, signOut } from '../firebase';
import { ref, onValue, get, set, update, remove } from 'firebase/database';
import UsersList from './UsersList';
import UserDetails from './UserDetails';
import BookingsOverview from './BookingsOverview';
import '../styles/AdminDashboard.css';

const AdminDashboard = ({ currentUser, onLogout, allBookings }) => {
  // Dashboard state
  const [stats, setStats] = useState({
    totalSpots: 50,
    activeUsers: 0,
    dailyRevenue: 0,
    vacantSpots: 45,
    occupiedSpots: 5,
    reservedSpots: 0
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [parkingEnabled, setParkingEnabled] = useState(true);
  
  // Refresh functionality state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshStatus, setRefreshStatus] = useState('');
  const [showRefreshConfirm, setShowRefreshConfirm] = useState(false);
  
  // Responsive state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth <= 767,
    isTablet: window.innerWidth >= 768 && window.innerWidth <= 1023,
    isDesktop: window.innerWidth >= 1024
  });
  
  // Performance tracking
  const [performanceMetrics, setPerformanceMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    lastUpdate: Date.now()
  });
  
  // Refs
  const sidebarRef = useRef(null);
  const overlayRef = useRef(null);
  const dashboardRef = useRef(null);
  const resizeTimeout = useRef(null);
  const refreshTimeout = useRef(null);
  
  // Firebase listeners cleanup
  const firebaseListeners = useRef([]);
  
  // Handle screen resize
  const handleResize = useCallback(() => {
    clearTimeout(resizeTimeout.current);
    resizeTimeout.current = setTimeout(() => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      
      setScreenSize(prev => ({
        ...prev,
        width: newWidth,
        height: newHeight,
        isMobile: newWidth <= 767,
        isTablet: newWidth >= 768 && newWidth <= 1023,
        isDesktop: newWidth >= 1024
      }));
      
      // Close mobile menu when resizing to desktop
      if (newWidth >= 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    }, 150);
  }, [isMobileMenuOpen]);
  
  // Setup resize listener
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      clearTimeout(resizeTimeout.current);
      clearTimeout(refreshTimeout.current);
    };
  }, [handleResize]);
  
  // Mobile menu management
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => {
      const newState = !prev;
      
      // Prevent body scroll when menu is open
      if (newState) {
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';
      } else {
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
      }
      
      return newState;
    });
  }, []);
  
  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
  }, []);
  
  // Handle navigation
  const handleNavigation = useCallback((view) => {
    setCurrentView(view);
    closeMobileMenu();
    
    // Track navigation for analytics
    console.log(`Navigation: ${view} - Screen: ${screenSize.isMobile ? 'Mobile' : screenSize.isTablet ? 'Tablet' : 'Desktop'}`);
  }, [closeMobileMenu, screenSize]);
  
  // Refresh Activities and Reset System
  const refreshActivitiesAndReset = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    setRefreshStatus('Clearing recent activities...');
    
    try {
      // Step 1: Clear recent activities
      const activitiesRef = ref(rtdb, 'recentActivities');
      await remove(activitiesRef);
      console.log('✓ Recent activities cleared');
      
      setRefreshStatus('Resetting parking slots...');
      
      // Step 2: Reset all parking lots (assuming multiple lots)
      const lots = ['lot1', 'kengeri', 'metro']; // Add your lot IDs here
      
      for (const lotId of lots) {
        // Clear occupied slots for each lot
        const occupiedSlotsRef = ref(rtdb, `occupiedSlots/${lotId}`);
        await set(occupiedSlotsRef, JSON.stringify([]));
        
        // Reset parking spaces for each lot
        const spacesRef = ref(rtdb, `parkingSpaces/${lotId}/spaces`);
        const spacesSnapshot = await get(spacesRef);
        
        if (spacesSnapshot.exists()) {
          const spacesData = spacesSnapshot.val();
          const resetSpaces = {};
          
          Object.keys(spacesData).forEach(spaceKey => {
            resetSpaces[spaceKey] = {
              ...spacesData[spaceKey],
              occupied: false,
              bookings: []
            };
          });
          
          await set(spacesRef, resetSpaces);
        }
        
        // Reset parking status for each lot
        const statusRef = ref(rtdb, `parkingStatus/${lotId}`);
        await set(statusRef, {
          available: 3,
          occupied: 0,
          reserved: 0
        });
      }
      
      setRefreshStatus('Cancelling active bookings...');
      
      // Step 3: Cancel all active bookings
      const bookingsRef = ref(rtdb, 'bookings');
      const bookingsSnapshot = await get(bookingsRef);
      
      if (bookingsSnapshot.exists()) {
        const updates = {};
        bookingsSnapshot.forEach((childSnapshot) => {
          const booking = childSnapshot.val();
          if (booking.status === 'active' || booking.status === 'confirmed') {
            updates[`bookings/${childSnapshot.key}/status`] = 'cancelled';
            updates[`bookings/${childSnapshot.key}/cancelledAt`] = new Date().toISOString();
            updates[`bookings/${childSnapshot.key}/cancelledBy`] = 'admin_refresh';
          }
        });
        
        if (Object.keys(updates).length > 0) {
          await update(ref(rtdb), updates);
        }
      }
      
      setRefreshStatus('Resetting system counters...');
      
      // Step 4: Reset connection status and other counters
      const connectionRef = ref(rtdb, 'connection_status');
      await set(connectionRef, 0);
      
      // Reset occupied_slots (global)
      const globalOccupiedSlotsRef = ref(rtdb, 'occupied_slots');
      await set(globalOccupiedSlotsRef, JSON.stringify([]));
      
      // Step 5: Update dashboard stats
      setStats(prev => ({
        ...prev,
        vacantSpots: 45,
        occupiedSpots: 0,
        reservedSpots: 0
      }));
      
      setRefreshStatus('System reset complete!');
      console.log('✓ All parking data reset successfully');
      
      // Show success message
      refreshTimeout.current = setTimeout(() => {
        setRefreshStatus('');
        setIsRefreshing(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error refreshing system:', error);
      setRefreshStatus('Error occurred during refresh');
      
      refreshTimeout.current = setTimeout(() => {
        setRefreshStatus('');
        setIsRefreshing(false);
      }, 3000);
    }
  };
  
  // Handle refresh confirmation
  const handleRefreshClick = () => {
    if (screenSize.isMobile) {
      // On mobile, directly refresh without confirmation
      refreshActivitiesAndReset();
    } else {
      // On desktop, show confirmation
      setShowRefreshConfirm(true);
    }
  };
  
  const confirmRefresh = () => {
    setShowRefreshConfirm(false);
    refreshActivitiesAndReset();
  };
  
  const cancelRefresh = () => {
    setShowRefreshConfirm(false);
  };
  
  // Fetch users data
  useEffect(() => {
    const startTime = performance.now();
    
    const usersRef = ref(rtdb, 'users');
    const usersUnsubscribe = onValue(usersRef, (snapshot) => {
      try {
        if (snapshot.exists()) {
          const usersData = snapshot.val();
          setUsersMap(usersData);
          
          // Update performance metrics
          const renderTime = performance.now() - startTime;
          setPerformanceMetrics(prev => ({
            ...prev,
            renderTime,
            lastUpdate: Date.now()
          }));
        }
      } catch (error) {
        console.error("Error processing users data:", error);
      }
    }, (error) => {
      console.error("Firebase users listener error:", error);
    });

    firebaseListeners.current.push(usersUnsubscribe);
    return () => usersUnsubscribe();
  }, []);

  // Listen for parking enabled status
  useEffect(() => {
    const parkingEnabledRef = ref(rtdb, 'parking_enabled');
    
    const parkingEnabledUnsubscribe = onValue(parkingEnabledRef, (snapshot) => {
      try {
        if (snapshot.exists()) {
          setParkingEnabled(snapshot.val());
        } else {
          // Initialize in Firebase if it doesn't exist
          set(parkingEnabledRef, true);
          setParkingEnabled(true);
        }
      } catch (error) {
        console.error("Error processing parking status:", error);
      }
    }, (error) => {
      console.error("Firebase parking status listener error:", error);
    });

    firebaseListeners.current.push(parkingEnabledUnsubscribe);
    return () => parkingEnabledUnsubscribe();
  }, []);

  // Dashboard data listeners
  useEffect(() => {
    if (currentView !== 'dashboard') return;

    const statsRef = ref(rtdb, 'dashboardStats');
    const statsUnsubscribe = onValue(statsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          setStats(prev => ({
            ...prev,
            totalSpots: data.totalSpots || 50,
            activeUsers: data.activeUsers || 0,
            dailyRevenue: data.dailyRevenue || 0,
            vacantSpots: data.vacantSpots || 45,
            occupiedSpots: data.occupiedSpots || 5,
            reservedSpots: data.reservedSpots || 0
          }));
        }
      } catch (error) {
        console.error("Error processing stats data:", error);
      }
    }, (error) => {
      console.error("Firebase stats listener error:", error);
    });

    const activitiesRef = ref(rtdb, 'recentActivities');
    const activitiesUnsubscribe = onValue(activitiesRef, (snapshot) => {
      try {
        if (snapshot.exists()) {
          const activitiesData = snapshot.val();
          
          const activitiesArray = Object.entries(activitiesData).map(([id, activity]) => {
            let userName = "User";
            
            if (activity.userId && usersMap[activity.userId]) {
              userName = usersMap[activity.userId].name || userName;
            } else if (activity.user && activity.user !== "User") {
              userName = activity.user;
            }
            
            return {
              id,
              user: userName,
              userId: activity.userId || null,
              action: activity.action,
              time: activity.time,
              timestamp: activity.timestamp || 0
            };
          });
          
          // Sort by timestamp (newest first)
          activitiesArray.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          setRecentActivity(activitiesArray.slice(0, 10)); // Show more activities
        } else {
          setRecentActivity([]);
        }
      } catch (error) {
        console.error("Error processing activities data:", error);
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error("Firebase activities listener error:", error);
      setLoading(false);
    });

    firebaseListeners.current.push(statsUnsubscribe, activitiesUnsubscribe);
    
    return () => {
      statsUnsubscribe();
      activitiesUnsubscribe();
    };
  }, [currentView, usersMap]);

  // Handle logout
  const handleLogout = async () => {
    try {
      // Cleanup Firebase listeners
      firebaseListeners.current.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
      
      // Clear body styles
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      
      await signOut();
      onLogout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Toggle parking enabled status
  const toggleParkingEnabled = async () => {
    try {
      const newStatus = !parkingEnabled;
      const parkingEnabledRef = ref(rtdb, 'parking_enabled');
      await set(parkingEnabledRef, newStatus);
    } catch (error) {
      console.error("Error toggling parking status:", error);
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (showRefreshConfirm) {
          cancelRefresh();
        } else if (isMobileMenuOpen) {
          closeMobileMenu();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen, showRefreshConfirm, closeMobileMenu]);

  // Handle click outside sidebar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobileMenuOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        screenSize.isMobile
      ) {
        closeMobileMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobileMenuOpen, closeMobileMenu, screenSize.isMobile]);

  // Generate formatted stats with trends
  const formattedStats = [
    { 
      title: 'Total Parking Spots', 
      value: stats.totalSpots, 
      change: '+4%', 
      trend: 'up',
      icon: <BarChart3 size={screenSize.isMobile ? 20 : 24} />,
      color: 'primary'
    },
    { 
      title: 'Vacant Spots', 
      value: stats.vacantSpots, 
      change: '+7%', 
      trend: 'up',
      icon: <Car size={screenSize.isMobile ? 20 : 24} />,
      color: 'success'
    },
    { 
      title: 'Occupied Spots', 
      value: stats.occupiedSpots, 
      change: '-12%', 
      trend: 'down',
      icon: <MapPin size={screenSize.isMobile ? 20 : 24} />,
      color: 'warning'
    },
    { 
      title: 'Daily Revenue', 
      value: `₹${stats.dailyRevenue.toLocaleString()}`, 
      change: '+23%', 
      trend: 'up',
      icon: <TrendingUp size={screenSize.isMobile ? 20 : 24} />,
      color: 'info'
    }
  ];

  // Navigation items
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="nav-icon" size={20} />,
      view: 'dashboard'
    },
    {
      id: 'users',
      label: screenSize.isMobile ? 'Records' : 'Parking Records',
      icon: <Users className="nav-icon" size={20} />,
      view: 'users'
    },
    {
      id: 'userProfiles',
      label: screenSize.isMobile ? 'Profiles' : 'User Profiles',
      icon: <FileText className="nav-icon" size={20} />,
      view: 'userProfiles'
    }
  ];

  // Render content based on current view
  const renderContent = () => {
    switch (currentView) {
      case 'users':
        return (
          <UsersList 
            onBack={() => handleNavigation('dashboard')} 
            recentActivity={recentActivity}
            screenSize={screenSize}
          />
        );
      
      case 'userProfiles':
        return (
          <UserDetails 
            userId={currentUser?.uid}
            onBack={() => handleNavigation('dashboard')}
            screenSize={screenSize}
          />
        );
      
      case 'dashboard':
      default:
        return (
          <main className="dashboard-content">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading dashboard data...</p>
              </div>
            ) : (
              <>
                {/* Refresh Confirmation Modal */}
                {showRefreshConfirm && (
                  <div className="modal-overlay" onClick={cancelRefresh}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                      <div className="modal-header">
                        <AlertCircle size={24} style={{ color: '#f59e0b' }} />
                        <h3>Confirm System Reset</h3>
                      </div>
                      <div className="modal-body">
                        <p>This action will:</p>
                        <ul>
                          <li>Clear all recent activities</li>
                          <li>Reset all parking slots to available</li>
                          <li>Cancel all active bookings</li>
                          <li>Reset system counters</li>
                        </ul>
                        <p><strong>This action cannot be undone.</strong></p>
                      </div>
                      <div className="modal-actions">
                        <button 
                          className="btn btn-secondary" 
                          onClick={cancelRefresh}
                          disabled={isRefreshing}
                        >
                          Cancel
                        </button>
                        <button 
                          className="btn btn-danger" 
                          onClick={confirmRefresh}
                          disabled={isRefreshing}
                        >
                          <Trash2 size={16} style={{ marginRight: '8px' }} />
                          Reset System
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Refresh Status Banner */}
                {(isRefreshing || refreshStatus) && (
                  <div className={`refresh-status-banner ${refreshStatus.includes('complete') ? 'success' : refreshStatus.includes('Error') ? 'error' : 'loading'}`}>
                    <div className="refresh-status-content">
                      {isRefreshing && !refreshStatus.includes('complete') && !refreshStatus.includes('Error') ? (
                        <RefreshCw size={20} className="spinning" />
                      ) : refreshStatus.includes('complete') ? (
                        <CheckCircle size={20} />
                      ) : refreshStatus.includes('Error') ? (
                        <AlertCircle size={20} />
                      ) : null}
                      <span>{refreshStatus}</span>
                    </div>
                  </div>
                )}

                {/* Stats Grid */}
                <div className="stats-grid">
                  {formattedStats.map((stat, index) => (
                    <div key={index} className={`stat-card stat-${stat.color}`}>
                      <div className="stat-header">
                        <div>
                          <p className="stat-title">{stat.title}</p>
                          <p className="stat-value">{stat.value}</p>
                        </div>
                        <div className="stat-icon">
                          {stat.icon}
                        </div>
                      </div>
                      <div className={`stat-change ${stat.trend === 'up' ? 'positive' : 'negative'}`}>
                        {stat.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        {stat.change} from last month
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Dashboard Grid */}
                <div className="dashboard-grid">
                  {/* Parking Status Card */}
                  <div className="dashboard-card">
                    <div className="card-header">
                      <h2 className="card-title">
                        <Activity size={24} />
                        Parking Status
                      </h2>
                    </div>
                    <div className="parking-status">
                      <div className="status-container">
                        <div className="status-item available">
                          <p className="status-label">Available</p>
                          <p className="status-count">{stats.vacantSpots}</p>
                        </div>
                        <div className="status-item occupied">
                          <p className="status-label">Occupied</p>
                          <p className="status-count">{stats.occupiedSpots}</p>
                        </div>
                        {!screenSize.isMobile && (
                          <div className="status-item reserved">
                            <p className="status-label">Reserved</p>
                            <p className="status-count">{stats.reservedSpots}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Recent Activity Card */}
                  <div className="dashboard-card">
                    <div className="card-header">
                      <h2 className="card-title">
                        <Clock size={24} />
                        Recent Activity
                      </h2>
                      <div className="header-actions">
                        <button
                          className={`refresh-button ${isRefreshing ? 'refreshing' : ''}`}
                          onClick={handleRefreshClick}
                          disabled={isRefreshing}
                          title="Clear all activities and reset parking system"
                          aria-label="Refresh and reset system"
                        >
                          <RefreshCw 
                            size={18} 
                            className={isRefreshing ? 'spinning' : ''} 
                          />
                          {!screenSize.isMobile && (
                            <span>{isRefreshing ? 'Resetting...' : 'Reset'}</span>
                          )}
                        </button>
                        <div className="view-all" onClick={() => handleNavigation('users')}>
                          View All
                        </div>
                      </div>
                    </div>
                    
                    <div className="activity-list">
                      {recentActivity.length > 0 ? (
                        recentActivity.slice(0, screenSize.isMobile ? 3 : 5).map((activity) => (
                          <div key={activity.id} className="activity-item">
                            <div className="activity-avatar">
                              {activity.user.charAt(0).toUpperCase()}
                            </div>
                            <div className="activity-details">
                              <p className="activity-text">
                                <span className="activity-user">{activity.user}</span> {activity.action}
                              </p>
                              <p className="activity-time">{activity.time}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-activity">
                          <Activity size={48} style={{ color: '#9ca3af', marginBottom: '12px' }} />
                          <p>No recent activity to display</p>
                          <p className="no-activity-subtitle">All parking slots are available for booking</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Bookings Overview */}
                {allBookings && (
                  <BookingsOverview 
                    bookings={allBookings} 
                    screenSize={screenSize}
                  />
                )}
                
                {/* Master Toggle */}
                <div className="master-toggle-container">
                  <div className="master-toggle-content">
                    <div className="master-toggle-label">
                      <span>Parking System</span>
                      <span className={`toggle-status ${parkingEnabled ? 'enabled' : 'disabled'}`}>
                        {parkingEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div 
                      className={`master-toggle ${parkingEnabled ? 'on' : 'off'}`}
                      onClick={toggleParkingEnabled}
                      role="switch"
                      aria-checked={parkingEnabled}
                      aria-label={`Parking system is ${parkingEnabled ? 'enabled' : 'disabled'}`}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleParkingEnabled();
                        }
                      }}
                    >
                      <div className="master-toggle-slider"></div>
                    </div>
                  </div>
                </div>
                
                {/* Performance Metrics (Development Only) */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="performance-metrics" style={{
                    position: 'fixed',
                    bottom: '10px',
                    right: '10px',
                    background: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    padding: '8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    zIndex: 9999
                  }}>
                    <div>Render: {performanceMetrics.renderTime.toFixed(2)}ms</div>
                    <div>Screen: {screenSize.width}x{screenSize.height}</div>
                    <div>Device: {screenSize.isMobile ? 'Mobile' : screenSize.isTablet ? 'Tablet' : 'Desktop'}</div>
                  </div>
                )}
              </>
            )}
          </main>
        );
    }
  };

  return (
    <div className="dashboard-container">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          ref={overlayRef}
          className="mobile-sidebar-overlay active"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        ref={sidebarRef}
        className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}
        aria-label="Main navigation"
      >
        <div className="sidebar-header">
          <Shield className="sidebar-logo" size={24} />
          <h1 className="sidebar-title">
            {screenSize.isMobile ? 'Admin' : 'Parking Admin'}
          </h1>
        </div>
        
        <nav className="sidebar-nav" role="navigation">
          <div className="nav-section-title">
            Main
          </div>
          
          {navigationItems.map((item) => (
            <div
              key={item.id}
              className={`nav-item ${currentView === item.view ? 'active' : ''}`}
              onClick={() => handleNavigation(item.view)}
              role="button"
              tabIndex={0}
              aria-label={item.label}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleNavigation(item.view);
                }
              }}
            >
              {item.icon}
              {item.label}
            </div>
          ))}
          
          <div 
            className="nav-item logout" 
            onClick={handleLogout}
            role="button"
            tabIndex={0}
            aria-label="Logout"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleLogout();
              }
            }}
          >
            <LogOut className="nav-icon" size={20} />
            Logout
          </div>
        </nav>
      </aside>
      
      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <button 
              className="menu-button"
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="menu-icon" />
              ) : (
                <Menu className="menu-icon" />
              )}
            </button>
            <h2 className="welcome-text">
              Welcome back{screenSize.isMobile ? '' : `, ${currentUser?.name || 'Admin'}`}
            </h2>
          </div>
          
          <div className="header-right">
            <button 
              className="notification-icon"
              aria-label="Notifications"
              onClick={() => {
                // Handle notifications
                console.log('Notifications clicked');
              }}
            >
              <Bell size={20} />
            </button>
            
            <div className="user-profile">
              <div className="avatar">
                {currentUser?.name?.charAt(0) || 'A'}
              </div>
              
              {/* Hide user info on mobile */}
              {!screenSize.isMobile && (
                <div className="user-info">
                  <p className="user-name">{currentUser?.name || 'Admin User'}</p>
                  <p className="user-role">{currentUser?.email}</p>
                </div>
              )}
            </div>
          </div>
        </header>
        
        {/* Dynamic Content */}
        <div ref={dashboardRef}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;