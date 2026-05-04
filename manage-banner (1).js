
/**
 * Manage Banner Module
 * Handles fetching, displaying, deleting, and status toggling of banners.
 */

// --- Global State ---
let allBanners = [];

// --- DOM Elements ---
const dom = {
    grid: document.getElementById('bannerGrid'),
    loading: document.getElementById('loadingState'),
    empty: document.getElementById('emptyState'),
    
    // Delete Modal
    deleteModal: document.getElementById('deleteModal'),
    confirmDeleteBtn: document.getElementById('confirmDelete'),
    cancelDeleteBtn: document.getElementById('cancelDelete'),
    
    // Preview Modal
    previewModal: document.getElementById('previewModal'),
    previewContent: document.getElementById('previewModalContent'),
    closePreviewBtn: document.getElementById('closePreview')
};

let bannerToDeleteId = null;

// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
    initFirebaseChecks();
    
    // Init Event Listeners for Modals
    setupModalListeners();

    // Fetch Banners
    loadBanners();
});

function initFirebaseChecks() {
    if (!window.firebase || !window.db || !window.storage) {
        console.error("Firebase not initialized correctly. Check firebase-config.js");
        alert("Error: Firebase not connected. Please refresh or check console.");
    }
}

// --- Data Fetching ---
async function loadBanners() {
    try {
        setLoading(true);
        
        // Ensure categories are loaded for mapping (if needed, though it seems categoryId IS the name)
        // await window.dynamicCategories?.loadCategoriesFromFirebase(); 

        const snapshot = await window.db.collection('banners')
            .orderBy('createdAt', 'desc')
            .get();

        allBanners = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        renderBanners(allBanners);
    } catch (error) {
        console.error("Error fetching banners:", error);
        alert("Failed to load banners. See console for details.");
    } finally {
        setLoading(false);
    }
}

// --- Rendering ---
function renderBanners(banners) {
    dom.grid.innerHTML = '';
    dom.grid.classList.add('hidden');
    dom.empty.classList.add('hidden');

    if (banners.length === 0) {
        dom.empty.classList.remove('hidden');
        return;
    }

    dom.grid.classList.remove('hidden');

    banners.forEach(banner => {
        const card = createBannerCard(banner);
        dom.grid.appendChild(card);
    });
}

function createBannerCard(banner) {
    const card = document.createElement('div');
    card.className = 'banner-card';

    // 1. Preview Section
    const type = banner.type || 'single';
    const previewDiv = document.createElement('div');
    previewDiv.className = `banner-card-preview ${type}`;

    if (type === 'single') {
        const imgUrl = banner.banners?.a?.url || 'https://via.placeholder.com/300x100?text=No+Image';
        previewDiv.innerHTML = `<img src="${imgUrl}" alt="${banner.title}" loading="lazy">`;
    } else {
        const imgA = banner.banners?.a?.url || 'https://via.placeholder.com/150x100?text=A';
        const imgB = banner.banners?.b?.url || 'https://via.placeholder.com/150x100?text=B';
        previewDiv.innerHTML = `
            <img src="${imgA}" alt="Side A" loading="lazy">
            <img src="${imgB}" alt="Side B" loading="lazy">
        `;
    }

    // 2. Content Section
    const contentDiv = document.createElement('div');
    contentDiv.className = 'banner-card-content';

    const createdDate = banner.createdAt ? new Date(banner.createdAt.seconds * 1000).toLocaleDateString() : 'N/A';
    const isActive = banner.isActive !== false; // Default true

    contentDiv.innerHTML = `
        <div class="banner-card-header">
            <h4 class="banner-title" title="${banner.title}">${banner.title || 'Untitled Banner'}</h4>
            <span class="banner-badge ${type}">${type}</span>
        </div>
        <div class="banner-meta">
            <div class="meta-row">
                <span>📁 ${banner.categoryId || 'Uncategorized'}</span>
            </div>
            <div class="meta-row">
                <span>📅 ${createdDate}</span>
            </div>
            ${banner.productName ? `<div class="meta-row" title="Linked Product">🔗 ${banner.productName}</div>` : ''}
        </div>
        
        <div class="status-toggle">
            <label class="switch">
                <input type="checkbox" class="status-checkbox" data-id="${banner.id}" ${isActive ? 'checked' : ''}>
                <span class="slider"></span>
            </label>
            <span class="status-label">${isActive ? 'Active' : 'Inactive'}</span>
        </div>
    `;

    // 3. Actions Section
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'banner-card-actions';
    
    actionsDiv.innerHTML = `
        <button class="action-btn preview-btn">👁️ Preview</button>
        <button class="action-btn edit-btn">✏️ Edit</button>
        <button class="action-btn delete-btn delete">🗑️ Delete</button>
    `;

    // Attach Events
    // Toggle Status
    const checkbox = contentDiv.querySelector('.status-checkbox');
    const statusLabel = contentDiv.querySelector('.status-label');
    checkbox.addEventListener('change', (e) => {
        const newStatus = e.target.checked;
        statusLabel.textContent = newStatus ? 'Active' : 'Inactive';
        toggleBannerStatus(banner.id, newStatus);
    });

    // Action Buttons
    actionsDiv.querySelector('.preview-btn').addEventListener('click', () => openPreviewModal(banner));
    actionsDiv.querySelector('.edit-btn').addEventListener('click', () => {
        window.location.href = `add-banner.html?id=${banner.id}`;
    });
    actionsDiv.querySelector('.delete-btn').addEventListener('click', () => {
        bannerToDeleteId = banner.id;
        openDeleteModal();
    });

    card.appendChild(previewDiv);
    card.appendChild(contentDiv);
    card.appendChild(actionsDiv);

    return card;
}

// --- Logic Actions ---

async function toggleBannerStatus(id, isActive) {
    try {
        await window.db.collection('banners').doc(id).set({
            isActive: isActive
        }, { merge: true });
        console.log(`Banner ${id} status updated to ${isActive}`);
    } catch (e) {
        console.error("Error updating status:", e);
        alert("Failed to update status");
        // Revert UI if needed (complex without re-render, assuming success for now)
    }
}

function openPreviewModal(banner) {
    dom.previewContent.innerHTML = '';
    const type = banner.type || 'single';
    
    if (type === 'single') {
        const img = document.createElement('img');
        img.src = banner.banners?.a?.url;
        img.style.maxWidth = '100%';
        dom.previewContent.appendChild(img);
    } else {
        const imgA = document.createElement('img');
        imgA.src = banner.banners?.a?.url;
        imgA.style.width = '48%';
        
        const imgB = document.createElement('img');
        imgB.src = banner.banners?.b?.url;
        imgB.style.width = '48%';

        dom.previewContent.appendChild(imgA);
        dom.previewContent.appendChild(imgB);
    }
    
    dom.previewModal.classList.remove('hidden');
}

// --- Delete Logic ---
function openDeleteModal() {
    dom.deleteModal.classList.remove('hidden');
}

function closeDeleteModal() {
    dom.deleteModal.classList.add('hidden');
    bannerToDeleteId = null;
}

async function executeDelete() {
    if (!bannerToDeleteId) return;

    const id = bannerToDeleteId;
    const btn = dom.confirmDeleteBtn;
    const originalText = btn.textContent;
    btn.textContent = 'Deleting...';
    btn.disabled = true;

    try {
        // 1. Delete Firestore Doc
        await window.db.collection('banners').doc(id).delete();

        // 2. Delete Storage Folder (Best Effort)
        // Firebase Storage doesn't support folder deletion, so we list and delete files.
        const folderRef = window.storage.ref().child(`banners/${id}`);
        try {
            const listRes = await folderRef.listAll();
            const deletePromises = listRes.items.map(item => item.delete());
            await Promise.all(deletePromises);
            console.log("Storage files deleted.");
        } catch (storageErr) {
            console.warn("Storage delete error (folder might be empty or missing):", storageErr);
            // Continue even if storage fails
        }

        // 3. UI Update
        closeDeleteModal();
        loadBanners(); // Refresh list

    } catch (error) {
        console.error("Error deleting banner:", error);
        alert("Failed to delete banner. Please try again.");
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
        closeDeleteModal();
    }
}


// --- Modal & UI Utilities ---

function setupModalListeners() {
    dom.cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    dom.confirmDeleteBtn.addEventListener('click', executeDelete);
    
    dom.closePreviewBtn.addEventListener('click', () => {
        dom.previewModal.classList.add('hidden');
    });

    // Close on click outside
    window.addEventListener('click', (e) => {
        if (e.target === dom.deleteModal) closeDeleteModal();
        if (e.target === dom.previewModal) dom.previewModal.classList.add('hidden');
    });
}

function setLoading(isLoading) {
    if (isLoading) {
        dom.loading.classList.remove('hidden');
        dom.grid.classList.add('hidden');
    } else {
        dom.loading.classList.add('hidden');
    }
}
