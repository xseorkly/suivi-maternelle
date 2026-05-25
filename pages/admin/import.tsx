import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import { parseTeachersExcel, parseStudentsParentsExcel, downloadTeachersTemplate, downloadStudentsParentsTemplate } from '@/lib/excelUtils';
import styles from '@/styles/admin.module.css';

export default function AdminImport() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [importType, setImportType] = useState<'teachers' | 'students' | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [report, setReport] = useState<any>(null);
  const [importing, setImporting] = useState(false);

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

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setReport(null);
      setMessage('');
    }
  };

  const handleImportTeachers = async () => {
    if (!file) {
      setMessage('Veuillez sélectionner un fichier');
      return;
    }

    setImporting(true);
    setMessage('');

    try {
      const result = await parseTeachersExcel(file);

      if (!result.valid) {
        setMessage('Erreurs dans le fichier: ' + result.errors.join(', '));
        setImporting(false);
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const row of result.data) {
        try {
          // Créer l'utilisateur Auth
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: row['Identifiant enseignant'],
            password: row['Mot de passe enseignant'],
            options: {
              data: {
                nom: row['Nom de l\'enseignant'],
                prenom: row['Prénom de l\'enseignant'],
                role: 'enseignant',
              },
            },
          });

          if (authError || !authData.user) {
            errorCount++;
            continue;
          }

          // Créer le profil
          await supabase.from('profiles').insert([
            {
              id: authData.user.id,
              nom: row['Nom de l\'enseignant'],
              prenom: row['Prénom de l\'enseignant'],
              role: 'enseignant',
            },
          ]);

          // Créer l'enseignant
          const { data: teacherData } = await supabase
            .from('enseignants')
            .insert([
              {
                profile_id: authData.user.id,
                nom: row['Nom de l\'enseignant'],
                prenom: row['Prénom de l\'enseignant'],
              },
            ])
            .select();

          // Associer à la classe
          if (teacherData) {
            const { data: classData } = await supabase
              .from('classes')
              .select('id')
              .eq('nom_classe', row.Classe)
              .single();

            if (classData) {
              await supabase.from('enseignants_classes').insert([
                {
                  enseignant_id: teacherData[0].id,
                  classe_id: classData.id,
                },
              ]);
            }
          }

          successCount++;
        } catch (error) {
          errorCount++;
        }
      }

      setReport({
        type: 'teachers',
        total: result.data.length,
        success: successCount,
        errors: errorCount,
      });

      setMessage(`Import réussi: ${successCount} enseignants créés, ${errorCount} erreurs`);
    } catch (error) {
      setMessage('Erreur lors de l\'import');
    }

    setImporting(false);
  };

  const handleImportStudents = async () => {
    if (!file) {
      setMessage('Veuillez sélectionner un fichier');
      return;
    }

    setImporting(true);
    setMessage('');

    try {
      const result = await parseStudentsParentsExcel(file);

      if (!result.valid) {
        setMessage('Erreurs: ' + result.errors.join(', '));
        setImporting(false);
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const row of result.data) {
        try {
          // Créer le parent
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: row['Identifiant parent'],
            password: row['Mot de passe parent'],
            options: {
              data: {
                nom: row['Nom du parent'],
                prenom: row['Prénom du parent'],
                role: 'parent',
              },
            },
          });

          if (authError || !authData.user) {
            errorCount++;
            continue;
          }

          // Créer le profil parent
          await supabase.from('profiles').insert([
            {
              id: authData.user.id,
              nom: row['Nom du parent'],
              prenom: row['Prénom du parent'],
              role: 'parent',
            },
          ]);

          // Créer l'enregistrement parent
          const { data: parentData } = await supabase
            .from('parents')
            .insert([
              {
                profile_id: authData.user.id,
                nom: row['Nom du parent'],
                prenom: row['Prénom du parent'],
              },
            ])
            .select();

          // Créer l'élève
          const { data: classData } = await supabase
            .from('classes')
            .select('id')
            .eq('nom_classe', row.Classe)
            .single();

          if (!classData) {
            errorCount++;
            continue;
          }

          const { data: studentData } = await supabase
            .from('eleves')
            .insert([
              {
                nom: row['Nom de l\'élève'],
                prenom: row['Prénom de l\'élève'],
                classe_id: classData.id,
              },
            ])
            .select();

          // Associer parent et élève
          if (parentData && studentData) {
            await supabase.from('parents_eleves').insert([
              {
                parent_id: parentData[0].id,
                eleve_id: studentData[0].id,
                lien_parental: row['Lien parental'],
              },
            ]);
          }

          successCount++;
        } catch (error) {
          errorCount++;
        }
      }

      setReport({
        type: 'students',
        total: result.data.length,
        success: successCount,
        errors: errorCount,
      });

      setMessage(`Import réussi: ${successCount} élèves/parents créés, ${errorCount} erreurs`);
    } catch (error) {
      setMessage('Erreur lors de l\'import');
    }

    setImporting(false);
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
        <h1>Importation des données</h1>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Déconnexion
        </button>
      </header>

      <main className={styles.main}>
        <section className={styles.form} style={{ maxWidth: '700px' }}>
          <h2>Importer les données</h2>
          <p style={{ color: '#666', marginBottom: '30px' }}>
            Sélectionnez le type d'import et le fichier Excel à importer.
          </p>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '15px' }}>Type d'import</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', cursor: 'pointer' }}>
              <input
                type="radio"
                value="teachers"
                checked={importType === 'teachers'}
                onChange={(e) => {
                  setImportType('teachers');
                  setFile(null);
                  setReport(null);
                  setMessage('');
                }}
              />
              Enseignants
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="radio"
                value="students"
                checked={importType === 'students'}
                onChange={(e) => {
                  setImportType('students');
                  setFile(null);
                  setReport(null);
                  setMessage('');
                }}
              />
              Élèves & Parents
            </label>
          </div>

          {importType && (
            <>
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ marginBottom: '15px' }}>Télécharger le modèle</h3>
                <button
                  onClick={() => {
                    if (importType === 'teachers') {
                      downloadTeachersTemplate();
                    } else {
                      downloadStudentsParentsTemplate();
                    }
                  }}
                  style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  📥 Télécharger le modèle Excel
                </button>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ marginBottom: '15px' }}>Sélectionner le fichier</h3>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  style={{
                    padding: '10px',
                    border: '2px dashed var(--color-primary)',
                    borderRadius: '6px',
                    width: '100%',
                  }}
                />
                {file && <p style={{ color: '#28a745', marginTop: '10px' }}>✓ {file.name}</p>}
              </div>

              {message && (
                <div
                  className={message.includes('réussi') ? styles.successMessage : styles.errorMessage}
                  style={{ marginBottom: '20px' }}
                >
                  {message}
                </div>
              )}

              {report && (
                <div
                  style={{
                    background: '#f8f9fa',
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    borderLeft: '4px solid var(--color-primary)',
                  }}
                >
                  <h4>Rapport d'importation</h4>
                  <p>Total: {report.total}</p>
                  <p style={{ color: '#28a745' }}>✓ Réussi: {report.success}</p>
                  {report.errors > 0 && <p style={{ color: 'var(--color-tertiary)' }}>✗ Erreurs: {report.errors}</p>}
                </div>
              )}

              <button
                onClick={importType === 'teachers' ? handleImportTeachers : handleImportStudents}
                disabled={!file || importing}
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  padding: '12px 30px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: importing ? 'not-allowed' : 'pointer',
                  width: '100%',
                  fontWeight: 'bold',
                  opacity: !file || importing ? 0.6 : 1,
                }}
              >
                {importing ? 'Import en cours...' : '📤 Importer le fichier'}
              </button>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
