import { useContent } from '@/lib/content';
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
  const content = useContent();
  return (
    <>
      <Helmet>
        <title>{content.seo.title}</title>
        <meta name="description" content={content.seo.description} />
        <meta name="keywords" content={content.seo.keywords} />
        <meta property="og:title" content={content.seo.title} />
        <meta property="og:description" content={content.seo.description} />
        <meta property="og:image" content={content.hero.image} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        {content.seo.canonicalUrl && <link rel="canonical" href={content.seo.canonicalUrl} />}
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
          {content.hero.visible && <HeroSection />}
          {content.journey.visible && <JourneySection />}
          {content.skills.visible && <SkillsSection />}
          {content.projects.visible && <ProjectsSection />}
          {content.hire.visible && <WhyHireMeSection />}
          {content.contact.visible && <ContactSection />}
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Index;
