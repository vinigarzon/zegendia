"use client";

import { useState } from "react";

import type { ChatIntent, ChatLanguage, LeadFormValues } from "types/chat";

type LeadFormProps = {
  defaultProgramType?: string;
  language: ChatLanguage;
  triggerIntent?: ChatIntent;
  onCancel: () => void;
  onSubmit: (values: LeadFormValues) => void;
};

const PROGRAM_TYPE_OPTIONS = {
  en: [
    "Points program",
    "Rewards catalog",
    "Sales incentives",
    "Gift cards",
    "API integration",
    "Distributor program",
    "Employee incentives",
    "Other"
  ],
  es: [
    "Programa de puntos",
    "Catálogo de premios",
    "Incentivos para vendedores",
    "Gift cards",
    "Integración API",
    "Programa para distribuidores",
    "Incentivos para empleados",
    "Otro"
  ]
} as const;

function getCopy(language: ChatLanguage) {
  if (language === "en") {
    return {
      additionalMessage: "Message",
      cancel: "Not now",
      company: "Company",
      country: "Country",
      email: "Work email",
      messagePlaceholder: "Briefly tell us what you want to build.",
      name: "Name",
      phone: "WhatsApp or phone",
      programType: "Program type",
      wantsDemo: "Would you like to see a demo?",
      save: "Send to Zegendia",
      subtitle: "Zendi will route your request to the right person. You will receive a response, follow-up, meeting, or demo within 24 hours.",
      title: "Let Zendi connect you"
    };
  }

  return {
    additionalMessage: "Mensaje",
    cancel: "Ahora no",
    company: "Empresa",
    country: "País",
    email: "Email corporativo",
    messagePlaceholder: "Cuéntanos brevemente qué quieres construir.",
    name: "Nombre",
    phone: "WhatsApp o teléfono",
    programType: "Tipo de programa",
    wantsDemo: "¿Quieres ver un demo?",
    save: "Enviar a Zegendia",
    subtitle: "Zendi enrutará tu solicitud a la persona correcta. Recibirás respuesta, seguimiento, reunión o demo en menos de 24 horas.",
    title: "Zendi te conecta"
  };
}

function getInitialValues(language: ChatLanguage, defaultProgramType?: string): LeadFormValues {
  return {
    additionalMessage: "",
    company: "",
    country: "",
    email: "",
    name: "",
    phone: "",
    programType: defaultProgramType ?? PROGRAM_TYPE_OPTIONS[language][0],
    wantsDemo: "yes"
  };
}

function Field({
  children,
  className = "",
  label
}: {
  children: React.ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <label className={`grid gap-1.5 text-sm font-semibold text-[#165a6e] ${className}`}>
      {label}
      {children}
    </label>
  );
}

const fieldClass =
  "h-10 w-full rounded-xl border border-[#c9dfe5] bg-white px-3 text-sm font-medium text-[#1f2937] outline-none transition placeholder:text-slate-400 focus:border-[#2aa3b9] focus:ring-2 focus:ring-[#2aa3b9]/15";

export function LeadForm({
  defaultProgramType,
  language,
  onCancel,
  onSubmit
}: LeadFormProps) {
  const copy = getCopy(language);
  const [values, setValues] = useState(() => getInitialValues(language, defaultProgramType));

  function update<K extends keyof LeadFormValues>(key: K, value: LeadFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <form
      className="space-y-4 rounded-[26px] border border-[#d4e4d5] bg-[#fffdf8] p-4 shadow-[0_18px_44px_rgba(22,90,110,0.12)]"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(values);
      }}
    >
      <div className="rounded-2xl bg-[linear-gradient(135deg,rgba(22,90,110,0.08),rgba(141,160,32,0.12))] px-4 py-3">
        <div className="text-base font-semibold text-[#165a6e]">{copy.title}</div>
        <p className="mt-1 text-sm leading-5 text-slate-600">{copy.subtitle}</p>
      </div>

      <div className="grid gap-3 min-[390px]:grid-cols-2">
        <Field label={copy.name}>
          <input
            className={fieldClass}
            onChange={(event) => update("name", event.target.value)}
            required
            value={values.name}
          />
        </Field>

        <Field label={copy.company}>
          <input
            className={fieldClass}
            onChange={(event) => update("company", event.target.value)}
            required
            value={values.company}
          />
        </Field>

        <Field label={copy.country}>
          <input
            className={fieldClass}
            onChange={(event) => update("country", event.target.value)}
            required
            value={values.country}
          />
        </Field>

        <Field label={copy.email}>
          <input
            className={fieldClass}
            onChange={(event) => update("email", event.target.value)}
            required
            type="email"
            value={values.email}
          />
        </Field>

        <Field label={copy.phone}>
          <input
            className={fieldClass}
            onChange={(event) => update("phone", event.target.value)}
            required
            value={values.phone}
          />
        </Field>

        <Field label={copy.programType}>
          <select
            className={fieldClass}
            onChange={(event) => update("programType", event.target.value)}
            value={values.programType}
          >
            {PROGRAM_TYPE_OPTIONS[language].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        <Field className="min-[390px]:col-span-2" label={copy.wantsDemo}>
          <select
            className={fieldClass}
            onChange={(event) => update("wantsDemo", event.target.value as LeadFormValues["wantsDemo"])}
            value={values.wantsDemo}
          >
            <option value="yes">{language === "en" ? "Yes, show me a demo" : "Sí, quiero ver un demo"}</option>
            <option value="not_sure">{language === "en" ? "Not sure yet" : "Todavía no estoy seguro"}</option>
            <option value="no">{language === "en" ? "No, just contact me" : "No, solo quiero contacto"}</option>
          </select>
        </Field>

        <Field className="min-[390px]:col-span-2" label={copy.additionalMessage}>
          <textarea
            className={`${fieldClass} h-20 resize-none py-2 leading-5`}
            onChange={(event) => update("additionalMessage", event.target.value)}
            placeholder={copy.messagePlaceholder}
            value={values.additionalMessage}
          />
        </Field>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-[#8da020] px-4 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(141,160,32,0.24)] transition hover:bg-[#7f911d]"
          type="submit"
        >
          {copy.save}
        </button>
        <button
          className="inline-flex h-10 items-center justify-center rounded-xl border border-[#c9dfe5] px-4 text-sm font-semibold text-slate-600 transition hover:border-[#165a6e] hover:text-[#165a6e]"
          onClick={onCancel}
          type="button"
        >
          {copy.cancel}
        </button>
      </div>
    </form>
  );
}
