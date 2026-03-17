import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';

import Layout from './components/Layout/Layout';
import Backdrop from './components/Backdrop/Backdrop';
import Toolbar from './components/Toolbar/Toolbar';
import MainNavigation from './components/Navigation/MainNavigation/MainNavigation';
import MobileNavigation from './components/Navigation/MobileNavigation/MobileNavigation';
import ErrorHandler from './components/ErrorHandler/ErrorHandler';
import FeedPage from './pages/Feed/Feed';
import PersonalFeed from './pages/Feed/PersonalFeed';
import SinglePostPage from './pages/Feed/SinglePost/SinglePost';
import LoginPage from './pages/Auth/Login';
import SignupPage from './pages/Auth/Signup';
import Home from './pages/Home/Home';
import './App.css';

function App() {
   const [showBackdrop, setShowBackdrop] = useState(false);
   const [showMobileNav, setShowMobileNav] = useState(false);
   const [isAuth, setIsAuth] = useState(false);
   const [token, setToken] = useState(null);
   const [name, setName] = useState('');
   const [userId, setUserId] = useState(null);
   const [authLoading, setAuthLoading] = useState(false);
   const [error, setError] = useState(null);

   const navigate = useNavigate();

   const logoutHandler = useCallback(() => {
      setIsAuth(false);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('expiryDate');
      localStorage.removeItem('userId');
   }, []);

   const setAutoLogout = useCallback(
      (milliseconds) => {
         setTimeout(() => {
            logoutHandler();
         }, milliseconds);
      },
      [logoutHandler]
   );

   useEffect(() => {
      const storedToken = localStorage.getItem('token');
      const expiryDate = localStorage.getItem('expiryDate');
      if (!storedToken || !expiryDate) {
         return;
      }
      if (new Date(expiryDate) <= new Date()) {
         logoutHandler();
         return;
      }
      const storedUserId = localStorage.getItem('userId');
      const remainingMilliseconds = new Date(expiryDate).getTime() - new Date().getTime();
      setIsAuth(true);
      setToken(storedToken);
      setUserId(storedUserId);
      setAutoLogout(remainingMilliseconds);
   }, [logoutHandler, setAutoLogout]);

   const mobileNavHandler = (isOpen) => {
      setShowMobileNav(isOpen);
      setShowBackdrop(isOpen);
   };

   const backdropClickHandler = () => {
      setShowBackdrop(false);
      setShowMobileNav(false);
      setError(null);
   };

   const loginHandler = (event, authData) => {
      event.preventDefault();
      setAuthLoading(true);
      fetch('http://localhost:8000/auth/login', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            email: authData.email,
            password: authData.password
         })
      })
         .then((res) => {
            if (res.status === 422) {
               throw new Error('Validation failed.');
            }
            if (res.status !== 200 && res.status !== 201) {
               throw new Error('Could not authenticate you!');
            }
            return res.json();
         })
         .then((resData) => {
            setIsAuth(true);
            setToken(resData.token);
            setName(resData.name);
            setAuthLoading(false);
            setUserId(resData.userId);
            localStorage.setItem('token', resData.token);
            localStorage.setItem('userId', resData.userId);
            localStorage.setItem('name', resData.name);
            const remainingMilliseconds = 60 * 60 * 1000;
            const expiryDate = new Date(new Date().getTime() + remainingMilliseconds);
            localStorage.setItem('expiryDate', expiryDate.toISOString());
            setAutoLogout(remainingMilliseconds);
         })
         .catch((err) => {
            console.log(err);
            setIsAuth(false);
            setAuthLoading(false);
            setError(err);
         });
   };

   const signupHandler = (event, authData) => {
      event.preventDefault();
      setAuthLoading(true);
      fetch('http://localhost:8000/auth/signup', {
         method: 'PUT',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            name: authData.signupForm.name.value,
            email: authData.signupForm.email.value,
            password: authData.signupForm.password.value
         })
      })
         .then((res) => {
            if (res.status === 422) {
               throw new Error("Validation failed. Make sure the email address isn't used yet!");
            }
            if (res.status !== 200 && res.status !== 201) {
               throw new Error('Creating a user failed!');
            }
            return res.json();
         })
         .then(() => {
            setIsAuth(false);
            setAuthLoading(false);
            navigate('/login', { replace: true });
         })
         .catch((err) => {
            console.log(err);
            setIsAuth(false);
            setAuthLoading(false);
            setError(err);
         });
   };

   const errorHandler = () => {
      setError(null);
   };

   let routes;
   if (isAuth) {
      routes = (
         <Routes>
            <Route path="/" element={<Home />} />
            <Route
               path="/journals"
               element={<FeedPage userId={userId} token={token} name={name} />}
            />
            <Route path="/myjournals" element={<PersonalFeed userId={userId} token={token} />} />
            <Route
               path="/journals/:postId"
               element={<SinglePostPage userId={userId} token={token} />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
         </Routes>
      );
   } else {
      routes = (
         <Routes>
            <Route path="/" element={<Home />} />
            <Route
               path="/login"
               element={<LoginPage onLogin={loginHandler} loading={authLoading} />}
            />
            <Route
               path="/signup"
               element={<SignupPage onSignup={signupHandler} loading={authLoading} />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
         </Routes>
      );
   }

   return (
      <Fragment>
         {showBackdrop && <Backdrop onClick={backdropClickHandler} />}
         <ErrorHandler error={error} onHandle={errorHandler} />
         <Layout
            header={
               <Toolbar>
                  <MainNavigation
                     onOpenMobileNav={() => mobileNavHandler(true)}
                     onLogout={logoutHandler}
                     isAuth={isAuth}
                  />
               </Toolbar>
            }
            mobileNav={
               <MobileNavigation
                  open={showMobileNav}
                  mobile
                  onChooseItem={() => mobileNavHandler(false)}
                  onLogout={logoutHandler}
                  isAuth={isAuth}
               />
            }
         />
         {routes}
      </Fragment>
   );
}

export default App;
