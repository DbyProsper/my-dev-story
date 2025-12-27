import { useEffect, useRef, useState } from 'react';
import { 
  Sparkles, 
  Code2, 
  Zap, 
  Users, 
  BookOpen, 
  MessageSquare,
  CheckCircle2
} from 'lucide-react';

interface ValueCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  isVisible: boolean;
  delay: number;
}

const ValueCard = ({ icon, title, description, color, isVisible, delay }: ValueCardProps) => (
  <div 
    className={`glass-card p-6 hover-lift transition-all duration-500 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}
    style={{ transitionDelay: `${delay}ms` }}
  >
    <div 
      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
      style={{ backgroundColor: `${color}15` }}
    >
      <span style={{ color }}>{icon}</span>
    </div>
    <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
  </div>
);

const WhyHireMeSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const values = [
    {
      icon: <Code2 className="w-6 h-6" />,
      title: 'Clean Code Advocate',
      description: 'I write code that\'s not just functional, but maintainable and scalable. Every line serves a purpose.',
      color: 'hsl(175, 80%, 50%)',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Performance Obsessed',
      description: 'Speed matters. I optimize every component to ensure lightning-fast load times and smooth interactions.',
      color: 'hsl(45, 90%, 50%)',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'User-First Mindset',
      description: 'Beautiful interfaces mean nothing without great UX. I design with empathy and accessibility in mind.',
      color: 'hsl(265, 80%, 65%)',
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: 'Continuous Learner',
      description: 'Technology evolves fast. I stay current with modern practices and love exploring new tools and frameworks.',
      color: 'hsl(15, 90%, 60%)',
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Clear Communicator',
      description: 'Technical concepts shouldn\'t be confusing. I bridge the gap between complex code and clear explanations.',
      color: 'hsl(200, 80%, 50%)',
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'Problem Solver',
      description: 'Challenges excite me. I approach every bug and feature with curiosity and persistence until it\'s solved.',
      color: 'hsl(320, 80%, 55%)',
    },
  ];

  const highlights = [
    'Strong foundation in modern JavaScript/TypeScript',
    'Experience with production-level React applications',
    'Understanding of backend development and databases',
    'Passionate about accessibility and web standards',
    'Excellent debugging and problem-solving skills',
    'Comfortable working in agile team environments',
  ];

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
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-mono text-sm mb-4">
            {'<hire-me />'}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Why <span className="gradient-text">Hire Me</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            I bring more than technical skills — I bring dedication, creativity, and a genuine passion for building great software.
          </p>
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
          <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
            What I Bring to the Table
          </h3>
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
          <p className="text-lg text-muted-foreground italic leading-relaxed">
            "I believe great software is built by people who care deeply about their craft. 
            I'm not just looking for a job — I'm looking for a team where I can grow, 
            contribute, and build something meaningful together."
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhyHireMeSection;
