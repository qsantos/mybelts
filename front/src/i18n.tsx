import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            'error': 'Error',
            'loading': 'Loading',
            'not_connected': 'Not connected',
            'main_title': 'Skills',
            'home_page': 'Home',
            'login.title': 'Log In',
            'login.button': 'Log In',
            'login.username.title': 'User Name',
            'login.username.placeholder': 'Example: tartempion',
            'login.username.help': 'Your user name',
            'login.password.title': 'Password',
            'login.password.help': 'Your password',
            'login.cancel': 'Cancel',
            'login.confirm': 'Log in',
            'login.in_process': 'Logging in',
            'logout.button': 'Log Out',
            'belt_attempt.add.button': 'Add',
            'belt_attempt.add.title': 'Add Belt Attempt for',
            'belt_attempt.add.cancel': 'Cancel',
            'belt_attempt.add.confirm': 'Add',
            'belt_attempt.add.in_process': 'Adding',
            'belt_attempt.edit.button': 'Edit',
            'belt_attempt.edit.title': 'Edit Belt Attempt for',
            'belt_attempt.edit.cancel': 'Cancel',
            'belt_attempt.edit.confirm': 'Save',
            'belt_attempt.edit.in_process': 'Saving',
            'belt_attempt.add_edit.skill_domain.title': 'Skill Domain',
            'belt_attempt.add_edit.skill_domain.help': 'What skill domain was tested?',
            'belt_attempt.add_edit.belt.title': 'Belt',
            'belt_attempt.add_edit.belt.help': 'What belt did the student attempt?',
            'belt_attempt.add_edit.date.title': 'Date',
            'belt_attempt.add_edit.date.help': 'When did the student attempt to pass the belt?',
            'belt_attempt.add_edit.passed.title': 'Passed',
            'belt_attempt.add_edit.passed.help': 'Did the student pass?',
            'belt_attempt.delete.button': 'Delete',
            'belt_attempt.delete.title': 'Delete Belt Attempt of',
            'belt_attempt.delete.message': 'Are you sure you want to delete the belt attempt?',
            'belt_attempt.delete.cancel': 'Cancel',
            'belt_attempt.delete.confirm': 'Delete',
            'belt_attempt.delete.in_progress': 'Deleting',
            'belt_attempt.list.title.secondary': 'List of belt attempts',
            'belt_attempt.list.skill_domain.title': 'Skill domain',
            'belt_attempt.list.belt.title': 'Belt',
            'belt_attempt.list.date.title': 'Date',
            'belt_attempt.list.passed.title': 'Passed?',
            'belt_attempt.list.actions.title': 'Actions',
            'belt_attempt.grid.student': 'Student',
            'belt.add.button': 'Add',
            'belt.add.title': 'Add Belt',
            'belt.add.cancel': 'Cancel',
            'belt.add.confirm': 'Add',
            'belt.add.in_process': 'Adding',
            'belt.edit.button': 'Edit',
            'belt.edit.title': 'Edit Belt',
            'belt.edit.cancel': 'Cancel',
            'belt.edit.confirm': 'Save',
            'belt.edit.in_process': 'Saving',
            'belt.add_edit.name.title': 'Name',
            'belt.add_edit.name.placeholder': 'Example: White Belt',
            'belt.add_edit.name.help': 'Name of the belt',
            'belt.add_edit.color.title': 'Color',
            'belt.add_edit.color.help': 'Color of the belt',
            'belt.add_edit.color.placeholder': 'Choose a color',
            'belt.move.up.title': 'Move up',
            'belt.move.up.in_process': 'Moving up',
            'belt.move.down.title': 'Move down',
            'belt.move.down.in_process': 'Moving down',
            'belt.delete.button': 'Delete',
            'belt.delete.title': 'Delete Belt',
            'belt.delete.message': 'Are you sure you want to delete the belt?',
            'belt.delete.cancel': 'Cancel',
            'belt.delete.confirm': 'Delete',
            'belt.delete.in_process': 'Deleting',
            'belt.list.title.primary': 'Belts',
            'belt.list.title.secondary': 'List of available belts',
            'belt.list.rank.title': 'Rank',
            'belt.list.name.title': 'Name',
            'belt.list.color.title': 'Color',
            'belt.list.actions.title': 'Actions',
            'class_level.view.title': 'Class Level',
            'class_level.add.button': 'Add',
            'class_level.add.title': 'Add Class Level',
            'class_level.add.cancel': 'Cancel',
            'class_level.add.confirm': 'Add',
            'class_level.add.in_process': 'Adding',
            'class_level.edit.button': 'Edit',
            'class_level.edit.title': 'Edit Class Level',
            'class_level.edit.cancel': 'Cancel',
            'class_level.edit.confirm': 'Save',
            'class_level.edit.in_process': 'Saving',
            'class_level.add_edit.prefix.title': 'Prefix',
            'class_level.add_edit.prefix.placeholder': 'Example: 4e',
            'class_level.add_edit.prefix.help': 'Prefix for the class level',
            'class_level.delete.button': 'Delete',
            'class_level.delete.title': 'Delete Class Level',
            'class_level.delete.message': 'Are you sure you want to delete the class level?',
            'class_level.delete.cancel': 'Cancel',
            'class_level.delete.confirm': 'Delete',
            'class_level.delete.in_process': 'Deleting',
            'class_level.list.title.primary': 'Class Levels',
            'class_level.list.title.secondary': 'List of available class levels',
            'class_level.list.prefix.title': 'Prefix',
            'class_level.list.actions.title': 'Actions',
            'school_class.view.title': 'School Class',
            'school_class.view.belts': 'Belts',
            'school_class.add.button': 'Add',
            'school_class.add.title': 'Add School Class',
            'school_class.add.cancel': 'Cancel',
            'school_class.add.confirm': 'Add',
            'school_class.add.in_process': 'Adding',
            'school_class.edit.button': 'Add',
            'school_class.edit.title': 'Edit School Class',
            'school_class.edit.cancel': 'Cancel',
            'school_class.edit.confirm': 'Save',
            'school_class.edit.in_process': 'Saving',
            'school_class.add_edit.suffix.title': 'Suffix',
            'school_class.add_edit.suffix.placeholder': 'Example: D',
            'school_class.add_edit.suffix.help': 'Suffix for the class',
            'school_class.delete.button': 'Delete',
            'school_class.delete.title': 'Delete School Class',
            'school_class.delete.message': 'Are you sure you want to delete the class?',
            'school_class.delete.cancel': 'Cancel',
            'school_class.delete.confirm': 'Delete',
            'school_class.delete.in_process': 'Deleting',
            'school_class.list.title.secondary': 'List of classes',
            'school_class.list.suffix.title': 'Suffix',
            'school_class.list.actions.title': 'Actions',
            'skill_domain.add.button': 'Add',
            'skill_domain.add.title': 'Add Skill Domain',
            'skill_domain.add.cancel': 'Cancel',
            'skill_domain.add.confirm': 'Add',
            'skill_domain.add.in_process': 'Adding',
            'skill_domain.edit.button': 'Add',
            'skill_domain.edit.title': 'Edit Skill Domain',
            'skill_domain.edit.cancel': 'Cancel',
            'skill_domain.edit.confirm': 'Save',
            'skill_domain.edit.in_process': 'Saving',
            'skill_domain.add_edit.name.title': 'Name',
            'skill_domain.add_edit.name.placeholder': 'Example: Algebra',
            'skill_domain.add_edit.name.help': 'Name of the skill domain',
            'skill_domain.delete.button': 'Delete',
            'skill_domain.delete.title': 'Delete Skill Domain',
            'skill_domain.delete.message': 'Are you sure you want to delete the skill domain?',
            'skill_domain.delete.cancel': 'Cancel',
            'skill_domain.delete.confirm': 'Delete',
            'skill_domain.delete.in_process': 'Deleting',
            'skill_domain.list.title.primary': 'Skill Domains',
            'skill_domain.list.title.secondary': 'List of available skill domains',
            'skill_domain.list.name.title': 'Name',
            'skill_domain.list.actions.title': 'Actions',
            'student.view.title': 'Student',
            'student.add.button': 'Add',
            'student.add.button.tooltip': 'Add a new student to the class',
            'student.add.title': 'Add Student',
            'student.add.cancel': 'Cancel',
            'student.add.confirm': 'Add',
            'student.add.in_process': 'Adding',
            'student.edit.button': 'Add',
            'student.edit.title': 'Edit Student',
            'student.edit.cancel': 'Cancel',
            'student.edit.confirm': 'Save',
            'student.edit.in_process': 'Saving',
            'student.add_edit.rank.title': 'Rank',
            'student.add_edit.rank.placeholder': 'Example: 7',
            'student.add_edit.rank.help': 'Rank of the student',
            'student.add_edit.name.title': 'Name',
            'student.add_edit.name.placeholder': 'Example: John Doe',
            'student.add_edit.name.help': 'Name of the student',
            'student.delete.button': 'Delete',
            'student.delete.title': 'Delete Student',
            'student.delete.message': 'Are you sure you want to delete the student?',
            'student.delete.cancel': 'Cancel',
            'student.delete.confirm': 'Delete',
            'student.delete.in_process': 'Deleting',
            'student.update_ranks.button': 'Update Ranks',
            'student.update_ranks.button.tooltip': 'Quickly change the ranks of all students',
            'student.update_ranks.title': 'Update Ranks',
            'student.update_ranks.cancel': 'Cancel',
            'student.update_ranks.confirm': 'Save',
            'student.update_ranks.in_process': 'Saving',
            'student.list.title.secondary': 'List of students',
            'student.list.rank.title': 'Rank',
            'student.list.name.title': 'Name',
            'student.list.actions.title': 'Actions',
            'user.add.button': 'Add',
            'user.add.title': 'Add User',
            'user.add.cancel': 'Cancel',
            'user.add.confirm': 'Add',
            'user.add.in_process': 'Adding',
            'user.edit.button': 'Add',
            'user.edit.title': 'Edit User',
            'user.edit.cancel': 'Cancel',
            'user.edit.confirm': 'Save',
            'user.edit.in_process': 'Saving',
            'user.add_edit.name.title': 'Name',
            'user.add_edit.name.placeholder': 'Example: tartempion',
            'user.add_edit.name.help': 'Name of the user',
            'user.add_edit.password.title': 'Password',
            'user.add_edit.password.help': 'Password of the user',
            'user.add_edit.is_admin.title': 'Administrator',
            'user.add_edit.is_admin.help': 'Should the user have administrator privileges?',
            'user.delete.button': 'Delete',
            'user.delete.title': 'Delete User',
            'user.delete.message': 'Are you sure you want to delete the user?',
            'user.delete.cancel': 'Cancel',
            'user.delete.confirm': 'Delete',
            'user.delete.in_process': 'Deleting',
            'user.list.title.primary': 'Users',
            'user.list.title.secondary': 'List of the users',
            'user.list.name.title': 'Name',
            'user.list.is_admin.title': 'Is Admin?',
            'user.list.actions.title': 'Actions',
        }
    },
    fr: {
        translation: {
            'error': 'Erreur',
            'loading': 'Chargement',
            'not_connected': 'Non connecté',
            'main_title': 'Compétences',
            'home_page': 'Accueil',
            'login.title': 'Se connecter',
            'login.button': 'Se connecter',
            'login.username.title': 'Nom d\'utilisateur',
            'login.username.placeholder': 'Exemple: tartempion',
            'login.username.help': 'Votre nom d\'utilisateur',
            'login.password.title': 'Mot de passe',
            'login.password.help': 'Votre mot de passe',
            'login.cancel': 'Annuler',
            'login.confirm': 'Se connecter',
            'login.in_process': 'Connexion',
            'logout.button': 'Se déconnecter',
            'belt_attempt.add.button': 'Ajouter',
            'belt_attempt.add.title': 'Ajouter une tentative de',
            'belt_attempt.add.cancel': 'Annuler',
            'belt_attempt.add.confirm': 'Ajouter',
            'belt_attempt.add.in_process': 'Ajout',
            'belt_attempt.edit.button': 'Modifier',
            'belt_attempt.edit.title': 'Modifier une tentative de',
            'belt_attempt.edit.cancel': 'Annuler',
            'belt_attempt.edit.confirm': 'Enregistrer',
            'belt_attempt.edit.in_process': 'Enregistrement',
            'belt_attempt.add_edit.skill_domain.title': 'Domaine de compétence',
            'belt_attempt.add_edit.skill_domain.help': 'Quel domaine de compétence a été testé ?',
            'belt_attempt.add_edit.belt.title': 'Ceinture',
            'belt_attempt.add_edit.belt.help': 'Quelle ceinture l\'élève a-t-il essayé de passer ?',
            'belt_attempt.add_edit.date.title': 'Date',
            'belt_attempt.add_edit.date.help': 'Quand l\'élève a-t-il essayé de passer la ceinture ?',
            'belt_attempt.add_edit.passed.title': 'Réussi',
            'belt_attempt.add_edit.passed.help': 'L\'élève a-t-il réussi sa tentative ?',
            'belt_attempt.delete.button': 'Supprimer',
            'belt_attempt.delete.title': 'Supprimer une tentative de',
            'belt_attempt.delete.message': 'Êtes-vous de sûr de vouloir supprimer la tentative ?',
            'belt_attempt.delete.cancel': 'Annuler',
            'belt_attempt.delete.confirm': 'Supprimer',
            'belt_attempt.delete.in_progress': 'Suppression',
            'belt_attempt.list.title.secondary': 'Liste des tentatives',
            'belt_attempt.list.skill_domain.title': 'Domaine de compétence',
            'belt_attempt.list.belt.title': 'Ceinture',
            'belt_attempt.list.date.title': 'Date',
            'belt_attempt.list.passed.title': 'Réussi ?',
            'belt_attempt.list.actions.title': 'Actions',
            'belt_attempt.grid.student': 'Élève',
            'belt.add.button': 'Ajouter',
            'belt.add.title': 'Ajouter une ceinture',
            'belt.add.cancel': 'Annuler',
            'belt.add.confirm': 'Ajouter',
            'belt.add.in_process': 'Ajout',
            'belt.edit.button': 'Modifier',
            'belt.edit.title': 'Modifier une ceinture',
            'belt.edit.cancel': 'Annuler',
            'belt.edit.confirm': 'Enregistrer',
            'belt.edit.in_process': 'Enregistrement',
            'belt.add_edit.name.title': 'Nom',
            'belt.add_edit.name.placeholder': 'Exemple: Ceinture blanche',
            'belt.add_edit.name.help': 'Nom de la ceinture',
            'belt.add_edit.color.title': 'Couleur',
            'belt.add_edit.color.help': 'Couleur de la ceinture',
            'belt.add_edit.color.placeholder': 'Choisissez une couleur',
            'belt.move.up.title': 'Monter',
            'belt.move.up.in_process': 'Montée',
            'belt.move.down.title': 'Descendre',
            'belt.move.down.in_process': 'Descente',
            'belt.delete.button': 'Supprimer',
            'belt.delete.title': 'Supprimer la ceinture',
            'belt.delete.message': 'Êtes-vous sûr de vouloir supprimer la ceinture ?',
            'belt.delete.cancel': 'Annuler',
            'belt.delete.confirm': 'Supprimer',
            'belt.delete.in_process': 'Suppression',
            'belt.list.title.primary': 'Ceintures',
            'belt.list.title.secondary': 'Liste des ceintures disponibles',
            'belt.list.rank.title': 'Rang',
            'belt.list.name.title': 'Nom',
            'belt.list.color.title': 'Couleur',
            'belt.list.actions.title': 'Actions',
            'class_level.view.title': 'Niveaux',
            'class_level.add.button': 'Ajouter',
            'class_level.add.title': 'Ajouter un niveau',
            'class_level.add.cancel': 'Annuler',
            'class_level.add.confirm': 'Ajouter',
            'class_level.add.in_process': 'Ajout',
            'class_level.edit.button': 'Modifier',
            'class_level.edit.title': 'Modifier un niveau',
            'class_level.edit.cancel': 'Annuler',
            'class_level.edit.confirm': 'Enregistrer',
            'class_level.edit.in_process': 'Enregistrement',
            'class_level.add_edit.prefix.title': 'Préfixe',
            'class_level.add_edit.prefix.placeholder': 'Exemple: 4e',
            'class_level.add_edit.prefix.help': 'Préfixe pour le niveau',
            'class_level.delete.button': 'Supprimer',
            'class_level.delete.title': 'Supprimer le niveau',
            'class_level.delete.message': 'Êtes-vous sûr de vouloir supprimer le niveau',
            'class_level.delete.cancel': 'Annuler',
            'class_level.delete.confirm': 'Supprimer',
            'class_level.delete.in_process': 'Suppression',
            'class_level.list.title.primary': 'Niveaux',
            'class_level.list.title.secondary': 'Liste des niveaux disponibles',
            'class_level.list.prefix.title': 'Préfixe',
            'class_level.list.actions.title': 'Actions',
            'school_class.view.title': 'Classe',
            'school_class.view.belts': 'Ceintures',
            'school_class.add.button': 'Ajouter',
            'school_class.add.title': 'Ajouter une classe',
            'school_class.add.cancel': 'Annuler',
            'school_class.add.confirm': 'Ajouter',
            'school_class.add.in_process': 'Ajout',
            'school_class.edit.button': 'Ajouter',
            'school_class.edit.title': 'Modifier une classe',
            'school_class.edit.cancel': 'Annuler',
            'school_class.edit.confirm': 'Enregistrer',
            'school_class.edit.in_process': 'Enregistrement',
            'school_class.add_edit.suffix.title': 'Suffixe',
            'school_class.add_edit.suffix.placeholder': 'Exemple: D',
            'school_class.add_edit.suffix.help': 'Suffixe pour la classe',
            'school_class.delete.button': 'Supprimer',
            'school_class.delete.title': 'Supprimer la classe',
            'school_class.delete.message': 'Êtes-vous sûr de vouloir supprimer la classe',
            'school_class.delete.cancel': 'Annuler',
            'school_class.delete.confirm': 'Supprimer',
            'school_class.delete.in_process': 'Suppression',
            'school_class.list.title.secondary': 'Liste des classes',
            'school_class.list.suffix.title': 'Suffixe',
            'school_class.list.actions.title': 'Actions',
            'skill_domain.add.button': 'Ajouter',
            'skill_domain.add.title': 'Ajouter un domaine de compétences',
            'skill_domain.add.cancel': 'Annuler',
            'skill_domain.add.confirm': 'Ajouter',
            'skill_domain.add.in_process': 'Ajout',
            'skill_domain.edit.button': 'Ajouter',
            'skill_domain.edit.title': 'Modifier un domaine de compétences',
            'skill_domain.edit.cancel': 'Annuler',
            'skill_domain.edit.confirm': 'Enregistrer',
            'skill_domain.edit.in_process': 'Enregistrement',
            'skill_domain.add_edit.name.title': 'Nom',
            'skill_domain.add_edit.name.placeholder': 'Exemple: Algèbre',
            'skill_domain.add_edit.name.help': 'Nom du domaine de compétence',
            'skill_domain.delete.button': 'Supprimer',
            'skill_domain.delete.title': 'Supprimer un domaine de compétence',
            'skill_domain.delete.message': 'Êtes-vous sûr de vouloir supprimer un domaine de compétence ?',
            'skill_domain.delete.cancel': 'Annuler',
            'skill_domain.delete.confirm': 'Supprimer',
            'skill_domain.delete.in_process': 'Suppression',
            'skill_domain.list.title.primary': 'Domaines de compétence',
            'skill_domain.list.title.secondary': 'Liste des domaines de compétences disponibles',
            'skill_domain.list.name.title': 'Nom',
            'skill_domain.list.actions.title': 'Actions',
            'student.view.title': 'Élève',
            'student.add.button': 'Ajouter',
            'student.add.button.tooltip': 'Ajouter un nouvel élève à la classe',
            'student.add.title': 'Ajouter un élève',
            'student.add.cancel': 'Annuler',
            'student.add.confirm': 'Ajouter',
            'student.add.in_process': 'Ajout',
            'student.edit.button': 'Ajouter',
            'student.edit.title': 'Modifier un élève',
            'student.edit.cancel': 'Annuler',
            'student.edit.confirm': 'Enregistrer',
            'student.edit.in_process': 'Enregistrement',
            'student.add_edit.rank.title': 'Rang',
            'student.add_edit.rank.placeholder': 'Exemple: 7',
            'student.add_edit.rank.help': 'Rang de l\'élève',
            'student.add_edit.name.title': 'Nom',
            'student.add_edit.name.placeholder': 'Exemple: Noël Flantier',
            'student.add_edit.name.help': 'Nom de l\'élève',
            'student.delete.button': 'Supprimer',
            'student.delete.title': 'Supprimer l\'élève',
            'student.delete.message': 'Êtes-vous sûr de vouloir supprimer un élève ?',
            'student.delete.cancel': 'Annuler',
            'student.delete.confirm': 'Supprimer',
            'student.delete.in_process': 'Suppression',
            'student.update_ranks.button': 'Changer les rangs',
            'student.update_ranks.button.tooltip': 'Modifier rapidement les rangs de tous les élèves',
            'student.update_ranks.title': 'Changer les rangs',
            'student.update_ranks.cancel': 'Annuler',
            'student.update_ranks.confirm': 'Enregistrer',
            'student.update_ranks.in_process': 'Enregistrement',
            'student.list.title.secondary': 'Liste des élèves',
            'student.list.rank.title': 'Rang',
            'student.list.name.title': 'Nom',
            'student.list.actions.title': 'Actions',
            'user.add.button': 'Ajouter',
            'user.add.title': 'Ajouter un utilisateur',
            'user.add.cancel': 'Annuler',
            'user.add.confirm': 'Ajouter',
            'user.add.in_process': 'Ajout',
            'user.edit.button': 'Ajouter',
            'user.edit.title': 'Modifier un utilisateur',
            'user.edit.cancel': 'Annuler',
            'user.edit.confirm': 'Enregistrer',
            'user.edit.in_process': 'Enregistrement',
            'user.add_edit.name.title': 'Nom',
            'user.add_edit.name.placeholder': 'Exemple: tartempion',
            'user.add_edit.name.help': 'Nom de l\'utilisateur',
            'user.add_edit.password.title': 'Mot de passe',
            'user.add_edit.password.help': 'Mot de passe de l\'utilisateur',
            'user.add_edit.is_admin.title': 'Administrateur',
            'user.add_edit.is_admin.help': 'L\'utilisateur devrait-il avoir les droits d\'administration ?',
            'user.delete.button': 'Supprimer',
            'user.delete.title': 'Supprimer User',
            'user.delete.message': 'Êtes-vous sûr de vouloir supprimer un utilisateur ?',
            'user.delete.cancel': 'Annuler',
            'user.delete.confirm': 'Supprimer',
            'user.delete.in_process': 'Suppression',
            'user.list.title.primary': 'Utilisateurs',
            'user.list.title.secondary': 'Liste des utilisateurs enregistrés',
            'user.list.name.title': 'Nom',
            'user.list.is_admin.title': 'Administrateur?',
            'user.list.actions.title': 'Actions',
        }
    }
};

i18n
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
        resources,
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;