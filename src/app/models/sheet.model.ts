export interface SheetData {
  characterInfo: CharacterInfo;
  abilities: Abilities;
  skills: Skills;
  spells: Spells;
  inventory: Inventory;
  layout: Layout;
}

export interface CharacterInfo {
  name?: string;
  class?: string;
  level?: number;
  race?: string;
  background?: string;
  alignment?: string;
  experience?: number;
  armorClass?: number;
  initiative?: number;
  speed?: number;
  hitPoints?: {
    maximum: number;
    current: number;
    temporary: number;
  };
}

export interface Abilities {
  strength: Ability;
  dexterity: Ability;
  constitution: Ability;
  intelligence: Ability;
  wisdom: Ability;
  charisma: Ability;
}

export interface Ability {
  score: number;
  modifier: number;
  savingThrow: boolean;
}

export interface Skills {
  acrobatics: Skill;
  animalHandling: Skill;
  arcana: Skill;
  athletics: Skill;
  deception: Skill;
  history: Skill;
  insight: Skill;
  intimidation: Skill;
  investigation: Skill;
  medicine: Skill;
  nature: Skill;
  perception: Skill;
  performance: Skill;
  persuasion: Skill;
  religion: Skill;
  sleightOfHand: Skill;
  stealth: Skill;
  survival: Skill;
}

export interface Skill {
  proficient: boolean;
  expertise: boolean;
  modifier: number;
}

export interface Spells {
  spellcastingClass?: string;
  spellcastingAbility?: string;
  spellSaveDC?: number;
  spellAttackBonus?: number;
  spellSlots: {
    level: number;
    maximum: number;
    current: number;
  }[];
  spells: Spell[];
}

export interface Spell {
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: {
    verbal: boolean;
    somatic: boolean;
    material?: string;
  };
  duration: string;
  description: string;
  prepared: boolean;
}

export interface Inventory {
  items: Item[];
  currency: {
    copper: number;
    silver: number;
    electrum: number;
    gold: number;
    platinum: number;
  };
}

export interface Item {
  name: string;
  quantity: number;
  weight?: number;
  description?: string;
  equipped?: boolean;
  type: 'weapon' | 'armor' | 'equipment' | 'consumable' | 'other';
}

export interface Layout {
  sections: Section[];
  theme: 'light' | 'dark';
}

export interface Section {
  id: string;
  title: string;
  order: number;
  visible: boolean;
  collapsed: boolean;
} 