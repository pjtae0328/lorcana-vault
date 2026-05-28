export const router = {
  routes: {},
  currentRoute: null,
  _params: {},

  init(routeMap) {
    this.routes = routeMap
    window.addEventListener('hashchange', () => this._handleRoute())

    // Initial route
    if (!window.location.hash || window.location.hash === '#') {
      window.location.hash = '#/'
    } else {
      this._handleRoute()
    }
  },

  navigate(path) {
    window.location.hash = path
  },

  _match(hash) {
    const path = hash.replace(/^#/, '') || '/'
    const pathParts = path.split('/').filter(Boolean)

    for (const [pattern, handler] of Object.entries(this.routes)) {
      const patternPath = pattern.replace(/^#/, '')
      const patternParts = patternPath.split('/').filter(Boolean)

      if (patternParts.length !== pathParts.length) continue

      const params = {}
      let matched = true

      for (let i = 0; i < patternParts.length; i++) {
        if (patternParts[i].startsWith(':')) {
          params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i])
        } else if (patternParts[i] !== pathParts[i]) {
          matched = false
          break
        }
      }

      if (matched) {
        return { handler, params }
      }
    }

    // Fallback: root route for empty path
    if (path === '/' && this.routes['#/']) {
      return { handler: this.routes['#/'], params: {} }
    }

    return null
  },

  _handleRoute() {
    const hash = window.location.hash || '#/'
    const match = this._match(hash)

    if (!match) {
      // Fallback to home
      this.navigate('#/')
      return
    }

    this.currentRoute = hash
    this._params = match.params

    const container = document.getElementById('page-content')
    if (!container) return

    // Remove page-enter for transition
    container.classList.remove('page-enter')

    // Clear and render
    container.innerHTML = ''
    match.handler(container, match.params)

    // Trigger page transition
    requestAnimationFrame(() => {
      container.classList.add('page-enter')
    })

    // Scroll to top
    window.scrollTo(0, 0)

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href')
      if (href === hash || (hash.startsWith(href) && href !== '#/')) {
        link.classList.add('active')
      } else if (href === '#/' && hash === '#/') {
        link.classList.add('active')
      } else {
        link.classList.remove('active')
      }
    })
  },

  getParams() {
    return { ...this._params }
  }
}
