import { useState } from 'react';
import { Send, Github, Linkedin, Mail, MapPin, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length > 1000) {
      newErrors.message = 'Message must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    toast.success('Message sent successfully!', {
      description: "Thanks for reaching out. I'll get back to you soon!",
      icon: <CheckCircle className="w-5 h-5 text-primary" />,
    });
    
    setFormData({ name: '', email: '', message: '' });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const socialLinks = [
    { icon: <Github className="w-5 h-5" />, href: 'https://github.com', label: 'GitHub' },
    { icon: <Linkedin className="w-5 h-5" />, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: <Mail className="w-5 h-5" />, href: 'mailto:hello@example.com', label: 'Email' },
  ];

  return (
    <section
      id="contact"
      className="section-padding relative overflow-hidden"
      aria-label="Contact section"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,hsl(175_80%_50%_/_0.08)_0%,transparent_50%)]" />

      <div className="container-narrow mx-auto relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-mono text-sm mb-4">
            {'<contact />'}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Let's <span className="gradient-text">Connect</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have a project in mind or just want to chat? I'd love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="glass-card p-8" noValidate>
            <div className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg bg-muted border transition-colors ${
                    errors.name 
                      ? 'border-destructive focus:border-destructive' 
                      : 'border-border focus:border-primary'
                  } text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20`}
                  placeholder="John Doe"
                  maxLength={100}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  aria-invalid={!!errors.name}
                />
                {errors.name && (
                  <p id="name-error" className="mt-1 text-sm text-destructive" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg bg-muted border transition-colors ${
                    errors.email 
                      ? 'border-destructive focus:border-destructive' 
                      : 'border-border focus:border-primary'
                  } text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20`}
                  placeholder="john@example.com"
                  maxLength={255}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p id="email-error" className="mt-1 text-sm text-destructive" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className={`w-full px-4 py-3 rounded-lg bg-muted border transition-colors resize-none ${
                    errors.message 
                      ? 'border-destructive focus:border-destructive' 
                      : 'border-border focus:border-primary'
                  } text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20`}
                  placeholder="Tell me about your project or just say hi..."
                  maxLength={1000}
                  aria-describedby={errors.message ? 'message-error' : 'message-hint'}
                  aria-invalid={!!errors.message}
                />
                {errors.message ? (
                  <p id="message-error" className="mt-1 text-sm text-destructive" role="alert">
                    {errors.message}
                  </p>
                ) : (
                  <p id="message-hint" className="mt-1 text-xs text-muted-foreground">
                    {formData.message.length}/1000 characters
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Send Message
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Contact Info */}
          <div className="space-y-8">
            {/* Quick Info */}
            <div className="glass-card p-8">
              <h3 className="text-xl font-bold text-foreground mb-6">Quick Links</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <a 
                      href="mailto:hello@example.com" 
                      className="text-foreground hover:text-primary transition-colors"
                    >
                      hello@example.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="text-foreground">Open to Remote Work</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="glass-card p-8">
              <h3 className="text-xl font-bold text-foreground mb-6">Find Me Online</h3>
              <div className="flex gap-4">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all hover-lift"
                    aria-label={link.label}
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="glass-card p-8 border-primary/30">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                <span className="text-primary font-medium">Available for Work</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Currently open to full-time positions, freelance projects, and interesting collaborations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
