export function fail(status,message){return Object.assign(new Error(message),{status})}
export function fields(body){
  const id=body.asset_id?.trim?.(), category=body.category?.trim?.()
  if(!id || id.length>80 || !category || category.length>100) throw fail(400,'Enter an asset ID (1–80 characters) and category (1–100 characters).')
  return {id,category}
}
