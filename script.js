"use strict";

const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".site-navigation");
const languageSwitcher = document.querySelector(".language-switcher");
const languageOptions = document.querySelectorAll(".language-option");
const languageLinks = document.querySelectorAll("[data-preserve-language]");
const citationCopyButton = document.querySelector("[data-copy-citation]");
const citationText = document.querySelector("[data-citation-text]");
const citationCopyIcon = document.querySelector("[data-copy-icon]");
const citationCopySuccessIcon = document.querySelector("[data-copy-success-icon]");

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
    researchOutputs: "Research Outputs",
    publicationDetails: "Publication Details",
    backToResearchOutputs: "Back to Research Outputs",
    publicationActions: "Publication links",
    publicationAbstractHeading: "Abstract",
    publicationAbstract: "With the rapid advancement of edge computing and uncrewed aerial vehicle (UAV) technologies, edge-assisted UAV networks have emerged as a promising solution for efficient data collection in mobile crowdsensing (MCS). This paper addresses the problem of decentralized dynamic data collection in UAV networks supported by edge systems. In this setting, UAVs autonomously collect data from ground sensor nodes (SNs), using shared task state information (TSI) exchanged through the edge system to enhance cooperation and improve overall efficiency. However, two key challenges arise in such dynamic environments: 1) Continuous data generation at SNs requires timely and non-redundant collection under limited UAV communication and energy constraints; and 2) UAVs face a fundamental trade-off between collecting fresh data at SNs and updating TSI via the edge system. To address the unique challenges posed by such dynamic environments, we propose the weighted age of data queue (WAoDQ), a novel data freshness indicator that quantitatively captures the time-varying nature of data freshness. Building upon WAoDQ, we further develop Fresh-DCEA, an option-based hierarchical multi-agent deep reinforcement learning (HMADRL)-based algorithm that integrates high-level strategic planning (e.g., data collection or TSI update decisions) with low-level action execution (e.g., UAV trajectory adjustments), enabling efficient and adaptive dynamic task assignment. Simulation results demonstrate that Fresh-DCEA outperforms benchmark methods in terms of data freshness, collection effectiveness, and energy efficiency, thereby validating its scalability and adaptability in dynamic MCS environments.",
    citation: "Citation",
    copyCitationLabel: "Copy citation",
    citationCopied: "Copied",
    citationCopyFailed: "Copy failed",
    profileLocation: "Shanghai, China",
    tongjiUniversity: "Tongji University",
    educationPeriod: "2023 – 2027 (Expected)",
    educationDegree: "B.E. in Artificial Intelligence",
    educationAffiliation: "College of Electronic and Information Engineering",
    educationLocation: "Shanghai, China",
    nanyangModelHighSchool: "Shanghai Nanyang Model High School",
    highSchoolPeriod: "2020 – 2023",
    highSchoolLocation: "Shanghai, China",
    smartSensCompany: "SmartSens Technology (Shanghai) Co., Ltd.",
    smartSensPosition: "Software Development Intern",
    smartSensPeriod: "Jul 2026 – Present",
    unisoundCompany: "Unisound AI Technology Co., Ltd.",
    unisoundPosition: "AI Labs Intern",
    unisoundPeriod: "Jan 2026 – Mar 2026",
    cailiCompany: "Shanghai Caili Network Co., Ltd.",
    cailiPosition: "Algorithm Intern",
    cailiPeriod: "Aug 2025 – Oct 2025",
    tiebaDescription: "An unofficial Baidu Tieba Android client built natively with Kotlin and Jetpack Compose, supporting browsing, search, favorites, media viewing, and local reading history.",
    civilizationDescription: "A Civilization VI: Gathering Storm AI overhaul for adaptive strategy, stronger military execution, and a competitive Deity game from opening to victory.",
    repoPilotDescription: "An AI-powered coding workflow agent that turns repository tasks into plans, patch proposals, GitHub-aware diffs, validation feedback, and human-approved edits.",
    roleCollaborator: "Collaborator",
    roleMaintainer: "Maintainer"
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
    researchOutputs: "研究成果",
    publicationDetails: "论文详情",
    backToResearchOutputs: "返回研究成果",
    publicationActions: "论文链接",
    publicationAbstractHeading: "摘要",
    publicationAbstract: "随着边缘计算和无人机（UAV）技术的快速发展，边缘辅助 UAV 网络已成为移动群智感知（MCS）中实现高效数据采集的一种有前景的解决方案。本文研究边缘系统支持的 UAV 网络中的去中心化动态数据采集问题。在该场景中，UAV 从地面传感器节点（SN）自主采集数据，并利用通过边缘系统交换的共享任务状态信息（TSI）增强协作、提升整体效率。然而，此类动态环境面临两项关键挑战：1）SN 持续产生数据，而 UAV 的通信和能源资源受限，因此需要及时且不重复地完成数据采集；2）UAV 必须在从 SN 采集新鲜数据与通过边缘系统更新 TSI 之间进行权衡。为应对这些动态环境带来的独特挑战，本文提出加权数据队列年龄（WAoDQ），这是一种能够定量刻画数据新鲜度时变特性的新型指标。在 WAoDQ 的基础上，本文进一步提出 Fresh-DCEA，一种基于 option 的分层多 Agent 深度强化学习（HMADRL）算法。该算法将高层策略规划（例如数据采集或 TSI 更新决策）与底层动作执行（例如 UAV 轨迹调整）相结合，从而实现高效且自适应的动态任务分配。仿真结果表明，Fresh-DCEA 在数据新鲜度、采集有效性和能源效率方面优于基准方法，验证了其在动态 MCS 环境中的可扩展性和适应性。",
    citation: "引用格式",
    copyCitationLabel: "复制引用",
    citationCopied: "已复制",
    citationCopyFailed: "复制失败",
    profileLocation: "中国上海",
    tongjiUniversity: "同济大学",
    educationPeriod: "2023 – 2027（预计）",
    educationDegree: "人工智能专业，工学学士",
    educationAffiliation: "电子与信息工程学院",
    educationLocation: "中国上海",
    nanyangModelHighSchool: "上海市南洋模范中学",
    highSchoolPeriod: "2020 – 2023",
    highSchoolLocation: "中国上海",
    smartSensCompany: "思特威（上海）电子科技股份有限公司",
    smartSensPosition: "软件开发实习生",
    smartSensPeriod: "2026.07 – 至今",
    unisoundCompany: "云知声智能科技股份有限公司",
    unisoundPosition: "AI Labs 实习生",
    unisoundPeriod: "2026.01 – 2026.03",
    cailiCompany: "上海才历网络有限公司",
    cailiPosition: "算法实习生",
    cailiPeriod: "2025.08 – 2025.10",
    tiebaDescription: "原生 Kotlin 与 Jetpack Compose 构建的非官方贴吧 Android 客户端，支持浏览、搜索、收藏、媒体查看与本地阅读记录。",
    civilizationDescription: "一款针对 Civilization VI: Gathering Storm 的 AI 改进模组，旨在实现自适应战略、提升军事执行力，并让神级难度从开局到胜利都保持竞争性。",
    repoPilotDescription: "一个由 AI 驱动的编程工作流 Agent，可将仓库任务转化为计划、补丁提案、GitHub-aware diffs、验证反馈和经人工批准的编辑。",
    roleCollaborator: "协作者",
    roleMaintainer: "维护者"
  }
};

let currentLanguage = "en";
let citationCopyState = "idle";

const updateCitationCopyFeedback = () => {
  if (!citationCopyButton) {
    return;
  }

  const labelKey = citationCopyState === "copied"
    ? "citationCopied"
    : citationCopyState === "failed"
      ? "citationCopyFailed"
      : "copyCitationLabel";
  const label = translations[currentLanguage][labelKey];
  citationCopyButton.setAttribute("aria-label", label);
  citationCopyButton.setAttribute("title", label);

  if (citationCopyIcon && citationCopySuccessIcon) {
    citationCopyIcon.toggleAttribute("hidden", citationCopyState === "copied");
    citationCopySuccessIcon.toggleAttribute("hidden", citationCopyState !== "copied");
  }
};

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

const updateLanguageLinks = (language) => {
  languageLinks.forEach((link) => {
    if (!link.dataset.baseHref) {
      link.dataset.baseHref = link.getAttribute("href");
    }

    const url = new URL(link.dataset.baseHref, document.baseURI);
    if (language === "en") {
      url.searchParams.delete("lang");
    } else {
      url.searchParams.set("lang", language);
    }
    link.setAttribute("href", url.href);
  });
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

  updateLanguageLinks(language);
  updateMenuLabel();
  updateCitationCopyFeedback();
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

const copyText = async (text) => {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Local file previews may not grant access to the Clipboard API.
    }
  }

  const textarea = document.createElement("textarea");
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  document.body.append(textarea);
  textarea.select();

  const copied = document.execCommand("copy");
  textarea.remove();
  window.scrollTo(scrollX, scrollY);

  if (!copied) {
    throw new Error("Unable to copy citation");
  }
};

if (citationCopyButton && citationText) {
  let feedbackTimer;

  citationCopyButton.addEventListener("click", async () => {
    window.clearTimeout(feedbackTimer);

    try {
      await copyText(citationText.textContent.trim());
      citationCopyState = "copied";
    } catch {
      citationCopyState = "failed";
    }
    updateCitationCopyFeedback();

    feedbackTimer = window.setTimeout(() => {
      citationCopyState = "idle";
      updateCitationCopyFeedback();
    }, 1800);
  });
}
