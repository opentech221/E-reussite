import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import PublicLayout from '@/components/layouts/PublicLayout';
import PrivateLayout from '@/components/layouts/PrivateLayout';
const Home = lazy(() => import('@/pages/Home'));
const CoursesPublic = lazy(() => import('@/pages/CoursesPublic'));
const CoursesPrivate = lazy(() => import('@/pages/CoursesPrivate'));
const CourseDetail = lazy(() => import('@/pages/CourseDetail'));
const Pricing = lazy(() => import('@/pages/Pricing'));
const About = lazy(() => import('@/pages/About'));
const Contact = lazy(() => import('@/pages/Contact'));
const Login = lazy(() => import('@/pages/Login'));
const Signup = lazy(() => import('@/pages/Signup'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Shop = lazy(() => import('@/pages/Shop'));
const Cart = lazy(() => import('@/pages/Cart'));
const Profile = lazy(() => import('@/pages/Profile'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const UpdatePassword = lazy(() => import('@/pages/UpdatePassword'));
const AdminLayout = lazy(() => import('@/components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminCourses = lazy(() => import('@/pages/admin/AdminCourses'));
const AdminProducts = lazy(() => import('@/pages/admin/AdminProducts'));
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';
const Quiz = lazy(() => import('@/pages/Quiz'));
const QuizList = lazy(() => import('@/pages/QuizList'));
const Exam = lazy(() => import('@/pages/Exam'));
const ExamList = lazy(() => import('@/pages/ExamList'));
const Leaderboard = lazy(() => import('@/pages/Leaderboard'));
const ChatbotPage = lazy(() => import('@/pages/ChatbotPage'));
const Challenges = lazy(() => import('@/pages/Challenges'));
const Badges = lazy(() => import('@/pages/Badges'));
const Progress = lazy(() => import('@/pages/Progress'));
const ActivityHistory = lazy(() => import('@/pages/ActivityHistory'));
const FAQ = lazy(() => import('@/pages/FAQ'));
const Help = lazy(() => import('@/pages/Help'));
const TestProgressionDebug = lazy(() => import('@/pages/TestProgressionDebug'));
const StudyPlan = lazy(() => import('@/pages/StudyPlan'));
const CoachIA = lazy(() => import('@/pages/CoachIA'));
const Settings = lazy(() => import('@/pages/Settings'));
const MySharedLinks = lazy(() => import('@/pages/MySharedLinks'));
const PaymentPage = lazy(() => import('@/pages/PaymentPage'));
import AIAssistantSidebar from '@/components/AIAssistantSidebar';
import ErrorBoundary from '@/components/ErrorBoundary';

function App() {
  console.log('🚀 [App] Application démarrée');
  
  return (
    <>
      <Toaster 
        position="top-right" 
        expand={true}
        richColors 
        closeButton
        duration={5000}
      />
      <Suspense fallback={null}>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout /> }>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<CoursesPublic />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/help" element={<Help />} />
          </Route>

          {/* Protected Routes for Authenticated Users */}
          <Route element={<ProtectedRoute /> }>
            <Route element={<PrivateLayout /> }>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/coach-ia" element={<CoachIA />} />
              <Route path="/my-courses" element={<CoursesPrivate />} />
              <Route path="/course/:matiereId" element={<CourseDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/quiz" element={<QuizList />} />
              <Route path="/quiz/:quizId" element={<Quiz />} />
              <Route path="/exam" element={<ExamList />} />
              <Route path="/exam/:examId" element={<Exam />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/chatbot" element={<ChatbotPage />} />
              <Route path="/challenges" element={<Challenges />} />
              <Route path="/badges" element={<Badges />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/historique" element={<ActivityHistory />} />
              <Route path="/study-plan" element={<StudyPlan />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/my-shared-links" element={<MySharedLinks />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/test-debug" element={<TestProgressionDebug />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminRoute /> }>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="products" element={<AdminProducts />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
      
      {/* Assistant IA avec ErrorBoundary pour éviter crash */}
      <ErrorBoundary componentName="AIAssistantSidebar">
        <AIAssistantSidebar />
      </ErrorBoundary>
    </>
  );
}

export default App;