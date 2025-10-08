// src/middleware.js
import { NextResponse } from 'next/server';

const allowedDomains = [
  'aniversehd.com',
  'aniversehd.in',
  'aniversehd.cc',
];

const allowedExactHosts = [
  'localhost:3000',
];

function isAllowedHost(host) {
  if (!host) return false;
  if (allowedExactHosts.includes(host)) return true;
  return allowedDomains.some(
    (domain) => host === domain || host.endsWith(`.${domain}`)
  );
}

function isAllowedOriginHeader(value) {
  if (!value) return false;
  try {
    const { host } = new URL(value);
    return isAllowedHost(host);
  } catch {
    return false;
  }
}

export function middleware(req) {
  const host = req.headers.get('host') || '';
  const origin = req.headers.get('origin') || '';
  const referer = req.headers.get('referer') || '';

  const isValidHost = isAllowedHost(host);
  const isValidOrigin = origin ? isAllowedOriginHeader(origin) : true; // allow if missing
  const isValidReferer = referer ? isAllowedOriginHeader(referer) : true; // allow if missing

  // require host always, but origin/referer only if present
  if (!isValidHost || (!isValidOrigin)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const response = NextResponse.next();
  response.headers.set('Content-Security-Policy', "frame-ancestors 'none';");
  return response;
}

export const config = {
  matcher: '/:path*',
};
