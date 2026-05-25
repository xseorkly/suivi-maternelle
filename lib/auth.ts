import { supabase } from './supabase';

// Connexion
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Erreur de connexion' };
  }
}

// Déconnexion
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Erreur de déconnexion' };
  }
}

// Inscription (pour les parents via import ou création manuelle)
export async function signUp(
  email: string,
  password: string,
  nom: string,
  prenom: string,
  role: 'admin' | 'enseignant' | 'parent'
) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nom,
          prenom,
          role,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Erreur d\'inscription' };
  }
}

// Récupérer l'utilisateur actuel
export async function getCurrentUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}

// Vérifier le rôle de l'utilisateur
export async function getUserRole(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data.role;
  } catch (error) {
    return null;
  }
}
