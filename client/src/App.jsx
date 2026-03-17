import { Routes, Route } from 'react-router-dom';
import RootLayout from '@/components/layout/root-layout';
import ProtectedRoute from '@/components/auth/protected-route';
import Home from '@/pages/home';
import Login from '@/pages/login';
import Signup from '@/pages/signup';
import Feed from '@/pages/feed';
import MyJournals from '@/pages/my-journals';
import SinglePost from '@/pages/single-post';
import Profile from '@/pages/profile';
import NotFound from '@/pages/not-found';

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
               <Route path="/profile" element={<Profile />} />
            </Route>
            <Route path="*" element={<NotFound />} />
         </Route>
      </Routes>
   );
}
