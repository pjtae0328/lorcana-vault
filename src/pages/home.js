import { store } from '../store.js'
import { router } from '../router.js'
import { renderSearchBar } from '../components/search-bar.js'
import { renderCardGrid } from '../components/card-grid.js'

export function renderHome(container) {
  container.innerHTML = `
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">Lorcana Vault</h1>
        <p class="hero-subtitle">Disney Lorcana TCG 카드 카탈로그</p>
        <div class="hero-particles" aria-hidden="true"></div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div id="home-search"></div>
        <div id="search-results" class="hidden"></div>
      </div>
    </section>

    <section class="section" id="main-sets-section">
      <div class="container">
        <h2 class="section-title">부스터 팩 세트</h2>
        <div class="set-grid" id="main-sets-grid"></div>
      </div>
    </section>

    <section class="section" id="promo-sets-section">
      <div class="container">
        <h2 class="section-title">프로모 & 스페셜</h2>
        <div class="set-grid set-grid-small" id="promo-sets-grid"></div>
      </div>
    </section>
  `

  // Hero sparkle effect
  createSparkles(container.querySelector('.hero-particles'))

  // Search bar
  const searchContainer = container.querySelector('#home-search')
  const searchResults = container.querySelector('#search-results')
  const mainSetsSection = container.querySelector('#main-sets-section')
  const promoSetsSection = container.querySelector('#promo-sets-section')

  renderSearchBar(searchContainer, {
    placeholder: '카드 이름으로 검색...',
    onSearch: (query) => {
      if (!query) {
        searchResults.classList.add('hidden')
        searchResults.innerHTML = ''
        mainSetsSection.classList.remove('hidden')
        promoSetsSection.classList.remove('hidden')
        return
      }

      const results = store.searchCards(query)
      mainSetsSection.classList.add('hidden')
      promoSetsSection.classList.add('hidden')
      searchResults.classList.remove('hidden')

      searchResults.innerHTML = `<p class="result-count">${results.length}개 카드 검색됨</p>`
      const gridWrap = document.createElement('div')
      searchResults.appendChild(gridWrap)

      const sorted = store.sortByRarity(results)
      renderCardGrid(gridWrap, sorted, { showSetName: true })
    }
  })

  // Main sets grid
  const mainSetsGrid = container.querySelector('#main-sets-grid')
  const mainSets = store.getMainSets()

  mainSetsGrid.innerHTML = mainSets.map(set => {
    const repCard = store.getRepresentativeCard(set.code)
    const imgSrc = repCard ? (repCard.image || repCard.image_small || '') : ''

    return `
      <a href="#/set/${set.code}" class="set-card" data-code="${set.code}">
        <div class="set-card-image-wrap">
          ${imgSrc ? `<img src="${imgSrc}" alt="${set.name}" class="set-card-image" loading="lazy" />` : '<div class="set-card-placeholder">🃏</div>'}
        </div>
        <div class="set-card-info">
          <h3 class="set-card-name">${set.code}. ${set.name}</h3>
          <p class="set-card-meta">${set.released_at || ''} · ${set.card_count}장</p>
        </div>
      </a>
    `
  }).join('')

  // Promo sets grid
  const promoSetsGrid = container.querySelector('#promo-sets-grid')
  const promoSets = store.getPromoSets()

  promoSetsGrid.innerHTML = promoSets.map(set => {
    const repCard = store.getRepresentativeCard(set.code)
    const imgSrc = repCard ? (repCard.image_small || repCard.image || '') : ''

    return `
      <a href="#/set/${set.code}" class="set-card set-card-promo">
        <div class="set-card-image-wrap">
          ${imgSrc ? `<img src="${imgSrc}" alt="${set.name}" class="set-card-image" loading="lazy" />` : '<div class="set-card-placeholder">🎁</div>'}
        </div>
        <div class="set-card-info">
          <h3 class="set-card-name">${set.name}</h3>
          <p class="set-card-meta">${set.card_count}장</p>
        </div>
      </a>
    `
  }).join('')
}

function createSparkles(container) {
  if (!container) return
  for (let i = 0; i < 20; i++) {
    const sparkle = document.createElement('div')
    sparkle.className = 'sparkle'
    sparkle.style.left = `${Math.random() * 100}%`
    sparkle.style.top = `${Math.random() * 100}%`
    sparkle.style.animationDelay = `${Math.random() * 3}s`
    sparkle.style.animationDuration = `${2 + Math.random() * 3}s`
    container.appendChild(sparkle)
  }
}
