import * as FetchIpfs from "http://localhost:10000/fetch-ipfs.js";

//NOTE: matched versions for current Ipfs-0.40.0 and IpfsHttpResponse-0.4.0
import "https://cdn.jsdelivr.net/npm/ipfs/dist/index.js";
//import "https://cdn.jsdelivr.net/npm/ipfs@0.40.0/dist/index.js";
//import "https://cdn.jsdelivr.net/npm/ipfs-http-response@0.4.0/dist/index.js";
//console.debug(window.Ipfs);

const main = async () => {
  console.info("[INFO] IPFS node spawn several logs includes WebSocket Errors");
  const node = await Ipfs.create({
    repo: `ipfs-${Math.random()}`,
    relay: {enabled: true, hop: {enabled: true, active: true}},
  });
  await node.ready;

  //console.debug("IPFS version:", (await node.version()).version);
  //console.debug(`Peer ID:`, (await node.id()).id);

  const ipfsFetch = FetchIpfs.createFetch(node);
  //const ipfsFetch = FetchIpfs.createFetch(node, {IpfsHttpResponse});
  
  const url1 = "https://gateway.ipfs.io/ipfs/QmQ2r6iMNpky5f1m4cnm3Yqw8VSvjuKpTcK1X7dBR1LkJF/cat.gif";
  const res1 = await ipfsFetch(url1);
  //console.debug(res1.url);
  //console.debug(res1.headers.get("content-type"));
  const content1 = await res1.arrayBuffer();
  //NOTE: no content-length header in Response from js-ipfs-http-response
  console.assert(content1.byteLength === 1629326, "byteLength");
  console.assert(
    res1.headers.get("content-type") === "image/gif", "content-type");

  await node.stop();
  if (typeof window.finish === "function") window.finish();
};
main().catch(console.error);
