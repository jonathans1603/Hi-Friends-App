export default function getActiveRoute() {
  const p = location.hash.replace('#', '') || '/';
  const m = p.match(/^\/story\/([^/]+)$/);
  return m ? { path: '/story/:id', id: decodeURIComponent(m[1]) } : { path: p };
}
