import { Link } from 'react-router-dom'
import Badge from './Badge'
import { formatDate } from '../utils/formatDate'

// One report in a dashboard list: small picture, title, badges and a line of details.
// badges = extra statuses to show, children = buttons or anything else under it.
function ItemRow({ item, badges = [item.status], children }) {
  const isLost = item.report_type === 'LOST'
  const photo = item.images && item.images[0]

  return (
    <article className="item-row">
      <Link to={`/items/${item.item_id}`} className={`item-row-picture ${isLost ? 'is-lost' : 'is-found'}`} tabIndex={-1}>
        {photo ? <img src={photo.image_url} alt="" /> : <span aria-hidden="true">{item.title.charAt(0).toUpperCase()}</span>}
      </Link>

      <div className="item-row-body">
        <div className="item-row-top">
          <Link to={`/items/${item.item_id}`} className="item-row-title">
            {item.title}
          </Link>
          <div className="item-row-badges">
            {badges.map((status) => (
              <Badge key={status} status={status} />
            ))}
          </div>
        </div>

        <p className="item-row-meta">
          {isLost ? 'Lost' : 'Found'} on {formatDate(item.event_date)} · {item.location_label}
        </p>

        {children}
      </div>
    </article>
  )
}

export default ItemRow
