import sharp from 'sharp'
import {randomUUID} from 'node:crypto'
import {unlink} from 'node:fs/promises'
import path from 'node:path'
import {records,uploads} from './db.js'
import {fields,fail} from './validation.js'
export async function createAsset(body,file){
  const {id,category}=fields(body)
  if(!file) throw fail(400,'Choose a photograph.')
  const name=randomUUID()+'.webp', destination=path.join(uploads,name)
  try{
    const image=sharp(file.buffer,{limitInputPixels:40000000})
    const {format}=await image.metadata()
    if(!['jpeg','png','webp'].includes(format)) throw Error()
    await image.rotate().webp({quality:88}).toFile(destination)
  }catch{await unlink(destination).catch(()=>{});throw fail(400,'Choose a readable JPEG, PNG or WebP under 40 megapixels.')}
  try{return records.insert(id,category,'/images/'+name)}
  catch(error){await unlink(destination);if(error.errcode===2067) throw fail(409,'That asset ID already exists.');throw error}
}
