const THEME_STORAGE_KEY = "subscription-manager-theme";
const PREMIUM_STORAGE_KEY = "subscription-manager-premium-settings";
const DEFAULT_PREMIUM_SETTINGS = {
    autoSync: false,
    smartAlert: true,
    reminderDays: "7",
    reportDay: "monday"
};

const elements = {
    themeToggleButton: document.querySelector("#theme-toggle-button"),
    premiumForm: document.querySelector("#premium-form"),
    autoSyncToggle: document.querySelector("#auto-sync-toggle"),
    smartAlertToggle: document.querySelector("#smart-alert-toggle"),
    premiumReminderDays: document.querySelector("#premium-reminder-days"),
    premiumReportDay: document.querySelector("#premium-report-day"),
    premiumStatus: document.querySelector("#premium-status")
};

const state = {
    theme: loadTheme(),
    premiumSettings: loadPremiumSettings()
};

initialize();

function initialize() {
    applyTheme();
    renderPremiumSettings();
    elements.themeToggleButton.addEventListener("click", toggleTheme);
    elements.premiumForm.addEventListener("submit", savePremiumSettings);
}

function loadTheme() {
    return localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
}

function loadPremiumSettings() {
    const raw = localStorage.getItem(PREMIUM_STORAGE_KEY);
    if (!raw) {
        return { ...DEFAULT_PREMIUM_SETTINGS };
    }

    try {
        return { ...DEFAULT_PREMIUM_SETTINGS, ...JSON.parse(raw) };
    } catch {
        return { ...DEFAULT_PREMIUM_SETTINGS };
    }
}

function savePremiumSettings(event) {
    event.preventDefault();
    state.premiumSettings = {
        autoSync: elements.autoSyncToggle.checked,
        smartAlert: elements.smartAlertToggle.checked,
        reminderDays: elements.premiumReminderDays.value,
        reportDay: elements.premiumReportDay.value
    };
    localStorage.setItem(PREMIUM_STORAGE_KEY, JSON.stringify(state.premiumSettings));
    renderPremiumSettings(true);
}

function renderPremiumSettings(saved = false) {
    const settings = state.premiumSettings;
    elements.autoSyncToggle.checked = settings.autoSync;
    elements.smartAlertToggle.checked = settings.smartAlert;
    elements.premiumReminderDays.value = settings.reminderDays;
    elements.premiumReportDay.value = settings.reportDay;

    const reportDayLabel = {
        monday: "月曜日",
        friday: "金曜日",
        sunday: "日曜日"
    }[settings.reportDay];
    const enabledCount = [settings.autoSync, settings.smartAlert].filter(Boolean).length;
    const savedPrefix = saved ? "保存しました。 " : "";

    elements.premiumStatus.textContent = `${savedPrefix}${enabledCount}件の自動化が有効です。通知は${settings.reminderDays}日前、週次レポートは${reportDayLabel}に作成します。`;
}

function toggleTheme() {
    state.theme = state.theme === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_STORAGE_KEY, state.theme);
    applyTheme();
}

function applyTheme() {
    document.body.dataset.theme = state.theme;
    elements.themeToggleButton.textContent = state.theme === "dark" ? "☀" : "◐";
    elements.themeToggleButton.setAttribute("aria-label", state.theme === "dark" ? "ライトモードに切替" : "ダークモードに切替");
}
