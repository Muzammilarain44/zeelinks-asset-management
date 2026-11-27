import {records} from './db.js'
import {createAsset} from './service.js'
import {fail} from './validation.js'
export const create=async(req,res)=>res.status(201).json({data:await createAsset(req.body||{},req.file)})
export function list(req,res){
  const search=req.query.search??''
  if(typeof search!=='string')throw fail(400,'Search must be text.')
  res.json({data:records.list(search)})
}
export function detail(req,res){
  if(!/^\d+$/.test(req.params.id))throw fail(400,'Expected a numeric record ID.')
  const row=records.get(req.params.id)
  if(!row)throw fail(404,'Asset not found.')
  res.json({data:row})
}
