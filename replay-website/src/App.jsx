import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Editing from './pages/Editing';
import Profile from './pages/Profile';
import PurchasePage from './pages/Cart';
import ScrapbookStyle from './pages/ScrapbookStyle';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import Tutorial from './pages/Tutorial';
import Upload from './pages/Upload';
import VideoStyle from './pages/VideoStyle';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import Download from './pages/Download';
import FAQ from "./pages/FAQ"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Main pages */}
        <Route index element={<Home />} />
        <Route path="editing" element={<Editing />} />
        <Route path="profile" element={<Profile />} />
        <Route path="cart" element={<PurchasePage />} />
        <Route path="scrapbook-style" element={<ScrapbookStyle />} />
        <Route path="tutorial" element={<Tutorial />} />
        <Route path="upload" element={<Upload />} />
        <Route path="video-style" element={<VideoStyle />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="signin" element={<Signin />} />
        <Route path="signup" element={<Signup />} />
        <Route path="contact" element={<Contact />} />
        <Route path="download" element={<Download />} />
        <Route path="FAQ" element={<FAQ />} />

        {/* Footer-only pages */}
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="terms-of-service" element={<TermsOfService />} />
      </Route>
    </Routes>
  );
}

export default App;
