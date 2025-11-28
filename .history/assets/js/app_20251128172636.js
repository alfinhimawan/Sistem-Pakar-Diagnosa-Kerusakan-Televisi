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
        
        // Forward Chaining Inference Engine
        const diagnosisResults = performForwardChaining();
        showDiagnosisResult(diagnosisResults);
    }, 2500);
}

function performForwardChaining() {
    console.log('[FORWARD CHAINING] Memulai inferensi...');
    
    const selectedSymptomsArray = Array.from(selectedSymptoms);
    const matchedDamages = [];
    
    // Iterasi setiap rule untuk mencari kecocokan
    knowledgeBase.rules.forEach(rule => {
        const ruleSymptomsSet = new Set(rule.symptoms);
        const selectedSymptomsSet = new Set(selectedSymptomsArray);
        
        // Cek apakah semua gejala dalam rule ada di gejala yang dipilih
        const isMatch = rule.symptoms.every(symptom => selectedSymptomsSet.has(symptom));
        
        if (isMatch) {
            // Hitung confidence level berdasarkan persentase kecocokan
            const matchPercentage = (rule.symptoms.length / selectedSymptomsArray.length) * 100;
            
            // Dapatkan informasi damage
            const damageInfo = knowledgeBase.damages.find(d => d.damage_code === rule.damage_code);
            
            // Dapatkan informasi indikator
            const indicatorInfo = knowledgeBase.indicators.find(i => i.indicator_code === damageInfo.indicator_code);
            
            // Dapatkan nama gejala yang cocok
            const matchedSymptomNames = rule.symptoms.map(symptomCode => {
                const symptom = knowledgeBase.symptoms.find(s => s.symptom_code === symptomCode);
                return symptom ? symptom.symptom_name : symptomCode;
            });
            
            matchedDamages.push({
                ruleId: rule.rule_id,
                damageCode: rule.damage_code,
                damageName: rule.damage_name,
                solution: damageInfo.solution,
                indicator: indicatorInfo.indicator_name,
                matchedSymptoms: matchedSymptomNames,
                matchPercentage: matchPercentage.toFixed(1),
                confidence: calculateConfidence(matchPercentage)
            });
            
            console.log(`[MATCH] Rule ${rule.rule_id}: ${rule.damage_name} (${matchPercentage.toFixed(1)}%)`);
        }
    });
    
    // Urutkan berdasarkan persentase kecocokan (tertinggi ke terendah)
    matchedDamages.sort((a, b) => b.matchPercentage - a.matchPercentage);
    
    console.log(`[RESULT] Ditemukan ${matchedDamages.length} kemungkinan kerusakan`);
    
    return {
        selectedSymptoms: selectedSymptomsArray,
        results: matchedDamages,
        totalRulesChecked: knowledgeBase.rules.length
    };
}

function calculateConfidence(matchPercentage) {
    if (matchPercentage === 100) return 'Sangat Tinggi';
    if (matchPercentage >= 80) return 'Tinggi';
    if (matchPercentage >= 60) return 'Sedang';
    if (matchPercentage >= 40) return 'Rendah';
    return 'Sangat Rendah';
}

function showDiagnosisResult(diagnosisResults) {
    const modal = document.getElementById('diagnosisResultModal');
    const modalBody = document.getElementById('diagnosisResultBody');
    
    let content = '';
    
    if (diagnosisResults.results.length === 0) {
        // Tidak ada kerusakan yang cocok
        content = `
            <div class="diagnosis-no-result">
                <div class="no-result-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>
                <h4 class="modal-content-title">Tidak Ditemukan Diagnosis</h4>
                <p class="modal-content-subtitle">Kombinasi gejala yang Anda pilih tidak cocok dengan database kerusakan yang ada.</p>
                <div class="diagnosis-suggestion">
                    <p><strong>Saran:</strong></p>
                    <ul>
                        <li>Coba pilih kombinasi gejala yang berbeda</li>
                        <li>Pastikan semua gejala yang dialami sudah dipilih</li>
                        <li>Konsultasikan dengan teknisi profesional untuk diagnosis lebih lanjut</li>
                    </ul>
                </div>
            </div>
        `;
    } else {
        // Ada kerusakan yang cocok
        const topResult = diagnosisResults.results[0];
        
        content = `
            <div class="diagnosis-success">
                <div class="diagnosis-header">
                    <div class="diagnosis-success-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <h4 class="modal-content-title">Diagnosis Berhasil!</h4>
                    <p class="modal-content-subtitle">Sistem telah mengidentifikasi ${diagnosisResults.results.length} kemungkinan kerusakan</p>
                </div>
                
                <div class="diagnosis-main-result">
                    <div class="result-badge">Hasil Utama</div>
                    <h3 class="result-damage-name">${topResult.damageName}</h3>
                    <div class="result-indicator">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                        </svg>
                        <span>${topResult.indicator}</span>
                    </div>
                </div>
                
                <div class="diagnosis-solution">
                    <div class="solution-header">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                        </svg>
                        <h4>Solusi Perbaikan</h4>
                    </div>
                    <p class="solution-text">${topResult.solution}</p>
                </div>
                
                <div class="diagnosis-matched-symptoms">
                    <div class="matched-symptoms-header">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>Gejala yang Cocok</span>
                    </div>
                    <div class="matched-symptoms-list">
                        ${topResult.matchedSymptoms.map(symptom => `
                            <div class="matched-symptom-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <circle cx="12" cy="12" r="10"/>
                                </svg>
                                <span>${symptom}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
        `;
        
        // Jika ada hasil alternatif
        if (diagnosisResults.results.length > 1) {
            content += `
                <div class="diagnosis-alternative-results">
                    <h4 class="alternative-title">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 11l3 3L22 4"></path>
                            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
                        </svg>
                        Kemungkinan Kerusakan Lainnya
                    </h4>
                    <div class="alternative-results-list">
            `;
            
            diagnosisResults.results.slice(1).forEach(result => {
                content += `
                    <div class="alternative-result-item">
                        <div class="alternative-result-header">
                            <h5 class="alternative-damage-name">${result.damageName}</h5>
                            <span class="alternative-confidence">${result.confidence}</span>
                        </div>
                        <p class="alternative-solution">${result.solution}</p>
                    </div>
                `;
            });
            
            content += `
                    </div>
                </div>
            `;
        }
        
        content += `
            </div>
        `;
    }
    
    modalBody.innerHTML = content;
    modal.classList.add('show');
    
    // Event listeners untuk close button
    const closeBtn = document.getElementById('diagnosisResultCloseBtn');
    const okBtn = document.getElementById('diagnosisResultOkBtn');
    
    closeBtn.addEventListener('click', closeDiagnosisResultModal);
    okBtn.addEventListener('click', closeDiagnosisResultModal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeDiagnosisResultModal();
        }
    });
}

function closeDiagnosisResultModal() {
    const modal = document.getElementById('diagnosisResultModal');
    modal.classList.remove('show');
}



console.log('%c🎯 FixScreen - Sistem Pakar Diagnosa Kerusakan TV v1.0', 
    'color: white; background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); padding: 8px 16px; border-radius: 4px; font-weight: bold; font-size: 14px;');
console.log('%cFrontend Stage - UI & Data Loading Ready', 'color: #3b82f6; font-weight: bold;');
