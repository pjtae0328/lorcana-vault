#!/usr/bin/env node

/**
 * lorcana-kor/data/translated/ 번역 데이터를 public/data/cards.json에 병합합니다.
 * 
 * 매핑 전략:
 *  1. allCards.json의 숫자 id → fullName 매핑
 *  2. 번역 배치에서 숫자 id → 한글 번역 데이터
 *  3. cards.json의 fullName으로 매칭하여 한글 필드 추가
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = join(__dirname, '..')

// 경로 설정
const RAW_ALL_CARDS = join(PROJECT_ROOT, 'lorcana-kor', 'data', 'raw', 'allCards.json')
const TRANSLATED_DIR = join(PROJECT_ROOT, 'lorcana-kor', 'data', 'translated')
const GLOSSARY_FILE = join(PROJECT_ROOT, 'lorcana-kor', 'data', 'glossary.json')
const CARDS_FILE = join(PROJECT_ROOT, 'public', 'data', 'cards.json')
const SETS_FILE = join(PROJECT_ROOT, 'public', 'data', 'sets.json')

// ======== 1. 용어 사전 로드 ========
console.log('📚 Loading glossary...')
const glossary = JSON.parse(readFileSync(GLOSSARY_FILE, 'utf-8'))
const setNamesKo = glossary.setNames || {}
const cardTypesKo = glossary.cardTypes || {}
const subtypesKo = glossary.subtypes || {}
const raritiesKo = glossary.rarities || {}
const keywordsKo = glossary.keywords || {}

// glossary에 없는 프로모/특수 세트 수동 매핑
const extraSetNames = {
  'Promo Set 1': '프로모 세트 1',
  'Promo Set 2': '프로모 세트 2',
  'Promo Set 3': '프로모 세트 3',
  'Challenge Promo': '챌린지 프로모',
  'D23 Collection': 'D23 컬렉션',
  'EPCOT Festival of the Arts': 'EPCOT 페스티벌 오브 디 아트',
  'Lorcana Challenge Year 3': '로카나 챌린지 Year 3',
  'Reign of Jafar': '자파의 통치'
}

// 세트명 한글 변환 (glossary → 유연 매칭 → 수동 매핑)
function translateSetName(name) {
  if (!name) return null
  // 1. 정확 매칭
  if (setNamesKo[name]) return setNamesKo[name]
  // 2. 수동 매핑
  if (extraSetNames[name]) return extraSetNames[name]
  // 3. glossary에서 부분 매칭 (The Reign of Jafar ↔ Reign of Jafar)
  for (const [key, val] of Object.entries(setNamesKo)) {
    if (key.includes(name) || name.includes(key)) return val
  }
  return null
}

// ======== 2. allCards.json에서 숫자 ID → fullName 매핑 ========
console.log('📦 Loading allCards.json for ID mapping...')
const allCardsData = JSON.parse(readFileSync(RAW_ALL_CARDS, 'utf-8'))
const rawCards = allCardsData.cards

// 숫자 ID → fullName 매핑 + fullName → rawCard 매핑 (포맷/능력 데이터용)
const idToFullName = new Map()
const fullNameToRaw = new Map()
rawCards.forEach(card => {
  idToFullName.set(card.id, card.fullName)
  fullNameToRaw.set(card.fullName, card)
})
console.log(`   Mapped ${idToFullName.size} card IDs to fullNames`)

// ======== 3. 번역 배치 로드 ========
console.log('🌐 Loading translation batches...')
const translationByFullName = new Map()
let totalTranslated = 0

for (let i = 1; i <= 60; i++) {
  const batchNum = String(i).padStart(2, '0')
  const filePath = join(TRANSLATED_DIR, `batch-${batchNum}-ko.json`)

  if (!existsSync(filePath)) {
    console.warn(`   ⚠️ Missing: batch-${batchNum}-ko.json`)
    continue
  }

  const batchData = JSON.parse(readFileSync(filePath, 'utf-8'))
  if (!batchData.cards || !Array.isArray(batchData.cards)) continue

  for (const transCard of batchData.cards) {
    const fullName = idToFullName.get(transCard.id)
    if (fullName) {
      translationByFullName.set(fullName, transCard)
      totalTranslated++
    }
  }
}
console.log(`   Loaded ${totalTranslated} translated cards`)

// ======== 4. 분류(classifications) 한글 변환 헬퍼 ========
function translateClassifications(classifications) {
  if (!classifications || !Array.isArray(classifications)) return null
  return classifications.map(c => subtypesKo[c] || c)
}

function translateType(typeArr) {
  if (!typeArr || !Array.isArray(typeArr)) return null
  return typeArr.map(t => cardTypesKo[t] || t)
}

// 능력 텍스트 조합 헬퍼
function buildTextKo(transCard) {
  if (!transCard.abilities_ko || transCard.abilities_ko.length === 0) {
    // 액션 카드는 actionText_ko 사용
    if (transCard.actionText_ko) return transCard.actionText_ko
    return null
  }

  const parts = transCard.abilities_ko
    .map(ab => ab.fullText_ko)
    .filter(Boolean)

  // actionText_ko가 있으면 추가
  if (transCard.actionText_ko) {
    parts.push(transCard.actionText_ko)
  }

  return parts.length > 0 ? parts.join('\n') : null
}

// ======== 5. cards.json 병합 ========
console.log('🔄 Merging translations into cards.json...')
const cards = JSON.parse(readFileSync(CARDS_FILE, 'utf-8'))

let matched = 0
let unmatched = 0

for (const card of cards) {
  const trans = translationByFullName.get(card.fullName)
  const raw = fullNameToRaw.get(card.fullName)

  // 포맷 합법 여부 (allCards.json 원본에서)
  card.legal_core = raw?.allowedInFormats?.Core?.allowed ?? null
  card.legal_infinity = raw?.allowedInFormats?.Infinity?.allowed ?? null

  if (trans) {
    card.name_ko = trans.name_ko || null
    card.version_ko = trans.version_ko || null
    card.fullName_ko = trans.fullName_ko || null
    card.text_ko = buildTextKo(trans)
    card.flavor_text_ko = trans.flavorText_ko || null
    card.type_ko = translateType(card.type)
    card.classifications_ko = translateClassifications(card.classifications)
    // 세트명 한글
    card.set_name_ko = translateSetName(card.set_name)
    matched++
  } else {
    // 번역 없는 카드도 세트명은 변환
    card.set_name_ko = translateSetName(card.set_name)
    unmatched++
  }
}

writeFileSync(CARDS_FILE, JSON.stringify(cards))
console.log(`   ✅ Matched: ${matched} cards`)
console.log(`   ⚠️ Unmatched: ${unmatched} cards`)

// ======== 6. sets.json 한글 세트명 추가 ========
console.log('🔄 Adding Korean set names to sets.json...')
const sets = JSON.parse(readFileSync(SETS_FILE, 'utf-8'))

for (const set of sets) {
  set.name_ko = translateSetName(set.name)
}

writeFileSync(SETS_FILE, JSON.stringify(sets, null, 2))
console.log(`   ✅ Updated ${sets.length} sets`)

// ======== 완료 ========
console.log('\n✨ Translation merge complete!')
console.log(`   Cards: ${matched}/${cards.length} translated`)
console.log(`   Sets: ${sets.filter(s => s.name_ko).length}/${sets.length} translated`)
