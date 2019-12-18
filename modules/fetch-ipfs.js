import "https://cdn.jsdelivr.net/npm/ipfs-http-response/dist/index.js";

const gatewayList = [
  "https://ipfs.io/ipfs/",
  "https://gateway.ipfs.io/ipfs/",
];

export const fetchImpl = options => {
  return options.fetch ? options.fetch : fetch;
};

export const createFetch = (node, options = {}) => {
  const fetch = async (url, init = {}) => {
    const uri = url instanceof Request ? url.url : url;
    const prefix = gatewayList.find(prefix => uri.startsWith(prefix));
    if (!prefix) return await fetchImpl(options)(url, init);
    
    await node.ready;
    
    const ipfsName = uri.slice(prefix.length);
    return await IpfsHttpResponse.getResponse(node, `/ipfs/${ipfsName}`);
  };
  return fetch;
};
