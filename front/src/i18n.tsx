import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { DefaultService } from './api';

const resources = {
    en: {
        translation: {
            'error': 'Error',
            'loading': 'Loading',
            'not_connected': 'Not connected',
            'expired_token': 'Your session expired; please log in again',
            'not_found': 'Sorry, this page does not seem to exist',
            'main_title': 'MyBelts',
            'home_page': 'Home',
            'missing_i18n_keys': 'Since your last login, {{unique}} missing i18n keys were detected, totaling {{total}} events. Please notify the developer team.',
            'login.title': 'Log In',
            'login.button': 'Log In',
            'login.username.title': 'User Name',
            'login.username.placeholder': 'Example: jdoe',
            'login.username.help': 'Your user name',
            'login.password.title': 'Password',
            'login.password.help': 'Your password',
            'login.cancel': 'Cancel',
            'login.confirm': 'Log in',
            'login.in_process': 'Logging in',
            'logout.button': 'Log Out',
            'evaluation.add.button': 'Add',
            'evaluation.add.button.tooltip': 'Add a new evaluation of {{student.display_name}}',
            'evaluation.add.title': 'Add Evaluation of {{student.display_name}}',
            'evaluation.add.cancel': 'Cancel',
            'evaluation.add.confirm': 'Add',
            'evaluation.add.in_process': 'Adding',
            'evaluation.edit.button': '✏️',
            'evaluation.edit.button.tooltip': 'Edit evaluation of {{student.display_name}}',
            'evaluation.edit.title': 'Edit Evaluation of {{student.display_name}}',
            'evaluation.edit.cancel': 'Cancel',
            'evaluation.edit.confirm': 'Save',
            'evaluation.edit.in_process': 'Saving',
            'evaluation.add_edit.skill_domain.title': 'Skill Domain',
            'evaluation.add_edit.skill_domain.help': 'What skill domain was tested?',
            'evaluation.add_edit.belt.title': 'Belt',
            'evaluation.add_edit.belt.help': 'For which belt was the student evaluated?',
            'evaluation.add_edit.date.title': 'Date',
            'evaluation.add_edit.date.help': 'When did the student took the evaluation?',
            'evaluation.add_edit.passed.title': 'Passed',
            'evaluation.add_edit.passed.help': 'Did the student pass?',
            'evaluation.delete.button': '🗑️',
            'evaluation.delete.button.tooltip': 'Delete Evaluation of {{student.display_name}}',
            'evaluation.delete.title': 'Delete Evaluation of {{student.display_name}}',
            'evaluation.delete.message': 'Are you sure you want to delete the {{belt.name}} evaluation of {{skill_domain.name}}?',
            'evaluation.delete.cancel': 'Cancel',
            'evaluation.delete.confirm': 'Delete',
            'evaluation.delete.in_progress': 'Deleting',
            'evaluation.list.title.secondary': 'List of evaluations',
            'evaluation.list.skill_domain.title': 'Skill domain',
            'evaluation.list.belt.title': 'Belt',
            'evaluation.list.date.title': 'Date',
            'evaluation.list.passed.title': 'Passed?',
            'evaluation.list.actions.title': 'Actions',
            'waitlist.title': '$t(waitlist.title.students, {"count": {{student_count}}}) $t(waitlist.title.evaluations, {"count": {{evaluation_count}}})',
            'waitlist.title.students': '{{count}} student wants to pass',
            'waitlist.title.students_other': '{{count}} students want to pass a total of',
            'waitlist.title.evaluations': '{{count}} evaluation',
            'waitlist.title.evaluations_other': '{{count}} evaluations',
            'waitlist.convert.button': '✔',
            'waitlist.convert.button.tooltip': 'Fill in the corresponding completed evaluations',
            'waitlist.convert.title': 'Fill in Evaluations',
            'waitlist.convert.cancel': 'Cancel',
            'waitlist.convert.confirm': 'Save',
            'waitlist.convert.in_process': 'Saving',
            'waitlist.convert.common_date.title': 'Common date',
            'waitlist.convert.common_date.help': 'Set this field to change the date of all the evaluations',
            'waitlist.convert.columns.student': 'Student',
            'waitlist.convert.columns.skill_domain': 'Skill domain',
            'waitlist.convert.columns.belt': 'Belt',
            'waitlist.convert.columns.completed': 'Completed',
            'waitlist.convert.columns.date': 'Date',
            'waitlist.convert.columns.success': 'Passed',
            'belt.add.button': 'Add',
            'belt.add.button.tooltip': 'Add a new belt',
            'belt.add.title': 'Add Belt',
            'belt.add.cancel': 'Cancel',
            'belt.add.confirm': 'Add',
            'belt.add.in_process': 'Adding',
            'belt.edit.button': '✏️',
            'belt.edit.button.tooltip': 'Edit',
            'belt.edit.title': 'Edit Belt: {{belt.name}}',
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
            'belt.delete.button': '🗑️',
            'belt.delete.button.tooltip': 'Delete',
            'belt.delete.title': 'Delete Belt: {{belt.name}}',
            'belt.delete.message': 'Are you sure you want to delete {{belt.name}}?',
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
            'class_level.add.button.tooltip': 'Add a new level',
            'class_level.add.title': 'Add Class Level',
            'class_level.add.cancel': 'Cancel',
            'class_level.add.confirm': 'Add',
            'class_level.add.in_process': 'Adding',
            'class_level.edit.button': '✏️',
            'class_level.edit.button.tooltip': 'Edit',
            'class_level.edit.title': 'Edit Class Level: {{class_level.prefix}}',
            'class_level.edit.cancel': 'Cancel',
            'class_level.edit.confirm': 'Save',
            'class_level.edit.in_process': 'Saving',
            'class_level.add_edit.prefix.title': 'Prefix',
            'class_level.add_edit.prefix.placeholder': 'Example: 4e',
            'class_level.add_edit.prefix.help': 'Prefix for the class level',
            'class_level.delete.button': '🗑️',
            'class_level.delete.button.tooltip': 'Delete',
            'class_level.delete.title': 'Delete Class Level: {{class_level.prefix}}',
            'class_level.delete.message': 'Are you sure you want to delete the class level?',
            'class_level.delete.cancel': 'Cancel',
            'class_level.delete.confirm': 'Delete',
            'class_level.delete.in_process': 'Deleting',
            'class_level.list.title.primary': 'Class Levels',
            'class_level.list.title.secondary': 'List of available class levels',
            'class_level.list.prefix.title': 'Prefix',
            'class_level.list.actions.title': 'Actions',
            'school_class.view.title': 'School Class',
            'school_class.add.button': 'Add',
            'school_class.add.button.tooltip': 'Create a new class in this level',
            'school_class.add.title': 'Add School Class in {{class_level.prefix}}',
            'school_class.add.cancel': 'Cancel',
            'school_class.add.confirm': 'Add',
            'school_class.add.in_process': 'Adding',
            'school_class.edit.button': '✏️',
            'school_class.edit.button.tooltip': 'Edit',
            'school_class.edit.title': 'Edit School Class: {{class_level.prefix}}{{school_class.suffix}}',
            'school_class.edit.cancel': 'Cancel',
            'school_class.edit.confirm': 'Save',
            'school_class.edit.in_process': 'Saving',
            'school_class.add_edit.suffix.title': 'Suffix',
            'school_class.add_edit.suffix.placeholder': 'Example: D',
            'school_class.add_edit.suffix.help': 'Suffix for the class',
            'school_class.delete.button': '🗑️',
            'school_class.delete.button.tooltip': 'Delete',
            'school_class.delete.title': 'Delete School Class: {{class_level.prefix}}{{school_class.suffix}}',
            'school_class.delete.message': 'Are you sure you want to delete the class?',
            'school_class.delete.cancel': 'Cancel',
            'school_class.delete.confirm': 'Delete',
            'school_class.delete.in_process': 'Deleting',
            'school_class.list.title.secondary': 'List of classes',
            'school_class.list.suffix.title': 'Suffix',
            'school_class.list.actions.title': 'Actions',
            'skill_domain.add.button': 'Add',
            'skill_domain.add.button.tooltip': 'Add a new skill domain',
            'skill_domain.add.title': 'Add Skill Domain',
            'skill_domain.add.cancel': 'Cancel',
            'skill_domain.add.confirm': 'Add',
            'skill_domain.add.in_process': 'Adding',
            'skill_domain.edit.button': '✏️',
            'skill_domain.edit.button.tooltip': 'Edit',
            'skill_domain.edit.title': 'Edit Skill Domain: {{skill_domain.name}}',
            'skill_domain.edit.cancel': 'Cancel',
            'skill_domain.edit.confirm': 'Save',
            'skill_domain.edit.in_process': 'Saving',
            'skill_domain.add_edit.name.title': 'Name',
            'skill_domain.add_edit.name.placeholder': 'Example: Algebra',
            'skill_domain.add_edit.name.help': 'Name of the skill domain',
            'skill_domain.delete.button': '🗑️',
            'skill_domain.delete.button.tooltip': 'Delete',
            'skill_domain.delete.title': 'Delete Skill Domain: {{skill_domain.name}}',
            'skill_domain.delete.message': 'Are you sure you want to delete the skill domain?',
            'skill_domain.delete.cancel': 'Cancel',
            'skill_domain.delete.confirm': 'Delete',
            'skill_domain.delete.in_process': 'Deleting',
            'skill_domain.list.title.primary': 'Skill Domains',
            'skill_domain.list.title.secondary': 'List of available skill domains',
            'skill_domain.list.name.title': 'Name',
            'skill_domain.list.actions.title': 'Actions',
            'student.view.title': 'Student',
            'student.view.school_class': 'Class',
            'student.belts.title': 'Current belts',
            'student.belts.skill_domain.title': 'Skill domain',
            'student.belts.achieved_belt.title': 'Achieved belt',
            'student.belts.actions.title': 'Actions',
            'student.belts.no_belt': 'No passed belt yet',
            'student.waitlist.add.button': '<img src="/evaluation.png" height="30" />',
            'student.waitlist.add.button.tooltip': 'Register to the next {{belt.name}} evaluation in {{skill_domain.name}}',
            'student.waitlist.add.title': 'Registration to the next evaluation',
            'student.waitlist.add.message': 'Are you sure you want to register to the next {{belt}} evaluation in {{skill_domain}}?',
            'student.waitlist.add.cancel': 'Cancel',
            'student.waitlist.add.confirm': 'Register',
            'student.waitlist.add.in_process': 'Registering',
            'student.waitlist.remove.button': '<img src="/evaluation.png" height="30" />',
            'student.waitlist.remove.button.tooltip': 'Unregister from the next {{belt.name}} evaluation in {{skill_domain.name}}',
            'student.waitlist.remove.title': 'Unregistration from the next {{belt.name}} evaluation in {{skill_domain.name}}',
            'student.waitlist.remove.message': 'Are you sure you want to unregister from the next {{belt}} evaluation in {{skill_domain}}?',
            'student.waitlist.remove.cancel': 'Cancel',
            'student.waitlist.remove.confirm': 'Unregister',
            'student.waitlist.remove.in_process': 'Unregistering',
            'student.add.button': 'Add',
            'student.add.button.tooltip': 'Add a new student to the class',
            'student.add.title': 'Add Student in {{class_level.name.prefix}}{{school_class.suffix}}',
            'student.add.cancel': 'Cancel',
            'student.add.confirm': 'Add',
            'student.add.in_process': 'Adding',
            'student.edit.button': '✏️',
            'student.edit.button.tooltip': 'Edit',
            'student.edit.title': 'Edit Student: {student.display_name}}',
            'student.edit.cancel': 'Cancel',
            'student.edit.confirm': 'Save',
            'student.edit.in_process': 'Saving',
            'student.add_edit.rank.title': 'Rank',
            'student.add_edit.rank.placeholder': 'Example: 7',
            'student.add_edit.rank.help': 'Rank of the student',
            'student.add_edit.display_name.title': 'Full name',
            'student.add_edit.display_name.placeholder': 'Example: John Doe',
            'student.add_edit.display_name.help': 'How the name of the student should be displayed',
            'student.add_edit.username.title': 'User name',
            'student.add_edit.username.placeholder': 'Example: jdoe',
            'student.add_edit.username.help': 'What the student will use to log in',
            'student.add_edit.password.title': 'Password',
            'student.add_edit.password.help': 'Password of the student',
            'student.delete.button': '🗑️',
            'student.delete.button.tooltip': 'Delete',
            'student.delete.title': 'Delete Student: {student.display_name}}',
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
            'student.list.display_name.title': 'Name',
            'student.list.last_login.title': 'Last login',
            'student.list.actions.title': 'Actions',
            'user.add.button': 'Add',
            'user.add.button.tooltip': 'Add a new user',
            'user.add.title': 'Add User',
            'user.add.cancel': 'Cancel',
            'user.add.confirm': 'Add',
            'user.add.in_process': 'Adding',
            'user.edit.button': '✏️',
            'user.edit.button.tooltip': 'Edit',
            'user.edit.title': 'Edit User: {{user.username}}',
            'user.edit.cancel': 'Cancel',
            'user.edit.confirm': 'Save',
            'user.edit.in_process': 'Saving',
            'user.add_edit.username.title': 'Name',
            'user.add_edit.username.placeholder': 'Example: jdoe',
            'user.add_edit.username.help': 'Name of the user',
            'user.add_edit.password.title': 'Password',
            'user.add_edit.password.help': 'Password of the user',
            'user.add_edit.is_admin.title': 'Administrator',
            'user.add_edit.is_admin.help': 'Should the user have administrator privileges?',
            'user.delete.button': '🗑️',
            'user.delete.button.tooltip': 'Delete',
            'user.delete.title': 'Delete User: {{user.username}}',
            'user.delete.message': 'Are you sure you want to delete the user?',
            'user.delete.cancel': 'Cancel',
            'user.delete.confirm': 'Delete',
            'user.delete.in_process': 'Deleting',
            'user.list.title.primary': 'Users',
            'user.list.title.secondary': 'List of the users',
            'user.list.username.title': 'Name',
            'user.list.is_admin.title': 'Is Admin?',
            'user.list.actions.title': 'Actions',
        }
    },
    fr: {
        translation: {
            'error': 'Erreur',
            'loading': 'Chargement',
            'not_connected': 'Non connecté',
            'expired_token': 'Votre session a expiré ; merci de vous reconnecter',
            'not_found': 'Désolé, il semblerait que cette page n\'existe pas',
            'main_title': 'MyBelts',
            'home_page': 'Accueil',
            'missing_i18n_keys': 'Depuis votre dernière connexion, {{unique}} clés i18n manquantes ont été détectées, pour un total de {{total}} occurrences. Merci de contacter les développeurs.',
            'login.title': 'Se connecter',
            'login.button': 'Se connecter',
            'login.username.title': 'Nom d\'utilisateur',
            'login.username.placeholder': 'Exemple: nflantier',
            'login.username.help': 'Votre nom d\'utilisateur',
            'login.password.title': 'Mot de passe',
            'login.password.help': 'Votre mot de passe',
            'login.cancel': 'Annuler',
            'login.confirm': 'Se connecter',
            'login.in_process': 'Connexion',
            'logout.button': 'Se déconnecter',
            'evaluation.add.button': 'Ajouter',
            'evaluation.add.button.tooltip': 'Ajouter une nouvelle tentative de {{student.display_name}}',
            'evaluation.add.title': 'Ajouter une tentative de {{student.display_name}}',
            'evaluation.add.cancel': 'Annuler',
            'evaluation.add.confirm': 'Ajouter',
            'evaluation.add.in_process': 'Ajout',
            'evaluation.edit.button': '✏️',
            'evaluation.edit.button.tooltip': 'Modifier',
            'evaluation.edit.title': 'Modifier une tentative de {{student.display_name}}',
            'evaluation.edit.cancel': 'Annuler',
            'evaluation.edit.confirm': 'Enregistrer',
            'evaluation.edit.in_process': 'Enregistrement',
            'evaluation.add_edit.skill_domain.title': 'Domaine de compétence',
            'evaluation.add_edit.skill_domain.help': 'Quel domaine de compétence a été testé ?',
            'evaluation.add_edit.belt.title': 'Ceinture',
            'evaluation.add_edit.belt.help': 'Quelle ceinture l\'élève a-t-il essayé de passer ?',
            'evaluation.add_edit.date.title': 'Date',
            'evaluation.add_edit.date.help': 'Quand l\'élève a-t-il essayé de passer la ceinture ?',
            'evaluation.add_edit.passed.title': 'Réussi',
            'evaluation.add_edit.passed.help': 'L\'élève a-t-il réussi sa tentative ?',
            'evaluation.delete.button': '🗑️',
            'evaluation.delete.button.tooltip': 'Supprimer une tentative de {{student.display_name}}',
            'evaluation.delete.title': 'Supprimer une tentative de {{student.display_name}}',
            'evaluation.delete.message': 'Êtes-vous de sûr de vouloir supprimer la tentative de passage de {{belt.name}} en {{skill_domain.name}} ?',
            'evaluation.delete.cancel': 'Annuler',
            'evaluation.delete.confirm': 'Supprimer',
            'evaluation.delete.in_progress': 'Suppression',
            'evaluation.list.title.secondary': 'Liste des tentatives',
            'evaluation.list.skill_domain.title': 'Domaine de compétence',
            'evaluation.list.belt.title': 'Ceinture',
            'evaluation.list.date.title': 'Date',
            'evaluation.list.passed.title': 'Réussi ?',
            'evaluation.list.actions.title': 'Actions',
            'waitlist.title': '$t(waitlist.title.students, {"count": {{student_count}}}) $t(waitlist.title.evaluations, {"count": {{evaluation_count}}})',
            'waitlist.title.students': '{{count}} élève veut passer',
            'waitlist.title.students_other': '{{count}} élèves veulent passer un total de',
            'waitlist.title.evaluations': '{{count}} évaluation',
            'waitlist.title.evaluations_other': '{{count}} évaluations',
            'waitlist.convert.button': '✔',
            'waitlist.convert.button.tooltip': 'Renseigner les évaluations correspondantes effectuées',
            'waitlist.convert.title': 'Renseigner les évaluations',
            'waitlist.convert.cancel': 'Annuler',
            'waitlist.convert.confirm': 'Enregistrer',
            'waitlist.convert.in_process': 'Enregistrement',
            'waitlist.convert.common_date.title': 'Date commune',
            'waitlist.convert.common_date.help': 'Utilisez ce champ pour définir la date de toutes les évaluations',
            'waitlist.convert.columns.student': 'Élève',
            'waitlist.convert.columns.skill_domain': 'Domaine',
            'waitlist.convert.columns.belt': 'Ceinture',
            'waitlist.convert.columns.completed': 'Passé',
            'waitlist.convert.columns.date': 'Date',
            'waitlist.convert.columns.success': 'Réussi',
            'belt.add.button': 'Ajouter',
            'belt.add.button.tooltip': 'Ajouter une nouvelle ceinture',
            'belt.add.title': 'Ajouter une ceinture',
            'belt.add.cancel': 'Annuler',
            'belt.add.confirm': 'Ajouter',
            'belt.add.in_process': 'Ajout',
            'belt.edit.button': '✏️',
            'belt.edit.button.tooltip': 'Modifier',
            'belt.edit.title': 'Modifier la ceinture: {{belt.name}}',
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
            'belt.delete.button': '🗑️',
            'belt.delete.button.tooltip': 'Supprimer',
            'belt.delete.title': 'Supprimer la ceinture: {{belt.name}}',
            'belt.delete.message': 'Êtes-vous sûr de vouloir supprimer {{belt.name}} ?',
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
            'class_level.add.button.tooltip': 'Ajouter un nouveau niveau',
            'class_level.add.title': 'Ajouter un niveau',
            'class_level.add.cancel': 'Annuler',
            'class_level.add.confirm': 'Ajouter',
            'class_level.add.in_process': 'Ajout',
            'class_level.edit.button': '✏️',
            'class_level.edit.button.tooltip': 'Modifier',
            'class_level.edit.title': 'Modifier un niveau: {{class_level.prefix}}',
            'class_level.edit.cancel': 'Annuler',
            'class_level.edit.confirm': 'Enregistrer',
            'class_level.edit.in_process': 'Enregistrement',
            'class_level.add_edit.prefix.title': 'Préfixe',
            'class_level.add_edit.prefix.placeholder': 'Exemple: 4e',
            'class_level.add_edit.prefix.help': 'Préfixe pour le niveau',
            'class_level.delete.button': '🗑️',
            'class_level.delete.button.tooltip': 'Supprimer',
            'class_level.delete.title': 'Supprimer le niveau: {{class_level.prefix}}',
            'class_level.delete.message': 'Êtes-vous sûr de vouloir supprimer le niveau {{class_level.prefix}} ?',
            'class_level.delete.cancel': 'Annuler',
            'class_level.delete.confirm': 'Supprimer',
            'class_level.delete.in_process': 'Suppression',
            'class_level.list.title.primary': 'Niveaux',
            'class_level.list.title.secondary': 'Liste des niveaux disponibles',
            'class_level.list.prefix.title': 'Préfixe',
            'class_level.list.actions.title': 'Actions',
            'school_class.view.title': 'Classe',
            'school_class.add.button': 'Ajouter',
            'school_class.add.button.tooltip': 'Ajouter une nouvelle classe à ce niveau',
            'school_class.add.title': 'Ajouter une classe de {{class_level.prefix}}',
            'school_class.add.cancel': 'Annuler',
            'school_class.add.confirm': 'Ajouter',
            'school_class.add.in_process': 'Ajout',
            'school_class.edit.button': '✏️',
            'school_class.edit.button.tooltip': 'Modifier',
            'school_class.edit.title': 'Modifier une classe: {{class_level.prefix}}{{school_class.suffix}}',
            'school_class.edit.cancel': 'Annuler',
            'school_class.edit.confirm': 'Enregistrer',
            'school_class.edit.in_process': 'Enregistrement',
            'school_class.add_edit.suffix.title': 'Suffixe',
            'school_class.add_edit.suffix.placeholder': 'Exemple: D',
            'school_class.add_edit.suffix.help': 'Suffixe pour la classe',
            'school_class.delete.button': '🗑️',
            'school_class.delete.button.tooltip': 'Supprimer',
            'school_class.delete.title': 'Supprimer la classe: {{class_level.prefix}}{{school_class.suffix}}',
            'school_class.delete.message': 'Êtes-vous sûr de vouloir supprimer la classe {{class_level.prefix}}{{school_class.suffix}}?',
            'school_class.delete.cancel': 'Annuler',
            'school_class.delete.confirm': 'Supprimer',
            'school_class.delete.in_process': 'Suppression',
            'school_class.list.title.secondary': 'Liste des classes',
            'school_class.list.suffix.title': 'Suffixe',
            'school_class.list.actions.title': 'Actions',
            'skill_domain.add.button': 'Ajouter',
            'skill_domain.add.button.tooltip': 'Ajouter un nouveau domaine de compétences',
            'skill_domain.add.title': 'Ajouter un domaine de compétences',
            'skill_domain.add.cancel': 'Annuler',
            'skill_domain.add.confirm': 'Ajouter',
            'skill_domain.add.in_process': 'Ajout',
            'skill_domain.edit.button': '✏️',
            'skill_domain.edit.button.tooltip': 'Modifier',
            'skill_domain.edit.title': 'Modifier un domaine de compétences: {{skill_domain.name}}',
            'skill_domain.edit.cancel': 'Annuler',
            'skill_domain.edit.confirm': 'Enregistrer',
            'skill_domain.edit.in_process': 'Enregistrement',
            'skill_domain.add_edit.name.title': 'Nom',
            'skill_domain.add_edit.name.placeholder': 'Exemple: Algèbre',
            'skill_domain.add_edit.name.help': 'Nom du domaine de compétence',
            'skill_domain.delete.button': '🗑️',
            'skill_domain.delete.button.tooltip': 'Supprimer',
            'skill_domain.delete.title': 'Supprimer un domaine de compétence: {{skill_domain.name}}',
            'skill_domain.delete.message': 'Êtes-vous sûr de vouloir supprimer le domaine de compétence {{skill_domain.title}} ?',
            'skill_domain.delete.cancel': 'Annuler',
            'skill_domain.delete.confirm': 'Supprimer',
            'skill_domain.delete.in_process': 'Suppression',
            'skill_domain.list.title.primary': 'Domaines de compétence',
            'skill_domain.list.title.secondary': 'Liste des domaines de compétences disponibles',
            'skill_domain.list.name.title': 'Nom',
            'skill_domain.list.actions.title': 'Actions',
            'student.view.title': 'Élève',
            'student.view.school_class': 'Classe',
            'student.belts.title': 'Ceintures actuelles',
            'student.belts.skill_domain.title': 'Domaine de compétence',
            'student.belts.achieved_belt.title': 'Ceinture obtenue',
            'student.belts.actions.title': 'Actions',
            'student.belts.no_belt': 'Pas encore de ceinture obtenue',
            'student.waitlist.add.button': '<img src="/evaluation.png" height="30" />',
            'student.waitlist.add.button.tooltip': 'S\'inscire à la prochaine évaluation de {{belt.name}} en {{skill_domain.name}}',
            'student.waitlist.add.title': 'Inscription à la prochaine évaluation',
            'student.waitlist.add.message': 'Êtes-vous sûr de vouloir vous inscrire à la prochaine évaluation pour la {{belt}} en {{skill_domain}} ?',
            'student.waitlist.add.cancel': 'Annuler',
            'student.waitlist.add.confirm': 'S\'inscire',
            'student.waitlist.add.in_process': 'Inscription',
            'student.waitlist.remove.button': '<img src="/evaluation.png" height="30" />',
            'student.waitlist.remove.button.tooltip': 'Se désinscrire de la prochaine évaluation de {{belt.name}} en {{skill_domain.name}}',
            'student.waitlist.remove.title': 'Désinscription de la prochaine évaluation',
            'student.waitlist.remove.message': 'Êtes-vous sûr de vouloir vous désinscrire de la prochaine évaluation pour la {{belt}} en {{skill_domain}} ?',
            'student.waitlist.remove.cancel': 'Annuler',
            'student.waitlist.remove.confirm': 'Se désinscrire',
            'student.waitlist.remove.in_process': 'Désinscription',
            'student.add.button': 'Ajouter',
            'student.add.button.tooltip': 'Ajouter un nouvel élève à la classe',
            'student.add.title': 'Ajouter un élève en {{class_level.prefix}}{{school_class.suffix}}',
            'student.add.cancel': 'Annuler',
            'student.add.confirm': 'Ajouter',
            'student.add.in_process': 'Ajout',
            'student.edit.button': '✏️',
            'student.edit.button.tooltip': 'Modifier',
            'student.edit.title': 'Modifier un élève: {{student.display_name}}',
            'student.edit.cancel': 'Annuler',
            'student.edit.confirm': 'Enregistrer',
            'student.edit.in_process': 'Enregistrement',
            'student.add_edit.rank.title': 'Rang',
            'student.add_edit.rank.placeholder': 'Exemple: 7',
            'student.add_edit.rank.help': 'Rang de l\'élève',
            'student.add_edit.display_name.title': 'Nom complet',
            'student.add_edit.display_name.placeholder': 'Exemple: Noël Flantier',
            'student.add_edit.display_name.help': 'Comment le nom de l\'élève devrait être affiché',
            'student.add_edit.username.title': 'Nom d\'utilisateur',
            'student.add_edit.username.placeholder': 'Exemple: nflantier',
            'student.add_edit.username.help': 'Ce que l\'élève utilisera pour se connecter',
            'student.add_edit.password.title': 'Mot de passe',
            'student.add_edit.password.help': 'Mot de passe de l\'élève',
            'student.delete.button': '🗑️',
            'student.delete.button.tooltip': 'Supprimer',
            'student.delete.title': 'Supprimer l\'élève: {{student.display_name}}',
            'student.delete.message': 'Êtes-vous sûr de vouloir supprimer l\'élève {{student.display_name}} ?',
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
            'student.list.display_name.title': 'Nom',
            'student.list.last_login.title': 'Dernière connexion',
            'student.list.actions.title': 'Actions',
            'user.add.button': 'Ajouter',
            'user.add.button.tooltip': 'Ajouter un nouvel utilisateur',
            'user.add.title': 'Ajouter un utilisateur',
            'user.add.cancel': 'Annuler',
            'user.add.confirm': 'Ajouter',
            'user.add.in_process': 'Ajout',
            'user.edit.button': '✏️',
            'user.edit.button.tooltip': 'Modifier',
            'user.edit.title': 'Modifier un utilisateur: {{user.username}',
            'user.edit.cancel': 'Annuler',
            'user.edit.confirm': 'Enregistrer',
            'user.edit.in_process': 'Enregistrement',
            'user.add_edit.username.title': 'Nom',
            'user.add_edit.username.placeholder': 'Exemple: nflantier',
            'user.add_edit.username.help': 'Nom de l\'utilisateur',
            'user.add_edit.password.title': 'Mot de passe',
            'user.add_edit.password.help': 'Mot de passe de l\'utilisateur',
            'user.add_edit.is_admin.title': 'Administrateur',
            'user.add_edit.is_admin.help': 'L\'utilisateur devrait-il avoir les droits d\'administration ?',
            'user.delete.button': '🗑️',
            'user.delete.button.tooltip': 'Supprimer',
            'user.delete.title': 'Supprimer un utilisateur: {{user.username}',
            'user.delete.message': 'Êtes-vous sûr de vouloir supprimer l\'utilisateur {{user.username}} ?',
            'user.delete.cancel': 'Annuler',
            'user.delete.confirm': 'Supprimer',
            'user.delete.in_process': 'Suppression',
            'user.list.title.primary': 'Utilisateurs',
            'user.list.title.secondary': 'Liste des utilisateurs enregistrés',
            'user.list.username.title': 'Nom',
            'user.list.is_admin.title': 'Administrateur?',
            'user.list.actions.title': 'Actions',
        }
    }
};

function missingKeyHandler(
    _languages: readonly string[],
    namespace: string,
    key: string,
) {
    DefaultService.postMissingI18NKeyResource({language: i18n.language, namespace, key});
}

i18n
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
        fallbackLng: 'en',
        resources,
        interpolation: {
            escapeValue: false,
        },
        saveMissing: true,
        missingKeyHandler,
    });

export default i18n;
