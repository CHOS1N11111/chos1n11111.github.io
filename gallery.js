"use strict";

(() => {
  const gallery = document.querySelector(".project-detail");
  const links = gallery?.querySelectorAll(".project-screenshot a");
  if (!links?.length || !window.PhotoSwipeLightbox || !window.PhotoSwipe) {
    return;
  }

  const siteRoot = new URL(".", document.currentScript.src);
  const icon = (name, className = "") => {
    const image = document.createElement("img");
    image.src = new URL(`assets/vendor/lucide/icons/${name}.svg`, siteRoot).href;
    image.alt = "";
    image.className = `pswp__icn ${className}`;
    return image.outerHTML;
  };
  const lightbox = new PhotoSwipeLightbox({
    gallery,
    children: ".project-screenshot a",
    pswpModule: PhotoSwipe,
    mainClass: "project-viewer",
    bgOpacity: 1,
    showHideAnimationType: "fade",
    showAnimationDuration: 180,
    hideAnimationDuration: 180,
    zoomAnimationDuration: 180,
    returnFocus: false,
    imageClickAction: "zoom",
    clickToCloseNonZoomable: false,
    closeSVG: icon("x"),
    arrowPrevSVG: icon("chevron-left"),
    arrowNextSVG: icon("chevron-right"),
    zoomSVG: icon("zoom-in", "pswp__zoom-in") + icon("zoom-out", "pswp__zoom-out"),
    paddingFn: (viewport) => ({
      top: 64,
      bottom: 56,
      left: viewport.x > 768 ? 64 : 12,
      right: viewport.x > 768 ? 64 : 12
    })
  });

  // Reuse each thumbnail's intrinsic dimensions and translated alt text.
  lightbox.addFilter("domItemData", (itemData, element) => {
    const image = element.querySelector("img");
    itemData.width = Number(image.getAttribute("width"));
    itemData.height = Number(image.getAttribute("height"));
    itemData.alt = image.alt;
    return itemData;
  });

  let returnTarget;
  let scrollPosition;
  let labels;
  lightbox.on("beforeOpen", () => {
    const { pswp } = lightbox;
    labels = translations[currentLanguage];
    Object.assign(pswp.options, {
      closeTitle: labels.galleryClose,
      arrowPrevTitle: labels.galleryPrevious,
      arrowNextTitle: labels.galleryNext,
      zoomTitle: labels.galleryZoomIn,
      errorMsg: labels.galleryError
    });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      pswp.options.showAnimationDuration = 0;
      pswp.options.hideAnimationDuration = 0;
      pswp.options.zoomAnimationDuration = 0;
    }
    returnTarget = links[pswp.options.index];
    scrollPosition = { left: window.scrollX, top: window.scrollY };
    document.documentElement.classList.add("gallery-open");
  });

  lightbox.on("uiRegister", () => {
    const { pswp } = lightbox;
    pswp.ui.registerElement({
      name: "caption",
      order: 9,
      appendTo: "root",
      onInit: (element) => {
        element.id = "gallery-caption";
        element.setAttribute("aria-live", "polite");
        element.setAttribute("aria-atomic", "true");
        pswp.on("change", () => {
          const figure = pswp.currSlide.data.element.closest("figure");
          element.textContent = figure.querySelector("figcaption")?.textContent || "";
        });
      }
    });
  });

  const updateZoomLabel = () => {
    const { pswp } = lightbox;
    const slide = pswp.currSlide;
    const button = pswp.element.querySelector(".pswp__button--zoom");
    if (slide && button) {
      const zoomedIn = slide.currZoomLevel > slide.zoomLevels.initial;
      button.title = zoomedIn ? labels.galleryZoomOut : labels.galleryZoomIn;
      button.setAttribute("aria-label", button.title);
    }
  };
  lightbox.on("change", updateZoomLabel);
  lightbox.on("zoomPanUpdate", updateZoomLabel);
  lightbox.on("afterInit", () => {
    const { element } = lightbox.pswp;
    element.setAttribute("aria-modal", "true");
    element.setAttribute("aria-label", labels.galleryLabel);
    element.setAttribute("aria-describedby", "gallery-caption");
  });
  lightbox.on("bindEvents", () => {
    lightbox.pswp.element.focus({ preventScroll: true });
  });
  lightbox.on("destroy", () => {
    document.documentElement.classList.remove("gallery-open");
    returnTarget?.focus({ preventScroll: true });
    window.scrollTo({ ...scrollPosition, behavior: "instant" });
  });

  lightbox.init();
  links.forEach((link) => link.setAttribute("aria-haspopup", "dialog"));
})();
