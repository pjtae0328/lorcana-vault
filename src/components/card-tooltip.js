/**
 * 카드 호버 툴팁 컴포넌트
 * lorcana-kor 확장 프로그램의 renderTooltip()을 참고하여 구현
 */

let tooltipEl = null
let currentCard = null
let hideTimer = null

function esc(str) {
  if (!str) return ''
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function ensureTooltipElement() {
  if (tooltipEl) return tooltipEl
  tooltipEl = document.createElement('div')
  tooltipEl.id = 'card-tooltip'
  tooltipEl.className = 'card-tooltip card-tooltip--hidden'
  document.body.appendChild(tooltipEl)
  return tooltipEl
}

function renderTooltipContent(card) {
  const el = ensureTooltipElement()

  // 스탯 그리드 빌드
  const stats = []
  if (card.cost != null) stats.push({ label: '비용', value: `${card.cost} ⬡`, cls: 'stat--cost' })
  if (card.strength != null) stats.push({ label: '전투력', value: `${card.strength}`, cls: 'stat--str' })
  if (card.willpower != null) stats.push({ label: '의지력', value: `${card.willpower}`, cls: 'stat--wil' })
  if (card.lore != null) stats.push({ label: '로어', value: `${card.lore} ◊`, cls: 'stat--lore' })

  const statsHtml = stats.map(s => `
    <div class="tt-stat ${s.cls}">
      <span class="tt-stat-label">${s.label}</span>
      <span class="tt-stat-value">${s.value}</span>
    </div>
  `).join('')

  // 카드 텍스트
  const textHtml = (card.text_ko || card.text) ? `
    <div class="tt-text">${esc(card.text_ko || card.text)}</div>
  ` : ''

  // 플레이버 텍스트
  const flavorHtml = (card.flavor_text_ko || card.flavor_text) ? `
    <div class="tt-flavor">"${esc(card.flavor_text_ko || card.flavor_text)}"</div>
  ` : ''

  // 타입 + 분류
  const typeStr = (card.type_ko || card.type || []).join(' / ')
  const classStr = (card.classifications_ko || card.classifications || []).join(' · ')
  const inkColor = card.ink || ''

  // 잉크웰
  const inkwellHtml = card.inkwell ? '<span class="tt-inkwell">⬡ 잉크 활용</span>' : ''

  // 포맷 합법 여부
  const coreBadge = card.legal_core
    ? '<span class="tt-format tt-legal">Core ✓</span>'
    : '<span class="tt-format tt-banned">Core ✗</span>'
  const infBadge = card.legal_infinity
    ? '<span class="tt-format tt-legal">Infinity ✓</span>'
    : '<span class="tt-format tt-banned">Infinity ✗</span>'
  const formatHtml = (card.legal_core != null || card.legal_infinity != null)
    ? `<div class="tt-formats">${coreBadge}${infBadge}</div>` : ''

  // 레어리티 클래스
  const rarCls = `tt-rarity--${(card.rarity || 'common').toLowerCase().replace('_', '-').replace(' ', '-')}`

  el.innerHTML = `
    <div class="tt-container">
      <div class="tt-header">
        <div class="tt-title-row">
          <span class="tt-title">${esc(card.name_ko || card.name)}</span>
          <span class="tt-rarity ${rarCls}">${esc(card.rarity || '')}</span>
        </div>
        ${(card.version_ko || card.version) ? `<div class="tt-subtitle">${esc(card.version_ko || card.version)}</div>` : ''}
        <div class="tt-meta">
          <span class="tt-meta-ink">${esc(inkColor)}</span> · 
          <span>${esc(typeStr)}</span>
          ${classStr ? ` · <span>${esc(classStr)}</span>` : ''}
        </div>
      </div>

      ${stats.length > 0 ? `<div class="tt-stats">${statsHtml}</div>` : ''}

      <div class="tt-body">
        ${textHtml}
        ${flavorHtml}
      </div>

      <div class="tt-footer">
        ${inkwellHtml}
        <div class="tt-footer-row">
          <span class="tt-set">${esc(card.set_name_ko || card.set_name || '')}</span>
          ${formatHtml}
        </div>
        <span class="tt-original">${esc(card.fullName || '')}</span>
      </div>
    </div>
  `
}

function positionTooltip(e) {
  if (!tooltipEl) return
  const offset = 15
  const tw = tooltipEl.offsetWidth || 320
  const th = tooltipEl.offsetHeight || 280

  let x = e.clientX + offset
  if (x + tw > window.innerWidth) {
    x = e.clientX - tw - offset
  }
  if (x < 5) x = 5

  let y = e.clientY + offset
  if (y + th > window.innerHeight) {
    y = e.clientY - th - offset
  }
  if (y < 5) y = 5

  tooltipEl.style.left = `${x + window.scrollX}px`
  tooltipEl.style.top = `${y + window.scrollY}px`
}

export function showTooltip(card, e) {
  if (!card) return
  if (currentCard === card) {
    positionTooltip(e)
    return
  }

  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }

  currentCard = card
  renderTooltipContent(card)
  ensureTooltipElement()
  tooltipEl.classList.remove('card-tooltip--hidden')
  tooltipEl.classList.add('card-tooltip--visible')
  positionTooltip(e)
}

export function hideTooltip() {
  if (hideTimer) clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    if (tooltipEl) {
      tooltipEl.classList.remove('card-tooltip--visible')
      tooltipEl.classList.add('card-tooltip--hidden')
    }
    currentCard = null
    hideTimer = null
  }, 50)
}

export function moveTooltip(e) {
  positionTooltip(e)
}
