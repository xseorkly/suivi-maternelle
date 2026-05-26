import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, nom, prenom, role } = req.body;

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        nom: nom,
        prenom: prenom,
        role: role,
      },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!data.user) {
      return res.status(400).json({ error: 'Échec de la création' });
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert([
        {
          id: data.user.id,
          nom: nom,
          prenom: prenom,
          role: role,
        },
      ]);

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }

    return res.status(200).json({
      success: true,
      user_id: data.user.id,
      email: email,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}