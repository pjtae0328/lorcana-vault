import { store } from '../store.js'
import { renderSearchBar } from '../components/search-bar.js'
import { renderRarityFilter } from '../components/rarity-filter.js'
import { renderCardGrid } from '../components/card-grid.js'

const CHARACTER_FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'stitch', label: 'Stitch' },
  { key: 'lilo', label: 'Lilo' },
  { key: 'nani', label: 'Nani' },
  { key: 'jumba', label: 'Jumba' },
  { key: 'pleakley', label: 'Pleakley' },
  { key: 'angel', label: 'Angel' }
]

export function renderStitchLilo(container) {
  const allCards = store.getStitchLiloCards()

  container.innerHTML = `
    <section class="hero hero-stitch">
      <div class="hero-content">
        <h1 class="hero-title">🌺 Stitch & Lilo</h1>
        <p class="hero-subtitle">릴로 & 스티치 프랜차이즈 카드 컬렉션</p>
      </div>
    </section>

    <div class="container section">
      <div id="stitch-search"></div>
      <div id="stitch-rarity-filter"></div>
      <div class="character-tabs" id="character-tabs"></div>
      <p class="card-count" id="stitch-count"></p>
      <div id="stitch-card-grid"></div>
    </div>
  `

  let currentQuery = ''
  let currentRarities = []
  let currentCharacter = 'all'

  const gridContainer = container.querySelector('#stitch-card-grid')
  const countEl = container.querySelector('#stitch-count')
  const tabsContainer = container.querySelector('#character-tabs')

  // Character tabs
  tabsContainer.innerHTML = CHARACTER_FILTERS.map(ch => `
    <button class="character-tab${ch.key === 'all' ? ' active' : ''}" data-character="${ch.key}">${ch.label}</button>
  `).join('')

  tabsContainer.addEventListener('click', (e) => {
    const tab = e.target.closest('.character-tab')
    if (!tab) return

    currentCharacter = tab.dataset.character
    tabsContainer.querySelectorAll('.character-tab').forEach(t => t.classList.remove('active'))
    tab.classList.add('active')
    updateDisplay()
  })

  function updateDisplay() {
    let filtered = allCards

    // Character filter
    if (currentCharacter !== 'all') {
      const ch = currentCharacter.toLowerCase()
      filtered = filtered.filter(c => (c.name || '').toLowerCase().includes(ch))
    }

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

    filtered = store.sortByRarity(filtered)

    countEl.textContent = `${filtered.length}개 카드`
    renderCardGrid(gridContainer, filtered, { showSetName: true })
  }

  // Search bar
  renderSearchBar(container.querySelector('#stitch-search'), {
    placeholder: '캐릭터 카드 검색...',
    onSearch: (query) => {
      currentQuery = query
      updateDisplay()
    }
  })

  // Rarity filter
  renderRarityFilter(container.querySelector('#stitch-rarity-filter'), {
    onFilter: (rarities) => {
      currentRarities = rarities
      updateDisplay()
    }
  })

  updateDisplay()
}
