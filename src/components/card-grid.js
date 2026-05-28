import { showCardModal } from './card-modal.js'
import { showTooltip, hideTooltip, moveTooltip } from './card-tooltip.js'

const RARITY_COLORS = {
  Enchanted: '#ff6bef',
  Iconic: '#ff9500',
  Epic: '#e040fb',
  Legendary: '#ffd700',
  Super_rare: '#7c4dff',
  Rare: '#2979ff',
  Uncommon: '#00c853',
  Common: '#90a4ae',
  Promo: '#ff6d00'
}

function formatPrice(price) {
  if (price == null) return '—'
  return `$${Number(price).toFixed(2)}`
}

function rarityLabel(rarity) {
  if (!rarity) return ''
  return rarity.replace('_', ' ')
}

export function renderCardGrid(container, cards, options = {}) {
  const { onCardClick, showSetName = false } = options

  if (!cards || cards.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p class="empty-state-icon">🔮</p>
        <p class="empty-state-text">카드를 찾을 수 없습니다</p>
      </div>
    `
    return
  }

  const grid = document.createElement('div')
  grid.className = 'card-grid'

  grid.innerHTML = cards.map((card, index) => {
    const color = RARITY_COLORS[card.rarity] || '#90a4ae'
    return `
      <div class="card-item" data-card-index="${index}" tabindex="0">
        <div class="card-image-wrap">
          <img
            src="${card.image_small || card.image || ''}"
            alt="${card.fullName || card.name || ''}"
            class="card-image"
            loading="lazy"
          />
          <span class="rarity-badge" style="background:${color}">${rarityLabel(card.rarity)}</span>
        </div>
        <div class="card-info">
          <p class="card-name">${card.name_ko || card.name || ''}</p>
          ${(card.version_ko || card.version) ? `<p class="card-version">${card.version_ko || card.version}</p>` : ''}
          ${showSetName ? `<p class="card-set-name">${card.set_name_ko || card.set_name || ''}</p>` : ''}
          <div class="card-prices">
            ${card.prices?.usd != null ? `<span class="price-normal">${formatPrice(card.prices.usd)}</span>` : ''}
            ${card.prices?.usd_foil != null ? `<span class="price-foil">포일 ${formatPrice(card.prices.usd_foil)}</span>` : ''}
          </div>
        </div>
      </div>
    `
  }).join('')

  container.innerHTML = ''
  container.appendChild(grid)

  // Event delegation for card clicks
  grid.addEventListener('click', (e) => {
    const cardItem = e.target.closest('.card-item')
    if (!cardItem) return

    const index = parseInt(cardItem.dataset.cardIndex, 10)
    const card = cards[index]
    if (!card) return

    if (onCardClick) {
      onCardClick(card)
    } else {
      showCardModal(card)
    }
  })

  // Keyboard support
  grid.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const cardItem = e.target.closest('.card-item')
      if (!cardItem) return

      e.preventDefault()
      const index = parseInt(cardItem.dataset.cardIndex, 10)
      const card = cards[index]
      if (!card) return

      if (onCardClick) {
        onCardClick(card)
      } else {
        showCardModal(card)
      }
    }
  })

  // Tooltip on hover (event delegation)
  grid.addEventListener('mouseenter', (e) => {
    const cardItem = e.target.closest('.card-item')
    if (!cardItem) return
    const index = parseInt(cardItem.dataset.cardIndex, 10)
    const card = cards[index]
    if (card) showTooltip(card, e)
  }, true)

  grid.addEventListener('mouseleave', (e) => {
    const cardItem = e.target.closest('.card-item')
    if (!cardItem) return
    hideTooltip()
  }, true)

  grid.addEventListener('mousemove', (e) => {
    const cardItem = e.target.closest('.card-item')
    if (!cardItem) return
    const index = parseInt(cardItem.dataset.cardIndex, 10)
    const card = cards[index]
    if (card) moveTooltip(e)
  })
}
