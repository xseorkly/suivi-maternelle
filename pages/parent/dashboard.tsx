import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import styles from '@/styles/admin.module.css';

const COMPETENCES = [
  { key: 'gestion_emotions', label: '😊 Je gère mes émotions', labelComplet: 'Gestion des émotions' },
  { key: 'garder_calme', label: '🧘 Je garde mon calme', labelComplet: 'Garder son calme' },
  { key: 'utiliser_mots', label: '💬 Utiliser des mots', labelComplet: 'Utiliser des mots pour exprimer' },
  { key: 'demander_aide', label: '🙋 Demander de l\'aide', labelComplet: 'Demander l\'aide d\'un adulte' },
  { key: 'vivre_ensemble', label: '👫 Vivre avec les autres', labelComplet: 'Vivre bien avec les autres' },
  { key: 'cooperer', label: '🤝 Coopérer', labelComplet: 'Coopérer avec les autres' },
  { key: 'respecter_autres', label: '🫱 Respecter', labelComplet: 'Respecter les autres' },
  { key: 'faire_travail', label: '📚 Faire son travail', labelComplet: 'Faire son travail d\'élève' },
  { key: 'ecouter_consignes', label: '👂 Écouter', labelComplet: 'Écouter les consignes' },
  { key: 'attendre_tour', label: '🚦 Attendre son tour', labelComplet: 'Attendre son tour' },
];

const NIVEAUX: any = {
  5: { symbols: '☀️☀️☀️', label: 'Excellent !', color: '#4CAF50', messageParent: 'Compétence maîtrisée' },
  4: { symbols: '☀️☀️', label: 'Bien !', color: '#8BC34A', messageParent: 'En voie d\'acquisition' },
  3: { symbols: '☁️', label: 'Moyen', color: '#FFC107', messageParent: 'À travailler. En cours d\'apprentissage.' },
  2: { symbols: '☁️⛈️', label: 'Difficultés', color: '#FF9800', messageParent: 'Difficultés. Soutien recommandé à la maison.' },
  1: { symbols: '⛈️', label: 'Très difficile', color: '#F44336', messageParent: 'Action requise. Contact avec l\'enseignant.' },
};

export default function ParentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<number>(0);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login/parent');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'parent') {
        router.push('/');
        return;
      }

      setUser(profile);

      const { data: parentData } = await supabase
        .from('parents')
        .select('id')
        .eq('profile_id', user.id)
        .single();

      if (parentData) {
        const { data: childrenData } = await supabase
          .from('parents_eleves')
          .select('eleve_id, eleves(id, nom, prenom, classe_id)')
          .eq('parent_id', parentData.id);

        if (childrenData && childrenData.length > 0) {
          const childList = childrenData.map((pe: any) => pe.eleves).filter((e: any) => e !== null);
          setChildren(childList);
          if (childList.length > 0 && childList[0]?.id) {
            setSelectedChild(childList[0].id);
          }
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (selectedChild === 0) return;

    const loadData = async () => {
      const { data: evalData } = await supabase
        .from('evaluations')
        .select('*')
        .eq('eleve_id', selectedChild)
        .order('date_evaluation', { ascending: false });

      const { data: commentData } = await supabase
        .from('commentaires')
        .select('*')
        .eq('eleve_id', selectedChild)
        .order('date_creation', { ascending: false });

      if (evalData) setEvaluations(evalData);
      if (commentData) setComments(commentData);
    };

    loadData();
  }, [selectedChild]);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) return <div className={styles.container}>Chargement...</div>;

  const currentChild = children.find(c => c.id === selectedChild);
  const latestEval = evaluations.length > 0 ? evaluations[0] : null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>📚 Tableau de bord parent</h1>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Déconnexion
        </button>
      </header>

      <main className={styles.main}>
        <div style={{ marginBottom: '30px' }}>
          <label style={{ fontWeight: 'bold', marginRight: '10px', fontSize: '1.1rem' }}>
            👧 Sélectionner votre enfant :
          </label>
          <select
            value={selectedChild}
            onChange={(e) => setSelectedChild(parseInt(e.target.value))}
            style={{ padding: '10px', borderRadius: '6px', border: '2px solid #007bff', fontSize: '1rem' }}
          >
            <option value={0}>-- Choisir un enfant --</option>
            {children.map(c => (
              <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
            ))}
          </select>
        </div>

        {selectedChild > 0 && currentChild && (
          <>
            <div style={{ padding: '20px', backgroundColor: '#e3f2fd', borderRadius: '8px', marginBottom: '30px' }}>
              <h2>{currentChild.prenom} {currentChild.nom}</h2>
              <p style={{ fontSize: '1.1rem', marginBottom: 0 }}>📍 Classe : <strong>{currentChild.classe_id ? 'MS' : 'Non spécifiée'}</strong></p>
            </div>

            {latestEval && (
              <div style={{ marginBottom: '40px' }}>
                <h3>📊 Dernière évaluation ({new Date(latestEval.date_evaluation).toLocaleDateString('fr-FR')})</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                  {COMPETENCES.map(comp => {
                    const niveau = latestEval[comp.key];
                    const niveauInfo = NIVEAUX[niveau];
                    return (
                      <div
                        key={comp.key}
                        style={{
                          padding: '15px',
                          borderRadius: '8px',
                          backgroundColor: niveauInfo ? niveauInfo.color + '22' : '#f0f0f0',
                          border: `3px solid ${niveauInfo ? niveauInfo.color : '#ddd'}`,
                          textAlign: 'center',
                        }}
                      >
                        <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', fontSize: '0.9rem' }}>{comp.labelComplet}</p>
                        {niveauInfo && (
                          <>
                            <div style={{ fontSize: '2rem', marginBottom: '5px' }}>{niveauInfo.symbols}</div>
                            <p style={{ margin: '5px 0', fontWeight: 'bold', color: niveauInfo.color, fontSize: '0.9rem' }}>
                              {niveauInfo.messageParent}
                            </p>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {comments.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <h3>💬 Commentaires de l\'enseignant</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {comments.map(comment => (
                    <div
                      key={comment.id}
                      style={{
                        padding: '15px',
                        backgroundColor: '#fff3e0',
                        borderLeft: '4px solid #ff9800',
                        borderRadius: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <p style={{ fontWeight: 'bold', margin: 0 }}>✍️ {comment.enseignant_nom || 'Enseignant'}</p>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                          📅 {new Date(comment.date_creation).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <p style={{ margin: 0, lineHeight: '1.6' }}>{comment.contenu}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {comments.length === 0 && (
              <div style={{ padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ color: '#666' }}>Aucun commentaire pour le moment.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
