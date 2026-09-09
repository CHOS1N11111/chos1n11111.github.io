"use strict";

const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".site-navigation");
const masthead = document.querySelector(".masthead");
const siteRootUrl = new URL(".", document.querySelector('script[src*="script.js"]').src);
const currentLanguage = document.documentElement.lang === "zh-CN" ? "zh-CN" : "en";

const getLanguagePageUrl = (language) => {
  const url = new URL(window.location.href);
  let pagePath = url.pathname.slice(siteRootUrl.pathname.length).replace(/^zh\//, "");
  if (url.protocol === "file:") {
    if (!pagePath || pagePath.endsWith("/")) pagePath += "index.html";
  } else {
    pagePath = pagePath.replace(/index\.html$/, "");
  }
  url.pathname = new URL(`${language === "zh-CN" ? "zh/" : ""}${pagePath}`, siteRootUrl).pathname;
  url.searchParams.delete("lang");
  return url;
};

// Keep previously shared query-based language URLs working after the static-page migration.
const requestedLanguage = new URLSearchParams(window.location.search).get("lang");
if (requestedLanguage === "en" || requestedLanguage === "zh-CN") {
  const destination = getLanguagePageUrl(requestedLanguage);
  if (destination.pathname !== window.location.pathname) {
    window.location.replace(destination.href);
  } else {
    try {
      window.history.replaceState(null, "", destination);
    } catch {
      // Local file previews may not allow history updates.
    }
  }
}

const navigationSubmenus = [
  {
    sectionId: "work-experience",
    triggerId: "navigation-work",
    items: [
      { path: "work/smartsens/index.html", label: "SmartSens Technology (Shanghai) Co., Ltd.", translationKey: "smartSensCompany" },
      { path: "work/unisound/index.html", label: "Unisound AI Technology Co., Ltd.", translationKey: "unisoundCompany" },
      { path: "work/hrtps/index.html", label: "Shanghai Caili Network Co., Ltd.", translationKey: "cailiCompany" }
    ]
  },
  {
    sectionId: "projects",
    triggerId: "navigation-projects",
    items: [
      { path: "projects/dongqiudipure-android/index.html", label: "DongqiudiPure Android" },
      { path: "projects/tiebapure-android/index.html", label: "TiebaPure Android" },
      { path: "projects/adaptive-strategic-ai-mod-for-civilization-vi/index.html", label: "Adaptive Strategic AI mod for Civilization VI" },
      { path: "projects/repopilot-agent/index.html", label: "RepoPilot Agent" }
    ]
  },
  {
    sectionId: "research-outputs",
    triggerId: "navigation-research",
    alignEnd: true,
    items: [
      {
        path: "publications/option-based-hierarchical-uav-networks/index.html",
        label: "An Option-Based Hierarchical Approach for Dynamic Mobile Crowdsensing Over Edge-Assisted UAV Networks"
      }
    ]
  }
];

const initializeNavigationSubmenus = () => {
  navigationSubmenus.forEach(({ sectionId, triggerId, alignEnd, items }) => {
    const trigger = navigation.querySelector(`a[href$="#${sectionId}"]`);
    if (!trigger || trigger.closest(".navigation-item")) {
      return;
    }

    const group = document.createElement("div");
    group.className = alignEnd ? "navigation-item navigation-item-end" : "navigation-item";

    const submenu = document.createElement("ul");
    submenu.className = "navigation-submenu";
    submenu.setAttribute("aria-labelledby", triggerId);
    trigger.id = triggerId;

    items.forEach(({ path, label, translationKey }) => {
      const listItem = document.createElement("li");
      const link = document.createElement("a");
      link.href = new URL(`${currentLanguage === "zh-CN" ? "zh/" : ""}${path}`, siteRootUrl).href;
      link.textContent = translations[currentLanguage][translationKey] || label;
      link.setAttribute("data-preserve-language", "");
      if (translationKey) {
        link.dataset.i18n = translationKey;
      }
      listItem.append(link);
      submenu.append(listItem);
    });

    trigger.before(group);
    group.append(trigger, submenu);
    group.addEventListener("pointerenter", () => group.classList.remove("is-dismissed"));
    group.addEventListener("focusin", (event) => {
      if (!group.contains(event.relatedTarget)) group.classList.remove("is-dismissed");
    });
  });

  const currentPath = new URL(window.location.href).pathname.replace(/\/index\.html$/, "/");
  navigation.querySelectorAll(".navigation-submenu a").forEach((link) => {
    const linkPath = new URL(link.href).pathname.replace(/\/index\.html$/, "/");
    if (linkPath === currentPath) {
      link.setAttribute("aria-current", "page");
    }
  });
};

initializeNavigationSubmenus();

const navigationItems = Array.from(navigation.querySelectorAll("a[href*='#']"), (link) => {
  const sectionId = new URL(link.getAttribute("href"), document.baseURI).hash.slice(1);
  return {
    link,
    sectionId,
    section: document.getElementById(sectionId)
  };
});
const navigationSections = navigationItems.filter((item) => item.section);
let anchorNavigation = { sectionId: window.location.hash.slice(1), reached: false };
const languageSwitchers = document.querySelectorAll(".language-switcher");
const languageOptions = document.querySelectorAll(".language-option");
const citationCopyButton = document.querySelector("[data-copy-citation]");
const citationText = document.querySelector("[data-citation-text]");
const citationCopyIcon = document.querySelector("[data-copy-icon]");
const citationCopySuccessIcon = document.querySelector("[data-copy-success-icon]");


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
    if (document.querySelector(".work-page")) {
      setCurrentNavigation("work-experience");
    } else if (document.querySelector(".project-page")) {
      setCurrentNavigation("projects");
    } else if (document.querySelector(".publication-page")) {
      setCurrentNavigation("research-outputs");
    }
    return;
  }

  const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const anchorItem = navigationSections.find((item) => item.sectionId === anchorNavigation?.sectionId);
  if (anchorItem) {
    // Near the footer, different explicit anchors can share the same scroll position.
    const margin = parseFloat(getComputedStyle(anchorItem.section).scrollMarginTop) || 0;
    const targetScroll = Math.max(0, Math.min(maxScroll, window.scrollY + anchorItem.section.getBoundingClientRect().top - margin));
    if (Math.abs(window.scrollY - targetScroll) <= 2) {
      anchorNavigation.reached = true;
      setCurrentNavigation(anchorItem.sectionId);
      return;
    }
    if (!anchorNavigation.reached) {
      setCurrentNavigation(anchorItem.sectionId);
      return;
    }
    anchorNavigation = null;
  }

  if (maxScroll > 0 && window.scrollY >= maxScroll - 2) {
    setCurrentNavigation(navigationSections.at(-1).sectionId);
    return;
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

const updateLanguageOptionLinks = () => {
  languageOptions.forEach((option) => {
    const url = getLanguagePageUrl(option.dataset.language);
    if (navigationSections.length) {
      const activeSection = navigationItems.find(({ link }) => link.getAttribute("aria-current") === "location");
      if (activeSection) {
        const hasAnchorContext = anchorNavigation?.sectionId === activeSection.sectionId;
        url.hash = hasAnchorContext || window.scrollY > masthead.offsetHeight ? activeSection.sectionId : "";
      }
    }
    option.href = url.href;
  });
};

let navigationUpdateFrame;
const queueCurrentNavigationUpdate = () => {
  if (navigationUpdateFrame) {
    return;
  }

  navigationUpdateFrame = window.requestAnimationFrame(() => {
    navigationUpdateFrame = undefined;
    updateCurrentNavigation();
    updateLanguageOptionLinks();
  });
};

menuToggle.addEventListener("click", () => {
  setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
});

navigation.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (link) {
    const sectionId = new URL(link.getAttribute("href"), document.baseURI).hash.slice(1);
    if (document.getElementById(sectionId)) {
      anchorNavigation = { sectionId, reached: false };
      setCurrentNavigation(sectionId);
    }
    setMenuOpen(false);
  }
});

window.addEventListener("scroll", queueCurrentNavigationUpdate, { passive: true });
window.addEventListener("resize", () => {
  if (menuToggle.getClientRects().length === 0 && menuToggle.getAttribute("aria-expanded") === "true") {
    setMenuOpen(false);
  }
  queueCurrentNavigationUpdate();
});
window.addEventListener("hashchange", () => {
  anchorNavigation = { sectionId: window.location.hash.slice(1), reached: false };
  queueCurrentNavigationUpdate();
});

const resumeScrollNavigation = (event) => {
  if (event?.target instanceof Element && event.target.closest(".profile-sidebar, .site-navigation, .pswp")) return;
  anchorNavigation = null;
  queueCurrentNavigationUpdate();
};
window.addEventListener("wheel", resumeScrollNavigation, { passive: true });
window.addEventListener("touchmove", resumeScrollNavigation, { passive: true });

languageSwitchers.forEach((languageSwitcher) => {
  languageSwitcher.addEventListener("click", (event) => {
    const option = event.target.closest(".language-option");
    if (option) {
      updateCurrentNavigation();
      updateLanguageOptionLinks();
      if (option.dataset.language === currentLanguage) event.preventDefault();
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (document.querySelector(".pswp--open")) return;
  if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) {
    resumeScrollNavigation(event);
  }
  if (event.key !== "Escape") return;
  if (menuToggle.getAttribute("aria-expanded") === "true") {
    setMenuOpen(false);
    menuToggle.focus();
  } else if (menuToggle.getClientRects().length === 0) {
    navigation.querySelectorAll(".navigation-item").forEach((group) => {
      const submenu = group.querySelector(".navigation-submenu");
      if (getComputedStyle(submenu).visibility !== "visible") return;
      const restoreFocus = submenu.contains(document.activeElement);
      group.classList.add("is-dismissed");
      if (restoreFocus) group.querySelector("a").focus({ preventScroll: true });
    });
  }
});

updateMenuLabel();
updateCitationCopyFeedback();
updateLanguageOptionLinks();
queueCurrentNavigationUpdate();

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
