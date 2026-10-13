import { useContent, Copy, ContentIcon, SectionImage } from '@/lib/content';
import { useEffect, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ValueCardProps {
  icon: React.ReactNode;
  image: string;
  imageAlt: string;
  title: string;
  description: string;
  color: string;
  isVisible: boolean;
  delay: number;
}

const ValueCard = ({ icon, title, description, color, image, imageAlt, isVisible, delay }: ValueCardProps) => (
  <div
    className={`glass-card p-6 hover-lift transition-all duration-500 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}
    style={{ transitionDelay: `${delay}ms` }}
  >
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
      style={{ backgroundColor: color }}
    >
      <span className="text-background">{icon}</span>
    </div>
    {image && <img src={image} alt={imageAlt} loading="lazy" className="portfolio-image w-full h-auto object-contain rounded-lg mb-4" />}
    <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
  </div>
);

const WhyHireMeSection = () => {
  const content = useContent();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const values = useContent().hire.values.map(item => ({ ...item, icon: <ContentIcon name={item.icon} /> }));

  const highlights = useContent().hire.highlights;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hire-me"
      className="section-padding relative overflow-hidden"
      aria-label="Why hire me"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_0%_100%,hsl(265_80%_65%_/_0.08)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_100%_0%,hsl(175_80%_50%_/_0.05)_0%,transparent_50%)]" />

      <div className="container-narrow mx-auto relative">
        <SectionImage section="hire" />
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-mono text-sm mb-4">
            {content.hire.eyebrow}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4"><Copy section="hire" field="Why" /><span className="gradient-text"><Copy section="hire" field="Hire_Me" /></span><Copy section="hire" field="label" /></h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto"><Copy section="hire" field="I_bring_more_than_technical" /></p>
        </div>

        {/* Value Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {values.map((value, index) => (
            <ValueCard
              key={value.title}
              {...value}
              isVisible={isVisible}
              delay={index * 100}
            />
          ))}
        </div>

        {/* Highlights */}
        <div
          className={`glass-card p-8 md:p-10 transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '600ms' }}
        >
          <h3 className="text-2xl font-bold text-foreground mb-6 text-center"><Copy section="hire" field="What_I_Bring_to_the" /></h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {highlights.map((highlight, index) => (
              <div
                key={index}
                className="flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{highlight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Personal Note */}
        <div
          className={`text-center mt-12 max-w-2xl mx-auto transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '700ms' }}
        >
          <p className="text-lg text-muted-foreground italic leading-relaxed"><Copy section="hire" field="I_believe_great_software_is" /></p>
        </div>
      </div>
    </section>
  );
};

export default WhyHireMeSection;
