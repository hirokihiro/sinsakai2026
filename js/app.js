const STORAGE_KEY = "subscription-manager-items";
const BUDGET_STORAGE_KEY = "subscription-manager-budget";
const CATEGORY_OPTIONS = ["動画", "音楽", "学習", "クラウド", "ゲーム", "ニュース", "制作", "その他"];
const STATUS_OPTIONS = ["利用中", "解約予定", "解約済み"];
const BILLING_CYCLE_OPTIONS = [
    { value: "monthly", label: "月額", months: 1 },
    { value: "quarterly", label: "3か月ごと", months: 3 },
    { value: "semiannual", label: "半年ごと", months: 6 },
    { value: "yearly", label: "年額", months: 12 }
];
const CSV_COLUMNS = ["serviceName", "category", "monthlyPrice", "billingCycle", "startDate", "renewalDate", "trialEndDate", "status", "memo"];
const CATEGORY_STYLES = {
    "動画": { color: "#f87171", className: "video" },
    "音楽": { color: "#14b8a6", className: "music" },
    "学習": { color: "#38bdf8", className: "learning" },
    "クラウド": { color: "#64748b", className: "cloud" },
    "ゲーム": { color: "#f59e0b", className: "game" },
    "ニュース": { color: "#0ea5e9", className: "news" },
    "制作": { color: "#8b5cf6", className: "creative" },
    "その他": { color: "#94a3b8", className: "other" }
};

const sampleSubscriptions = [
    {
        id: crypto.randomUUID(),
        serviceName: "Netflix",
        category: "動画",
        monthlyPrice: 1590,
        billingCycle: "monthly",
        startDate: "2026-05-01",
        renewalDate: "2026-09-18",
        trialEndDate: "",
        status: "利用中",
        memo: "スタンダードプラン"
    },
    {
        id: crypto.randomUUID(),
        serviceName: "Spotify",
        category: "音楽",
        monthlyPrice: 980,
        billingCycle: "monthly",
        startDate: "2026-04-10",
        renewalDate: "2026-09-24",
        trialEndDate: "2026-09-20",
        status: "利用中",
        memo: "個人プラン"
    },
    {
        id: crypto.randomUUID(),
        serviceName: "Adobe Creative Cloud",
        category: "制作",
        monthlyPrice: 18000,
        billingCycle: "yearly",
        startDate: "2026-01-15",
        renewalDate: "2026-10-02",
        trialEndDate: "",
        status: "利用中",
        memo: "デザイン作業用"
    }
];

const state = {
    subscriptions: loadSubscriptions(),
    filters: {
        keyword: "",
        category: "",
        status: ""
    },
    monthlyBudget: loadBudget(),
    editingId: null,
    detailId: null,
    savingIds: new Set()
};

const elements = {
    monthlyTotal: document.querySelector("#monthly-total"),
    yearlyTotal: document.querySelector("#yearly-total"),
    subscriptionCount: document.querySelector("#subscription-count"),
    categoryChart: document.querySelector("#category-chart"),
    categoryList: document.querySelector("#category-list"),
    upcomingList: document.querySelector("#upcoming-list"),
    sevenDayNote: document.querySelector("#seven-day-note"),
    budgetForm: document.querySelector("#budget-form"),
    monthlyBudget: document.querySelector("#monthly-budget"),
    clearBudgetButton: document.querySelector("#clear-budget-button"),
    budgetMeterBar: document.querySelector("#budget-meter-bar"),
    budgetStatus: document.querySelector("#budget-status"),
    trialList: document.querySelector("#trial-list"),
    exportCsvButton: document.querySelector("#export-csv-button"),
    importCsvInput: document.querySelector("#import-csv-input"),
    dataStatus: document.querySelector("#data-status"),
    savingsList: document.querySelector("#savings-list"),
    savingMonthlyTotal: document.querySelector("#saving-monthly-total"),
    savingYearlyTotal: document.querySelector("#saving-yearly-total"),
    savingSelectedCount: document.querySelector("#saving-selected-count"),
    clearSavingsButton: document.querySelector("#clear-savings-button"),
    tableBody: document.querySelector("#subscription-table-body"),
    tableFooter: document.querySelector("#table-footer"),
    filterForm: document.querySelector("#filter-form"),
    searchKeyword: document.querySelector("#search-keyword"),
    filterCategory: document.querySelector("#filter-category"),
    filterStatus: document.querySelector("#filter-status"),
    clearFilterButton: document.querySelector("#clear-filter-button"),
    openFormButton: document.querySelector("#open-form-button"),
    resetSampleButton: document.querySelector("#reset-sample-button"),
    dialog: document.querySelector("#subscription-dialog"),
    dialogTitle: document.querySelector("#dialog-title"),
    closeDialogButton: document.querySelector("#close-dialog-button"),
    cancelButton: document.querySelector("#cancel-button"),
    form: document.querySelector("#subscription-form"),
    serviceName: document.querySelector("#service-name"),
    category: document.querySelector("#category"),
    monthlyPrice: document.querySelector("#monthly-price"),
    billingCycle: document.querySelector("#billing-cycle"),
    startDate: document.querySelector("#start-date"),
    renewalDate: document.querySelector("#renewal-date"),
    trialEndDate: document.querySelector("#trial-end-date"),
    status: document.querySelector("#status"),
    memo: document.querySelector("#memo"),
    subscriptionId: document.querySelector("#subscription-id"),
    detailDialog: document.querySelector("#detail-dialog"),
    detailTitle: document.querySelector("#detail-title"),
    detailBody: document.querySelector("#detail-body"),
    detailEditButton: document.querySelector("#detail-edit-button"),
    detailCloseButton: document.querySelector("#detail-close-button"),
    closeDetailButton: document.querySelector("#close-detail-button")
};

const errorElements = {
    serviceName: document.querySelector("#error-service-name"),
    category: document.querySelector("#error-category"),
    monthlyPrice: document.querySelector("#error-monthly-price"),
    billingCycle: document.querySelector("#error-billing-cycle"),
    renewalDate: document.querySelector("#error-renewal-date"),
    status: document.querySelector("#error-status")
};

initialize();

function initialize() {
    populateSelect(elements.category, CATEGORY_OPTIONS, "選択してください");
    populateSelect(elements.status, STATUS_OPTIONS, "選択してください");
    populateSelect(elements.billingCycle, BILLING_CYCLE_OPTIONS.map((cycle) => cycle.value), "選択してください", false, getBillingCycleLabel);
    renderFilterOptions();
    bindEvents();
    render();
}

function bindEvents() {
    elements.openFormButton.addEventListener("click", () => openFormDialog());
    elements.resetSampleButton.addEventListener("click", resetToSampleData);
    elements.clearSavingsButton.addEventListener("click", clearSavingsSelection);
    elements.budgetForm.addEventListener("submit", handleBudgetSave);
    elements.clearBudgetButton.addEventListener("click", clearBudget);
    elements.exportCsvButton.addEventListener("click", exportCsv);
    elements.importCsvInput.addEventListener("change", importCsv);
    elements.closeDialogButton.addEventListener("click", closeFormDialog);
    elements.cancelButton.addEventListener("click", closeFormDialog);
    elements.closeDetailButton.addEventListener("click", closeDetailDialog);
    elements.detailCloseButton.addEventListener("click", closeDetailDialog);
    elements.detailEditButton.addEventListener("click", () => {
        const subscription = state.subscriptions.find((item) => item.id === state.detailId);
        closeDetailDialog();
        if (subscription) {
            openFormDialog(subscription);
        }
    });

    elements.filterForm.addEventListener("input", handleFilterChange);
    elements.filterForm.addEventListener("change", handleFilterChange);
    elements.clearFilterButton.addEventListener("click", clearFilters);

    elements.form.addEventListener("submit", (event) => {
        event.preventDefault();
        saveSubscription();
    });

    document.addEventListener("click", (event) => {
        if (!event.target.closest(".action-menu")) {
            closeAllActionMenus();
        }
    });
}

function loadSubscriptions() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleSubscriptions));
        return [...sampleSubscriptions];
    }

    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.map(normalizeSubscription) : [...sampleSubscriptions];
    } catch {
        return [...sampleSubscriptions];
    }
}

function loadBudget() {
    const value = Number(localStorage.getItem(BUDGET_STORAGE_KEY));
    return Number.isFinite(value) && value > 0 ? value : 0;
}

function normalizeSubscription(subscription) {
    return {
        ...subscription,
        billingCycle: hasBillingCycle(subscription.billingCycle) ? subscription.billingCycle : "monthly"
    };
}

function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.subscriptions));
}

function saveBudget() {
    if (state.monthlyBudget > 0) {
        localStorage.setItem(BUDGET_STORAGE_KEY, String(state.monthlyBudget));
    } else {
        localStorage.removeItem(BUDGET_STORAGE_KEY);
    }
}

function resetToSampleData() {
    state.subscriptions = [...sampleSubscriptions];
    saveToStorage();
    renderFilterOptions();
    render();
}

function handleFilterChange() {
    state.filters.keyword = elements.searchKeyword.value.trim().toLowerCase();
    state.filters.category = elements.filterCategory.value;
    state.filters.status = elements.filterStatus.value;
    render();
}

function clearFilters() {
    state.filters = { keyword: "", category: "", status: "" };
    elements.searchKeyword.value = "";
    elements.filterCategory.value = "";
    elements.filterStatus.value = "";
    render();
}

function handleBudgetSave(event) {
    event.preventDefault();
    const value = Number(elements.monthlyBudget.value);
    state.monthlyBudget = Number.isFinite(value) && value > 0 ? Math.round(value) : 0;
    saveBudget();
    renderBudgetAlert();
}

function clearBudget() {
    state.monthlyBudget = 0;
    elements.monthlyBudget.value = "";
    saveBudget();
    renderBudgetAlert();
}

function openFormDialog(subscription = null) {
    clearErrors();
    state.editingId = subscription ? subscription.id : null;
    elements.dialogTitle.textContent = subscription ? "サブスク編集" : "サブスク登録";
    elements.form.querySelector("#save-button").textContent = subscription ? "更新" : "登録";

    elements.subscriptionId.value = subscription?.id ?? "";
    elements.serviceName.value = subscription?.serviceName ?? "";
    elements.category.value = subscription?.category ?? "";
    elements.monthlyPrice.value = subscription?.monthlyPrice ?? "";
    elements.billingCycle.value = subscription?.billingCycle ?? "monthly";
    elements.startDate.value = subscription?.startDate ?? "";
    elements.renewalDate.value = subscription?.renewalDate ?? "";
    elements.trialEndDate.value = subscription?.trialEndDate ?? "";
    elements.status.value = subscription?.status ?? "";
    elements.memo.value = subscription?.memo ?? "";

    elements.dialog.showModal();
}

function closeFormDialog() {
    elements.dialog.close();
    state.editingId = null;
    elements.form.reset();
    clearErrors();
}

function openDetailDialog(id) {
    const subscription = state.subscriptions.find((item) => item.id === id);
    if (!subscription) {
        return;
    }

    state.detailId = id;
    const displayRenewalDate = getDisplayRenewalDate(subscription.renewalDate, subscription.billingCycle);
    elements.detailTitle.textContent = subscription.serviceName;
    elements.detailBody.innerHTML = `
        ${detailCard("カテゴリ", subscription.category)}
        ${detailCard("支払い金額", `${formatCurrency(subscription.monthlyPrice)} / ${getBillingCycleLabel(subscription.billingCycle)}`)}
        ${detailCard("月換算", formatCurrency(getMonthlyEquivalent(subscription)))}
        ${detailCard("契約開始日", formatDate(subscription.startDate))}
        ${detailCard("次回更新日", formatDate(displayRenewalDate))}
        ${detailCard("無料体験終了日", formatDate(subscription.trialEndDate))}
        ${detailCard("利用状況", subscription.status)}
        ${detailCard("メモ", subscription.memo || "登録されていません。", true)}
    `;
    elements.detailDialog.showModal();
}

function closeDetailDialog() {
    elements.detailDialog.close();
    state.detailId = null;
}

function saveSubscription() {
    const payload = {
        id: elements.subscriptionId.value || crypto.randomUUID(),
        serviceName: elements.serviceName.value.trim(),
        category: elements.category.value,
        monthlyPrice: Number(elements.monthlyPrice.value),
        billingCycle: elements.billingCycle.value,
        startDate: elements.startDate.value,
        renewalDate: elements.renewalDate.value,
        trialEndDate: elements.trialEndDate.value,
        status: elements.status.value,
        memo: elements.memo.value.trim()
    };

    const errors = validate(payload);
    clearErrors();

    if (Object.keys(errors).length > 0) {
        Object.entries(errors).forEach(([key, value]) => {
            errorElements[key].textContent = value;
        });
        return;
    }

    if (state.editingId) {
        state.subscriptions = state.subscriptions.map((item) => item.id === state.editingId ? payload : item);
    } else {
        state.subscriptions = [payload, ...state.subscriptions];
    }

    saveToStorage();
    renderFilterOptions();
    render();
    closeFormDialog();
}

function validate(payload) {
    const errors = {};

    if (!payload.serviceName) {
        errors.serviceName = "サービス名は必須です。";
    }
    if (!payload.category) {
        errors.category = "カテゴリは必須です。";
    }
    if (!Number.isInteger(payload.monthlyPrice) || payload.monthlyPrice < 0) {
        errors.monthlyPrice = "支払い金額は0円以上の整数で入力してください。";
    }
    if (!hasBillingCycle(payload.billingCycle)) {
        errors.billingCycle = "支払いサイクルは必須です。";
    }
    if (!payload.renewalDate) {
        errors.renewalDate = "次回更新日は必須です。";
    }
    if (!payload.status) {
        errors.status = "利用状況は必須です。";
    }

    return errors;
}

function clearErrors() {
    Object.values(errorElements).forEach((element) => {
        element.textContent = "";
    });
}

function deleteSubscription(id) {
    const subscription = state.subscriptions.find((item) => item.id === id);
    if (!subscription) {
        return;
    }

    const confirmed = window.confirm(`「${subscription.serviceName}」を削除しますか？`);
    if (!confirmed) {
        return;
    }

    state.subscriptions = state.subscriptions.filter((item) => item.id !== id);
    state.savingIds.delete(id);
    saveToStorage();
    renderFilterOptions();
    render();
}

function render() {
    const filtered = getFilteredSubscriptions();
    renderSummary();
    renderCategoryBreakdown();
    renderUpcoming();
    renderBudgetAlert();
    renderTrialReminders();
    renderSavingsSimulator();
    renderTable(filtered);
}

function renderSummary() {
    const activeMonthlyTotal = getActiveMonthlyTotal();

    elements.monthlyTotal.innerHTML = `${formatCurrency(activeMonthlyTotal)} <span>/ 月</span>`;
    elements.yearlyTotal.textContent = `年間 ${formatCurrency(activeMonthlyTotal * 12)}`;
    elements.subscriptionCount.textContent = `${state.subscriptions.length}件`;
}

function renderCategoryBreakdown() {
    const totals = CATEGORY_OPTIONS.map((category) => ({
        category,
        amount: state.subscriptions
            .filter((item) => item.status === "利用中" && item.category === category)
            .reduce((sum, item) => sum + getMonthlyEquivalent(item), 0)
    }));
    const activeTotal = totals.reduce((sum, item) => sum + item.amount, 0);
    const visibleTotals = totals.filter((item) => item.amount > 0);

    if (activeTotal === 0) {
        elements.categoryChart.style.background = "#eef2f6";
        elements.categoryList.innerHTML = CATEGORY_OPTIONS.slice(0, 4).map((category) => categoryLegend(category, 0)).join("");
        return;
    }

    let cursor = 0;
    const segments = visibleTotals.map((item) => {
        const start = cursor;
        const degrees = (item.amount / activeTotal) * 360;
        cursor += degrees;
        return `${getCategoryColor(item.category)} ${start}deg ${cursor}deg`;
    });

    elements.categoryChart.style.background = `conic-gradient(${segments.join(", ")})`;
    elements.categoryList.innerHTML = totals
        .filter((item) => item.amount > 0 || ["動画", "音楽", "制作", "その他"].includes(item.category))
        .slice(0, 5)
        .map((item) => categoryLegend(item.category, item.amount))
        .join("");
}

function getActiveMonthlyTotal() {
    return state.subscriptions
        .filter((item) => item.status === "利用中")
        .reduce((sum, item) => sum + getMonthlyEquivalent(item), 0);
}

function renderBudgetAlert() {
    const total = getActiveMonthlyTotal();
    const budget = state.monthlyBudget;
    elements.monthlyBudget.value = budget > 0 ? budget : "";

    if (budget <= 0) {
        elements.budgetMeterBar.style.width = "0%";
        elements.budgetMeterBar.className = "";
        elements.budgetStatus.innerHTML = `
            <strong>予算が未設定です</strong>
            <span>月の上限を入れると、使いすぎを自動で判定します。</span>
        `;
        return;
    }

    const percent = Math.min((total / budget) * 100, 100);
    const remaining = budget - total;
    const statusClass = remaining < 0 ? "over" : percent >= 80 ? "near" : "ok";
    const message = remaining < 0
        ? `${formatCurrency(Math.abs(remaining))} 超過しています`
        : `${formatCurrency(remaining)} 余裕があります`;

    elements.budgetMeterBar.style.width = `${percent}%`;
    elements.budgetMeterBar.className = statusClass;
    elements.budgetStatus.innerHTML = `
        <strong class="${statusClass}">${message}</strong>
        <span>${formatCurrency(total)} / ${formatCurrency(budget)} を使用中</span>
    `;
}

function renderUpcoming() {
    const upcoming = state.subscriptions
        .filter((item) => item.status !== "解約済み")
        .map((item) => ({ ...item, displayRenewalDate: getDisplayRenewalDate(item.renewalDate, item.billingCycle) }))
        .sort((a, b) => safeDate(a.displayRenewalDate) - safeDate(b.displayRenewalDate));
    const nextPayments = upcoming.slice(0, 3);
    const hasSevenDayPayment = upcoming.some((item) => isWithinSevenDays(item.displayRenewalDate) || isWithinSevenDays(item.trialEndDate));

    if (nextPayments.length === 0) {
        elements.upcomingList.innerHTML = `<div class="empty-state">今後の支払い予定はありません。</div>`;
        elements.sevenDayNote.innerHTML = `<span>✓ 今後7日間の支払いはありません</span><span>次の支払い予定はありません</span>`;
        return;
    }

    elements.upcomingList.innerHTML = nextPayments.map((item) => {
        return `
            <article class="payment-card">
                ${serviceLogo(item.serviceName)}
                <div>
                    <p class="service-name">${escapeHtml(item.serviceName)}</p>
                    <p class="meta">${escapeHtml(item.category)} ・ ${getBillingCycleLabel(item.billingCycle)}</p>
                </div>
                <div class="payment-date">
                    ${formatDateWithWeekday(item.displayRenewalDate)}
                    ${daysUntilBadge(item.displayRenewalDate)}
                </div>
                <div class="payment-price">${formatCurrency(item.monthlyPrice)}</div>
           </article>
        `;
    }).join("");

    elements.sevenDayNote.innerHTML = hasSevenDayPayment
        ? `<span>! 7日以内に支払い予定があります</span><span>${nextPaymentText(upcoming)}</span>`
        : `<span>✓ 今後7日間の支払いはありません</span><span>${nextPaymentText(upcoming)}</span>`;
}

function renderTrialReminders() {
    const trials = state.subscriptions
        .filter((item) => item.status !== "解約済み" && item.trialEndDate)
        .map((item) => ({ ...item, trialDays: daysUntil(item.trialEndDate) }))
        .filter((item) => item.trialDays !== null && item.trialDays >= 0)
        .sort((a, b) => a.trialDays - b.trialDays)
        .slice(0, 4);

    if (trials.length === 0) {
        elements.trialList.innerHTML = `<div class="empty-state">期限が近い無料体験はありません。</div>`;
        return;
    }

    elements.trialList.innerHTML = trials.map((item) => {
        const urgency = item.trialDays <= 3 ? "urgent" : item.trialDays <= 7 ? "soon" : "neutral";
        return `
            <article class="trial-card ${urgency}">
                ${serviceLogo(item.serviceName)}
                <div>
                    <p class="service-name">${escapeHtml(item.serviceName)}</p>
                    <p class="meta">${formatDateWithWeekday(item.trialEndDate)} 終了</p>
                </div>
                ${daysUntilBadge(item.trialEndDate)}
            </article>
        `;
    }).join("");
}

function renderSavingsSimulator() {
    const candidates = state.subscriptions
        .filter((item) => item.status === "利用中")
        .sort((a, b) => getMonthlyEquivalent(b) - getMonthlyEquivalent(a));
    const candidateIds = new Set(candidates.map((item) => item.id));
    state.savingIds.forEach((id) => {
        if (!candidateIds.has(id)) {
            state.savingIds.delete(id);
        }
    });

    const selected = candidates.filter((item) => state.savingIds.has(item.id));
    const monthlySaving = selected.reduce((sum, item) => sum + getMonthlyEquivalent(item), 0);

    elements.savingMonthlyTotal.textContent = formatCurrency(monthlySaving);
    elements.savingYearlyTotal.textContent = formatCurrency(monthlySaving * 12);
    elements.savingSelectedCount.textContent = `${selected.length}件を選択中`;

    if (candidates.length === 0) {
        elements.savingsList.innerHTML = `<div class="empty-state">試算できる利用中のサブスクはありません。</div>`;
        return;
    }

    elements.savingsList.innerHTML = candidates.map((item) => `
        <label class="saving-item">
            <input type="checkbox" data-saving-id="${item.id}" ${state.savingIds.has(item.id) ? "checked" : ""}>
            ${serviceLogo(item.serviceName)}
            <span>
                <strong>${escapeHtml(item.serviceName)}</strong>
                <small>${formatCurrency(item.monthlyPrice)} / ${getBillingCycleLabel(item.billingCycle)} ・ 月換算 ${formatCurrency(getMonthlyEquivalent(item))}</small>
            </span>
        </label>
    `).join("");

    elements.savingsList.querySelectorAll("[data-saving-id]").forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
                state.savingIds.add(checkbox.dataset.savingId);
            } else {
                state.savingIds.delete(checkbox.dataset.savingId);
            }
            renderSavingsSimulator();
        });
    });
}

function renderTable(subscriptions) {
    if (subscriptions.length === 0) {
        elements.tableBody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">条件に一致するサブスクはありません。</div>
                </td>
            </tr>
        `;
        elements.tableFooter.textContent = "全0件のサービス";
        return;
    }

    elements.tableBody.innerHTML = subscriptions.map((item) => {
        const displayRenewalDate = getDisplayRenewalDate(item.renewalDate, item.billingCycle);
        const rowClass = item.status === "解約済み"
            ? "cancelled-row"
            : item.status === "解約予定"
                ? "pending-row"
                : isWithinSevenDays(displayRenewalDate)
                    ? "warning-row"
                    : "";

        return `
            <tr class="${rowClass}">
                <td>
                    <div class="service-cell">
                        ${serviceLogo(item.serviceName)}
                        <strong>${escapeHtml(item.serviceName)}</strong>
                    </div>
                </td>
                <td>${categoryPill(item.category)}</td>
                <td>
                    <strong>${formatCurrency(item.monthlyPrice)}</strong>
                    <small class="price-subtext">月換算 ${formatCurrency(getMonthlyEquivalent(item))}</small>
                </td>
                <td>${getBillingCycleLabel(item.billingCycle)}</td>
                <td class="renewal-cell">
                    <div>${formatDate(displayRenewalDate)}</div>
                    ${daysUntilBadge(displayRenewalDate)}
                </td>
                <td>${statusPill(item.status)}</td>
                <td>
                    <div class="action-menu">
                        <button class="link-button" type="button" data-action="toggle-menu" data-id="${item.id}" aria-label="アクションメニュー" aria-expanded="false">…</button>
                        <div class="dropdown-menu" data-menu-id="${item.id}">
                            <button type="button" data-action="detail" data-id="${item.id}">詳細</button>
                            <button type="button" data-action="edit" data-id="${item.id}">編集</button>
                            <button type="button" data-action="schedule-cancel" data-id="${item.id}">解約予定にする</button>
                            <button class="danger" type="button" data-action="delete" data-id="${item.id}">削除</button>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
    elements.tableFooter.textContent = `全${subscriptions.length}件のサービス`;

    elements.tableBody.querySelectorAll("button[data-action]").forEach((button) => {
        button.addEventListener("click", () => {
            const { action, id } = button.dataset;
            if (action === "toggle-menu") {
                toggleActionMenu(button, id);
            } else if (action === "detail") {
                closeAllActionMenus();
                openDetailDialog(id);
            } else if (action === "edit") {
                closeAllActionMenus();
                const subscription = state.subscriptions.find((item) => item.id === id);
                openFormDialog(subscription);
            } else if (action === "schedule-cancel") {
                closeAllActionMenus();
                scheduleCancellation(id);
            } else if (action === "delete") {
                closeAllActionMenus();
                deleteSubscription(id);
            }
        });
    });
}

function getFilteredSubscriptions() {
    return [...state.subscriptions]
        .filter((item) => !state.filters.keyword || item.serviceName.toLowerCase().includes(state.filters.keyword))
        .filter((item) => !state.filters.category || item.category === state.filters.category)
        .filter((item) => !state.filters.status || item.status === state.filters.status)
        .sort((a, b) => safeDate(getDisplayRenewalDate(a.renewalDate, a.billingCycle)) - safeDate(getDisplayRenewalDate(b.renewalDate, b.billingCycle)));
}

function renderFilterOptions() {
    const categories = [...new Set([...CATEGORY_OPTIONS, ...state.subscriptions.map((item) => item.category).filter(Boolean)])];
    populateSelect(elements.filterCategory, categories, "カテゴリを選択", true);
    populateSelect(elements.filterStatus, STATUS_OPTIONS, "利用状況を選択", true);

    elements.filterCategory.value = state.filters.category;
    elements.filterStatus.value = state.filters.status;
}

function populateSelect(selectElement, options, placeholder, includeEmpty = false, formatter = (option) => option) {
    const emptyOption = includeEmpty || placeholder ? `<option value="">${placeholder}</option>` : "";
    selectElement.innerHTML = emptyOption + options.map((option) => `<option value="${option}">${formatter(option)}</option>`).join("");
}

function formatCurrency(value) {
    return `¥${Math.round(Number(value)).toLocaleString("ja-JP")}`;
}

function formatDate(value) {
    if (!value) {
        return "-";
    }
    const date = parseLocalDate(value);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatDateWithWeekday(value) {
    if (!value) {
        return "-";
    }
    const date = parseLocalDate(value);
    const weekday = ["日", "月", "火", "水", "木", "金", "土"][date.getDay()];
    return `${date.getMonth() + 1}月${date.getDate()}日（${weekday}）`;
}

function daysUntilLabel(value) {
    const days = daysUntil(value);
    if (days === null) {
        return "";
    }
    if (days === 0) {
        return "今日";
    }
    if (days < 0) {
        return `${Math.abs(days)}日前`;
    }
    return `あと${days}日`;
}

function daysUntilBadge(value) {
    const days = daysUntil(value);
    if (days === null) {
        return "";
    }

    const urgency = days <= 3 && days >= 0
        ? "urgent"
        : days <= 7 && days >= 0
            ? "soon"
            : "neutral";

    return `<small class="due-badge ${urgency}">${daysUntilLabel(value)}</small>`;
}

function safeDate(value) {
    if (!value) {
        return new Date("9999-12-31");
    }
    return parseLocalDate(value);
}

function daysUntil(value) {
    if (!value) {
        return null;
    }
    const today = startOfDay(new Date());
    const target = startOfDay(parseLocalDate(value));
    return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

function getDisplayRenewalDate(value, billingCycle = "monthly") {
    if (!value) {
        return "";
    }

    const today = startOfDay(new Date());
    const renewal = startOfDay(parseLocalDate(value));
    const cycleMonths = getBillingCycle(billingCycle).months;
    while (renewal < today) {
        renewal.setMonth(renewal.getMonth() + cycleMonths);
    }

    return toDateInputValue(renewal);
}

function isWithinSevenDays(value) {
    const days = daysUntil(value);
    return days !== null && days >= 0 && days <= 7;
}

function startOfDay(date) {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
}

function parseLocalDate(value) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function toDateInputValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function detailCard(label, value, wide = false) {
    return `
        <section class="detail-card ${wide ? "full-span" : ""}">
            <span>${escapeHtml(label)}</span>
            ${wide ? `<p>${escapeHtml(value)}</p>` : `<strong>${escapeHtml(value)}</strong>`}
        </section>
    `;
}

function hasBillingCycle(value) {
    return BILLING_CYCLE_OPTIONS.some((cycle) => cycle.value === value);
}

function getBillingCycle(value) {
    return BILLING_CYCLE_OPTIONS.find((cycle) => cycle.value === value) ?? BILLING_CYCLE_OPTIONS[0];
}

function getBillingCycleLabel(value) {
    return getBillingCycle(value).label;
}

function getMonthlyEquivalent(subscription) {
    return Math.round(Number(subscription.monthlyPrice) / getBillingCycle(subscription.billingCycle).months);
}

function categoryLegend(category, amount) {
    return `
        <div class="category-row">
            <span>
                <i style="background: ${getCategoryColor(category)}"></i>
                ${escapeHtml(category)}
            </span>
            <strong>${formatCurrency(amount)}</strong>
        </div>
    `;
}

function getCategoryColor(category) {
    return CATEGORY_STYLES[category]?.color ?? CATEGORY_STYLES["その他"].color;
}

function serviceLogo(serviceName) {
    const normalizedName = serviceName.toLowerCase();
    const className = normalizedName.includes("netflix")
        ? "logo-netflix"
        : normalizedName.includes("spotify")
            ? "logo-spotify"
            : normalizedName.includes("adobe")
                ? "logo-adobe"
                : "";
    const initial = serviceName.trim().charAt(0).toUpperCase() || "S";

    return `<span class="service-logo ${className}">${escapeHtml(initial)}</span>`;
}

function categoryPill(category) {
    const className = CATEGORY_STYLES[category]?.className ?? "other";

    return `<span class="category-pill ${className}">${escapeHtml(category)}</span>`;
}

function statusPill(status) {
    const className = status === "解約予定"
        ? "pending"
        : status === "解約済み"
            ? "cancelled"
            : "";

    return `<span class="status-pill ${className}">${escapeHtml(status)}</span>`;
}

function toggleActionMenu(button, id) {
    const menu = elements.tableBody.querySelector(`[data-menu-id="${CSS.escape(id)}"]`);
    const isOpen = menu?.classList.contains("open");
    closeAllActionMenus();
    if (!menu || isOpen) {
        return;
    }

    menu.classList.add("open");
    button.setAttribute("aria-expanded", "true");
}

function closeAllActionMenus() {
    elements.tableBody.querySelectorAll(".dropdown-menu.open").forEach((menu) => {
        menu.classList.remove("open");
    });
    elements.tableBody.querySelectorAll("[data-action='toggle-menu']").forEach((button) => {
        button.setAttribute("aria-expanded", "false");
    });
}

function scheduleCancellation(id) {
    state.subscriptions = state.subscriptions.map((item) => {
        if (item.id !== id) {
            return item;
        }

        return {
            ...item,
            status: "解約予定"
        };
    });
    state.savingIds.delete(id);
    saveToStorage();
    renderFilterOptions();
    render();
}

function nextPaymentText(subscriptions) {
    const nextPayment = subscriptions[0];
    if (!nextPayment) {
        return "次の支払い予定はありません";
    }

    return `次の支払いは ${formatDateWithWeekday(nextPayment.displayRenewalDate)}です`;
}

function clearSavingsSelection() {
    state.savingIds.clear();
    renderSavingsSimulator();
}

function exportCsv() {
    const rows = [
        CSV_COLUMNS,
        ...state.subscriptions.map((item) => CSV_COLUMNS.map((column) => item[column] ?? ""))
    ];
    const csv = rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `submanage-${toDateInputValue(new Date())}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    elements.dataStatus.textContent = `${state.subscriptions.length}件のCSVを書き出しました。`;
}

function importCsv(event) {
    const file = event.target.files?.[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
        try {
            const imported = parseSubscriptionsCsv(String(reader.result ?? ""));
            if (imported.length === 0) {
                elements.dataStatus.textContent = "読み込めるデータがありませんでした。";
                return;
            }

            const confirmed = window.confirm(`${imported.length}件のデータで現在の一覧を置き換えますか？`);
            if (!confirmed) {
                elements.dataStatus.textContent = "CSV読込をキャンセルしました。";
                return;
            }

            state.subscriptions = imported;
            state.savingIds.clear();
            saveToStorage();
            renderFilterOptions();
            render();
            elements.dataStatus.textContent = `${imported.length}件のCSVを読み込みました。`;
        } catch (error) {
            elements.dataStatus.textContent = error.message;
        } finally {
            event.target.value = "";
        }
    });
    reader.readAsText(file);
}

function parseSubscriptionsCsv(text) {
    const rows = parseCsv(text.replace(/^\uFEFF/, ""));
    if (rows.length < 2) {
        return [];
    }

    const headers = rows[0].map((header) => header.trim());
    const missingColumns = CSV_COLUMNS.filter((column) => !headers.includes(column));
    if (missingColumns.length > 0) {
        throw new Error(`CSVの列が不足しています: ${missingColumns.join(", ")}`);
    }

    return rows.slice(1)
        .filter((row) => row.some((cell) => cell.trim()))
        .map((row) => {
            const record = Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""]));
            const subscription = normalizeSubscription({
                id: crypto.randomUUID(),
                serviceName: record.serviceName.trim(),
                category: record.category.trim(),
                monthlyPrice: Number(record.monthlyPrice),
                billingCycle: record.billingCycle.trim(),
                startDate: record.startDate.trim(),
                renewalDate: record.renewalDate.trim(),
                trialEndDate: record.trialEndDate.trim(),
                status: record.status.trim(),
                memo: record.memo.trim()
            });
            const errors = validate(subscription);
            if (Object.keys(errors).length > 0) {
                throw new Error(`CSVに不正な行があります: ${subscription.serviceName || "名称未入力"}`);
            }
            return subscription;
        });
}

function parseCsv(text) {
    const rows = [];
    let row = [];
    let cell = "";
    let inQuotes = false;

    for (let index = 0; index < text.length; index += 1) {
        const char = text[index];
        const nextChar = text[index + 1];

        if (char === '"' && inQuotes && nextChar === '"') {
            cell += '"';
            index += 1;
        } else if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
            row.push(cell);
            cell = "";
        } else if ((char === "\n" || char === "\r") && !inQuotes) {
            if (char === "\r" && nextChar === "\n") {
                index += 1;
            }
            row.push(cell);
            rows.push(row);
            row = [];
            cell = "";
        } else {
            cell += char;
        }
    }

    if (cell || row.length > 0) {
        row.push(cell);
        rows.push(row);
    }

    return rows;
}

function escapeCsvCell(value) {
    const text = String(value ?? "");
    return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
