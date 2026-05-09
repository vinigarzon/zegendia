"use client";

import { useState } from "react";

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
  website: string;
};

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

const selectClass =
  "h-13 min-h-12 w-full rounded-2xl border border-white/10 bg-[#071020]/72 px-4 py-3 text-sm text-white outline-none transition focus-visible:ring-2 focus-visible:ring-[#78d5d7]/45";

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
  website: ""
});

export function LeadForm({ locale, formContent }: LeadFormProps) {
  const [form, setForm] = useState<FormState>(initialState(locale));
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    const response = await fetch("/api/contact", {
      body: JSON.stringify(form),
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
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <FieldGroup label={locale === "en" ? "Your name" : "Tu nombre"}>
          <Input
            className="bg-[#071020]/72"
            onChange={(event) => update("name", event.target.value)}
            placeholder={locale === "en" ? "Name and last name" : "Nombre y apellido"}
            required
            value={form.name}
          />
        </FieldGroup>
        <FieldGroup label={locale === "en" ? "Company" : "Empresa"}>
          <Input
            className="bg-[#071020]/72"
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
            className="bg-[#071020]/72"
            onChange={(event) => update("email", event.target.value)}
            placeholder={locale === "en" ? "work@email.com" : "correo@empresa.com"}
            required
            type="email"
            value={form.email}
          />
        </FieldGroup>
        <FieldGroup label={locale === "en" ? "Country" : "País"}>
          <Input
            className="bg-[#071020]/72"
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
            className="bg-[#071020]/72"
            onChange={(event) => update("phone", event.target.value)}
            placeholder={locale === "en" ? "+1 / +593 / +52..." : "+593 / +52 / +57..."}
            value={form.phone}
          />
        </FieldGroup>
        <FieldGroup label={locale === "en" ? "Type of company" : "Tipo de empresa"}>
          <select
            className={selectClass}
            onChange={(event) => update("companyType", event.target.value)}
            required
            value={form.companyType}
          >
            <option className="bg-slate-950" value="">{locale === "en" ? "Select one" : "Selecciona una opción"}</option>
            {formContent.companyTypes.map((type) => (
              <option className="bg-slate-950" key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </FieldGroup>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FieldGroup label={locale === "en" ? "What do you want to motivate?" : "¿Qué quieres motivar?"}>
          <select
            className={selectClass}
            onChange={(event) => update("objective", event.target.value)}
            required
            value={form.objective}
          >
            <option className="bg-slate-950" value="">
              {locale === "en" ? "Choose the closest scenario" : "Elige el escenario más cercano"}
            </option>
            {formContent.objectives.map((objective) => (
              <option className="bg-slate-950" key={objective.value} value={objective.value}>
                {objective.label}
              </option>
            ))}
          </select>
        </FieldGroup>

        <FieldGroup label={locale === "en" ? "Estimated size" : "Tamaño estimado"}>
          <select
            className={selectClass}
            onChange={(event) => update("size", event.target.value)}
            required
            value={form.size}
          >
            <option className="bg-slate-950" value="">{locale === "en" ? "Select size" : "Selecciona el tamaño"}</option>
            {formContent.sizes.map((size) => (
              <option className="bg-slate-950" key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>
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
          className="min-h-40 bg-[#071020]/72"
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
          <select
            className={selectClass}
            onChange={(event) => update("preferredLanguage", event.target.value as Locale)}
            value={form.preferredLanguage}
          >
            <option className="bg-slate-950" value="es">Español</option>
            <option className="bg-slate-950" value="en">English</option>
          </select>
        </FieldGroup>
        <div className="text-sm leading-6 text-slate-400 md:max-w-xs">
          {locale === "en"
            ? "We use this for the confirmation email and follow-up."
            : "Lo usamos para el correo de confirmación y el seguimiento."}
        </div>
      </div>

      <input
        className="hidden"
        name="website"
        onChange={(event) => update("website", event.target.value)}
        tabIndex={-1}
        value={form.website}
      />

      <div className="rounded-[28px] border border-dashed border-white/10 bg-[#071020]/38 p-4">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          {locale === "en"
            ? "Security verification"
            : "Verificación de seguridad"}
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          {locale === "en"
            ? "Before sending, we may ask for a quick verification to protect the form."
            : "Antes de enviar, podremos pedir una verificación rápida para proteger el formulario."}
        </p>
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
