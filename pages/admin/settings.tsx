import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase, getSettings, Settings, uploadLogo } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import styles from '@/styles/admin.module.css';

export default function AdminSettings() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [formData, setFormData] = useState({
    school_name: '',
    site_title: '',
    school_year: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    primary_color: '#0066CC',
    secondary_color: '#FFFFFF',
    tertiary_color: '#FF0000',
    welcome_text_parent: '',
    welcome_text_teacher: '',
    legal_notice: '',
    rgpd_notice: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);

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
      const data = await getSettings();
      if (data) {
        setSettings(data);
        setFormData({
          school_name: data.school_name || '',
          site_title: data.site_title || '',
          school_year: data.school_year || '',
          contact_email: data.contact_email || '',
          contact_phone: data.contact_phone || '',
          address: data.address || '',
          primary_color: data.primary_color || '#0066CC',
          secondary_color: data.secondary_color || '#FFFFFF',
          tertiary_color: data.tertiary_color || '#FF0000',
          welcome_text_parent: data.welcome_text_parent || '',
          welcome_text_teacher: data.welcome_text_teacher || '',
          legal_notice: data.legal_notice || '',
          rgpd_notice: data.rgpd_notice || '',
        });
        document.documentElement.style.setProperty('--color-primary', data.primary_color);
        document.documentElement.style.setProperty('--color-secondary', data.secondary_color);
      }

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      let logoUrl = settings?.school_logo_url;

      // Upload du logo si un nouveau fichier est fourni
      if (logoFile) {
        const url = await uploadLogo(logoFile, 'school-logo');
        if (url) {
          logoUrl = url;
        }
      }

      // Sauvegarder les paramètres
      const { error } = await supabase
        .from('settings')
        .update({
          ...formData,
          school_logo_url: logoUrl,
        })
        .eq('id', settings?.id);

      if (error) {
        setMessage('Erreur lors de la sauvegarde');
      } else {
        setMessage('Paramètres enregistrés avec succès');
        // Appliquer les couleurs
        document.documentElement.style.setProperty('--color-primary', formData.primary_color);
        document.documentElement.style.setProperty('--color-secondary', formData.secondary_color);
        document.documentElement.style.setProperty('--color-tertiary', formData.tertiary_color);
      }
    } catch (error) {
      setMessage('Erreur lors de la sauvegarde');
    }

    setSaving(false);
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
          ← Retour
        </Link>
        <h1>Paramètres de l'établissement</h1>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Déconnexion
        </button>
      </header>

      <main className={styles.main}>
        <form className={styles.form}>
          <section className={styles.formSection}>
            <h2>Informations de l'établissement</h2>

            <div className={styles.formGroup}>
              <label htmlFor="school_name">Nom de l'établissement *</label>
              <input
                id="school_name"
                name="school_name"
                type="text"
                value={formData.school_name}
                onChange={handleInputChange}
                placeholder="Maternelle École..."
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="site_title">Titre du site *</label>
              <input
                id="site_title"
                name="site_title"
                type="text"
                value={formData.site_title}
                onChange={handleInputChange}
                placeholder="Suivi du comportement de votre enfant en maternelle"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="school_year">Année scolaire *</label>
              <input
                id="school_year"
                name="school_year"
                type="text"
                value={formData.school_year}
                onChange={handleInputChange}
                placeholder="2025-2026"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="address">Adresse</label>
              <input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="123 rue de l'École, 75000 Paris"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="contact_email">Email de contact *</label>
              <input
                id="contact_email"
                name="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={handleInputChange}
                placeholder="contact@ecole.fr"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="contact_phone">Téléphone</label>
              <input
                id="contact_phone"
                name="contact_phone"
                type="tel"
                value={formData.contact_phone}
                onChange={handleInputChange}
                placeholder="01 23 45 67 89"
              />
            </div>
          </section>

          <section className={styles.formSection}>
            <h2>Logo</h2>

            <div className={styles.formGroup}>
              <label htmlFor="logo">Importer le logo</label>
              {settings?.school_logo_url && (
                <div className={styles.logoPreview}>
                  <img src={settings.school_logo_url} alt="Logo actuel" />
                </div>
              )}
              <input
                id="logo"
                name="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
              />
              {logoFile && <p>Nouveau fichier: {logoFile.name}</p>}
            </div>
          </section>

          <section className={styles.formSection}>
            <h2>Couleurs</h2>

            <div className={styles.colorGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="primary_color">Couleur primaire</label>
                <input
                  id="primary_color"
                  name="primary_color"
                  type="color"
                  value={formData.primary_color}
                  onChange={handleInputChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="secondary_color">Couleur secondaire</label>
                <input
                  id="secondary_color"
                  name="secondary_color"
                  type="color"
                  value={formData.secondary_color}
                  onChange={handleInputChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="tertiary_color">Couleur tertiaire</label>
                <input
                  id="tertiary_color"
                  name="tertiary_color"
                  type="color"
                  value={formData.tertiary_color}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </section>

          <section className={styles.formSection}>
            <h2>Textes d'accueil</h2>

            <div className={styles.formGroup}>
              <label htmlFor="welcome_text_parent">Texte d'accueil pour les parents</label>
              <textarea
                id="welcome_text_parent"
                name="welcome_text_parent"
                value={formData.welcome_text_parent}
                onChange={handleInputChange}
                rows={4}
                placeholder="Bienvenue..."
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="welcome_text_teacher">Texte d'accueil pour les enseignants</label>
              <textarea
                id="welcome_text_teacher"
                name="welcome_text_teacher"
                value={formData.welcome_text_teacher}
                onChange={handleInputChange}
                rows={4}
                placeholder="Bienvenue..."
              />
            </div>
          </section>

          <section className={styles.formSection}>
            <h2>Mentions légales</h2>

            <div className={styles.formGroup}>
              <label htmlFor="legal_notice">Mentions légales</label>
              <textarea
                id="legal_notice"
                name="legal_notice"
                value={formData.legal_notice}
                onChange={handleInputChange}
                rows={3}
                placeholder="Tous droits réservés..."
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="rgpd_notice">Notice RGPD</label>
              <textarea
                id="rgpd_notice"
                name="rgpd_notice"
                value={formData.rgpd_notice}
                onChange={handleInputChange}
                rows={4}
                placeholder="Conformément au RGPD..."
              />
            </div>
          </section>

          {message && (
            <div className={message.includes('succès') ? styles.successMessage : styles.errorMessage}>
              {message}
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={styles.submitButton}
          >
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </form>
      </main>
    </div>
  );
}
