// ========================================
// KNOWLEDGE BASE & DATA MANAGEMENT
// ========================================

let knowledgeBase = null;
let selectedSymptoms = new Set();

// ========================================
// INITIALIZE APPLICATION
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 TV Expert dimulai...');
    await loadKnowledgeBase();
    setupEventListeners();
    updateProcessButton();
});

// ========================================
// LOAD KNOWLEDGE BASE FROM JSON
// ========================================

async function loadKnowledgeBase() {
    try {
        console.log('📂 Memuat knowledge base...');
        const response = await fetch('assets/json/knowledge_base.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        knowledgeBase = await response.json();
        console.log('✅ Knowledge base berhasil dimuat');
        console.log(`   - ${knowledgeBase.indicators.length} indikator`);
        console.log(`   - ${knowledgeBase.symptoms.length} gejala`);
        console.log(`   - ${knowledgeBase.damages.length} kerusakan`);
        console.log(`   - ${knowledgeBase.rules.length} aturan`);
        
        displaySymptoms();
        
    } catch (error) {
        console.error('❌ Gagal memuat knowledge base:', error);
        showErrorMessage('Gagal memuat data sistem. Silahkan refresh halaman.');
    }
}

// ========================================
// DISPLAY SYMPTOMS FROM JSON
// ========================================

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
    
    console.log(`✅ ${knowledgeBase.symptoms.length} gejala ditampilkan`);
}

// ========================================
// CREATE SYMPTOM CARD ELEMENT
// ========================================

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

// ========================================
// HANDLE SYMPTOM SELECTION
// ========================================

function handleSymptomChange(event, card) {
    const checkbox = event.target;
    const symptomCode = checkbox.dataset.symptomCode;
    
    if (checkbox.checked) {
        selectedSymptoms.add(symptomCode);
        card.classList.add('checked');
        console.log(`✅ Gejala dipilih: ${symptomCode}`);
    } else {
        selectedSymptoms.delete(symptomCode);
        card.classList.remove('checked');
        console.log(`❌ Gejala dihapus: ${symptomCode}`);
    }
    
    updateProcessButton();
    updateInfoBox();
    updateSymptomCounter();
}

// ========================================
// UPDATE SYMPTOM COUNTER
// ========================================

function updateSymptomCounter() {
    const counter = document.getElementById('symptomCount');
    if (counter) {
        counter.textContent = selectedSymptoms.size;
    }
}

// ========================================
// UPDATE PROCESS BUTTON STATE
// ========================================

function updateProcessButton() {
    const processBtn = document.getElementById('processBtn');
    
    if (selectedSymptoms.size > 0) {
        processBtn.disabled = false;
        console.log(`📊 Total gejala: ${selectedSymptoms.size}`);
    } else {
        processBtn.disabled = true;
    }
}

// ========================================
// UPDATE INFO BOX
// ========================================

function updateInfoBox() {
    const infoBox = document.getElementById('infoBox');
    
    if (selectedSymptoms.size === 0) {
        infoBox.style.display = 'flex';
    } else {
        infoBox.style.display = 'none';
    }
}

// ========================================
// RESET SYMPTOMS
// ========================================

function resetSymptoms() {
    selectedSymptoms.clear();
    
    document.querySelectorAll('.symptom-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    document.querySelectorAll('.symptom-card').forEach(card => {
        card.classList.remove('checked');
    });
    
    updateProcessButton();
    updateInfoBox();
    updateSymptomCounter();
    
    console.log('🔄 Semua gejala direset');
}

// ========================================
// PROCESS SYMPTOMS (PLACEHOLDER)
// ========================================

function processSymptoms() {
    if (selectedSymptoms.size === 0) {
        console.warn('⚠️ Tidak ada gejala yang dipilih');
        return;
    }
    
    console.log('🔍 Memproses gejala yang dipilih:');
    console.log([...selectedSymptoms]);
    
    const symptomList = Array.from(selectedSymptoms).join(', ');
    
    alert(`✅ Diagnosa Dimulai!\n\nGejala yang dipilih: ${selectedSymptoms.size}\n\n${symptomList}\n\nForward chaining akan diimplementasikan pada tahap 2.`);
    
    // TODO: Forward Chaining akan ditambahkan pada tahap 2
}

// ========================================
// SMOOTH SCROLL TO SYMPTOMS
// ========================================

function scrollToSymptoms() {
    const symptomsSection = document.getElementById('symptoms');
    symptomsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ========================================
// ERROR HANDLING
// ========================================

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

// ========================================
// SETUP EVENT LISTENERS
// ========================================

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
    
    // Scroll navbar effect
    let lastScrollTop = 0;
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            navbar.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        } else {
            navbar.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.08)';
        }
        
        lastScrollTop = scrollTop;
    }, false);
    
    console.log('✅ Event listeners siap');
}

// ========================================
// DEBUG CONSOLE
// ========================================

console.log('%c🎯 TV Expert - Sistem Pakar Diagnosa Kerusakan TV v1.0', 
    'color: white; background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); padding: 8px 16px; border-radius: 4px; font-weight: bold; font-size: 14px;');
console.log('%cFrontend Stage - UI & Data Loading Ready', 'color: #3b82f6; font-weight: bold;');
