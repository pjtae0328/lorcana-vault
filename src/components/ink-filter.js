const INKS = [
  { key: 'Amber', label: 'Amber', color: '#f59e0b' },
  { key: 'Amethyst', label: 'Amethyst', color: '#a855f7' },
  { key: 'Emerald', label: 'Emerald', color: '#10b981' },
  { key: 'Ruby', label: 'Ruby', color: '#ef4444' },
  { key: 'Sapphire', label: 'Sapphire', color: '#3b82f6' },
  { key: 'Steel', label: 'Steel', color: '#94a3b8' }
]

export function renderInkFilter(container, { onFilter, initialActive = [] } = {}) {
  const wrapper = document.createElement('div')
  wrapper.className = 'rarity-filter'

  const activeSet = new Set(initialActive)

  function render() {
    const allActive = activeSet.size === 0

    wrapper.innerHTML = `
      <button class="rarity-pill${allActive ? ' active' : ''}" data-ink="all">전체</button>
      ${INKS.map(ink => {
        const active = activeSet.has(ink.key)
        return `<button
          class="rarity-pill${active ? ' active' : ''}"
          data-ink="${ink.key}"
          style="${active ? `background:${ink.color};border-color:${ink.color};color:#fff` : `border-color:${ink.color};color:${ink.color}`}"
        >${ink.label}</button>`
      }).join('')}
    `
  }

  render()
  container.appendChild(wrapper)

  wrapper.addEventListener('click', (e) => {
    const pill = e.target.closest('.rarity-pill')
    if (!pill) return

    const ink = pill.dataset.ink

    if (ink === 'all') {
      activeSet.clear()
    } else {
      if (activeSet.has(ink)) {
        activeSet.delete(ink)
      } else {
        activeSet.add(ink)
      }
    }

    render()

    if (onFilter) {
      onFilter([...activeSet])
    }
  })

  return { wrapper, getActive: () => [...activeSet] }
}
