import "https://cdn.jsdelivr.net/npm/ipfs-http-response/dist/index.js";

const gatewayList = [
  "https://ipfs.io/ipfs/",
  "https://gateway.ipfs.io/ipfs/",
];

export const fetchImpl = options => {
  return options.fetch ? options.fetch : fetch;
};

export const createFetch = (node, options = {}) => {
  const gateways = gatewayList.slice();
  const fetch = async (url, init = {}) => {
    const uri = url instanceof Request ? url.url : url;
    const prefix = gateways.find(prefix => uri.startsWith(prefix));
    if (!prefix) {
      const res =  await fetchImpl(options)(url, init);
      if (options.captureGateway && res.headers.has("x-ipfs-path")) {
        // Append new IPFS Gateway
        const path = res.headers.get("x-ipfs-path");
        const root = uri.slice(0, uri.indexOf(path));
        const gateway = `${root}${path.startsWith("/ipfs/") ? "/ipfs/" : "/"}`;
        gateways.push(gateway);
      }
      return res;
    }
    
    await node.ready;
    
    const ipfsName = uri.slice(prefix.length);
    return await IpfsHttpResponse.getResponse(node, `/ipfs/${ipfsName}`);
  };
  return fetch;
};
