import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowDown, ArrowUp, ImagePlus, Loader2, LockKeyhole, LogOut, Mail, Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api, ContentProvider, defaultContent, type SiteContent } from '@/lib/content';
import { toast } from 'sonner';
import Index from './Index';

type Json = string | number | boolean | Json[] | { [key: string]: Json };
type Message = { id: string; name: string; email: string; message: string; read: boolean; createdAt: string };
type InboxPage = { messages: Message[]; cursor: string | null };
const labels: Record<string,string> = { profile:'Profile & CV', hero:'Introduction', journey:'Journey', skills:'Skills', projects:'Projects', hire:'Why hire me', contact:'Contact', navigation:'Navigation', footer:'Footer', seo:'Search & sharing', appearance:'Colors' };
const label = (key: string) => (key === 'images' ? 'Additional project images' : labels[key]) || key.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
const fieldClass = 'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40';

function FieldEditor({ value, template, name, onChange }: { value: Json; template: Json; name: string; onChange: (value: Json) => void }) {
  const [uploading, setUploading] = useState(false);
  if (Array.isArray(value)) {
    const example = name === 'images' ? { image: '', imageAlt: '' } : (template as Json[])[0];
    return <div className="space-y-3"><div className="flex items-center justify-between"><h3 className="font-semibold capitalize">{label(name)}</h3><Button size="sm" variant="outline" disabled={name === 'images' && value.length >= 20} onClick={() => {
      const item = structuredClone(example);
      if (item && typeof item === 'object' && !Array.isArray(item) && 'id' in item) item.id = Date.now();
      onChange([...value, item]);
    }}><Plus className="w-4 h-4" />Add item</Button></div>{value.map((item, index) => <details key={index} className="rounded-xl border border-border bg-muted/20" open={typeof item !== 'object' || undefined}>
      <summary className="p-4 cursor-pointer text-sm font-medium">{index + 1}. {typeof item === 'object' && !Array.isArray(item) ? String(item.title || item.name || item.label || 'Item') : String(item).slice(0,70)}</summary>
      <div className="p-4 pt-0 space-y-4"><div className="flex justify-end gap-2"><Button variant="ghost" size="sm" disabled={index === 0} aria-label="Move up" onClick={() => { const next=[...value]; [next[index-1],next[index]]=[next[index],next[index-1]]; onChange(next); }}><ArrowUp className="w-4 h-4" /></Button><Button variant="ghost" size="sm" disabled={index === value.length-1} aria-label="Move down" onClick={() => { const next=[...value]; [next[index+1],next[index]]=[next[index],next[index+1]]; onChange(next); }}><ArrowDown className="w-4 h-4" /></Button><Button variant="ghost" size="sm" aria-label="Remove item" onClick={() => onChange(value.filter((_,i) => i !== index))}><Trash2 className="w-4 h-4" /></Button></div><FieldEditor name="Item" value={item} template={example} onChange={next => onChange(value.map((old,i) => i === index ? next : old))} /></div>
    </details>)}</div>;
  }
  if (typeof value === 'object') return <div className="space-y-5">{Object.entries(value).map(([key,item]) => <FieldEditor key={key} name={key} value={item} template={(template as Record<string,Json>)[key]} onChange={next => onChange({ ...value, [key]:next })} />)}</div>;
  if (typeof value === 'boolean') return <label className="flex items-center gap-3 capitalize"><input type="checkbox" checked={value} onChange={event => onChange(event.target.checked)} className="accent-primary w-4 h-4" />{label(name)}</label>;
  const isFile = name === 'image' || name === 'cvUrl';
  async function upload(file?: File) {
    if (!file) return;
    if (file.size > 3_000_000) { toast.error('Please choose a file smaller than 3 MB.'); return; }
    setUploading(true);
    try {
      const data = await new Promise<string>((resolve,reject) => { const reader=new FileReader(); reader.onload=() => resolve(String(reader.result).split(',')[1]); reader.onerror=reject; reader.readAsDataURL(file); });
      const result = await api<{url:string}>('upload', { method:'POST', body:JSON.stringify({ data, type:file.type }) });
      onChange(result.url + (name === 'cvUrl' ? '&download=1' : ''));
      toast.success('Uploaded. Publish your changes to use this file.');
    } catch(error) { toast.error(error instanceof Error ? error.message : 'Upload failed.'); }
    finally { setUploading(false); }
  }
  return <div className="space-y-2"><label className="block text-sm font-medium capitalize">{label(name)}
    {typeof value === 'number' ? <input className={`${fieldClass} mt-2`} type="number" min={0} max={name==='level'?100:undefined} value={value} onChange={event => onChange(Number(event.target.value))} /> : <textarea className={`${fieldClass} mt-2 resize-y`} rows={value.length > 100 ? 3 : 1} value={value} onChange={event => onChange(event.target.value)} />}
  </label>{isFile && <><label className="inline-flex items-center gap-2 text-primary text-sm cursor-pointer">{uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}{uploading ? 'Uploading…' : name === 'cvUrl' ? 'Upload CV (PDF or DOCX)' : 'Upload image'}<input className="sr-only" type="file" disabled={uploading} accept={name==='cvUrl'?'.pdf,.docx':'image/png,image/jpeg,image/webp,image/gif'} onChange={event => { void upload(event.target.files?.[0]); event.target.value=''; }} /></label><p className="text-xs text-muted-foreground">Maximum 3 MB. Upload first, then publish.</p>{name==='image' && value && <img src={String(value)} alt="Current image" className="max-h-40 max-w-full rounded-lg border border-border object-contain" />}</>}</div>;
}

export default function Admin() {
  const [status,setStatus] = useState<'loading'|'signed-out'|'signed-in'>('loading');
  const [password,setPassword] = useState('');
  const [error,setError] = useState('');
  const [busy,setBusy] = useState(false);
  const [content,setContent] = useState<SiteContent | null>(null);
  const [version,setVersion] = useState<string | null>(null);
  const [dirty,setDirty] = useState(false);
  const [conflict,setConflict] = useState(false);
  const [section,setSection] = useState('hero');
  const [preview,setPreview] = useState(false);
  const [messages,setMessages] = useState<Message[]>([]);
  const [cursor,setCursor] = useState<string | null>(null);
  const [inboxLoading,setInboxLoading] = useState(false);
  const [inboxError,setInboxError] = useState('');
  useEffect(() => { api('session').then(() => setStatus('signed-in')).catch(error => { setStatus('signed-out'); if (!error.message.includes('sign in')) setError(error.message); }); }, []);
  useEffect(() => {
    if (status !== 'signed-in') return;
    api<{content:SiteContent;version:string|null}>('admin-content').then(result => { setContent(result.content); setVersion(result.version); }).catch(error => setError(error.message));
  }, [status]);
  useEffect(() => { const warn=(event:BeforeUnloadEvent) => { if(dirty) { event.preventDefault(); event.returnValue=''; } }; window.addEventListener('beforeunload',warn); return () => window.removeEventListener('beforeunload',warn); },[dirty]);
  async function loadMessages(more=false) {
    setInboxLoading(true); setInboxError('');
    try { const page=await api<InboxPage>(`messages${more && cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`); setMessages(old => more ? [...old,...page.messages] : page.messages); setCursor(page.cursor); }
    catch(error) { setInboxError(error instanceof Error ? error.message : 'Unable to load inbox.'); }
    finally { setInboxLoading(false); }
  }
  async function updateMessage(message:Message, remove=false) {
    if(remove && !window.confirm('Permanently delete this message?')) return;
    try { await api('messages',{method:remove?'DELETE':'PATCH',body:JSON.stringify({id:message.id,read:!message.read})}); setMessages(old => remove ? old.filter(row => row.id!==message.id) : old.map(row => row.id===message.id ? {...row,read:!row.read}:row)); }
    catch(error) { toast.error(error instanceof Error ? error.message : 'Unable to update message.'); }
  }
  if(preview && content) return <ContentProvider value={content}><div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[100] glass-card px-5 py-3 flex items-center gap-4 shadow-xl"><span className="text-sm">Unpublished preview</span><Button onClick={() => setPreview(false)}>Back to editor</Button></div><Index /></ContentProvider>;
  return <div className="min-h-screen bg-background text-foreground"><Helmet><title>Portfolio administration</title><meta name="robots" content="noindex,nofollow" /></Helmet>
    {status !== 'signed-in' ? <main className="min-h-screen grid place-items-center p-6"><form className="glass-card p-8 w-full max-w-md space-y-6" onSubmit={async event => { event.preventDefault(); setBusy(true); setError(''); try { await api('login',{method:'POST',body:JSON.stringify({password})}); setPassword(''); setStatus('signed-in'); } catch(error) { setError(error.message); } finally {setBusy(false);} }}><LockKeyhole className="w-9 h-9 text-primary" /><div><p className="text-xs text-primary font-mono mb-2">~/portfolio / admin</p><h1 className="text-3xl font-bold">Welcome back.</h1><p className="text-muted-foreground mt-2">Manage your portfolio and visitor messages.</p></div>{status==='loading' ? <p>Checking your session…</p> : <><label className="block text-sm">Admin password<input type="password" required autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} className={`${fieldClass} mt-2`} /></label>{error && <p role="alert" className="text-sm text-secondary">{error}</p>}<Button variant="hero" className="w-full" disabled={busy}>{busy?'Signing in…':'Sign in'}</Button></>}<a href="/" className="block text-sm text-muted-foreground hover:text-primary">← Back to portfolio</a></form></main> : <>
    <header className="border-b border-border sticky top-0 z-40 bg-background/95 backdrop-blur px-4 md:px-8 py-4 flex flex-wrap gap-4 items-center justify-between"><div><p className="text-xs text-primary font-mono">PORTFOLIO / ADMIN</p><h1 className="text-xl font-bold">Your website, your story.</h1></div><div className="flex flex-wrap gap-2 items-center"><span className="text-xs text-muted-foreground">{dirty?'Unpublished changes':'All changes published'}</span><Button variant="outline" disabled={!content} onClick={() => setPreview(true)}>Preview</Button><Button variant="hero" disabled={!content||busy||!dirty} onClick={async () => { setBusy(true); try { const result=await api<{version:string}>('admin-content',{method:'PUT',body:JSON.stringify({content,version})}); setVersion(result.version);setDirty(false);setConflict(false);toast.success('Your portfolio is published.'); } catch(error) {if(error.status===409)setConflict(true);toast.error(error.message);} finally {setBusy(false);} }}><Save className="w-4 h-4" />{busy?'Publishing…':'Publish changes'}</Button><Button variant="ghost" aria-label="Sign out" onClick={async () => { if(dirty&&!window.confirm('Discard unpublished changes and sign out?'))return; try {await api('logout',{method:'POST',body:'{}'});setContent(null);setDirty(false);setStatus('signed-out');}catch(error){toast.error(error.message);} }}><LogOut className="w-4 h-4" /></Button></div></header>
    <div className="max-w-7xl mx-auto grid md:grid-cols-[220px_1fr] gap-8 p-4 md:p-8"><aside><nav aria-label="Admin sections" className="flex md:flex-col gap-1 overflow-x-auto md:sticky md:top-28"><Button variant={section==='inbox'?'secondary':'ghost'} className="justify-start" onClick={() => {setSection('inbox');void loadMessages();}}><Mail className="w-4 h-4" />Inbox</Button>{Object.entries(labels).map(([key,title]) => <Button key={key} variant={section===key?'secondary':'ghost'} className="justify-start shrink-0" onClick={() => setSection(key)}>{title}</Button>)}</nav></aside>
    <main className="min-w-0">{conflict && <div role="alert" className="mb-6 rounded-lg border border-secondary p-4 space-y-3"><p>Publishing conflicted with the saved version. Your edits are still here. Download your draft before loading the latest published version.</p><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => { const url=URL.createObjectURL(new Blob([JSON.stringify(content,null,2)],{type:'application/json'})); const link=document.createElement('a');link.href=url;link.download='portfolio-draft.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000); }}>Download my draft</Button><Button variant="outline" onClick={async () => { if(!window.confirm('Replace your current draft with the latest published version? Download your draft first to keep a copy.'))return;try { const latest=await api<{content:SiteContent;version:string|null}>('admin-content');setContent(latest.content);setVersion(latest.version);setDirty(false);setConflict(false); }catch(error){toast.error(error.message);} }}>Load latest published version</Button></div></div>}{error && <p role="alert" className="text-secondary mb-4">{error}</p>}{section==='inbox' ? <div className="space-y-4"><div className="flex justify-between items-center"><h2 className="text-2xl font-bold">Visitor inbox</h2><Button variant="outline" disabled={inboxLoading} onClick={() => void loadMessages()}>Refresh</Button></div>{inboxError && <p role="alert" className="text-secondary">{inboxError}</p>}{inboxLoading && <p>Loading messages…</p>}{!inboxLoading&&!inboxError&&!messages.length&&<div className="glass-card p-10 text-center text-muted-foreground">Messages sent through your contact form will appear here.</div>}{messages.map(message => <article key={message.id} className={`glass-card p-6 ${message.read?'':'border-primary/40'}`}><div className="flex flex-wrap gap-2 justify-between"><h3 className="font-bold">{message.name} {!message.read&&<span className="text-xs text-primary ml-2">New</span>}</h3><time className="text-xs text-muted-foreground">{new Date(message.createdAt).toLocaleString()}</time></div><a className="text-sm text-primary break-all" href={`mailto:${encodeURIComponent(message.email)}`}>{message.email}</a><p className="whitespace-pre-wrap break-words my-5">{message.message}</p><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" asChild><a href={`mailto:${encodeURIComponent(message.email)}?subject=${encodeURIComponent('Re: Your portfolio message')}`}>Reply by email</a></Button><Button size="sm" variant="ghost" onClick={() => void updateMessage(message)}>{message.read?'Mark unread':'Mark read'}</Button><Button size="sm" variant="ghost" onClick={() => void updateMessage(message,true)}><Trash2 className="w-4 h-4" />Delete</Button></div></article>)}{cursor&&<Button disabled={inboxLoading} onClick={() => void loadMessages(true)}>Load more</Button>}</div> : content ? <div className="glass-card p-5 md:p-8"><h2 className="text-2xl font-bold mb-2">{labels[section]}</h2><p className="text-muted-foreground text-sm mb-8">Edit the fields below. Preview your changes, then publish when ready.</p><fieldset disabled={busy}><FieldEditor name={section} value={content[section as keyof SiteContent] as Json} template={defaultContent[section as keyof SiteContent] as Json} onChange={value => {setContent(old => ({...old,[section]:value} as SiteContent));setDirty(true);}} /></fieldset></div> : <p>Loading your content…</p>}</main></div></>}
  </div>;
}
