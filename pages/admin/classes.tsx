import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import styles from '@/styles/admin.module.css';

export default function AdminClasses() {
  const router = useRouter();
  const [settings, setSettings] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    nom_classe: '',
    niveau: 'PS',
    annee_scolaire: '',
  });

  const niveaux = ['PS', 'MS', 'GS', 'PS-MS', 'MS-GS', 'PS-MS-GS'];

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login/admin');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        router.push('/');
        return;
      }

      // Récupérer les settings
      const { data: settingsData } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (settingsData) {
        setSettings(settingsData);
        setFormData((prev) => ({
          ...prev,
          annee_scolaire: settingsData.school_year || '',
        }));
      }

      // Récupérer les classes
      const { data: classesData } = await supabase
        .from('classes')
        .select('*')
        .order('nom_classe');

      if (classesData) {
        setClasses(classesData);
      }

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      if (editingId) {
        // Modifier
        const { error } = await supabase
          .from('classes')
          .update(formData)
          .eq('id', editingId);

        if (error) {
          setMessage('Erreur lors de la modification');
        } else {
          setMessage('Classe modifiée avec succès');
          setClasses(
            classes.map((c) => (c.id === editingId ? { ...c, ...formData } : c))
          );
          resetForm();
        }
      } else {
        // Créer
        const { data, error } = await supabase
          .from('classes')
          .insert([formData])
          .select();

        if (error) {
          setMessage('Erreur lors de la création');
        } else {
          setMessage('Classe créée avec succès');
          if (data) {
            setClasses([...classes, data[0]]);
          }
          resetForm();
        }
      }
    } catch (error) {
      setMessage('Erreur lors de l\'opération');
    }

    setSaving(false);
  };

  const handleEdit = (classe: any) => {
    setEditingId(classe.id);
    setFormData({
      nom_classe: classe.nom_classe,
      niveau: classe.niveau,
      annee_scolaire: classe.annee_scolaire,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette classe ?')) {
      const { error } = await supabase.from('classes').delete().eq('id', id);

      if (!error) {
        setClasses(classes.filter((c) => c.id !== id));
        setMessage('Classe supprimée avec succès');
      } else {
        setMessage('Erreur lors de la suppression');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nom_classe: '',
      niveau: 'PS',
      annee_scolaire: settings?.school_year || '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) {
    return <div className={styles.container}>Chargement...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/admin/dashboard" className={styles.headerBack}>
          ← Tableau de bord
        </Link>
        <h1>Gestion des classes</h1>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Déconnexion
        </button>
      </header>

      <main className={styles.main}>
        {!showForm ? (
          <section className={styles.infoSection}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Classes ({classes.length})</h2>
              <button
                onClick={() => setShowForm(true)}
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                + Ajouter une classe
              </button>
            </div>

            {classes.length > 0 ? (
              <div style={{ overflow: 'x' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                      <th style={{ textAlign: 'left', padding: '15px' }}>Nom</th>
                      <th style={{ textAlign: 'left', padding: '15px' }}>Niveau</th>
                      <th style={{ textAlign: 'left', padding: '15px' }}>Année scolaire</th>
                      <th style={{ textAlign: 'center', padding: '15px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map((classe) => (
                      <tr
                        key={classe.id}
                        style={{
                          borderBottom: '1px solid var(--color-border)',
                        }}
                      >
                        <td style={{ padding: '15px' }}>
                          <strong>{classe.nom_classe}</strong>
                        </td>
                        <td style={{ padding: '15px' }}>{classe.niveau}</td>
                        <td style={{ padding: '15px' }}>{classe.annee_scolaire}</td>
                        <td style={{ textAlign: 'center', padding: '15px' }}>
                          <button
                            onClick={() => handleEdit(classe)}
                            style={{
                              backgroundColor: '#007bff',
                              color: 'white',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              border: 'none',
                              cursor: 'pointer',
                              marginRight: '10px',
                            }}
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(classe.id)}
                            style={{
                              backgroundColor: 'var(--color-tertiary)',
                              color: 'white',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              border: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#999' }}>Aucune classe créée</p>
            )}
          </section>
        ) : (
          <section className={styles.form} style={{ maxWidth: '600px' }}>
            <h2>{editingId ? 'Modifier la classe' : 'Ajouter une classe'}</h2>

            <form onSubmit={handleSave}>
              <div className={styles.formGroup}>
                <label htmlFor="nom_classe">Nom de la classe *</label>
                <input
                  id="nom_classe"
                  name="nom_classe"
                  type="text"
                  value={formData.nom_classe}
                  onChange={handleInputChange}
                  placeholder="PS A"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="niveau">Niveau *</label>
                <select
                  id="niveau"
                  name="niveau"
                  value={formData.niveau}
                  onChange={handleInputChange}
                  required
                >
                  {niveaux.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="annee_scolaire">Année scolaire *</label>
                <input
                  id="annee_scolaire"
                  name="annee_scolaire"
                  type="text"
                  value={formData.annee_scolaire}
                  onChange={handleInputChange}
                  placeholder="2025-2026"
                  required
                />
              </div>

              {message && (
                <div
                  className={message.includes('succès') ? styles.successMessage : styles.errorMessage}
                >
                  {message}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={saving}
                  className={styles.submitButton}
                  style={{ flex: 1 }}
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    flex: 1,
                    backgroundColor: '#6c757d',
                    color: 'white',
                    padding: '12px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Annuler
                </button>
              </div>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}
