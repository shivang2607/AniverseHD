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

// function isAllowedOrigin(value) {
//   if (!value) return false;
//   return allowedDomains.some(domain =>
//     value.includes(domain)
//   ) || allowedExactHosts.some(local =>
//     value.includes(local)
//   );
// }

export function middleware(req) {
  const host = req.headers.get('host') || '';

  const isValidHost = isAllowedHost(host);
  // const isValidOrigin = isAllowedOrigin(origin);

  if (!isValidHost) {     //earlier here condition also included the referer and the origin, but actually the host is the sufficient condition will suffice.
    return new NextResponse('Forbidden', { status: 403 });
  }

  const response = NextResponse.next();
  response.headers.set('Content-Security-Policy', "frame-ancestors 'none';");
  return response;
}

export const config = {
  matcher: '/:path*', 
};
