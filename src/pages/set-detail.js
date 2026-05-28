import { store } from '../store.js'
import { renderSearchBar } from '../components/search-bar.js'
import { renderRarityFilter } from '../components/rarity-filter.js'
import { renderInkFilter } from '../components/ink-filter.js'
import { renderCardGrid } from '../components/card-grid.js'

export function renderSetDetail(container, params) {
  const code = params?.code
  const set = store.getSetByCode(code)

  if (!set) {
    container.innerHTML = `
      <div class="container section">
        <p class="empty-state-text">세트를 찾을 수 없습니다.</p>
        <a href="#/" class="back-link">← 홈으로 돌아가기</a>
      </div>
    `
    return
  }

  const allCards = store.getCardsBySet(code)

  container.innerHTML = `
    <div class="container section">
      <a href="#/" class="back-link">← 전체 세트</a>
      <div class="set-header">
        <h1 class="set-title">${set.name}</h1>
        <div class="set-meta-info">
          <span class="set-release">${set.released_at || ''}</span>
          <span class="set-divider">·</span>
          <span class="set-total">${set.card_count}장</span>
        </div>
      </div>
      <div id="set-search"></div>
      <div id="set-rarity-filter"></div>
      <div id="set-ink-filter"></div>
      <p class="card-count" id="card-count"></p>
      <div id="set-card-grid"></div>
    </div>
  `

  let currentQuery = ''
  let currentRarities = []
  let currentInks = []

  const gridContainer = container.querySelector('#set-card-grid')
  const countEl = container.querySelector('#card-count')

  function updateDisplay() {
    let filtered = allCards

    // Search filter
    if (currentQuery) {
      const q = currentQuery.toLowerCase()
      filtered = filtered.filter(c => {
        const name = (c.name || '').toLowerCase()
        const version = (c.version || '').toLowerCase()
        const fullName = (c.fullName || '').toLowerCase()
        return name.includes(q) || version.includes(q) || fullName.includes(q)
      })
    }

    // Rarity filter
    if (currentRarities.length > 0) {
      filtered = store.filterByRarity(filtered, currentRarities)
    }

    // Ink filter
    if (currentInks.length > 0) {
      filtered = filtered.filter(c => currentInks.includes(c.ink))
    }

    // Sort by rarity (rarest first)
    filtered = store.sortByRarity(filtered)

    countEl.textContent = `${filtered.length}개 카드`
    renderCardGrid(gridContainer, filtered)
  }

  // Search bar
  renderSearchBar(container.querySelector('#set-search'), {
    placeholder: `${set.name} 카드 검색...`,
    onSearch: (query) => {
      currentQuery = query
      updateDisplay()
    }
  })

  // Rarity filter
  renderRarityFilter(container.querySelector('#set-rarity-filter'), {
    onFilter: (rarities) => {
      currentRarities = rarities
      updateDisplay()
    }
  })

  // Ink filter
  renderInkFilter(container.querySelector('#set-ink-filter'), {
    onFilter: (inks) => {
      currentInks = inks
      updateDisplay()
    }
  })

  // Initial display
  updateDisplay()
}
