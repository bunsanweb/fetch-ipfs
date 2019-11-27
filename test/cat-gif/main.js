import * as FetchIpfs from "./modules/fetch-ipfs.js";
import "https://cdn.jsdelivr.net/npm/ipfs/dist/index.js";
//console.log(window.Ipfs);

const main = async () => {
  console.log("[INFO] IPFS node spawn several logs includes WebSocket Errors");
  const node = new Ipfs({
    repo: `ipfs-${Math.random()}`,
    relay: {enabled: true, hop: {enabled: true, active: true}},
  });
  await node.ready;

  //console.log("IPFS version:", (await node.version()).version);
  //console.log(`Peer ID:`, (await node.id()).id);

  const ipfsFetch = FetchIpfs.createFetch(node);
  
  const url1 = "https://gateway.ipfs.io/ipfs/QmQ2r6iMNpky5f1m4cnm3Yqw8VSvjuKpTcK1X7dBR1LkJF/cat.gif";
  const res1 = await ipfsFetch(url1);
  //console.log(res1.url);
  //console.log(res1.headers.get("content-type"));
  const content1 = await res1.arrayBuffer();
  //console.log(content1.byteLength);
  console.assert(content1.byteLength > 0, "byteLength");
  console.assert(
    res1.headers.get("content-type") === "image/gif", "content-type");
  console.assert(
    res1.headers.get("content-length") === `${content1.byteLength}`,
    "content-length");

  await node.stop();
  if (typeof window.finish === "function") window.finish();
};
main().catch(console.error);
