// this bundle maybe non ES-module, but it can import to load as `window.Ipfs`
// (js-ipfs 0.39.0)
import "https://cdn.jsdelivr.net/npm/ipfs/dist/index.js";
console.log(window.Ipfs);


const main = async () => {
  const node = new Ipfs({
    repo: `ipfs-${Math.random()}`,
    relay: {enabled: true, hop: {enabled: true, active: true}},
  });
  await node.ready;

  console.log("IPFS version:", (await node.version()).version);
  console.log(`Peer ID:`, (await node.id()).id);

  // fetch content by cid from ipfs node on browser
  // check on web console
  
  // this cid is dir that includes only "cat.gif"
  // by https://github.com/ipfs/interface-js-ipfs-core/blob/master/SPEC/FILES.md
  const cid = `QmQ2r6iMNpky5f1m4cnm3Yqw8VSvjuKpTcK1X7dBR1LkJF`;
  console.log(`await to node.get("${cid})`);
  const files = await node.get(cid);
  console.log(files);
  // files[0].type === "dir"
  // files[0].depth === 1
  // files[0].hash === "QmQ2r6iMNpky5f1m4cnm3Yqw8VSvjuKpTcK1X7dBR1LkJF"
  // files[0].name === "QmQ2r6iMNpky5f1m4cnm3Yqw8VSvjuKpTcK1X7dBR1LkJF"
  // files[0].path === "QmQ2r6iMNpky5f1m4cnm3Yqw8VSvjuKpTcK1X7dBR1LkJF"
  // files[1].size === 0
  // 
  // files[1].type === "file"
  // files[0].depth === 2
  // files[1].hash === "QmVracrju5M723tsMazcVCe3YTiG3D5TV1powDywLWHSyD"
  // files[1].name === "cat.gif"
  // files[1].path === "QmQ2r6iMNpky5f1m4cnm3Yqw8VSvjuKpTcK1X7dBR1LkJF/cat.gif"
  // files[1].size === 1629326
  // files[1].content instanceof Uint8Array

  // file itself by cid
  console.log(await node.get("QmVracrju5M723tsMazcVCe3YTiG3D5TV1powDywLWHSyD"));
  // r[0].type === "file"
  // r[0].depth === 1
  // r[0].hash === "QmVracrju5M723tsMazcVCe3YTiG3D5TV1powDywLWHSyD"
  // r[0].name === "QmVracrju5M723tsMazcVCe3YTiG3D5TV1powDywLWHSyD"
  // r[0].path === "QmVracrju5M723tsMazcVCe3YTiG3D5TV1powDywLWHSyD"
  // r[0].size === 1629326
  // r[0].content instanceof Uint8Array
  
  // file itself by named in dir
  console.log(
    await node.get(`QmQ2r6iMNpky5f1m4cnm3Yqw8VSvjuKpTcK1X7dBR1LkJF/cat.gif`));
  // r[0].type === "file"
  // r[0].depth === 2
  // r[0].hash === "QmVracrju5M723tsMazcVCe3YTiG3D5TV1powDywLWHSyD"
  // r[0].name === "cat.gif"
  // r[0].path === "QmQ2r6iMNpky5f1m4cnm3Yqw8VSvjuKpTcK1X7dBR1LkJF/cat.gif"
  // r[0].size === 1629326
  // r[0].content instanceof Uint8Array

  //NOTE
};
main().catch(err => console.error("error", err));
