export interface CharacterState {
  expression: "knowing-smile" | "proud-smile" | "thoughtful" | "lecturing" | "excited" | "curious";
  eyeLook: "standard" | "wink" | "reading" | "star" | "pixel";
  floatingAsset: "rust-orb" | "lightbulb" | "opened-book" | "code-brackets" | "gear" | "none";
  showLaptop: boolean;
  holdingPen: boolean;
  positionX: number; // percentage
  positionY: number; // percentage
  scale: number; // scale multiplier e.g. 1
}

export type SlideLayout = "intro" | "side-by-side" | "spotlight" | "bullets" | "cta";

export type SlideTheme = "cream" | "charcoal" | "rust";

export interface Slide {
  id: string;
  title: string;
  body: string;
  slideNumber: number;
  layout: SlideLayout;
  theme: SlideTheme;
  characterState: CharacterState;
  badgeText: string;
  accentOrbColor: string; // Hex code or tailwind color
}

export interface BrandPreset {
  name: string;
  description: string;
  slides: Slide[];
}
