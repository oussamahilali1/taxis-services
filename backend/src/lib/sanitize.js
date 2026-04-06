const HTML_TAG_PATTERN = /<[^>]*>/g;

function trimToLength(value, maxLength) {
  return maxLength ? value.slice(0, maxLength) : value;
}

export function sanitizeText(value, { maxLength = 255, multiline = false } = {}) {
  if (value == null) {
    return undefined;
  }

  if (Array.isArray(value) || (typeof value === 'object' && !(value instanceof Date))) {
    return undefined;
  }

  let sanitized = String(value)
    .replace(/\u0000/g, '')
    .replace(HTML_TAG_PATTERN, ' ');

  if (multiline) {
    sanitized = sanitized
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/[ \t]{2,}/g, ' ')
      .replace(/\n{3,}/g, '\n\n');
  } else {
    sanitized = sanitized.replace(/\s+/g, ' ');
  }

  sanitized = trimToLength(sanitized.trim(), maxLength);
  return sanitized || undefined;
}

export function sanitizeEmail(value) {
  const email = sanitizeText(value, { maxLength: 160 })?.toLowerCase();
  return email || undefined;
}

export function sanitizePhone(value) {
  const phone = sanitizeText(value, { maxLength: 40 })
    ?.replace(/[^0-9+()./\-\s]/g, '')
    .trim();

  return phone || undefined;
}

export function coerceBoolean(value) {
  if (typeof value === 'boolean') {
    return value;
  }

  return ['1', 'true', 'on', 'yes'].includes(String(value || '').trim().toLowerCase());
}

export function compactObject(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined && entry !== null && entry !== '')
  );
}
