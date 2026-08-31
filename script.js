"use strict";

const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".site-navigation");
const languageSwitcher = document.querySelector(".language-switcher");
const languageOptions = document.querySelectorAll(".language-option");

const translations = {
  en: {
    skipToContent: "Skip to content",
    primaryNavigation: "Primary navigation",
    openNavigation: "Open navigation",
    closeNavigation: "Close navigation",
    personalProfile: "Personal profile",
    languageSwitcher: "Language",
    profileName: "Zhu Zenan",
    education: "Education",
    projects: "Projects",
    workExperience: "Work Experience",
    workLocation: "Shanghai, China",
    internshipType: "Internship",
    researchOutputs: "Research Outputs",
    profileLocation: "Shanghai, China",
    tongjiUniversity: "Tongji University",
    educationPeriod: "2023–2027 (Expected)",
    educationDegree: "B.E. in Artificial Intelligence",
    educationAffiliation: "College of Electronic and Information Engineering",
    educationLocation: "Shanghai, China",
    nanyangModelHighSchool: "Shanghai Nanyang Model High School",
    highSchoolPeriod: "2020–2023",
    highSchoolLocation: "Shanghai, China",
    smartSensCompany: "SmartSens Technology (Shanghai) Co., Ltd.",
    smartSensPosition: "Software Development Intern",
    smartSensPeriod: "Jul 2026–Present",
    unisoundCompany: "Unisound AI Technology Co., Ltd.",
    unisoundPosition: "AI Labs Intern",
    unisoundPeriod: "Jan 2026–Mar 2026",
    cailiCompany: "Shanghai Caili Network Co., Ltd.",
    cailiPosition: "Algorithm Intern",
    cailiPeriod: "Aug 2025–Oct 2025",
    tiebaDescription: "An unofficial Baidu Tieba Android client built natively with Kotlin and Jetpack Compose, supporting browsing, search, favorites, media viewing, and local reading history.",
    civilizationDescription: "A Civilization VI: Gathering Storm AI overhaul for adaptive strategy, stronger military execution, and a competitive Deity game from opening to victory.",
    repoPilotDescription: "An AI-powered coding workflow agent that turns repository tasks into plans, patch proposals, GitHub-aware diffs, validation feedback, and human-approved edits."
  },
  "zh-CN": {
    skipToContent: "跳转到主要内容",
    primaryNavigation: "主导航",
    openNavigation: "打开导航",
    closeNavigation: "关闭导航",
    personalProfile: "个人资料",
    languageSwitcher: "语言切换",
    profileName: "朱泽南",
    education: "教育经历",
    projects: "项目经历",
    workExperience: "工作经历",
    workLocation: "中国上海",
    internshipType: "实习",
    researchOutputs: "研究成果",
    profileLocation: "中国上海",
    tongjiUniversity: "同济大学",
    educationPeriod: "2023–2027（预计）",
    educationDegree: "人工智能专业，工学学士",
    educationAffiliation: "电子与信息工程学院",
    educationLocation: "中国上海",
    nanyangModelHighSchool: "上海市南洋模范中学",
    highSchoolPeriod: "2020–2023",
    highSchoolLocation: "中国上海",
    smartSensCompany: "思特威（上海）电子科技股份有限公司",
    smartSensPosition: "软件开发实习生",
    smartSensPeriod: "2026.07–至今",
    unisoundCompany: "云知声智能科技股份有限公司",
    unisoundPosition: "AI Labs 实习生",
    unisoundPeriod: "2026.01–2026.03",
    cailiCompany: "上海才历网络有限公司",
    cailiPosition: "算法实习生",
    cailiPeriod: "2025.08–2025.10",
    tiebaDescription: "原生 Kotlin 与 Jetpack Compose 构建的非官方贴吧 Android 客户端，支持浏览、搜索、收藏、媒体查看与本地阅读记录。",
    civilizationDescription: "一款针对 Civilization VI: Gathering Storm 的 AI 改进模组，旨在实现自适应战略、提升军事执行力，并让神级难度从开局到胜利都保持竞争性。",
    repoPilotDescription: "一个由 AI 驱动的编程工作流智能体，可将仓库任务转化为计划、补丁提案、GitHub-aware diffs、验证反馈和经人工批准的编辑。"
  }
};

let currentLanguage = "en";

const updateMenuLabel = () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  const labelKey = isOpen ? "closeNavigation" : "openNavigation";
  menuToggle.setAttribute("aria-label", translations[currentLanguage][labelKey]);
};

const setMenuOpen = (isOpen) => {
  navigation.classList.toggle("is-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  updateMenuLabel();
};

const setLanguage = (language) => {
  if (!translations[language]) {
    return;
  }

  currentLanguage = language;
  document.documentElement.lang = language;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const translation = translations[language][element.dataset.i18n];
    if (typeof translation === "string") {
      element.textContent = translation;
    }
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    const translation = translations[language][element.dataset.i18nAriaLabel];
    if (typeof translation === "string") {
      element.setAttribute("aria-label", translation);
    }
  });

  languageOptions.forEach((option) => {
    option.setAttribute("aria-pressed", String(option.dataset.language === language));
  });

  updateMenuLabel();
};

const updateLanguageUrl = (language) => {
  const url = new URL(window.location.href);
  if (language === "en") {
    url.searchParams.delete("lang");
  } else {
    url.searchParams.set("lang", language);
  }

  try {
    window.history.replaceState(null, "", url);
  } catch {
    // Some browsers do not allow history updates for local file URLs.
  }
};

menuToggle.addEventListener("click", () => {
  setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
});

navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    setMenuOpen(false);
  }
});

languageSwitcher.addEventListener("click", (event) => {
  const option = event.target.closest(".language-option");
  if (option) {
    setLanguage(option.dataset.language);
    updateLanguageUrl(option.dataset.language);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenuOpen(false);
    menuToggle.focus();
  }
});

const requestedLanguage = new URLSearchParams(window.location.search).get("lang");
setLanguage(translations[requestedLanguage] ? requestedLanguage : "en");
