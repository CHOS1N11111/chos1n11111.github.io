"use strict";

const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".site-navigation");
const masthead = document.querySelector(".masthead");
const navigationItems = Array.from(navigation.querySelectorAll("a[href*='#']"), (link) => {
  const sectionId = new URL(link.getAttribute("href"), document.baseURI).hash.slice(1);
  return {
    link,
    sectionId,
    section: document.getElementById(sectionId)
  };
});
const navigationSections = navigationItems.filter((item) => item.section);
const languageSwitchers = document.querySelectorAll(".language-switcher");
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
    projectDetails: "Project Details",
    backToProjects: "Back to Projects",
    projectActions: "Project links",
    projectOverviewHeading: "Overview",
    projectScreenshotsHeading: "Screenshots",
    dongqiudiProjectOverview: "DongqiudiPure Android is a lightweight, unofficial Dongqiudi client built natively with Kotlin and Jetpack Compose. It focuses on a clean Android browsing experience while keeping account-dependent features optional. The project is distributed under GPL-3.0-only and is independent of Dongqiudi and its official operator.",
    tiebaProjectOverview: "TiebaPure Android is a native Kotlin and Jetpack Compose client for Baidu Tieba that follows Android conventions for navigation, gestures, media, storage, and adaptive layouts. Visitors can browse recommendations, forums, search results, threads, nested replies, images, and videos without signing in; signed-in users can access messages, follows, favorites, check-ins, likes, posting, replies, and profile editing. Local features include filtering, history and reading-position recovery, offline thread storage, responsive phone and tablet layouts, custom reading fonts, and deep links. Posting, replies, and profile editing are experimental features that must be enabled explicitly.",
    civilizationProjectOverview: "Adaptive Strategic AI is a Gathering Storm AI overhaul designed to keep Deity games competitive from the opening through the victory screen. It replaces much of vanilla Deity's front-loaded spike with an era-scaled difficulty curve, while each major AI independently adjusts development, recovery, expansion, defense, pressure, and war plans based on its position and recent trend. The mod strengthens settlement, economy, military readiness, city assaults, wartime production, and victory-specific priorities, while limiting recovery bonuses to AIs with confirmed broad or severe deficits. It does not spawn units or grant technologies, civics, resources, cities, or stored progress.",
    repoPilotProjectOverview: "RepoPilot Agent is a local, approval-first coding Agent that converts repository tasks and GitHub issues into reviewable change proposals. It builds context from files, symbols, imports, Git state, and source-test relationships, then uses deterministic planning or an OpenAI-compatible LLM to produce plans, virtual diffs, and validation feedback. Writes happen only inside managed worktrees after exact human approval, with bounded repair, checkpoints, restart-safe recovery, and rollback evidence; the CLI and local Web UI also inspect GitHub issues, pull requests, reviews, comments, and CI status. RepoPilot never commits or pushes task changes automatically.",
    tiebaScreenshotHome: "Guest home",
    tiebaScreenshotThread: "Guest thread details",
    tiebaScreenshotFavorites: "Signed-in favorites",
    tiebaScreenshotSearch: "Guest search",
    tiebaScreenshotReplies: "Guest replies",
    tiebaScreenshotSettings: "Signed-in settings",
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
    dongqiudiDescription: "A lightweight, unofficial Dongqiudi client for Android, focused on clean browsing with optional account features.",
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
    projectDetails: "项目详情",
    backToProjects: "返回项目经历",
    projectActions: "项目链接",
    projectOverviewHeading: "项目介绍",
    projectScreenshotsHeading: "截图",
    dongqiudiProjectOverview: "DongqiudiPure Android 是一款使用 Kotlin 和 Jetpack Compose 原生构建的轻量级第三方懂球帝 Android 客户端。项目专注于简洁的浏览体验，并将依赖账户的功能保持为可选项。项目以 GPL-3.0-only 发布，与懂球帝及其官方运营方不存在隶属、授权或认可关系。",
    tiebaProjectOverview: "TiebaPure Android 是使用 Kotlin 与 Jetpack Compose 原生构建的第三方百度贴吧客户端，导航、手势、媒体播放、存储和自适应布局遵循 Android 平台惯例。未登录时可浏览推荐、贴吧列表、搜索结果、帖子、楼中楼、图片与视频；登录后可使用消息、关注、收藏同步、签到、点赞、发帖、回复和资料编辑等功能。本机功能还包括内容屏蔽、浏览历史与阅读位置恢复、帖子离线保存、手机和平板自适应布局、自定义阅读字体与深链接；发帖、回复和资料编辑目前仍是需要显式启用的实验性功能。",
    civilizationProjectOverview: "Adaptive Strategic AI 是一款面向 Gathering Storm 规则集的 AI 改进模组，目标是让神级难度从开局到胜利阶段都保持竞争性。它以随时代增长的难度曲线替代原版神级难度过度集中的前期压力，并让每个主要 AI 根据自身位置与近期趋势独立调整发展、恢复、扩张、防御、施压和战争计划。模组强化了定居、经济、军事准备、攻城、战时生产和不同胜利路线的执行，同时只向经确认存在广泛或严重落后情况的 AI 提供有限恢复支持。它不会生成单位，也不会直接授予科技、市政、资源、城市或已储存的进度。",
    repoPilotProjectOverview: "RepoPilot Agent 是一个本地运行、以审批为先的编程 Agent，可将仓库任务和 GitHub Issue 转化为可审查的代码变更提案。它从文件、符号、导入关系、Git 状态以及源码与测试的关系中构建上下文，再通过确定性规则或 OpenAI-compatible LLM 生成计划、虚拟 diff 和验证反馈。写入仅会在获得精确人工批准后发生于受管理的 worktree 中，并配有有限修复、检查点、可恢复执行和回滚证据；CLI 与本地 Web UI 还可检查 GitHub Issue、Pull Request、Review、评论和 CI 状态。RepoPilot 不会自动提交或推送任务变更。",
    tiebaScreenshotHome: "未登录访客首页",
    tiebaScreenshotThread: "未登录访客帖子详情",
    tiebaScreenshotFavorites: "登录后的帖子收藏",
    tiebaScreenshotSearch: "未登录访客搜索",
    tiebaScreenshotReplies: "未登录访客回复",
    tiebaScreenshotSettings: "登录后的设置",
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
    dongqiudiDescription: "一款轻量级的非官方懂球帝 Android 客户端，专注于简洁浏览，并提供可选的账户功能。",
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

const setCurrentNavigation = (sectionId) => {
  navigationItems.forEach((item) => {
    if (item.sectionId === sectionId) {
      item.link.setAttribute("aria-current", "location");
    } else {
      item.link.removeAttribute("aria-current");
    }
  });
};

const updateCurrentNavigation = () => {
  if (!navigationSections.length) {
    if (document.querySelector(".project-page")) {
      setCurrentNavigation("projects");
    } else if (document.querySelector(".publication-page")) {
      setCurrentNavigation("research-outputs");
    }
    return;
  }

  const hashSectionId = window.location.hash.slice(1);
  const hashItem = navigationSections.find((item) => item.sectionId === hashSectionId);
  if (hashItem) {
    const hashSectionRect = hashItem.section.getBoundingClientRect();
    const hashSectionVisible = hashSectionRect.bottom > masthead.offsetHeight && hashSectionRect.top < window.innerHeight;
    if (hashSectionVisible) {
      setCurrentNavigation(hashItem.sectionId);
      return;
    }
  }

  const activationLine = masthead.offsetHeight + Math.min(240, window.innerHeight * 0.25);
  let currentItem = navigationSections[0];

  navigationSections.forEach((item) => {
    if (item.section.getBoundingClientRect().top <= activationLine) {
      currentItem = item;
    }
  });

  setCurrentNavigation(currentItem.sectionId);
};

let navigationUpdateFrame;
const queueCurrentNavigationUpdate = () => {
  if (navigationUpdateFrame) {
    return;
  }

  navigationUpdateFrame = window.requestAnimationFrame(() => {
    navigationUpdateFrame = undefined;
    updateCurrentNavigation();
  });
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

  document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
    const translation = translations[language][element.dataset.i18nAlt];
    if (typeof translation === "string") {
      element.setAttribute("alt", translation);
    }
  });

  languageOptions.forEach((option) => {
    option.setAttribute("aria-pressed", String(option.dataset.language === language));
  });

  updateLanguageLinks(language);
  updateMenuLabel();
  updateCitationCopyFeedback();
  queueCurrentNavigationUpdate();
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
  const link = event.target.closest("a");
  if (link) {
    const sectionId = new URL(link.getAttribute("href"), document.baseURI).hash.slice(1);
    if (document.getElementById(sectionId)) {
      setCurrentNavigation(sectionId);
    }
    setMenuOpen(false);
  }
});

window.addEventListener("scroll", queueCurrentNavigationUpdate, { passive: true });
window.addEventListener("resize", queueCurrentNavigationUpdate);
window.addEventListener("hashchange", queueCurrentNavigationUpdate);

languageSwitchers.forEach((languageSwitcher) => {
  languageSwitcher.addEventListener("click", (event) => {
    const option = event.target.closest(".language-option");
    if (option) {
      setLanguage(option.dataset.language);
      updateLanguageUrl(option.dataset.language);
    }
  });
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
