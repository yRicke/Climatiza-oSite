(() => {
  "use strict";

  const config = window.SITE_CONFIG || {};
  const services = window.SERVICES || [];
  const posts = window.POSTS || [];
  const locations = window.LOCATIONS || [];
  const faqData = window.FAQ_DATA || {};
  const body = document.body;

  const page = body.dataset.page || "";
  const currentSlug = body.dataset.slug || "";

  const siteLinks = {
    home: "/",
    about: "/sobre.html",
    services: "/servicos.html",
    commercial: "/refrigeracao-comercial.html",
    areas: "/areas-atendidas.html",
    blog: "/blog.html",
    contact: "/contato.html"
  };

  const navItems = [
    { key: "home", label: "Home", href: siteLinks.home },
    { key: "about", label: "Sobre", href: siteLinks.about },
    { key: "services", label: "Serviços", href: siteLinks.services },
    { key: "commercial", label: "Refrigeração Comercial", href: siteLinks.commercial },
    { key: "areas", label: "Áreas Atendidas", href: siteLinks.areas },
    { key: "blog", label: "Blog", href: siteLinks.blog },
    { key: "contact", label: "Contato", href: siteLinks.contact }
  ];

  function safeText(text) {
    return String(text || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function formatDate(dateString) {
    const date = new Date(`${dateString}T12:00:00`);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).format(date);
  }

  function whatsappUrl(message) {
    const text = message || config.whatsappDefaultMessage || "Olá, preciso de atendimento.";
    return `https://wa.me/${config.phoneRaw || "5564992377425"}?text=${encodeURIComponent(text)}`;
  }

  function injectSchema(schemaObject) {
    if (!schemaObject) return;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schemaObject);
    document.head.appendChild(script);
  }

  function localBusinessSchema() {
    const cityList = (config.mainCities || []).map((city) => ({
      "@type": "City",
      name: city
    }));

    return {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: config.companyName,
      image: `${config.baseUrl}/assets/img/hero-climatizacao.svg`,
      telephone: config.phone,
      email: config.email,
      areaServed: [
        { "@type": "State", name: config.servedState || "Goiás" },
        ...cityList
      ],
      address: {
        "@type": "PostalAddress",
        streetAddress: config.addressStreet || "",
        addressLocality: config.addressLocality || "",
        postalCode: config.postalCode || "",
        addressRegion: config.addressRegion || "GO",
        addressCountry: config.addressCountry || "BR"
      },
      openingHours: config.openingHours,
      url: config.baseUrl
    };
  }

  function faqSchema(faqItems) {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer
        }
      }))
    };
  }

  function serviceSchema(service) {
    return {
      "@context": "https://schema.org",
      "@type": "Service",
      serviceType: service.name,
      provider: {
        "@type": "LocalBusiness",
        name: config.companyName
      },
      areaServed: (config.mainCities || []).map((city) => ({
        "@type": "City",
        name: city
      })),
      description: service.description,
      url: `${config.baseUrl}/servicos/${service.slug}.html`
    };
  }

  function articleSchema(post) {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      image: [`${config.baseUrl}${post.image}`],
      datePublished: post.date,
      dateModified: post.date,
      author: {
        "@type": "Organization",
        name: config.companyName
      },
      publisher: {
        "@type": "Organization",
        name: config.companyName
      },
      description: post.description,
      mainEntityOfPage: `${config.baseUrl}/blog/${post.slug}.html`
    };
  }

  function renderHeader() {
    const header = document.getElementById("site-header");
    if (!header) return;

    const isActive = (key) => {
      if (page === "service-detail") return key === "services";
      if (page === "post-detail") return key === "blog";
      if (page === "location-detail") return key === "areas";
      return key === page;
    };

    const navMarkup = navItems
      .map((item) => `<li><a href="${item.href}" ${isActive(item.key) ? 'aria-current="page"' : ""}>${item.label}</a></li>`)
      .join("");

    header.innerHTML = `
      <div class="topbar">
        <div class="container topbar-inner">
          <p>Atendimento em todo o estado de Goiás</p>
          <a class="js-whatsapp-link" href="${whatsappUrl()}">WhatsApp: ${config.phone || "(64) 99237-7425"}</a>
        </div>
      </div>
      <div class="container nav-wrap">
        <a class="brand" href="/" aria-label="Página inicial da Fórmula Climatização">
          <img class="brand-logo" src="/assets/img/logo_formula.png" width="260" height="104" alt="Logo Fórmula Climatização">
        </a>
        <button class="menu-toggle" type="button" aria-label="Abrir menu" aria-expanded="false">Menu</button>
        <nav id="site-nav" aria-label="Menu principal">
          <ul>${navMarkup}</ul>
        </nav>
      </div>
    `;

    const toggle = header.querySelector(".menu-toggle");
    const nav = header.querySelector("#site-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      nav.classList.toggle("open", !expanded);
    });
  }

  function renderFooter() {
    const footer = document.getElementById("site-footer");
    if (!footer) return;

    const links = navItems
      .map((item) => `<li><a href="${item.href}">${item.label}</a></li>`)
      .join("");

    const socialLinks = [
      { label: "Instagram", href: config.social?.instagram },
      { label: "YouTube", href: config.social?.youtube },
      { label: "Google", href: config.social?.google }
    ]
      .filter((item) => item.href)
      .map((item) => `<li><a href="${item.href}" target="_blank" rel="noopener">${item.label}</a></li>`)
      .join("");

    footer.innerHTML = `
      <div class="footer-main">
        <div class="container footer-grid">
          <section>
            <h2>${config.companyName || "Fórmula Climatização"}</h2>
            <p>Venda, instalação e manutenção de ar-condicionado e refrigeração comercial em Goiás.</p>
            <p><strong>WhatsApp:</strong> <a class="js-whatsapp-link" href="${whatsappUrl()}">${config.phone || "(64) 99237-7425"}</a></p>
            <p><strong>E-mail:</strong> <a href="mailto:${config.email || "marcostec.profissional@gmail.com"}">${config.email || "marcostec.profissional@gmail.com"}</a></p>
            ${config.addressFull ? `<p><strong>Endereço:</strong> ${safeText(config.addressFull)}</p>` : ""}
          </section>
          <section>
            <h2>Links rápidos</h2>
            <ul class="footer-links">${links}</ul>
          </section>
          <section>
            <h2>Cidades atendidas</h2>
            <ul class="footer-links">
              ${(config.mainCities || []).map((city) => `<li>${city}</li>`).join("")}
            </ul>
            ${socialLinks ? `<h2 class="footer-subtitle">Redes</h2><ul class="footer-links">${socialLinks}</ul>` : ""}
          </section>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="container">
          <p>&copy; ${new Date().getFullYear()} ${config.companyName || "Fórmula Climatização"}. Todos os direitos reservados.</p>
        </div>
      </div>
    `;
  }

  function renderFloatingWhatsApp() {
    const wrapper = document.getElementById("floating-whatsapp");
    if (!wrapper) return;

    wrapper.innerHTML = `
      <a class="floating-whatsapp js-whatsapp-link" href="${whatsappUrl()}" target="_blank" rel="noopener" aria-label="Fale no WhatsApp">
        WhatsApp
      </a>
    `;
  }

  function applyWhatsappLinks() {
    const links = document.querySelectorAll(".js-whatsapp-link");
    links.forEach((link) => {
      const customMessage = link.dataset.message || "";
      link.setAttribute("href", whatsappUrl(customMessage));
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener");
    });
  }

  function serviceCard(service) {
    return `
      <article class="card">
        <img src="${service.image}" width="480" height="260" alt="${safeText(service.name)}" loading="lazy">
        <div class="card-body">
          <h3>${safeText(service.name)}</h3>
          <p>${safeText(service.shortDescription)}</p>
          <a class="btn btn-outline" href="/servicos/${service.slug}.html">Ver detalhes</a>
        </div>
      </article>
    `;
  }

  function blogCard(post) {
    return `
      <article class="card">
        <img src="${post.image}" width="480" height="260" alt="${safeText(post.title)}" loading="lazy">
        <div class="card-body">
          <p class="meta">${formatDate(post.date)} | ${safeText(post.category)}</p>
          <h3>${safeText(post.title)}</h3>
          <p>${safeText(post.description)}</p>
          <a class="btn btn-outline" href="/blog/${post.slug}.html">Ler postagem</a>
        </div>
      </article>
    `;
  }

  function locationCard(location) {
    return `
      <article class="card location-card">
        <img src="${location.image || "/assets/img/city-map.svg"}" width="480" height="260" alt="Atendimento da Fórmula Climatização em ${safeText(location.name)}" loading="lazy">
        <div class="card-body">
          <h3>${safeText(location.name)}</h3>
          <p>${safeText(location.intro)}</p>
          <a class="btn btn-outline" href="/areas-atendidas/${location.slug}.html">Ver página local</a>
        </div>
      </article>
    `;
  }

  function renderFaq(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container || !items || !items.length) return;

    container.innerHTML = items
      .map(
        (item) => `
          <details class="faq-item">
            <summary>${safeText(item.question)}</summary>
            <p>${safeText(item.answer)}</p>
          </details>
        `
      )
      .join("");
  }

  function renderReviews(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = (config.testimonials || [])
      .map(
        (item) => `
          <article class="review-card">
            <p>"${safeText(item.text)}"</p>
            <strong>${safeText(item.name)}</strong>
            <span>${safeText(item.city)}</span>
          </article>
        `
      )
      .join("");
  }

  function renderBreadcrumb(items) {
    const holder = document.getElementById("breadcrumb");
    if (!holder || !items || !items.length) return;

    holder.innerHTML = `
      <nav aria-label="Breadcrumb">
        <ol class="breadcrumb">
          ${items
            .map((item, index) => {
              const isLast = index === items.length - 1;
              if (isLast) return `<li aria-current="page">${safeText(item.label)}</li>`;
              return `<li><a href="${item.href}">${safeText(item.label)}</a></li>`;
            })
            .join("")}
        </ol>
      </nav>
    `;
  }

  function initCarousel(trackId, prevId, nextId, itemSelector = ".card") {
    const track = document.getElementById(trackId);
    const prevButton = document.getElementById(prevId);
    const nextButton = document.getElementById(nextId);
    if (!track || !prevButton || !nextButton) return;

    const getStep = () => {
      const firstCard = track.querySelector(itemSelector);
      if (!firstCard) return track.clientWidth;
      const styles = window.getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap || "16");
      return firstCard.getBoundingClientRect().width + gap;
    };

    const updateButtons = () => {
      const maxScrollLeft = Math.max(track.scrollWidth - track.clientWidth - 1, 0);
      prevButton.disabled = track.scrollLeft <= 1;
      nextButton.disabled = track.scrollLeft >= maxScrollLeft;
    };

    prevButton.addEventListener("click", () => {
      track.scrollBy({ left: -getStep(), behavior: "smooth" });
    });

    nextButton.addEventListener("click", () => {
      track.scrollBy({ left: getStep(), behavior: "smooth" });
    });

    track.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);
    updateButtons();
  }

  function findService(slug) {
    return services.find((item) => item.slug === slug);
  }

  function findPost(slug) {
    return posts.find((item) => item.slug === slug);
  }

  function findLocation(slug) {
    return locations.find((item) => item.slug === slug);
  }

  function renderHome() {
    const homeServices = document.getElementById("home-services-grid");
    const homeLocations = document.getElementById("home-locations-grid");

    if (homeServices) {
      homeServices.innerHTML = services.slice(0, 6).map(serviceCard).join("");
      initCarousel("home-services-grid", "home-services-prev", "home-services-next");
    }
    if (homeLocations) {
      homeLocations.innerHTML = locations.map(locationCard).join("");
    }

    renderReviews("reviews-list");
    renderFaq("home-faq-list", faqData.home || []);

    if ((faqData.home || []).length) {
      injectSchema(faqSchema(faqData.home));
    }
  }

  function renderAbout() {
    const grid = document.getElementById("about-locations-grid");
    if (grid) {
      grid.innerHTML = locations.map(locationCard).join("");
    }
    renderBreadcrumb([
      { label: "Home", href: "/" },
      { label: "Sobre", href: "/sobre.html" }
    ]);
  }

  function renderServicesHub() {
    const clim = document.getElementById("services-grid-climatizacao");
    const refrig = document.getElementById("services-grid-refrigeracao");

    if (clim) {
      clim.innerHTML = services.filter((s) => s.category === "climatizacao").map(serviceCard).join("");
    }
    if (refrig) {
      refrig.innerHTML = services.filter((s) => s.category === "refrigeracao").map(serviceCard).join("");
    }

    renderBreadcrumb([
      { label: "Home", href: "/" },
      { label: "Serviços", href: "/servicos.html" }
    ]);
  }

  function renderServiceDetail() {
    const service = findService(currentSlug);
    const title = document.getElementById("service-title");
    const subtitle = document.getElementById("service-subtitle");
    const bannerImage = document.getElementById("service-image");
    const gallerySection = document.getElementById("service-gallery-section");
    const galleryTrack = document.getElementById("service-gallery-track");
    const description = document.getElementById("service-description");
    const benefits = document.getElementById("service-benefits");
    const problems = document.getElementById("service-problems");
    const process = document.getElementById("service-process");
    const related = document.getElementById("service-related");
    const areas = document.getElementById("service-areas");

    if (!service) {
      if (title) title.textContent = "Serviço não encontrado";
      return;
    }

    if (title) title.textContent = service.name;
    if (subtitle) subtitle.textContent = service.shortDescription;
    if (bannerImage) {
      bannerImage.src = service.image || "/assets/img/service-default.svg";
      bannerImage.alt = `Imagem do serviço: ${service.name}`;
    }

    if (gallerySection && galleryTrack) {
      const galleryImages = Array.isArray(service.galleryImages) ? service.galleryImages : [];
      const extraImages = galleryImages.slice(1);

      if (extraImages.length) {
        gallerySection.hidden = false;
        galleryTrack.innerHTML = extraImages
          .map(
            (src, index) => `
              <article class="gallery-slide">
                <img src="${src}" alt="Imagem ${index + 2} do serviço ${safeText(service.name)}" width="1200" height="720" loading="lazy">
              </article>
            `
          )
          .join("");
        initCarousel("service-gallery-track", "service-gallery-prev", "service-gallery-next", ".gallery-slide");
      } else {
        gallerySection.hidden = true;
        galleryTrack.innerHTML = "";
      }
    }

    if (description) description.textContent = service.description;

    if (benefits) {
      benefits.innerHTML = service.benefits.map((item) => `<li>${safeText(item)}</li>`).join("");
    }
    if (problems) {
      problems.innerHTML = service.problems.map((item) => `<li>${safeText(item)}</li>`).join("");
    }
    if (process) {
      process.innerHTML = service.process.map((item) => `<li>${safeText(item)}</li>`).join("");
    }
    if (areas) {
      areas.innerHTML = (config.mainCities || []).map((item) => `<li>${safeText(item)} e região</li>`).join("");
    }
    if (related) {
      const relatedServices = services.filter((item) => item.category === service.category && item.slug !== service.slug).slice(0, 3);
      related.innerHTML = relatedServices.map(serviceCard).join("");
    }

    renderReviews("reviews-list");
    renderFaq("service-faq", service.faq);
    renderBreadcrumb([
      { label: "Home", href: "/" },
      { label: "Serviços", href: "/servicos.html" },
      { label: service.name, href: `/servicos/${service.slug}.html` }
    ]);

    injectSchema(serviceSchema(service));
    if ((service.faq || []).length) {
      injectSchema(faqSchema(service.faq));
    }
  }

  function renderCommercial() {
    const grid = document.getElementById("commercial-services-grid");
    if (grid) {
      grid.innerHTML = services.filter((service) => service.category === "refrigeracao").map(serviceCard).join("");
    }
    renderBreadcrumb([
      { label: "Home", href: "/" },
      { label: "Refrigeração Comercial", href: "/refrigeracao-comercial.html" }
    ]);
  }

  function renderAreas() {
    const grid = document.getElementById("locations-grid");
    if (grid) {
      grid.innerHTML = locations.map(locationCard).join("");
    }
    renderBreadcrumb([
      { label: "Home", href: "/" },
      { label: "Áreas Atendidas", href: "/areas-atendidas.html" }
    ]);
  }

  function renderLocationDetail() {
    const location = findLocation(currentSlug);
    const title = document.getElementById("location-title");
    const subtitle = document.getElementById("location-subtitle");
    const image = document.getElementById("location-image");
    const context = document.getElementById("location-context");
    const servicesList = document.getElementById("location-services");

    if (!location) {
      if (title) title.textContent = "Localidade não encontrada";
      return;
    }

    if (title) title.textContent = `Atendimento em ${location.name} - GO`;
    if (subtitle) subtitle.textContent = location.intro;
    if (image) {
      image.src = location.image || "/assets/img/city-map.svg";
      image.alt = `Imagem da região ${location.name}`;
    }
    if (context) context.textContent = location.localContext;

    if (servicesList) {
      const localServices = location.serviceSlugs.map((slug) => findService(slug)).filter(Boolean);
      servicesList.innerHTML = localServices.map(serviceCard).join("");
    }

    renderFaq("location-faq", location.faq || []);
    renderBreadcrumb([
      { label: "Home", href: "/" },
      { label: "Áreas Atendidas", href: "/areas-atendidas.html" },
      { label: location.name, href: `/areas-atendidas/${location.slug}.html` }
    ]);

    if ((location.faq || []).length) {
      injectSchema(faqSchema(location.faq));
    }
  }

  function renderBlogHub() {
    const grid = document.getElementById("blog-grid");
    if (grid) {
      grid.innerHTML = posts.map(blogCard).join("");
    }
    renderBreadcrumb([
      { label: "Home", href: "/" },
      { label: "Blog", href: "/blog.html" }
    ]);
  }

  function renderPostDetail() {
    const post = findPost(currentSlug);
    const title = document.getElementById("post-title");
    const meta = document.getElementById("post-meta");
    const desc = document.getElementById("post-description");
    const content = document.getElementById("post-content");
    const related = document.getElementById("related-posts");

    if (!post) {
      if (title) title.textContent = "Postagem não encontrada";
      return;
    }

    if (title) title.textContent = post.title;
    if (meta) meta.textContent = `${formatDate(post.date)} | ${post.category}`;
    if (desc) desc.textContent = post.description;
    if (content) {
      content.innerHTML = post.content.map((paragraph) => `<p>${safeText(paragraph)}</p>`).join("");
    }
    if (related) {
      related.innerHTML = posts.filter((item) => item.slug !== post.slug).slice(0, 3).map(blogCard).join("");
    }

    renderBreadcrumb([
      { label: "Home", href: "/" },
      { label: "Blog", href: "/blog.html" },
      { label: post.title, href: `/blog/${post.slug}.html` }
    ]);
    injectSchema(articleSchema(post));
  }

  function renderContact() {
    renderBreadcrumb([
      { label: "Home", href: "/" },
      { label: "Contato", href: "/contato.html" }
    ]);

    const form = document.getElementById("contact-form");
    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const nome = formData.get("nome");
        const telefone = formData.get("telefone");
        const cidade = formData.get("cidade");
        const mensagem = formData.get("mensagem");
        const text = `Olá, meu nome é ${nome}. Telefone: ${telefone}. Cidade: ${cidade}. Mensagem: ${mensagem}`;
        window.open(whatsappUrl(text), "_blank", "noopener");
      });
    }

    if ((faqData.contact || []).length) {
      injectSchema(faqSchema(faqData.contact));
    }
  }

  function runPage() {
    renderHeader();
    renderFooter();
    renderFloatingWhatsApp();
    applyWhatsappLinks();
    injectSchema(localBusinessSchema());

    switch (page) {
      case "home":
        renderHome();
        break;
      case "about":
        renderAbout();
        break;
      case "services":
        renderServicesHub();
        break;
      case "service-detail":
        renderServiceDetail();
        break;
      case "commercial":
        renderCommercial();
        break;
      case "areas":
        renderAreas();
        break;
      case "location-detail":
        renderLocationDetail();
        break;
      case "blog":
        renderBlogHub();
        break;
      case "post-detail":
        renderPostDetail();
        break;
      case "contact":
        renderContact();
        break;
      default:
        break;
    }
  }

  runPage();
})();



