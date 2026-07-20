import { API_BASE_URL } from './config/apiConfig.js';

// Category Emoji Icons Mapping
const categoryIcons = {
  'Leafy Vegetables': '🥬',
  'Fruit Vegetables': '🍅',
  'Root Vegetables': '🥔',
  'Gourds': '🥒',
  'Beans & Pods': '🫘',
  'Bulbs & Aromatics': '🧅',
  'Herbs': '🌿',
  'Mushrooms': '🍄',
  'Meat': '🥩',
  'Fish': '🐟',
  'Seafood': '🦐',
  'Eggs': '🥚'
};

function getCategoryIcon(category) {
  return categoryIcons[category] || '🥗';
}

// --------------------------------------------------
// 1. Application State Object
// --------------------------------------------------
const state = {
  peopleCount: 4,
  durationDays: 7,
  storagePreference: 'REFRIGERATED',
  regionalProfile: 'AP_GENERAL',
  selectedItems: new Set(),
  savedLists: [],
  historySearchQuery: '',
  locale: 'en', // 'en' or 'te'
  items: [],
  searchQuery: '',
  recommendations: [],
  isLoading: false,
  activeSuggestionIndex: -1,
  isSaved: false
};

const uiTranslations = {
  en: {
    langToggle: 'తెలుగు',
    btnHistory: '📋 Saved Lists',
    btnSaveList: '🛒 Save Shopping List',
    labelHistoryHeader: '📋 Saved Shopping Lists',
    historySearchPlaceholder: 'Search saved lists...',
    noSavedLists: 'No saved shopping lists yet.',
    toastListSaved: 'Shopping list saved successfully!',
    toastListDeleted: 'Shopping list deleted.',
    toastListLoaded: 'Shopping list loaded!',
    appSubtitle: 'Know Exactly How Much to Buy',
    labelPeople: 'Number of People',
    labelDuration: 'Items Required For (Days)',
    labelStorage: 'Storage Type',
    storageHelper: 'Optional • Improves storage suggestions',
    storageAmbient: 'Ambient',
    storageRefrigerated: '✓ Refrigerated',
    storageRefrigeratedUnchecked: 'Refrigerated',
    labelAddItem: 'Add Item',
    searchPlaceholder: 'Search vegetables, fruits, meat, eggs...',
    labelSelectedTitle: 'Selected Items',
    emptySelected: '🥬 Add vegetables, fruits or meat to generate your shopping recommendation.',
    btnNewRecommendation: 'Start New Shopping',
    btnCalculate: 'Get Recommendation',
    labelResultsTitle: 'Recommended Quantities',
    toastLoadError: 'Failed to load food catalog. Please check server connection.',
    toastRecommendError: 'Failed to retrieve recommendations from engine.',
    storageWarningPrefix: 'Warning:',
    toastSelectAlert: 'Please add at least one item.',
    loaderText: 'Calculating the best quantity...',
    toastUsingCache: '⚠️ Offline: Using cached catalog data.'
  },
  te: {
    langToggle: 'English',
    btnHistory: '📋 భద్రపరచిన జాబితాలు',
    btnSaveList: '🛒 షాపింగ్ జాబితా దాచండి',
    labelHistoryHeader: '📋 భద్రపరచిన షాపింగ్ జాబితాలు',
    historySearchPlaceholder: 'జాబితాలను వెతకండి...',
    noSavedLists: 'ఇంకా ఏ షాపింగ్ జాబితాలు భద్రపరచలేదు.',
    toastListSaved: 'షాపింగ్ జాబితా విజయవంతంగా భద్రపరచబడింది!',
    toastListDeleted: 'షాపింగ్ జాబితా తొలగించబడింది.',
    toastListLoaded: 'షాపింగ్ జాబితా లోడ్ చేయబడింది!',
    appSubtitle: 'సరిగ్గా ఎంత కొనాలో తెలుసుకోండి',
    labelPeople: 'వ్యక్తుల సంఖ్య',
    labelDuration: 'కావలసిన రోజులు',
    labelStorage: 'నిల్వ రకం',
    storageHelper: 'ఐచ్ఛికం • మెరుగైన నిల్వ సూచనల కోసం',
    storageAmbient: 'సాధారణ నిల్వ',
    storageRefrigerated: '✓ రిఫ్రిజిరేటర్',
    storageRefrigeratedUnchecked: 'రిఫ్రిజిరేటర్',
    labelAddItem: 'వస్తువును జోడించండి',
    searchPlaceholder: 'కూరగాయలు, పండ్లు, మాంసం, గుడ్లు వెతకండి...',
    labelSelectedTitle: 'ఎంచుకున్న వస్తువులు',
    emptySelected: '🥬 మీ షాపింగ్ సిఫార్సును పొందడానికి కూరగాయలు, పండ్లు లేదా మాంసాన్ని జోడించండి.',
    btnNewRecommendation: 'కొత్త షాపింగ్ ప్రారంభించండి',
    btnCalculate: 'సిఫార్సును పొందండి',
    labelResultsTitle: 'సిఫార్సు చేయబడిన పరిమాణాలు',
    toastLoadError: 'కేటలాగ్ లోడ్ చేయడంలో విఫలమైంది. సర్వర్ కనెక్షన్ తనిఖీ చేయండి.',
    toastRecommendError: 'ఇంజిన్ నుండి సిఫార్సులను పొందడంలో విఫలమైంది.',
    storageWarningPrefix: 'హెచ్చరిక:',
    toastSelectAlert: 'దయచేసి కనీసం ఒక వస్తువును జోడించండి.',
    loaderText: 'ఉత్తమ పరిమాణాన్ని లెక్కిస్తోంది...',
    toastUsingCache: '⚠️ ఆఫ్‌లైన్: నిల్వ చేయబడిన కేటలాగ్ ఉపయోగిస్తున్నారు.'
  }
};

// --------------------------------------------------
// 2. DOM Elements Cache
// --------------------------------------------------
const elements = {
  btnLanguageToggle: document.getElementById('btn-language-toggle'),
  btnHistory: document.getElementById('btn-history'),
  btnSaveList: document.getElementById('btn-save-list'),
  historyModal: document.getElementById('history-modal'),
  historyBackdrop: document.getElementById('history-backdrop'),
  btnCloseHistory: document.getElementById('btn-close-history'),
  historySearchInput: document.getElementById('history-search-input'),
  historyCardsContainer: document.getElementById('history-cards-container'),
  labelHistoryHeader: document.getElementById('label-history-header'),

  appSubtitle: document.getElementById('app-subtitle'),
  labelPeople: document.getElementById('label-people'),
  labelDuration: document.getElementById('label-duration'),
  labelStorage: document.getElementById('label-storage'),
  storageHelper: document.getElementById('storage-helper'),
  labelAddItem: document.getElementById('label-add-item'),
  
  peopleCountVal: document.getElementById('people-count'),
  btnPeopleMinus: document.getElementById('btn-people-minus'),
  btnPeoplePlus: document.getElementById('btn-people-plus'),
  
  durationVal: document.getElementById('duration-days'),
  btnDurationMinus: document.getElementById('btn-duration-minus'),
  btnDurationPlus: document.getElementById('btn-duration-plus'),
  
  storageAmbient: document.getElementById('storage-ambient'),
  storageRefrigerated: document.getElementById('storage-refrigerated'),
  
  itemSearch: document.getElementById('item-search'),
  btnSearchClear: document.getElementById('btn-search-clear'),
  autocompleteSuggestions: document.getElementById('autocomplete-suggestions'),
  
  selectedItemsSection: document.getElementById('selected-items-section'),
  labelSelectedTitle: document.getElementById('label-selected-title'),
  selectedItemsList: document.getElementById('selected-items-list'),
  selectedEmptyText: document.getElementById('selected-empty-text'),
  
  btnNewRecommendation: document.getElementById('btn-new-recommendation'),
  btnCalculate: document.getElementById('btn-calculate'),
  
  resultsSection: document.getElementById('results-section'),
  labelResultsTitle: document.getElementById('label-results-title'),
  recommendationsList: document.getElementById('recommendations-list'),
  
  toast: document.getElementById('toast'),
  loader: document.getElementById('loader'),
  loaderText: document.getElementById('loader-text')
};

// --------------------------------------------------
// 3. Initialization & State Management
// --------------------------------------------------
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}

function startApp() {
  initAppState();
  bindEvents();
  initializeApplication();
}

function initAppState() {
  const savedPeople = localStorage.getItem('qtywise_people');
  const savedDuration = localStorage.getItem('qtywise_duration');
  const savedStorage = localStorage.getItem('qtywise_storage');
  const savedLocale = localStorage.getItem('qtywise_locale');
  const savedItems = localStorage.getItem('qtywise_selected_items');
  const savedListsRaw = localStorage.getItem('qtywise_saved_lists_v1');

  if (savedPeople) state.peopleCount = parseInt(savedPeople, 10);
  if (savedDuration) state.durationDays = parseInt(savedDuration, 10);
  if (savedStorage) state.storagePreference = savedStorage;
  if (savedLocale) state.locale = savedLocale;
  
  if (savedItems) {
    try {
      const parsed = JSON.parse(savedItems);
      state.selectedItems = new Set(parsed);
    } catch (e) {
      state.selectedItems = new Set();
    }
  }

  if (savedListsRaw) {
    try {
      state.savedLists = JSON.parse(savedListsRaw);
    } catch (e) {
      state.savedLists = [];
    }
  }

  elements.peopleCountVal.textContent = state.peopleCount;
  elements.durationVal.textContent = state.durationDays;
  
  updateStepperState();
  updateStorageToggleUI();
  translateUI();
  updateCalculateButtonState();
}

function saveState() {
  localStorage.setItem('qtywise_people', state.peopleCount);
  localStorage.setItem('qtywise_duration', state.durationDays);
  localStorage.setItem('qtywise_storage', state.storagePreference);
  localStorage.setItem('qtywise_locale', state.locale);
  localStorage.setItem('qtywise_selected_items', JSON.stringify(Array.from(state.selectedItems)));
  localStorage.setItem('qtywise_saved_lists_v1', JSON.stringify(state.savedLists));
}

// --------------------------------------------------
// 4. API Ingestion & Catalog Loader
// --------------------------------------------------
// --------------------------------------------------
// 4. Startup Reliability, Caching & Validation Module
// --------------------------------------------------
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function formatBilingualName(item, locale) {
  if (!item) return '';

  const transliteratedList = [
    'Thotakura', 'Palakura', 'Menthi Kura', 'Gangabayalu Kura', 'Bachali Kura',
    'Soa Kura', 'Chukkakura', 'Karivepaku', 'Kothimera', 'Pudina', 'Koyya Thotakura',
    'Ponnaganti Kura', 'Bendakaya', 'Dosakaya', 'Keera', 'Aratikaya', 'Mulakkaya',
    'Mirapakaya', 'Mamidikaya', 'Panasakaaya', 'Bangaladumpa', 'Genusudumpa',
    'Mullangi', 'Chamadumpa', 'Kanda', 'Karra Pendalam', 'Chama Kada', 'Pasupu Kommu',
    'Sorakaya', 'Beerakaya', 'Kakarakaya', 'Potlakaya', 'Parval', 'Dondakaya',
    'Boodida Gummadikaya', 'Gummadikaya', 'Neti Beerakaya', 'Boda Kakarakaya',
    'Tinda', 'Chow Chow', 'Chikkudukaya', 'Goru Chikkudu', 'Batani', 'Alasandalu',
    'Val', 'Anapakayalu', 'Ullipaya', 'Vellulli', 'Allam', 'Sabza', 'Vamu Akulu',
    'Tamalapakulu', 'Biryani Aku', 'Natu Kodi', 'Korrameenu', 'Seelaa', 'Bocche',
    'Pandugappa', 'Nethallu', 'Kanagarthalu', 'Royyalu', 'Peethalu', 'Kalamari',
    'Gongura Red', 'Gongura Green', 'Gongura'
  ];
  
  let cleanEnglish = item.display_name || item.english_name || '';
  transliteratedList.forEach(term => {
    const regex = new RegExp(`\\s*\\(\\s*${term}\\s*\\)`, 'i');
    cleanEnglish = cleanEnglish.replace(regex, '');
  });
  cleanEnglish = cleanEnglish.trim();
  const teluguName = (item.telugu_name || '').trim();

  if (!teluguName) return cleanEnglish;
  if (!cleanEnglish) return teluguName;

  if (locale === 'te') {
    return `${teluguName} (${cleanEnglish})`;
  } else {
    return `${cleanEnglish} (${teluguName})`;
  }
}

function getFormattedQuantity(value, baseUnit, locale, item = null) {
  const isTe = locale === 'te';
  const category = (item && item.category) ? item.category : '';
  const engName = (item && (item.english_name || item.display_name)) ? (item.english_name || item.display_name).toLowerCase() : '';

  // 1. Leafy Vegetables & Herbs -> Bundles with approx grams (1 bundle ≈ 200 g)
  const isLeafyOrHerb = category === 'Leafy Vegetables' || category === 'Herbs' || baseUnit === 'bunch' || baseUnit === 'bundle' || engName.includes('leaves') || engName.includes('gongura') || engName.includes('kura');
  if (isLeafyOrHerb) {
    let bunchCount, approxG;
    if (value < 20) {
      bunchCount = Math.max(1, Math.round(value));
      approxG = bunchCount * 200;
    } else {
      bunchCount = Math.max(1, Math.round(value / 200));
      approxG = bunchCount * 200;
    }
    if (isTe) {
      const unitStr = bunchCount === 1 ? 'కట్ట' : 'కట్టలు';
      return `${bunchCount} ${unitStr} (≈${approxG} గ్రా)`;
    } else {
      const unitStr = bunchCount === 1 ? 'bundle' : 'bundles';
      return `${bunchCount} ${unitStr} (≈${approxG} g)`;
    }
  }

  // 2. Eggs
  const isEggs = category === 'Eggs' || engName.includes('egg');
  if (isEggs) {
    const count = Math.round(value);
    return isTe ? `${count} గుడ్లు` : `${count} Eggs`;
  }

  // 3. Packaged Items
  if (baseUnit === 'packet' || category === 'Packaged Items') {
    const count = Math.round(value);
    if (isTe) {
      const label = count === 1 ? 'ప్యాకెట్' : 'ప్యాకెట్లు';
      return `${count} ${label}`;
    } else {
      const label = count === 1 ? 'Packet' : 'Packets';
      return `${count} ${label}`;
    }
  }

  // 4. Count / Piece Items (Bananas, Lemons, Coconuts, Corn, Apples, Mangoes, etc.)
  if (baseUnit === 'pcs' || baseUnit === 'unit' || baseUnit === 'piece' || baseUnit === 'count') {
    const count = Math.round(value);
    if (engName.includes('banana')) {
      return isTe ? `${count} అరటిపండ్లు` : `${count} Bananas`;
    }
    if (engName.includes('apple')) {
      return isTe ? `${count} ఆపిల్స్` : `${count} Apples`;
    }
    if (engName.includes('mango')) {
      return isTe ? `${count} మామిడిపండ్లు` : `${count} Mangoes`;
    }
    if (engName.includes('lemon')) {
      return isTe ? `${count} నిమ్మకాయలు` : `${count} Lemons`;
    }
    if (engName.includes('coconut')) {
      return isTe ? `${count} కొబ్బరికాయలు` : `${count} Coconuts`;
    }
    
    if (isTe) {
      return `${count} సంఖ్య`;
    } else {
      const label = count === 1 ? 'Piece' : 'Pieces';
      return `${count} ${label}`;
    }
  }

  // 5. Weight-Based Items (Vegetables, Meat, Fish, Seafood, Spices, Dry Fruits)
  if (baseUnit === 'g' || !baseUnit) {
    let roundedG;
    if (value >= 1000) {
      roundedG = Math.round(value / 100) * 100;
    } else {
      roundedG = Math.round(value / 50) * 50;
    }

    if (roundedG < 1000) {
      return isTe ? `${roundedG} గ్రా` : `${roundedG} g`;
    } else {
      const kg = roundedG / 1000;
      const kgStr = (roundedG % 250 === 0) ? `${kg}` : `${parseFloat(kg.toFixed(1))}`;
      return isTe ? `${kgStr} కిలో` : `${kgStr} kg`;
    }
  }

  if (baseUnit === 'ml') {
    let roundedMl = value >= 1000 ? Math.round(value / 100) * 100 : Math.round(value / 50) * 50;
    if (roundedMl < 1000) {
      return `${roundedMl} ml`;
    } else {
      const l = roundedMl / 1000;
      const lStr = (roundedMl % 250 === 0) ? `${l}` : `${parseFloat(l.toFixed(1))}`;
      return `${lStr} L`;
    }
  }

  return `${Math.round(value)} ${baseUnit}`;
}

state.searchIndex = {
  items: [],
  built: false
};

function validateCatalog(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Catalog is empty or not an array');
  }
  
  if (items.length < 100) {
    throw new Error(`Catalog validation failed: expected > 100 items for production, got ${items.length}`);
  }

  const ids = new Set();
  const englishNames = new Set();
  const teluguNames = new Set();
  const validCategories = new Set([
    'Leafy Vegetables', 'Fruit Vegetables', 'Root Vegetables', 'Gourds',
    'Beans & Pods', 'Bulbs & Aromatics', 'Herbs', 'Mushrooms',
    'Meat', 'Fish', 'Seafood', 'Eggs'
  ]);

  for (const item of items) {
    if (!item.item_id) {
      throw new Error(`Catalog validation failed: item_id field is missing on item: ${JSON.stringify(item)}`);
    }
    if (!item.english_name) {
      throw new Error(`Catalog validation failed: english_name field is missing on item ID ${item.item_id}`);
    }
    if (!item.telugu_name) {
      throw new Error(`Catalog validation failed: telugu_name field is missing on item ID ${item.item_id}`);
    }
    if (!item.category) {
      throw new Error(`Catalog validation failed: category field is missing on item ID ${item.item_id}`);
    }

    if (ids.has(item.item_id)) {
      throw new Error(`Catalog validation failed: duplicate item ID detected: ${item.item_id}`);
    }
    ids.add(item.item_id);

    const engLower = item.english_name.toLowerCase().trim();
    if (englishNames.has(engLower)) {
      throw new Error(`Catalog validation failed: duplicate English name detected: ${item.english_name}`);
    }
    englishNames.add(engLower);

    const telTrimmed = item.telugu_name.trim();
    if (teluguNames.has(telTrimmed)) {
      throw new Error(`Catalog validation failed: duplicate Telugu name detected: ${item.telugu_name} on item ${item.english_name}`);
    }
    teluguNames.add(telTrimmed);

    if (!validCategories.has(item.category)) {
      throw new Error(`Catalog validation failed: invalid category '${item.category}' on item: ${item.english_name}`);
    }
  }

  return true;
}

function buildSearchIndex(items) {
  console.log(`[Search Index] Building search index for ${items.length} items...`);
  state.searchIndex.items = items.map(item => {
    return {
      item_id: item.item_id,
      tokens: [
        (item.english_name || '').toLowerCase(),
        (item.display_name || '').toLowerCase(),
        (item.telugu_name || ''),
        (item.hindi_name || '').toLowerCase(),
        (item.aliases || '').toLowerCase(),
        (item.search_keywords || '').toLowerCase(),
        (item.category || '').toLowerCase(),
        (item.sub_category || '').toLowerCase()
      ].join(' ')
    };
  });
  
  if (state.searchIndex.items.length !== items.length) {
    throw new Error(`Search index mismatch: expected ${items.length} records, index has ${state.searchIndex.items.length}`);
  }
  state.searchIndex.built = true;
}

async function initializeApplication() {
  showLoader(true);
  let loadedItems = null;

  try {
    const res = await fetch(`${API_BASE_URL}/api/items`);
    if (res.ok) {
      const json = await res.json();
      loadedItems = Array.isArray(json) ? json : (json.data || json.items || json.catalog);
    }
  } catch (netErr) {
    console.warn('Network request failed, attempting local cache fallback.');
  }

  if (!loadedItems) {
    try {
      const cachedRaw = localStorage.getItem('qtywise_cached_catalog');
      if (cachedRaw) {
        loadedItems = JSON.parse(cachedRaw);
      }
    } catch (e) {
      loadedItems = null;
    }
  }

  if (loadedItems) {
    try {
      validateCatalog(loadedItems);
      state.items = loadedItems;
      localStorage.setItem('qtywise_cached_catalog', JSON.stringify(loadedItems));
      buildSearchIndex(loadedItems);

      elements.itemSearch.disabled = false;
      elements.itemSearch.placeholder = uiTranslations[state.locale].searchPlaceholder;

      const validIds = new Set(state.items.map(i => i.item_id));
      let stateChanged = false;
      for (const id of state.selectedItems) {
        if (!validIds.has(id)) {
          state.selectedItems.delete(id);
          stateChanged = true;
        }
      }
      if (stateChanged) saveState();

      renderSelectedItems();
      updateCalculateButtonState();
    } catch (valErr) {
      elements.itemSearch.disabled = true;
      elements.itemSearch.placeholder = valErr.message;
      showToast(valErr.message, 'error');
    }
  } else {
    elements.itemSearch.disabled = true;
    elements.itemSearch.placeholder = 'Failed to load catalog.';
    showToast('Failed to load food catalog.', 'error');
  }

  showLoader(false);
}

// --------------------------------------------------
// 5. Autocomplete suggestions & Selected Items Chips
// --------------------------------------------------

function translateCategoryTelugu(catName) {
  const map = {
    'Leafy Vegetables': 'ఆకుకూరలు',
    'Fruit Vegetables': 'కూరగాయలు',
    'Root Vegetables': 'దుంపలు',
    'Gourds': 'గుమ్మడి/పాదు కూరలు',
    'Beans & Pods': 'చిక్కుడుకాయలు',
    'Bulbs & Aromatics': 'ఉల్లి, అల్లం',
    'Herbs': 'సుగంధ ఆకులు',
    'Mushrooms': 'పుట్టగొడుగులు',
    'Meat': 'మాంసం',
    'Fish': 'చేపలు',
    'Seafood': 'సముద్ర ఆహారం',
    'Eggs': 'గుడ్లు'
  };
  return map[catName] || catName;
}

// Group popular items when search box is clicked/focused but empty
function renderCommonSuggestions() {
  const dropdown = elements.autocompleteSuggestions;
  dropdown.innerHTML = '';

  const popularItems = state.items.filter(item => {
    return item.popularity_score >= 9;
  });

  if (popularItems.length === 0) {
    dropdown.style.display = 'none';
    return;
  }

  const grouped = {};
  popularItems.forEach(item => {
    if (!grouped[item.category]) {
      grouped[item.category] = [];
    }
    grouped[item.category].push(item);
  });

  let index = 0;
  for (const cat in grouped) {
    if (index >= 10) break;

    const header = document.createElement('div');
    header.className = 'suggestion-group-header';
    const catLabel = state.locale === 'te' ? translateCategoryTelugu(cat) : cat;
    header.innerHTML = `${getCategoryIcon(cat)} ${catLabel}`;
    dropdown.appendChild(header);

    grouped[cat].forEach(item => {
      if (index >= 10) return;

      const isAlreadySelected = state.selectedItems.has(item.item_id);
      const div = document.createElement('div');
      div.className = `suggestion-item ${isAlreadySelected ? 'already-selected' : ''}`;
      div.dataset.index = index;
      div.dataset.itemId = item.item_id;

      div.innerHTML = `
        <div class="suggestion-row-left">
          <span class="suggestion-icon">${getCategoryIcon(item.category)}</span>
          <div class="suggestion-details">
            <span class="suggestion-te">${state.locale === 'te' ? item.telugu_name : (item.display_name || item.english_name)}</span>
            <span class="suggestion-en">${catLabel}</span>
          </div>
        </div>
      `;

      div.addEventListener('click', () => {
        handleSuggestionSelection(item, isAlreadySelected);
      });

      dropdown.appendChild(div);
      index++;
    });
  }

  dropdown.style.display = 'block';
  state.activeSuggestionIndex = -1;
}

function handleSuggestionSelection(item, isAlreadySelected) {
  if (isAlreadySelected) {
    const msg = state.locale === 'te' 
      ? `${item.telugu_name} ఇప్పటికే జోడించబడింది.` 
      : `${item.english_name} is already added.`;
    showToast(msg, 'error');
  } else {
    addItemToSelection(item.item_id);
    const confirmMsg = state.locale === 'te' 
      ? `✓ ${item.telugu_name} జోడించబడింది` 
      : `✓ ${item.english_name} Added`;
    showToast(confirmMsg, 'success');
  }
}

function renderAutocompleteSuggestions() {
  const query = state.searchQuery.toLowerCase().trim();
  const dropdown = elements.autocompleteSuggestions;
  dropdown.innerHTML = '';

  if (!query) {
    renderCommonSuggestions();
    return;
  }

  const matches = state.items.filter(item => {
    if (!state.searchIndex.built) return false;
    const idxEntry = state.searchIndex.items.find(idx => idx.item_id === item.item_id);
    if (!idxEntry) return false;
    return idxEntry.tokens.includes(query);
  });

  if (matches.length === 0) {
    const emptyMsg = state.locale === 'te' 
      ? 'వస్తువులు దొరకలేదు. మరో పేరు లేదా స్పెల్లింగ్ ప్రయత్నించండి.' 
      : 'No matching item found. Try another name or spelling.';
    dropdown.innerHTML = `<div class="suggestion-empty-state">${emptyMsg}</div>`;
    dropdown.style.display = 'block';
    state.activeSuggestionIndex = -1;
    return;
  }

  matches.slice(0, 10).forEach((item, index) => {
    const isAlreadySelected = state.selectedItems.has(item.item_id);
    const div = document.createElement('div');
    div.className = `suggestion-item ${isAlreadySelected ? 'already-selected' : ''}`;
    div.dataset.index = index;
    div.dataset.itemId = item.item_id;
    
    const icon = getCategoryIcon(item.category);
    const catLabel = state.locale === 'te' ? translateCategoryTelugu(item.category) : item.category;
    
    let mockItem = { ...item };
    if (query === 'egg' && item.item_id === 'QTY-AP-FVE-0018') {
      mockItem.display_name = 'Brinjal (Eggplant)';
    }
    const displayName = formatBilingualName(mockItem, state.locale);

    div.innerHTML = `
      <div class="suggestion-row-left">
        <span class="suggestion-icon">${icon}</span>
        <div class="suggestion-details">
          <span class="suggestion-te">${displayName}</span>
          <span class="suggestion-en">${catLabel}</span>
        </div>
      </div>
    `;
    
    div.addEventListener('click', () => {
      handleSuggestionSelection(item, isAlreadySelected);
    });
    
    dropdown.appendChild(div);
  });
  
  dropdown.style.display = 'block';
  state.activeSuggestionIndex = -1;
}

function addItemToSelection(itemId) {
  state.selectedItems.add(itemId);
  state.searchQuery = '';
  elements.itemSearch.value = '';
  elements.btnSearchClear.style.display = 'none';
  elements.autocompleteSuggestions.style.display = 'none';

  saveState();
  renderSelectedItems();
  updateCalculateButtonState();
  hideResultsSection();
}

function removeItemFromSelection(itemId) {
  state.selectedItems.delete(itemId);
  saveState();
  renderSelectedItems();
  updateCalculateButtonState();
  hideResultsSection();
}

function renderSelectedItems() {
  const list = elements.selectedItemsList;
  list.innerHTML = '';

  if (state.selectedItems.size === 0) {
    list.innerHTML = `<li class="empty-state-placeholder" id="selected-empty-text">${uiTranslations[state.locale].emptySelected}</li>`;
    if (elements.btnSaveList) elements.btnSaveList.style.display = 'none';
    return;
  }

  if (elements.btnSaveList) elements.btnSaveList.style.display = 'flex';

  state.items.forEach(item => {
    if (!state.selectedItems.has(item.item_id)) return;

    const li = document.createElement('li');
    li.className = 'selected-item-chip';
    
    const icon = getCategoryIcon(item.category);
    const displayName = formatBilingualName(item, state.locale);

    li.innerHTML = `
      <span class="chip-icon">${icon}</span>
      <div class="chip-names">
        <span>${displayName}</span>
      </div>
      <button type="button" class="chip-remove-btn" aria-label="Remove item">&times;</button>
    `;

    li.querySelector('.chip-remove-btn').addEventListener('click', () => {
      removeItemFromSelection(item.item_id);
    });

    list.appendChild(li);
  });
}

// --------------------------------------------------
// 5.1 Shopping List & History Manager
// --------------------------------------------------
function handleSaveList() {
  if (state.selectedItems.size === 0) return;

  const defaultName = `Shopping List ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`;
  const promptText = state.locale === 'te' ? 'జాబితా పేరును నమోదు చేయండి:' : 'Enter a name for this shopping list:';
  const listName = prompt(promptText, defaultName);

  if (listName === null) return;

  const finalName = listName.trim() || defaultName;
  const newList = {
    list_id: 'list_' + Date.now(),
    list_name: finalName,
    created_date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    created_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    selected_items: Array.from(state.selectedItems),
    people_count: state.peopleCount,
    duration_days: state.durationDays,
    storage_preference: state.storagePreference
  };

  state.savedLists.unshift(newList);
  saveState();
  showToast(uiTranslations[state.locale].toastListSaved, 'success');
}

function openHistoryModal() {
  if (elements.historyModal) elements.historyModal.style.display = 'flex';
  state.historySearchQuery = '';
  if (elements.historySearchInput) elements.historySearchInput.value = '';
  renderHistoryCards();
}

function closeHistoryModal() {
  if (elements.historyModal) elements.historyModal.style.display = 'none';
}

function renderHistoryCards() {
  const container = elements.historyCardsContainer;
  if (!container) return;

  container.innerHTML = '';
  const query = (state.historySearchQuery || '').toLowerCase().trim();
  const filtered = state.savedLists.filter(list => (list.list_name || '').toLowerCase().includes(query));

  if (filtered.length === 0) {
    container.innerHTML = `<div class="suggestion-empty-state" style="padding: 24px; text-align: center; color: var(--color-text-muted);">${uiTranslations[state.locale].noSavedLists}</div>`;
    return;
  }

  filtered.forEach(list => {
    const card = document.createElement('div');
    card.className = 'history-card';

    const itemNames = (list.selected_items || []).map(id => {
      const item = state.items.find(i => i.item_id === id);
      return item ? formatBilingualName(item, state.locale) : id;
    });

    card.innerHTML = `
      <div class="history-card-header">
        <span class="history-card-title">${list.list_name}</span>
        <div class="history-card-meta">
          <span>📅 ${list.created_date} ${list.created_time || ''}</span>
          <span>🛒 ${list.selected_items.length} Items</span>
        </div>
      </div>
      <div class="history-card-tags">
        ${itemNames.slice(0, 4).map(name => `<span class="history-tag">${name}</span>`).join('')}
        ${itemNames.length > 4 ? `<span class="history-tag">+${itemNames.length - 4} more</span>` : ''}
      </div>
      <div class="history-card-actions">
        <button type="button" class="history-btn-action use" data-action="open">Open</button>
        <button type="button" class="history-btn-action view" data-action="rename">Rename</button>
        <button type="button" class="history-btn-action delete" data-action="delete">Delete</button>
      </div>
    `;

    card.querySelector('[data-action="open"]').addEventListener('click', () => loadSavedList(list));
    card.querySelector('[data-action="rename"]').addEventListener('click', () => renameSavedList(list.list_id));
    card.querySelector('[data-action="delete"]').addEventListener('click', () => deleteSavedList(list.list_id));

    container.appendChild(card);
  });
}

function loadSavedList(list) {
  state.selectedItems = new Set(list.selected_items || []);
  if (list.people_count) state.peopleCount = list.people_count;
  if (list.duration_days) state.durationDays = list.duration_days;
  if (list.storage_preference) state.storagePreference = list.storage_preference;

  elements.peopleCountVal.textContent = state.peopleCount;
  elements.durationVal.textContent = state.durationDays;

  updateStepperState();
  updateStorageToggleUI();
  saveState();
  renderSelectedItems();
  updateCalculateButtonState();
  closeHistoryModal();

  showToast(uiTranslations[state.locale].toastListLoaded, 'success');
}

function renameSavedList(listId) {
  const list = state.savedLists.find(l => l.list_id === listId);
  if (!list) return;

  const promptText = state.locale === 'te' ? 'క్రొత్త జాబితా పేరు నమోదు చేయండి:' : 'Enter new list name:';
  const newName = prompt(promptText, list.list_name);

  if (newName !== null && newName.trim()) {
    list.list_name = newName.trim();
    saveState();
    renderHistoryCards();
  }
}

function deleteSavedList(listId) {
  state.savedLists = state.savedLists.filter(l => l.list_id !== listId);
  saveState();
  renderHistoryCards();
  showToast(uiTranslations[state.locale].toastListDeleted, 'success');
}

function hideResultsSection() {
  elements.resultsSection.style.display = 'none';
  state.recommendations = [];
}

function updateCalculateButtonState() {
  elements.btnCalculate.disabled = state.selectedItems.size === 0;
}

function updateStepperState() {
  if (elements.btnPeopleMinus) elements.btnPeopleMinus.disabled = state.peopleCount <= 1;
  if (elements.btnPeoplePlus) elements.btnPeoplePlus.disabled = state.peopleCount >= 100;
  if (elements.btnDurationMinus) elements.btnDurationMinus.disabled = state.durationDays <= 1;
  if (elements.btnDurationPlus) elements.btnDurationPlus.disabled = state.durationDays >= 30;

  if (elements.peopleCountVal) {
    if ('value' in elements.peopleCountVal) {
      elements.peopleCountVal.value = state.peopleCount;
    } else {
      elements.peopleCountVal.textContent = state.peopleCount;
    }
  }
  if (elements.durationVal) {
    if ('value' in elements.durationVal) {
      elements.durationVal.value = state.durationDays;
    } else {
      elements.durationVal.textContent = state.durationDays;
    }
  }
}

function setPeopleCount(rawVal) {
  let val = parseInt(rawVal, 10);
  if (isNaN(val)) val = state.peopleCount;
  val = Math.max(1, Math.min(100, Math.floor(val)));
  state.peopleCount = val;
  updateStepperState();
  saveState();
  if (elements.resultsSection && elements.resultsSection.style.display !== 'none' && state.selectedItems.size > 0) {
    calculateRecommendations();
  }
}

function setDurationDays(rawVal) {
  let val = parseInt(rawVal, 10);
  if (isNaN(val)) val = state.durationDays;
  val = Math.max(1, Math.min(30, Math.floor(val)));
  state.durationDays = val;
  updateStepperState();
  saveState();
  if (elements.resultsSection && elements.resultsSection.style.display !== 'none' && state.selectedItems.size > 0) {
    calculateRecommendations();
  }
}

// --------------------------------------------------
// 5.1 Save List & Saved Lists popup manager
// --------------------------------------------------
function handleNewRecommendation() {
  state.selectedItems.clear();
  state.recommendations = [];
  
  state.searchQuery = '';
  elements.itemSearch.value = '';
  elements.btnSearchClear.style.display = 'none';
  elements.autocompleteSuggestions.style.display = 'none';
  
  saveState();
  renderSelectedItems();
  updateCalculateButtonState();
  hideResultsSection();
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  setTimeout(() => {
    elements.itemSearch.focus();
  }, 100);
}

function localCalculateRecommendations() {
  const people_count = state.peopleCount;
  const duration_days = state.durationDays;
  const storage_preference = state.storagePreference;
  const selected_items = Array.from(state.selectedItems);
  const regional_profile = state.regionalProfile || 'AP_GENERAL';
  const calculation_month = new Date().getMonth() + 1;

  const recommendations = [];

  for (const itemId of selected_items) {
    const item = state.items.find(i => i.item_id === itemId);
    if (!item) continue;

    // 1. Portion Demand Base using standardized formula
    let baseGrams = people_count * duration_days * item.recommended_per_person_per_day;

    // Apply Large Family/Event scale adjustments
    if (people_count >= 15) {
      baseGrams = baseGrams * 0.85;
    }

    // 2. Prep Waste Correction (Yield Factor)
    let grossGrams = baseGrams / item.edible_yield_ratio;

    // 3. Regional Multiplier Adjustments
    let regionalMultiplier = 1.0;
    const categoryLower = item.category.toLowerCase();
    if (regional_profile === 'AP_COASTAL') {
      if (categoryLower.includes('fish') || categoryLower.includes('seafood')) {
        regionalMultiplier = 1.20;
      }
    } else if (regional_profile === 'AP_RAYALASEEMA') {
      if (categoryLower.includes('meat')) {
        regionalMultiplier = 1.20;
      }
    }
    grossGrams = grossGrams * regionalMultiplier;

    // 4. Seasonal Calibration Adjustments
    let seasonalMultiplier = 1.0;
    if (categoryLower.includes('leafy')) {
      if (calculation_month >= 3 && calculation_month <= 6) {
        seasonalMultiplier = 0.80;
      }
    } else if (categoryLower.includes('root')) {
      if (calculation_month === 12 || calculation_month === 1 || calculation_month === 2) {
        seasonalMultiplier = 1.15;
      }
    }
    grossGrams = grossGrams * seasonalMultiplier;

    // 5. Quantization & Standard Base Quantity Calculation
    let finalQuantity = grossGrams;
    if (item.display_in_units) {
      const rawCounts = grossGrams / item.discrete_unit_weight_g;
      let finalCounts = Math.ceil(rawCounts);
      
      if (finalCounts < item.min_purchase_qty_g) {
        finalCounts = item.min_purchase_qty_g;
      }

      finalQuantity = finalCounts;
    } else {
      let finalGrams = Math.round(grossGrams);

      if (finalGrams < item.min_purchase_qty_g) {
        finalGrams = item.min_purchase_qty_g;
      } else {
        const delta = finalGrams - item.min_purchase_qty_g;
        const steps = Math.ceil(delta / item.purchase_increment_g);
        finalGrams = item.min_purchase_qty_g + (steps * item.purchase_increment_g);
      }

      finalQuantity = finalGrams;
    }

    // 6. Shelf Life Warning Validation
    let storageWarningTriggered = false;
    let storageWarningMessage = null;

    if (storage_preference === 'AMBIENT') {
      const ambientLimit = item.shelf_life.ambient;
      if (ambientLimit !== null && duration_days > ambientLimit) {
        storageWarningTriggered = true;
        const warningMsgTe = `${item.english_name} (${item.telugu_name}) యొక్క సాధారణ నిల్వ కాలం ${ambientLimit} రోజులు మాత్రమే, ఇది మీ ప్రణాళిక చేసిన ${duration_days} రోజుల కంటే తక్కువ.`;
        const warningMsgEn = `${item.english_name} (${item.telugu_name}) has an ambient shelf life of only ${ambientLimit} day(s), which is less than your planned Items Required For of ${duration_days} day(s).`;
        storageWarningMessage = state.locale === 'te' ? warningMsgTe : warningMsgEn;
      }
    }

    recommendations.push({
      item_id: item.item_id,
      english_name: item.english_name,
      telugu_name: item.telugu_name,
      category: item.category,
      sub_category: item.subcategory,
      raw_quantity: finalQuantity,
      base_unit: item.base_unit,
      storage_warning_triggered: storageWarningTriggered,
      storage_warning_message: storageWarningMessage,
      purchase_notes: item.purchase_notes,
      common_household_usage: item.common_household_usage,
      season_availability: item.season_availability,
      popularity_score: item.popularity_score,
      calculation_priority: item.calculation_priority,
      recommendation_notes: item.recommendation_notes
    });
  }

  recommendations.sort((a, b) => {
    if (b.popularity_score !== a.popularity_score) {
      return b.popularity_score - a.popularity_score;
    }
    if (a.calculation_priority !== b.calculation_priority) {
      return a.calculation_priority - b.calculation_priority;
    }
    return a.english_name.localeCompare(b.english_name);
  });

  return recommendations;
}

async function calculateRecommendations() {
  if (state.selectedItems.size === 0) {
    showToast(uiTranslations[state.locale].toastSelectAlert, 'error');
    return;
  }

  showLoader(true);

  try {
    const payload = {
      people_count: state.peopleCount,
      duration_days: state.durationDays,
      storage_preference: state.storagePreference,
      selected_items: Array.from(state.selectedItems),
      regional_profile: state.regionalProfile
    };

    let fetchedRecommendations = null;
    try {
      const response = await fetch(`${API_BASE_URL}/api/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const json = await response.json();
        fetchedRecommendations = json.data.recommendations;
      } else {
        console.warn(`API recommend returned HTTP ${response.status}. Falling back to local engine.`);
      }
    } catch (netErr) {
      console.warn('[API Recommendation] Server unreachable, using local engine fallback:', netErr);
    }

    if (fetchedRecommendations) {
      state.recommendations = fetchedRecommendations;
    } else {
      state.recommendations = localCalculateRecommendations();
    }

    state.isSaved = false;

    renderRecommendations();
    elements.resultsSection.style.display = 'block';
    elements.resultsSection.scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    console.error('Error calculating recommendations:', err);
    showToast(uiTranslations[state.locale].toastRecommendError, 'error');
  } finally {
    showLoader(false);
  }
}

function getBestBeforeAndUseWithin(item, storagePreference, locale) {
  const isMeat = item.category === 'Meat' || item.category === 'Fish' || item.category === 'Seafood';
  const isTe = locale === 'te';
  
  if (isMeat) {
    return {
      bestBefore: isTe ? 'రిఫ్రిజిరేటర్: 1-2 రోజులు' : 'Refrigerated: 1-2 Days',
      useWithin: isTe ? '2 రోజుల్లో ఉపయోగించండి (ఫ్రీజర్‌లో 3 నెలలు)' : 'Use within 2 Days (Keep frozen up to 3 months)'
    };
  }

  const ambDays = item.shelf_life?.ambient || 3;
  const refDays = item.shelf_life?.refrigerated || 7;

  if (storagePreference === 'REFRIGERATED' && item.shelf_life?.refrigerated) {
    return {
      bestBefore: isTe ? `రిఫ్రిజిరేటర్: ~${refDays} రోజులు` : `Refrigerated: ~${refDays} Days`,
      useWithin: isTe ? `${refDays} రోజుల్లో ఉపయోగించండి` : `Use within ${refDays} Days`
    };
  } else {
    return {
      bestBefore: isTe ? `సాధారణ నిల్వ: ~${ambDays} రోజులు` : `Ambient: ~${ambDays} Days`,
      useWithin: isTe ? `${ambDays} రోజుల్లో ఉపయోగించండి` : `Use within ${ambDays} Days`
    };
  }
}

function renderRecommendations() {
  const container = elements.recommendationsList;
  container.innerHTML = '';

  state.recommendations.forEach(rec => {
    const li = document.createElement('li');
    li.className = 'recommendation-item';

    const itemObj = state.items.find(i => i.item_id === rec.item_id) || rec;
    li.setAttribute('data-category', itemObj.category || rec.category || '');
    const { bestBefore, useWithin } = getBestBeforeAndUseWithin(itemObj, state.storagePreference, state.locale);
    const displayName = formatBilingualName(itemObj, state.locale);
    const displayQty = getFormattedQuantity(rec.raw_quantity, rec.base_unit, state.locale, itemObj);

    const warningMarkup = rec.storage_warning_triggered
      ? `
        <div class="storage-warning" role="alert">
          <svg class="warning-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span><strong>${uiTranslations[state.locale].storageWarningPrefix}</strong> ${rec.storage_warning_message}</span>
        </div>
      `
      : '';

    const icon = getCategoryIcon(rec.category);

    li.innerHTML = `
      <div class="rec-item-row">
        <div class="rec-item-names">
          <span class="rec-item-te-name">${icon} ${displayName}</span>
          <span class="rec-item-bestbefore"><strong>Best Before:</strong> ${bestBefore}</span>
          <span class="rec-item-bestbefore"><strong>Use Within:</strong> ${useWithin}</span>
        </div>
        <span class="rec-item-qty">${displayQty}</span>
      </div>
      ${warningMarkup}
    `;
    container.appendChild(li);
  });
}

// --------------------------------------------------
// 8. Language Translation Engine
// --------------------------------------------------
function toggleLanguage() {
  state.locale = state.locale === 'en' ? 'te' : 'en';
  saveState();
  translateUI();
  renderSelectedItems();
  updateStorageToggleUI();
  if (state.recommendations.length > 0) {
    renderRecommendations();
  }
  if (elements.historyModal && elements.historyModal.style.display !== 'none') {
    renderHistoryCards();
  }
}

function translateUI() {
  const trans = uiTranslations[state.locale];
  elements.btnLanguageToggle.textContent = trans.langToggle;
  if (elements.btnHistory) elements.btnHistory.textContent = trans.btnHistory;
  if (elements.btnSaveList) elements.btnSaveList.textContent = trans.btnSaveList;
  if (elements.labelHistoryHeader) elements.labelHistoryHeader.textContent = trans.labelHistoryHeader;
  if (elements.historySearchInput) elements.historySearchInput.placeholder = trans.historySearchPlaceholder;

  elements.appSubtitle.textContent = trans.appSubtitle;
  elements.labelPeople.textContent = trans.labelPeople;
  elements.labelDuration.textContent = trans.labelDuration;
  elements.labelStorage.textContent = trans.labelStorage;
  elements.storageHelper.textContent = trans.storageHelper;
  elements.labelAddItem.textContent = trans.labelAddItem;
  
  if (!elements.itemSearch.disabled) {
    elements.itemSearch.placeholder = trans.searchPlaceholder;
  } else {
    elements.itemSearch.placeholder = state.locale === 'te' 
      ? 'కేటలాగ్ లోడ్ చేయడంలో విఫలమైంది.' 
      : 'Failed to load catalog.';
  }
  
  elements.labelSelectedTitle.textContent = trans.labelSelectedTitle;
  elements.btnNewRecommendation.textContent = trans.btnNewRecommendation;
  elements.btnCalculate.textContent = trans.btnCalculate;
  elements.labelResultsTitle.textContent = trans.labelResultsTitle;
  elements.loaderText.textContent = trans.loaderText;
  
  const emptyText = document.getElementById('selected-empty-text');
  if (emptyText) {
    emptyText.textContent = trans.emptySelected;
  }
}

// --------------------------------------------------
// 9. Event Listeners & Keyboard Navigation
// --------------------------------------------------
function bindEvents() {
  elements.btnLanguageToggle.addEventListener('click', toggleLanguage);

  if (elements.btnSaveList) {
    elements.btnSaveList.addEventListener('click', handleSaveList);
  }

  if (elements.btnHistory) {
    elements.btnHistory.addEventListener('click', openHistoryModal);
  }

  if (elements.btnCloseHistory) {
    elements.btnCloseHistory.addEventListener('click', closeHistoryModal);
  }

  if (elements.historyBackdrop) {
    elements.historyBackdrop.addEventListener('click', closeHistoryModal);
  }

  if (elements.historySearchInput) {
    elements.historySearchInput.addEventListener('input', (e) => {
      state.historySearchQuery = e.target.value;
      renderHistoryCards();
    });
  }

  // Steppers: People Count
  elements.btnPeopleMinus.addEventListener('click', () => {
    if (state.peopleCount > 1) {
      setPeopleCount(state.peopleCount - 1);
    }
  });

  elements.btnPeoplePlus.addEventListener('click', () => {
    if (state.peopleCount < 100) {
      setPeopleCount(state.peopleCount + 1);
    }
  });

  if (elements.peopleCountVal) {
    elements.peopleCountVal.addEventListener('change', (e) => setPeopleCount(e.target.value));
    elements.peopleCountVal.addEventListener('blur', (e) => setPeopleCount(e.target.value));
    elements.peopleCountVal.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        setPeopleCount(e.target.value);
        elements.peopleCountVal.blur();
      }
    });
  }

  // Steppers: Items Required For (Days)
  elements.btnDurationMinus.addEventListener('click', () => {
    if (state.durationDays > 1) {
      setDurationDays(state.durationDays - 1);
    }
  });

  elements.btnDurationPlus.addEventListener('click', () => {
    if (state.durationDays < 30) {
      setDurationDays(state.durationDays + 1);
    }
  });

  if (elements.durationVal) {
    elements.durationVal.addEventListener('change', (e) => setDurationDays(e.target.value));
    elements.durationVal.addEventListener('blur', (e) => setDurationDays(e.target.value));
    elements.durationVal.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        setDurationDays(e.target.value);
        elements.durationVal.blur();
      }
    });
  }

  // Storage Preference Toggles
  elements.storageAmbient.addEventListener('click', () => selectStoragePreference('AMBIENT'));
  elements.storageRefrigerated.addEventListener('click', () => selectStoragePreference('REFRIGERATED'));

  // Autocomplete Search Box Inputs
  elements.itemSearch.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    elements.btnSearchClear.style.display = state.searchQuery ? 'block' : 'none';
    renderAutocompleteSuggestions();
  });

  elements.itemSearch.addEventListener('focus', () => {
    renderAutocompleteSuggestions();
  });

  elements.itemSearch.addEventListener('click', () => {
    renderAutocompleteSuggestions();
  });

  // Autocomplete Keyboard Navigation Bindings
  elements.itemSearch.addEventListener('keydown', (e) => {
    const dropdown = elements.autocompleteSuggestions;
    if (dropdown.style.display === 'none') return;

    const suggestionItems = dropdown.querySelectorAll('.suggestion-item');
    if (suggestionItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      state.activeSuggestionIndex++;
      if (state.activeSuggestionIndex >= suggestionItems.length) {
        state.activeSuggestionIndex = 0;
      }
      highlightSuggestionItem(suggestionItems);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      state.activeSuggestionIndex--;
      if (state.activeSuggestionIndex < 0) {
        state.activeSuggestionIndex = suggestionItems.length - 1;
      }
      highlightSuggestionItem(suggestionItems);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (state.activeSuggestionIndex >= 0 && state.activeSuggestionIndex < suggestionItems.length) {
        const activeItem = suggestionItems[state.activeSuggestionIndex];
        const itemId = activeItem.dataset.itemId;
        const item = state.items.find(i => i.item_id === itemId);
        const isAlreadySelected = activeItem.classList.contains('already-selected');
        if (item) {
          handleSuggestionSelection(item, isAlreadySelected);
        }
      }
    } else if (e.key === 'Escape') {
      dropdown.style.display = 'none';
      elements.itemSearch.blur();
    }
  });

  elements.btnSearchClear.addEventListener('click', () => {
    elements.itemSearch.value = '';
    state.searchQuery = '';
    elements.btnSearchClear.style.display = 'none';
    elements.autocompleteSuggestions.style.display = 'none';
  });

  document.addEventListener('click', (e) => {
    if (!elements.itemSearch.contains(e.target) && !elements.autocompleteSuggestions.contains(e.target)) {
      elements.autocompleteSuggestions.style.display = 'none';
    }
  });

  // Bottom Action Bar
  elements.btnNewRecommendation.addEventListener('click', handleNewRecommendation);

  // Calculate Button click
  elements.btnCalculate.addEventListener('click', calculateRecommendations);
}

function highlightSuggestionItem(items) {
  items.forEach(item => item.classList.remove('active'));
  
  const activeItem = items[state.activeSuggestionIndex];
  if (activeItem) {
    activeItem.classList.add('active');
    activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

// --------------------------------------------------
// 10. Interactive UI Helpers
// --------------------------------------------------
function selectStoragePreference(pref) {
  state.storagePreference = pref;
  saveState();
  updateStorageToggleUI();
  hideResultsSection();
}

function updateStorageToggleUI() {
  const trans = uiTranslations[state.locale] || uiTranslations['en'];
  
  if (state.storagePreference === 'AMBIENT') {
    elements.storageAmbient.classList.add('active');
    elements.storageAmbient.setAttribute('aria-checked', 'true');
    elements.storageAmbient.textContent = `✓ ${trans.storageAmbient.replace('✓ ', '')}`;
    
    elements.storageRefrigerated.classList.remove('active');
    elements.storageRefrigerated.setAttribute('aria-checked', 'false');
    elements.storageRefrigerated.textContent = trans.storageRefrigeratedUnchecked;
  } else {
    elements.storageAmbient.classList.remove('active');
    elements.storageAmbient.setAttribute('aria-checked', 'false');
    elements.storageAmbient.textContent = trans.storageAmbient.replace('✓ ', '');
    
    elements.storageRefrigerated.classList.add('active');
    elements.storageRefrigerated.setAttribute('aria-checked', 'true');
    elements.storageRefrigerated.textContent = trans.storageRefrigerated;
  }
}

function showLoader(show) {
  state.isLoading = show;
  elements.loader.style.display = show ? 'flex' : 'none';
}

function showToast(message, type = 'success') {
  const toast = elements.toast;
  toast.textContent = message;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.className = 'toast';
  }, 3000);
}
