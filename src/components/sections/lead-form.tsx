"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Locale, SiteContent } from "@/lib/types";

type LeadFormProps = {
  locale: Locale;
  formContent: SiteContent["contact"]["form"];
};

type FormState = {
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
  securityA: string;
  securityAnswer: string;
  securityB: string;
  website: string;
};

const CONTACT_FORM_NAME = "zegendia-contact";

function createSecurityChallenge() {
  const a = Math.floor(Math.random() * 7) + 3;
  const b = Math.floor(Math.random() * 6) + 2;

  return {
    securityA: String(a),
    securityAnswer: "",
    securityB: String(b)
  };
}

function FieldGroup({
  children,
  label,
  helper
}: {
  children: React.ReactNode;
  label: string;
  helper?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      {children}
      {helper ? <span className="block text-xs leading-5 text-slate-500">{helper}</span> : null}
    </label>
  );
}

function SelectFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#165a6e]"
      />
    </div>
  );
}

function encodeFormData(formData: FormData) {
  const params = new URLSearchParams();

  formData.forEach((value, key) => {
    if (typeof value === "string") {
      params.append(key, value);
    }
  });

  return params.toString();
}

async function submitNetlifyFormCopy(formElement: HTMLFormElement) {
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return true;
  }

  const formData = new FormData(formElement);
  formData.set("form-name", CONTACT_FORM_NAME);

  const response = await fetch("/", {
    body: encodeFormData(formData),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST"
  });

  return response.ok;
}

function getPageContext() {
  const params = new URLSearchParams(window.location.search);

  return {
    pageUrl: window.location.href,
    referrer: document.referrer,
    sessionId: window.localStorage.getItem("zegendia:zendi:session-id") || "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    userAgent: window.navigator.userAgent,
    utmCampaign: params.get("utm_campaign") || "",
    utmMedium: params.get("utm_medium") || "",
    utmSource: params.get("utm_source") || ""
  };
}

const selectClass =
  "h-13 min-h-12 w-full appearance-none rounded-2xl border border-[#d9e7e4] bg-white px-4 py-3 pr-12 text-sm font-medium text-[#1f2937] outline-none transition placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#2aa3b9]/40 [color-scheme:light]";
const inputClass =
  "border-[#d9e7e4] bg-white text-[#1f2937] placeholder:text-slate-400 focus-visible:ring-[#2aa3b9]/40 [color-scheme:light]";

const initialState = (locale: Locale): FormState => ({
  name: "",
  company: "",
  email: "",
  country: "",
  phone: "",
  companyType: "",
  objective: "",
  size: "",
  message: "",
  preferredLanguage: locale,
  ...createSecurityChallenge(),
  website: ""
});

export function LeadForm({ locale, formContent }: LeadFormProps) {
  const [form, setForm] = useState<FormState>(initialState(locale));
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    const expectedAnswer = Number(form.securityA) + Number(form.securityB);
    if (Number(form.securityAnswer) !== expectedAnswer) {
      setStatus("error");
      setMessage(
        locale === "en"
          ? "Please complete the human verification before sending."
          : "Completa la verificación humana antes de enviar."
      );
      return;
    }

    await submitNetlifyFormCopy(event.currentTarget).catch(() => null);

    const response = await fetch("/api/contact", {
      body: JSON.stringify({ ...form, pageContext: getPageContext() }),
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    const data = (await response.json()) as { message?: string };
    if (!response.ok) {
      setStatus("error");
      setMessage(data.message ?? formContent.errorMessage);
      return;
    }

    setStatus("success");
    setMessage(data.message ?? formContent.successMessage);
    setForm(initialState(locale));
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <form
      action="/contact"
      className="grid gap-5"
      data-netlify="true"
      data-netlify-honeypot="website"
      method="POST"
      name={CONTACT_FORM_NAME}
      onSubmit={handleSubmit}
    >
      <input name="form-name" type="hidden" value={CONTACT_FORM_NAME} />
      <div className="grid gap-4 md:grid-cols-2">
        <FieldGroup label={locale === "en" ? "Your name" : "Tu nombre"}>
          <Input
            className={inputClass}
            name="name"
            onChange={(event) => update("name", event.target.value)}
            placeholder={locale === "en" ? "Name and last name" : "Nombre y apellido"}
            required
            value={form.name}
          />
        </FieldGroup>
        <FieldGroup label={locale === "en" ? "Company" : "Empresa"}>
          <Input
            className={inputClass}
            name="company"
            onChange={(event) => update("company", event.target.value)}
            placeholder={locale === "en" ? "Company or brand" : "Empresa o marca"}
            required
            value={form.company}
          />
        </FieldGroup>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FieldGroup label="Email">
          <Input
            className={inputClass}
            name="email"
            onChange={(event) => update("email", event.target.value)}
            placeholder={locale === "en" ? "work@email.com" : "correo@empresa.com"}
            required
            type="email"
            value={form.email}
          />
        </FieldGroup>
        <FieldGroup label={locale === "en" ? "Country" : "País"}>
          <Input
            className={inputClass}
            name="country"
            onChange={(event) => update("country", event.target.value)}
            placeholder={locale === "en" ? "Where will the program operate?" : "¿Dónde operará el programa?"}
            required
            value={form.country}
          />
        </FieldGroup>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FieldGroup label={locale === "en" ? "Phone / WhatsApp" : "Teléfono / WhatsApp"}>
          <Input
            className={inputClass}
            name="phone"
            onChange={(event) => update("phone", event.target.value)}
            placeholder={locale === "en" ? "+1 / +593 / +52..." : "+593 / +52 / +57..."}
            value={form.phone}
          />
        </FieldGroup>
        <FieldGroup label={locale === "en" ? "Type of company" : "Tipo de empresa"}>
          <SelectFrame>
            <select
              className={selectClass}
              name="companyType"
              onChange={(event) => update("companyType", event.target.value)}
              required
              value={form.companyType}
            >
              <option value="">{locale === "en" ? "Select one" : "Selecciona una opción"}</option>
              {formContent.companyTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </SelectFrame>
        </FieldGroup>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FieldGroup label={locale === "en" ? "Who do you want to engage?" : "¿Qué quieres fidelizar?"}>
          <SelectFrame>
            <select
              className={selectClass}
              name="objective"
              onChange={(event) => update("objective", event.target.value)}
              required
              value={form.objective}
            >
              <option value="">
                {locale === "en" ? "Choose the closest scenario" : "Elige el escenario más cercano"}
              </option>
              {formContent.objectives.map((objective) => (
                <option key={objective.value} value={objective.value}>
                  {objective.label}
                </option>
              ))}
            </select>
          </SelectFrame>
        </FieldGroup>

        <FieldGroup label={locale === "en" ? "Estimated size" : "Tamaño estimado"}>
          <SelectFrame>
            <select
              className={selectClass}
              name="size"
              onChange={(event) => update("size", event.target.value)}
              required
              value={form.size}
            >
              <option value="">{locale === "en" ? "Select size" : "Selecciona el tamaño"}</option>
              {formContent.sizes.map((size) => (
                <option key={size.value} value={size.value}>
                  {size.label}
                </option>
              ))}
            </select>
          </SelectFrame>
        </FieldGroup>
      </div>

      <FieldGroup
        helper={
          locale === "en"
            ? "Useful context: countries, current platform, monthly redemptions, audience, timeline or pain point."
            : "Contexto útil: países, plataforma actual, canjes mensuales, audiencia, timing o dolor principal."
        }
        label={locale === "en" ? "Tell us what you want to build or solve" : "Cuéntanos qué quieres construir o resolver"}
      >
        <Textarea
          className={`min-h-40 ${inputClass}`}
          name="message"
          onChange={(event) => update("message", event.target.value)}
          placeholder={
            locale === "en"
              ? "Example: We already have a points app and need physical rewards delivery in Colombia and Mexico..."
              : "Ejemplo: Ya tenemos una app de puntos y necesitamos entregar premios físicos en Colombia y México..."
          }
          required
          value={form.message}
        />
      </FieldGroup>

      <div className="grid gap-4 rounded-[26px] border border-white/10 bg-white/[0.035] p-4 md:grid-cols-[1fr_auto] md:items-center">
        <FieldGroup label={locale === "en" ? "Preferred language" : "Idioma preferido"}>
          <SelectFrame>
            <select
              className={selectClass}
              name="preferredLanguage"
              onChange={(event) => update("preferredLanguage", event.target.value as Locale)}
              value={form.preferredLanguage}
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </SelectFrame>
        </FieldGroup>
        <div className="text-sm leading-6 text-slate-400 md:max-w-xs">
          {locale === "en"
            ? "We use this for the confirmation email and follow-up."
            : "Lo usamos para el correo de confirmación y el seguimiento."}
        </div>
      </div>

      <input
        className="hidden"
        name="securityA"
        readOnly
        value={form.securityA}
      />
      <input
        className="hidden"
        name="securityB"
        readOnly
        value={form.securityB}
      />
      <input
        className="hidden"
        name="website"
        onChange={(event) => update("website", event.target.value)}
        tabIndex={-1}
        value={form.website}
      />

      <div className="rounded-[28px] border border-[#d9e7e4] bg-white p-4 text-[#1f2937]">
        <div className="grid gap-3 sm:grid-cols-[1fr_220px] sm:items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#165a6e]">
              {locale === "en" ? "Human check" : "Verificación humana"}
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {locale === "en"
                ? `Solve ${form.securityA} + ${form.securityB} to continue.`
                : `Resuelve ${form.securityA} + ${form.securityB} para continuar.`}
            </p>
          </div>
          <Input
            className={inputClass}
            inputMode="numeric"
            name="securityAnswer"
            onChange={(event) => update("securityAnswer", event.target.value)}
            placeholder={`${form.securityA} + ${form.securityB} = ?`}
            required
            value={form.securityAnswer}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-[#071020]/58 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm leading-6 text-slate-400">
          {locale === "en"
            ? "We’ll review your context and suggest the most practical route to move forward."
            : "Revisaremos el contexto y te propondremos la ruta más práctica para avanzar."}
        </div>
        <Button className="shrink-0" disabled={status === "loading"} type="submit" variant="brandWarm">
          {status === "loading"
            ? locale === "en"
              ? "Sending..."
              : "Enviando..."
            : locale === "en"
              ? "Send request"
              : "Enviar solicitud"}
        </Button>
      </div>
      {message ? (
        <div
          className={
            status === "success"
              ? "rounded-2xl border border-[#549c24]/25 bg-[#549c24]/10 px-4 py-3 text-sm text-[#b7e78c]"
              : "rounded-2xl border border-[#e44c44]/25 bg-[#e44c44]/10 px-4 py-3 text-sm text-[#ffb0aa]"
          }
        >
          {message}
        </div>
      ) : null}
    </form>
  );
}
