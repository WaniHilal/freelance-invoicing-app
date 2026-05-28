const firebaseConfig = {
    apiKey: "AIzaSyA4OK-U_klW4yekvMxHUQrmtHdxnwfuQS8",
    authDomain: "freelance-invoicing-app-ef860.firebaseapp.com",
    projectId: "freelance-invoicing-app-ef860",
    storageBucket: "freelance-invoicing-app-ef860.firebasestorage.app",
    messagingSenderId: "675069650397",
    appId: "1:675069650397:web:b06d30d0d8c8d962404234"
};

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

// Initialize Firebase (ONCE!)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("✅ Firebase initialized with correct config");
// ==========================================
// 2️⃣ YOUR EXISTING JS CODE GOES BELOW
// ==========================================

// Example: Your existing code
// const myButton = document.getElementById('submit');
// function handleLogin() { ... }
// etc...
// ============================================
// FREELANCE PRO - COMPLETE JAVASCRIPT
// WITH AUTHENTICATION & ALL FEATURES
// ============================================

// ============================================
// DATA STORAGE
// ============================================
let currentUser = null;
let clients = [];
let timeEntries = [];
let invoices = [];
let currentLanguage = 'en';
let timerInterval = null;
let timerActive = false;
let timerSeconds = 0;
let activeTimerClientId = null;
let activeTimerTaskDesc = '';
let invoiceItems = [{ desc: '', qty: 1, price: 0 }];
// ============================================
// COMPANY INFO FOR PDF
// ============================================
const companyInfo = {
    name: 'Freelance Pro',
    email: '',
    phone: '',
    address: '',
    bankName: '',
    accountNumber: '',
    paymentInstructions: ''
};
// ============================================
// COMPANY SETTINGS FUNCTIONS (ADD THESE BELOW)
// ============================================

function loadCompanyInfo() {
    const saved = localStorage.getItem('freelance_sender_info');
    if (saved) {
        const data = JSON.parse(saved);
        if (document.getElementById('senderName')) document.getElementById('senderName').value = data.senderName || '';
        if (document.getElementById('senderAddress')) document.getElementById('senderAddress').value = data.senderAddress || '';
        if (document.getElementById('senderEmail')) document.getElementById('senderEmail').value = data.senderEmail || '';
        if (document.getElementById('senderPhone')) document.getElementById('senderPhone').value = data.senderPhone || '';
    }
}

function saveCompanyInfo() {
    const data = {
        senderName: document.getElementById('senderName')?.value || '',
        senderAddress: document.getElementById('senderAddress')?.value || '',
        senderEmail: document.getElementById('senderEmail')?.value || '',
        senderPhone: document.getElementById('senderPhone')?.value || ''
    };
    localStorage.setItem('freelance_sender_info', JSON.stringify(data));
    alert('✅ Settings saved!');
}

function resetCompanyInfo() {
    if (confirm('Reset all business settings?')) {
        if (document.getElementById('senderName')) document.getElementById('senderName').value = '';
        if (document.getElementById('senderAddress')) document.getElementById('senderAddress').value = '';
        if (document.getElementById('senderEmail')) document.getElementById('senderEmail').value = '';
        if (document.getElementById('senderPhone')) document.getElementById('senderPhone').value = '';
        localStorage.removeItem('freelance_sender_info');
        alert('✅ Settings reset!');
    }
}
// ============================================
// ============================================
// DISPOSABLE EMAIL DOMAINS (BLOCK LIST)
// ============================================
const disposableDomains = [
    'tempmail.com',
    '10minutemail.com',
    'guerrillamail.com',
    'mailinator.com',
    'yopmail.com',
    'throwawaymail.com',
    'temp-mail.org',
    'minafter.com',
    'sharklasers.com',
    'guerrillamail.net',
    'guerrillamail.org',
    'guerrillamail.biz',
    'mailnator.com',
    'tempail.com',
    'trashmail.com',
    'spambox.us',
    'tempmail.net',
    'mailtemp.net',
    'fakeinbox.com',
    'dispostable.com'
];
// ============================================
// CHECK DISPOSABLE EMAIL
// ============================================
function isDisposableEmail(email) {
    if (!email) return false;
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return false;
    return disposableDomains.includes(domain);
}
// ============================================
// IP TRACKING FUNCTIONS
// ============================================

async function getUserIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error("IP fetch failed:", error);
        return null;
    }
}

async function checkIPLimit(ip) {
    if (!ip) return true; // Allow if IP detection fails
    
    try {
        const ipRef = collection(db, 'ip_tracking');
        const q = query(ipRef, where('ip', '==', ip));
        const snapshot = await getDocs(q);
        return snapshot.size < 2; // Max 2 accounts per IP
    } catch (error) {
        console.error("IP check failed:", error);
        return true; // Allow on error
    }
}

async function storeIPForUser(userId, ip) {
    if (!ip) return;
    try {
        await setDoc(doc(db, 'ip_tracking', userId), {
            ip: ip,
            createdAt: new Date(),
            userId: userId
        });
    } catch (error) {
        console.error("Store IP failed:", error);
    }
}
// ============================================
// CURRENCY MAPPING FOR PDF
// ============================================
const currencyMap = {
    '$': '$', '€': '€', '£': '£', '₹': 'Rs.', '¥': 'Yen',
    '﷼': 'SAR', 'د.ك': 'KWD', '₽': 'RUB', '৳': 'BDT', 'C$': 'CAD', 'A$': 'AUD'
};

function getPdfCurrency(original) {
    return currencyMap[original] || original;
}

// ============================================
// COMPLETE TRANSLATIONS (8 LANGUAGES)
// ============================================
const translations = {
    en: {
        appTitle: '💰 Freelance Pro',
        appSubtitle: 'Complete Invoicing + Time Tracking for Freelancers',
        gettingStarted: '📖 Getting Started Guide - Complete Instructions',
        exportData: '📤 Export Data',
        importData: '📥 Import Data',
        clearData: '🗑️ Clear All Data',
        delete: 'Delete', view: 'View', markPaid: 'Mark Paid', paid: 'paid', unpaid: 'unpaid',
        pdf: 'PDF', save: 'Save', cancel: 'Cancel', addClient: '+ Add New Client',
        clientName: 'Client Name', email: 'Email', hourlyRate: 'Hourly Rate',
        invoiceNo: 'Invoice #', client: 'Client', amount: 'Amount', status: 'Status', date: 'Date', actions: 'Actions',
        totalHours: 'Total Hours', unpaidAmount: 'Unpaid Amount', paidAmount: 'Paid Amount', activeProjects: 'Active Projects'
    },
    es: {
        appTitle: '💰 Freelance Pro',
        appSubtitle: 'Facturación completa + Seguimiento de tiempo para freelancers',
        gettingStarted: '📖 Guía de inicio - Instrucciones completas',
        exportData: '📤 Exportar Datos',
        importData: '📥 Importar Datos',
        clearData: '🗑️ Borrar Todos los Datos',
        delete: 'Eliminar', view: 'Ver', markPaid: 'Marcar Pagado', paid: 'pagado', unpaid: 'pendiente',
        pdf: 'PDF', save: 'Guardar', cancel: 'Cancelar', addClient: '+ Agregar Cliente',
        clientName: 'Nombre del Cliente', email: 'Correo', hourlyRate: 'Tarifa por Hora',
        invoiceNo: 'Factura #', client: 'Cliente', amount: 'Monto', status: 'Estado', date: 'Fecha', actions: 'Acciones',
        totalHours: 'Horas Totales', unpaidAmount: 'Monto Pendiente', paidAmount: 'Monto Pagado', activeProjects: 'Proyectos Activos'
    },
    fr: {
        appTitle: '💰 Freelance Pro',
        appSubtitle: 'Facturation complète + Suivi du temps pour freelances',
        gettingStarted: '📖 Guide de démarrage - Instructions complètes',
        exportData: '📤 Exporter les données',
        importData: '📥 Importer les données',
        clearData: '🗑️ Effacer Toutes les Données',
        delete: 'Supprimer', view: 'Voir', markPaid: 'Marquer payé', paid: 'payé', unpaid: 'impayé',
        pdf: 'PDF', save: 'Enregistrer', cancel: 'Annuler', addClient: '+ Ajouter un client',
        clientName: 'Nom du client', email: 'Email', hourlyRate: 'Tarif horaire',
        invoiceNo: 'Facture #', client: 'Client', amount: 'Montant', status: 'Statut', date: 'Date', actions: 'Actions',
        totalHours: 'Heures totales', unpaidAmount: 'Montant impayé', paidAmount: 'Montant payé', activeProjects: 'Projets actifs'
    },
    de: {
        appTitle: '💰 Freelance Pro',
        appSubtitle: 'Vollständige Rechnungsstellung + Zeiterfassung für Freiberufler',
        gettingStarted: '📖 Erste Schritte - Vollständige Anleitung',
        exportData: '📤 Daten exportieren',
        importData: '📥 Daten importieren',
        clearData: '🗑️ Alle Daten Löschen',
        delete: 'Löschen', view: 'Ansehen', markPaid: 'Als bezahlt markieren', paid: 'bezahlt', unpaid: 'offen',
        pdf: 'PDF', save: 'Speichern', cancel: 'Abbrechen', addClient: '+ Kunde hinzufügen',
        clientName: 'Kundenname', email: 'E-Mail', hourlyRate: 'Stundensatz',
        invoiceNo: 'Rechnung #', client: 'Kunde', amount: 'Betrag', status: 'Status', date: 'Datum', actions: 'Aktionen',
        totalHours: 'Gesamtstunden', unpaidAmount: 'Offener Betrag', paidAmount: 'Bezahlter Betrag', activeProjects: 'Aktive Projekte'
    },
    hi: {
        appTitle: '💰 फ्रीलांस प्रो',
        appSubtitle: 'फ्रीलांसरों के लिए संपूर्ण इनवॉइसिंग + समय ट्रैकिंग',
        gettingStarted: '📖 शुरू करने की मार्गदर्शिका - पूर्ण निर्देश',
        exportData: '📤 डेटा निर्यात करें',
        importData: '📥 डेटा आयात करें',
        clearData: '🗑️ सभी डेटा हटाएं',
        delete: 'हटाएं', view: 'देखें', markPaid: 'भुगतान चिह्नित करें', paid: 'भुगतान किया', unpaid: 'बकाया',
        pdf: 'पीडीएफ', save: 'सहेजें', cancel: 'रद्द करें', addClient: '+ नया ग्राहक जोड़ें',
        clientName: 'ग्राहक का नाम', email: 'ईमेल', hourlyRate: 'प्रति घंटा दर',
        invoiceNo: 'चालान #', client: 'ग्राहक', amount: 'राशि', status: 'स्थिति', date: 'तारीख', actions: 'कार्रवाई',
        totalHours: 'कुल घंटे', unpaidAmount: 'बकाया राशि', paidAmount: 'भुगतान राशि', activeProjects: 'सक्रिय परियोजनाएं'
    },
    ar: {
        appTitle: '💰 فريلانسر برو',
        appSubtitle: 'إصدار فواتير كامل + تتبع الوقت للمستقلين',
        gettingStarted: '📖 دليل البدء - تعليمات كاملة',
        exportData: '📤 تصدير البيانات',
        importData: '📥 استيراد البيانات',
        clearData: '🗑️ حذف جميع البيانات',
        delete: 'حذف', view: 'عرض', markPaid: 'تحديد كمدفوع', paid: 'مدفوع', unpaid: 'غير مدفوع',
        pdf: 'PDF', save: 'حفظ', cancel: 'إلغاء', addClient: '+ إضافة عميل جديد',
        clientName: 'اسم العميل', email: 'البريد الإلكتروني', hourlyRate: 'السعر بالساعة',
        invoiceNo: 'الفاتورة #', client: 'العميل', amount: 'المبلغ', status: 'الحالة', date: 'التاريخ', actions: 'الإجراءات',
        totalHours: 'إجمالي الساعات', unpaidAmount: 'المبلغ غير المدفوع', paidAmount: 'المبلغ المدفوع', activeProjects: 'المشاريع النشطة'
    },
    zh: {
        appTitle: '💰 自由职业者专业版',
        appSubtitle: '自由职业者的完整发票管理 + 时间跟踪',
        gettingStarted: '📖 入门指南 - 完整说明',
        exportData: '📤 导出数据',
        importData: '📥 导入数据',
        clearData: '🗑️ 清除所有数据',
        delete: '删除', view: '查看', markPaid: '标记为已付', paid: '已付', unpaid: '未付',
        pdf: 'PDF', save: '保存', cancel: '取消', addClient: '+ 添加新客户',
        clientName: '客户名称', email: '电子邮箱', hourlyRate: '时薪',
        invoiceNo: '发票 #', client: '客户', amount: '金额', status: '状态', date: '日期', actions: '操作',
        totalHours: '总小时数', unpaidAmount: '未付金额', paidAmount: '已付金额', activeProjects: '活跃项目'
    },
    ru: {
        appTitle: '💰 Фриланс Про',
        appSubtitle: 'Полное выставление счетов + отслеживание времени для фрилансеров',
        gettingStarted: '📖 Руководство по началу работы - Полные инструкции',
        exportData: '📤 Экспорт данных',
        importData: '📥 Импорт данных',
        clearData: '🗑️ Удалить все данные',
        delete: 'Удалить', view: 'Просмотр', markPaid: 'Отметить как оплаченный', paid: 'оплачен', unpaid: 'не оплачен',
        pdf: 'PDF', save: 'Сохранить', cancel: 'Отмена', addClient: '+ Добавить клиента',
        clientName: 'Имя клиента', email: 'Email', hourlyRate: 'Почасовая ставка',
        invoiceNo: 'Счет #', client: 'Клиент', amount: 'Сумма', status: 'Статус', date: 'Дата', actions: 'Действия',
        totalHours: 'Всего часов', unpaidAmount: 'Неоплаченная сумма', paidAmount: 'Оплаченная сумма', activeProjects: 'Активные проекты'
    }
};

// ============================================
// FIREBASE AUTHENTICATION FUNCTIONS
// ============================================

// Auth State Listener
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = {
            uid: user.uid,
            email: user.email,
            name: user.displayName || user.email.split('@')[0],
            plan: 'free'
        };
        
        // Load user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
            const data = userDoc.data();
            clients = data.clients || [];
            timeEntries = data.timeEntries || [];
            invoices = data.invoices || [];
        } else {
            clients = [];
            timeEntries = [];
            invoices = [];
        }
        
        updateAuthUI();
        refreshAll();
        closeModals();
    } else {
        currentUser = null;
        clients = [];
        timeEntries = [];
        invoices = [];
        updateAuthUI();
        refreshAll();
    }
});

async function saveUserData() {
    if (currentUser) {
        await setDoc(doc(db, 'users', currentUser.uid), {
            email: currentUser.email,
            name: currentUser.name,
            plan: currentUser.plan,
            clients: clients,
            timeEntries: timeEntries,
            invoices: invoices,
            lastUpdated: new Date()
        });
    }
}

function updateAuthUI() {
    const authDiv = document.getElementById('authButtons');
    const userDiv = document.getElementById('userInfo');
    
    if (currentUser) {
        if (authDiv) authDiv.style.display = 'none';
        if (userDiv) userDiv.style.display = 'flex';
        document.getElementById('welcomeUser').innerHTML = `👋 ${currentUser.name || currentUser.email}`;
        
        const invoiceCount = invoices.length;
        console.log("Invoice count:", invoiceCount);
        const isPremium = currentUser.plan === 'premium';
        const planBadge = document.getElementById('planBadge');
        
        if (planBadge) {
            if (isPremium) {
                planBadge.innerHTML = '<span class="plan-tag-premium">⭐ PREMIUM</span> Unlimited invoices';
            } else {
                const remaining = Math.max(0, 15 - invoiceCount);
                planBadge.innerHTML = `<span class="plan-tag-free">FREE TRIAL</span> ${remaining}/15 invoices left`;
            }
        }
    } else {
        if (authDiv) authDiv.style.display = 'flex';
        if (userDiv) userDiv.style.display = 'none';
    }
}

function canCreateInvoice() {
    if (!currentUser) return false;
    if (currentUser.plan === 'premium') return true;
    return invoices.length < 15;
}

function checkInvoiceLimit() {
    if (!canCreateInvoice()) {
        alert('You have reached the free trial limit of 5 invoices. Please upgrade to Premium!');
        showPremiumBanner();
        return false;
    }
    return true;
}

async function firebaseSignUp(name, email, password) {
    // Check for disposable email
    if (isDisposableEmail(email)) {
        return { success: false, error: 'Please use a real email address. Temporary/disposable emails are not allowed.' };
    }
    
    // Get IP and check limit
    const userIP = await getUserIP();
    if (userIP) {
        const ipAllowed = await checkIPLimit(userIP);
        if (!ipAllowed) {
            return { success: false, error: 'Too many accounts created from your network. Maximum 2 accounts allowed per IP address.' };
        }
    }
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        
        // Store IP tracking
        if (userIP) {
            await storeIPForUser(userCredential.user.uid, userIP);
        }
        
        await setDoc(doc(db, 'users', userCredential.user.uid), {
            name: name,
            email: email,
            plan: 'free',
            clients: [],
            timeEntries: [],
            invoices: [],
            createdAt: new Date(),
            signupIP: userIP
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
} 

async function firebaseLogin(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function firebaseLogout() {
    await signOut(auth);
}

async function upgradeToPremium() {
    if (currentUser) {
        currentUser.plan = 'premium';
        await setDoc(doc(db, 'users', currentUser.uid), {
            email: currentUser.email,
            name: currentUser.name,
            plan: 'premium',
            clients: clients,
            timeEntries: timeEntries,
            invoices: invoices,
            updatedAt: new Date()
        }, { merge: true });
        updateAuthUI();
        document.getElementById('premiumBanner').style.display = 'none';
        alert('🎉 You are now a Premium member! Enjoy unlimited invoices!');
        refreshAll();
    }
}

function showPremiumBanner() { 
    document.getElementById('premiumBanner').style.display = 'flex'; 
}
// ============================================
// HELPER FUNCTIONS
// ============================================
function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ============================================
// UI LANGUAGE UPDATE
// ============================================
function updateUILanguage() {
    const t = translations[currentLanguage];
    if (!t) return;
    
    const appTitle = document.getElementById('appTitle');
    if (appTitle) appTitle.innerHTML = t.appTitle;
    
    const appSubtitle = document.getElementById('appSubtitle');
    if (appSubtitle) appSubtitle.innerHTML = t.appSubtitle;
    
    const gettingStarted = document.getElementById('gettingStartedTitle');
    if (gettingStarted) gettingStarted.innerHTML = t.gettingStarted;
    
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) exportBtn.innerHTML = t.exportData;
    
    const importBtn = document.getElementById('importBtn');
    if (importBtn) importBtn.innerHTML = t.importData;
    
    const clearBtn = document.getElementById('clearDataBtn');
    if (clearBtn) clearBtn.innerHTML = t.clearData;
    
    const addClientBtn = document.getElementById('addClientBtn');
    if (addClientBtn) addClientBtn.innerHTML = t.addClient;
    
    const statCards = document.querySelectorAll('.stat-card h3');
    if (statCards.length >= 4) {
        statCards[0].innerText = t.totalHours;
        statCards[1].innerText = t.unpaidAmount;
        statCards[2].innerText = t.paidAmount;
        statCards[3].innerText = t.activeProjects;
    }
    
    const modalTitle = document.querySelector('#clientModal h2');
    if (modalTitle) modalTitle.innerHTML = t.addClient;
    
    const modalLabels = document.querySelectorAll('#clientModal .form-group label');
    if (modalLabels.length >= 3) {
        modalLabels[0].innerText = t.clientName;
        modalLabels[1].innerText = t.email;
        modalLabels[2].innerText = t.hourlyRate;
    }
    
    const saveBtn = document.getElementById('saveClientModalBtn');
    if (saveBtn) saveBtn.innerHTML = t.save;
    
    const cancelBtn = document.getElementById('closeModalBtn');
    if (cancelBtn) cancelBtn.innerHTML = t.cancel;
    
    const invoiceHeaders = document.querySelectorAll('#tab4 .data-table th');
    if (invoiceHeaders.length >= 6) {
        invoiceHeaders[0].innerText = t.invoiceNo;
        invoiceHeaders[1].innerText = t.client;
        invoiceHeaders[2].innerText = t.amount;
        invoiceHeaders[3].innerText = t.status;
        invoiceHeaders[4].innerText = t.date;
        invoiceHeaders[5].innerText = t.actions;
    }
    
    const clientHeaders = document.querySelectorAll('#tab5 .data-table th');
    if (clientHeaders.length >= 4) {
        clientHeaders[0].innerText = t.clientName;
        clientHeaders[1].innerText = t.email;
        clientHeaders[2].innerText = t.hourlyRate;
        clientHeaders[3].innerText = t.actions;
    }
}

// ============================================
// REFRESH FUNCTIONS
// ============================================
function refreshAll() {
    refreshStats();
    refreshClientSelects();
    refreshRecentEntries();
    refreshInvoicesTable();
    refreshClientsTable();
    refreshAllEntriesTable();
    refreshUnpaidEntriesList();
    updateUILanguage();
}

function refreshStats() {
    const now = new Date();
    const monthEntries = timeEntries.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const totalHours = monthEntries.reduce((s, e) => s + e.duration, 0);
    const unpaidTotal = invoices.filter(i => i.status === 'unpaid').reduce((s, i) => s + i.amount, 0);
    const paidTotal = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
    const activeProjects = new Set(timeEntries.map(e => e.clientId)).size;
    
    document.getElementById('totalHours').innerText = totalHours.toFixed(1);
    document.getElementById('unpaidAmount').innerText = '$' + unpaidTotal.toFixed(2);
    document.getElementById('paidAmount').innerText = '$' + paidTotal.toFixed(2);
    document.getElementById('activeProjects').innerText = activeProjects;
}

function refreshClientSelects() {
    const timerSelect = document.getElementById('timerClientSelect');
    if (timerSelect) {
        timerSelect.innerHTML = '<option value="">-- Select a client --</option>';
        clients.forEach(c => {
            timerSelect.innerHTML += `<option value="${c.id}">${escapeHtml(c.name)} ($${c.rate}/hr)</option>`;
        });
    }
    
    const filterSelect = document.getElementById('timeInvoiceFilter');
    if (filterSelect) {
        filterSelect.innerHTML = '<option value="all">-- All Clients --</option>';
        clients.forEach(c => {
            filterSelect.innerHTML += `<option value="${c.id}">${escapeHtml(c.name)}</option>`;
        });
    }
}

function refreshRecentEntries() {
    const tbody = document.getElementById('recentEntriesTableBody');
    if (tbody) {
        const t = translations[currentLanguage];
        const recent = [...timeEntries].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
        if (recent.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">No time entries yet.YouTube前进';
            return;
        }
        tbody.innerHTML = '';
        recent.forEach(entry => {
            const client = clients.find(c => c.id === entry.clientId);
            tbody.innerHTML += `
                <tr>
                    <td>${client?.name || 'Unknown'}</td>
                    <td>${escapeHtml(entry.description)}</td
                    <td>${entry.duration} hrs</td
                    <td>$${client?.rate || 0}/hr</td
                    <td>$${(entry.duration * (client?.rate || 0)).toFixed(2)}</td
                    <td>${entry.date}</td
                    <td>${entry.invoiced ? '✅ Invoiced' : '⏳ Pending'}</td
                    <td><button class="btn-danger" onclick="deleteTimeEntry(${entry.id})">${t.delete}</button></td
                </tr>
            `;
        });
    }
}

function refreshInvoicesTable() {
    const tbody = document.getElementById('invoicesTableBody');
    if (tbody) {
        const t = translations[currentLanguage];
        if (invoices.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No invoices yet.不求前进';
            return;
        }
        tbody.innerHTML = '';
        invoices.forEach(inv => {
            const client = clients.find(c => c.id === inv.clientId);
            tbody.innerHTML += `
                <tr>
                    <td>${inv.invoiceNumber}</td>
                    <td>${client?.name || inv.clientName || 'Unknown'}</td>
                    <td>${inv.currency || '$'}${inv.amount.toFixed(2)}</td
                    <td><span class="${inv.status === 'paid' ? 'badge-paid' : 'badge-unpaid'}">${inv.status === 'paid' ? t.paid : t.unpaid}</span></td
                    <td>${inv.date}</td
                    <td>
                        <button class="btn-primary" onclick="viewInvoice(${inv.id})" style="margin-right:5px">${t.view}</button>
                        <button class="btn-primary" onclick="downloadInvoicePDF(${inv.id})" style="background:#00d25b">${t.pdf}</button>
                        ${inv.status === 'unpaid' ? `<button class="btn-primary" onclick="markInvoicePaid(${inv.id})" style="margin-left:5px">${t.markPaid}</button>` : ''}
                    </td
                </tr>
            `;
        });
    }
}

function refreshClientsTable() {
    const tbody = document.getElementById('clientsTableBody');
    if (tbody) {
        const t = translations[currentLanguage];
        if (clients.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No clients added yet.不求前进';
            return;
        }
        tbody.innerHTML = '';
        clients.forEach(c => {
            tbody.innerHTML += `
                <tr>
                    <td>${escapeHtml(c.name)}</td
                    <td>${c.email}</td
                    <td>$${c.rate}/hour</td
                    <td><button class="btn-danger" onclick="deleteClient(${c.id})">${t.delete}</button></td
                </tr>
            `;
        });
    }
}

function refreshAllEntriesTable() {
    const tbody = document.getElementById('allEntriesTableBody');
    if (tbody) {
        if (timeEntries.length === 0) {
            tbody.innerHTML = '<td><td colspan="8" class="text-center">No time entries yet.不求前进</tbody>';
            return;
        }
        tbody.innerHTML = '';
        timeEntries.forEach(entry => {
            const client = clients.find(c => c.id === entry.clientId);
            tbody.innerHTML += `
                <tr>
                    <td>${client?.name || 'Unknown'}</td>
                    <td>${escapeHtml(entry.description)}</td
                    <td>${entry.duration} hrs</td
                    <td>$${client?.rate || 0}/hr</td
                    <td>$${(entry.duration * (client?.rate || 0)).toFixed(2)}</td
                    <td>${entry.date}</td
                    <td>${entry.invoiced ? '✅ Yes' : '❌ No'}</td
                    <td><button class="btn-danger" onclick="deleteTimeEntry(${entry.id})">Delete</button></td
                </tr>
            `;
        });
    }
}

function refreshUnpaidEntriesList() {
    const container = document.getElementById('unpaidEntriesContainer');
    const filterValue = document.getElementById('timeInvoiceFilter')?.value || 'all';
    
    if (container) {
        let unpaid = timeEntries.filter(e => !e.invoiced);
        if (filterValue !== 'all') {
            unpaid = unpaid.filter(e => e.clientId == filterValue);
        }
        
        if (unpaid.length === 0) {
            container.innerHTML = '<div class="placeholder-text">📭 No unpaid time entries found.</div>';
            document.getElementById('createTimeInvoiceBtn').style.display = 'none';
            return;
        }
        
        let html = '';
        unpaid.forEach(entry => {
            const client = clients.find(c => c.id === entry.clientId);
            const amount = entry.duration * (client?.rate || 0);
            html += `
                <div class="entry-item">
                    <input type="checkbox" value="${entry.id}" id="unpaid_${entry.id}">
                    <label for="unpaid_${entry.id}">
                        <strong>${client?.name || 'Unknown'}</strong> - ${escapeHtml(entry.description)}<br>
                        <small>${entry.duration} hrs @ $${client?.rate}/hr = $${amount.toFixed(2)}</small>
                    </label>
                </div>
            `;
        });
        container.innerHTML = html;
        document.getElementById('createTimeInvoiceBtn').style.display = 'block';
    }
}

// ============================================
// TIMER FUNCTIONS
// ============================================
function startTimer() {
    const clientId = document.getElementById('timerClientSelect').value;
    if (!clientId) {
        alert('Please select a client first');
        return;
    }
    const taskDesc = document.getElementById('timerTaskDesc').value;
    if (!taskDesc) {
        alert('Please enter a task description');
        return;
    }
    
    activeTimerClientId = parseInt(clientId);
    activeTimerTaskDesc = taskDesc;
    timerActive = true;
    timerSeconds = 0;
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        if (timerActive) {
            timerSeconds++;
            updateTimerDisplay();
            updateEarnedAmount();
        }
    }, 1000);
    
    document.getElementById('startTimerBtn').disabled = true;
    document.getElementById('stopTimerBtn').disabled = false;
    document.getElementById('resetTimerBtn').disabled = false;
    
    const client = clients.find(c => c.id === activeTimerClientId);
    document.getElementById('timerHourlyRate').value = `$${client.rate}/hour`;
}

function stopTimer() {
    if (!timerActive) return;
    timerActive = false;
    clearInterval(timerInterval);
    
    const hours = timerSeconds / 3600;
    const client = clients.find(c => c.id === activeTimerClientId);
    const amount = hours * client.rate;
    
    const newEntry = {
        id: Date.now(),
        clientId: activeTimerClientId,
        description: activeTimerTaskDesc,
        duration: parseFloat(hours.toFixed(2)),
        date: getTodayDate(),
        invoiced: false,
        amount: amount
    };
    
    timeEntries.push(newEntry);
    saveUserData();
    refreshAll();
    
    resetTimerUI();
    alert(`✓ Logged: ${hours.toFixed(2)} hours = $${amount.toFixed(2)}`);
}

function resetTimer() {
    if (timerActive) {
        timerActive = false;
        clearInterval(timerInterval);
    }
    resetTimerUI();
}

function resetTimerUI() {
    timerSeconds = 0;
    updateTimerDisplay();
    document.getElementById('startTimerBtn').disabled = false;
    document.getElementById('stopTimerBtn').disabled = true;
    document.getElementById('resetTimerBtn').disabled = true;
    document.getElementById('timerHourlyRate').value = '';
    document.getElementById('timerEarned').value = '$0.00';
}

function updateTimerDisplay() {
    const hours = Math.floor(timerSeconds / 3600);
    const minutes = Math.floor((timerSeconds % 3600) / 60);
    const seconds = timerSeconds % 60;
    document.getElementById('timerHours').innerText = String(hours).padStart(2, '0');
    document.getElementById('timerMinutes').innerText = String(minutes).padStart(2, '0');
    document.getElementById('timerSeconds').innerText = String(seconds).padStart(2, '0');
}

function updateEarnedAmount() {
    if (!activeTimerClientId) return;
    const client = clients.find(c => c.id === activeTimerClientId);
    if (client) {
        const hours = timerSeconds / 3600;
        const earned = hours * client.rate;
        document.getElementById('timerEarned').value = `$${earned.toFixed(2)}`;
    }
}

// ============================================
// CLIENT FUNCTIONS
// ============================================
function openAddClientModal() {
    updateUILanguage();
    document.getElementById('clientModal').style.display = 'flex';
}

function closeClientModal() {
    document.getElementById('clientModal').style.display = 'none';
    document.getElementById('modalClientName').value = '';
    document.getElementById('modalClientEmail').value = '';
    document.getElementById('modalClientRate').value = '';
}

function saveNewClient() {
    const name = document.getElementById('modalClientName').value;
    const email = document.getElementById('modalClientEmail').value;
    const rate = parseFloat(document.getElementById('modalClientRate').value);
    
    if (!name || !rate) {
        alert('Please enter client name and hourly rate');
        return;
    }
    
    clients.push({
        id: Date.now(),
        name: name,
        email: email,
        rate: rate
    });
    saveUserData();
    refreshAll();
    closeClientModal();
}

function deleteClient(id) {
    if (confirm('Delete this client?')) {
        clients = clients.filter(c => c.id !== id);
        saveUserData();
        refreshAll();
    }
}

function deleteTimeEntry(id) {
    if (confirm('Delete this time entry?')) {
        timeEntries = timeEntries.filter(e => e.id !== id);
        saveUserData();
        refreshAll();
    }
}

// ============================================
// INVOICE FUNCTIONS
// ============================================
function createTimeInvoice() {
    const checkboxes = document.querySelectorAll('#unpaidEntriesContainer input:checked');
    if (checkboxes.length === 0) {
        alert('Please select at least one time entry');
        return;
    }
    
    const selectedIds = Array.from(checkboxes).map(cb => parseInt(cb.value));
    const selectedEntries = timeEntries.filter(e => selectedIds.includes(e.id));
    
    const clientIds = [...new Set(selectedEntries.map(e => e.clientId))];
    if (clientIds.length > 1) {
        alert('Please select time entries from only ONE client');
        return;
    }
    
    const client = clients.find(c => c.id === clientIds[0]);
    let totalAmount = 0;
    selectedEntries.forEach(e => {
        totalAmount += e.duration * client.rate;
    });
    
    if (!checkInvoiceLimit()) return;
    
    const invoiceNumber = `INV-${String(invoices.length + 1).padStart(3, '0')}`;
    const newInvoice = {
        id: Date.now(),
        invoiceNumber: invoiceNumber,
        clientId: client.id,
        clientName: client.name,
        amount: totalAmount,
        status: 'unpaid',
        date: getTodayDate(),
        description: selectedEntries.map(e => e.description).join(', '),
        currency: '$'
    };
    
    invoices.push(newInvoice);
    selectedEntries.forEach(e => { e.invoiced = true; });
    saveUserData();
    refreshAll();
    alert(`Invoice ${invoiceNumber} created for $${totalAmount.toFixed(2)}`);
    
    if (confirm('Download PDF now?')) {
        downloadInvoicePDF(newInvoice.id);
    }
}

function markInvoicePaid(id) {
    const invoice = invoices.find(i => i.id === id);
    if (invoice) {
        invoice.status = 'paid';
        saveUserData();
        refreshInvoicesTable();
        alert(`Invoice ${invoice.invoiceNumber} marked as paid.`);
    }
}

function viewInvoice(id) {
    const invoice = invoices.find(i => i.id === id);
    const client = clients.find(c => c.id === invoice.clientId);
    alert(`Invoice: ${invoice.invoiceNumber}\nClient: ${client?.name}\nAmount: $${invoice.amount}\nStatus: ${invoice.status}\nDate: ${invoice.date}`);
}

// ============================================
// QUICK INVOICE FUNCTIONS
// ============================================
// ============================================
// QUICK INVOICE FUNCTIONS (FIXED)
// ============================================


function renderInvoiceItems() {
    const container = document.getElementById('invoiceItemsContainer');
    if (!container) {
        console.error("Container not found");
        return;
    }
    
    container.innerHTML = '';
    
    invoiceItems.forEach((item, idx) => {
        const qty = parseFloat(item.qty) || 0;
        const pricePerPiece = parseFloat(item.pricePerPiece) || 0;
        const totalPrice = qty * pricePerPiece;
        
        const row = document.createElement('div');
        row.className = 'item-row';
        row.setAttribute('data-index', idx);
        row.innerHTML = `
            <input type="text" class="item-desc" placeholder="Description" value="${escapeHtml(item.desc || '')}" data-index="${idx}" data-field="desc">
            <input type="text" class="item-qty" placeholder="Qty (e.g., 10, 5kg)" value="${item.qty || ''}" data-index="${idx}" data-field="qty">
            <input type="text" class="item-price-per-piece" placeholder="Price per Piece/Service" value="${item.pricePerPiece || ''}" data-index="${idx}" data-field="pricePerPiece">
            <input type="text" class="item-total" placeholder="Total Price" value="${totalPrice > 0 ? totalPrice.toFixed(2) : ''}" readonly data-index="${idx}">
            <button class="remove-item-btn" data-index="${idx}">✕</button>
        `;
        container.appendChild(row);
    });
    
    // Calculate and update total price when Qty or Price changes
    document.querySelectorAll('.item-qty, .item-price-per-piece').forEach(input => {
        input.addEventListener('input', function(e) {
            const idx = parseInt(this.getAttribute('data-index'));
            const field = this.getAttribute('data-field');
            const value = this.value;
            
            if (invoiceItems[idx]) {
                invoiceItems[idx][field] = value;
                
                // Calculate new total
                const qty = parseFloat(invoiceItems[idx].qty) || 0;
                const pricePerPiece = parseFloat(invoiceItems[idx].pricePerPiece) || 0;
                const newTotal = qty * pricePerPiece;
                
                // Update the total field in the same row
                const row = this.closest('.item-row');
                const totalInput = row.querySelector('.item-total');
                if (totalInput) {
                    totalInput.value = newTotal > 0 ? newTotal.toFixed(2) : '';
                }
            }
        });
    });
    
    // Save description changes
    document.querySelectorAll('.item-desc').forEach(input => {
        input.addEventListener('input', function(e) {
            const idx = parseInt(this.getAttribute('data-index'));
            const value = this.value;
            if (invoiceItems[idx]) {
                invoiceItems[idx].desc = value;
            }
        });
    });
    
    // Delete item
    document.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const idx = parseInt(this.getAttribute('data-index'));
            if (invoiceItems.length > 1) {
                invoiceItems.splice(idx, 1);
            } else {
                invoiceItems[0] = { desc: '', qty: '', pricePerPiece: '' };
            }
            renderInvoiceItems();
        });
    });
}



function addInvoiceItem() {
    invoiceItems.push({ desc: '', qty: 1, price: 0 });
    renderInvoiceItems();
}

// Make functions global
window.addInvoiceItem = addInvoiceItem;
window.renderInvoiceItems = renderInvoiceItems;

function removeInvoiceItem(index) {
    if (invoiceItems.length > 1) {
        invoiceItems.splice(index, 1);
    } else {
        invoiceItems[0] = { desc: '', qty: 1, price: 0 };
    }
    renderInvoiceItems();
}

function calculateInvoiceTotal() {
    let subtotal = 0;
    
    invoiceItems.forEach(item => {
        // Skip items without description or price
        if (!item.desc || !item.pricePerPiece) return;
        
        const qty = parseFloat(item.qty) || 0;
        const pricePerPiece = parseFloat(item.pricePerPiece) || 0;
        subtotal += qty * pricePerPiece;
    });
    
    const taxRate = parseFloat(document.getElementById('invTaxRate').value) || 0;
    const discount = parseFloat(document.getElementById('invDiscount').value) || 0;
    const tax = subtotal * taxRate / 100;
    const total = subtotal + tax - discount;
    const currency = document.getElementById('invCurrency').value || '$';
    
    return { subtotal, tax, discount, total, currency };
}

function previewInvoice() {
    const clientName = document.getElementById('invClientName').value;
    if (!clientName) {
        alert('Please enter client name');
        return;
    }
    
    const { subtotal, tax, discount, total, currency } = calculateInvoiceTotal();
    
    let itemsHtml = '';
    invoiceItems.forEach(item => {
        if (item.desc && item.pricePerPiece) {
            const qty = parseFloat(item.qty) || 0;
            const pricePerPiece = parseFloat(item.pricePerPiece) || 0;
            const totalPrice = qty * pricePerPiece;
            itemsHtml += `
                <div class="preview-item">
                    ${escapeHtml(item.desc)}: ${qty} × ${currency}${pricePerPiece.toFixed(2)} = ${currency}${totalPrice.toFixed(2)}
                </div>
            `;
        }
    });
    
    document.getElementById('previewContent').innerHTML = `
        <div><strong>Client:</strong> ${escapeHtml(clientName)}</div>
        <div><strong>Invoice #:</strong> ${document.getElementById('invNumber').value || 'Auto'}</div>
        <div><strong>Items:</strong></div>
        <div class="preview-items">${itemsHtml || 'No items'}</div>
        <div><strong>Subtotal:</strong> ${currency}${subtotal.toFixed(2)}</div>
        ${tax > 0 ? `<div><strong>Tax (${document.getElementById('invTaxRate').value}%):</strong> ${currency}${tax.toFixed(2)}</div>` : ''}
        ${discount > 0 ? `<div><strong>Discount:</strong> -${currency}${discount.toFixed(2)}</div>` : ''}
        <div><strong>Total:</strong> ${currency}${total.toFixed(2)}</div>
    `;
    document.getElementById('previewArea').style.display = 'block';
}
function generatePDF() {
    if (!checkInvoiceLimit()) return;
    
    const clientName = document.getElementById('invClientName').value;
    if (!clientName) {
        alert('Please enter client name');
        return;
    }
    
    // Filter valid items
    const validItems = invoiceItems.filter(i => i.desc && i.pricePerPiece);
    if (validItems.length === 0) {
        alert('Please add at least one item with description and price');
        return;
    }
    
    let subtotal = 0;
    validItems.forEach(i => {
        const qtyMatch = (i.qty || "").match(/[\d.]+/);
        const qtyNum = qtyMatch ? parseFloat(qtyMatch[0]) : 0;
        const priceMatch = (i.pricePerPiece || "").match(/[\d.]+/);
        const priceNum = priceMatch ? parseFloat(priceMatch[0]) : 0;
        subtotal += qtyNum * priceNum;
    });
    
    const taxRate = parseFloat(document.getElementById('invTaxRate').value) || 0;
    const discount = parseFloat(document.getElementById('invDiscount').value) || 0;
    const tax = subtotal * taxRate / 100;
    const total = subtotal + tax - discount;
    const currencySymbol = document.getElementById('invCurrency').value || '$';
    const pdfCurrency = getPdfCurrency(currencySymbol);
    const invoiceNumber = document.getElementById('invNumber').value || 'INV-' + Date.now().toString().slice(-6);
    const issueDate = document.getElementById('invIssueDate').value || getTodayDate();
    const dueDate = document.getElementById('invDueDate').value || '';
    const clientEmail = document.getElementById('invClientEmail').value;
    const clientAddress = document.getElementById('invClientAddress').value;
    const notes = document.getElementById('invNotes').value;
    const fmt = (n) => n.toFixed(2);
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 20;
    
    // Company Header with Sender Info from Settings
    doc.setFontSize(23);
    doc.setTextColor(41, 128, 185);  // ← BLUE for business name (KEEP)
    
    const senderInfo = localStorage.getItem('freelance_sender_info');
    let senderName = 'Freelance Pro';
    let senderAddress = '';
    let senderEmail = '';
    let senderPhone = '';
    
    if (senderInfo) {
        const data = JSON.parse(senderInfo);
        senderName = data.senderName || 'Freelance Pro';
        senderAddress = data.senderAddress || '';
        senderEmail = data.senderEmail || '';
        senderPhone = data.senderPhone || '';
    }
    
    doc.text(senderName, 20, y);
    y += 10;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);  // ← CHANGED to PURE BLACK for address, email, phone
    
    if (senderAddress) {
        doc.text(senderAddress, 20, y);
        y += 6;
    }
    if (senderEmail) {
        doc.text(`Email: ${senderEmail}`, 20, y);
        y += 6;
    }
    if (senderPhone) {
        doc.text(`Phone: ${senderPhone}`, 20, y);
        y += 6;
    }
    y += 60;

    
    // Invoice Title - ALL TEXT PURE BLACK
    doc.setFontSize(22);
    doc.setTextColor(41, 128, 185); // ← Change to BLUE
    doc.text('INVOICE', 140, 35);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`#: ${invoiceNumber}`, 140, 45);
    doc.text(`Date: ${issueDate}`, 140, 52);
    if (dueDate) doc.text(`Due: ${dueDate}`, 140, 59);
    
    // Bill To - ALL TEXT PURE BLACK
    y = 75;
    doc.setFontSize(18);
    doc.setTextColor(41, 128, 185); // ← Change to BLUE
    doc.text('Bill To:', 20, y);
    y += 7;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(clientName, 20, y);
    y += 6;
    if (clientEmail) {
        doc.text(clientEmail, 20, y);
        y += 6;
    }
    if (clientAddress) {
        doc.text(clientAddress, 20, y);
        y += 6;
    }
    y += 15;
    // NO sender info here!
    
    // Table with pure black text
    const tableData = validItems.map(i => {
        const qtyText = i.qty || '0';
        const priceText = i.pricePerPiece || '0';
        
        const qtyMatch = qtyText.match(/[\d.]+/);
        const priceMatch = priceText.match(/[\d.]+/);
        const qtyNum = qtyMatch ? parseFloat(qtyMatch[0]) : 0;
        const priceNum = priceMatch ? parseFloat(priceMatch[0]) : 0;
        const totalPrice = qtyNum * priceNum;
        
        return [
            i.desc,
            qtyText,
            `${pdfCurrency}${priceText}`,
            `${pdfCurrency}${fmt(totalPrice)}`
        ];
    });
    
    doc.autoTable({
        startY: y,
        head: [['Description', 'Qty', 'Price/Piece/Service', 'Total Price']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        bodyStyles: { textColor: [0, 0, 0] },  // Table body text pure black
        margin: { left: 20, right: 20 }
    });
    
    y = doc.lastAutoTable.finalY + 10;
    
    // Totals - Pure black
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Subtotal:', 140, y);
    doc.text(`${pdfCurrency}${fmt(subtotal)}`, 180, y);
    y += 7;
 // Get the raw tax input text (e.g., "18%", "GST", "VAT")
const taxRateInput = document.getElementById('invTaxRate').value;
const taxRateNum = parseFloat(taxRateInput) || 0;

if (taxRateInput && taxRateInput !== '0' && taxRateInput !== '') {
    // Show the original text (e.g., "18%", "GST", "VAT")
    doc.text(`Tax (${taxRateInput}):`, 140, y);
    doc.text(`${pdfCurrency}${fmt(tax)}`, 180, y);
    y += 7;
}
    if (discount > 0) {
        doc.text('Discount:', 140, y);
        doc.text(`-${pdfCurrency}${fmt(discount)}`, 180, y);
        y += 7;
    }
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('TOTAL:', 140, y);
    doc.text(`${pdfCurrency}${fmt(total)}`, 180, y);
    doc.setFont(undefined, 'normal');
    y += 20;
    
    // Notes - Pure black
    if (notes) {
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.text('Notes:', 20, y);
        doc.setFontSize(8);
        doc.text(notes.length > 80 ? notes.substring(0, 77) + '...' : notes, 20, y + 7);
        y += 20;
    }
    
    // Payment Instructions - Pure black
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Payment Instructions:', 20, y);
    doc.setFont(undefined, 'normal');
    if (companyInfo.bankName) doc.text(`Bank: ${companyInfo.bankName}`, 20, y + 8);
    if (companyInfo.accountNumber) doc.text(`Account: ${companyInfo.accountNumber}`, 20, y + 15);
    if (companyInfo.paymentInstructions) doc.text(companyInfo.paymentInstructions, 20, y + 25);
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for your business!', 20, 280);
    // Add "Powered by" for Free plan users
    if (currentUser && currentUser.plan !== 'premium') {
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text('Powered by Freelance Pro', 20, 290);
    }
        
    doc.save(`${invoiceNumber}_${clientName.replace(/\s/g, '_')}.pdf`);
    
    if (confirm('Save this invoice to history?')) {
        invoices.push({
            id: Date.now(),
            invoiceNumber: invoiceNumber,
            clientId: null,
            clientName: clientName,
            amount: total,
            status: 'unpaid',
            date: issueDate,
            description: validItems.map(i => i.desc).join(', '),
            currency: currencySymbol
        });
        saveUserData();
        refreshInvoicesTable();
        alert('Invoice saved!');
    }
}
function resetInvoiceForm() {
    document.getElementById('invClientName').value = '';
    document.getElementById('invClientEmail').value = '';
    document.getElementById('invClientAddress').value = '';
    document.getElementById('invNumber').value = '';
    document.getElementById('invIssueDate').value = getTodayDate();
    document.getElementById('invDueDate').value = '';
    document.getElementById('invTaxRate').value = '0';
    document.getElementById('invDiscount').value = '0';
    document.getElementById('invNotes').value = '';
    invoiceItems = [{ desc: '', qty: 1, price: 0 }];
    renderInvoiceItems();
    document.getElementById('previewArea').style.display = 'none';
}

// ============================================
// PDF DOWNLOAD FOR SAVED INVOICES
// ============================================
async function downloadInvoicePDF(invoiceId) {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) { alert('Invoice not found'); return; }
    
    const client = clients.find(c => c.id === invoice.clientId);
    const clientName = client?.name || invoice.clientName || 'Client';
    const amount = invoice.amount;
    const invoiceNumber = invoice.invoiceNumber;
    const date = invoice.date;
    const currencySymbol = invoice.currency || '$';
    const pdfCurrency = getPdfCurrency(currencySymbol);
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 20;
    
    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185);
    doc.text(companyInfo.name, 20, y);
    y += 10;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(companyInfo.email, 20, y);
    y += 6;
    doc.text(companyInfo.phone, 20, y);
    y += 6;
    doc.text(companyInfo.address, 20, y);
    y += 15;
    
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.text('INVOICE', 140, 35);
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`#: ${invoiceNumber}`, 140, 45);
    doc.text(`Date: ${date}`, 140, 52);
    
    y = 75;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Bill To:', 20, y);
    y += 7;
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(clientName, 20, y);
    y += 20;
    
    doc.setFillColor(41, 128, 185);
    doc.setTextColor(255, 255, 255);
    doc.rect(20, y, 170, 8, 'F');
    doc.text('Description', 25, y + 6);
    doc.text('Amount', 175, y + 6, { align: 'right' });
    y += 10;
    doc.setTextColor(0, 0, 0);
    const description = invoice.description || 'Services rendered';
    doc.text(description.length > 50 ? description.substring(0, 47) + '...' : description, 25, y + 5);
    doc.text(`${pdfCurrency}${amount.toFixed(2)}`, 175, y + 5, { align: 'right' });
    y += 20;
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('TOTAL:', 140, y);
    doc.text(`${pdfCurrency}${amount.toFixed(2)}`, 175, y, { align: 'right' });
    y += 20;
    
    doc.setFontSize(9);
    doc.text('Payment Instructions:', 20, y);
    doc.text(`Bank: ${companyInfo.bankName}`, 20, y + 8);
    doc.text(`Account: ${companyInfo.accountNumber}`, 20, y + 15);
    
    // Add "Powered by" for Free plan users
    if (currentUser && currentUser.plan !== 'premium') {
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text('Powered by Freelance Pro', 20, 290);
    }
    
    doc.save(`Invoice_${invoiceNumber}.pdf`);
}

// ============================================
// CLEAR ALL DATA FUNCTION
// ============================================
function clearAllData() {
    if (!currentUser) {
        alert('Please log in to clear your data');
        return;
    }
    if (confirm('⚠️ WARNING: This will permanently delete ALL your data including clients, time entries, and invoices. This action cannot be undone. Are you sure?')) {
        if (confirm('Are you ABSOLUTELY sure? All your data will be lost forever!')) {
            clients = [];
            timeEntries = [];
            invoices = [];
            saveUserData();
            resetTimerUI();
            refreshAll();
            invoiceItems = [{ desc: '', qty: 1, price: 0 }];
            renderInvoiceItems();
            resetInvoiceForm();
            alert('✅ All data has been cleared successfully!');
        }
    }
}

// ============================================
// EXPORT/IMPORT FUNCTIONS
// ============================================
function exportAllData() {
    if (!currentUser) {
        alert('Please log in to export your data');
        return;
    }
    const data = { clients, timeEntries, invoices };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `freelance_backup_${getTodayDate()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    alert('Data exported successfully!');
}

function importDataFile(file) {
    if (!currentUser) {
        alert('Please log in to import data');
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.clients) clients = data.clients;
            if (data.timeEntries) timeEntries = data.timeEntries;
            if (data.invoices) invoices = data.invoices;
            saveUserData();
            refreshAll();
            alert('Data imported successfully!');
        } catch (err) {
            alert('Invalid file');
        }
    };
    reader.readAsText(file);
}

// ============================================
// LANGUAGE INITIALIZATION
// ============================================
function initLanguage() {
    const langSelect = document.getElementById('languageSelect');
    if (langSelect) {
        langSelect.value = currentLanguage;
        langSelect.addEventListener('change', (e) => {
            currentLanguage = e.target.value;
            localStorage.setItem('freelance_language', currentLanguage);
            refreshAll();
            renderInvoiceItems();
            alert(`Language changed to ${langSelect.options[langSelect.selectedIndex].text}`);
        });
    }
}

// ============================================
// TAB SWITCHING
// ============================================
function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.panel').forEach(p => p.classList.remove('active-panel'));
            document.getElementById(btn.getAttribute('data-tab')).classList.add('active-panel');
        });
    });
}

// ============================================
// HELP SECTION TOGGLE
// ============================================
function toggleHelp() {
    const content = document.getElementById('helpContent');
    const icon = document.getElementById('helpIcon');
    
    console.log("Toggle help clicked", content, icon); // Debug log
    
    if (!content) return;
    
    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block';
        if (icon) icon.innerHTML = '▲';
    } else {
        content.style.display = 'none';
        if (icon) icon.innerHTML = '▼';
    }
}

// ============================================
// MODAL FUNCTIONS
// ============================================
function closeModals() {
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
}

// ============================================
// EVENT LISTENERS
// ============================================
function initEventListeners() {
    // Timer buttons
    document.getElementById('startTimerBtn')?.addEventListener('click', startTimer);
    document.getElementById('stopTimerBtn')?.addEventListener('click', stopTimer);
    document.getElementById('resetTimerBtn')?.addEventListener('click', resetTimer);
    
    // Settings buttons
    console.log("🔧 Adding Settings button listeners...");
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const resetSettingsBtn = document.getElementById('resetSettingsBtn');
    
    console.log("saveSettingsBtn found:", saveSettingsBtn);
    console.log("resetSettingsBtn found:", resetSettingsBtn);
    
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', saveCompanyInfo);
        console.log("✅ saveSettingsBtn listener added");
    }
    
    if (resetSettingsBtn) {
        resetSettingsBtn.addEventListener('click', resetCompanyInfo);
        console.log("✅ resetSettingsBtn listener added");
    }
    
    // Client buttons
    document.getElementById('addClientBtn')?.addEventListener('click', openAddClientModal);
    document.getElementById('saveClientModalBtn')?.addEventListener('click', saveNewClient);
    document.getElementById('closeModalBtn')?.addEventListener('click', closeClientModal);
    
    // Invoice buttons
    document.getElementById('addInvoiceItemBtn')?.addEventListener('click', addInvoiceItem);
    document.getElementById('previewInvoiceBtn')?.addEventListener('click', previewInvoice);
    document.getElementById('generatePdfBtn')?.addEventListener('click', generatePDF);
    document.getElementById('resetInvoiceBtn')?.addEventListener('click', resetInvoiceForm);
    
    // Time invoicing
    document.getElementById('timeInvoiceFilter')?.addEventListener('change', () => refreshUnpaidEntriesList());
    document.getElementById('createTimeInvoiceBtn')?.addEventListener('click', createTimeInvoice);
    
    // Data management
    document.getElementById('exportBtn')?.addEventListener('click', exportAllData);
    document.getElementById('importBtn')?.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => importDataFile(e.target.files[0]);
        input.click();
    });
    document.getElementById('clearDataBtn')?.addEventListener('click', clearAllData);
    
    // Auth buttons
    document.getElementById('loginBtn')?.addEventListener('click', () => document.getElementById('loginModal').style.display = 'flex');
    document.getElementById('signupBtn')?.addEventListener('click', () => document.getElementById('signupModal').style.display = 'flex');
    document.getElementById('logoutBtn')?.addEventListener('click', async () => { 
        await firebaseLogout(); 
        location.reload(); 
    });
    document.getElementById('upgradeBtn')?.addEventListener('click', showPremiumBanner);
    document.getElementById('confirmUpgradeBtn')?.addEventListener('click', upgradeToPremium);
    document.getElementById('closePremiumBanner')?.addEventListener('click', () => document.getElementById('premiumBanner').style.display = 'none');
    
    // Modal switches
    document.getElementById('switchToSignup')?.addEventListener('click', (e) => { 
        e.preventDefault(); 
        closeModals(); 
        document.getElementById('signupModal').style.display = 'flex'; 
    });
    document.getElementById('switchToLogin')?.addEventListener('click', (e) => { 
        e.preventDefault(); 
        closeModals(); 
        document.getElementById('loginModal').style.display = 'flex'; 
    });
    
    // Modal close
    document.querySelectorAll('.close-modal').forEach(btn => btn.onclick = closeModals);
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModals();
        }
    });
    
    // Timer client select
    document.getElementById('timerClientSelect')?.addEventListener('change', function() {
        const clientId = this.value;
        if (clientId) {
            const client = clients.find(c => c.id == clientId);
            if (client) {
                document.getElementById('timerHourlyRate').value = `$${client.rate}/hour`;
            }
        } else {
            document.getElementById('timerHourlyRate').value = '';
        }
    });
}

// ============================================
// INITIALIZE APP
// ============================================
// ============================================
// INITIALIZE APP
// ============================================
function init() {
    // Firebase auth state listener already handles user loading
    // No need for loadUsers() anymore
    
    initTabs();
    initEventListeners();
    initLanguage();
    renderInvoiceItems();
    
    const todayInput = document.getElementById('invIssueDate');
    if (todayInput) todayInput.value = getTodayDate();
    
    // Help section starts closed
    const helpContent = document.getElementById('helpContent');
    if (helpContent) helpContent.style.display = 'none';
    
    console.log("✅ App initialized with Firebase!");
}
// ============================================
// MANUAL FIREBASE AUTH HANDLERS
// ============================================

// Sign Up Form Handler
const signupFormElement = document.getElementById('signupForm');
if (signupFormElement) {
    signupFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirm = document.getElementById('signupConfirmPassword').value;
        
        if (!name || !email || !password) {
            alert('Please fill all fields');
            return;
        }
        if (password !== confirm) {
            alert('Passwords do not match');
            return;
        }
        
        console.log("📝 Signing up:", email);
        const result = await firebaseSignUp(name, email, password);
        
        if (result.success) {
            alert('✅ Account created successfully!');
            closeModals();
        } else {
            alert('❌ Sign up failed: ' + result.error);
        }
    });
    console.log("✅ Sign up form handler attached");
}

// Login Form Handler
const loginFormElement = document.getElementById('loginForm');
if (loginFormElement) {
    loginFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        console.log("🔐 Logging in:", email);
        const result = await firebaseLogin(email, password);
        
        if (result.success) {
            alert('✅ Logged in successfully!');
            closeModals();
        } else {
            alert('❌ Login failed: ' + result.error);
        }
    });
    console.log("✅ Login form handler attached");
}

// Logout Button Handler
const logoutButton = document.getElementById('logoutBtn');
if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
        await firebaseLogout();
        alert('Logged out');
        location.reload();
    });
    console.log("✅ Logout button handler attached");
}
// Start the app
init();
// Make invoice functions global for HTML onclick buttons
window.viewInvoice = viewInvoice;
window.downloadInvoicePDF = downloadInvoicePDF;
window.markInvoicePaid = markInvoicePaid;
window.toggleHelp = toggleHelp;