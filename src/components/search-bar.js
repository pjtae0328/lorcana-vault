export function renderSearchBar(container, { onSearch, placeholder = '카드 검색...' } = {}) {
  const wrapper = document.createElement('div')
  wrapper.className = 'search-bar'

  wrapper.innerHTML = `
    <div class="search-input-wrap">
      <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        type="text"
        class="search-input"
        placeholder="${placeholder}"
        autocomplete="off"
        spellcheck="false"
      />
      <button class="search-clear hidden" aria-label="지우기">&times;</button>
    </div>
  `

  container.appendChild(wrapper)

  const input = wrapper.querySelector('.search-input')
  const clearBtn = wrapper.querySelector('.search-clear')

  let debounceTimer = null

  input.addEventListener('input', () => {
    const value = input.value.trim()

    // Toggle clear button
    if (value.length > 0) {
      clearBtn.classList.remove('hidden')
    } else {
      clearBtn.classList.add('hidden')
    }

    // Debounce
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      if (onSearch) onSearch(value)
    }, 300)
  })

  clearBtn.addEventListener('click', () => {
    input.value = ''
    clearBtn.classList.add('hidden')
    if (onSearch) onSearch('')
    input.focus()
  })

  return { input, wrapper }
}
