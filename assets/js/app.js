let knowledgeBase = null;
let selectedSymptoms = new Set();
let showValidationError = false;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('[START] FixScreen dimulai...');
    await loadKnowledgeBase();
    setupEventListeners();
    setupNavbarActiveState();
    setupScrollToTopButton();
    updateProcessButton();
});

async function loadKnowledgeBase() {
    try {
        console.log('[LOAD] Memuat knowledge base...');
        const response = await fetch('assets/json/knowledge_base.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        knowledgeBase = await response.json();
        console.log('[SUCCESS] Knowledge base berhasil dimuat');
        console.log(`   - ${knowledgeBase.indicators.length} indikator`);
        console.log(`   - ${knowledgeBase.symptoms.length} gejala`);
        console.log(`   - ${knowledgeBase.damages.length} kerusakan`);
        console.log(`   - ${knowledgeBase.rules.length} aturan`);
        
        displaySymptoms();
        
    } catch (error) {
        console.error('[ERROR] Gagal memuat knowledge base:', error);
        showErrorMessage('Gagal memuat data sistem. Silahkan refresh halaman.');
    }
}

function displaySymptoms() {
    const container = document.getElementById('symptomsContainer');
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    if (!knowledgeBase || !knowledgeBase.symptoms) {
        console.error('Data gejala tidak tersedia');
        return;
    }
    
    container.innerHTML = '';
    
    knowledgeBase.symptoms.forEach((symptom, index) => {
        const card = createSymptomCard(symptom);
        container.appendChild(card);
        
        setTimeout(() => {
            card.style.opacity = '1';
        }, index * 30);
    });
    
    loadingSpinner.style.display = 'none';
    container.style.display = 'grid';
    
    console.log(`[SUCCESS] ${knowledgeBase.symptoms.length} gejala ditampilkan`);
}

function createSymptomCard(symptom) {
    const card = document.createElement('div');
    card.className = 'symptom-card';
    card.dataset.symptomCode = symptom.symptom_code;
    card.style.opacity = '0';
    card.style.transition = 'opacity var(--transition-base)';
    
    const checkboxId = `symptom-${symptom.symptom_code}`;
    
    card.innerHTML = `
        <label for="${checkboxId}">
            <input 
                type="checkbox" 
                id="${checkboxId}" 
                class="symptom-checkbox"
                data-symptom-code="${symptom.symptom_code}"
            >
            <div class="symptom-text">
                <span class="symptom-name">${symptom.symptom_name}</span>
                <span class="symptom-code">${symptom.symptom_code}</span>
            </div>
        </label>
    `;
    
    const checkbox = card.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', (e) => {
        handleSymptomChange(e, card);
    });
    
    return card;
}
function handleSymptomChange(event, card) {
    const checkbox = event.target;
    const symptomCode = checkbox.dataset.symptomCode;
    
    if (checkbox.checked) {
        selectedSymptoms.add(symptomCode);
        card.classList.add('checked');
        console.log(`[SELECTED] Gejala dipilih: ${symptomCode}`);
    } else {
        selectedSymptoms.delete(symptomCode);
        card.classList.remove('checked');
        console.log(`[REMOVED] Gejala dihapus: ${symptomCode}`);
    }
    
    updateProcessButton();
    updateInfoBox();
    updateSymptomCounter();
}

function updateSymptomCounter() {
    const counter = document.getElementById('symptomCount');
    if (counter) {
        counter.textContent = selectedSymptoms.size;
    }
}

function updateProcessButton() {
    const processBtn = document.getElementById('processBtn');
    
    if (selectedSymptoms.size > 0) {
        processBtn.disabled = false;
        console.log(`[INFO] Total gejala: ${selectedSymptoms.size}`);
    } else {
        processBtn.disabled = true;
    }
}

function updateInfoBox() {
    const infoBox = document.getElementById('infoBox');
    
    if (selectedSymptoms.size === 0 && showValidationError) {
        infoBox.style.display = 'flex';
    } else {
        infoBox.style.display = 'none';
    }
}

function resetSymptoms() {
    selectedSymptoms.clear();
    showValidationError = false;
    
    document.querySelectorAll('.symptom-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    document.querySelectorAll('.symptom-card').forEach(card => {
        card.classList.remove('checked');
    });
    
    updateProcessButton();
    updateInfoBox();
    updateSymptomCounter();
    
    console.log('[RESET] Semua gejala direset');
}

function processSymptoms() {
    if (selectedSymptoms.size === 0) {
        showValidationError = true;
        updateInfoBox();
        console.warn('[WARNING] Tidak ada gejala yang dipilih');
        return;
    }
    
    showValidationError = false;
    console.log('[PROCESSING] Memproses gejala yang dipilih:');
    console.log([...selectedSymptoms]);
    
    showResultModal();
    
    // TODO: Forward Chaining akan ditambahkan pada tahap 2
}


function scrollToSymptoms() {
    const symptomsSection = document.getElementById('symptoms');
    symptomsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showErrorMessage(message) {
    const container = document.getElementById('symptomsContainer');
    container.innerHTML = `
        <div class="info-message" style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-left-color: var(--danger-500); color: #991b1b; grid-column: 1 / -1;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <p>${message}</p>
        </div>
    `;
    container.style.display = 'grid';
}

function setupEventListeners() {
    const hamburger = document.getElementById('hamburger');
    const navbarMenu = document.getElementById('navbarMenu');
    
    if (hamburger && navbarMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navbarMenu.classList.toggle('active');
        });
        
        navbarMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navbarMenu.classList.remove('active');
            });
        });
    }
    
    let lastScrollTop = 0;
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            navbar.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.12)';
        } else {
            navbar.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)';
        }
        
        lastScrollTop = scrollTop;
    }, false);
    
    console.log('[SUCCESS] Event listeners siap');
}

function setupNavbarActiveState() {
    const navbarLinks = document.querySelectorAll('.navbar-link');
    
    updateActiveNavbarLink();
    
    window.addEventListener('scroll', updateActiveNavbarLink);
    
    navbarLinks.forEach(link => {
        link.addEventListener('click', () => {
            setTimeout(updateActiveNavbarLink, 100);
        });
    });
}

function updateActiveNavbarLink() {
    const navbarLinks = document.querySelectorAll('.navbar-link');
    const sections = document.querySelectorAll('section[id]');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.scrollY >= sectionTop - 150) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navbarLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

function setupScrollToTopButton() {
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    });
    
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

function showResultModal() {
    const modal = document.getElementById('resultModal');
    const modalBody = document.getElementById('modalBody');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalCloseBtn2 = document.getElementById('modalCloseBtn2');
    
    const symptomNames = Array.from(selectedSymptoms).map(code => {
        const symptom = knowledgeBase.symptoms.find(s => s.symptom_code === code);
        return symptom ? symptom.symptom_name : code;
    });
    
    const modalContent = `
        <div class="modal-content-header">
            <div class="modal-success-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>
            <h4 class="modal-content-title">Diagnosa Dimulai!</h4>
            <p class="modal-content-subtitle">Gejala Anda telah dicatat dan siap dianalisis</p>
        </div>
        
        <div class="modal-stats">
            <div class="modal-stat-card">
                <div class="modal-stat-label">Total Gejala</div>
                <div class="modal-stat-value">${selectedSymptoms.size}</div>
            </div>
            <div class="modal-stat-card">
                <div class="modal-stat-label">Status</div>
                <div class="modal-stat-value">✓</div>
            </div>
        </div>
        
        <div class="modal-symptoms-list">
            <div class="modal-symptoms-label">Gejala yang Dipilih</div>
            <div class="modal-symptoms-tags">
                ${symptomNames.map(name => `
                    <span class="modal-symptom-tag">${name}</span>
                `).join('')}
            </div>
        </div>
    `;
    
    modalBody.innerHTML = modalContent;
    modal.classList.add('show');
    
    modalCloseBtn.addEventListener('click', closeModal);
    modalCloseBtn2.addEventListener('click', closeModal);
    
    const modalNextBtn = document.getElementById('modalNextBtn');
    modalNextBtn.addEventListener('click', showProcessingModal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

function closeModal() {
    const modal = document.getElementById('resultModal');
    modal.classList.remove('show');
}

function showProcessingModal() {
    const resultModal = document.getElementById('resultModal');
    const processingModal = document.getElementById('processingModal');
    
    resultModal.classList.remove('show');
    
    processingModal.classList.add('show');
    
    setTimeout(() => {
        processingModal.classList.remove('show');
        showComingSoonModal();
    }, 3000);
}

function showComingSoonModal() {
    const comingSoonModal = document.getElementById('comingSoonModal');
    const comingSoonCloseBtn = document.getElementById('comingSoonCloseBtn');
    const comingSoonOkBtn = document.getElementById('comingSoonOkBtn');
    
    comingSoonModal.classList.add('show');
    
    comingSoonCloseBtn.addEventListener('click', () => {
        comingSoonModal.classList.remove('show');
    });
    
    comingSoonOkBtn.addEventListener('click', () => {
        comingSoonModal.classList.remove('show');
    });
    
    comingSoonModal.addEventListener('click', (e) => {
        if (e.target === comingSoonModal) {
            comingSoonModal.classList.remove('show');
        }
    });
}

console.log('%c🎯 FixScreen - Sistem Pakar Diagnosa Kerusakan TV v1.0', 
    'color: white; background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); padding: 8px 16px; border-radius: 4px; font-weight: bold; font-size: 14px;');
console.log('%cFrontend Stage - UI & Data Loading Ready', 'color: #3b82f6; font-weight: bold;');
