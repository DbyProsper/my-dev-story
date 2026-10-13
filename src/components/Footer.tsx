import { useContent, Copy } from '@/lib/content';
import { Terminal, Github, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  const content = useContent();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-card/30" role="contentinfo">
      <div className="container-narrow mx-auto px-4 md:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo & Tagline */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              {content.footer.image ? <img src={content.footer.image} alt={content.footer.imageAlt} className="w-8 h-8 object-contain" /> : <Terminal className="w-5 h-5 text-primary" />}
              <span className="font-mono font-bold"><Copy section="footer" field="devportfolio" /></span>
            </div>
            <p className="text-sm text-muted-foreground text-center md:text-left"><Copy section="footer" field="Building_the_web_one_component" /></p>
          </div>

          {/* Social Links */}
          <div className="flex gap-4">
            <a
              href={content.profile.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href={content.profile.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href={`mailto:${content.profile.email}`}
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Email"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-border/30 text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1"><Copy section="footer" field="label" />{currentYear}<Copy section="footer" field="Prosper_Masuku_Made_with_React" /></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
