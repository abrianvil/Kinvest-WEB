import { proxyRequest } from '../../lib/server/apiProxy';

export default async function handler(req, res) {
  const { proxy = [] } = req.query;
  const targetSegments = Array.isArray(proxy) ? proxy : [proxy];
  const targetPath = `/api/${targetSegments.join('/')}`;

  await proxyRequest(req, res, targetPath);
}
