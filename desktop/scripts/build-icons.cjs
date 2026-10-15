// Renders assets/icon-source.svg into fadeyin-icon.png/.ico/.icns and ui/app-icon.png.
// Usage: xvfb-run node scripts/build-icons.cjs   (any machine with a display works too)
// macOS (.icns) keeps Apple's 1024 grid with an 824 tile and shadow; Windows (.ico), the window/tray
// icon and the in-app logo use a near full-bleed crop, because Windows draws no tile margin of its own.
const {_electron}=require('playwright-core'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const root=path.join(__dirname,'..'),svg=fs.readFileSync(path.join(root,'assets/icon-source.svg'),'utf8');
const variants={
 mac:svg,
 bleed:svg.replace('viewBox="0 0 1024 1024"','viewBox="76 76 872 872"').replace(' filter="url(#iconShadow)"','')
};
(async()=>{
 const app=await _electron.launch({args:[root,'--no-sandbox','--user-data-dir='+fs.mkdtempSync(path.join(os.tmpdir(),'pianlala-icon-'))]});
 const page=await app.firstWindow();
 const render=async(source,size)=>{await page.setViewportSize({width:size,height:size}).catch(()=>{});await page.setContent(`<html><body style="margin:0;background:transparent">${source.replace('width="1024" height="1024"',`width="${size}" height="${size}"`)}</body></html>`);return page.screenshot({omitBackground:true,clip:{x:0,y:0,width:size,height:size}})};
 const sizes=[16,20,24,32,40,48,64,96,128,256,512,1024],mac={},bleed={};
 for(const s of sizes){mac[s]=await render(variants.mac,s);bleed[s]=await render(variants.bleed,s)}
 await app.close();
 fs.writeFileSync(path.join(root,'assets/fadeyin-icon.png'),bleed[1024]);
 fs.writeFileSync(path.join(root,'ui/app-icon.png'),bleed[1024]);
 const ico=[16,20,24,32,40,48,64,96,128,256],head=Buffer.alloc(6+16*ico.length);head.writeUInt16LE(1,2);head.writeUInt16LE(ico.length,4);let off=head.length;
 ico.forEach((s,i)=>{const e=6+16*i;head[e]=s===256?0:s;head[e+1]=s===256?0:s;head.writeUInt16LE(1,e+4);head.writeUInt16LE(32,e+6);head.writeUInt32LE(bleed[s].length,e+8);head.writeUInt32LE(off,e+12);off+=bleed[s].length});
 fs.writeFileSync(path.join(root,'assets/fadeyin-icon.ico'),Buffer.concat([head,...ico.map(s=>bleed[s])]));
 const chunks=[['icp4',16],['icp5',32],['icp6',64],['ic07',128],['ic08',256],['ic09',512],['ic10',1024],['ic11',32],['ic12',64],['ic13',256],['ic14',512]].map(([type,s])=>{const h=Buffer.alloc(8);h.write(type,0,'ascii');h.writeUInt32BE(mac[s].length+8,4);return Buffer.concat([h,mac[s]])});
 const body=Buffer.concat(chunks),icnsHead=Buffer.alloc(8);icnsHead.write('icns',0,'ascii');icnsHead.writeUInt32BE(body.length+8,4);
 fs.writeFileSync(path.join(root,'assets/fadeyin-icon.icns'),Buffer.concat([icnsHead,body]));
 console.log('icons written');
})().catch(e=>{console.error(e);process.exit(1)});
