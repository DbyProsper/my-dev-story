import { useEffect, useRef, useState } from 'react';
import { Rocket, Code, Lightbulb, Trophy, Zap } from 'lucide-react';

interface MilestoneProps {
  year: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isVisible: boolean;
  index: number;
}

const Milestone = ({ year, title, description, icon, isVisible, index }: MilestoneProps) => {
  const isEven = index % 2 === 0;
  
  return (
    <div 
      className={`relative flex items-center gap-4 md:gap-8 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
    >
      {/* Content Card */}
      <div 
        className={`flex-1 glass-card p-6 hover-lift transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-x-0' : `opacity-0 ${isEven ? '-translate-x-8' : 'translate-x-8'}`
        }`}
        style={{ transitionDelay: `${index * 150}ms` }}
      >
        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-mono text-sm mb-3">
          {year}
        </span>
        <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>

      {/* Timeline Node */}
      <div 
        className={`hidden md:flex absolute left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-card border-2 border-primary items-center justify-center text-primary z-10 transition-all duration-500 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
        style={{ transitionDelay: `${index * 150}ms` }}
      >
        {icon}
      </div>

      {/* Spacer for alternating layout */}
      <div className="hidden md:block flex-1" />
    </div>
  );
};

const JourneySection = () => {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const sectionRef = useRef<HTMLElement>(null);

  const milestones = [
    {
      year: '2019',
      title: 'The Spark',
      description: 'Wrote my first "Hello World" and got hooked, Was in grade 10 doing IT as a subject at highschool. What started as curiosity became a passion that would change everything.',
      icon: <Lightbulb className="w-6 h-6" />,
    },
    {
      year: '2021',
      title: 'Deep Dive',
      description: 'Finished matric, Started learning HTML, CSS, and JavaScript. Built countless projects, broke things, fixed them, and learned the beauty of clean code.',
      icon: <Code className="w-6 h-6" />,
    },
    {
      year: '2022',
      title: 'Framework Era',
      description: 'Went into Varsity for my first year in Bsc Computer science and physics, Discovered React and fell in love with component-based architecture. Started building demo applications to learn more.',
      icon: <Rocket className="w-6 h-6" />,
    },
    {
      year: '2023',
      title: 'Full-Stack Journey',
      description: 'While traversing through university curricula, I Expanded into backend development with Node.js and databases. Understanding the full picture made me a better developer.',
      icon: <Zap className="w-6 h-6" />,
    },
    {
      year: '2024+',
      title: 'Continuous Growth',
      description: 'Now focused on performance, accessibility, and clean architecture. Every day is a new opportunity to learn and create.',
      icon: <Trophy className="w-6 h-6" />,
    },
  ];

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
  }, []);

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
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-mono text-sm mb-4">
            {'<journey />'}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            My Programming <span className="gradient-text">Journey</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From curious beginner to passionate developer — every line of code has been a step forward.
          </p>
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
