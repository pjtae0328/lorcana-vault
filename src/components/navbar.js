import { router } from '../router.js'

const NAV_ITEMS = [
  { label: '홈', hash: '#/' },
  { label: '프로모', hash: '#/promo' },
  { label: 'Stitch & Lilo', hash: '#/stitch-lilo' },
  { label: '소식', hash: '#/news' }
]

export function renderNavbar(container) {
  const currentHash = window.location.hash || '#/'

  container.innerHTML = `
    <div class="navbar">
      <div class="navbar-inner">
        <a href="#/" class="navbar-logo">
          <span class="logo-icon">🏰</span>
          <span class="logo-text">Lorcana Vault</span>
        </a>
        <div class="nav-links" id="nav-links">
          ${NAV_ITEMS.map(item => `
            <a href="${item.hash}" class="nav-link${currentHash === item.hash ? ' active' : ''}">${item.label}</a>
          `).join('')}
        </div>
        <button class="nav-search-btn" id="nav-search-toggle" aria-label="검색">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>
        <button class="hamburger" id="hamburger" aria-label="메뉴">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      <div class="mobile-menu hidden" id="mobile-menu">
        ${NAV_ITEMS.map(item => `
          <a href="${item.hash}" class="mobile-nav-link nav-link${currentHash === item.hash ? ' active' : ''}">${item.label}</a>
        `).join('')}
      </div>
    </div>
  `

  // Hamburger toggle
  const hamburger = container.querySelector('#hamburger')
  const mobileMenu = container.querySelector('#mobile-menu')

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open')
    mobileMenu.classList.toggle('hidden')
  })

  // Close mobile menu on link click
  mobileMenu.addEventListener('click', (e) => {
    if (e.target.classList.contains('mobile-nav-link')) {
      hamburger.classList.remove('open')
      mobileMenu.classList.add('hidden')
    }
  })

  // Search toggle navigates to home with focus
  const searchToggle = container.querySelector('#nav-search-toggle')
  searchToggle.addEventListener('click', () => {
    router.navigate('#/')
    setTimeout(() => {
      const searchInput = document.querySelector('.search-input')
      if (searchInput) searchInput.focus()
    }, 100)
  })

  // Update active links on route change
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash || '#/'
    container.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href')
      if (href === hash) {
        link.classList.add('active')
      } else {
        link.classList.remove('active')
      }
    })
    // Close mobile menu on navigation
    hamburger.classList.remove('open')
    mobileMenu.classList.add('hidden')
  })
}
