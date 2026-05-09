export type Locale = "es" | "en";

export type AudienceKey =
  | "customers"
  | "buyers"
  | "distributors"
  | "sales"
  | "employees"
  | "communities"
  | "existing";

export interface NavItem {
  label: string;
  href: string;
}

export interface SeoBlock {
  title: string;
  description: string;
}

export interface HeroCta {
  label: string;
  href: string;
}

export interface ProductCardContent {
  name: string;
  title: string;
  description: string;
  href: string;
  eyebrow?: string;
}

export interface StatItem {
  label: string;
  value: string;
}

export interface BlogFrontmatter {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  date: string;
  seoTitle?: string;
  seoDescription?: string;
  coverImage?: string;
  locale: Locale;
  status?: "draft" | "published";
  source?: "seed" | "admin";
}

export interface CaseStudyFrontmatter {
  title: string;
  slug: string;
  excerpt: string;
  summary: string;
  sector: string;
  locale: Locale;
  coverImage?: string;
  outcomes: string[];
  client?: string;
  programName?: string;
  role?: string;
  tags?: string[];
  year?: string;
  quote?: string;
  metrics?: string[];
}

export interface AdminBlogRecord extends BlogFrontmatter {
  body: string;
  updatedAt: string;
}

export interface LeadRecord {
  id: string;
  createdAt: string;
  name: string;
  company: string;
  email: string;
  country: string;
  phone: string;
  companyType: string;
  objective: string;
  size: string;
  message: string;
  preferredLanguage: Locale;
  countriesNeeded?: string;
  estimatedUsers?: string;
  hasExistingProgram?: string;
  intentLevel?: string;
  ip?: string;
  loyaltyTarget?: string;
  needType?: string;
  pageUrl?: string;
  referrer?: string;
  sessionId?: string;
  suggestedSolution?: string;
  summary?: string;
  transcript?: string;
  triggerIntent?: string;
  userAgent?: string;
  utmCampaign?: string;
  utmMedium?: string;
  utmSource?: string;
  wantsDemo?: string;
}

export interface SiteContent {
  meta: {
    siteName: string;
    defaultTitle: string;
    defaultDescription: string;
    shortTagline: string;
    localeLabel: string;
  };
  nav: NavItem[];
  footer: {
    description: string;
    columns: {
      title: string;
      links: NavItem[];
    }[];
    contactCards: {
      market: string;
      detail: string[];
    }[];
    legal: string;
  };
  common: {
    primaryCta: string;
    secondaryCta: string;
    tertiaryCta: string;
    languageToggle: string;
    blogLabel: string;
    caseStudiesLabel: string;
    productsLabel: string;
    contactLabel: string;
  };
  home: {
    seo: SeoBlock;
    hero: {
      eyebrow: string;
      headline: string;
      subheadline: string;
      ctas: HeroCta[];
      proofStrip: string[];
      spotlight: {
        title: string;
        text: string;
      };
    };
    positioning: {
      eyebrow: string;
      title: string;
      text: string;
      audiences: string[];
      panelTitle?: string;
      panelText?: string;
    };
    productCards: ProductCardContent[];
    selector: {
      eyebrow: string;
      title: string;
      description: string;
      options: Record<
        AudienceKey,
        {
          label: string;
          recommendedProduct: string;
          explanation: string;
        }
      >;
    };
    flow: {
      eyebrow: string;
      title: string;
      steps: string[];
    };
    latam: {
      eyebrow: string;
      title: string;
      text: string;
      countries: string[];
    };
    ai: {
      eyebrow: string;
      title: string;
      bullets: string[];
    };
    stats: StatItem[];
    cta: {
      title: string;
      text: string;
      primary: HeroCta;
      secondary: HeroCta;
    };
  };
  about: {
    seo: SeoBlock;
    hero: {
      eyebrow: string;
      title: string;
      text: string;
    };
    story: string[];
    highlights: StatItem[];
    capabilityIntro?: {
      eyebrow: string;
      title: string;
      text: string;
    };
    capabilities?: {
      title: string;
      text: string;
    }[];
    timeline: {
      year: string;
      title: string;
      text: string;
    }[];
    team?: {
      eyebrow: string;
      title: string;
      text: string;
      members: {
        name: string;
        role: string;
        location: string;
        focus: string;
        image?: string;
      }[];
    };
  };
  contact: {
    seo: SeoBlock;
    hero: {
      eyebrow: string;
      title: string;
      text: string;
    };
    introCards: {
      title: string;
      lines: string[];
    }[];
    form: {
      title: string;
      description: string;
      objectives: { label: string; value: string }[];
      sizes: { label: string; value: string }[];
      companyTypes: string[];
      successMessage: string;
      errorMessage: string;
    };
  };
  admin: {
    loginTitle: string;
    loginDescription: string;
    dashboardTitle: string;
    postsTitle: string;
    leadsTitle: string;
  };
}
