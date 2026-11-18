import VideoCard from './VideoCard.jsx'

export default function VideoQueue({ items, onRemove }) {
  return <ul className="queue">{items.map((i) => <VideoCard key={i.id} item={i} onRemove={onRemove} />)}</ul>
}
