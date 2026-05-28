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
  5: { symbols: '☀️☀️☀️', label: 'Excellent !', color: '#4CAF50', messageEnfant: '🎉 Bravo ! Tu es une super star !', messageParent: 'Compétence maîtrisée' },
  4: { symbols: '☀️☀️', label: 'Bien !', color: '#8BC34A', messageEnfant: '👍 Bien joué ! Tu progresses !', messageParent: 'En voie d\'acquisition' },
  3: { symbols: '☁️', label: 'Moyen', color: '#FFC107', messageEnfant: '☁️ C\'est normal ! On va continuer ensemble', messageParent: 'À travailler. En cours d\'apprentissage.' },
  2: { symbols: '☁️⛈️', label: 'Difficultés', color: '#FF9800', messageEnfant: '💪 C\'est difficile, mais ne t\'inquiète pas, on va t\'aider !', messageParent: 'Difficultés. Soutien recommandé à la maison.' },
  1: { symbols: '⛈️', label: 'Très difficile', color: '#F44336', messageEnfant: '🤝 Besoin d\'aide spéciale, on travaille ensemble', messageParent: 'Action requise. Contact avec l\'enseignant.' },
};

export default function ParentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<number>(0);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [selectedEval, setSelectedEval] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'enfant' | 'parent'>('parent');

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
        .order('date_commentaire', { ascending: false });

      if (evalData && evalData.length > 0) {
        setEvaluations(evalData);
        setSelectedEval(evalData[0]);
      } else {
        setEvaluations([]);
        setSelectedEval(null);
      }

      if (commentData) {
        setComments(commentData);
      } else {
        setComments([]);
      }
    };

    loadData();
  }, [selectedChild]);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) return <div className={styles.container}>Chargement...</div>;

  const currentChild = children.find(c => c.id === selectedChild);

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
              <p style={{ fontSize: '1.1rem', marginBottom: 0 }}>📍 Classe : <strong>MS</strong></p>
            </div>

            {evaluations.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <h3>📅 Évaluations disponibles</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  {evaluations.map(eval_ => (
                    <button
                      key={eval_.id}
                      onClick={() => setSelectedEval(eval_)}
                      style={{
                        padding: '10px 15px',
                        borderRadius: '6px',
                        border: 'none',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        backgroundColor: selectedEval?.id === eval_.id ? '#007bff' : '#f0f0f0',
                        color: selectedEval?.id === eval_.id ? 'white' : 'black',
                        transition: 'all 0.3s'
                      }}
                    >
                      📅 {new Date(eval_.date_evaluation).toLocaleDateString('fr-FR')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedEval && (
              <>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <button
                    onClick={() => setViewMode('enfant')}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: viewMode === 'enfant' ? '#007bff' : '#ddd',
                      color: viewMode === 'enfant' ? 'white' : 'black',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    👧 Vue enfant
                  </button>
                  <button
                    onClick={() => setViewMode('parent')}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: viewMode === 'parent' ? '#007bff' : '#ddd',
                      color: viewMode === 'parent' ? 'white' : 'black',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    👨‍👩‍👧 Vue parent
                  </button>
                </div>

                <div style={{ marginBottom: '40px' }}>
                  <h3>📊 Évaluation du {new Date(selectedEval.date_evaluation).toLocaleDateString('fr-FR')}</h3>

                  {viewMode === 'enfant' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                      {COMPETENCES.map(comp => {
                        const niveau = selectedEval[comp.key];
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
                            <h4 style={{ margin: '0 0 10px 0' }}>{comp.label}</h4>
                            {niveauInfo && (
                              <>
                                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>
                                  {niveauInfo.symbols}
                                </div>
                                <p style={{ margin: '10px 0', fontWeight: 'bold', color: niveauInfo.color, fontSize: '0.9rem' }}>
                                  {niveauInfo.messageEnfant}
                                </p>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#e3f2fd' }}>
                          <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Compétence</th>
                          <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd' }}>Niveau</th>
                          <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {COMPETENCES.map(comp => {
                          const niveau = selectedEval[comp.key];
                          const niveauInfo = NIVEAUX[niveau];
                          return (
                            <tr key={comp.key}>
                              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{comp.labelComplet}</td>
                              <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd', fontWeight: 'bold' }}>
                                {niveauInfo ? niveauInfo.symbols : '-'}
                              </td>
                              <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd', color: niveauInfo ? niveauInfo.color : '#999' }}>
                                {niveauInfo ? niveauInfo.messageParent : 'Non évalué'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}

                  {selectedEval.commentaire_enseignant && (
                    <div style={{
                      marginTop: '20px',
                      padding: '15px',
                      backgroundColor: '#e8f5e9',
                      borderLeft: '4px solid #4CAF50',
                      borderRadius: '6px',
                    }}>
                      <p style={{ fontWeight: 'bold', margin: '0 0 10px 0' }}>💭 Note de l\'enseignant :</p>
                      <p style={{ margin: 0, lineHeight: '1.6' }}>{selectedEval.commentaire_enseignant}</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {evaluations.length === 0 && (
              <div style={{ padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px', textAlign: 'center', marginBottom: '40px' }}>
                <p style={{ color: '#666' }}>Aucune évaluation disponible pour le moment.</p>
              </div>
            )}

            {comments.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <h3>💬 Commentaires de l\'enseignant ({comments.length})</h3>
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
                        <p style={{ fontWeight: 'bold', margin: 0 }}>✍️ Enseignant</p>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                          📅 {new Date(comment.date_commentaire).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      <p style={{ margin: 0, lineHeight: '1.6' }}>{comment.texte_commentaire}</p>
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
