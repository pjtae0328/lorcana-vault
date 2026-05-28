import { store } from '../store.js'

const CATEGORIES = [
  { key: 'all', label: '전체' },
  { key: 'release', label: '출시' },
  { key: 'promo', label: '프로모' }
]

const CATEGORY_COLORS = {
  release: '#2979ff',
  promo: '#ff6d00'
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return dateStr
  }
}

export function renderNews(container) {
  const articles = [...store.promoNews].sort((a, b) => {
    return new Date(b.date) - new Date(a.date)
  })

  container.innerHTML = `
    <div class="container section">
      <h1 class="page-title">프로모 소식</h1>
      <div class="category-filter" id="news-category-filter"></div>
      <div class="news-grid" id="news-grid"></div>
    </div>
  `

  let currentCategory = 'all'

  const filterContainer = container.querySelector('#news-category-filter')
  const gridContainer = container.querySelector('#news-grid')

  // Category filter tabs
  filterContainer.innerHTML = CATEGORIES.map(cat => `
    <button class="category-tab${cat.key === 'all' ? ' active' : ''}" data-category="${cat.key}">${cat.label}</button>
  `).join('')

  filterContainer.addEventListener('click', (e) => {
    const tab = e.target.closest('.category-tab')
    if (!tab) return

    currentCategory = tab.dataset.category
    filterContainer.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'))
    tab.classList.add('active')
    updateDisplay()
  })

  function updateDisplay() {
    let filtered = articles

    if (currentCategory !== 'all') {
      filtered = filtered.filter(a => a.category === currentCategory)
    }

    if (filtered.length === 0) {
      gridContainer.innerHTML = `
        <div class="empty-state">
          <p class="empty-state-icon">📰</p>
          <p class="empty-state-text">소식이 없습니다</p>
        </div>
      `
      return
    }

    gridContainer.innerHTML = filtered.map(article => {
      const catColor = CATEGORY_COLORS[article.category] || '#90a4ae'
      const catLabel = CATEGORIES.find(c => c.key === article.category)?.label || article.category

      return `
        <article class="news-card">
          ${article.image ? `
            <div class="news-card-image-wrap">
              <img src="${article.image}" alt="${article.title}" class="news-card-image" loading="lazy" />
            </div>
          ` : ''}
          <div class="news-card-body">
            <div class="news-card-meta">
              <span class="news-category-badge" style="background:${catColor}">${catLabel}</span>
              <span class="news-date">${formatDate(article.date)}</span>
            </div>
            <h3 class="news-card-title">${article.title || ''}</h3>
            <p class="news-card-summary">${article.summary || ''}</p>
            ${article.url ? `
              <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="news-link">
                자세히 보기 →
              </a>
            ` : ''}
          </div>
        </article>
      `
    }).join('')
  }

  updateDisplay()
}
