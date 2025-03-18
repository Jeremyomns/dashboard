'use server'

import { Section } from "../types";

export interface CreateSection {
  create_section(section: Section): Promise<void>;
}