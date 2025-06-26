// middleware.js
import { NextResponse } from 'next/server';

const allowedHosts = [
  'aniversehd.com',
  'aniversehd.in',
  'aniversehd.cc',
  'www.aniversehd.com',
  'www.aniversehd.in',
  'www.aniversehd.cc',
  'localhost:3000',
];

const allowedOrigins = [
  'https://aniversehd.com',
  'https://www.aniversehd.com',
  'https://aniversehd.in',
  'https://www.aniversehd.in',
  'https://aniversehd.cc',
  'https://www.aniversehd.cc',
  'http://localhost:3000',
];

export function middleware(req) {
  const host = req.headers.get('host');
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');


  const isValidHost = host && allowedHosts.includes(host);
  const isValidOrigin = origin && allowedOrigins.includes(origin);
  const isValidReferer = referer && allowedOrigins.some(url => referer.startsWith(url));

  if (!isValidHost && !isValidOrigin && !isValidReferer) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const response = NextResponse.next();

  // Prevent being embedded in iframes
  response.headers.set('Content-Security-Policy', "frame-ancestors 'none';");

  return response;
}

// Apply to all routes
export const config = {
  matcher: '/:path*',
};
