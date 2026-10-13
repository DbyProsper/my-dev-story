import test from 'node:test';
import assert from 'node:assert/strict';
import { defaults, validateContent, validateMessage, validateUpload } from '../server/validation.mjs';
import { authenticated, createSession, passwordMatches, sessionCookie } from '../server/auth.mjs';
import handler, { createHandler } from '../api/index.mjs';
import { memoryStore } from './memory-store.mjs';

test('portfolio retains all original projects after the three additions', () => {
  validateContent(defaults);
  assert.deepEqual(defaults.projects.projects.map(p=>p.title), ['Champs Order Hub','UFH Opportunity Hub','MusicInsta','TaskFlow Pro','UFH Tutor Application & Management System','WeatherWise','DevNotes']);
  assert.equal(defaults.projects.projects[0].privateRepository,true);
  assert.equal(defaults.projects.projects[2].githubUrl,'');
});
test('content rejects executable URLs, remote CV redirects, malformed sections, and duplicate IDs', () => {
  for (const mutate of [c=>c.profile.githubUrl='javascript:alert(1)',c=>c.hero.image='//evil.test/image',c=>c.profile.cvUrl='https://drive.google.com/cv',c=>c.skills.categories[0].skills[0].level=101,c=>c.hero=null,c=>c.projects.projects[1].id=c.projects.projects[0].id]) {
    const content=structuredClone(defaults); mutate(content); assert.throws(()=>validateContent(content));
  }
});
test('validates contact input and trims messages', () => {
  assert.deepEqual(validateMessage({name:' A ',email:'a@example.com',message:' Hello '}),{name:'A',email:'a@example.com',message:'Hello'});
  assert.throws(()=>validateMessage({name:'A',email:'invalid',message:'Hello'}));
  assert.throws(()=>validateMessage({name:'A',email:'a@example.com',message:'x'.repeat(1001)}));
});
test('uploads enforce actual file signatures, size and allowed types', () => {
  assert.equal(validateUpload({type:'application/pdf',data:Buffer.from('%PDF-1.7\n').toString('base64')}).extension,'pdf');
  assert.throws(()=>validateUpload({type:'image/png',data:Buffer.from('<script>alert(1)</script>').toString('base64')}));
  assert.throws(()=>validateUpload({type:'image/svg+xml',data:Buffer.from('<svg/>').toString('base64')}));
  assert.throws(()=>validateUpload({type:'application/pdf',data:'A'.repeat(4_000_001)}));
});
test('sessions reject forgery and expire when the password changes', () => {
  process.env.ADMIN_PASSWORD='test-password-only-123'; process.env.ADMIN_SESSION_SECRET='test-secret-only-01234567890123456789'; process.env.BLOB_READ_WRITE_TOKEN='test';
  assert.equal(passwordMatches('wrong'),false);
  assert.equal(passwordMatches(process.env.ADMIN_PASSWORD),true);
  const token=createSession(); const req={headers:{cookie:`portfolio_admin=${token}`}};
  assert.equal(authenticated(req),true);
  assert.equal(authenticated({headers:{cookie:`portfolio_admin=${token}x`}}),false);
  process.env.ADMIN_PASSWORD='changed-password-123';
  assert.equal(authenticated(req),false);
  assert.match(sessionCookie(token,true),/HttpOnly; SameSite=Strict/);
  assert.match(sessionCookie(token,true),/Secure/);
  delete process.env.BLOB_READ_WRITE_TOKEN;
});
async function request(route,method='GET',body={},headers={}) {
  const res={headers:{},setHeader(k,v){this.headers[k]=v;},end(body){this.body=body;}};
  await handler({url:`/api/${route}`,method,body,headers},res);
  return res;
}
test('missing storage never acknowledges contact delivery', async () => {
  const res=await request('contact','POST',{name:'A',email:'a@example.com',message:'Hello'});
  assert.equal(res.statusCode,503);
  assert.ok(JSON.parse(res.body).error);
});
test('private records are inaccessible to anonymous clients and media traversal is blocked', async () => {
  process.env.BLOB_READ_WRITE_TOKEN='test';
  assert.equal((await request('messages')).statusCode,401);
  assert.equal((await request('admin-content')).statusCode,401);
  assert.equal((await request('media?file=messages/secret.json')).statusCode,404);
  assert.equal((await request('admin-content','PUT',{}, {origin:'https://attacker.test',host:'portfolio.test','content-type':'application/json'})).statusCode,403);
  delete process.env.BLOB_READ_WRITE_TOKEN;
});

test('authenticated publishing and visitor inbox complete the full API flow', async () => {
  process.env.BLOB_READ_WRITE_TOKEN='test';
  const app=createHandler(memoryStore());
  let cookie='';
  const call=async (route,method='GET',body={}) => {
    const res={headers:{},setHeader(k,v){this.headers[k]=v;},end(body){this.body=JSON.parse(body);}};
    await app({url:`/api/${route}`,method,body,headers:{host:'localhost',origin:'http://localhost','content-type':'application/json',cookie}},res);
    return res;
  };
  assert.equal((await call('login','POST',{password:'wrong'})).statusCode,401);
  const login=await call('login','POST',{password:process.env.ADMIN_PASSWORD});
  assert.equal(login.statusCode,200); cookie=login.headers['Set-Cookie'].split(';')[0];
  const initial=await call('admin-content'); assert.equal(initial.statusCode,200);
  const updated=structuredClone(initial.body.content); updated.hero.texts.Hi_Im='Welcome!';
  const saved=await call('admin-content','PUT',{content:updated,version:initial.body.version}); assert.equal(saved.statusCode,200);
  assert.equal((await call('content')).body.hero.texts.Hi_Im,'Welcome!');
  updated.hero.texts.Hi_Im='Welcome again!';
  const secondSave=await call('admin-content','PUT',{content:updated,version:saved.body.version});
  assert.equal(secondSave.statusCode,200);
  assert.equal((await call('content')).body.hero.texts.Hi_Im,'Welcome again!');
  assert.equal((await call('admin-content','PUT',{content:updated,version:null})).statusCode,409);
  const adminCookie=cookie; cookie='';
  assert.equal((await call('contact','POST',{name:'Test visitor',email:'test@example.com',message:'A test enquiry.'})).statusCode,201);
  assert.equal((await call('messages')).statusCode,401);
  cookie=adminCookie;
  const inbox=await call('messages'); assert.equal(inbox.body.messages.length,1);
  const id=inbox.body.messages[0].id;
  assert.equal((await call('messages','PATCH',{id,read:true})).statusCode,200);
  assert.equal((await call('messages')).body.messages[0].read,true);
  assert.equal((await call('messages','DELETE',{id})).statusCode,200);
  assert.equal((await call('messages')).body.messages.length,0);
  assert.match((await call('logout','POST')).headers['Set-Cookie'],/Max-Age=0/);
  delete process.env.BLOB_READ_WRITE_TOKEN;
});
