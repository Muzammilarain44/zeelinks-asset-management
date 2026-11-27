import express from 'express'
import multer from 'multer'
import path from 'node:path'
import {uploads} from './db.js'
import {create,list,detail} from './controllers.js'
import {fail} from './validation.js'
const app=express()
app.disable('x-powered-by')
app.use((_req,res,next)=>{res.set('X-Content-Type-Options','nosniff');next()})
const upload=multer({limits:{fileSize:5*1024*1024,files:1,fields:2,fieldSize:512}})
app.get('/api/health',(_req,res)=>res.json({data:{status:'ok'}}))
app.route('/api/assets').get(list).post(upload.single('photo'),create)
app.get('/api/assets/:id',detail)
app.get('/images/:name',(req,res,next)=>{
  if(!/^[a-f0-9-]{36}\.webp$/.test(req.params.name))return next(fail(404,'Image not found.'))
  res.sendFile(path.join(uploads,req.params.name))
})
app.use(express.static('dist'))
app.use((_req,_res,next)=>next(fail(404,'Resource not found.')))
app.use((err,_req,res,_next)=>{
  const status=err instanceof multer.MulterError?(err.code==='LIMIT_FILE_SIZE'?413:400):err.status||500
  if(status===500)console.error(err)
  res.status(status).json({error:status===500?'Server error':status===413?'Photograph exceeds 5 MB.':err.message})
})
app.listen(Number(process.env.PORT||3000),process.env.HOST||'0.0.0.0',()=>console.log('Warehouse server ready'))
