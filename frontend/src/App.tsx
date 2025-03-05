import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
// import { Practice } from './pages/Practice';
// import { PracticeResults } from './pages/PracticeResults';
import { CreateQuestion } from './pages/CreateQuestion';
// import { ExamsList } from './pages/ExamsList';
import { ExamStart } from './pages/ExamStart';
// import { ExamAttempt } from './pages/ExamAttempt';
// import { ExamResults } from './pages/ExamResults';
import { ClassroomManagement } from './pages/ClassroomManagement';
import { ClassroomDetails } from './pages/ClassroomDetails';
import { InviteStudents } from './pages/InviteStudents';
import { AssignmentCreation } from './pages/AssignmentCreation';
import { StudentProgressReport } from './pages/StudentProgressReport';
import { Unauthorized } from './pages/Unauthorized';
import { NotFound } from './pages/NotFound';
// import { UserProfile } from './pages/UserProfile';
// import { UserSettings } from './pages/UserSettings';
import { ActivityHistory } from './pages/ActivityHistory';
// import { PracticeSession } from './pages/PracticeSession';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Classrooms } from './pages/Classrooms';
import { Assignments } from './pages/Assignments';
// import Store from './pages/Store';
// import ProductDetail from './pages/ProductDetail';
import PurchaseSuccess from './pages/PurchaseSuccess';
// import UserPurchases from './pages/UserPurchases';
import AdminRoute from './components/AdminRoute';
// import AdminDashboard from './pages/AdminDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import { 
  AdminOverview, 
  AdminProducts, 
  AdminOrders, 
  AdminUsers, 
  AdminSettings 
} from './pages/AdminDashboard';
// import WellbeingSuitePage from './pages/WellbeingSuitePage';
import JournalPage from './pages/JournalPage';
// import StudySchedule from './pages/StudySchedule';
// import { getGlobalReact } from './utils/reactUtils';
import { fixAuthenticationIssues, debugAuth } from './utils/authUtils';
import './styles/App.css';
import './styles/Buttons.css';
import './styles/DarkMode.css';
import './styles/ThemeToggle.css';
import {
  authService,
  questionService,
  userService,
  examService,
  practiceService,
  progressService,
  classroomService,
  productService,
  studyScheduleService,
  wellbeingService,
  // isOfflineMode,
  checkBackendConnectivity,
  connectivityEventEmitter,
  CONNECTIVITY_CHANGE_EVENT
} from './services/api';
import { getDeviceType } from './utils/mobileDetection';
import { ThemeProvider } from './contexts/ThemeContext';
import YearGroupSelection from './pages/YearGroupSelection';
import SubjectPage from './pages/SubjectPage';
import FeaturesHome from './pages/FeaturesHome';
import Loading from './components/Loading';
import logger from './utils/logger';

// Lazy load larger components/pages
const StudyScheduleLazy = lazy(() => import('./pages/StudySchedule'));
const StoreLazy = lazy(() => import('./pages/Store'));
const AdminDashboardLazy = lazy(() => import('./pages/AdminDashboard'));
// const WellbeingSuiteLazy = lazy(() => import('./pages/WellbeingSuite'));
const ProductDetailLazy = lazy(() => import('./pages/ProductDetail'));
const UserPurchasesLazy = lazy(() => import('./pages/UserPurchases'));
const UserProfileLazy = lazy(() => import('./pages/UserProfile').then(module => ({ default: module.UserProfile })));
const UserSettingsLazy = lazy(() => import('./pages/UserSettings').then(module => ({ default: module.UserSettings })));
const PracticeLazy = lazy(() => import('./pages/Practice').then(module => ({ default: module.Practice })));
const PracticeSessionLazy = lazy(() => import('./pages/PracticeSession').then(module => ({ default: module.PracticeSession })));
const PracticeResultsLazy = lazy(() => import('./pages/PracticeResults').then(module => ({ default: module.PracticeResults })));
// const ExamsLazy = lazy(() => import('./pages/Exams'));
// const ExamDetailLazy = lazy(() => import('./pages/ExamDetail'));
const ExamAttemptLazy = lazy(() => import('./pages/ExamAttempt').then(module => ({ default: module.ExamAttempt })));
const ExamResultsLazy = lazy(() => import('./pages/ExamResults').then(module => ({ default: module.ExamResults })));

function App() {
  const [isOffline, setIsOffline] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [lastConnected, setLastConnected] = useState<Date | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Initialize authentication before anything else
  useEffect(() => {
    const initializeAuth = () => {
      logger.info('App: Initializing authentication');
      
      // Fix any potential authentication issues
      const fixesApplied = fixAuthenticationIssues();
      if (fixesApplied) {
        logger.info('App: Fixed authentication issues on startup');
      }
      
      // Debug the current authentication state
      const authState = debugAuth();
      logger.info('App: Initial auth state:', authState);
      
      setAuthInitialized(true);
    };
    
    initializeAuth();
  }, []);

  useEffect(() => {
    // Initialize connectivity checks when the app starts
    const deviceType = getDeviceType();
    const isMobileDevice = deviceType === 'mobile';
    
    // For mobile devices, run a more thorough connectivity check
    const initConnectivity = async () => {
      logger.info(`Initializing app on ${deviceType} device`);
      try {
        // Run initial connectivity check
        const isConnected = await checkBackendConnectivity(true);
        logger.info(`Initial connectivity check: ${isConnected ? 'Connected' : 'Disconnected'}`);
        
        // For mobile devices, schedule periodic connectivity checks
        if (isMobileDevice) {
          // Schedule periodic connectivity checks for mobile devices
          const checkInterval = setInterval(() => {
            checkBackendConnectivity(true).catch(err => {
              logger.warn('Periodic connectivity check failed:', err);
            });
          }, 60000); // Check every 60 seconds
          
          return () => clearInterval(checkInterval);
        }
      } catch (error) {
        logger.error('Error during initial connectivity check:', error);
      }
    };
    
    initConnectivity();
  }, []);

  useEffect(() => {
    // Function to check connectivity
    const checkConnectivity = async () => {
      try {
        const isConnected = await checkBackendConnectivity();
        if (isConnected) {
          setBackendStatus('connected');
          setLastConnected(new Date());
        } else {
          setBackendStatus('disconnected');
        }
      } catch (error) {
        logger.error('Connectivity check failed:', error);
        setBackendStatus('disconnected');
      }
    };

    // Check online/offline status
    const handleOnline = () => {
      logger.info('Browser is online');
      setIsOffline(false);
      checkConnectivity();
    };

    const handleOffline = () => {
      logger.info('Browser is offline');
      setIsOffline(true);
      setBackendStatus('disconnected');
    };

    // Handle backend connectivity changes
    const handleConnectivityChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { isOffline: newOfflineState } = customEvent.detail;
      setIsOffline(newOfflineState);
      setBackendStatus(newOfflineState ? 'disconnected' : 'connected');
      if (!newOfflineState) {
        setLastConnected(new Date());
      }
    };

    // Initial checks
    const initialCheck = async () => {
      setIsOffline(!navigator.onLine);
      await checkConnectivity();
    };
    
    initialCheck();

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    connectivityEventEmitter.addEventListener(CONNECTIVITY_CHANGE_EVENT, handleConnectivityChange);

    // Set up periodic connectivity checks (every 30 seconds)
    const intervalId = setInterval(checkConnectivity, 30000);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      connectivityEventEmitter.removeEventListener(CONNECTIVITY_CHANGE_EVENT, handleConnectivityChange);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <ThemeProvider>
      <div className="app app-container">
        {/* Only show offline banner when truly offline or backend is disconnected */}
        {(isOffline || backendStatus === 'disconnected') && (
          <div className="offline-banner">
            {isOffline 
              ? "You're offline. Some features may be unavailable." 
              : "Can't connect to the server. Please check your connection."}
          </div>
        )}
        <Header />
        <main className="main-content content-container">
          <ErrorBoundary>
            <Suspense fallback={<Loading message="Loading page..." />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/features" element={<FeaturesHome />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/store" element={<ProtectedRoute><StoreLazy /></ProtectedRoute>} />
                <Route path="/store/product/:id" element={<ProtectedRoute><ProductDetailLazy /></ProtectedRoute>} />
                <Route path="/purchase-success" element={<PurchaseSuccess />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/practice" element={
                  <ProtectedRoute>
                    <PracticeLazy />
                  </ProtectedRoute>
                } />
                <Route path="/practice/results/:sessionId" element={
                  <ProtectedRoute>
                    <PracticeResultsLazy />
                  </ProtectedRoute>
                } />
                <Route path="/questions/create" element={
                  <ProtectedRoute roles={['teacher', 'admin']}>
                    <CreateQuestion />
                  </ProtectedRoute>
                } />
                {/* <Route path="/exams" element={
                  <ProtectedRoute>
                    <ExamsLazy />
                  </ProtectedRoute>
                } /> */}
                <Route path="/exams/start/:examId" element={
                  <ProtectedRoute>
                    <ExamStart />
                  </ProtectedRoute>
                } />
                <Route path="/exams/attempt/:attemptId" element={
                  <ProtectedRoute>
                    <ExamAttemptLazy />
                  </ProtectedRoute>
                } />
                <Route path="/exams/results/:attemptId" element={
                  <ProtectedRoute>
                    <ExamResultsLazy />
                  </ProtectedRoute>
                } />
                <Route path="/classrooms" element={
                  <ProtectedRoute>
                    <Classrooms />
                  </ProtectedRoute>
                } />
                <Route path="/assignments" element={
                  <ProtectedRoute>
                    <Assignments />
                  </ProtectedRoute>
                } />
                <Route path="/classrooms/manage" element={
                  <ProtectedRoute roles={['teacher']}>
                    <ClassroomManagement />
                  </ProtectedRoute>
                } />
                <Route path="/classrooms/:id" element={
                  <ProtectedRoute roles={['teacher', 'student']}>
                    <ClassroomDetails />
                  </ProtectedRoute>
                } />
                <Route path="/classrooms/:id/invite" element={
                  <ProtectedRoute roles={['teacher']}>
                    <InviteStudents />
                  </ProtectedRoute>
                } />
                <Route path="/assignments/create" element={
                  <ProtectedRoute roles={['teacher']}>
                    <AssignmentCreation />
                  </ProtectedRoute>
                } />
                <Route path="/students/:studentId/progress" element={
                  <ProtectedRoute roles={['teacher', 'parent']}>
                    <StudentProgressReport />
                  </ProtectedRoute>
                } />
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <UserProfileLazy />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <UserSettingsLazy />
                  </ProtectedRoute>
                } />
                <Route path="/activity" element={
                  <ProtectedRoute>
                    <ActivityHistory />
                  </ProtectedRoute>
                } />
                <Route path="/practice/session/:sessionId" element={
                  <ProtectedRoute>
                    <PracticeSessionLazy />
                  </ProtectedRoute>
                } />
                <Route path="/exam1" element={<ExamStart />} />
                <Route path="/exam2" element={<ExamStart />} />
                <Route path="/exam3" element={<ExamStart />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/my-library" element={
                  <ProtectedRoute>
                    <UserPurchasesLazy />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminDashboardLazy />
                  </AdminRoute>
                }>
                  <Route index element={<AdminOverview />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
                {/* <Route path="/wellbeing" element={
                  <ProtectedRoute>
                    <WellbeingSuiteLazy />
                  </ProtectedRoute>
                } /> */}
                <Route path="/journal" element={
                  <ProtectedRoute>
                    <JournalPage />
                  </ProtectedRoute>
                } />
                <Route path="/study-schedule" element={
                  <ProtectedRoute>
                    <StudyScheduleLazy />
                  </ProtectedRoute>
                } />
                <Route path="/onboarding/year-group" element={
                  <ProtectedRoute>
                    <YearGroupSelection />
                  </ProtectedRoute>
                } />
                <Route path="/subjects/:subjectId" element={
                  <ProtectedRoute>
                    <SubjectPage />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;
