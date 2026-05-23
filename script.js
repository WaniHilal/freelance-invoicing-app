// Data storage
let clients = [];
let timeEntries = [];
let invoices = [];
let timerInterval = null;
let timerRunning = false;
let timerSeconds = 0;
let activeTimerProject = null;
let activeTimerDesc = '';
let currentLanguage = 'en';

// Multi-language translations
const translations = {
    en: {
        appTitle: '💰 Freelance Pro',
        appSubtitle: 'Time tracking + Invoicing for freelancers',
        exportData: '📤 Export Data',
        importData: '📥 Import Data',
        totalHoursLabel: 'Total Hours (This Month)',
        unpaidAmountLabel: 'Unpaid Amount',
        paidAmountLabel: 'Paid Amount',
        activeProjectsLabel: 'Active Projects',
        timerTab: '⏱️ Time Tracker',
        quickInvoiceTab: '⚡ Quick Invoice',
        invoicesTab: '📄 Invoices',
        clientsTab: '👥 Clients',
        entriesTab: '📋 Time Entries',
        activeTimer: '⏱️ Active Timer',
        selectProject: 'Select project/client...',
        start: '▶️ Start',
        stop: '⏸️ Stop',
        recentEntries: 'Recent Time Entries',
        project: 'Project',
        description: 'Description',
        duration: 'Duration',
        date: 'Date',
        action: 'Action',
        quickInvoiceTitle: '⚡ Create Invoice in Seconds',
        quickInvoiceDesc: 'No time tracking needed. Just add items and generate PDF.',
        clientDetails: 'Client Details',
        clientName: 'Client Name *',
        clientEmail: 'Client Email',
        clientAddress: 'Client Address (Optional)',
        invoiceDetails: 'Invoice Details',
        invoiceNumber: 'Invoice Number',
        issueDate: 'Issue Date',
        dueDate: 'Due Date',
        itemsServices: 'Items / Services',
        addItem: '+ Add Item',
        additionalInfo: 'Additional Information',
        currency: 'Currency',
        taxRate: 'Tax Rate (%)',
        discount: 'Discount',
        notes: 'Notes / Payment Terms',
        preview: '👁️ Preview',
        generatePDF: '📄 Generate & Download PDF',
        reset: '⟳ Reset Form',
        invoicePreview: '📄 Invoice Preview',
        createInvoice: '+ Create Invoice from Time Entries',
        invoiceNum: 'Invoice #',
        client: 'Client',
        amount: 'Amount',
        status: 'Status',
        actions: 'Actions',
        addClient: '+ Add Client',
        hourlyRate: 'Hourly Rate',
        allTimeEntries: 'All Time Entries',
        durationHours: 'Duration (hours)',
        invoiced: 'Invoiced',
        createInvoiceTitle: 'Create Invoice from Time Entries',
        selectClient: 'Select Client',
        selectEntries: 'Select Time Entries',
        additionalNotes: 'Additional Notes',
        generateInvoice: 'Generate Invoice',
        cancel: 'Cancel',
        addClientTitle: 'Add Client',
        save: 'Save Client',
        yes: 'Yes',
        no: 'No',
        delete: 'Delete',
        view: 'View',
        markPaid: 'Mark Paid',
        paid: 'paid',
        unpaid: 'unpaid'
    },
    es: {
        appTitle: '💰 Freelance Pro',
        appSubtitle: 'Seguimiento de tiempo + Facturación para freelancers',
        exportData: '📤 Exportar Datos',
        importData: '📥 Importar Datos',
        totalHoursLabel: 'Horas Totales (Este Mes)',
        unpaidAmountLabel: 'Monto Pendiente',
        paidAmountLabel: 'Monto Pagado',
        activeProjectsLabel: 'Proyectos Activos',
        timerTab: '⏱️ Temporizador',
        quickInvoiceTab: '⚡ Factura Rápida',
        invoicesTab: '📄 Facturas',
        clientsTab: '👥 Clientes',
        entriesTab: '📋 Registros',
        activeTimer: '⏱️ Temporizador Activo',
        selectProject: 'Seleccionar proyecto/cliente...',
        start: '▶️ Iniciar',
        stop: '⏸️ Detener',
        recentEntries: 'Registros Recientes',
        project: 'Proyecto',
        description: 'Descripción',
        duration: 'Duración',
        date: 'Fecha',
        action: 'Acción',
        quickInvoiceTitle: '⚡ Crea Factura en Segundos',
        quickInvoiceDesc: 'No necesitas seguimiento de tiempo. Solo agrega items y genera PDF.',
        clientDetails: 'Detalles del Cliente',
        clientName: 'Nombre del Cliente *',
        clientEmail: 'Correo del Cliente',
        clientAddress: 'Dirección del Cliente (Opcional)',
        invoiceDetails: 'Detalles de Factura',
        invoiceNumber: 'Número de Factura',
        issueDate: 'Fecha de Emisión',
        dueDate: 'Fecha de Vencimiento',
        itemsServices: 'Items / Servicios',
        addItem: '+ Agregar Item',
        additionalInfo: 'Información Adicional',
        currency: 'Moneda',
        taxRate: 'Tasa de Impuesto (%)',
        discount: 'Descuento',
        notes: 'Notas / Términos de Pago',
        preview: '👁️ Vista Previa',
        generatePDF: '📄 Generar y Descargar PDF',
        reset: '⟳ Reiniciar Formulario',
        invoicePreview: '📄 Vista Previa de Factura',
        createInvoice: '+ Crear Factura desde Registros',
        invoiceNum: 'Factura #',
        client: 'Cliente',
        amount: 'Monto',
        status: 'Estado',
        actions: 'Acciones',
        addClient: '+ Agregar Cliente',
        hourlyRate: 'Tarifa por Hora',
        allTimeEntries: 'Todos los Registros',
        durationHours: 'Duración (horas)',
        invoiced: 'Facturado',
        createInvoiceTitle: 'Crear Factura desde Registros',
        selectClient: 'Seleccionar Cliente',
        selectEntries: 'Seleccionar Registros',
        additionalNotes: 'Notas Adicionales',
        generateInvoice: 'Generar Factura',
        cancel: 'Cancelar',
        addClientTitle: 'Agregar Cliente',
        save: 'Guardar Cliente',
        yes: 'Sí',
        no: 'No',
        delete: 'Eliminar',
        view: 'Ver',
        markPaid: 'Marcar Pagado',
        paid: 'pagado',
        unpaid: 'pendiente'
    },
    fr: {
        appTitle: '💰 Freelance Pro',
        appSubtitle: 'Suivi du temps + Facturation pour freelances',
        exportData: '📤 Exporter les données',
        importData: '📥 Importer les données',
        totalHoursLabel: 'Heures totales (ce mois)',
        unpaidAmountLabel: 'Montant impayé',
        paidAmountLabel: 'Montant payé',
        activeProjectsLabel: 'Projets actifs',
        timerTab: '⏱️ Chronomètre',
        quickInvoiceTab: '⚡ Facture rapide',
        invoicesTab: '📄 Factures',
        clientsTab: '👥 Clients',
        entriesTab: '📋 Entrées',
        activeTimer: '⏱️ Chronomètre actif',
        selectProject: 'Sélectionner un projet/client...',
        start: '▶️ Démarrer',
        stop: '⏸️ Arrêter',
        recentEntries: 'Entrées récentes',
        project: 'Projet',
        description: 'Description',
        duration: 'Durée',
        date: 'Date',
        action: 'Action',
        quickInvoiceTitle: '⚡ Créer une facture en quelques secondes',
        quickInvoiceDesc: "Pas de suivi du temps nécessaire. Ajoutez des articles et générez un PDF.",
        clientDetails: 'Coordonnées du client',
        clientName: 'Nom du client *',
        clientEmail: 'Email du client',
        clientAddress: 'Adresse du client (optionnel)',
        invoiceDetails: 'Détails de la facture',
        invoiceNumber: 'Numéro de facture',
        issueDate: "Date d'émission",
        dueDate: 'Date déchéance',
        itemsServices: 'Articles / Services',
        addItem: "+ Ajouter un article",
        additionalInfo: 'Informations complémentaires',
        currency: 'Devise',
        taxRate: "Taux d'imposition (%)",
        discount: 'Remise',
        notes: 'Notes / Conditions de paiement',
        preview: '👁️ Aperçu',
        generatePDF: '📄 Générer et télécharger le PDF',
        reset: '⟳ Réinitialiser',
        invoicePreview: '📄 Aperçu de la facture',
        createInvoice: '+ Créer une facture à partir des entrées',
        invoiceNum: 'Facture #',
        client: 'Client',
        amount: 'Montant',
        status: 'Statut',
        actions: 'Actions',
        addClient: '+ Ajouter un client',
        hourlyRate: 'Tarif horaire',
        allTimeEntries: 'Toutes les entrées',
        durationHours: 'Durée (heures)',
        invoiced: 'Facturé',
        createInvoiceTitle: 'Créer une facture à partir des entrées',
        selectClient: 'Sélectionner un client',
        selectEntries: 'Sélectionner les entrées',
        additionalNotes: 'Notes supplémentaires',
        generateInvoice: 'Générer la facture',
        cancel: 'Annuler',
        addClientTitle: 'Ajouter un client',
        save: 'Enregistrer',
        yes: 'Oui',
        no: 'Non',
        delete: 'Supprimer',
        view: 'Voir',
        markPaid: 'Marquer comme payé',
        paid: 'payé',
        unpaid: 'impayé'
    },
    de: {
        appTitle: '💰 Freelance Pro',
        appSubtitle: 'Zeiterfassung + Rechnungsstellung für Freiberufler',
        exportData: '📤 Daten exportieren',
        importData: '📥 Daten importieren',
        totalHoursLabel: 'Gesamtstunden (diesen Monat)',
        unpaidAmountLabel: 'Offener Betrag',
        paidAmountLabel: 'Bezahlter Betrag',
        activeProjectsLabel: 'Aktive Projekte',
        timerTab: '⏱️ Zeiterfassung',
        quickInvoiceTab: '⚡ Schnellrechnung',
        invoicesTab: '📄 Rechnungen',
        clientsTab: '👥 Kunden',
        entriesTab: '📋 Einträge',
        activeTimer: '⏱️ Aktiver Timer',
        selectProject: 'Projekt/Kunde auswählen...',
        start: '▶️ Start',
        stop: '⏸️ Stopp',
        recentEntries: 'Letzte Einträge',
        project: 'Projekt',
        description: 'Beschreibung',
        duration: 'Dauer',
        date: 'Datum',
        action: 'Aktion',
        quickInvoiceTitle: '⚡ Rechnung in Sekunden erstellen',
        quickInvoiceDesc: 'Keine Zeiterfassung nötig. Einfach Positionen hinzufügen und PDF generieren.',
        clientDetails: 'Kundendetails',
        clientName: 'Kundenname *',
        clientEmail: 'Kunden-E-Mail',
        clientAddress: 'Kundenadresse (optional)',
        invoiceDetails: 'Rechnungsdetails',
        invoiceNumber: 'Rechnungsnummer',
        issueDate: 'Ausstellungsdatum',
        dueDate: 'Fälligkeitsdatum',
        itemsServices: 'Positionen / Dienstleistungen',
        addItem: '+ Position hinzufügen',
        additionalInfo: 'Zusätzliche Informationen',
        currency: 'Währung',
        taxRate: 'Steuersatz (%)',
        discount: 'Rabatt',
        notes: 'Notizen / Zahlungsbedingungen',
        preview: '👁️ Vorschau',
        generatePDF: '📄 PDF generieren & herunterladen',
        reset: '⟳ Formular zurücksetzen',
        invoicePreview: '📄 Rechnungsvorschau',
        createInvoice: '+ Rechnung aus Zeiteinträgen erstellen',
        invoiceNum: 'Rechnung #',
        client: 'Kunde',
        amount: 'Betrag',
        status: 'Status',
        actions: 'Aktionen',
        addClient: '+ Kunde hinzufügen',
        hourlyRate: 'Stundensatz',
        allTimeEntries: 'Alle Zeiteinträge',
        durationHours: 'Dauer (Stunden)',
        invoiced: 'Abgerechnet',
        createInvoiceTitle: 'Rechnung aus Zeiteinträgen erstellen',
        selectClient: 'Kunde auswählen',
        selectEntries: 'Zeiteinträge auswählen',
        additionalNotes: 'Zusätzliche Notizen',
        generateInvoice: 'Rechnung erstellen',
        cancel: 'Abbrechen',
        addClientTitle: 'Kunde hinzufügen',
        save: 'Speichern',
        yes: 'Ja',
        no: 'Nein',
        delete: 'Löschen',
        view: 'Ansehen',
        markPaid: 'Als bezahlt markieren',
        paid: 'bezahlt',
        unpaid: 'offen'
    },
    hi: {
        appTitle: '💰 फ्रीलांस प्रो',
        appSubtitle: 'समय ट्रैकिंग + फ्रीलांसरों के लिए इनवॉइसिंग',
        exportData: '📤 डेटा निर्यात करें',
        importData: '📥 डेटा आयात करें',
        totalHoursLabel: 'कुल घंटे (इस महीने)',
        unpaidAmountLabel: 'बकाया राशि',
        paidAmountLabel: 'भुगतान राशि',
        activeProjectsLabel: 'सक्रिय परियोजनाएं',
        timerTab: '⏱️ टाइमर',
        quickInvoiceTab: '⚡ त्वरित इनवॉइस',
        invoicesTab: '📄 इनवॉइस',
        clientsTab: '👥 ग्राहक',
        entriesTab: '📋 प्रविष्टियाँ',
        activeTimer: '⏱️ सक्रिय टाइमर',
        selectProject: 'परियोजना/ग्राहक चुनें...',
        start: '▶️ शुरू करें',
        stop: '⏸️ रोकें',
        recentEntries: 'हाल की प्रविष्टियाँ',
        project: 'परियोजना',
        description: 'विवरण',
        duration: 'अवधि',
        date: 'तारीख',
        action: 'कार्रवाई',
        quickInvoiceTitle: '⚡ सेकंडों में इनवॉइस बनाएं',
        quickInvoiceDesc: 'समय ट्रैकिंग की आवश्यकता नहीं। आइटम जोड़ें और पीडीएफ बनाएं।',
        clientDetails: 'ग्राहक विवरण',
        clientName: 'ग्राहक का नाम *',
        clientEmail: 'ग्राहक ईमेल',
        clientAddress: 'ग्राहक पता (वैकल्पिक)',
        invoiceDetails: 'इनवॉइस विवरण',
        invoiceNumber: 'इनवॉइस संख्या',
        issueDate: 'जारी करने की तारीख',
        dueDate: 'भुगतान तिथि',
        itemsServices: 'आइटम / सेवाएं',
        addItem: '+ आइटम जोड़ें',
        additionalInfo: 'अतिरिक्त जानकारी',
        currency: 'मुद्रा',
        taxRate: 'कर दर (%)',
        discount: 'छूट',
        notes: 'नोट्स / भुगतान शर्तें',
        preview: '👁️ पूर्वावलोकन',
        generatePDF: '📄 पीडीएफ बनाएं और डाउनलोड करें',
        reset: '⟳ फॉर्म रीसेट करें',
        invoicePreview: '📄 इनवॉइस पूर्वावलोकन',
        createInvoice: '+ समय प्रविष्टियों से इनवॉइस बनाएं',
        invoiceNum: 'इनवॉइस #',
        client: 'ग्राहक',
        amount: 'राशि',
        status: 'स्थिति',
        actions: 'कार्रवाई',
        addClient: '+ ग्राहक जोड़ें',
        hourlyRate: 'प्रति घंटा दर',
        allTimeEntries: 'सभी समय प्रविष्टियाँ',
        durationHours: 'अवधि (घंटे)',
        invoiced: 'बिल भेजा गया',
        createInvoiceTitle: 'समय प्रविष्टियों से इनवॉइस बनाएं',
        selectClient: 'ग्राहक चुनें',
        selectEntries: 'समय प्रविष्टियाँ चुनें',
        additionalNotes: 'अतिरिक्त नोट्स',
        generateInvoice: 'इनवॉइस बनाएं',
        cancel: 'रद्द करें',
        addClientTitle: 'ग्राहक जोड़ें',
        save: 'सहेजें',
        yes: 'हाँ',
        no: 'नहीं',
        delete: 'हटाएं',
        view: 'देखें',
        markPaid: 'भुगतान चिह्नित करें',
        paid: 'भुगतान किया',
        unpaid: 'बकाया'
    },
    ar: {
        appTitle: '💰 فريلانسر برو',
        appSubtitle: 'تتبع الوقت + إصدار الفواتير للمستقلين',
        exportData: '📤 تصدير البيانات',
        importData: '📥 استيراد البيانات',
        totalHoursLabel: 'إجمالي الساعات (هذا الشهر)',
        unpaidAmountLabel: 'المبلغ غير المدفوع',
        paidAmountLabel: 'المبلغ المدفوع',
        activeProjectsLabel: 'المشاريع النشطة',
        timerTab: '⏱️ المؤقت',
        quickInvoiceTab: '⚡ فاتورة سريعة',
        invoicesTab: '📄 الفواتير',
        clientsTab: '👥 العملاء',
        entriesTab: '📋 الإدخالات',
        activeTimer: '⏱️ المؤقت النشط',
        selectProject: 'اختر مشروع/عميل...',
        start: '▶️ بدء',
        stop: '⏸️ إيقاف',
        recentEntries: 'الإدخالات الأخيرة',
        project: 'المشروع',
        description: 'الوصف',
        duration: 'المدة',
        date: 'التاريخ',
        action: 'إجراء',
        quickInvoiceTitle: '⚡ إنشاء فاتورة في ثوانٍ',
        quickInvoiceDesc: 'لا حاجة لتتبع الوقت. فقط أضف العناصر وأنشئ PDF.',
        clientDetails: 'تفاصيل العميل',
        clientName: 'اسم العميل *',
        clientEmail: 'بريد العميل الإلكتروني',
        clientAddress: 'عنوان العميل (اختياري)',
        invoiceDetails: 'تفاصيل الفاتورة',
        invoiceNumber: 'رقم الفاتورة',
        issueDate: 'تاريخ الإصدار',
        dueDate: 'تاريخ الاستحقاق',
        itemsServices: 'العناصر / الخدمات',
        addItem: '+ إضافة عنصر',
        additionalInfo: 'معلومات إضافية',
        currency: 'العملة',
        taxRate: 'نسبة الضريبة (%)',
        discount: 'الخصم',
        notes: 'ملاحظات / شروط الدفع',
        preview: '👁️ معاينة',
        generatePDF: '📄 إنشاء وتحميل PDF',
        reset: '⟳ إعادة تعيين النموذج',
        invoicePreview: '📄 معاينة الفاتورة',
        createInvoice: '+ إنشاء فاتورة من إدخالات الوقت',
        invoiceNum: 'الفاتورة #',
        client: 'العميل',
        amount: 'المبلغ',
        status: 'الحالة',
        actions: 'الإجراءات',
        addClient: '+ إضافة عميل',
        hourlyRate: 'السعر بالساعة',
        allTimeEntries: 'جميع إدخالات الوقت',
        durationHours: 'المدة (ساعات)',
        invoiced: 'تم الفوترة',
        createInvoiceTitle: 'إنشاء فاتورة من إدخالات الوقت',
        selectClient: 'اختر العميل',
        selectEntries: 'اختر إدخالات الوقت',
        additionalNotes: 'ملاحظات إضافية',
        generateInvoice: 'إنشاء الفاتورة',
        cancel: 'إلغاء',
        addClientTitle: 'إضافة عميل',
        save: 'حفظ',
        yes: 'نعم',
        no: 'لا',
        delete: 'حذف',
        view: 'عرض',
        markPaid: 'تحديد كمدفوع',
        paid: 'مدفوع',
        unpaid: 'غير مدفوع'
    },
    zh: {
        appTitle: '💰 自由职业者专业版',
        appSubtitle: '自由职业者的时间跟踪 + 发票管理',
        exportData: '📤 导出数据',
        importData: '📥 导入数据',
        totalHoursLabel: '总小时数（本月）',
        unpaidAmountLabel: '未付金额',
        paidAmountLabel: '已付金额',
        activeProjectsLabel: '活跃项目',
        timerTab: '⏱️ 计时器',
        quickInvoiceTab: '⚡ 快速发票',
        invoicesTab: '📄 发票',
        clientsTab: '👥 客户',
        entriesTab: '📋 记录',
        activeTimer: '⏱️ 活跃计时器',
        selectProject: '选择项目/客户...',
        start: '▶️ 开始',
        stop: '⏸️ 停止',
        recentEntries: '最近记录',
        project: '项目',
        description: '描述',
        duration: '时长',
        date: '日期',
        action: '操作',
        quickInvoiceTitle: '⚡ 秒速创建发票',
        quickInvoiceDesc: '无需时间跟踪。只需添加项目并生成PDF。',
        clientDetails: '客户详情',
        clientName: '客户名称 *',
        clientEmail: '客户邮箱',
        clientAddress: '客户地址（可选）',
        invoiceDetails: '发票详情',
        invoiceNumber: '发票号码',
        issueDate: '签发日期',
        dueDate: '到期日期',
        itemsServices: '项目/服务',
        addItem: '+ 添加项目',
        additionalInfo: '附加信息',
        currency: '货币',
        taxRate: '税率 (%)',
        discount: '折扣',
        notes: '备注 / 付款条款',
        preview: '👁️ 预览',
        generatePDF: '📄 生成并下载PDF',
        reset: '⟳ 重置表单',
        invoicePreview: '📄 发票预览',
        createInvoice: '+ 从时间记录创建发票',
        invoiceNum: '发票 #',
        client: '客户',
        amount: '金额',
        status: '状态',
        actions: '操作',
        addClient: '+ 添加客户',
        hourlyRate: '时薪',
        allTimeEntries: '所有时间记录',
        durationHours: '时长（小时）',
        invoiced: '已开票',
        createInvoiceTitle: '从时间记录创建发票',
        selectClient: '选择客户',
        selectEntries: '选择时间记录',
        additionalNotes: '附加备注',
        generateInvoice: '生成发票',
        cancel: '取消',
        addClientTitle: '添加客户',
        save: '保存',
        yes: '是',
        no: '否',
        delete: '删除',
        view: '查看',
        markPaid: '标记为已付',
        paid: '已付',
        unpaid: '未付'
    },
    ru: {
        appTitle: '💰 Фриланс Про',
        appSubtitle: 'Отслеживание времени + Выставление счетов для фрилансеров',
        exportData: '📤 Экспорт данных',
        importData: '📥 Импорт данных',
        totalHoursLabel: 'Всего часов (за месяц)',
        unpaidAmountLabel: 'Неоплаченная сумма',
        paidAmountLabel: 'Оплаченная сумма',
        activeProjectsLabel: 'Активные проекты',
        timerTab: '⏱️ Таймер',
        quickInvoiceTab: '⚡ Быстрый счет',
        invoicesTab: '📄 Счета',
        clientsTab: '👥 Клиенты',
        entriesTab: '📋 Записи',
        activeTimer: '⏱️ Активный таймер',
        selectProject: 'Выберите проект/клиента...',
        start: '▶️ Старт',
        stop: '⏸️ Стоп',
        recentEntries: 'Последние записи',
        project: 'Проект',
        description: 'Описание',
        duration: 'Длительность',
        date: 'Дата',
        action: 'Действие',
        quickInvoiceTitle: '⚡ Создать счет за секунды',
        quickInvoiceDesc: 'Отслеживание времени не требуется. Просто добавьте позиции и создайте PDF.',
        clientDetails: 'Данные клиента',
        clientName: 'Имя клиента *',
        clientEmail: 'Email клиента',
        clientAddress: 'Адрес клиента (опционально)',
        invoiceDetails: 'Детали счета',
        invoiceNumber: 'Номер счета',
        issueDate: 'Дата выставления',
        dueDate: 'Срок оплаты',
        itemsServices: 'Позиции / Услуги',
        addItem: '+ Добавить позицию',
        additionalInfo: 'Дополнительная информация',
        currency: 'Валюта',
        taxRate: 'Налоговая ставка (%)',
        discount: 'Скидка',
        notes: 'Примечания / Условия оплаты',
        preview: '👁️ Предпросмотр',
        generatePDF: '📄 Создать и скачать PDF',
        reset: '⟳ Сбросить форму',
        invoicePreview: '📄 Предпросмотр счета',
        createInvoice: '+ Создать счет из записей времени',
        invoiceNum: 'Счет #',
        client: 'Клиент',
        amount: 'Сумма',
        status: 'Статус',
        actions: 'Действия',
        addClient: '+ Добавить клиента',
        hourlyRate: 'Почасовая ставка',
        allTimeEntries: 'Все записи времени',
        durationHours: 'Длительность (часы)',
        invoiced: 'Выставлен счет',
        createInvoiceTitle: 'Создать счет из записей времени',
        selectClient: 'Выберите клиента',
        selectEntries: 'Выберите записи времени',
        additionalNotes: 'Дополнительные примечания',
        generateInvoice: 'Создать счет',
        cancel: 'Отмена',
        addClientTitle: 'Добавить клиента',
        save: 'Сохранить',
        yes: 'Да',
        no: 'Нет',
        delete: 'Удалить',
        view: 'Просмотр',
        markPaid: 'Отметить как оплаченный',
        paid: 'оплачен',
        unpaid: 'не оплачен'
    }
};

// Company info for PDF
let companyInfo = {
    name: 'Freelance Pro',
    email: 'hello@freelancepro.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business St, Suite 100, New York, NY 10001',
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
    const savedLanguage = localStorage.getItem('freelance_language');
    
    if (savedClients) clients = JSON.parse(savedClients);
    if (savedEntries) timeEntries = JSON.parse(savedEntries);
    if (savedInvoices) invoices = JSON.parse(savedInvoices);
    if (savedCompany) companyInfo = JSON.parse(savedCompany);
    if (savedLanguage) currentLanguage = savedLanguage;
    
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
            { id: 1, invoiceNumber: 'INV-001', clientId: 1, amount: 337.5, status: 'paid', date: getTodayDate(), entries: [1], notes: 'Thanks for your business!', currency: '$' }
        ];
    }
    saveAll();
    refreshAll();
    updateUILanguage();
}

function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

function saveAll() {
    localStorage.setItem('freelance_clients', JSON.stringify(clients));
    localStorage.setItem('freelance_entries', JSON.stringify(timeEntries));
    localStorage.setItem('freelance_invoices', JSON.stringify(invoices));
    localStorage.setItem('freelance_company', JSON.stringify(companyInfo));
    localStorage.setItem('freelance_language', currentLanguage);
}

// Multi-language UI update
function updateUILanguage() {
    const t = translations[currentLanguage];
    if (!t) return;
    
    // Update all elements with data-key attribute
    document.querySelectorAll('[data-key]').forEach(el => {
        const key = el.getAttribute('data-key');
        if (t[key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                if (el.placeholder && t[key]) el.placeholder = t[key];
            } else {
                // Preserve emoji and icons
                const originalText = el.innerHTML;
                const hasIcon = originalText.match(/[📄👁️⟳💰⏱️⚡👥📋▶️⏸️➕]/);
                if (hasIcon) {
                    const iconMatch = originalText.match(/[📄👁️⟳💰⏱️⚡👥📋▶️⏸️➕]/);
                    el.innerHTML = iconMatch ? iconMatch[0] + ' ' + t[key] : t[key];
                } else {
                    el.innerHTML = t[key];
                }
            }
        }
    });
    
    // Update title and subtitle
    document.getElementById('appTitle').innerHTML = t.appTitle;
    document.getElementById('appSubtitle').innerHTML = t.appSubtitle;
    
    // Update select options placeholder
    const projectSelect = document.getElementById('projectSelect');
    if (projectSelect && projectSelect.options[0]) {
        projectSelect.options[0].text = t.selectProject;
    }
}

function refreshAll() {
    refreshStats();
    refreshProjectSelect();
    refreshRecentEntries();
    refreshInvoicesTable();
    refreshClientsTable();
    refreshAllEntriesTable();
    updateUILanguage();
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
    const t = translations[currentLanguage];
    const select = document.getElementById('projectSelect');
    select.innerHTML = `<option value="">${t.selectProject}</option>`;
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
            <td><button class="btn-danger" onclick="deleteEntry(${e.id})">${translations[currentLanguage].delete}</button></td>
        </tr>`;
    });
}

function refreshInvoicesTable() {
    const t = translations[currentLanguage];
    const tbody = document.getElementById('invoicesBody');
    tbody.innerHTML = '';
    invoices.forEach(inv => {
        const client = clients.find(c => c.id === inv.clientId);
        const currencySymbol = inv.currency || '$';
        tbody.innerHTML += `<tr>
            <td>${inv.invoiceNumber}</td>
            <td>${client?.name || inv.clientName || 'Unknown'}</td>
            <td>${currencySymbol}${inv.amount.toFixed(2)}</td>
            <td><span class="badge ${inv.status === 'paid' ? 'badge-paid' : 'badge-unpaid'}">${inv.status === 'paid' ? t.paid : t.unpaid}</span></td>
            <td>${inv.date}</td>
            <td>
                <button class="btn-secondary" onclick="viewInvoice(${inv.id})">${t.view}</button>
                <button class="btn-primary" onclick="downloadInvoicePDF(${inv.id})">📄 PDF</button>
                ${inv.status === 'unpaid' ? `<button class="btn-primary" onclick="markPaid(${inv.id})">${t.markPaid}</button>` : ''}
            </td>
        </tr>`;
    });
}

function refreshClientsTable() {
    const t = translations[currentLanguage];
    const tbody = document.getElementById('clientsBody');
    tbody.innerHTML = '';
    clients.forEach(c => {
        tbody.innerHTML += `<tr>
            <td>${escapeHtml(c.name)}</td>
            <td>${c.email}</td>
            <td>$${c.rate}</td>
            <td><button class="btn-danger" onclick="deleteClient(${c.id})">${t.delete}</button></td>
        </tr>`;
    });
}

function refreshAllEntriesTable() {
    const t = translations[currentLanguage];
    const tbody = document.getElementById('allEntriesBody');
    tbody.innerHTML = '';
    timeEntries.forEach(e => {
        const client = clients.find(c => c.id === e.clientId);
        tbody.innerHTML += `<tr>
            <td>${client?.name || 'Unknown'}</td>
            <td>${escapeHtml(e.description)}</td>
            <td>${e.duration}</td>
            <td>${e.date}</td>
            <td>${e.invoiced ? '✅ ' + t.yes : '❌ ' + t.no}</td>
            <td><button class="btn-danger" onclick="deleteEntry(${e.id})">${t.delete}</button></td>
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

// Timer functions
function updateTimerDisplay() {
    const hours = Math.floor(timerSeconds / 3600);
    const minutes = Math.floor((timerSeconds % 3600) / 60);
    const seconds = timerSeconds % 60;
    document.getElementById('timerDisplay').innerHTML = 
        `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
}

function startTimer() {
    const projectId = document.getElementById('projectSelect').value;
    if (!projectId) { alert(translations[currentLanguage].selectProject); return; }
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
    if (confirm('Delete this client?')) {
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

// Invoice functions
function openCreateInvoiceModal() {
    const clientSelect = document.getElementById('invoiceClientSelect');
    clientSelect.innerHTML = '<option value="">Select client</option>';
    clients.forEach(c => {
        clientSelect.innerHTML += `<option value="${c.id}">${escapeHtml(c.name)}</option>`;
    });
    
    const checklist = document.getElementById('timeEntriesChecklist');
    checklist.innerHTML = '<p>Select a client first</p>';
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
        notes: document.getElementById('invoiceNotes').value,
        currency: '$'
    };
    
    invoices.push(newInvoice);
    selectedEntries.forEach(e => { e.invoiced = true; });
    saveAll();
    refreshAll();
    closeInvoiceModal();
    
    if (confirm(`Invoice ${invoiceNumber} created for $${totalAmount.toFixed(2)}. Download PDF now?`)) {
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

// Quick Invoice Functions
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
    
    const currencySelect = document.getElementById('qiCurrency');
    const currencySymbol = currencySelect?.value || '$';
    
    return { subtotal, tax, discount, total, currencySymbol };
}

function previewQuickInvoice() {
    const clientName = document.getElementById('qiClientName').value;
    if (!clientName) {
        alert(translations[currentLanguage].clientName);
        return;
    }
    
    const { subtotal, tax, discount, total, currencySymbol } = calculateQuickInvoiceTotal();
    const currency = currencySymbol;
    
    const itemsHtml = quickInvoiceItems.filter(i => i.desc && i.price > 0).map(item => `
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
        alert(translations[currentLanguage].clientName);
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
    const currencySelect = document.getElementById('qiCurrency');
    const currencySymbol = currencySelect?.value || '$';
    
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
        .filter(item => item.desc && item.price > 0)
        .map(item => [
            item.desc,
            item.qty.toString(),
            `${currencySymbol}${(item.price || 0).toFixed(2)}`,
            `${currencySymbol}${(item.qty * item.price).toFixed(2)}`
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
    doc.text(`${currencySymbol}${subtotal.toFixed(2)}`, 175, finalY, { align: 'right' });
    
    let currentY = finalY + 8;
    if (taxRate > 0) {
        doc.text(`Tax (${taxRate}%):`, 140, currentY);
        doc.text(`${currencySymbol}${tax.toFixed(2)}`, 175, currentY, { align: 'right' });
        currentY += 8;
    }
    if (discount > 0) {
        doc.text('Discount:', 140, currentY);
        doc.text(`-${currencySymbol}${discount.toFixed(2)}`, 175, currentY, { align: 'right' });
        currentY += 8;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text('TOTAL:', 140, currentY);
    doc.text(`${currencySymbol}${total.toFixed(2)}`, 175, currentY, { align: 'right' });
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
            items: quickInvoiceItems.filter(i => i.desc && i.price > 0),
            taxRate: taxRate,
            discount: discount,
            currency: currencySymbol
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

// Language switcher
function initLanguageSwitcher() {
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.value = currentLanguage;
        languageSelect.addEventListener('change', (e) => {
            currentLanguage = e.target.value;
            localStorage.setItem('freelance_language', currentLanguage);
            updateUILanguage();
            refreshAll();
        });
    }
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
    initLanguageSwitcher();
}

// Start the app
init();