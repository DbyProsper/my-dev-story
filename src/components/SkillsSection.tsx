import { useContent, Copy, ContentIcon, SectionImage } from '@/lib/content';
import { useState, useEffect, useRef } from 'react';


interface SkillCardProps {
  image: string;
  imageAlt: string;
  name: string;
  level: number;
  icon: React.ReactNode;
  color: string;
  isVisible: boolean;
  delay: number;
}

const SkillCard = ({ name, level, icon, color, image, imageAlt, isVisible, delay }: SkillCardProps) => {
  const [animatedLevel, setAnimatedLevel] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => setAnimatedLevel(level), delay);
    return () => clearTimeout(timer);
  }, [isVisible, level, delay]);

  return (
    <div
      className={`glass-card p-5 hover-lift group cursor-pointer transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {image && <img src={image} alt={imageAlt} loading="lazy" className="portfolio-image w-full h-auto object-contain rounded-lg mb-4" />}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
          style={{ backgroundColor: `${color}20` }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-foreground">{name}</h4>
          <span className="text-sm text-muted-foreground">{animatedLevel}<Copy section="skills" field="label" /></span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${animatedLevel}%`,
            background: `linear-gradient(90deg, ${color}, ${color}dd)`
          }}
        />
      </div>
    </div>
  );
};

interface SkillCategoryProps {
  image: string;
  imageAlt: string;
  title: string;
  icon: React.ReactNode;
  skills: Array<{ name: string; level: number; icon: React.ReactNode; color: string; image: string; imageAlt: string }>;
  isVisible: boolean;
  baseDelay: number;
}

const SkillCategory = ({ title, icon, skills, image, imageAlt, isVisible, baseDelay }: SkillCategoryProps) => (
  <div className="space-y-6">
    {image && <img src={image} alt={imageAlt} loading="lazy" className="portfolio-image w-full h-auto object-contain rounded-lg" />}
    <div className="flex items-center gap-3">
      <span className="text-primary">{icon}</span>
      <h3 className="text-xl font-bold text-foreground">{title}</h3>
    </div>
    <div className="grid gap-4">
      {skills.map((skill, index) => (
        <SkillCard
          key={skill.name}
          {...skill}
          isVisible={isVisible}
          delay={baseDelay + index * 100}
        />
      ))}
    </div>
  </div>
);

const SkillsSection = () => {
  const content = useContent();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const categories = useContent().skills.categories.map(item => ({ ...item, icon: <ContentIcon name={item.icon} />, skills: item.skills.map(skill => ({ ...skill, icon: <ContentIcon name={skill.icon} /> })) }));

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
      id="skills"
      className="section-padding relative overflow-hidden"
      aria-label="Technical skills"
    >
      {/* Background accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_100%_0%,hsl(265_80%_65%_/_0.05)_0%,transparent_50%)]" />

      <div className="container-narrow mx-auto relative">
        <SectionImage section="skills" />
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent font-mono text-sm mb-4">
            {content.skills.eyebrow}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4"><Copy section="skills" field="Tech" /><span className="gradient-text-accent"><Copy section="skills" field="Stack" /></span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto"><Copy section="skills" field="The_technologies_I_use_to" /></p>
        </div>

        {/* Skills Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {categories.map((category, catIndex) => (
            <SkillCategory
              key={category.title}
              {...category}
              isVisible={isVisible}
              baseDelay={catIndex * 200}
            />
          ))}
        </div>

        {/* Additional Skills Cloud */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4"><Copy section="skills" field="Also_familiar_with" /></p>
          <div className="flex flex-wrap justify-center gap-2">
            {content.skills.additional.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 rounded-full bg-muted/50 text-muted-foreground text-sm hover:bg-primary/10 hover:text-primary transition-colors cursor-default"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
