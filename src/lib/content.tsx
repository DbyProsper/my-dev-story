import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Code2, Code, Server, Wrench, Database, Globe, Palette, GitBranch, Terminal, Rocket, Lightbulb, Trophy, Zap, Users, BookOpen, MessageSquare, Sparkles, Github, Linkedin, Mail } from 'lucide-react';
import defaults from '@/data/content.json';

export type SiteContent = typeof defaults;
export const defaultContent: SiteContent = defaults;
const ContentContext = createContext<SiteContent>(defaults);
export const useContent = () => useContext(ContentContext);
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
  const data = await response.json().catch(() => ({ error: 'The website service is unavailable. Please try again later.' }));
  if (!response.ok || data.error) throw new Error(data.error || 'Request failed.');
  return data;
}
export function ContentProvider({ children, value }: { children: ReactNode; value?: SiteContent }) {
  const [content, setContent] = useState(defaults);
  useEffect(() => {
    if (value) return;
    const controller = new AbortController();
    api<SiteContent>('content', { signal: controller.signal }).then(setContent).catch(() => { /* Keep the bundled public portfolio available if storage is offline. */ });
    return () => controller.abort();
  }, [value]);
  const active = value || content;
  useEffect(() => {
    for (const [key, val] of Object.entries(active.appearance)) document.documentElement.style.setProperty(`--${key}`, val);
  }, [active.appearance]);
  return <ContentContext.Provider value={active}>{children}</ContentContext.Provider>;
}
type TextSection = 'hero' | 'journey' | 'skills' | 'projects' | 'hire' | 'contact' | 'navigation' | 'footer';
export function Copy({ section, field }: { section: TextSection; field: string }) {
  return <>{(useContent()[section].texts as Record<string, string>)[field]}</>;
}
const icons = { Code2, Code, Server, Wrench, Database, Globe, Palette, GitBranch, Terminal, Rocket, Lightbulb, Trophy, Zap, Users, BookOpen, MessageSquare, Sparkles, Github, Linkedin, Mail };
export function ContentIcon({ name }: { name: string }) {
  const Icon = icons[name as keyof typeof icons] || Code2;
  return <Icon className="w-5 h-5" aria-hidden="true" />;
}
export function SectionImage({ section }: { section: TextSection }) {
  const { image, imageAlt } = useContent()[section];
  return image ? <img src={image} alt={imageAlt} loading="lazy" className="w-full max-h-80 object-cover rounded-xl border border-primary/20 mb-10" /> : null;
}
