// Data storage
let clients = [];
let timeEntries = [];
let invoices = [];
let timerInterval = null;
let timerRunning = false;
let timerSeconds = 0;
let activeTimerProject = null;
let activeTimerDesc = '';

// Company info for PDF (customizable)
let companyInfo = {
    name: 'Freelance Pro',
    email: 'hello@freelancepro.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business St, Suite 100, New York, NY 10001',
    // Payment details
    bankName: 'Chase Bank',
    accountName: 'Your Business Name',
    accountNumber: 'XXXXXXXX1234',
    routingNumber: 'XXXXXXXX5678',
    paymentInstructions: 'Payment is due within 30 days. Please include invoice number with your transfer.',
    taxId: 'XX-1234567'
};

// Quick invoice items
let quickInvoiceItems = [{ desc: '', qty: 1, price: 0 }];

// Load from localStorage
function loadData() {
    const savedClients = localStorage.getItem('freelance_clients');
    const savedEntries = localStorage.getItem('freelance_entries');
    const savedInvoices = localStorage.getItem('freelance_invoices');
    const savedCompany = localStorage.getItem('freelance_company');
    
    if (savedClients) clients = JSON.parse(savedClients);
    if (savedEntries) timeEntries = JSON.parse(savedEntries);
    if (savedInvoices) invoices = JSON.parse(savedInvoices);
    if (savedCompany) companyInfo = JSON.parse(savedCompany);
    
    // Add sample data if empty
    if (clients.length === 0) {
        clients = [
            { id: 1, name: 'Acme Corp', email: 'billing@acme.com', rate: 75 },
            { id: 2, name: 'TechStart Inc', email: 'finance@techstart.com', rate: 85 }
        ];
    }
    if (timeEntries.length === 0) {
        timeEntries = [
            { id: 1, clientId: 1, description: 'Website redesign', duration: 4.5, date: getTodayDate(), invoiced: false },
            { id: 2, clientId: 2, description: 'API integration', duration: 3, date: getTodayDate(), invoiced: false }
        ];
    }
    if (invoices.length === 0) {
        invoices = [
            { id: 1, invoiceNumber: 'INV-001', clientId: 1, amount: 337.5, status: 'paid', date: getTodayDate(), entries: [1], notes: 'Thanks for your business!' }
        ];
    }
    saveAll();
    refreshAll();
}

function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

function saveAll() {
    localStorage.setItem('freelance_clients', JSON.stringify(clients));
    localStorage.setItem('freelance_entries', JSON.stringify(timeEntries));
    localStorage.setItem('freelance_invoices', JSON.stringify(invoices));
    localStorage.setItem('freelance_company', JSON.stringify(companyInfo));
}

function refreshAll() {
    refreshStats();
    refreshProjectSelect();
    refreshRecentEntries();
    refreshInvoicesTable();
    refreshClientsTable();
    refreshAllEntriesTable();
}

function refreshStats() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthEntries = timeEntries.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const totalHours = monthEntries.reduce((sum, e) => sum + e.duration, 0);
    
    const unpaidTotal = invoices.filter(i => i.status === 'unpaid').reduce((sum, i) => sum + i.amount, 0);
    const paidTotal = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
    
    const activeProjects = new Set(timeEntries.map(e => e.clientId)).size;
    
    document.getElementById('totalHours').innerText = totalHours.toFixed(1);
    document.getElementById('unpaidAmount').innerText = '$' + unpaidTotal.toFixed(2);
    document.getElementById('paidAmount').innerText = '$' + paidTotal.toFixed(2);
    document.getElementById('activeProjects').innerText = activeProjects;
}

function refreshProjectSelect() {
    const select = document.getElementById('projectSelect');
    select.innerHTML = '<option value="">Select project/client...</option>';
    clients.forEach(c => {
        select.innerHTML += `<option value="${c.id}">${c.name} ($${c.rate}/hr)</option>`;
    });
}

function refreshRecentEntries() {
    const tbody = document.getElementById('recentEntriesBody');
    const recent = [...timeEntries].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0,5);
    tbody.innerHTML = '';
    recent.forEach(e => {
        const client = clients.find(c => c.id === e.clientId);
        tbody.innerHTML += `<tr>
            <td>${client?.name || 'Unknown'}</td>
            <td>${escapeHtml(e.description)}</td>
            <td>${e.duration} hrs</td>
            <td>${e.date}</td>
            <td><button class="btn-danger" onclick="deleteEntry(${e.id})">Delete</button></td>
        </tr>`;
    });
}

function refreshInvoicesTable() {
    const tbody = document.getElementById('invoicesBody');
    tbody.innerHTML = '';
    invoices.forEach(inv => {
        const client = clients.find(c => c.id === inv.clientId);
        tbody.innerHTML += `<tr>
            <td>${inv.invoiceNumber}</td>
            <td>${client?.name || 'Unknown'}</td>
            <td>$${inv.amount.toFixed(2)}</td>
            <td><span class="badge ${inv.status === 'paid' ? 'badge-paid' : 'badge-unpaid'}">${inv.status}</span></td>
            <td>${inv.date}</td>
            <td>
                <button class="btn-secondary" onclick="viewInvoice(${inv.id})">View</button>
                <button class="btn-primary" onclick="downloadInvoicePDF(${inv.id})">📄 PDF</button>
                ${inv.status === 'unpaid' ? `<button class="btn-primary" onclick="markPaid(${inv.id})">Mark Paid</button>` : ''}
            </td>
        </tr>`;
    });
}

function refreshClientsTable() {
    const tbody = document.getElementById('clientsBody');
    tbody.innerHTML = '';
    clients.forEach(c => {
        tbody.innerHTML += `<tr>
            <td>${escapeHtml(c.name)}</td>
            <td>${c.email}</td>
            <td>$${c.rate}</td>
            <td><button class="btn-danger" onclick="deleteClient(${c.id})">Delete</button></td>
        </tr>`;
    });
}

function refreshAllEntriesTable() {
    const tbody = document.getElementById('allEntriesBody');
    tbody.innerHTML = '';
    timeEntries.forEach(e => {
        const client = clients.find(c => c.id === e.clientId);
        tbody.innerHTML += `<tr>
            <td>${client?.name || 'Unknown'}</td>
            <td>${escapeHtml(e.description)}</td>
            <td>${e.duration}</td>
            <td>${e.date}</td>
            <td>${e.invoiced ? '✅ Yes' : '❌ No'}</td>
            <td><button class="btn-danger" onclick="deleteEntry(${e.id})">Delete</button></td>
        </tr>`;
    });
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

function updateTimerDisplay() {
    const hours = Math.floor(timerSeconds / 3600);
    const minutes = Math.floor((timerSeconds % 3600) / 60);
    const seconds = timerSeconds % 60;
    document.getElementById('timerDisplay').innerHTML = 
        `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
}

// Timer functions
function startTimer() {
    const projectId = document.getElementById('projectSelect').value;
    if (!projectId) { alert('Select a project first'); return; }
    const desc = document.getElementById('taskDescription').value;
    if (!desc) { alert('Enter task description'); return; }
    
    activeTimerProject = parseInt(projectId);
    activeTimerDesc = desc;
    timerRunning = true;
    timerSeconds = 0;
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        if (timerRunning) {
            timerSeconds++;
            updateTimerDisplay();
        }
    }, 1000);
    
    document.getElementById('startTimerBtn').disabled = true;
    document.getElementById('stopTimerBtn').disabled = false;
}

function stopTimer() {
    if (!timerRunning) return;
    timerRunning = false;
    clearInterval(timerInterval);
    
    const durationHours = timerSeconds / 3600;
    const newEntry = {
        id: Date.now(),
        clientId: activeTimerProject,
        description: activeTimerDesc,
        duration: parseFloat(durationHours.toFixed(2)),
        date: getTodayDate(),
        invoiced: false
    };
    timeEntries.push(newEntry);
    saveAll();
    refreshAll();
    
    document.getElementById('startTimerBtn').disabled = false;
    document.getElementById('stopTimerBtn').disabled = true;
    document.getElementById('taskDescription').value = '';
    document.getElementById('timerDisplay').innerHTML = '00:00:00';
    timerSeconds = 0;
}

// Client functions
function openAddClientModal() {
    document.getElementById('clientModal').style.display = 'flex';
}

function closeClientModal() {
    document.getElementById('clientModal').style.display = 'none';
    document.getElementById('clientName').value = '';
    document.getElementById('clientEmail').value = '';
    document.getElementById('clientRate').value = '';
}

function addClient() {
    const name = document.getElementById('clientName').value;
    const email = document.getElementById('clientEmail').value;
    const rate = parseFloat(document.getElementById('clientRate').value);
    if (!name || !rate) { alert('Name and rate required'); return; }
    clients.push({ id: Date.now(), name, email, rate });
    saveAll();
    refreshAll();
    closeClientModal();
}

function deleteClient(id) {
    if (confirm('Delete this client? This will NOT delete their time entries.')) {
        clients = clients.filter(c => c.id !== id);
        saveAll();
        refreshAll();
    }
}

function deleteEntry(id) {
    if (confirm('Delete this time entry?')) {
        timeEntries = timeEntries.filter(e => e.id !== id);
        saveAll();
        refreshAll();
    }
}

// Invoice functions from time entries
function openCreateInvoiceModal() {
    const clientSelect = document.getElementById('invoiceClientSelect');
    clientSelect.innerHTML = '<option value="">Select client</option>';
    clients.forEach(c => {
        clientSelect.innerHTML += `<option value="${c.id}">${escapeHtml(c.name)}</option>`;
    });
    
    const checklist = document.getElementById('timeEntriesChecklist');
    checklist.innerHTML = '<p style="color:#666;">Select a client first</p>';
    document.getElementById('invoiceModal').style.display = 'flex';
}

function closeInvoiceModal() {
    document.getElementById('invoiceModal').style.display = 'none';
    document.getElementById('invoiceNotes').value = '';
}

function loadUnpaidEntries() {
    const clientId = parseInt(document.getElementById('invoiceClientSelect').value);
    if (!clientId) return;
    const unpaidEntries = timeEntries.filter(entry => entry.clientId === clientId && !entry.invoiced);
    const checklist = document.getElementById('timeEntriesChecklist');
    if (unpaidEntries.length === 0) {
        checklist.innerHTML = '<p>No unpaid time entries for this client</p>';
        return;
    }
    checklist.innerHTML = '';
    unpaidEntries.forEach(entry => {
        checklist.innerHTML += `<div>
            <input type="checkbox" value="${entry.id}" id="entry_${entry.id}">
            <label for="entry_${entry.id}">${escapeHtml(entry.description)} - ${entry.duration} hours</label>
        </div>`;
    });
}

function generateInvoiceFromTimeEntries() {
    const clientId = parseInt(document.getElementById('invoiceClientSelect').value);
    if (!clientId) { alert('Select client'); return; }
    const checkboxes = document.querySelectorAll('#timeEntriesChecklist input:checked');
    if (checkboxes.length === 0) { alert('Select at least one time entry'); return; }
    
    const selectedEntryIds = Array.from(checkboxes).map(cb => parseInt(cb.value));
    const selectedEntries = timeEntries.filter(e => selectedEntryIds.includes(e.id));
    const client = clients.find(c => c.id === clientId);
    
    const totalAmount = selectedEntries.reduce((sum, e) => sum + (e.duration * client.rate), 0);
    const invoiceNumber = `INV-${String(invoices.length + 1).padStart(3,'0')}`;
    
    const newInvoice = {
        id: Date.now(),
        invoiceNumber,
        clientId,
        amount: totalAmount,
        status: 'unpaid',
        date: getTodayDate(),
        entries: selectedEntryIds,
        notes: document.getElementById('invoiceNotes').value
    };
    
    invoices.push(newInvoice);
    selectedEntries.forEach(e => { e.invoiced = true; });
    saveAll();
    refreshAll();
    closeInvoiceModal();
    
    if (confirm(`Invoice ${invoiceNumber} created for $${totalAmount.toFixed(2)}.\n\nDownload PDF now?`)) {
        downloadInvoicePDF(newInvoice.id);
    }
}

function markPaid(invoiceId) {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (invoice) {
        invoice.status = 'paid';
        saveAll();
        refreshAll();
        alert(`Invoice ${invoice.invoiceNumber} marked as paid.`);
    }
}

function viewInvoice(invoiceId) {
    const invoice = invoices.find(i => i.id === invoiceId);
    const client = clients.find(c => c.id === invoice.clientId);
    const entries = timeEntries.filter(e => invoice.entries.includes(e.id));
    
    let details = `INVOICE: ${invoice.invoiceNumber}\n`;
    details += `Client: ${client.name}\n`;
    details += `Date: ${invoice.date}\n`;
    details += `Status: ${invoice.status}\n`;
    details += `\n--- Items ---\n`;
    entries.forEach(e => {
        details += `${e.description}: ${e.duration} hrs @ $${client.rate}/hr = $${(e.duration * client.rate).toFixed(2)}\n`;
    });
    details += `\nTotal: $${invoice.amount.toFixed(2)}\n`;
    details += `\nNotes: ${invoice.notes || 'None'}`;
    alert(details);
}

// PDF Invoice from time entries
async function downloadInvoicePDF(invoiceId) {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) { alert('Invoice not found'); return; }
    
    const client = clients.find(c => c.id === invoice.clientId);
    if (!client) { alert('Client not found'); return; }
    
    const entries = timeEntries.filter(e => invoice.entries.includes(e.id));
    
    if (typeof window.jspdf === 'undefined') {
        alert('PDF library is still loading. Please try again in a moment.');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(24);
    doc.setTextColor(41, 128, 185);
    doc.text(companyInfo.name, 20, 25);
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(companyInfo.email, 20, 35);
    doc.text(companyInfo.phone, 20, 42);
    doc.text(companyInfo.address, 20, 49);
    
    doc.setFontSize(26);
    doc.setTextColor(0, 0, 0);
    doc.text('INVOICE', 140, 35);
    
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 140, 48);
    doc.text(`Date: ${invoice.date}`, 140, 55);
    doc.text(`Status: ${invoice.status.toUpperCase()}`, 140, 62);
    
    // Bill To
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Bill To:', 20, 85);
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(client.name, 20, 95);
    doc.text(client.email, 20, 103);
    
    // Items table
    const tableData = entries.map(entry => [
        entry.description,
        entry.duration + ' hrs',
        `$${client.rate}/hr`,
        `$${(entry.duration * client.rate).toFixed(2)}`
    ]);
    
    doc.autoTable({
        startY: 118,
        head: [['Description', 'Hours', 'Rate', 'Amount']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
        margin: { left: 20, right: 20 }
    });
    
    const finalY = doc.lastAutoTable.finalY + 10;
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text('TOTAL:', 140, finalY);
    doc.text(`$${invoice.amount.toFixed(2)}`, 175, finalY, { align: 'right' });
    doc.setFont(undefined, 'normal');
    
    if (invoice.notes) {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Notes:', 20, finalY + 15);
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        const splitNotes = doc.splitTextToSize(invoice.notes, 170);
        doc.text(splitNotes, 20, finalY + 23);
    }
    
    // Payment Instructions
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text('Payment Instructions:', 20, 250);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(80, 80, 80);
    
    let paymentY = 258;
    doc.text(`Bank: ${companyInfo.bankName}`, 20, paymentY);
    doc.text(`Account Name: ${companyInfo.accountName}`, 20, paymentY + 7);
    doc.text(`Account Number: ${companyInfo.accountNumber}`, 20, paymentY + 14);
    doc.text(`Routing Number: ${companyInfo.routingNumber}`, 20, paymentY + 21);
    doc.text(companyInfo.paymentInstructions, 20, paymentY + 32);
    doc.text(`Tax ID: ${companyInfo.taxId}`, 20, paymentY + 42);
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for your business!', 20, 280);
    
    doc.save(`Invoice_${invoice.invoiceNumber}_${client.name.replace(/\s/g, '_')}.pdf`);
}

// ============================================
// QUICK INVOICE GENERATOR FUNCTIONS
// ============================================

function renderQuickInvoiceItems() {
    const container = document.getElementById('qiItemsContainer');
    container.innerHTML = '';
    quickInvoiceItems.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'item-row';
        div.innerHTML = `
            <input type="text" class="item-desc" placeholder="Description" value="${escapeHtml(item.desc)}" data-index="${index}" data-field="desc">
            <input type="number" class="item-qty" placeholder="Qty" value="${item.qty}" data-index="${index}" data-field="qty">
            <input type="number" class="item-price" placeholder="Price" value="${item.price}" data-index="${index}" data-field="price">
            <button class="remove-item-btn" data-index="${index}" style="background:#dc3545; color:white; border:none; border-radius:8px; padding:8px 12px; cursor:pointer;">✕</button>
        `;
        container.appendChild(div);
    });
    
    document.querySelectorAll('#qiItemsContainer input').forEach(input => {
        input.addEventListener('change', (e) => {
            const idx = parseInt(e.target.dataset.index);
            const field = e.target.dataset.field;
            if (quickInvoiceItems[idx]) {
                if (field === 'qty' || field === 'price') {
                    quickInvoiceItems[idx][field] = parseFloat(e.target.value) || 0;
                } else {
                    quickInvoiceItems[idx][field] = e.target.value;
                }
            }
        });
    });
    
    document.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(btn.dataset.index);
            if (quickInvoiceItems.length > 1) {
                quickInvoiceItems.splice(idx, 1);
            } else {
                quickInvoiceItems[0] = { desc: '', qty: 1, price: 0 };
            }
            renderQuickInvoiceItems();
        });
    });
}

function addQuickInvoiceItem() {
    quickInvoiceItems.push({ desc: '', qty: 1, price: 0 });
    renderQuickInvoiceItems();
}

function calculateQuickInvoiceTotal() {
    let subtotal = 0;
    quickInvoiceItems.forEach(item => {
        subtotal += (item.qty || 0) * (item.price || 0);
    });
    
    const taxRate = parseFloat(document.getElementById('qiTaxRate')?.value) || 0;
    const discount = parseFloat(document.getElementById('qiDiscount')?.value) || 0;
    
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax - discount;
    
    return { subtotal, tax, discount, total };
}

function previewQuickInvoice() {
    const clientName = document.getElementById('qiClientName').value;
    if (!clientName) {
        alert('Please enter client name');
        return;
    }
    
    const currency = document.getElementById('qiCurrency')?.value || '$';
    const { subtotal, tax, discount, total } = calculateQuickInvoiceTotal();
    
    const itemsHtml = quickInvoiceItems.filter(i => i.desc).map(item => `
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${escapeHtml(item.desc)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.qty}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${currency}${(item.price || 0).toFixed(2)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${currency}${(item.qty * item.price).toFixed(2)}</td>
        </tr>
    `).join('');
    
    const previewHtml = `
        <div style="max-width: 500px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h3>${companyInfo.name}</h3>
                <p style="font-size: 12px;">${companyInfo.email} | ${companyInfo.phone}<br>${companyInfo.address}</p>
            </div>
            <div style="border-top: 2px solid #1a73e8; margin: 10px 0;"></div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <div>
                    <strong>Bill To:</strong><br>
                    ${escapeHtml(clientName)}<br>
                    ${escapeHtml(document.getElementById('qiClientEmail').value || '')}<br>
                    ${escapeHtml(document.getElementById('qiClientAddress').value || '')}
                </div>
                <div style="text-align: right;">
                    <strong>Invoice #:</strong> ${document.getElementById('qiInvoiceNumber').value || 'Auto'}<br>
                    <strong>Date:</strong> ${document.getElementById('qiIssueDate').value || 'Not set'}<br>
                    <strong>Due:</strong> ${document.getElementById('qiDueDate').value || 'Not set'}
                </div>
            </div>
            <table style="width: 100%; border-collapse: collapse;">
                <thead><tr style="background: #1a73e8; color: white;">
                    <th style="padding: 8px; text-align: left;">Item</th>
                    <th style="padding: 8px; text-align: center;">Qty</th>
                    <th style="padding: 8px; text-align: right;">Price</th>
                    <th style="padding: 8px; text-align: right;">Total</th>
                </tr></thead>
                <tbody>${itemsHtml || '<tr><td colspan="4" style="text-align:center;">No items added</td></tr>'}</tbody>
            </table>
            <div style="margin-top: 20px; text-align: right;">
                <p>Subtotal: ${currency}${subtotal.toFixed(2)}</p>
                ${tax > 0 ? `<p>Tax (${document.getElementById('qiTaxRate').value}%): ${currency}${tax.toFixed(2)}</p>` : ''}
                ${discount > 0 ? `<p>Discount: -${currency}${discount.toFixed(2)}</p>` : ''}
                <p><strong>Total: ${currency}${total.toFixed(2)}</strong></p>
            </div>
            ${document.getElementById('qiNotes').value ? `<div style="margin-top: 20px; padding: 10px; background: #f0f0f0; border-radius: 8px;"><strong>Notes:</strong><br>${escapeHtml(document.getElementById('qiNotes').value)}</div>` : ''}
        </div>
    `;
    
    document.getElementById('qiPreviewContent').innerHTML = previewHtml;
    document.getElementById('qiPreview').style.display = 'block';
}

async function generateQuickInvoicePDF() {
    const clientName = document.getElementById('qiClientName').value;
    if (!clientName) {
        alert('Please enter client name');
        return;
    }
    
    const validItems = quickInvoiceItems.filter(item => item.desc && item.price > 0);
    if (validItems.length === 0) {
        alert('Please add at least one item with description and price');
        return;
    }
    
    if (typeof window.jspdf === 'undefined') {
        alert('PDF library is still loading. Please try again in a moment.');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const invoiceNumber = document.getElementById('qiInvoiceNumber').value || `INV-${String(invoices.length + 1).padStart(3, '0')}`;
    const issueDate = document.getElementById('qiIssueDate').value || getTodayDate();
    const dueDate = document.getElementById('qiDueDate').value || '';
    const clientEmail = document.getElementById('qiClientEmail').value;
    const clientAddress = document.getElementById('qiClientAddress').value;
    const notes = document.getElementById('qiNotes').value;
    const taxRate = parseFloat(document.getElementById('qiTaxRate').value) || 0;
    const discount = parseFloat(document.getElementById('qiDiscount').value) || 0;
    const currency = document.getElementById('qiCurrency')?.value || '$';
    
    const { subtotal, tax, discount: disc, total } = calculateQuickInvoiceTotal();
    
    // Header
    doc.setFontSize(24);
    doc.setTextColor(41, 128, 185);
    doc.text(companyInfo.name, 20, 25);
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(companyInfo.email, 20, 35);
    doc.text(companyInfo.phone, 20, 42);
    doc.text(companyInfo.address, 20, 49);
    
    doc.setFontSize(26);
    doc.setTextColor(0, 0, 0);
    doc.text('INVOICE', 140, 35);
    
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Invoice #: ${invoiceNumber}`, 140, 48);
    doc.text(`Issue Date: ${issueDate}`, 140, 55);
    if (dueDate) doc.text(`Due Date: ${dueDate}`, 140, 62);
    
    // Bill To
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Bill To:', 20, 85);
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(clientName, 20, 95);
    if (clientEmail) doc.text(clientEmail, 20, 103);
    if (clientAddress) {
        const splitAddress = doc.splitTextToSize(clientAddress, 80);
        doc.text(splitAddress, 20, 111);
    }
    
    // Items table
    const tableData = quickInvoiceItems
        .filter(item => item.desc)
        .map(item => [
            item.desc,
            item.qty.toString(),
            `${currency}${(item.price || 0).toFixed(2)}`,
            `${currency}${(item.qty * item.price).toFixed(2)}`
        ]);
    
    let startY = clientAddress ? 125 : 115;
    
    doc.autoTable({
        startY: startY,
        head: [['Description', 'Quantity', 'Unit Price', 'Amount']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
        margin: { left: 20, right: 20 },
        columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 30, halign: 'center' },
            2: { cellWidth: 35, halign: 'right' },
            3: { cellWidth: 35, halign: 'right' }
        }
    });
    
    const finalY = doc.lastAutoTable.finalY + 10;
    
    // Totals
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Subtotal:', 140, finalY);
    doc.text(`${currency}${subtotal.toFixed(2)}`, 175, finalY, { align: 'right' });
    
    let currentY = finalY + 8;
    if (taxRate > 0) {
        doc.text(`Tax (${taxRate}%):`, 140, currentY);
        doc.text(`${currency}${tax.toFixed(2)}`, 175, currentY, { align: 'right' });
        currentY += 8;
    }
    if (discount > 0) {
        doc.text('Discount:', 140, currentY);
        doc.text(`-${currency}${discount.toFixed(2)}`, 175, currentY, { align: 'right' });
        currentY += 8;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text('TOTAL:', 140, currentY);
    doc.text(`${currency}${total.toFixed(2)}`, 175, currentY, { align: 'right' });
    doc.setFont(undefined, 'normal');
    
    // Notes
    if (notes) {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Notes:', 20, currentY + 15);
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        const splitNotes = doc.splitTextToSize(notes, 170);
        doc.text(splitNotes, 20, currentY + 23);
    }
    
    // Payment Instructions
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text('Payment Instructions:', 20, 250);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(80, 80, 80);
    
    let paymentY = 258;
    doc.text(`Bank: ${companyInfo.bankName}`, 20, paymentY);
    doc.text(`Account Name: ${companyInfo.accountName}`, 20, paymentY + 7);
    doc.text(`Account Number: ${companyInfo.accountNumber}`, 20, paymentY + 14);
    doc.text(`Routing Number: ${companyInfo.routingNumber}`, 20, paymentY + 21);
    doc.text(companyInfo.paymentInstructions, 20, paymentY + 32);
    doc.text(`Tax ID: ${companyInfo.taxId}`, 20, paymentY + 42);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for your business!', 20, 280);
    doc.text(`Generated by ${companyInfo.name}`, 20, 288);
    
    // Save
    doc.save(`${invoiceNumber}_${clientName.replace(/\s/g, '_')}.pdf`);
    
    // Save to history
    const saveToHistory = confirm('Save this invoice to your history?');
    if (saveToHistory) {
        const newInvoice = {
            id: Date.now(),
            invoiceNumber: invoiceNumber,
            clientId: null,
            clientName: clientName,
            clientEmail: clientEmail,
            amount: total,
            status: 'unpaid',
            date: issueDate,
            dueDate: dueDate,
            entries: [],
            notes: notes,
            items: quickInvoiceItems.filter(i => i.desc),
            taxRate: taxRate,
            discount: discount,
            currency: currency
        };
        invoices.push(newInvoice);
        saveAll();
        refreshInvoicesTable();
        alert('Invoice saved to history!');
    }
}

function resetQuickInvoiceForm() {
    document.getElementById('qiClientName').value = '';
    document.getElementById('qiClientEmail').value = '';
    document.getElementById('qiClientAddress').value = '';
    document.getElementById('qiInvoiceNumber').value = '';
    document.getElementById('qiIssueDate').value = getTodayDate();
    document.getElementById('qiDueDate').value = '';
    document.getElementById('qiNotes').value = 'Payment due within 30 days. Thank you for your business!';
    document.getElementById('qiTaxRate').value = '0';
    document.getElementById('qiDiscount').value = '0';
    document.getElementById('qiCurrency').value = '$';
    quickInvoiceItems = [{ desc: '', qty: 1, price: 0 }];
    renderQuickInvoiceItems();
    document.getElementById('qiPreview').style.display = 'none';
}

// Export/Import functions
function exportData() {
    const data = {
        clients: clients,
        timeEntries: timeEntries,
        invoices: invoices,
        companyInfo: companyInfo,
        exportDate: new Date().toISOString()
    };
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `freelance_backup_${getTodayDate()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.clients) clients = data.clients;
            if (data.timeEntries) timeEntries = data.timeEntries;
            if (data.invoices) invoices = data.invoices;
            if (data.companyInfo) companyInfo = data.companyInfo;
            saveAll();
            refreshAll();
            alert('Data imported successfully!');
        } catch (err) {
            alert('Invalid file');
        }
    };
    reader.readAsText(file);
}

// Tab switching
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

// Initialize Quick Invoice
function initQuickInvoice() {
    document.getElementById('qiIssueDate').value = getTodayDate();
    renderQuickInvoiceItems();
    
    document.getElementById('qiAddItemBtn')?.addEventListener('click', addQuickInvoiceItem);
    document.getElementById('qiPreviewBtn')?.addEventListener('click', previewQuickInvoice);
    document.getElementById('qiGeneratePDFBtn')?.addEventListener('click', generateQuickInvoicePDF);
    document.getElementById('qiResetBtn')?.addEventListener('click', resetQuickInvoiceForm);
}

// Event listeners
function initEventListeners() {
    document.getElementById('startTimerBtn')?.addEventListener('click', startTimer);
    document.getElementById('stopTimerBtn')?.addEventListener('click', stopTimer);
    document.getElementById('addClientBtn')?.addEventListener('click', openAddClientModal);
    document.getElementById('saveClientBtn')?.addEventListener('click', addClient);
    document.getElementById('closeClientModalBtn')?.addEventListener('click', closeClientModal);
    document.getElementById('createInvoiceBtn')?.addEventListener('click', openCreateInvoiceModal);
    document.getElementById('generateInvoiceBtn')?.addEventListener('click', generateInvoiceFromTimeEntries);
    document.getElementById('closeInvoiceModalBtn')?.addEventListener('click', closeInvoiceModal);
    document.getElementById('invoiceClientSelect')?.addEventListener('change', loadUnpaidEntries);
    document.getElementById('exportDataBtn')?.addEventListener('click', exportData);
    document.getElementById('importDataBtn')?.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => importData(e.target.files[0]);
        input.click();
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// Initialize app
function init() {
    loadData();
    initTabs();
    initEventListeners();
    initQuickInvoice();
}

// Start the app
init();