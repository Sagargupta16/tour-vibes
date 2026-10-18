import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import RootLayout from '@/components/layout/root-layout';
import ProtectedRoute from '@/components/auth/protected-route';
import Home from '@/pages/home';

// Every page but the landing page is its own chunk, so the first paint only
// downloads Home; Leaflet loads only with the map page or the post form's picker
const Login = lazy(() => import('@/pages/login'));
const Signup = lazy(() => import('@/pages/signup'));
const Feed = lazy(() => import('@/pages/feed'));
const MyJournals = lazy(() => import('@/pages/my-journals'));
const SinglePost = lazy(() => import('@/pages/single-post'));
const MapPage = lazy(() => import('@/pages/map'));
const Profile = lazy(() => import('@/pages/profile'));
const NotFound = lazy(() => import('@/pages/not-found'));

export default function App() {
   return (
      <Routes>
         <Route element={<RootLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route element={<ProtectedRoute />}>
               <Route path="/journals" element={<Feed />} />
               <Route path="/journals/:postId" element={<SinglePost />} />
               <Route path="/myjournals" element={<MyJournals />} />
               <Route path="/map" element={<MapPage />} />
               <Route path="/profile" element={<Profile />} />
            </Route>
            <Route path="*" element={<NotFound />} />
         </Route>
      </Routes>
   );
}
