import { store } from '../store.js'

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

function renderStatItem(label, value) {
  if (value == null) return ''
  return `<div class="stat-item"><span class="stat-label">${label}</span><span class="stat-value">${value}</span></div>`
}

export function showCardModal(card) {
  if (!card) return

  const overlay = document.getElementById('card-modal-overlay')
  if (!overlay) return

  const psaData = store.getPsaPop(card.tcgplayer_id)
  const color = RARITY_COLORS[card.rarity] || '#90a4ae'

  overlay.innerHTML = `
    <div class="modal-content" role="dialog" aria-label="${card.fullName || card.name}">
      <button class="modal-close" aria-label="닫기">&times;</button>
      <div class="modal-body">
        <div class="modal-image-section">
          <img
            src="${card.image_large || card.image || ''}"
            alt="${card.fullName || card.name || ''}"
            class="modal-card-image"
          />
        </div>
        <div class="modal-info-section">
          <div class="modal-header">
            <h2 class="modal-card-name">${card.name_ko || card.name || ''}</h2>
            ${(card.version_ko || card.version) ? `<p class="modal-card-version">${card.version_ko || card.version}</p>` : ''}
            ${(card.name_ko && card.fullName) ? `<p class="modal-card-name-en" style="font-size:0.8rem;opacity:0.5;margin-top:0.2rem">${card.fullName}</p>` : ''}
            <span class="rarity-badge rarity-badge-lg" style="background:${color}">${rarityLabel(card.rarity)}</span>
          </div>

          <div class="modal-stats">
            ${renderStatItem('비용', card.cost)}
            ${renderStatItem('힘', card.strength)}
            ${renderStatItem('의지력', card.willpower)}
            ${renderStatItem('로어', card.lore)}
            ${renderStatItem('잉크', card.ink)}
            ${renderStatItem('잉크웰', card.inkwell ? '✓' : '✗')}
          </div>

          ${(card.text_ko || card.text) ? `
            <div class="modal-section">
              <h3 class="modal-section-title">카드 텍스트</h3>
              <p class="modal-card-text">${card.text_ko || card.text}</p>
            </div>
          ` : ''}

          ${card.classifications && card.classifications.length > 0 ? `
            <div class="modal-section">
              <h3 class="modal-section-title">분류</h3>
              <p class="modal-classifications">${(card.classifications_ko || card.classifications).join(' · ')}</p>
            </div>
          ` : ''}

          ${card.keywords && card.keywords.length > 0 ? `
            <div class="modal-section">
              <h3 class="modal-section-title">키워드</h3>
              <div class="modal-keywords">
                ${card.keywords.map(k => `<span class="keyword-tag">${k}</span>`).join('')}
              </div>
            </div>
          ` : ''}

          ${(card.flavor_text_ko || card.flavor_text) ? `
            <div class="modal-section">
              <p class="modal-flavor-text">${card.flavor_text_ko || card.flavor_text}</p>
            </div>
          ` : ''}

          ${card.illustrators && card.illustrators.length > 0 ? `
            <div class="modal-section">
              <p class="modal-illustrator">🎨 ${card.illustrators.join(', ')}</p>
            </div>
          ` : ''}

          ${card.set_name ? `
            <div class="modal-section">
              <h3 class="modal-section-title">수록 세트</h3>
              <a href="#/set/${card.set_code}" class="modal-set-link">${card.set_name_ko || card.set_name}</a>
              ${card.collector_number ? `<span class="modal-collector-num">#${card.collector_number}</span>` : ''}
            </div>
          ` : ''}

          <div class="modal-section modal-prices">
            <h3 class="modal-section-title">가격</h3>
            <div class="price-grid">
              <div class="price-item">
                <span class="price-label">일반</span>
                <span class="price-value">${formatPrice(card.prices?.usd)}</span>
              </div>
              <div class="price-item">
                <span class="price-label">포일</span>
                <span class="price-value">${formatPrice(card.prices?.usd_foil)}</span>
              </div>
            </div>
            ${card.tcgplayer_url ? `
              <a href="${card.tcgplayer_url}" target="_blank" rel="noopener noreferrer" class="tcgplayer-link">
                TCGPlayer에서 보기 →
              </a>
            ` : ''}
          </div>

          ${psaData ? `
            <div class="modal-section modal-psa">
              <h3 class="modal-section-title">PSA 등급</h3>
              <div class="psa-grid">
                <div class="psa-item">
                  <span class="psa-label">PSA 10</span>
                  <span class="psa-value">${psaData.psa10 ?? '—'}</span>
                </div>
                <div class="psa-item">
                  <span class="psa-label">전체</span>
                  <span class="psa-value">${psaData.total ?? '—'}</span>
                </div>
              </div>
            </div>
          ` : ''}

          ${card.type && card.type.length > 0 ? `
            <div class="modal-section">
              <p class="modal-card-type">유형: ${(card.type_ko || card.type).join(' / ')}</p>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `

  overlay.classList.remove('hidden')
  document.body.style.overflow = 'hidden'

  // Close handlers
  const closeBtn = overlay.querySelector('.modal-close')
  closeBtn.addEventListener('click', hideCardModal)

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) hideCardModal()
  })

  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      hideCardModal()
      document.removeEventListener('keydown', handleEsc)
    }
  }
  document.addEventListener('keydown', handleEsc)
}

export function hideCardModal() {
  const overlay = document.getElementById('card-modal-overlay')
  if (overlay) {
    overlay.classList.add('hidden')
    overlay.innerHTML = ''
  }
  document.body.style.overflow = ''
}
