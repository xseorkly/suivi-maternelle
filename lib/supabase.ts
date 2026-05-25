import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour les tables Supabase
export interface Settings {
  id: number;
  school_name: string;
  school_logo_url?: string;
  site_title: string;
  school_year: string;
  contact_email: string;
  contact_phone?: string;
  address?: string;
  primary_color: string;
  secondary_color: string;
  tertiary_color: string;
  welcome_text_parent: string;
  welcome_text_teacher: string;
  legal_notice?: string;
  rgpd_notice?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  nom: string;
  prenom: string;
  role: 'admin' | 'enseignant' | 'parent';
  created_at: string;
  updated_at: string;
}

export interface Classe {
  id: number;
  nom_classe: string;
  niveau: string;
  annee_scolaire: string;
  created_at: string;
  updated_at: string;
}

export interface Enseignant {
  id: number;
  profile_id: string;
  nom: string;
  prenom: string;
  created_at: string;
  updated_at: string;
}

export interface Parent {
  id: number;
  profile_id: string;
  nom: string;
  prenom: string;
  created_at: string;
  updated_at: string;
}

export interface Eleve {
  id: number;
  nom: string;
  prenom: string;
  classe_id: number;
  created_at: string;
  updated_at: string;
}

export interface Commentaire {
  id: number;
  eleve_id: number;
  enseignant_id: number;
  classe_id: number;
  date_commentaire: string;
  texte_commentaire: string;
  created_at: string;
  updated_at: string;
}

// Fonction pour récupérer les settings
export async function getSettings(): Promise<Settings | null> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .single();

    if (error) {
      console.error('Erreur récupération settings:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erreur:', error);
    return null;
  }
}

// Fonction pour récupérer le profil actuel
export async function getCurrentProfile(): Promise<Profile | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) return null;

    return data;
  } catch (error) {
    console.error('Erreur:', error);
    return null;
  }
}

// Fonction pour uploader un logo
export async function uploadLogo(file: File, filename: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(process.env.NEXT_PUBLIC_LOGO_BUCKET || 'logod')
      .upload(`logos/${filename}`, file, {
        upsert: true,
      });

    if (error) {
      console.error('Erreur upload logo:', error);
      return null;
    }

    // Récupérer l'URL publique
    const {
      data: { publicUrl },
    } = supabase.storage
      .from(process.env.NEXT_PUBLIC_LOGO_BUCKET || 'logod')
      .getPublicUrl(`logos/${filename}`);

    return publicUrl;
  } catch (error) {
    console.error('Erreur:', error);
    return null;
  }
}
