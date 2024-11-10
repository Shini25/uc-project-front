export interface UcPhoto {
  photo: string; 
}

export interface UcAttribution {
  attribution: string;
}

export interface UcMotDuChef {
  paragraphe: string;
}

export interface Chefs {
  id?: any;
  nom: string;
  prenoms: string;
  email: string;
  contact: string;
  typeChef: string;
  sousType: string;
  photos: string[];
  attributions: UcAttribution[];
  motDuChefs: UcMotDuChef[];
}