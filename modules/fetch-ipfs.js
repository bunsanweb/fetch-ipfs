import "./mime-types.js";

const gatewayList = [
  "http://ipfs.io/ipfs/",
  "http://gateway.ipfs.io/ipfs/",
];

export const fetchImpl = options => {
  return options.fetch ? options.fetch : fetch;
};

export const createFetch = (node, options) => {
  const fetch = async (url, init = {}) => {
    const uri = url instanceof Request ? url.url : url;
    const prefix = gatewayList.find(prefix => uri.startsWith(prefix));
    if (!prefix) return await fetchImpl(options)(url, init);
    
    await node.ready;
    const ipfsName = uri.slice(prefix.length);
    const files = await node.get(ipfsName);
    return createResponse(uri, files);
  };
  return fetch;
};

const createResponse = (uri, files) => {
  if (files.length === 0) return createNotFound(uri, files);
  if (files[0].type === "dir") return createIndex(uri, files);
  if (files[0].type === "file") return createFile(uri, files);
  return createError(uri, files);
};

const createFile = (uri, files) => {
  const contentType = MimeTypes.lookup(files[0].name) || "application/octet-stream";
  const res = new Response(files[0].content, {
    status: 200,
    headers: {
      "Content-Length": files[0].size,
      "Content-Type": contentType,
    },
  });
  return Object.defineProperty(res, "url", {value: uri, writable: false});
};

const createIndex = (uri, files) => {
  const dirUri =  uri.endsWith("/") ? uri : `${uri}/`;
  const html = createIndexHTML(files);
  const res = new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html;charset=utf-8"
    },
  });
  Object.defineProperty(
    res, "redirected", {value: uri !== dirUri, writable: false});
  return Object.defineProperty(res, "url", {value: dirUri, writable: false});  
};

const createIndexHTML = (files) => {
  const items = files.slice(1).map(file => {
    const name = file.type === "dir" && !file.name.endsWith("/") ? `${file.name}/` : file.name;
    return `<li><a href="${name}" rel="${file.type}">${name}</a></li>`;
  });
  return `<html><head></head><body><h1>${files[0].name}</h1><ul>${items.join("")}</ul></body></html>`;
};

const createNotFound = (uri, files) => {
  const res = new Response("Not Found", {
    status: 404,
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
  });
  return Object.defineProperty(res, "url", {value: uri, writable: false});
};

const createError = (uri, files) => {
  const res = new Response("Error", {
    status: 500,
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
  });
  return Object.defineProperty(res, "url", {value: uri, writable: false});
};
