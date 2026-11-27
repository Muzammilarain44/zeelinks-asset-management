import test from 'node:test'
import assert from 'node:assert/strict'
import {spawn} from 'node:child_process'
import {once} from 'node:events'
import {mkdtemp,rm,readdir} from 'node:fs/promises'
import {tmpdir,networkInterfaces} from 'node:os'
import path from 'node:path'
import sharp from 'sharp'
import {chromium} from 'playwright-core'
test('warehouse production workflow',async()=>{
 const directory=await mkdtemp(path.join(tmpdir(),'zee-'))
 const base='http://127.0.0.1:39188'
 async function start(){
   const proc=spawn(process.execPath,['server/index.js'],{env:{...process.env,DATA_DIR:directory,PORT:'39188'}})
   await once(proc.stdout,'data');return proc
 }
 async function stop(proc){const done=once(proc,'exit');proc.kill();await done}
 let proc=await start(), browser
 try{
 const image=await sharp({create:{width:20,height:20,channels:3,background:'#577'}}).png().toBuffer()
 async function post(id,bytes=image){const data=new FormData();data.set('asset_id',id);data.set('category','Equipment');data.set('photo',new Blob([bytes]),'fixture.png');return fetch(base+'/api/assets',{method:'POST',body:data})}
 assert.equal((await post('')).status,400)
 assert.equal((await post('BAD','invalid')).status,400)
 assert.equal((await post('BIG',Buffer.alloc(5242881))).status,413)
 const response=await post('TEST-001');assert.equal(response.status,201)
 const {data}=await response.json()
 assert.equal((await post('test-001')).status,409)
 assert.equal((await readdir(path.join(directory,'images'))).length,1)
 await stop(proc);proc=await start()
 assert.equal((await (await fetch(base+'/api/assets/'+data.id)).json()).data.asset_id,'TEST-001')
 assert.equal((await fetch(base+data.image_path)).headers.get('content-type'),'image/webp')
 for(const [query,count] of [['001',1],['missing',0]])assert.equal((await (await fetch(base+'/api/assets?search='+query)).json()).data.length,count)
 assert.equal((await fetch(base+'/api/assets/999')).status,404)
 const ip=Object.values(networkInterfaces()).flat().find(i=>!i.internal&&i.family==='IPv4')
 if(ip)assert.equal((await fetch('http://'+ip.address+':39188/api/health')).status,200)
 if(process.env.CHROME_PATH){
 browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox']})
 const page=await browser.newPage();await page.goto(base)
 await page.getByRole('button',{name:'TEST-001'}).waitFor()
 await page.screenshot({path:'docs/desktop.png'})
 await page.setViewportSize({width:390,height:844})
 await page.screenshot({path:'docs/mobile.png'})
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))
 await page.getByRole('button',{name:'TEST-001'}).click();await page.getByRole('img').waitFor()
 await page.getByRole('button',{name:'Inventory'}).click()
 await page.getByRole('button',{name:/Add new asset/}).click()
 await page.getByRole('button',{name:'Save asset'}).click()
 assert.equal(await page.locator('form').evaluate(f=>f.checkValidity()),false)
 await page.getByLabel('Asset ID',{exact:true}).fill('UI-002')
 await page.getByLabel('Asset category').fill('Equipment')
 await page.getByLabel('Photograph').setInputFiles({name:'fixture.png',mimeType:'image/png',buffer:image})
 await page.getByRole('button',{name:'Save asset'}).click()
 await page.getByRole('button',{name:'UI-002'}).waitFor()
 }
 }finally{await browser?.close();await stop(proc);await rm(directory,{recursive:true,force:true})}
})
