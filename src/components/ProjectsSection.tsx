import { useState } from 'react';
import { ExternalLink, Github, Lock, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useContent, SectionImage, type SiteContent } from '@/lib/content';

type Project = SiteContent['projects']['projects'][number];
function ProjectLinks({ project }: { project: Project }) {
  const { texts } = useContent().projects;
  return <div className="flex flex-wrap items-center gap-3">
    {project.liveUrl && <Button variant="hero" size="sm" asChild><a href={project.liveUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4" />{texts.demo}</a></Button>}
    {project.privateRepository ? <span className="inline-flex gap-2 items-center text-sm text-muted-foreground"><Lock className="w-4 h-4" />{texts.private}</span> : project.githubUrl && <Button variant="heroOutline" size="sm" asChild><a href={project.githubUrl} target="_blank" rel="noopener noreferrer"><Github className="w-4 h-4" />{texts.code}</a></Button>}
  </div>;
}
export default function ProjectsSection() {
  const content = useContent();
  const { projects, texts } = content.projects;
  const [selected, setSelected] = useState<Project | null>(null);
  return <section id="projects" className="section-padding relative overflow-hidden" aria-label="Projects showcase">
    <div className="container-narrow mx-auto relative">
      <SectionImage section="projects" />
      <div className="text-center mb-16"><span className="inline-block px-4 py-2 rounded-full bg-secondary/10 text-secondary font-mono text-sm mb-4">{texts.eyebrow}</span><h2 className="text-3xl md:text-5xl font-bold mb-4">{texts.heading} <span className="gradient-text-secondary">{texts.accent}</span></h2><p className="text-lg text-muted-foreground max-w-2xl mx-auto">{texts.description}</p></div>
      <div className="grid md:grid-cols-2 gap-6 lg:gap-8">{projects.map(project => <article key={project.id} className="glass-card overflow-hidden hover-lift group flex flex-col">
        <button type="button" onClick={() => setSelected(project)} className="relative block w-full aspect-[2.18/1] overflow-hidden bg-muted" aria-label={`${texts.details}: ${project.title}`}>
          <img src={project.image} alt={`${project.title} preview`} loading="lazy" className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
          {project.featured && <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-background/90 text-secondary text-xs">{texts.featured}</span>}
        </button>
        <div className="p-6 flex flex-col flex-1"><button type="button" onClick={() => setSelected(project)} className="text-left text-xl font-bold mb-2 hover:text-primary">{project.title}<ArrowUpRight className="inline w-4 h-4 ml-2 text-primary" /></button><p className="text-muted-foreground text-sm mb-4">{project.description}</p><div className="flex flex-wrap gap-2 mb-6">{project.tech.map((tech, index) => <span key={index} className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs font-mono">{tech}</span>)}</div><div className="mt-auto"><ProjectLinks project={project} /></div></div>
      </article>)}</div>
      <div className="text-center mt-12"><Button variant="heroOutline" size="lg" asChild><a href={content.profile.githubUrl} target="_blank" rel="noopener noreferrer"><Github className="w-5 h-5" />{texts.allProjects}</a></Button></div>
    </div>
    <Dialog open={!!selected} onOpenChange={open => { if (!open) setSelected(null); }}><DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">{selected && <><DialogTitle>{selected.title}</DialogTitle><div className="space-y-4" role="region" aria-label={`${selected.title} images`}>
      {[{image:selected.image,imageAlt:`${selected.title} preview`}, ...(selected.images || [])].filter(item => item.image).map((item,index) => <figure key={`${item.image}-${index}`} className="space-y-2"><img src={item.image} alt={item.imageAlt || `${selected.title} image ${index+1}`} loading={index === 0 ? 'eager' : 'lazy'} className="rounded-lg w-full h-auto object-contain" />{item.imageAlt && index > 0 && <figcaption className="text-sm text-muted-foreground">{item.imageAlt}</figcaption>}</figure>)}
    </div><DialogDescription>{selected.longDescription}</DialogDescription><h4 className="font-semibold text-secondary">{texts.problem}</h4><p className="text-sm text-muted-foreground">{selected.problem}</p><h4 className="font-semibold text-primary">{texts.solution}</h4><p className="text-sm text-muted-foreground">{selected.solution}</p><ProjectLinks project={selected} /></>}</DialogContent></Dialog>
  </section>;
}
