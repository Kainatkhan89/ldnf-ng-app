import {ITutorial} from "./tutorial.model";

export interface IModule {
  id: number;
  number: number;
  title: string;
  description: string;
  styles: ModuleStyles;
  tutorials: ITutorial[];
}

export interface ModuleStyles {
  icon: "BOOK" | "FLAG" | "TERMINAL" | "WARNING" | "SHIELD" | "DATABASE" | "LOCK" | "PLANE";
  color: "INDIGO" | "TEAL" | "PURPLE" | "PINK" | "YELLOW" | "FUCHSIA" | "ROSE" | "SKY";
}

