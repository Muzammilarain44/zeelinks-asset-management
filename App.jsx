import React,{useState,useEffect} from 'react'
import {createRoot} from 'react-dom/client'
import './style.css'
async function api(url,options){
  const response=await fetch(url,options), result=await response.json()
  if(!response.ok)throw Error(result.error)
  return result.data
}
const local=value=>new Date(value).toLocaleString()
function Form({saved,cancel}){
  const [file,setFile]=useState(null),[preview,setPreview]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false)
  useEffect(()=>{if(!file){setPreview('');return}const url=URL.createObjectURL(file);setPreview(url);return()=>URL.revokeObjectURL(url)},[file])
  async function submit(e){
    e.preventDefault()
    const body=new FormData(e.currentTarget)
    if(!body.get('asset_id').trim()||!body.get('category').trim())return setError('Enter an ID and category.')
    if(!file||file.size>5242880||!['image/jpeg','image/png','image/webp'].includes(file.type))return setError('Choose a JPEG, PNG or WebP up to 5 MB.')
    setBusy(true);setError('')
    try{await api('/api/assets',{method:'POST',body});saved()}catch(err){setError(err.message);setBusy(false)}
  }
  return <form onSubmit={submit}><label>Asset ID<input required name="asset_id" maxLength="80"/></label><label>Asset category<input required name="category" maxLength="100"/></label><label>Photograph<input required type="file" name="photo" accept="image/jpeg,image/png,image/webp" onChange={e=>setFile(e.target.files[0])}/></label><small>JPEG, PNG or WebP · Maximum 5 MB</small>{preview&&<img className="preview" src={preview} alt="Selected photograph"/>}<p role="alert">{error}</p><button disabled={busy}>{busy?'Saving…':'Save asset'}</button> <button type="button" disabled={busy} className="secondary" onClick={cancel}>Cancel</button></form>
}
function App(){
  const [page,setPage]=useState('list'),[query,search]=useState(''),[rows,setRows]=useState([]),[item,setItem]=useState(null),[busy,loading]=useState(true),[message,notify]=useState(''),[now,tick]=useState(new Date())
  useEffect(()=>{const timer=setInterval(()=>tick(new Date()),1000);return()=>clearInterval(timer)},[])
  useEffect(()=>{if(page==='add')return
    let active=true;loading(true)
    const listing=page==='list'
    api(listing?'/api/assets?search='+encodeURIComponent(query):'/api/assets/'+page).then(data=>{if(active)(listing?setRows:setItem)(data)}).catch(e=>{if(active){notify(e.message);setRows([]);setItem(null)}}).finally(()=>active&&loading(false))
    return()=>{active=false}
  },[page,query])
  function go(value){notify('');loading(true);setPage(value)}
  return <><header><div className="brand"><b>ZL</b> Zee Links</div><span>Warehouse operations</span></header><main><nav><button className="link" onClick={()=>page!=='list'&&go('list')}>Inventory</button> / {page==='list'?'Overview':page==='add'?'New asset':'Record details'}</nav><div className="heading"><div><small>WAREHOUSE MANAGEMENT</small><h1>{page==='list'?'Asset register':page==='add'?'Add new asset':'Asset details'}</h1></div>{page==='list'&&<button onClick={()=>go('add')}>＋ Add new asset</button>}</div><p className="clock">{local(now)}</p>{message&&<p role="status">{message}</p>}<section>{page==='add'?<Form cancel={()=>go('list')} saved={()=>{search('');go('list');notify('Asset saved successfully.')}}/>:page==='list'?<><div className="toolbar"><h2>Asset records</h2><input aria-label="Search by asset ID" type="search" placeholder="Search by asset ID" value={query} onChange={e=>search(e.target.value)}/></div><div className="overflow-x-auto"><table><thead><tr><th>Asset ID</th><th>Category</th><th>Registered</th></tr></thead><tbody>{!busy&&rows.map(r=><tr key={r.id}><td><button className="link" onClick={()=>go(r.id)}>{r.asset_id}</button></td><td>{r.category}</td><td>{local(r.created_at)}</td></tr>)}</tbody></table></div>{(busy||!rows.length)&&<div className="empty"><h2>{busy?'Loading records…':query?'No matching assets':'No assets registered'}</h2><p>{!busy&&(query?'Try another identification number.':'Add your first asset to start the register.')}</p></div>}</>:busy?'Loading asset…':item&&<article><img className="preview" src={item.image_path} alt={'Photograph of '+item.asset_id}/><h2>{item.asset_id}</h2><p>{item.category}</p><p>Registered {local(item.created_at)}</p></article>}</section></main></>
}
createRoot(document.getElementById('root')).render(<App/>)
