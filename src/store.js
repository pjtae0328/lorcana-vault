const RARITY_ORDER = ['Iconic', 'Enchanted', 'Epic', 'Legendary', 'Super_rare', 'Rare', 'Uncommon', 'Common', 'Promo']

function rarityRank(rarity) {
  const idx = RARITY_ORDER.indexOf(rarity)
  return idx === -1 ? RARITY_ORDER.length : idx
}

export const store = {
  sets: [],
  cards: [],
  psaPop: {},
  promoNews: [],
  _cardsBySet: new Map(),
  _initialized: false,

  async init() {
    if (this._initialized) return

    const [setsRes, cardsRes, psaRes, newsRes] = await Promise.all([
      fetch('/data/sets.json'),
      fetch('/data/cards.json'),
      fetch('/data/psa-pop.json'),
      fetch('/data/promo-news.json')
    ])

    this.sets = await setsRes.json()
    this.cards = await cardsRes.json()

    const psaRaw = await psaRes.json()
    this.psaPop = psaRaw.data || {}

    const newsRaw = await newsRes.json()
    this.promoNews = newsRaw.articles || []

    // Index cards by set_code
    this._cardsBySet.clear()
    for (const card of this.cards) {
      const code = card.set_code
      if (!this._cardsBySet.has(code)) {
        this._cardsBySet.set(code, [])
      }
      this._cardsBySet.get(code).push(card)
    }

    this._initialized = true
  },

  getMainSets() {
    return this.sets
      .filter(s => s.is_main === true)
      .sort((a, b) => {
        const numA = parseInt(a.code, 10)
        const numB = parseInt(b.code, 10)
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB
        return a.code.localeCompare(b.code)
      })
  },

  getPromoSets() {
    return this.sets.filter(s => s.is_promo === true)
  },

  getSetByCode(code) {
    return this.sets.find(s => s.code === code) || null
  },

  getCardsBySet(setCode) {
    return this._cardsBySet.get(setCode) || []
  },

  getAllCards() {
    return this.cards
  },

  searchCards(query) {
    if (!query || !query.trim()) return []
    const q = query.trim().toLowerCase()
    return this.cards.filter(c => {
      const name = (c.name || '').toLowerCase()
      const version = (c.version || '').toLowerCase()
      const fullName = (c.fullName || '').toLowerCase()
      return name.includes(q) || version.includes(q) || fullName.includes(q)
    })
  },

  getStitchLiloCards() {
    const characters = ['stitch', 'lilo', 'nani', 'jumba', 'pleakley', 'angel']
    return this.cards.filter(c => {
      const name = (c.name || '').toLowerCase()
      return characters.some(ch => name.includes(ch))
    })
  },

  filterByRarity(cards, rarities) {
    if (!rarities || rarities.length === 0) return cards
    return cards.filter(c => rarities.includes(c.rarity))
  },

  sortByRarity(cards) {
    return [...cards].sort((a, b) => {
      const ra = rarityRank(a.rarity)
      const rb = rarityRank(b.rarity)
      if (ra !== rb) return ra - rb
      const numA = parseInt(a.collector_number, 10)
      const numB = parseInt(b.collector_number, 10)
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB
      return (a.collector_number || '').localeCompare(b.collector_number || '')
    })
  },

  getPsaPop(tcgplayerId) {
    if (!tcgplayerId) return null
    return this.psaPop[String(tcgplayerId)] || null
  },

  getRepresentativeCard(setCode) {
    const cards = this.getCardsBySet(setCode)
    if (cards.length === 0) return null
    const priorities = ['Iconic', 'Enchanted', 'Epic', 'Legendary']
    for (const rarity of priorities) {
      const found = cards.find(c => c.rarity === rarity)
      if (found) return found
    }
    return cards[0]
  }
}
