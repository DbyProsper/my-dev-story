import { useState } from 'react';
import { ExternalLink, Github, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Project {
  id: number;
  title: string;
  description: string;
  longDescription: string;
  problem: string;
  solution: string;
  tech: string[];
  image: string;
  liveUrl: string;
  githubUrl: string;
  featured: boolean;
}

const projects: Project[] = [
  {
    id: 1,
    title: 'TaskFlow Pro',
    description: 'A modern task management app with real-time collaboration and smart productivity insights.',
    longDescription: 'TaskFlow Pro is a comprehensive project management solution designed for remote teams. It features real-time updates, kanban boards, and AI-powered productivity analytics.',
    problem: 'Remote teams struggle with task visibility and often lose track of project progress across time zones.',
    solution: 'Built a real-time sync engine using WebSockets that keeps all team members updated instantly, with smart notifications that respect work hours.',
    tech: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Socket.io', 'Redis'],
    image: 'linear-gradient(135deg, hsl(175 80% 50% / 0.3), hsl(265 80% 65% / 0.3))',
    liveUrl: 'https://teamflow-pro.vercel.app/',
    githubUrl: 'https://github.com/DbyProsper/teamflow-pro',
    featured: true,
  },
  {
    id: 2,
    title: 'Automated fileorg',
    description: 'A Python automation script that organizes files in a directory into folders based on file type.',
    longDescription: 'Automated fileorg allows users to organize files in a directory into folders based on file type. It supports various file types and can be customized to include additional categories.',
    problem: 'Sorting files manually is time-consuming and prone to errors, leading to cluttered directories.',
    solution: 'Developed a Python script that scans a specified directory, identifies file types, and moves them into corresponding folders automatically.',
    tech: ['Python', 'OS Module', 'Shutil'],
    image: 'linear-gradient(135deg, hsl(15 90% 60% / 0.3), hsl(45 90% 50% / 0.3))',
    liveUrl: 'https://github.com/DbyProsper/Python-file-organizer',
    githubUrl: 'https://github.com/DbyProsper/Python-file-organizer',
    featured: true,
  },
  {
    id: 3,
    title: 'WeatherWise',
    description: 'Hyperlocal weather forecasting with beautiful visualizations and smart alerts.',
    longDescription: 'WeatherWise provides accurate hyperlocal weather predictions using multiple data sources, presented through stunning animated visualizations.',
    problem: 'Generic weather apps fail to capture microclimates and provide generic forecasts.',
    solution: 'Integrated multiple weather APIs and used machine learning to improve accuracy for specific locations, presented through engaging SVG animations.',
    tech: ['React', 'D3.js', 'Python', 'FastAPI', 'TensorFlow'],
    image: 'linear-gradient(135deg, hsl(200 80% 50% / 0.3), hsl(220 80% 65% / 0.3))',
    liveUrl: 'https://precision-weather.vercel.app/',
    githubUrl: 'https://github.com/DbyProsper/precision-weather',
    featured: false,
  },
  {
    id: 4,
    title: 'DevNotes',
    description: 'Markdown-powered note-taking designed specifically for developers.',
    longDescription: 'DevNotes combines the simplicity of markdown with powerful developer features like code execution, git integration, and smart linking.',
    problem: 'Existing note apps don\'t understand developer workflows and lack code-first features.',
    solution: 'Built a custom markdown parser with code block execution, vim keybindings, and seamless git sync for version control.',
    tech: ['Electron', 'React', 'Monaco Editor', 'SQLite'],
    image: 'linear-gradient(135deg, hsl(280 80% 50% / 0.3), hsl(320 80% 65% / 0.3))',
    liveUrl: '#',
    githubUrl: '#',
    featured: false,
  },
];

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

const ProjectModal = ({ project, onClose }: ProjectModalProps) => (
  <div 
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
    onClick={onClose}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <div 
      className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 animate-scale-in"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-start mb-6">
        <h3 id="modal-title" className="text-2xl font-bold text-foreground">{project.title}</h3>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close modal">
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div 
        className="h-48 rounded-lg mb-6 flex items-center justify-center"
        style={{ background: project.image }}
      >
        <span className="text-4xl font-bold text-foreground/20">{project.title[0]}</span>
      </div>

      <p className="text-muted-foreground mb-6 leading-relaxed">{project.longDescription}</p>

      <div className="space-y-4 mb-6">
        <div>
          <h4 className="font-semibold text-foreground mb-1 flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-secondary" /> The Problem
          </h4>
          <p className="text-muted-foreground text-sm pl-6">{project.problem}</p>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-1 flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-primary" /> The Solution
          </h4>
          <p className="text-muted-foreground text-sm pl-6">{project.solution}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {project.tech.map((tech) => (
          <span key={tech} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-mono">
            {tech}
          </span>
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="hero" asChild>
          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4" /> Live Demo
          </a>
        </Button>
        <Button variant="heroOutline" asChild>
          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
            <Github className="w-4 h-4" /> View Code
          </a>
        </Button>
      </div>
    </div>
  </div>
);

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

const ProjectCard = ({ project, onClick }: ProjectCardProps) => (
  <article 
    className={`glass-card overflow-hidden hover-lift group cursor-pointer ${
      project.featured ? 'md:col-span-2 lg:col-span-1' : ''
    }`}
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => e.key === 'Enter' && onClick()}
    aria-label={`View details for ${project.title}`}
  >
    {/* Image/Preview */}
    <div 
      className="h-48 flex items-center justify-center relative overflow-hidden"
      style={{ background: project.image }}
    >
      {project.featured && (
        <span className="absolute top-3 right-3 px-2 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-medium backdrop-blur-sm">
          Featured
        </span>
      )}
      <span className="text-6xl font-bold text-foreground/10 group-hover:scale-110 transition-transform duration-500">
        {project.title[0]}
      </span>
    </div>

    {/* Content */}
    <div className="p-6">
      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
        {project.title}
      </h3>
      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{project.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {project.tech.slice(0, 3).map((tech) => (
          <span key={tech} className="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-mono">
            {tech}
          </span>
        ))}
        {project.tech.length > 3 && (
          <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs">
            +{project.tech.length - 3}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-primary"
          onClick={(e) => {
            e.stopPropagation();
            window.open(project.liveUrl, '_blank');
          }}
        >
          <ExternalLink className="w-4 h-4" /> Demo
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            window.open(project.githubUrl, '_blank');
          }}
        >
          <Github className="w-4 h-4" /> Code
        </Button>
      </div>
    </div>
  </article>
);

const ProjectsSection = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <section
      id="projects"
      className="section-padding relative overflow-hidden"
      aria-label="Projects showcase"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,hsl(15_90%_60%_/_0.05)_0%,transparent_50%)]" />

      <div className="container-narrow mx-auto relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-secondary/10 text-secondary font-mono text-sm mb-4">
            {'<projects />'}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Featured <span className="gradient-text-secondary">Work</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A selection of projects that showcase my skills in building modern, user-focused applications.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => setSelectedProject(project)}
            />
          ))}
        </div>

        {/* View More */}
        <div className="text-center mt-12">
          <Button variant="heroOutline" size="lg" asChild>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Github className="w-5 h-5" /> View All on GitHub
            </a>
          </Button>
        </div>
      </div>

      {/* Modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </section>
  );
};

export default ProjectsSection;
