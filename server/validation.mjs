import defaults from '../src/data/content.json' with { type: 'json' };

export { defaults };
export class ValidationError extends Error {}
export function validateContent(value, template = defaults, path = '') {
  if (/^\.projects\.projects\.\d+\.images$/.test(path)) {
    // Galleries are optional for portfolios saved before this feature existed.
    if (value === undefined) return;
    if (!Array.isArray(value) || value.length > 20) throw new ValidationError('A project can have up to 20 additional images.');
    value.forEach((item, index) => validateContent(item, { image: '', imageAlt: '' }, `${path}.${index}`));
    for (const item of value) {
      if (item.image && !/^(https:\/\/[^\s]+|\/(?!\/)[^\s]*)$/.test(item.image)) throw new ValidationError('Project images must use an HTTPS URL or site path.');
    }
    return;
  }
  if (Array.isArray(template)) {
    if (!Array.isArray(value) || value.length > 100) throw new ValidationError(`${path}: expected a list of up to 100 items.`);
    value.forEach((item, index) => validateContent(item, template[0], `${path}.${index}`));
    return;
  }
  if (template && typeof template === 'object') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new ValidationError(`${path}: expected an object.`);
    if (Object.keys(value).some(key => !(key in template))) throw new ValidationError(`${path}: unknown field.`);
    for (const key of Object.keys(template)) validateContent(value[key], template[key], `${path}.${key}`);
    if (path === '.projects') {
      const ids = value.projects.map(project => project.id);
      if (new Set(ids).size !== ids.length) throw new ValidationError('Each project needs a unique ID.');
    }
    return;
  }
  if (typeof value !== typeof template) throw new ValidationError(`${path}: incorrect value type.`);
  if (typeof value === 'number' && (!Number.isFinite(value) || value < 0 || (path.endsWith('.level') && value > 100))) throw new ValidationError(`${path}: invalid number.`);
  if (typeof value !== 'string') return;
  if (value.length > 20000) throw new ValidationError(`${path}: text is too long.`);
  const key = path.split('.').at(-1);
  if (/Url$/.test(key) || ['href', 'image'].includes(key)) {
    if (value && !/^(https:\/\/[^\s]+|\/(?!\/)[^\s]*|#[\w-]+|mailto:[^\s]+)$/.test(value)) throw new ValidationError(`${path}: use an HTTPS URL, site path, email link, or section anchor.`);
    if (/[\\\u0000-\u001f]/.test(value)) throw new ValidationError(`${path}: invalid URL.`);
  }
  if (key === 'cvUrl' && !/^(\/documents\/[\w.-]+|\/api\/media\?file=media%2F[\w.-]+(?:&download=1)?)$/.test(value)) throw new ValidationError('CV must be uploaded or use a file in /documents/.');
  if (path.startsWith('.appearance.') && !/^\d{1,3}(\.\d+)? \d{1,3}(\.\d+)?% \d{1,3}(\.\d+)?%$/.test(value)) throw new ValidationError('Theme colors must use HSL, for example 175 80% 50%.');
}

export function validateMessage(body) {
  for (const [key, max] of [['name',100],['email',255],['message',1000]]) {
    if (typeof body[key] !== 'string' || !body[key].trim() || body[key].length > max) throw new ValidationError(`Please provide a valid ${key} (maximum ${max} characters).`);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) throw new ValidationError('Please provide a valid email address.');
  return { name: body.name.trim(), email: body.email.trim(), message: body.message.trim() };
}

export function validateUpload(body) {
  if (typeof body.data !== 'string' || body.data.length > 4_000_000 || !/^[A-Za-z0-9+/]*={0,2}$/.test(body.data)) throw new ValidationError('Choose a file smaller than 3 MB.');
  const bytes = Buffer.from(body.data, 'base64');
  const types = {
    'image/jpeg': ['jpg', bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255],
    'image/png': ['png', bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))],
    'image/webp': ['webp', bytes.toString('ascii',0,4) === 'RIFF' && bytes.toString('ascii',8,12) === 'WEBP'],
    'image/gif': ['gif', /^GIF8[79]a/.test(bytes.toString('ascii',0,6))],
    'application/pdf': ['pdf', bytes.toString('ascii',0,5) === '%PDF-'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx', bytes.toString('ascii',0,2) === 'PK' && bytes.includes(Buffer.from('word/'))],
  };
  const match = types[body.type];
  if (!match?.[1] || !bytes.length) throw new ValidationError('Supported files: JPEG, PNG, WebP, GIF, PDF, or DOCX.');
  return { bytes, extension: match[0], contentType: body.type };
}
