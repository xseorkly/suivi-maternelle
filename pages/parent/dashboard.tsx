import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase, getSettings } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import styles from '@/styles/admin.module.css';

export default function ParentDashboard() {
  const router = useRouter();
  const [settings, setSettings] = useState(null);
  const [parent, setParent] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login/parent');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'parent') {
        router.push('/');
        return;
      }

      // Récupérer les données du parent
      const { data: parentData } = await supabase
        .from('parents')
        .select('*')
        .eq('profile_id', user.id)
        .single();

      if (parentData) {
        setParent(parentData);

        // Récupérer les enfants du parent
        const { data: childrenData } = await supabase
          .from('parents_eleves')
          .select('eleve_id, eleves(id, nom, prenom, classe_id, classes(nom_classe, niveau))')
          .eq('parent_id', parentData.id);

        if (childrenData) {
          const kids = childrenData.map((c: any) => c.eleves);
          setChildren(kids);

          if (kids.length > 0) {
            setSelectedChild(kids[0]);

            // Récupérer les commentaires du premier enfant
            const { data: commentsData } = await supabase
              .from('commentaires')
              .select('*, enseignants(nom, prenom)')
              .eq('eleve_id', kids[0].id)
              .order('date_commentaire', { ascending: false });

            if (commentsData) {
              setComments(commentsData);
            }
          }
        }
      }

      // Récupérer les settings
      const settingsData = await getSettings();
      if (settingsData) {
        setSettings(settingsData);
        document.documentElement.style.setProperty('--color-primary', settingsData.primary_color);
      }

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleChildChange = async (childId: number) => {
    const child = children.find((c: any) => c.id === childId);
    setSelectedChild(child);

    // Récupérer les commentaires du nouveau enfant
    const { data: commentsData } = await supabase
      .from('commentaires')
      .select('*, enseignants(nom, prenom)')
      .eq('eleve_id', childId)
      .order('date_commentaire', { ascending: false });

    if (commentsData) {
      setComments(commentsData);
    }
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
        <div className={styles.headerContent}>
          {settings?.school_logo_url && (
            <img src={settings.school_logo_url} alt="Logo" className={styles.headerLogo} />
          )}
          <div>
            <h1>{settings?.school_name || 'Établissement'}</h1>
            <p>Espace parent</p>
          </div>
        </div>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Déconnexion
        </button>
      </header>

      <main className={styles.main}>
        {settings?.welcome_text_parent && (
          <div
            style={{
              background: '#f0f7ff',
              border: '1px solid #bee5eb',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '30px',
              color: '#004085',
            }}
          >
            <p>{settings.welcome_text_parent}</p>
          </div>
        )}

        {children.length > 0 ? (
          <>
            <section className={styles.formSection} style={{ background: 'white', padding: '20px', marginBottom: '30px' }}>
              <h3>Sélectionner votre enfant</h3>

              <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                <select
                  value={selectedChild?.id || ''}
                  onChange={(e) => handleChildChange(parseInt(e.target.value))}
                >
                  {children.map((child: any) => (
                    <option key={child.id} value={child.id}>
                      {child.prenom} {child.nom} - {child.classes?.nom_classe} ({child.classes?.niveau})
                    </option>
                  ))}
                </select>
              </div>
            </section>

            {selectedChild && (
              <>
                <section className={styles.infoSection}>
                  <h3>
                    {selectedChild.prenom} {selectedChild.nom}
                  </h3>
                  <p style={{ marginBottom: '20px', color: '#666' }}>
                    <strong>Classe :</strong> {selectedChild.classes?.nom_classe} ({selectedChild.classes?.niveau})
                  </p>

                  {comments.length > 0 ? (
                    <>
                      <h4 style={{ marginBottom: '20px', marginTop: '30px' }}>
                        Observations ({comments.length})
                      </h4>
                      {comments.map((comment: any) => (
                        <div
                          key={comment.id}
                          style={{
                            background: '#fafafa',
                            padding: '20px',
                            marginBottom: '20px',
                            borderRadius: '8px',
                            borderLeft: '4px solid var(--color-primary)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                            <div>
                              <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
                                {new Date(comment.date_commentaire).toLocaleDateString('fr-FR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>
                            <p
                              style={{
                                color: '#666',
                                fontSize: '0.85rem',
                                margin: 0,
                                fontStyle: 'italic',
                              }}
                            >
                              {comment.enseignants?.prenom} {comment.enseignants?.nom}
                            </p>
                          </div>
                          <p style={{ lineHeight: 1.8, margin: 0, color: '#333' }}>
                            {comment.texte_commentaire}
                          </p>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                        background: '#f8f9fa',
                        borderRadius: '8px',
                        color: '#666',
                      }}
                    >
                      <p>Aucun commentaire n'est disponible pour le moment.</p>
                    </div>
                  )}
                </section>
              </>
            )}
          </>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              background: 'white',
              borderRadius: '8px',
              color: '#666',
            }}
          >
            <p>Aucun enfant n'est associé à votre compte.</p>
            <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>
              Veuillez contacter l'établissement pour corriger ce problème.
            </p>
          </div>
        )}

        {settings?.rgpd_notice && (
          <section
            style={{
              marginTop: '40px',
              padding: '20px',
              background: '#f8f9fa',
              borderRadius: '8px',
              fontSize: '0.85rem',
              color: '#666',
            }}
          >
            <h4 style={{ marginBottom: '10px' }}>Mentions RGPD</h4>
            <p>{settings.rgpd_notice}</p>
          </section>
        )}
      </main>
    </div>
  );
}
