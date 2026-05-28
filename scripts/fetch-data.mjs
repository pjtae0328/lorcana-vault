#!/usr/bin/env node

/**
 * Lorcast API에서 Disney Lorcana 카드 데이터를 수집하여
 * public/data/ 디렉토리에 JSON 파일로 저장합니다.
 *
 * 엔드포인트: GET /v0/sets → GET /v0/sets/{set_id}/cards
 */

import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'public', 'data')
const API_BASE = 'https://api.lorcast.com/v0'
const DELAY_MS = 150

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function fetchJSON(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.json()
}

async function fetchAllSets() {
  console.log('📦 Fetching sets...')
  const data = await fetchJSON(`${API_BASE}/sets`)
  const sets = data.results || data
  console.log(`   Found ${sets.length} sets`)
  return sets
}

async function fetchCardsForSet(setId) {
  const url = `${API_BASE}/sets/${setId}/cards`
  const data = await fetchJSON(url)
  const cards = Array.isArray(data) ? data : (data.results || [])
  return cards
}

function transformCard(card) {
  return {
    id: card.id,
    name: card.name,
    version: card.version || '',
    fullName: card.version ? `${card.name} - ${card.version}` : card.name,
    cost: card.cost,
    inkwell: card.inkwell,
    ink: card.ink,
    type: card.type || [],
    classifications: card.classifications || [],
    text: card.text || '',
    keywords: card.keywords || [],
    strength: card.strength,
    willpower: card.willpower,
    lore: card.lore,
    rarity: card.rarity,
    collector_number: card.collector_number,
    illustrators: card.illustrators || [],
    flavor_text: card.flavor_text || '',
    set_code: card.set?.code || '',
    set_name: card.set?.name || '',
    image: card.image_uris?.digital?.normal || card.image_uris?.digital?.large || '',
    image_small: card.image_uris?.digital?.small || '',
    image_large: card.image_uris?.digital?.large || '',
    prices: {
      usd: card.prices?.usd != null ? parseFloat(card.prices.usd) : null,
      usd_foil: card.prices?.usd_foil != null ? parseFloat(card.prices.usd_foil) : null
    },
    tcgplayer_url: card.purchase_uris?.tcgplayer || '',
    tcgplayer_id: card.tcgplayer_id || null
  }
}

// Fandom 위키 CDN의 세트 로고 이미지 URL (JSON-LD에서 추출한 안정 URL)
const SET_LOGO_MAP = {
  'The First Chapter': 'https://static.wikia.nocookie.net/lorcana/images/3/35/The_First_Chapter_logo.jpg/revision/latest?cb=20240506161616',
  'Rise of the Floodborn': 'https://static.wikia.nocookie.net/lorcana/images/2/26/Rise_of_the_Floodborn_logo.jpg/revision/latest?cb=20240506161616',
  'Into the Inklands': 'https://static.wikia.nocookie.net/lorcana/images/2/2f/Into_the_Inklands_logo.jpg/revision/latest?cb=20240506161616',
  "Ursula's Return": 'https://static.wikia.nocookie.net/lorcana/images/b/b0/Ursula%27s_Return_logo.jpg/revision/latest?cb=20240506161616',
  'Shimmering Skies': 'https://static.wikia.nocookie.net/lorcana/images/0/02/Shimmering_Skies_logo.jpg/revision/latest?cb=20240627172834',
  'Azurite Sea': 'https://static.wikia.nocookie.net/lorcana/images/0/08/Azurite_Sea_logo.jpg/revision/latest?cb=20240921122948',
  "Archazia's Island": 'https://static.wikia.nocookie.net/lorcana/images/5/5d/Archazia%27s_Island_logo.jpg/revision/latest?cb=20250103190618',
  'Reign of Jafar': 'https://static.wikia.nocookie.net/lorcana/images/f/f7/Reign_of_Jafar_logo.jpg/revision/latest?cb=20250330183927',
  'Fabled': 'https://static.wikia.nocookie.net/lorcana/images/1/1f/Fabled_logo.jpg/revision/latest?cb=20250507190539',
  'Whispers in the Well': 'https://static.wikia.nocookie.net/lorcana/images/9/9e/Whispers_in_the_Well_logo.jpg/revision/latest?cb=20250507190539',
  'Winterspell': 'https://static.wikia.nocookie.net/lorcana/images/1/16/Winterspell_logo.jpg/revision/latest?cb=20251201200000',
  'Wilds Unknown': 'https://static.wikia.nocookie.net/lorcana/images/d/d7/Wilds_Unknown_logo.jpg/revision/latest?cb=20260301200000'
}

function fetchSetLogo(setName) {
  return SET_LOGO_MAP[setName] || ''
}

function transformSet(set, cardCount, logoUrl) {
  const numericCodes = Array.from({ length: 20 }, (_, i) => String(i + 1))
  return {
    id: set.id,
    name: set.name,
    code: set.code,
    released_at: set.released_at,
    is_main: numericCodes.includes(set.code),
    is_promo: !numericCodes.includes(set.code),
    card_count: cardCount,
    logo_url: logoUrl || ''
  }
}

async function main() {
  console.log('🏰 Disney Lorcana Data Fetcher')
  console.log('================================\n')

  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true })
    console.log(`📁 Created ${DATA_DIR}\n`)
  }

  const rawSets = await fetchAllSets()
  await sleep(DELAY_MS)

  const allCards = []
  const setMeta = []

  for (const set of rawSets) {
    console.log(`🃏 Fetching cards for "${set.name}" (${set.code})...`)
    try {
      const cards = await fetchCardsForSet(set.id)
      const transformed = cards.map(transformCard)
      allCards.push(...transformed)

      // 로고 이미지 수집
      const logoUrl = await fetchSetLogo(set.name)
      if (logoUrl) console.log(`   🖼️  Logo found`)

      setMeta.push(transformSet(set, transformed.length, logoUrl))
      console.log(`   ✅ ${transformed.length} cards`)
    } catch (err) {
      console.error(`   ❌ Error: ${err.message}`)
      setMeta.push(transformSet(set, 0, ''))
    }
    await sleep(DELAY_MS)
  }

  setMeta.sort((a, b) => a.released_at.localeCompare(b.released_at))

  const setsPath = join(DATA_DIR, 'sets.json')
  const cardsPath = join(DATA_DIR, 'cards.json')

  writeFileSync(setsPath, JSON.stringify(setMeta, null, 2))
  console.log(`\n💾 Saved ${setMeta.length} sets → ${setsPath}`)

  writeFileSync(cardsPath, JSON.stringify(allCards))
  console.log(`💾 Saved ${allCards.length} cards → ${cardsPath}`)

  const mainSets = setMeta.filter(s => s.is_main)
  const promoSets = setMeta.filter(s => s.is_promo)
  console.log(`\n📊 Summary:`)
  console.log(`   Main sets: ${mainSets.length}`)
  console.log(`   Promo sets: ${promoSets.length}`)
  console.log(`   Total cards: ${allCards.length}`)
  console.log('\n✨ Done!')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
