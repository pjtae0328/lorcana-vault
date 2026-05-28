const RARITIES = [
  { key: 'Iconic', label: 'Iconic', color: '#ff9500' },
  { key: 'Enchanted', label: 'Enchanted', color: '#ff6bef' },
  { key: 'Epic', label: 'Epic', color: '#e040fb' },
  { key: 'Legendary', label: 'Legendary', color: '#ffd700' },
  { key: 'Super_rare', label: 'Super Rare', color: '#7c4dff' },
  { key: 'Rare', label: 'Rare', color: '#2979ff' },
  { key: 'Uncommon', label: 'Uncommon', color: '#00c853' },
  { key: 'Common', label: 'Common', color: '#90a4ae' },
  { key: 'Promo', label: 'Promo', color: '#ff6d00' }
]

export function renderRarityFilter(container, { onFilter, initialActive = [] } = {}) {
  const wrapper = document.createElement('div')
  wrapper.className = 'rarity-filter'

  const activeSet = new Set(initialActive)
  const isAllActive = activeSet.size === 0

  function render() {
    const allActive = activeSet.size === 0

    wrapper.innerHTML = `
      <button class="rarity-pill${allActive ? ' active' : ''}" data-rarity="all">전체</button>
      ${RARITIES.map(r => {
        const active = activeSet.has(r.key)
        return `<button
          class="rarity-pill${active ? ' active' : ''}"
          data-rarity="${r.key}"
          style="${active ? `background:${r.color};border-color:${r.color};color:#fff` : `border-color:${r.color};color:${r.color}`}"
        >${r.label}</button>`
      }).join('')}
    `
  }

  render()
  container.appendChild(wrapper)

  wrapper.addEventListener('click', (e) => {
    const pill = e.target.closest('.rarity-pill')
    if (!pill) return

    const rarity = pill.dataset.rarity

    if (rarity === 'all') {
      activeSet.clear()
    } else {
      if (activeSet.has(rarity)) {
        activeSet.delete(rarity)
      } else {
        activeSet.add(rarity)
      }
    }

    render()

    if (onFilter) {
      onFilter([...activeSet])
    }
  })

  return { wrapper, getActive: () => [...activeSet] }
}
