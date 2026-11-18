import { CheckCircle2, AlertCircle, Loader2, Clock, Download, X } from 'lucide-react'
import { formatSize, formatDuration, extOf } from '../utils/videoUtils.js'
import { download } from '../hooks.js'

const LABEL = { queued: 'Waiting', processing: 'Converting', done: 'Ready', error: 'Failed' }

export default function VideoCard({ item, onRemove }) {
  const { file, info, compat, status, progress, error } = item
  const Icon = { queued: Clock, processing: Loader2, done: CheckCircle2, error: AlertCircle }[status]
  return (
    <li className={`card video ${status}`}>
      <div className="video-top">
        <Icon size={22} className={`status-icon ${status}`} />
        <div className="video-meta">
          <div className="filename" title={file.name}>{file.name}</div>
          <div className="sub">
            {formatSize(file.size)} · {extOf(file.name).toUpperCase()} · {formatDuration(info.duration)}
            {info.width ? ` · ${info.width}×${info.height}` : ''}
          </div>
        </div>
        <button className="icon-btn" onClick={() => onRemove(item.id)} aria-label={`Remove ${file.name}`}><X size={18} /></button>
      </div>
      {compat && status === 'queued' && <div className={`compat ${compat.ok ? 'ok' : 'warn'}`}>{compat.ok ? 'Likely compatible. ' : 'Needs conversion. '}{compat.text}</div>}
      {status === 'processing' && (
        <div className="bar"><div style={{ width: `${Math.round(progress * 100)}%` }} /></div>
      )}
      {status === 'error' && <div className="compat err">{error}</div>}
      {status === 'done' && (
        <div className="done-row">
          <div className="sub">{item.outName} · {formatSize(item.outSize)}</div>
          <button className="btn small primary" onClick={() => download(item.url, item.outName)}><Download size={16} /> Download</button>
        </div>
      )}
      <div className="status-label">{LABEL[status]}{status === 'processing' ? ` ${Math.round(progress * 100)}%` : ''}</div>
    </li>
  )
}
