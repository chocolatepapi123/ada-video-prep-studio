import { ShieldCheck } from 'lucide-react'

export default function Header() {
  return (
    <header className="header">
      <div className="brand">
        <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="RADA" width="40" height="40" />
        <div>
          <div className="brand-name">RADA Video Prep Studio</div>
          <div className="privacy"><ShieldCheck size={14} /> Your files stay on your device.</div>
        </div>
      </div>
    </header>
  )
}
