import type { CaseStudyFrontmatter, Locale } from "@/lib/types";

type LocalizedLegacyCase = Omit<CaseStudyFrontmatter, "slug" | "locale"> & {
  body: string;
};

type LegacyCaseRecord = {
  slug: string;
} & Record<Locale, LocalizedLegacyCase>;

export const legacyCaseStudies: LegacyCaseRecord[] = [
  {
    slug: "directv-fans",
    es: {
      title: "DirecTV Fans",
      excerpt:
        "Programa nacional de lealtad lanzado en Ecuador y luego replicado en Latinoamérica para 630,000 clientes, con tecnología transaccional, descuentos y analítica de comportamiento.",
      summary:
        "Un caso emblemático para Zegendia: loyalty masivo, operación nacional, identificación física, smart web transaccional y expansión regional validada desde corporate.",
      sector: "Loyalty B2C para entretenimiento y suscripciones",
      coverImage: "/images/case-studies/directv-fans-photo.jpg",
      client: "DIRECTV",
      programName: "DirecTV Fans",
      role: "Desarrollo integral del programa",
      year: "2014",
      tags: ["Fidelización", "Gamificación", "Descuentos", "Escala regional"],
      metrics: ["630,000 clientes", "Expansión desde Ecuador a LATAM", "Tarjeta física con banda y código de barras"],
      outcomes: [
        "Tarjeta de identificación para activar beneficios y registrar consumos.",
        "Plataforma web transaccional para administrar el programa y leer comportamiento.",
        "Descuentos en una red nacional de establecimientos afiliados."
      ],
      quote:
        "La combinación de tarjeta física, plataforma inteligente y comunicación integral permitió escalar participación y fidelización a nivel regional.",
      body: `
## El reto

DIRECTV necesitaba una forma concreta de convertir una base masiva de clientes en una comunidad más activa, recurrente y conectada con la marca, empezando por Ecuador y con visión regional.

El desafío no era solo dar descuentos. Había que construir una estructura de lealtad capaz de identificar usuarios, registrar transacciones, entregar beneficios reales y escalar con orden operativo.

## Lo que construimos

Zegendia desarrolló **DirecTV Fans** como un programa nacional de fidelización apoyado por una smart web transaccional y por una tarjeta física con banda magnética y código de barras.

- Cada participante podía identificarse en la red de establecimientos afiliados.
- La plataforma almacenaba y administraba la información generada por el programa.
- El sistema permitía analizar hábitos de consumo y leer preferencias de los usuarios.
- La comunicación se complementó con email y piezas de activación para sostener recurrencia.

## Por qué fue importante

Este caso probó que Zegendia podía operar loyalty **a gran escala**, con tecnología, control transaccional y una experiencia que salía del programa y tocaba múltiples comercios aliados.

Además, la solución nacida en Ecuador fue replicada en otros países de América Latina con estrategia aprobada desde Nueva York, lo que convirtió a DirecTV Fans en una validación fuerte de capacidad regional.

## Lo que deja para hoy

DirecTV Fans resume varias capacidades que siguen vigentes en el nuevo ecosistema Zegendia:

- diseño del programa
- identificación de usuarios
- reglas comerciales
- analítica de comportamiento
- red de beneficios
- rollout multi-país

Es la clase de caso que explica por qué hoy podemos hablar de loyalty para clientes, canales, comunidades y audiencias masivas con una base operativa real.
`
    },
    en: {
      title: "DirecTV Fans",
      excerpt:
        "A large-scale loyalty program launched in Ecuador and then expanded across Latin America for 630,000 customers, combining transactional technology, discounts, and customer behavior data.",
      summary:
        "A landmark Zegendia case: mass-market loyalty, physical identification, a smart transactional web platform, and regional rollout discipline.",
      sector: "B2C loyalty for entertainment and subscriptions",
      coverImage: "/images/case-studies/directv-fans-photo.jpg",
      client: "DIRECTV",
      programName: "DirecTV Fans",
      role: "End-to-end program development",
      year: "2014",
      tags: ["Loyalty", "Gamification", "Discounts", "Regional scale"],
      metrics: ["630,000 customers", "Rolled out from Ecuador to LATAM", "Physical ID card with magnetic strip and barcode"],
      outcomes: [
        "Customer identification card tied to benefits and transaction capture.",
        "Transactional web platform to manage the program and analyze behavior.",
        "National discount network with partner merchants."
      ],
      quote:
        "The mix of a physical card, a smart platform, and integrated communications helped scale participation and loyalty across the region.",
      body: `
## The challenge

DIRECTV needed more than a promotion. It needed a loyalty structure capable of moving a very large customer base, starting in Ecuador and with regional expansion in mind.

The solution had to identify participants, register transactions, deliver benefits, and create useful data for the business.

## What Zegendia built

Zegendia created **DirecTV Fans** as a national loyalty program powered by a transactional web platform and a physical identification card.

- Participants used a magnetic-strip and barcode card across an affiliated merchant network.
- The platform stored program data and supported customer analysis.
- The program combined benefits, communications, and operational control in one structure.

## Why it matters

This project proved Zegendia could execute loyalty at **regional enterprise scale**, not only at campaign level.

The platform first succeeded in Ecuador and then served as the foundation for rollout across Latin America, making it one of the strongest proof points in Zegendia's legacy portfolio.
`
    }
  },
  {
    slug: "progra-mas",
    es: {
      title: "PrograMÁS",
      excerpt:
        "Catálogo de premios multi-país para Holcim con delivery, soporte y operación end-to-end de fulfillment entre 2016 y 2018.",
      summary:
        "Un caso muy valioso para explicar la raíz operativa de Oh My Rewards: catálogos por país, problemas logísticos reales, entregas, reposiciones y administración completa.",
      sector: "Rewards fulfillment B2B / fidelización industrial",
      coverImage: "/images/case-studies/progra-mas-photo.webp",
      client: "Holcim",
      programName: "PrograMÁS",
      role: "Catálogo de premios y delivery",
      year: "2016-2018",
      tags: ["Fidelización", "Fulfillment", "Premios", "Delivery"],
      metrics: ["4 países", "Operación 2016-2018", "Gestión completa del ciclo de canje"],
      outcomes: [
        "Catálogo regional con selección y administración por país.",
        "Resolución de reintentos, devoluciones, robos, pérdidas y garantías.",
        "Entrega a tiempo y coordinación de datos, clientes y reposiciones."
      ],
      quote:
        "No se trató solo de ofrecer premios, sino de resolver todo lo que pasa después del canje para que la promesa sí se cumpla.",
      body: `
## El reto

Holcim necesitaba una operación de premios que funcionara de verdad en varios mercados, no un catálogo estático sin capacidad de ejecución.

Eso significaba seleccionar premios relevantes por país, coordinar proveedores, administrar entregas y resolver todos los incidentes que aparecen en la práctica: direcciones erróneas, clientes inubicables, devoluciones, pérdidas, seguros, reposiciones y garantías.

## La solución

Zegendia asumió el programa como una operación regional completa de fulfillment.

- Se armó un catálogo de premios por país.
- Se aseguró la entrega oportuna de órdenes.
- Se administró la data de clientes y la coordinación para resolver incidencias.
- Se cubrió el ciclo operativo completo, desde la orden hasta la satisfacción final del participante.

## Qué demuestra este caso

PrograMÁS es una referencia directa para explicar por qué **Oh My Rewards** existe hoy como producto.

El problema que resolvimos entonces es el mismo que enfrentan hoy bancos, fintechs, retailers y programas de puntos: tener recompensas atractivas es solo una parte; lo realmente difícil es hacerlas llegar bien, con trazabilidad y conciliación.

## Valor para el nuevo sitio

Cuando decimos que Zegendia puede ser tu motor regional de entrega de premios, no hablamos desde teoría.

Lo decimos desde casos como PrograMÁS, donde el equipo manejó:

- catálogo regional
- operación multi-país
- soporte post-canje
- incidencias logísticas
- administración de datos
- cumplimiento real de la promesa del reward
`
    },
    en: {
      title: "PrograMÁS",
      excerpt:
        "A multi-country reward catalog for Holcim with delivery, support, and end-to-end fulfillment operations between 2016 and 2018.",
      summary:
        "A foundational case behind Oh My Rewards: regional catalog management, real logistics, customer incidents, and full execution after redemption.",
      sector: "B2B rewards fulfillment / industrial loyalty",
      coverImage: "/images/case-studies/progra-mas-photo.webp",
      client: "Holcim",
      programName: "PrograMÁS",
      role: "Reward catalog and delivery operations",
      year: "2016-2018",
      tags: ["Loyalty", "Fulfillment", "Rewards", "Delivery"],
      metrics: ["4 countries", "2016-2018 operation", "End-to-end redemption handling"],
      outcomes: [
        "Country-specific reward catalogs.",
        "On-time delivery and exception management.",
        "Full handling of retries, returns, losses, replacements, and warranties."
      ],
      quote:
        "This was not just about listing rewards. It was about operating everything that happens after redemption.",
      body: `
## The challenge

Holcim needed a reward operation that could actually work across multiple countries, not a static catalog disconnected from real execution.

That meant country-level supplier coordination, delivery control, issue resolution, and customer support around every order.

## What Zegendia delivered

Zegendia ran PrograMÁS as a full fulfillment operation.

- Regional reward catalogs by market.
- On-time delivery management.
- Incident handling for wrong addresses, lost shipments, returns, replacements, and warranties.
- Customer data coordination and operational follow-through.

## Why it matters now

This case is one of the clearest bridges between Zegendia's legacy work and **Oh My Rewards** today.

It proves that the company already operated the hard part of rewards: execution after redemption, across multiple countries and with real business accountability.
`
    }
  },
  {
    slug: "quito-motors",
    es: {
      title: "Quito Motors",
      excerpt:
        "Programa de fidelización para clientes Ford y Volvo con 20,000 tarjetas, acumulación automática de puntos y canje por premios, descuentos y experiencias.",
      summary:
        "Un caso clásico de loyalty automotriz donde Zegendia combinó web transaccional, software autorizador y beneficios tangibles para fortalecer la relación con clientes.",
      sector: "Loyalty B2C para automotriz",
      coverImage: "/images/case-studies/quito-motors-photo.jpg",
      client: "Quito Motors",
      programName: "Ford / Volvo Loyalty",
      role: "Fidelización de Clientes Ford y Volvo",
      year: "2012",
      tags: ["Fidelización", "Lealtad", "Premios", "Automotriz"],
      metrics: ["20,000 tarjetas emitidas", "Acumulación automática de puntos", "Ford y Volvo en un mismo esquema"],
      outcomes: [
        "Plataforma web inteligente y transaccional.",
        "Software emisor y autorizador de transacciones en línea.",
        "Canje por descuentos, productos, servicios y experiencias."
      ],
      quote:
        "El programa conectó tecnología transaccional con una propuesta de valor clara para dos marcas automotrices relevantes.",
      body: `
## El reto

Quito Motors buscaba crear una relación más sólida con los clientes de Ford y Volvo, llevando la experiencia más allá de la compra puntual.

Para lograrlo, el programa debía registrar transacciones, acumular puntos sin fricción y ofrecer premios suficientemente atractivos para sostener recurrencia y preferencia.

## Lo que implementamos

Zegendia construyó una solución apoyada por una plataforma web transaccional inteligente y por un software en línea para emitir y autorizar operaciones.

- Se emitieron **20,000 tarjetas** para participantes.
- Los puntos se acumulaban automáticamente con cada compra.
- El catálogo de redención incluía descuentos, productos, servicios especiales y experiencias.

## Impacto comercial

El caso de Quito Motors muestra cómo una estructura de loyalty bien diseñada puede funcionar en industrias donde la frecuencia natural de compra no es tan alta, pero donde la relación, el servicio y el valor percibido sí importan mucho.

También valida una capacidad histórica de Zegendia: traducir procesos transaccionales a programas de lealtad que generan vínculo, no solo promoción.
`
    },
    en: {
      title: "Quito Motors",
      excerpt:
        "A Ford and Volvo customer loyalty program with 20,000 cards, automatic point accrual, and reward redemption across discounts, products, services, and experiences.",
      summary:
        "A classic automotive loyalty case where Zegendia combined transactional web technology, authorization software, and tangible rewards.",
      sector: "Automotive B2C loyalty",
      coverImage: "/images/case-studies/quito-motors-photo.jpg",
      client: "Quito Motors",
      programName: "Ford / Volvo Loyalty",
      role: "Ford and Volvo customer loyalty build",
      year: "2012",
      tags: ["Loyalty", "Rewards", "Automotive"],
      metrics: ["20,000 issued cards", "Automatic point accumulation", "Two automotive brands"],
      outcomes: [
        "Smart transactional web platform.",
        "Online transaction issuing and authorization software.",
        "Reward redemption across discounts, products, services, and experiences."
      ],
      quote:
        "The program translated dealership transactions into a reward structure customers could actually feel.",
      body: `
## The challenge

Quito Motors wanted to deepen customer relationships for Ford and Volvo through a structured loyalty experience, not just isolated promotions.

The solution needed to capture transactions, automate point accrual, and make redemption meaningful.

## What Zegendia built

Zegendia launched a transactional loyalty platform backed by online authorization software.

- 20,000 participant cards were issued.
- Points were accumulated automatically.
- Customers redeemed value through discounts, products, services, and special experiences.

## Why it matters

This case shows that loyalty can work in categories with lower natural purchase frequency when the value proposition is clear and the operating model is solid.
`
    }
  },
  {
    slug: "metro-puntos",
    es: {
      title: "MetroPuntos",
      excerpt:
        "Programa de lealtad para Metropolitan Touring con 5,000 tarjetas, puntos acumulables, premios y reconocimiento como ganador del eCommerce Day.",
      summary:
        "Un caso de loyalty en turismo donde tecnología web, premios y operación clara ayudaron a construir una experiencia más completa para el cliente.",
      sector: "Loyalty para turismo y travel services",
      coverImage: "/images/case-studies/metro-puntos-photo.jpg",
      client: "Metropolitan Touring",
      programName: "MetroPuntos",
      role: "Fidelización de clientes con puntos y premios",
      year: "2010s",
      tags: ["Fidelización", "Puntos", "Premios", "Turismo"],
      metrics: ["5,000 tarjetas", "Ganador de eCommerce Day", "Smart web transaccional"],
      outcomes: [
        "Sistema web inteligente para gestionar puntos y transacciones.",
        "Tarjetas para participantes y acumulación automática.",
        "Programa reconocido por su ejecución y propuesta digital."
      ],
      quote:
        "MetroPuntos ayudó a convertir una relación comercial en una experiencia continua de reconocimiento y recompensa.",
      body: `
## El reto

Metropolitan Touring necesitaba fortalecer la lealtad de sus clientes en una industria donde la experiencia y la confianza pesan tanto como el precio.

La solución debía combinar una operación digital clara con un sistema de puntos y recompensas que reforzara la relación a lo largo del tiempo.

## La solución

Zegendia desarrolló **MetroPuntos** como un programa con smart web transaccional, software en línea y tarjetas para participantes.

- Se emitieron **5,000 tarjetas**.
- Los usuarios acumulaban puntos por transacciones elegibles.
- El programa ofrecía premios y beneficios visibles para reforzar permanencia.

## Por qué vale para el nuevo portafolio

MetroPuntos ayuda a mostrar que Zegendia no solo ha trabajado en retail o consumo masivo. También ha construido programas donde la experiencia del usuario, la gestión de beneficios y la operación digital son decisivas.

El reconocimiento en **eCommerce Day** aporta además una señal externa de calidad y ejecución.
`
    },
    en: {
      title: "MetroPuntos",
      excerpt:
        "A loyalty program for Metropolitan Touring with 5,000 cards, points, rewards, and recognition as an eCommerce Day winner.",
      summary:
        "A travel-sector loyalty case built around digital operations, reward mechanics, and a stronger long-term customer relationship.",
      sector: "Loyalty for tourism and travel services",
      coverImage: "/images/case-studies/metro-puntos-photo.jpg",
      client: "Metropolitan Touring",
      programName: "MetroPuntos",
      role: "Customer loyalty with points and rewards",
      year: "2010s",
      tags: ["Loyalty", "Points", "Rewards", "Travel"],
      metrics: ["5,000 cards", "eCommerce Day winner", "Smart transactional web platform"],
      outcomes: [
        "Digital reward and transaction management.",
        "Participant cards and automatic accrual.",
        "External recognition for execution quality."
      ],
      quote:
        "MetroPuntos turned customer recognition into an ongoing digital experience instead of a one-off promotion.",
      body: `
## The challenge

Metropolitan Touring needed a more durable relationship model in a category where experience and trust matter as much as price.

## What Zegendia built

Zegendia launched **MetroPuntos** as a points-based program supported by a smart transactional web platform and participant cards.

- 5,000 cards were issued.
- Customers accumulated points through eligible transactions.
- Rewards created a clearer reason to come back and stay engaged.

## Why it matters

The case expands Zegendia's portfolio beyond classic retail loyalty and shows experience-driven execution in travel and tourism.
`
    }
  },
  {
    slug: "club-suscriptores-el-comercio",
    es: {
      title: "Club de Suscriptores El Comercio",
      excerpt:
        "Programa de fidelización para suscriptores con 50,000 tarjetas, puntos, beneficios exclusivos y una red de valor para miembros del club.",
      summary:
        "Un caso potente para mostrar membership loyalty: beneficios, tarjetas, puntos y una experiencia digital que reforzó la propuesta de suscripción.",
      sector: "Membership loyalty para medios y suscripciones",
      coverImage: "/images/case-studies/club-suscriptores-el-comercio-photo.jpg",
      client: "Diario El Comercio",
      programName: "Club de Suscriptores El Comercio",
      role: "Beneficios a clientes, tarjetas y puntos",
      year: "2010s",
      tags: ["Fidelización de clientes", "Red de beneficios", "Suscripciones"],
      metrics: ["50,000 tarjetas", "Red de beneficios", "Plataforma transaccional"],
      outcomes: [
        "Acceso a beneficios exclusivos para miembros del club.",
        "Acumulación de puntos y recompensas personalizadas.",
        "Una estructura de loyalty para fortalecer el valor de la suscripción."
      ],
      quote:
        "Más que un periódico, el club se convirtió en una experiencia de beneficios y pertenencia para suscriptores.",
      body: `
## El reto

El Comercio necesitaba reforzar el valor percibido de la suscripción con algo más tangible que el contenido editorial.

La pregunta era cómo convertir una base de suscriptores en una comunidad con beneficios, recurrencia y una mejor relación con la marca.

## La solución

Zegendia desarrolló una estructura de loyalty para miembros del club, con tarjetas, puntos y una red de beneficios.

- Se emitieron **50,000 tarjetas**.
- Los suscriptores podían acceder a beneficios exclusivos.
- La plataforma web ayudó a administrar funcionalidades y experiencia del programa.

## Qué demuestra

Este caso valida la capacidad de Zegendia para construir programas de fidelización basados en membresía, donde la lógica no es solamente compra-recompensa, sino también pertenencia, beneficios y percepción de valor continuo.
`
    },
    en: {
      title: "Club de Suscriptores El Comercio",
      excerpt:
        "A subscriber loyalty program with 50,000 cards, member benefits, points, and a structured value proposition around the club.",
      summary:
        "A strong membership loyalty case showing how benefits, cards, and rewards can reinforce subscription value over time.",
      sector: "Membership loyalty for media and subscriptions",
      coverImage: "/images/case-studies/club-suscriptores-el-comercio-photo.jpg",
      client: "Diario El Comercio",
      programName: "Club de Suscriptores El Comercio",
      role: "Customer benefits, cards, and points",
      year: "2010s",
      tags: ["Customer loyalty", "Benefits network", "Subscriptions"],
      metrics: ["50,000 cards", "Benefits network", "Transactional platform"],
      outcomes: [
        "Exclusive member benefits.",
        "Points and personalized rewards.",
        "A stronger value proposition for subscription retention."
      ],
      quote:
        "The subscription became more than content. It became a membership experience.",
      body: `
## The challenge

El Comercio needed to make its subscription offer feel more valuable and more tangible over time.

## What Zegendia built

Zegendia created a loyalty structure for subscribers with cards, benefits, and points.

- 50,000 cards were issued.
- Members accessed exclusive benefits through the club.
- The platform supported the operational side of the program.

## Why it matters

This case shows Zegendia can design loyalty models based on **membership value**, not only transaction frequency.
`
    }
  },
  {
    slug: "tarjeta-gpf",
    es: {
      title: "Tarjeta GPF",
      excerpt:
        "Programa de fidelización para 8,000 empleados de Corporación GPF con incentivos, red de beneficios y una lógica pensada para impulsar estabilidad y productividad.",
      summary:
        "Una prueba clara de que Zegendia también sabe construir loyalty interno: reconocimiento, beneficios y operación para colaboradores en escala corporativa.",
      sector: "Employee loyalty y beneficios corporativos",
      coverImage: "/images/case-studies/tarjeta-gpf-photo.jpg",
      client: "Corporación GPF",
      programName: "Tarjeta GPF",
      role: "Fidelización de empleados",
      year: "2010s",
      tags: ["Retención de talentos", "Fidelización", "Empleados"],
      metrics: ["8,000 empleados", "Red de beneficios nacional", "Plataforma transaccional"],
      outcomes: [
        "Incentivos y beneficios para colaboradores a nivel nacional.",
        "Tarjeta y red afiliada para activar valor cotidiano.",
        "Modelo pensado para productividad, estabilidad y pertenencia."
      ],
      quote:
        "El loyalty no se limita al cliente final: también puede fortalecer cultura, permanencia y rendimiento interno.",
      body: `
## El reto

Corporación GPF necesitaba una herramienta para motivar y reconocer a miles de colaboradores dentro de un marco operativo claro y escalable.

El programa debía aportar valor real al empleado y, al mismo tiempo, ayudar a la organización a reforzar productividad, permanencia y estabilidad.

## Lo que hizo Zegendia

Se construyó un programa de fidelización interna con beneficios, incentivos y una plataforma transaccional.

- Alcance para **8,000 empleados**.
- Tarjeta de uso dentro de una red nacional de establecimientos afiliados.
- Beneficios pensados para generar valor frecuente y visible.

## Por qué importa en el nuevo posicionamiento

Tarjeta GPF encaja perfectamente con la nueva narrativa de Zegendia: podemos construir sistemas de lealtad para **clientes, canales o empleados**, según la audiencia que necesites motivar.
`
    },
    en: {
      title: "Tarjeta GPF",
      excerpt:
        "An employee loyalty program for 8,000 people at Corporación GPF, combining incentives, benefits, and a national value network.",
      summary:
        "A strong internal loyalty example showing that Zegendia can design motivation systems not just for customers, but also for employees at enterprise scale.",
      sector: "Employee loyalty and corporate benefits",
      coverImage: "/images/case-studies/tarjeta-gpf-photo.jpg",
      client: "Corporación GPF",
      programName: "Tarjeta GPF",
      role: "Employee loyalty program",
      year: "2010s",
      tags: ["Talent retention", "Loyalty", "Employees"],
      metrics: ["8,000 employees", "National benefits network", "Transactional platform"],
      outcomes: [
        "Benefits and incentives for a large employee population.",
        "Card-based access across a national partner network.",
        "A structure designed to support productivity and stability."
      ],
      quote:
        "Loyalty is not limited to end customers. It can also strengthen internal culture and retention.",
      body: `
## The challenge

Corporación GPF needed a clear, scalable way to recognize and motivate a large employee base.

## What Zegendia built

Zegendia launched an internal loyalty structure with incentives, benefits, and a transactional platform.

- 8,000 employees in scope.
- A card tied to a national affiliated network.
- Everyday value designed to make the program visible and useful.

## Why it matters

This case supports Zegendia's broader positioning: loyalty systems can work for customers, channels, and employees alike.
`
    }
  },
  {
    slug: "roche",
    es: {
      title: "Roche",
      excerpt:
        "Catálogo de premios por puntos para empleados, conectado a índices de gestión y pensado para reconocer desempeño con recompensas relevantes.",
      summary:
        "Un caso corporativo de incentivos y employee rewards que demuestra cómo Zegendia ha trabajado esquemas internos de reconocimiento con reglas claras y valor tangible.",
      sector: "Employee rewards y reconocimiento corporativo",
      coverImage: "/images/case-studies/roche-photo.jpeg",
      client: "Roche",
      programName: "Roche Rewards",
      role: "Premios para empleados",
      year: "2010s",
      tags: ["Fidelización", "Empleados", "Reconocimiento"],
      metrics: ["Catálogo por puntos", "Índices de gestión", "Premios por desempeño"],
      outcomes: [
        "Sistema de puntos ligado a logro y rendimiento.",
        "Catálogo de premios para reconocimiento interno.",
        "Una estructura simple y clara para reforzar resultados."
      ],
      quote:
        "Reconocer desempeño con una lógica de rewards clara ayuda a que el programa tenga legitimidad frente al colaborador.",
      body: `
## El reto

Roche necesitaba una forma práctica de reconocer desempeño y mantener motivación interna conectando logros con recompensas visibles.

## La solución

Zegendia estructuró un catálogo de premios por puntos basado en índices de gestión.

- Los colaboradores acumulaban valor según cumplimiento y resultados.
- El catálogo ofrecía múltiples opciones de redención.
- La lógica del programa ayudaba a reforzar la conexión entre desempeño y reconocimiento.

## Valor estratégico

Roche es otro ejemplo de cómo Zegendia puede trabajar programas donde la audiencia no es el consumidor final, sino el talento interno.
`
    },
    en: {
      title: "Roche",
      excerpt:
        "A points-based reward catalog for employees tied to management performance indicators and built to recognize achievement with meaningful rewards.",
      summary:
        "A corporate employee rewards case that shows Zegendia's experience with internal recognition programs built around clear rules and real incentives.",
      sector: "Employee rewards and recognition",
      coverImage: "/images/case-studies/roche-photo.jpeg",
      client: "Roche",
      programName: "Roche Rewards",
      role: "Employee rewards program",
      year: "2010s",
      tags: ["Loyalty", "Employees", "Recognition"],
      metrics: ["Points-based catalog", "Management indicators", "Performance rewards"],
      outcomes: [
        "Point accrual linked to performance.",
        "Structured reward catalog for internal recognition.",
        "A clearer connection between achievement and value."
      ],
      quote:
        "Recognition becomes more credible when the reward logic is transparent and relevant.",
      body: `
## The challenge

Roche needed a practical way to recognize employee performance and make that recognition feel concrete.

## What Zegendia built

Zegendia implemented a points-based reward catalog linked to management indicators.

- Employees accumulated points through achievement.
- The catalog offered multiple reward options.
- The structure connected recognition to measurable outcomes.
`
    }
  },
  {
    slug: "halliburton",
    es: {
      title: "Halliburton",
      excerpt:
        "Catálogo de premios por puntos para empleados basado en índices de gestión, diseñado para reconocer desempeño sobresaliente con valor tangible.",
      summary:
        "Un caso de employee rewards que refuerza la capacidad de Zegendia para diseñar sistemas de incentivos internos en entornos corporativos exigentes.",
      sector: "Employee rewards y fidelización interna",
      coverImage: "/images/case-studies/halliburton-photo.jpg",
      client: "Halliburton",
      programName: "Halliburton Rewards",
      role: "Premios para empleados",
      year: "2010s",
      tags: ["Fidelización", "Empleados", "Premios"],
      metrics: ["Catálogo de premios", "Puntos por desempeño", "Reconocimiento interno"],
      outcomes: [
        "Premios ligados a logros y cumplimiento de objetivos.",
        "Catálogo amplio para reforzar percepción de valor.",
        "Una lógica de reconocimiento más estructurada."
      ],
      quote:
        "En contextos corporativos exigentes, el reconocimiento necesita reglas claras y una operación confiable para tener impacto.",
      body: `
## El reto

Halliburton necesitaba un esquema de incentivos que reconociera el desempeño sobresaliente y diera a los colaboradores una recompensa concreta por alcanzar metas.

## La respuesta

Zegendia implementó un catálogo de premios por puntos basado en índices de gestión.

- El valor se acumulaba a partir de desempeño y logros.
- Los empleados podían canjear por premios personalizados.
- El programa reforzaba la percepción de reconocimiento real.

## Qué prueba este caso

Junto con Roche y Tarjeta GPF, Halliburton ayuda a demostrar que Zegendia tiene experiencia sostenida en programas para colaboradores, no solo para clientes.
`
    },
    en: {
      title: "Halliburton",
      excerpt:
        "A points-based employee reward catalog built around performance indicators and structured to recognize strong results with tangible rewards.",
      summary:
        "An employee rewards case that reinforces Zegendia's experience building internal incentive systems for demanding corporate environments.",
      sector: "Employee rewards and internal loyalty",
      coverImage: "/images/case-studies/halliburton-photo.jpg",
      client: "Halliburton",
      programName: "Halliburton Rewards",
      role: "Employee rewards program",
      year: "2010s",
      tags: ["Loyalty", "Employees", "Rewards"],
      metrics: ["Reward catalog", "Points by performance", "Internal recognition"],
      outcomes: [
        "Rewards tied to achievement and target fulfillment.",
        "A broad catalog to improve perceived value.",
        "More structured recognition mechanics."
      ],
      quote:
        "In demanding corporate contexts, recognition only works when the rules and the operation are both credible.",
      body: `
## The challenge

Halliburton needed an incentive structure that could recognize employee performance with clear logic and tangible value.

## What Zegendia delivered

Zegendia launched a points-based employee reward catalog.

- Value accumulated through performance.
- Employees redeemed points for meaningful rewards.
- The structure supported stronger recognition and motivation.
`
    }
  },
  {
    slug: "cebichomano",
    es: {
      title: "Cebichómano",
      excerpt:
        "Programa de lealtad para clientes de Los Cebiches de la Rumiñahui con 10,000 tarjetas, puntos y una plataforma transaccional para recompensar recurrencia.",
      summary:
        "Un ejemplo temprano de loyalty en food service que muestra cómo Zegendia convirtió visitas y consumo en una mecánica clara de acumulación y recompensas.",
      sector: "Loyalty B2C para restaurantes",
      coverImage: "/images/case-studies/cebichomano-photo.jpg",
      client: "Los Cebiches de la Rumiñahui",
      programName: "Cebichómano",
      role: "Fidelización de clientes",
      year: "2009-2010",
      tags: ["Fidelización", "Puntos", "Premios", "Food service"],
      metrics: ["10,000 tarjetas", "Smart web transaccional", "Acumulación automática"],
      outcomes: [
        "Tarjeta para identificación y acumulación de puntos.",
        "Software emisor y autorizador en línea.",
        "Premios para reforzar frecuencia de compra."
      ],
      quote:
        "Incluso en tickets pequeños y visitas frecuentes, una estructura de loyalty bien hecha puede cambiar la relación con la marca.",
      body: `
## El reto

En una categoría de consumo frecuente como restaurantes, la lealtad se construye con repetición, recordación y una recompensa visible por volver.

## Lo que construimos

Zegendia desarrolló **Cebichómano** para Los Cebiches de la Rumiñahui como una plataforma de fidelización con tarjetas, puntos y soporte transaccional.

- Se emitieron **10,000 tarjetas**.
- Los clientes acumulaban puntos de forma automática.
- El programa utilizó una web inteligente y un autorizador en línea para sostener la operación.

## Por qué aporta al portafolio

Cebichómano ayuda a mostrar que Zegendia puede adaptar loyalty a negocios de alta frecuencia, donde la experiencia debe ser ágil, simple y claramente valiosa para el usuario.
`
    },
    en: {
      title: "Cebichómano",
      excerpt:
        "A restaurant loyalty program for Los Cebiches de la Rumiñahui with 10,000 cards, point accrual, and a transactional platform built around repeat visits.",
      summary:
        "An early food-service loyalty example showing how Zegendia turned frequent visits into a structured reward mechanic.",
      sector: "Restaurant B2C loyalty",
      coverImage: "/images/case-studies/cebichomano-photo.jpg",
      client: "Los Cebiches de la Rumiñahui",
      programName: "Cebichómano",
      role: "Customer loyalty build",
      year: "2009-2010",
      tags: ["Loyalty", "Points", "Rewards", "Food service"],
      metrics: ["10,000 cards", "Smart transactional web", "Automatic accrual"],
      outcomes: [
        "Card-based customer identification and point accrual.",
        "Online issuing and authorization software.",
        "Visible rewards for repeat behavior."
      ],
      quote:
        "Even in high-frequency categories, a clear loyalty structure can reshape customer behavior.",
      body: `
## The challenge

In food service, loyalty depends on repeat behavior and clear perceived value.

## What Zegendia built

Zegendia created **Cebichómano** as a loyalty structure with cards, points, and transactional support.

- 10,000 cards were issued.
- Points accumulated automatically.
- The program was supported by a smart web platform and online authorization logic.
`
    }
  },
  {
    slug: "gamerleal",
    es: {
      title: "GamerLeal",
      excerpt:
        "Un ejemplo de loyalty aplicado a comunidades digitales y gaming, donde engagement, recompensas y experiencias pesan tanto como la compra transaccional.",
      summary:
        "GamerLeal ayuda a explicar que la lealtad también puede diseñarse para audiencias de nicho, entretenimiento y comunidades que viven en digital.",
      sector: "Loyalty para comunidades y gaming",
      coverImage: "/images/case-studies/gamerleal-home-v2.png",
      client: "GamerLeal",
      programName: "GamerLeal",
      role: "Diseño de engagement y loyalty vertical",
      year: "Actual",
      tags: ["Comunidad", "Gaming", "Engagement", "Verticales"],
      metrics: ["Comunidad digital", "Mecánicas de engagement", "Aplicación vertical"],
      outcomes: [
        "Prueba de que loyalty también funciona fuera del retail tradicional.",
        "Mecánicas de participación y recompensa para audiencias digitales.",
        "Posicionamiento de Zegendia en nichos con lógica propia."
      ],
      quote:
        "Cuando la audiencia vive en comunidad, la lealtad necesita experiencias, señales de estatus y valor digital, no solo puntos.",
      body: `
## Por qué lo incluimos

GamerLeal es importante porque saca a Zegendia de la caja del loyalty tradicional y muestra una verdad comercial más amplia: también podemos diseñar sistemas de engagement para comunidades específicas.

## Qué valida

En ecosistemas como gaming, entretenimiento o verticales digitales:

- la recompensa no siempre es física
- la reputación y el estatus importan
- la experiencia pesa tanto como la transacción

## Lo que dice sobre Zegendia

Este ejemplo ayuda a reforzar la nueva idea central del sitio:

> Zegendia construye sistemas de lealtad para cualquiera que necesites motivar.

No solo clientes de retail. También comunidades, audiencias digitales, aliados o grupos con comportamientos propios.
`
    },
    en: {
      title: "GamerLeal",
      excerpt:
        "A niche example of loyalty applied to digital communities and gaming, where engagement, status, and rewards matter as much as transactions.",
      summary:
        "GamerLeal helps position Zegendia beyond classic retail loyalty by showing how engagement systems can work for digital communities too.",
      sector: "Loyalty for communities and gaming",
      coverImage: "/images/case-studies/gamerleal-home-v2.png",
      client: "GamerLeal",
      programName: "GamerLeal",
      role: "Vertical engagement and loyalty design",
      year: "Current",
      tags: ["Community", "Gaming", "Engagement", "Verticals"],
      metrics: ["Digital community", "Engagement mechanics", "Vertical use case"],
      outcomes: [
        "Proof that loyalty can go beyond classic retail.",
        "Participation and reward mechanics for digital audiences.",
        "A sharper positioning in niche verticals."
      ],
      quote:
        "When the audience behaves like a community, loyalty needs experience, recognition, and digital value.",
      body: `
## Why it belongs in the portfolio

GamerLeal expands Zegendia's story beyond traditional loyalty and shows that engagement systems can be adapted to digital communities too.

## What it proves

In verticals like gaming and entertainment:

- rewards are not always physical
- status and participation matter
- community dynamics shape the loyalty model

That is exactly why this case supports Zegendia's broader positioning today.
`
    }
  }
];
