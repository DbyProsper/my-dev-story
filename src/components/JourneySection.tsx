import { useContent, Copy, ContentIcon, SectionImage } from '@/lib/content';
import { useEffect, useRef, useState } from 'react';


interface MilestoneProps {
  image: string;
  imageAlt: string;
  year: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isVisible: boolean;
  index: number;
}

const Milestone = ({ year, title, description, icon, image, imageAlt, isVisible, index }: MilestoneProps) => {
  const isEven = index % 2 === 0;

  return (
    <div
      className={`relative flex items-center gap-4 md:gap-8 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
    >
      {/* Content Card */}
      <div
        className={`min-w-0 flex-1 glass-card p-6 hover-lift transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-x-0' : `opacity-0 ${isEven ? '-translate-x-8' : 'translate-x-8'}`
        }`}
        style={{ transitionDelay: `${index * 150}ms` }}
      >
        {image && <div className="group mb-4 h-48 sm:h-56 overflow-hidden rounded-lg bg-muted/30"><img src={image} alt={imageAlt} loading="lazy" className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none" /></div>}
        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-mono text-sm mb-3">
          {year}
        </span>
        <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>

      {/* Timeline Node */}
      <div
        className={`hidden md:flex absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-card border-2 border-primary items-center justify-center text-primary z-10 transition-all duration-500 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
        style={{ transitionDelay: `${index * 150}ms` }}
      >
        {icon}
      </div>

      {/* Spacer for alternating layout */}
      <div className="hidden md:block min-w-0 flex-1" />
    </div>
  );
};

const JourneySection = () => {
  const content = useContent();
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const sectionRef = useRef<HTMLElement>(null);

  const milestones = useContent().journey.milestones.map(item => ({ ...item, icon: <ContentIcon name={item.icon} /> }));

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.getAttribute('data-index') || '0');
          if (entry.isIntersecting) {
            setVisibleItems((prev) => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.2, rootMargin: '-50px' }
    );

    const items = sectionRef.current?.querySelectorAll('[data-index]');
    items?.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [milestones.length]);

  return (
    <section
      ref={sectionRef}
      id="journey"
      className="section-padding relative overflow-hidden"
      aria-label="My programming journey"
    >
      {/* Background accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_0%_50%,hsl(175_80%_50%_/_0.05)_0%,transparent_50%)]" />

      <div className="container-narrow mx-auto relative">
        <SectionImage section="journey" />
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-mono text-sm mb-4">
            {content.journey.eyebrow}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4"><Copy section="journey" field="My_Programming" /><span className="gradient-text"><Copy section="journey" field="Journey" /></span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto"><Copy section="journey" field="From_curious_beginner_to_passionate" /></p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />

          {/* Milestones */}
          <div className="space-y-12 md:space-y-16">
            {milestones.map((milestone, index) => (
              <div key={index} data-index={index}>
                <Milestone
                  {...milestone}
                  index={index}
                  isVisible={visibleItems.has(index)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default JourneySection;
