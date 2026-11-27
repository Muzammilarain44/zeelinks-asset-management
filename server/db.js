import {DatabaseSync} from 'node:sqlite'
import {mkdirSync} from 'node:fs'
import path from 'node:path'
const root=path.resolve(process.env.DATA_DIR || 'storage')
export const uploads=path.join(root,'images')
mkdirSync(uploads,{recursive:true})
const db=new DatabaseSync(path.join(root,'assets.sqlite'))
db.exec(`CREATE TABLE IF NOT EXISTS assets(id INTEGER PRIMARY KEY,asset_id TEXT NOT NULL COLLATE NOCASE UNIQUE,category TEXT NOT NULL,image_path TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT(strftime('%Y-%m-%dT%H:%M:%fZ','now')))`)
export const records={
  insert:(id,category,image)=>db.prepare('INSERT INTO assets(asset_id,category,image_path) VALUES(?,?,?) RETURNING *').get(id,category,image),
  list:search=>db.prepare('SELECT * FROM assets WHERE instr(lower(asset_id),lower(?))>0 ORDER BY id DESC').all(search),
  get:id=>db.prepare('SELECT * FROM assets WHERE id=?').get(id)
}
