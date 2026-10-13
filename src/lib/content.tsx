import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Code2, Code, Server, Wrench, Database, Globe, Palette, GitBranch, Terminal, Rocket, Lightbulb, Trophy, Zap, Users, BookOpen, MessageSquare, Sparkles, Github, Linkedin, Mail } from 'lucide-react';
import defaults from '@/data/content.json';

export type SiteContent = typeof defaults;
export const defaultContent: SiteContent = defaults;
const ContentContext = createContext<SiteContent>(defaults);
export const useContent = () => useContext(ContentContext);
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/${path}`, { cache: 'no-store', ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
  const data = await response.json().catch(() => ({ error: 'The website service is unavailable. Please try again later.' }));
  if (!response.ok || data.error) throw Object.assign(new Error(data.error || 'Request failed.'), { status: response.status });
  return data;
}
export function ContentProvider({ children, value }: { children: ReactNode; value?: SiteContent }) {
  const [content, setContent] = useState(defaults);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState('');
  useEffect(() => {
    if (value) return;
    const controller = new AbortController();
    let pending = false;
    async function refresh() {
      if (pending || controller.signal.aborted) return;
      pending = true;
      try {
        const next = await api<SiteContent>('content', { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]) });
        if (!controller.signal.aborted) { setContent(next); setLoaded(true); setLoadError(''); }
      } catch {
        if (!controller.signal.aborted) setLoadError('Unable to load the latest published content. Retrying automatically.');
      } finally { pending = false; }
    }
    void refresh();
    const interval = window.setInterval(() => { if (!document.hidden) void refresh(); }, 30000);
    const onFocus = () => void refresh();
    window.addEventListener('focus', onFocus);
    window.addEventListener('online', onFocus);
    return () => { controller.abort(); window.clearInterval(interval); window.removeEventListener('focus', onFocus); window.removeEventListener('online', onFocus); };
  }, [value]);
  const active = value || content;
  useEffect(() => {
    for (const [key, val] of Object.entries(active.appearance)) document.documentElement.style.setProperty(`--${key}`, val);
  }, [active.appearance]);
  if (!value && !loaded) return <main className="min-h-screen grid place-items-center bg-background p-6"><p role="status">{loadError || 'Loading published portfolio…'}</p></main>;
  return <ContentContext.Provider value={active}>{!value && loadError && <p role="status" className="fixed bottom-4 left-4 right-4 z-[100] rounded-lg bg-background border border-border p-3 text-sm">{loadError} Showing the last successfully loaded version.</p>}{children}</ContentContext.Provider>;
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
