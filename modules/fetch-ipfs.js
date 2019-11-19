import "./mime-types.js";

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
    const files = await node.get(ipfsName);
    return createResponse(uri, files);
  };
  return fetch;
};

const createResponse = (uri, files) => {
  if (files.length === 0) return createNotFound(uri, files);
  if (files[0].type === "dir") return createIndex(uri, files);
  if (files[0].type === "file") return createFile(uri, files[0]);
  return createError(uri, files);
};

const createFile = (uri, file) => {
  const contentType =
        MimeTypes.lookup(file.name) || "application/octet-stream";
  const res = new Response(file.content, {
    status: 200,
    headers: {
      "Content-Length": file.size,
      "Content-Type": contentType,
    },
  });
  return Object.defineProperty(res, "url", {value: uri, writable: false});
};

const indexNames = ["index.html", "index.htm", "index.shtml"];

const createIndex = (uri, files) => {
  const dirUri =  uri.endsWith("/") ? uri : `${uri}/`;
  const index = files.find(file => indexNames.includes(file.name));
  if (index) return createFile(dirUri, index);
  
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
  //TBD: js-ipfs gateway directory index is build on js-ipfs-http-response
  // - src/dir-view/index.js
  const items = files.slice(1).map(file => {
    const name = file.type === "dir" && !file.path.endsWith("/") ?
          `${file.path}/` : file.path;
    const path = `/ipfs/${name}`;
    const data = file.type === "dir" ? "" : ` data-size="${
      file.size}" data.content-type="${
      MimeTypes.lookup(file.name) || "application/octet-stream"}"`;
    return `<li><a href="${name}" rel="${file.type}"${data}">${name}</a></li>`;
  });
  return `<html>
<head><title>${files[0].name}</title></head><body>
<h1>Index of ${files[0].name}</h1>
<ul>${items.join("")}</ul>
</body></html>`;
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
