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

export default function ParentEvaluation() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<number>(0);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'enfant' | 'parent'>('enfant');

  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔐 Vérification de l\'authentification...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ Pas d\'utilisateur, redirection vers login');
        router.push('/login/parent');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'parent') {
        console.log('❌ Pas un parent, redirection');
        router.push('/');
        return;
      }

      console.log('✅ Parent authentifié:', profile);
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
          const childList = childrenData
            .map((pe: any) => pe.eleves)
            .filter((e: any) => e !== null);
          
          console.log('✅ Enfants chargés:', childList);
          setChildren(childList);
          
          if (childList.length > 0 && childList[0]?.id) {
            console.log('🎯 Premier enfant sélectionné:', childList[0].id);
            setSelectedChild(childList[0].id);
          }
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (selectedChild === 0) {
      console.log('⚠️ selectedChild est 0, je n\'exécute rien');
      return;
    }

    const loadEvaluations = async () => {
      console.log('📊 Chargement des évaluations pour l\'enfant:', selectedChild);
      
      const { data: evalData, error } = await supabase
        .from('evaluations')
        .select('*')
        .eq('eleve_id', selectedChild)
        .order('date_evaluation', { ascending: false });

      console.log('🔍 QUERY ERROR:', error);
      console.log('🔍 QUERY DATA:', evalData);
      console.log('🔍 SELECTED CHILD:', selectedChild);

      if (error) {
        console.error('❌ Erreur lors du chargement:', error);
        setEvaluations([]);
        return;
      }

      if (evalData && evalData.length > 0) {
        console.log('✅ Évaluations trouvées:', evalData);
        setEvaluations(evalData);
      } else {
        console.log('⚠️ Aucune évaluation trouvée');
        setEvaluations([]);
      }

      setSelectedEvaluation(null);
    };

    loadEvaluations();
  }, [selectedChild]);

  const handleSelectEvaluation = (eval_: any) => {
    console.log('📌 Évaluation sélectionnée:', eval_);
    setSelectedEvaluation(eval_);
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) return <div className={styles.container}>Chargement...</div>;

  const currentChild = children.find(c => c.id === selectedChild);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/parent/dashboard" className={styles.headerBack}>
          ← Tableau de bord
        </Link>
        <h1>📊 Suivi des compétences</h1>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Déconnexion
        </button>
      </header>

      <main className={styles.main}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 'bold', marginRight: '10px' }}>
            👧 Enfant :
          </label>
          <select
            value={selectedChild}
            onChange={(e) => {
              const newChildId = parseInt(e.target.value);
              console.log('🔄 Changement d\'enfant:', newChildId);
              setSelectedChild(newChildId);
            }}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value={0}>-- Sélectionner --</option>
            {children.map(c => (
              <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
            ))}
          </select>
        </div>

        {selectedChild > 0 && (
          <>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button
                onClick={() => setViewMode('enfant')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: viewMode === 'enfant' ? 'var(--color-primary)' : '#ddd',
                  color: viewMode === 'enfant' ? 'white' : 'black',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                👧 Vue enfant
              </button>
              <button
                onClick={() => setViewMode('parent')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: viewMode === 'parent' ? 'var(--color-primary)' : '#ddd',
                  color: viewMode === 'parent' ? 'white' : 'black',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                👨‍👩‍👧 Vue parent
              </button>
            </div>

            {evaluations.length > 0 ? (
              <div style={{ marginBottom: '20px' }}>
                <h3>📅 Évaluations :</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {evaluations.map(eval_ => (
                    <button
                      key={eval_.id}
                      onClick={() => handleSelectEvaluation(eval_)}
                      style={{
                        padding: '10px 15px',
                        backgroundColor: selectedEvaluation?.id === eval_.id ? 'var(--color-primary)' : '#f0f0f0',
                        color: selectedEvaluation?.id === eval_.id ? 'white' : 'black',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      📅 {new Date(eval_.date_evaluation).toLocaleDateString('fr-FR')}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ color: '#999' }}>Aucune évaluation disponible.</p>
            )}

            {selectedEvaluation && (
              <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
                <h2>{viewMode === 'enfant' ? '✨ Mes progrès' : '📊 Évaluation'}</h2>

                {viewMode === 'enfant' ? (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                      {COMPETENCES.map(comp => {
                        const niveau = selectedEvaluation[comp.key];
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
                                <p style={{ margin: '10px 0', fontWeight: 'bold', color: niveauInfo.color }}>
                                  {niveauInfo.messageEnfant}
                                </p>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {selectedEvaluation.commentaire_enseignant && (
                      <div style={{ background: 'white', padding: '15px', borderRadius: '8px', borderLeft: '4px solid var(--color-primary)', marginTop: '20px' }}>
                        <h4>💬 Message de la maîtresse :</h4>
                        <p>{selectedEvaluation.commentaire_enseignant}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#e3f2fd' }}>
                          <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Compétence</th>
                          <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd' }}>Niveau</th>
                        </tr>
                      </thead>
                      <tbody>
                        {COMPETENCES.map(comp => {
                          const niveau = selectedEvaluation[comp.key];
                          const niveauInfo = NIVEAUX[niveau];
                          return (
                            <tr key={comp.key}>
                              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{comp.labelComplet}</td>
                              <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd', color: niveauInfo ? niveauInfo.color : '#999' }}>
                                {niveauInfo ? niveauInfo.symbols : '-'} {niveauInfo ? niveauInfo.messageParent : 'Non évalué'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {selectedEvaluation.commentaire_enseignant && (
                      <div style={{ background: 'white', padding: '15px', borderRadius: '8px', borderLeft: '4px solid var(--color-primary)' }}>
                        <h4>📝 Commentaires de l\'enseignant :</h4>
                        <p>{selectedEvaluation.commentaire_enseignant}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}