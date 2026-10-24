import React, { useState, useEffect, useMemo } from 'react';
import { translations, TranslationStrings } from './i18n/translations';
import { PublicReview, ReviewStats } from './types';
import { fetchPublicReviews, checkAdminSession, adminSignOut } from './services/supabase';
import { LoadingScreen } from './components/layout/LoadingScreen';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { WhatsAppButton } from './components/common/WhatsAppButton';
import { HeroSection } from './components/sections/HeroSection';
import { AboutSection } from './components/sections/AboutSection';
import { ServicesSection } from './components/sections/ServicesSection';
import { WhyChooseUsSection } from './components/sections/WhyChooseUsSection';
import { EquipmentSpecsSection } from './components/sections/EquipmentSpecsSection';
import { CustomersSection } from './components/sections/CustomersSection';
import { ReviewsSection } from './components/sections/reviews/ReviewsSection';
import { ContactSection } from './components/sections/ContactSection';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';

export function App() {
  const [lang, setLang] = useState<string>(() => {
    try {
      return localStorage.getItem('site_lang') || 'en';
    } catch {
      return 'en';
    }
  });

  const [route, setRoute] = useState<'home' | 'admin'>(() => {
    return window.location.pathname.startsWith('/admin') || window.location.hash === '#admin' ? 'admin' : 'home';
  });

  const [adminAuth, setAdminAuth] = useState<{ authenticated: boolean; csrfToken: string }>({
    authenticated: false,
    csrfToken: '',
  });

  const [reviewsData, setReviewsData] = useState<{
    reviews: PublicReview[];
    stats: ReviewStats | null;
    featured: PublicReview | null;
    whatsappNumber: string;
  }>({
    reviews: [],
    stats: null,
    featured: null,
    // Consistent single source of truth (+91 86675 56619)
    whatsappNumber: '918667556619',
  });

  // Browser navigation popstate & hashchange listeners
  useEffect(() => {
    const handleNavigation = () => {
      const isAdmin = window.location.pathname.startsWith('/admin') || window.location.hash === '#admin';
      setRoute(isAdmin ? 'admin' : 'home');
    };
    window.addEventListener('popstate', handleNavigation);
    window.addEventListener('hashchange', handleNavigation);
    return () => {
      window.removeEventListener('popstate', handleNavigation);
      window.removeEventListener('hashchange', handleNavigation);
    };
  }, []);

  // Fetch initial public reviews from Supabase
  useEffect(() => {
    fetchPublicReviews()
      .then((data) => {
        setReviewsData({
          reviews: data.reviews,
          stats: data.stats,
          featured: data.featured,
          whatsappNumber: data.whatsappNumber,
        });
      })
      .catch((err) => console.error('Failed to load reviews from Supabase:', err));
  }, []);

  // Check admin session status if navigating to /admin
  useEffect(() => {
    if (route === 'admin') {
      checkAdminSession().then((isAuthenticated) => {
        if (isAuthenticated) {
          setAdminAuth({ authenticated: true, csrfToken: 'supabase-session' });
        }
      });
    }
  }, [route]);

  const handleLanguageChange = (newLang: string) => {
    setLang(newLang);
    try {
      localStorage.setItem('site_lang', newLang);
    } catch {
      // ignore
    }
  };

  const navigateTo = (newRoute: 'home' | 'admin') => {
    setRoute(newRoute);
    const path = newRoute === 'admin' ? '/admin' : '/';
    window.history.pushState({}, '', path);
  };

  const currentStrings: TranslationStrings = translations[lang] || translations.en;

  // STABILITY FIX: Memoize hero testimonials array so HeroSection does not reset timer on every render
  const heroTestimonials = useMemo(() => {
    return reviewsData.reviews.filter((r) => r.rating >= 4).slice(0, 5);
  }, [reviewsData.reviews]);

  if (route === 'admin') {
    if (!adminAuth.authenticated) {
      return (
        <AdminLogin
          onLoginSuccess={(csrfToken) => setAdminAuth({ authenticated: true, csrfToken })}
          onBackToSite={() => navigateTo('home')}
        />
      );
    }
    return (
      <AdminDashboard
        csrfToken={adminAuth.csrfToken}
        onLogout={async () => {
          await adminSignOut();
          setAdminAuth({ authenticated: false, csrfToken: '' });
        }}
        onBackToSite={() => navigateTo('home')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f8ff] text-[#10223a] flex flex-col font-sans">
      <LoadingScreen />

      <Header
        t={currentStrings}
        lang={lang}
        onLanguageChange={handleLanguageChange}
        onNavigateAdmin={() => navigateTo('admin')}
      />

      <main className="flex-1">
        <HeroSection t={currentStrings} featuredReviews={heroTestimonials} />
        <AboutSection t={currentStrings} />
        <ServicesSection t={currentStrings} />
        <WhyChooseUsSection t={currentStrings} />
        <EquipmentSpecsSection t={currentStrings} />
        <CustomersSection />
        <ReviewsSection
          t={currentStrings}
          initialReviews={reviewsData.reviews}
          initialStats={reviewsData.stats}
          initialFeatured={reviewsData.featured}
          whatsappNumber={reviewsData.whatsappNumber}
        />
        <ContactSection t={currentStrings} />
      </main>

      <Footer />
      <WhatsAppButton number={reviewsData.whatsappNumber} />
    </div>
  );
}

export default App;
