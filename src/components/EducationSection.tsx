import { GraduationCap, Music } from 'lucide-react';
import { SectionImage, useContent } from '@/lib/content';

const icons = { GraduationCap, Music };

export default function EducationSection() {
  const { education } = useContent();

  return (
    <section id="education" className="section-padding relative overflow-hidden" aria-label="Education">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_100%_50%,hsl(263_70%_58%_/_0.06)_0%,transparent_50%)]" />
      <div className="container-narrow mx-auto relative">
        <SectionImage section="education" />
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent font-mono text-sm mb-4">{education.texts.eyebrow}</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            {education.texts.heading} <span className="gradient-text-accent">{education.texts.accent}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{education.texts.description}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {education.qualifications.map((qualification, index) => {
            const Icon = icons[qualification.icon as keyof typeof icons] || GraduationCap;
            return (
              <article key={`${qualification.title}-${index}`} className="glass-card group overflow-hidden hover-lift flex flex-col">
                {qualification.image && (
                  <div className="h-48 sm:h-56 overflow-hidden bg-muted/30">
                    <img src={qualification.image} alt={qualification.imageAlt} loading="lazy" className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none" />
                  </div>
                )}
                <div className="p-6 md:p-8 flex flex-col flex-1">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6 transition-transform duration-500 group-hover:scale-110">
                    <Icon className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">{qualification.title}</h3>
                  <p className="font-mono text-sm text-primary mb-4">{qualification.institution}</p>
                  <p className="text-muted-foreground leading-relaxed">{qualification.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
