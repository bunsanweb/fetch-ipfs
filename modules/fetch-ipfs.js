// Locally import non-module js
import "https://cdn.jsdelivr.net/npm/ipfs-http-response/dist/index.js";
const IpfsHttpResponse = window.IpfsHttpResponse; 
delete window.IpfsHttpResponse;

const gatewayList = [
  "https://ipfs.io/ipfs/",
  "https://gateway.ipfs.io/ipfs/",
];

export const fetchImpl = options => {
  return options.fetch ? options.fetch : fetch;
};
export const additionalGateways = options => {
  return Array.isArray(options.additionalGateways) ?
    options.additionalGateways : [];
};
export const IpfsHttpResponseImpl = options => {
  return options.IpfsHttpResponse ? options.IpfsHttpResponse : IpfsHttpResponse;
};

export const createFetch = (node, options = {}) => {
  const gateways = additionalGateways(options).concat(gatewayList);
  
  const fetch = async (url, init = {}) => {
    const uri = url instanceof Request ? url.url : url;
    const prefix = gateways.find(prefix => uri.startsWith(prefix));
    if (!prefix) {
      const res =  await fetchImpl(options)(url, init);
      if (!options.constantGatewayList && res.headers.has("x-ipfs-path")) {
        // Append new IPFS Gateway
        const path = res.headers.get("x-ipfs-path");
        const pathIndex = uri.indexOf(path);
        if (path.startsWith("/ipfs/") && pathIndex > 0) {
          const root = uri.slice(0, pathIndex);
          const gateway = `${root}/ipfs/`;
          gateways.push(gateway);
        }
      }
      return res;
    }
    
    await node.ready;
    
    const ipfsName = uri.slice(prefix.length);
    const res = await IpfsHttpResponseImpl(options).getResponse(node, `/ipfs/${ipfsName}`);
    //const res = await IpfsHttpResponse.getResponse(node, `/ipfs/${ipfsName}`);
    return Object.defineProperty(res, "url", {value: uri, writable: false});
  };
  return fetch;
};
