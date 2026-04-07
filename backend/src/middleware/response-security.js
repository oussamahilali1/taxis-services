export function noStore(req, res, next) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
}

export function applyLogoutCleanupHeaders(res) {
  res.setHeader('Clear-Site-Data', '"cache", "cookies", "storage"');
}
