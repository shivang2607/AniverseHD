// src/middleware.js
import { NextResponse } from 'next/server';

// Root domains allowed (subdomains are also allowed)
const allowedDomains = [
  'aniversehd.com',
  'aniversehd.in',
  'aniversehd.cc',
];

// Exact hostnames (localhost, ports, etc.)
const allowedExactHosts = [
  'localhost:3000',
];

function isAllowedHost(host) {
  if (!host) return false;

  if (allowedExactHosts.includes(host)) return true;

  return allowedDomains.some(domain =>
    host === domain || host.endsWith(`.${domain}`)
  );
}

function isAllowedOrigin(value) {
  if (!value) return false;
  return allowedDomains.some(domain =>
    value.includes(domain)
  ) || allowedExactHosts.some(local =>
    value.includes(local)
  );
}

export function middleware(req) {
  const host = req.headers.get('host') || '';
  const origin = req.headers.get('origin') || '';
  const referer = req.headers.get('referer') || '';

  const isValidHost = isAllowedHost(host);
  const isValidOrigin = isAllowedOrigin(origin);
  const isValidReferer = isAllowedOrigin(referer);

  if (!isValidHost && !isValidOrigin && !isValidReferer) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const response = NextResponse.next();
  response.headers.set('Content-Security-Policy', "frame-ancestors 'none';");
  return response;
}

export const config = {
  matcher: '/:path*', 
};
