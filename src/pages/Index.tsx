import { Helmet } from 'react-helmet-async';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import JourneySection from '@/components/JourneySection';
import SkillsSection from '@/components/SkillsSection';
import ProjectsSection from '@/components/ProjectsSection';
import WhyHireMeSection from '@/components/WhyHireMeSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Prosper Masuku | Full-Stack Developer Portfolio</title>
        <meta 
          name="description" 
          content="Full-Stack Developer specializing in React, TypeScript, and Node.js. Building beautiful, accessible, and high-performance web applications." 
        />
        <meta name="keywords" content="full-stack developer, React developer, TypeScript, Node.js, web developer, software engineer" />
        <meta property="og:title" content="Your Name | Full-Stack Developer Portfolio" />
        <meta property="og:description" content="Full-Stack Developer specializing in React, TypeScript, and Node.js." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://yourwebsite.com" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
        >
          Skip to main content
        </a>
        
        <Navigation />
        
        <main id="main-content">
          <HeroSection />
          <JourneySection />
          <SkillsSection />
          <ProjectsSection />
          <WhyHireMeSection />
          <ContactSection />
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Index;
