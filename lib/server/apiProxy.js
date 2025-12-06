import { getAuth } from '@clerk/nextjs/server';

const API_BASE_URL =
  process.env.API_URL ??
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:4000';

const TEMPLATE =
  process.env.CLERK_JWT_TEMPLATE ??
  process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE ??
  undefined;

async function resolveAuthToken(req) {
  const headerToken = req.headers.authorization?.replace(/^Bearer\s+/i, '') ?? null;
  if (headerToken) return headerToken;

  const auth = getAuth(req);
  if (!auth?.getToken) return null;

  const token = await auth.getToken(TEMPLATE ? { template: TEMPLATE } : undefined);
  if (token) return token;

  if (TEMPLATE) {
    return auth.getToken();
  }

  return null;
}

function buildUpstreamUrl(req, targetPath) {
  const search = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  return `${API_BASE_URL}${targetPath}${search}`;
}

function buildHeaders(req, token) {
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  if (req.headers['content-type']) {
    headers['Content-Type'] = req.headers['content-type'];
  }
  if (req.headers.accept) {
    headers.Accept = req.headers.accept;
  }
  return headers;
}

async function forwardResponse(res, upstreamResponse) {
  const contentType = upstreamResponse.headers.get('content-type');
  const bodyText = await upstreamResponse.text();

  res.status(upstreamResponse.status);
  if (contentType) {
    res.setHeader('content-type', contentType);
  }

  if (!bodyText) {
    res.end();
    return;
  }

  res.send(bodyText);
}

export async function proxyRequest(req, res, targetPath) {
  const token = await resolveAuthToken(req);
  if (!token) {
    res.status(401).json({ error: 'Missing auth token' });
    return;
  }

  const upstreamUrl = buildUpstreamUrl(req, targetPath);
  const init = {
    method: req.method,
    headers: buildHeaders(req, token),
  };

  if (!['GET', 'HEAD'].includes(req.method)) {
    if (typeof req.body === 'string') {
      init.body = req.body;
    } else if (req.body !== undefined) {
      init.body = JSON.stringify(req.body);
      if (!init.headers['Content-Type']) {
        init.headers['Content-Type'] = 'application/json';
      }
    }
  }

  try {
    const upstreamResponse = await fetch(upstreamUrl, init);
    await forwardResponse(res, upstreamResponse);
  } catch (error) {
    res.status(502).json({ error: 'Failed to reach upstream API' });
  }
}

export default proxyRequest;
