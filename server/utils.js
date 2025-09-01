import ipaddr from "ipaddr.js";


export function getClientIp(req) {
  return (req.headers["cf-connecting-ip"] || req.headers["x-real-ip"] || req.ip || "").toString();
}

export function ipInRanges(ip1, ip2) {
  if (!ip1 || !ip2) return false;
  let addr1, addr2;
  try {
    addr1 = ipaddr.parse(ip1);
    addr2 = ipaddr.parse(ip2);
  } catch {
    return false;
  }
  return addr1.kind() === addr2.kind() && addr1.match([addr2]);
}