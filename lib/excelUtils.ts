import * as XLSX from 'xlsx';

// Interface pour les enseignants import
export interface TeacherImportRow {
  'Nom de l\'enseignant': string;
  'Prénom de l\'enseignant': string;
  Classe: string;
  'Identifiant enseignant': string;
  'Mot de passe enseignant': string;
}

// Interface pour élèves/parents import
export interface StudentParentImportRow {
  'Nom de l\'élève': string;
  'Prénom de l\'élève': string;
  Classe: string;
  'Nom du parent': string;
  'Prénom du parent': string;
  'Identifiant parent': string;
  'Mot de passe parent': string;
  'Lien parental': string;
  'Enseignant associé'?: string;
}

// Valider et lire un fichier Excel pour les enseignants
export async function parseTeachersExcel(file: File): Promise<{
  valid: boolean;
  data: TeacherImportRow[];
  errors: string[];
}> {
  const errors: string[] = [];

  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    if (!Array.isArray(data) || data.length === 0) {
      return {
        valid: false,
        data: [],
        errors: ['Le fichier est vide'],
      };
    }

    // Vérifier les colonnes obligatoires
    const requiredColumns = [
      'Nom de l\'enseignant',
      'Prénom de l\'enseignant',
      'Classe',
      'Identifiant enseignant',
      'Mot de passe enseignant',
    ];

    const headers = Object.keys(data[0]);
    const missingColumns = requiredColumns.filter((col) => !headers.includes(col));

    if (missingColumns.length > 0) {
      return {
        valid: false,
        data: [],
        errors: [
          `Colonnes manquantes: ${missingColumns.join(', ')}`,
        ],
      };
    }

    // Valider chaque ligne
    const validData: TeacherImportRow[] = [];
    data.forEach((row: any, idx: number) => {
      const rowNumber = idx + 2; // +2 car Excel a un header et comptage depuis 1

      if (!row['Nom de l\'enseignant'] || !row['Nom de l\'enseignant'].trim()) {
        errors.push(`Ligne ${rowNumber}: Nom manquant`);
        return;
      }

      if (!row['Prénom de l\'enseignant'] || !row['Prénom de l\'enseignant'].trim()) {
        errors.push(`Ligne ${rowNumber}: Prénom manquant`);
        return;
      }

      if (!row.Classe || !row.Classe.toString().trim()) {
        errors.push(`Ligne ${rowNumber}: Classe manquante`);
        return;
      }

      if (!row['Identifiant enseignant'] || !row['Identifiant enseignant'].toString().trim()) {
        errors.push(`Ligne ${rowNumber}: Identifiant manquant`);
        return;
      }

      if (!row['Mot de passe enseignant'] || !row['Mot de passe enseignant'].toString().trim()) {
        errors.push(`Ligne ${rowNumber}: Mot de passe manquant`);
        return;
      }

      validData.push(row);
    });

    return {
      valid: errors.length === 0,
      data: validData,
      errors,
    };
  } catch (error) {
    return {
      valid: false,
      data: [],
      errors: ['Erreur lors de la lecture du fichier Excel'],
    };
  }
}

// Valider et lire un fichier Excel pour élèves/parents
export async function parseStudentsParentsExcel(file: File): Promise<{
  valid: boolean;
  data: StudentParentImportRow[];
  errors: string[];
}> {
  const errors: string[] = [];

  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    if (!Array.isArray(data) || data.length === 0) {
      return {
        valid: false,
        data: [],
        errors: ['Le fichier est vide'],
      };
    }

    // Vérifier les colonnes obligatoires
    const requiredColumns = [
      'Nom de l\'élève',
      'Prénom de l\'élève',
      'Classe',
      'Nom du parent',
      'Prénom du parent',
      'Identifiant parent',
      'Mot de passe parent',
      'Lien parental',
    ];

    const headers = Object.keys(data[0]);
    const missingColumns = requiredColumns.filter((col) => !headers.includes(col));

    if (missingColumns.length > 0) {
      return {
        valid: false,
        data: [],
        errors: [`Colonnes manquantes: ${missingColumns.join(', ')}`],
      };
    }

    // Valider chaque ligne
    const validData: StudentParentImportRow[] = [];
    data.forEach((row: any, idx: number) => {
      const rowNumber = idx + 2;

      if (!row['Nom de l\'élève'] || !row['Nom de l\'élève'].trim()) {
        errors.push(`Ligne ${rowNumber}: Nom de l'élève manquant`);
        return;
      }

      if (!row['Prénom de l\'élève'] || !row['Prénom de l\'élève'].trim()) {
        errors.push(`Ligne ${rowNumber}: Prénom de l'élève manquant`);
        return;
      }

      if (!row.Classe || !row.Classe.toString().trim()) {
        errors.push(`Ligne ${rowNumber}: Classe manquante`);
        return;
      }

      if (!row['Nom du parent'] || !row['Nom du parent'].trim()) {
        errors.push(`Ligne ${rowNumber}: Nom du parent manquant`);
        return;
      }

      if (!row['Prénom du parent'] || !row['Prénom du parent'].trim()) {
        errors.push(`Ligne ${rowNumber}: Prénom du parent manquant`);
        return;
      }

      if (!row['Identifiant parent'] || !row['Identifiant parent'].toString().trim()) {
        errors.push(`Ligne ${rowNumber}: Identifiant parent manquant`);
        return;
      }

      if (!row['Mot de passe parent'] || !row['Mot de passe parent'].toString().trim()) {
        errors.push(`Ligne ${rowNumber}: Mot de passe parent manquant`);
        return;
      }

      validData.push(row);
    });

    return {
      valid: errors.length === 0,
      data: validData,
      errors,
    };
  } catch (error) {
    return {
      valid: false,
      data: [],
      errors: ['Erreur lors de la lecture du fichier Excel'],
    };
  }
}

// Créer un fichier Excel template pour les enseignants
export function downloadTeachersTemplate() {
  const templateData = [
    {
      'Nom de l\'enseignant': 'Dupont',
      'Prénom de l\'enseignant': 'Marie',
      Classe: 'PS A',
      'Identifiant enseignant': 'marie.dupont@ecole.fr',
      'Mot de passe enseignant': 'mot_de_passe_secure',
    },
    {
      'Nom de l\'enseignant': 'Martin',
      'Prénom de l\'enseignant': 'Jean',
      Classe: 'PS B',
      'Identifiant enseignant': 'jean.martin@ecole.fr',
      'Mot de passe enseignant': 'mot_de_passe_secure',
    },
  ];

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(templateData);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Enseignants');
  XLSX.writeFile(workbook, 'Enseignants_Template.xlsx');
}

// Créer un fichier Excel template pour élèves/parents
export function downloadStudentsParentsTemplate() {
  const templateData = [
    {
      'Nom de l\'élève': 'Moreau',
      'Prénom de l\'élève': 'Lucas',
      Classe: 'PS A',
      'Nom du parent': 'Moreau',
      'Prénom du parent': 'Isabelle',
      'Identifiant parent': 'isabelle.moreau@email.com',
      'Mot de passe parent': 'mot_de_passe_secure',
      'Lien parental': 'mère',
      'Enseignant associé': 'Marie Dupont',
    },
    {
      'Nom de l\'élève': 'Durand',
      'Prénom de l\'élève': 'Emma',
      Classe: 'PS A',
      'Nom du parent': 'Durand',
      'Prénom du parent': 'Pierre',
      'Identifiant parent': 'pierre.durand@email.com',
      'Mot de passe parent': 'mot_de_passe_secure',
      'Lien parental': 'père',
      'Enseignant associé': 'Marie Dupont',
    },
  ];

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(templateData);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Élèves et Parents');
  XLSX.writeFile(workbook, 'Eleves_Parents_Template.xlsx');
}
