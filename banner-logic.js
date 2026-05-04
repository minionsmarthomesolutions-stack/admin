
/**
 * Banner Module Logic
 * Handles Form, Preview, Image Processing, and Firebase Integration
 */

// --- Global State ---
const state = {
    bannerType: 'single', // 'single' | 'double'
    activeSlot: 'a',      // 'a' | 'b' - Currently being edited/transformed
    images: {
        a: { file: null, previewUrl: null, transform: { scale: 1, x: 0, y: 0 } },
        b: { file: null, previewUrl: null, transform: { scale: 1, x: 0, y: 0 } }
    },
    selectedProduct: null, // Global context product

    // Specific Links
    linkProdA: null,
    linkProdB: null,

    isDragging: false,
    dragStart: { x: 0, y: 0 },
    dragCurrent: { x: 0, y: 0 },
    lastTransform: { x: 0, y: 0 }
};

// --- DOM Elements ---
const dom = {
    form: document.getElementById('bannerForm'),
    bannerTypeRadios: document.getElementsByName('bannerType'),
    sectionB: document.getElementById('section-banner-b'),
    previewContainerA: document.getElementById('previewContainerA'),
    previewContainerB: document.getElementById('previewContainerB'),
    previewImgA: document.getElementById('previewImgA'),
    previewImgB: document.getElementById('previewImgB'),
    zoomSlider: document.getElementById('zoomSlider'),
    activeSlotLabel: document.getElementById('activeSlotLabel'),
    scaleValA: document.getElementById('scaleValA'),
    scaleValB: document.getElementById('scaleValB'),

    // Uploads
    uploadA: document.getElementById('uploadA'),
    uploadB: document.getElementById('uploadB'),

    // Global Category
    catSelect: document.getElementById('categorySelect'),

    // Global Product Search
    productSearch: document.getElementById('productSearch'),
    productSearchResults: document.getElementById('productSearchResults'),
    selectedProductContainer: document.getElementById('selectedProductContainer'),
    selectedProductName: document.getElementById('selectedProductName'),
    clearProductBtn: document.getElementById('clearProductBtn'),

    // Buttons
    saveBtn: document.getElementById('saveBtn'),
    resetBtn: document.getElementById('resetBtn'),
    toggleMobileBtn: document.getElementById('toggleMobilePreview'),
    resetTransformBtn: document.getElementById('resetTransformBtn')
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
    initFirebaseChecks();
    initEventListeners();
    initCategoryLogic();
    // Default active state
    updatePreviewSelection('a');
    // Default active state
    updatePreviewSelection('a');
    // Initialize UI constraints (Single/Double classes)

    // Check for Edit Mode
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('id');

    if (editId) {
        document.querySelector('.header-logo').textContent = 'Edit Banner';
        document.querySelector('title').textContent = 'Edit Banner | Admin';
        loadBannerForEdit(editId);
    } else {
        toggleBannerTypeUI();
    }
});

async function loadBannerForEdit(id) {
    try {
        const doc = await window.db.collection('banners').doc(id).get();
        if (!doc.exists) {
            alert('Banner not found!');
            window.location.href = 'manage-banner.html';
            return;
        }

        const data = doc.data();
        state.editId = id; // specific state for update vs create

        // 1. General Info
        document.getElementById('bannerTitle').value = data.title || '';
        document.getElementById('bannerDesc').value = data.description || '';

        // Wait for categories to load before setting value
        if (dom.catSelect.options.length <= 1) {
            // Give it a moment or rely on the category loader to preserve selection?
            // Better: just set it, if it's not there yet, the loader might overwrite.
            // Actually initCategoryLogic handles population. Let's delay setting slightly or retry.
            setTimeout(() => { dom.catSelect.value = data.categoryId || ''; }, 500);
        } else {
            dom.catSelect.value = data.categoryId || '';
        }

        // 2. Banner Type
        state.bannerType = data.type || 'single';
        // Update Radios
        dom.bannerTypeRadios.forEach(r => r.checked = r.value === state.bannerType);
        toggleBannerTypeUI();

        // 3. Product Linking (Global)
        if (data.productId) {
            selectProduct(data.productId, data.productName, 'global');
        }

        // 4. Banner A Populating
        if (data.banners && data.banners.a) {
            const bA = data.banners.a;
            document.getElementById('altA').value = bA.alt || '';
            document.getElementById('ctaA').value = bA.cta || '';
            document.getElementById('linkTypeA').value = bA.linkType || 'category';

            // Trigger change to show correct fields
            document.getElementById('linkTypeA').dispatchEvent(new Event('change'));

            // Set Link Data
            if (bA.linkType === 'custom') {
                document.getElementById('customLinkA').value = bA.linkData?.url || '';
            } else if (bA.linkType === 'product' && bA.linkData) {
                selectProduct(bA.linkData.productId, bA.linkData.productName, 'a');
            } else if (bA.linkType === 'category' && bA.linkData) {
                // Populate cascades
                const m = document.getElementById('linkCatA_Main');
                m.value = bA.linkData.main || '';
                m.dispatchEvent(new Event('change'));

                setTimeout(() => {
                    const s = document.getElementById('linkCatA_Sub');
                    s.value = bA.linkData.sub || '';
                    s.dispatchEvent(new Event('change'));

                    setTimeout(() => {
                        document.getElementById('linkCatA_SubSub').value = bA.linkData.subSub || '';
                    }, 200);
                }, 200);
            }

            // Image Preview
            if (bA.url) {
                state.images.a.previewUrl = bA.url;
                dom.previewImgA.src = bA.url;
                // state.images.a.transform = bA.transform || { scale: 1, x: 0, y: 0 };
                // updateTransform('a', state.images.a.transform);
                // We don't restore exact transform editing state for now, just the result image
            }
        }

        // 5. Banner B Populating
        if (state.bannerType === 'double' && data.banners && data.banners.b) {
            const bB = data.banners.b;
            document.getElementById('altB').value = bB.alt || '';
            document.getElementById('ctaB').value = bB.cta || '';
            document.getElementById('linkTypeB').value = bB.linkType || 'category';
            document.getElementById('linkTypeB').dispatchEvent(new Event('change'));

            if (bB.linkType === 'custom') {
                document.getElementById('customLinkB').value = bB.linkData?.url || '';
            } else if (bB.linkType === 'product' && bB.linkData) {
                selectProduct(bB.linkData.productId, bB.linkData.productName, 'b');
            } else if (bB.linkType === 'category' && bB.linkData) {
                const m = document.getElementById('linkCatB_Main');
                m.value = bB.linkData.main || '';
                m.dispatchEvent(new Event('change'));
                setTimeout(() => {
                    const s = document.getElementById('linkCatB_Sub');
                    s.value = bB.linkData.sub || '';
                    s.dispatchEvent(new Event('change'));
                    setTimeout(() => {
                        document.getElementById('linkCatB_SubSub').value = bB.linkData.subSub || '';
                    }, 200);
                }, 200);
            }

            if (bB.url) {
                state.images.b.previewUrl = bB.url;
                dom.previewImgB.src = bB.url;
            }
        }

        dom.saveBtn.querySelector('.btn-text').textContent = 'Update Banner';

    } catch (e) {
        console.error('Error loading banner:', e);
        alert('Failed to load banner data');
    }
}

function initFirebaseChecks() {
    if (!window.firebase || !window.db || !window.storage) {
        console.error("Firebase not initialized correctly. Check firebase-config.js");
        alert("Error: Firebase not connected. Please refresh or check console.");
    }
}

// --- Event Listeners ---
function initEventListeners() {
    // 1. Banner Type Toggle
    dom.bannerTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.bannerType = e.target.value;
            toggleBannerTypeUI();
        });
    });

    // 2. Image Uploads
    dom.uploadA.addEventListener('change', (e) => handleImageUpload(e, 'a'));
    dom.uploadB.addEventListener('change', (e) => handleImageUpload(e, 'b'));

    // 3. Zoom Slider
    dom.zoomSlider.addEventListener('input', (e) => {
        const scale = parseFloat(e.target.value);
        updateTransform(state.activeSlot, { scale });
    });

    // 4. Preview Container Selection
    dom.previewContainerA.addEventListener('mousedown', () => updatePreviewSelection('a'));
    dom.previewContainerA.addEventListener('touchstart', () => updatePreviewSelection('a'));
    dom.previewContainerB.addEventListener('mousedown', () => updatePreviewSelection('b'));
    dom.previewContainerB.addEventListener('touchstart', () => updatePreviewSelection('b'));

    // 5. Drag Setup
    setupDragLogic(dom.previewContainerA, 'a');
    setupDragLogic(dom.previewContainerB, 'b');

    // 6. Mobile Toggle
    dom.toggleMobileBtn.addEventListener('click', () => {
        document.getElementById('previewStage').classList.toggle('mobile-view');
    });

    // 7. Reset Transform
    dom.resetTransformBtn.addEventListener('click', () => {
        updateTransform(state.activeSlot, { scale: 1, x: 0, y: 0 });
        dom.zoomSlider.value = 1;
    });

    // 8. Global Product Search
    const triggerGlobalSearch = (val) => handleProductSearch(val, 'global');
    dom.productSearch.addEventListener('input', debounce((e) => triggerGlobalSearch(e.target.value), 500));
    dom.productSearch.addEventListener('focus', (e) => triggerGlobalSearch(e.target.value));
    dom.clearProductBtn.addEventListener('click', clearSelectedProduct);

    // 9. Save Form
    dom.saveBtn.addEventListener('click', handleSave);

    // 10. Link Logic (Enhanced)
    initLinkLogic('a');
    initLinkLogic('b');
}

function initLinkLogic(slot) {
    const suffix = slot.toUpperCase();
    const typeSelect = document.getElementById(`linkType${suffix}`);

    const catGroup = document.getElementById(`linkCategoryGroup${suffix}`);
    const prodGroup = document.getElementById(`linkProductGroup${suffix}`);
    const customGroup = document.getElementById(`customLinkGroup${suffix}`);

    // Type Change Listener
    typeSelect.addEventListener('change', () => {
        const val = typeSelect.value;

        // Reset Visibility
        catGroup.classList.add('hidden');
        prodGroup.classList.add('hidden');
        customGroup.classList.add('hidden');

        if (val === 'category') {
            catGroup.classList.remove('hidden');
            // Populate main category if empty
            const mainSelect = document.getElementById(`linkCat${suffix}_Main`);
            if (mainSelect.options.length <= 1) {
                populateCategoryDropdowns(slot);
            }
        } else if (val === 'product') {
            prodGroup.classList.remove('hidden');
        } else if (val === 'custom') {
            customGroup.classList.remove('hidden');
        }
    });

    // Category Cascading for Link
    const mainSel = document.getElementById(`linkCat${suffix}_Main`);
    const subSel = document.getElementById(`linkCat${suffix}_Sub`);
    const subSubSel = document.getElementById(`linkCat${suffix}_SubSub`);

    mainSel.addEventListener('change', () => {
        subSel.innerHTML = '<option value="">Select Sub...</option>';
        subSubSel.innerHTML = '<option value="">Select Sub-Sub...</option>';
        subSel.disabled = true;
        subSubSel.disabled = true;

        const data = window.dynamicCategories.getCategoriesData();
        const main = mainSel.value;

        if (main && data[main]) {
            const mainData = data[main];
            let subCats = [];

            if (mainData.subcategories && typeof mainData.subcategories === 'object') {
                subCats = Object.keys(mainData.subcategories);
            } else {
                subCats = Object.keys(mainData);
            }
            // Filter system keys
            subCats = subCats.filter(k => k !== 'id' && k !== 'code' && k !== 'logo');

            populateSelect(subSel, subCats);
            subSel.disabled = false;
        }
    });

    subSel.addEventListener('change', () => {
        subSubSel.innerHTML = '<option value="">Select Sub-Sub...</option>';
        subSubSel.disabled = true;

        const data = window.dynamicCategories.getCategoriesData();
        const main = mainSel.value;
        const sub = subSel.value;

        if (main && sub && data[main]) {
            const mainData = data[main];
            let subData = null;

            if (mainData.subcategories && mainData.subcategories[sub]) {
                subData = mainData.subcategories[sub];
            } else {
                subData = mainData[sub];
            }

            if (subData) {
                let subSubs = [];

                // Prioritize 'items' array/object
                if (subData.items) {
                    if (Array.isArray(subData.items)) {
                        subSubs = subData.items;
                    } else if (typeof subData.items === 'object') {
                        subSubs = Object.keys(subData.items);
                    }
                }
                // Fallbacks
                else if (Array.isArray(subData)) {
                    subSubs = subData;
                } else if (subData.subcategories && Array.isArray(subData.subcategories)) {
                    subSubs = subData.subcategories;
                } else if (typeof subData === 'object') {
                    subSubs = Object.keys(subData);
                }

                // Filter system keys
                if (Array.isArray(subSubs)) {
                    subSubs = subSubs.filter(k => k !== 'logo' && k !== 'itemLogos' && k !== 'items' && k !== 'code');
                }

                if (subSubs.length > 0) {
                    populateSelect(subSubSel, subSubs);
                    subSubSel.disabled = false;
                }
            }
        }
    });

    // Product Search for Link
    const prodSearch = document.getElementById(`linkProdSearch${suffix}`);
    const clearBtn = document.getElementById(`linkProdClear${suffix}`);

    const triggerLinkSearch = (val) => handleProductSearch(val, slot);
    prodSearch.addEventListener('input', debounce((e) => triggerLinkSearch(e.target.value), 500));
    prodSearch.addEventListener('focus', (e) => triggerLinkSearch(e.target.value));

    clearBtn.addEventListener('click', () => {
        if (slot === 'a') state.linkProdA = null;
        else state.linkProdB = null;

        document.getElementById(`linkProdSelectedContainer${suffix}`).classList.add('hidden');
        document.getElementById(`linkProdId${suffix}`).value = '';
    });
}


// --- UI Logic ---

function toggleBannerTypeUI() {
    // Remove existing classes first
    dom.previewContainerA.classList.remove('single', 'double');
    dom.previewContainerB.classList.remove('single', 'double');

    if (state.bannerType === 'single') {
        dom.sectionB.classList.add('hidden');
        dom.previewContainerB.classList.add('hidden');

        // Single Mode: A is 4:1
        dom.previewContainerA.classList.add('single');

        if (state.activeSlot === 'b') updatePreviewSelection('a');
    } else {
        dom.sectionB.classList.remove('hidden');
        dom.previewContainerB.classList.remove('hidden');

        // Double Mode: A and B are 2:1 (or whatever 'double' class defines)
        dom.previewContainerA.classList.add('double');
        dom.previewContainerB.classList.add('double');
    }
}

function updatePreviewSelection(slot) {
    state.activeSlot = slot;
    dom.activeSlotLabel.textContent = slot === 'a' ? '(Banner A)' : '(Banner B)';

    dom.previewContainerA.style.borderColor = slot === 'a' ? 'var(--primary-color)' : '#cbd5e1';
    dom.previewContainerB.style.borderColor = slot === 'b' ? 'var(--primary-color)' : '#cbd5e1';

    dom.zoomSlider.value = state.images[slot].transform.scale;
}


// --- Category Logic ---
async function initCategoryLogic() {
    if (window.dynamicCategories) {
        try {
            console.log("Fetching categories from Firebase...");
            // Explicitly wait for Firebase fetch
            await window.dynamicCategories.loadCategoriesFromFirebase();

            const data = window.dynamicCategories.getCategoriesData();
            console.log("Categories ready:", Object.keys(data));

            // 1. Populate Main Banner Category Select
            populateSelect(dom.catSelect, Object.keys(data));

            // 2. Populate Link Category Dropdowns for A & B
            populateCategoryDropdowns('a');
            populateCategoryDropdowns('b');

        } catch (error) {
            console.error("Error initializing categories:", error);
            // Fallback to whatever is available (likely static)
            const data = window.dynamicCategories.getCategoriesData();
            populateSelect(dom.catSelect, Object.keys(data));
        }
    }

    // Main Form Category Logic - No longer needed since we only have main category
    // Category selection is now simplified to main category only
}

function populateCategoryDropdowns(slot) {
    const suffix = slot.toUpperCase();
    const mainSel = document.getElementById(`linkCat${suffix}_Main`);
    const data = window.dynamicCategories.getCategoriesData();
    populateSelect(mainSel, Object.keys(data));
}

function populateSelect(selectEl, items) {
    items.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item;
        opt.textContent = item;
        selectEl.appendChild(opt);
    });
}


// --- Advanced Search Logic ---

function resolveImageUrl(url) {
    if (!url) return 'https://via.placeholder.com/40';
    if (/^https?:\/\//i.test(url)) return url;
    return url.startsWith('/') ? url.slice(1) : url;
}

function calculateRelevance(product, searchTerm) {
    let relevance = 0;
    const term = searchTerm.toLowerCase().trim();
    const searchWords = term.split(/\s+/).filter(w => w.length > 0);

    // Handle different product data structures
    const productName = (product.name || product.productName || '').toLowerCase();
    const productCategory = (product.category || product.mainCategory || '').toLowerCase();

    // 1. Exact name match
    if (productName === term) relevance += 1000;
    // 2. Name starts with term
    else if (productName.startsWith(term)) relevance += 500;
    // 3. Name contains term
    else if (productName.includes(term)) relevance += 300;

    // 4. Word matches
    if (searchWords.length > 0) {
        const nameWords = productName.split(/\s+/);
        const allWordsMatch = searchWords.every(sw => nameWords.some(nw => nw.includes(sw)));
        if (allWordsMatch) relevance += 250;
    }

    // 5. Category Match
    if (productCategory.includes(term)) relevance += 100;

    return relevance;
}

// --- Utilities ---
async function handleProductSearch(term, context) {
    console.log(`handleProductSearch called with term="${term}", context="${context}"`);
    let resultsContainer;
    if (context === 'global') resultsContainer = dom.productSearchResults;
    else resultsContainer = document.getElementById(`linkProdResults${context.toUpperCase()}`);

    if (!resultsContainer) {
        console.error('Results container not found for context:', context);
        return;
    }

    try {
        term = term ? term.trim() : '';
        console.log(`[Search Debug] Processing term: "${term}" for context: ${context}`);

        if (!window.db) {
            console.error('[Search Debug] Database not initialized!');
            return;
        }

        const ref = window.db.collection('products');

        if (term.length < 2) {
            // User requested: Don't show products if not searching
            resultsContainer.innerHTML = '';
            resultsContainer.classList.add('hidden');
            return;
        } else {
            // Search Strategy: Fire multiple queries to emulate case-insensitivity
            const terms = new Set([
                term,
                term.toLowerCase(),
                term.charAt(0).toUpperCase() + term.slice(1).toLowerCase()
            ]);

            const promises = Array.from(terms).map(t =>
                ref.where('name', '>=', t)
                    .where('name', '<=', t + '\uf8ff')
                    .limit(10)
                    .get()
            );

            const snapshots = await Promise.all(promises);

            // Deduplicate by ID
            const productMap = new Map();
            snapshots.forEach(snap => {
                snap.forEach(doc => {
                    if (!productMap.has(doc.id)) {
                        productMap.set(doc.id, { id: doc.id, ...doc.data() });
                    }
                });
            });

            let products = Array.from(productMap.values());
            console.log(`[Search Debug] Merged results count: ${products.length}`);

            renderSearchResults(products, resultsContainer, context, term);
        }
    } catch (err) {
        console.error("Search error", err);
        resultsContainer.innerHTML = '<div class="search-item" style="color:red;">Error searching: ' + err.message + '</div>';
        resultsContainer.classList.remove('hidden');
    }
}

function renderSearchResults(products, resultsContainer, context, term) {
    resultsContainer.innerHTML = '';

    if (products.length === 0) {
        resultsContainer.innerHTML = '<div class="search-item" style="display:block; color:#94a3b8; padding:12px;">No products found</div>';
    } else {
        // Apply Advanced Relevance Sorting (Client-side)
        if (term && term.length > 0) {
            products = products.map(p => ({
                ...p,
                relevance: calculateRelevance(p, term)
            })).sort((a, b) => b.relevance - a.relevance);
        }

        console.log(`Rendered ${products.length} products`);
        products.forEach(p => {
            const rawName = p.name || 'Unnamed Product';
            const cleanName = rawName.trim(); // Use full name as requested
            const imgUrl = resolveImageUrl(p.primaryImageUrl || p.imageUrl);
            const category = p.category || p.mainCategory || 'General';

            const div = document.createElement('div');
            div.className = 'search-item';
            div.onclick = () => selectProduct(p.id, cleanName, context);

            div.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px; width: 100%;">
                    <img src="${imgUrl}" alt="${cleanName}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;" onerror="this.src='https://via.placeholder.com/40'">
                    <div class="info" style="flex: 1;">
                        <div class="name" style="font-weight: 600; font-size: 14px;">${cleanName}</div>
                        <div class="meta" style="font-size: 12px; color: #64748b;">
                            <span>${category}</span>
                            <span style="margin-left: 8px;">${p.stockStatus ? p.stockStatus.replace('_', ' ') : 'In Stock'}</span>
                        </div>
                    </div>
                </div>
            `;
            resultsContainer.appendChild(div);
        });
    }
    resultsContainer.classList.remove('hidden');
}

function selectProduct(id, name, context) {
    if (context === 'global') {
        state.selectedProduct = { id, name };
        dom.selectedProductName.textContent = name;
        dom.selectedProductContainer.classList.remove('hidden');
        dom.productSearchResults.classList.add('hidden');
        dom.productSearch.value = '';
        // Sync hidden input
        document.getElementById('selectedProductId').value = id;
    } else {
        const suffix = context.toUpperCase();
        if (context === 'a') state.linkProdA = { id, name };
        else state.linkProdB = { id, name };

        document.getElementById(`linkProdName${suffix}`).textContent = name;
        document.getElementById(`linkProdSelectedContainer${suffix}`).classList.remove('hidden');
        document.getElementById(`linkProdResults${suffix}`).classList.add('hidden');
        document.getElementById(`linkProdSearch${suffix}`).value = '';
        document.getElementById(`linkProdId${suffix}`).value = id;
    }
}

function clearSelectedProduct() {
    state.selectedProduct = null;
    dom.selectedProductContainer.classList.add('hidden');
}


// --- Image Handling & Drag ---
function handleImageUpload(event, slot) {
    const file = event.target.files[0];
    if (!file) return;

    state.images[slot].file = file;

    const reader = new FileReader();
    reader.onload = (e) => {
        state.images[slot].previewUrl = e.target.result;
        const imgEl = slot === 'a' ? dom.previewImgA : dom.previewImgB;
        imgEl.src = e.target.result;

        updateTransform(slot, { scale: 1, x: 0, y: 0 });
        updatePreviewSelection(slot);
    };
    reader.readAsDataURL(file);
}

function setupDragLogic(container, slot) {
    const img = slot === 'a' ? dom.previewImgA : dom.previewImgB;

    const startDrag = (e) => {
        if (!state.images[slot].previewUrl) return;
        state.isDragging = true;
        state.activeSlot = slot;

        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

        state.dragStart = { x: clientX, y: clientY };
        state.lastTransform = {
            x: state.images[slot].transform.x || 0,
            y: state.images[slot].transform.y || 0
        };
        container.style.cursor = 'grabbing';
    };

    const doDrag = (e) => {
        if (!state.isDragging || state.activeSlot !== slot) return;
        e.preventDefault();

        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

        const deltaX = clientX - state.dragStart.x;
        const deltaY = clientY - state.dragStart.y;

        const newX = state.lastTransform.x + deltaX;
        const newY = state.lastTransform.y + deltaY;

        updateTransform(slot, { x: newX, y: newY });
    };

    const stopDrag = () => {
        state.isDragging = false;
        container.style.cursor = 'grab';
    };

    container.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', doDrag);
    window.addEventListener('mouseup', stopDrag);
    container.addEventListener('touchstart', startDrag, { passive: false });
    window.addEventListener('touchmove', doDrag, { passive: false });
    window.addEventListener('touchend', stopDrag);
}

function updateTransform(slot, updates) {
    const current = state.images[slot].transform;
    const newTransform = { ...current, ...updates };
    state.images[slot].transform = newTransform;

    const imgEl = slot === 'a' ? dom.previewImgA : dom.previewImgB;
    // Translate(-50%, -50%) is needed to center the image origin
    imgEl.style.transform = `translate(-50%, -50%) translate(${newTransform.x}px, ${newTransform.y}px) scale(${newTransform.scale})`;

    if (slot === 'a') dom.scaleValA.textContent = newTransform.scale.toFixed(2);
    if (slot === 'b') dom.scaleValB.textContent = newTransform.scale.toFixed(2);
}


// --- Saving Logic ---
async function handleSave(e) {
    e.preventDefault();

    const title = document.getElementById('bannerTitle').value;
    if (!title) return alert('Please enter a banner title.');
    if (!dom.catSelect.value) return alert('Please select a main category.');
    if (!state.images.a.file && !state.images.a.previewUrl) return alert('Please upload at least Banner A.');
    if (state.bannerType === 'double' && !state.images.b.file && !state.images.b.previewUrl) return alert('Please upload Banner B for double banner mode.');

    // Validate Links
    const linkTypeA = document.getElementById('linkTypeA').value;
    if (linkTypeA === 'product' && !document.getElementById('linkProdIdA').value) {
        return alert('Please select a product for Banner A.');
    }
    if (linkTypeA === 'category' && !document.getElementById('linkCatA_Main').value) {
        return alert('Please select a category for Banner A.');
    }

    if (state.bannerType === 'double') {
        const linkTypeB = document.getElementById('linkTypeB').value;
        if (linkTypeB === 'product' && !document.getElementById('linkProdIdB').value) {
            return alert('Please select a product for Banner B.');
        }
        if (linkTypeB === 'category' && !document.getElementById('linkCatB_Main').value) {
            return alert('Please select a category for Banner B.');
        }
    }

    const saveBtn = dom.saveBtn;
    const spinner = saveBtn.querySelector('.spinner');
    saveBtn.disabled = true;
    spinner.classList.remove('hidden');
    saveBtn.querySelector('.btn-text').textContent = 'Processing...';

    try {
        const bannerId = state.editId ? state.editId : 'banner_' + Date.now();
        const baseStoragePath = `banners/${bannerId}`;

        // Define target dimensions based on banner type
        // Single: 4:1 (e.g. 1920x480)
        // Double: 2:1 (e.g. 1000x500 for each slot)
        const targetDims = state.bannerType === 'single'
            ? { width: 1920, height: 384 } // 20% aspect ratio
            : { width: 1000, height: 400 }; // 40% aspect ratio relative to half width (20% total)

        // Helper to check if we need to upload new image or keep existing
        // If file exists, we upload. If not but previewUrl exists, we keep existing URL (logic handled in process func or below)

        let bannerAData = {};
        if (state.images.a.file) {
            bannerAData = await processAndUploadCroppedImage(state.images.a, 'a', baseStoragePath, targetDims, dom.previewContainerA);
        } else {
            // Keep existing data logic? We need the old data... which we don't have stored in 'state' fully. 
            // Better: Only overwrite fields if we have a new image.
            bannerAData = { url: state.images.a.previewUrl }; // Simple fallback
        }

        let bannerBData = null;
        if (state.bannerType === 'double') {
            if (state.images.b.file) {
                bannerBData = await processAndUploadCroppedImage(state.images.b, 'b', baseStoragePath, targetDims, dom.previewContainerB);
            } else {
                bannerBData = { url: state.images.b.previewUrl };
            }
        }

        const formData = {
            title: title,
            description: document.getElementById('bannerDesc').value,
            categoryId: dom.catSelect.value,
            type: state.bannerType,

            productId: state.selectedProduct ? state.selectedProduct.id : null,
            productName: state.selectedProduct ? state.selectedProduct.name : null,
            productLink: state.selectedProduct ? `products-detail.html?id=${state.selectedProduct.id}` : null,

            banners: {
                a: {
                    ...bannerAData,
                    alt: document.getElementById('altA').value,
                    cta: document.getElementById('ctaA').value,
                    linkType: document.getElementById('linkTypeA').value,
                    linkData: getLinkData('a'), // Get specific link data
                    transform: state.images.a.transform // Keep metadata just in case
                },
                b: bannerBData ? {
                    ...bannerBData,
                    alt: document.getElementById('altB').value,
                    cta: document.getElementById('ctaB').value,
                    linkType: document.getElementById('linkTypeB').value,
                    linkData: getLinkData('b'),
                    transform: state.images.b.transform // Keep metadata just in case
                } : null
            },

            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        };

        // Merge logic ensures we don't overwrite image data with "null" if we didn't upload new one? 
        // Our construction above handles it by creating new objects.
        // But for "merge", we should be careful. 
        // Actually, since we construct a full object, .set(..., {merge: true}) might be safer for partial updates, 
        // BUT here we re-construct the whole shape, so .set() without merge (overwrite) is typically fine 
        // UNLESS we want to preserve other fields not in form. 
        // Let's use merge: true to be safe if ID exists.

        await window.db.collection('banners').doc(bannerId).set(formData, { merge: true });

        alert('Banner Saved Successfully!');
        if (state.editId) {
            window.location.href = 'manage-banner.html';
        } else {
            location.reload();
        }

    } catch (error) {
        console.error("Save failed:", error);
        alert('Error saving banner: ' + error.message);
        saveBtn.disabled = false;
        spinner.classList.add('hidden');
        saveBtn.querySelector('.btn-text').textContent = 'Save Banner';
    }
}

function getLinkData(slot) {
    const suffix = slot.toUpperCase();
    const type = document.getElementById(`linkType${suffix}`).value;

    if (type === 'custom') {
        return { url: document.getElementById(`customLink${suffix}`).value };
    } else if (type === 'product') {
        const id = document.getElementById(`linkProdId${suffix}`).value;
        const name = document.getElementById(`linkProdName${suffix}`).textContent;
        return {
            productId: id,
            productName: name,
            productLink: `products-detail.html?id=${id}`
        };
    } else if (type === 'category') {
        return {
            main: document.getElementById(`linkCat${suffix}_Main`).value,
            sub: document.getElementById(`linkCat${suffix}_Sub`).value,
            subSub: document.getElementById(`linkCat${suffix}_SubSub`).value
        };
    }
    return null;
}

async function processAndUploadCroppedImage(imgState, slot, basePath, targetDims, previewContainer) {
    if (!imgState.file || !imgState.previewUrl) return null;

    // Generate Cropped Blob - WYSIWYG
    const croppedBlob = await generateCroppedBlob(imgState, targetDims, previewContainer);

    // Upload this blob (Highest Quality)
    const path = `${basePath}/${slot}/original.webp`;
    const ref = window.storage.ref(path);

    await ref.put(croppedBlob, {
        contentType: 'image/webp',
        cacheControl: 'public, max-age=31536000, immutable'
    });
    const url = await ref.getDownloadURL();

    // Note: We are now standardizing the output, so we might not need multiple sizes if we rely on the cropped version
    // But if we want responsiveness, we can generate smaller versions of the CROPPED image.
    // For now, let's just upload the optimized WebP cropped version.

    return {
        images: {
            [targetDims.width]: url
        },
        url: url // Primary URL
    };
}

function generateCroppedBlob(imgState, targetDims, previewContainer) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = imgState.previewUrl;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = targetDims.width;
            canvas.height = targetDims.height;
            const ctx = canvas.getContext('2d');

            // High quality smoothing
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Calculate ratios
            // The logic: Map Preview Box Coordinate Space -> Canvas Coordinate Space
            const previewRect = previewContainer.getBoundingClientRect();
            // Note: Use offsetWidth/Height for consistent internal pixels, ignoring transform scale of the container itself (from browser zoom etc)
            const previewW = previewContainer.offsetWidth;
            const previewH = previewContainer.offsetHeight;

            const transform = imgState.transform;

            console.log(`[Crop Debug] Target: ${targetDims.width}x${targetDims.height}`);
            console.log(`[Crop Debug] Preview: ${previewW}x${previewH}`);
            console.log(`[Crop Debug] Transform:`, transform);
            // const previewH = previewContainer.offsetHeight; // Not strictly needed if we base scale on width

            const scaleRatio = targetDims.width / previewW;

            // 1. Move origin to center of canvas (matching preview's 'centered' paradigm)
            ctx.translate(canvas.width / 2, canvas.height / 2);

            // 2. Apply Pan (Scaled)
            // Transform X/Y are in "Preview Pixels"
            ctx.translate(transform.x * scaleRatio, transform.y * scaleRatio);

            // 3. Apply Zoom
            // Transform Scale is abstract multiplier. 
            // Since scale 1.0 means "Natural Image Size" in the DOM (due to no CSS sizing),
            // We need to apply the relationship between Natural Size and Canvas Size.
            // In Preview: Displayed Size = Natural * transform.scale
            // On Canvas: Displayed Size = Natural * transform.scale * scaleRatio
            const effectiveScale = transform.scale * scaleRatio;
            ctx.scale(effectiveScale, effectiveScale);

            // 4. Draw Image centered at origin
            ctx.drawImage(img, -img.width / 2, -img.height / 2);

            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Canvas to Blob failed'));
            }, 'image/webp', 0.9);
        };
        img.onerror = reject;
    });
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    }
}
