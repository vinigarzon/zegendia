export type AccentTone = "cyan" | "warm" | "green";

export function getSectionKickerAccentClass(accent: AccentTone = "cyan") {
  switch (accent) {
    case "warm":
      return "section-kicker--warm";
    case "green":
      return "section-kicker--green";
    default:
      return "section-kicker--cyan";
  }
}
