import { store } from '../store.js'
import { renderSearchBar } from '../components/search-bar.js'
import { renderRarityFilter } from '../components/rarity-filter.js'
import { renderInkFilter } from '../components/ink-filter.js'
import { renderCardGrid } from '../components/card-grid.js'

export function renderPromo(container) {
  const promoSets = store.getPromoSets()

  // Collect all promo cards across all promo sets
  let allPromoCards = []
  for (const set of promoSets) {
    const cards = store.getCardsBySet(set.code)
    allPromoCards = allPromoCards.concat(cards)
  }

  container.innerHTML = `
    <div class="container section">
      <h1 class="page-title">프로모 카드</h1>
      <div id="promo-search"></div>
      <div id="promo-rarity-filter"></div>
      <div id="promo-ink-filter"></div>
      <div class="promo-tabs" id="promo-tabs"></div>
      <p class="card-count" id="promo-count"></p>
      <div id="promo-card-grid"></div>
    </div>
  `

  let currentQuery = ''
  let currentRarities = []
  let currentInks = []
  let currentSetCode = 'all'

  const gridContainer = container.querySelector('#promo-card-grid')
  const countEl = container.querySelector('#promo-count')
  const tabsContainer = container.querySelector('#promo-tabs')

  // Render set tabs
  tabsContainer.innerHTML = `
    <button class="promo-tab active" data-set="all">전체</button>
    ${promoSets.map(s => `
      <button class="promo-tab" data-set="${s.code}">${s.name}</button>
    `).join('')}
  `

  tabsContainer.addEventListener('click', (e) => {
    const tab = e.target.closest('.promo-tab')
    if (!tab) return

    currentSetCode = tab.dataset.set
    tabsContainer.querySelectorAll('.promo-tab').forEach(t => t.classList.remove('active'))
    tab.classList.add('active')
    updateDisplay()
  })

  function updateDisplay() {
    let filtered = currentSetCode === 'all'
      ? allPromoCards
      : store.getCardsBySet(currentSetCode)

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

    filtered = store.sortByRarity(filtered)

    countEl.textContent = `${filtered.length}개 카드`
    renderCardGrid(gridContainer, filtered, { showSetName: true })
  }

  // Search bar
  renderSearchBar(container.querySelector('#promo-search'), {
    placeholder: '프로모 카드 검색...',
    onSearch: (query) => {
      currentQuery = query
      updateDisplay()
    }
  })

  // Rarity filter
  renderRarityFilter(container.querySelector('#promo-rarity-filter'), {
    onFilter: (rarities) => {
      currentRarities = rarities
      updateDisplay()
    }
  })

  // Ink filter
  renderInkFilter(container.querySelector('#promo-ink-filter'), {
    onFilter: (inks) => {
      currentInks = inks
      updateDisplay()
    }
  })

  updateDisplay()
}
