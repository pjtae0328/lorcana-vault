import './styles/index.css'
import './styles/components.css'
import './styles/animations.css'
import { store } from './store.js'
import { router } from './router.js'
import { renderNavbar } from './components/navbar.js'
import { renderHome } from './pages/home.js'
import { renderSetDetail } from './pages/set-detail.js'
import { renderPromo } from './pages/promo.js'
import { renderStitchLilo } from './pages/stitch-lilo.js'
import { renderNews } from './pages/news.js'

async function init() {
  try {
    await store.init()

    renderNavbar(document.getElementById('main-nav'))

    router.init({
      '#/': renderHome,
      '#/set/:code': renderSetDetail,
      '#/promo': renderPromo,
      '#/stitch-lilo': renderStitchLilo,
      '#/news': renderNews
    })

    const loader = document.getElementById('initial-loader')
    if (loader) loader.remove()
  } catch (err) {
    console.error('앱 초기화 실패:', err)
    const loader = document.getElementById('initial-loader')
    if (loader) {
      loader.innerHTML = `
        <p class="loading-text" style="color: #ff5252;">데이터를 불러오지 못했습니다.</p>
        <p class="loading-text" style="font-size: 0.9rem; opacity: 0.7;">${err.message || ''}</p>
      `
    }
  }
}

init()
