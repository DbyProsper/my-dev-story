import { useState, useEffect } from 'react';
import { Menu, X, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#journey', label: 'Journey' },
    { href: '#skills', label: 'Skills' },
    { href: '#projects', label: 'Projects' },
    { href: '#hire-me', label: 'Why Me' },
    { href: '#contact', label: 'Contact' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/80 backdrop-blur-xl border-b border-border/50'
          : 'bg-transparent'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container-narrow mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a 
            href="#" 
            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
            aria-label="Home"
          >
            <Terminal className="w-6 h-6 text-primary" />
            <span className="font-mono font-bold text-lg">dev.portfolio</span>
          </a>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <button
                  onClick={() => scrollToSection(link.href)}
                  className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors font-medium rounded-lg hover:bg-muted/50"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button
              variant="hero"
              size="sm"
              onClick={() => scrollToSection('#contact')}
            >
              Get In Touch
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border/50">
            <ul className="flex flex-col py-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="w-full px-6 py-3 text-left text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
              <li className="px-4 pt-4">
                <Button
                  variant="hero"
                  className="w-full"
                  onClick={() => scrollToSection('#contact')}
                >
                  Get In Touch
                </Button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
