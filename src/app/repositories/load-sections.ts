import { Section } from "../types";

export interface LoadSections {
  load_sections(project_id: string): Promise<Section[]>;
}