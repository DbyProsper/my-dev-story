import { useContent, Copy } from '@/lib/content';
import { Github, Linkedin, Download, ArrowDown, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TypewriterText from './TypewriterText';

const HeroSection = () => {
  const content = useContent();
  const skills = useContent().hero.skills;

  const scrollToProjects = () => {
    const element = document.querySelector('#projects');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      className="relative min-h-screen pt-28 pb-24 flex items-center justify-center overflow-hidden"
      aria-label="Hero section"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,hsl(175_80%_50%_/_0.12)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,hsl(265_80%_65%_/_0.08)_0%,transparent_40%)]" />

      {/* Floating Code Elements */}
      <div className="absolute top-1/4 left-10 text-primary/20 animate-float" aria-hidden="true">
        <Code2 className="w-16 h-16" />
      </div>
      <div className="absolute bottom-1/4 right-10 text-accent/20 animate-float delay-300" aria-hidden="true">
        <Code2 className="w-12 h-12" />
      </div>

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
        aria-hidden="true"
      />

      <div className="container-narrow mx-auto px-4 md:px-8 relative z-10">
        <div className="grid lg:grid-cols-[1fr_0.72fr] items-center gap-12 lg:gap-16">
        <div className="text-center lg:text-left max-w-4xl mx-auto">
          {/* Terminal-style intro */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50 mb-8 animate-slide-up">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" aria-hidden="true" />
            <span className="font-mono text-sm text-muted-foreground"><Copy section="hero" field="portfolio" /><span className="text-primary"><Copy section="hero" field="whoami" /></span>
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 animate-slide-up delay-100">
            <span className="block text-foreground"><Copy section="hero" field="Hi_Im" /></span>
            <span className="block gradient-text mt-2">{content.profile.name}</span>
          </h1>

          {/* Typewriter Title */}
          <div className="text-xl sm:text-2xl md:text-3xl font-mono text-muted-foreground mb-8 h-12 animate-slide-up delay-200">
            <span className="text-primary/70">{'>'}</span>{' '}
            <TypewriterText
              texts={skills}
              typingSpeed={80}
              deletingSpeed={40}
              pauseDuration={1500}
            />
          </div>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed animate-slide-up delay-300"><Copy section="hero" field="FullStack_Developer_passionate_about_building" /></p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8 flex-wrap animate-slide-up delay-400">
            <Button
              variant="hero"
              size="xl"
              onClick={scrollToProjects}
              className="group"
            ><Copy section="hero" field="View_Projects" /><ArrowDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
            </Button>

            <div className="flex gap-3">
              <Button
                variant="heroOutline"
                size="lg"
                asChild
              >
                <a
                  href={content.profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit GitHub profile"
                >
                  <Github className="w-5 h-5" /><Copy section="hero" field="GitHub" /></a>
              </Button>

              <Button
                variant="heroOutline"
                size="lg"
                asChild
              >
                <a
                  href={content.profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit LinkedIn profile"
                >
                  <Linkedin className="w-5 h-5" /><Copy section="hero" field="LinkedIn" /></a>
              </Button>
            </div>
          </div>

          {/* Download CV */}
          <div className="animate-slide-up delay-500">
            <Button
              variant="ghost"
              size="lg"
              className="text-muted-foreground hover:text-foreground"
              asChild
            >
              <a href={content.profile.cvUrl} download={content.profile.cvFilename} aria-label="Download CV">
                <Download className="w-4 h-4" /><Copy section="hero" field="Download_CV" /></a>
            </Button>
          </div>
        </div>
        {content.hero.image && <div className="relative w-full max-w-[200px] sm:max-w-[260px] lg:max-w-sm mx-auto order-first lg:order-last">
          <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-primary/25 via-transparent to-accent/25 blur-xl" />
          <figure className="relative glass-card p-3 border-primary/30 rotate-2 hover:rotate-0 transition-transform duration-500">
            <div className="flex gap-1.5 px-2 pt-1 pb-3" aria-hidden="true"><span className="w-2 h-2 rounded-full bg-secondary" /><span className="w-2 h-2 rounded-full bg-accent" /><span className="w-2 h-2 rounded-full bg-primary" /></div>
            <img src={content.hero.image} alt={content.hero.imageAlt} style={{objectPosition:content.hero.imagePosition}} className="portfolio-image w-full h-auto object-contain rounded-lg" loading="eager" width={480} height={600} />
            <figcaption className="font-mono text-xs text-primary px-2 pt-4 pb-2">{content.profile.name}</figcaption>
          </figure>
        </div>}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
