export function getClientIp(req) {
  return (req.headers["cf-connecting-ip"] || req.headers["x-real-ip"] || req.ip || "").toString();
}

export function ipInRanges(ip, ranges) {
  if (!ip) return false;
  let addr;
  try { addr = ipaddr.parse(ip); } catch { return false; }
  return ranges.some((cidr) => {
    const [base, prefix] = cidr.split("/");
    if (!base || !prefix) return false;
    const net = ipaddr.parse(base);
    if (net.kind() !== addr.kind()) return false;
    return addr.match([net, parseInt(prefix, 10)]);
  });
}