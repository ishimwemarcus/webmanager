import React, { createContext, useContext } from 'react';

const translations = {
  fr: {
    // Navigation & Branding
    dashboard: 'Vue d\'Ensemble',
    stock: 'Gestion des Stocks',
    sales: 'Opérations de Vente',
    waitSystem: 'Gestion des Crédits',
    ledger: 'Grand Livre',
    admin: 'Contrôle Système',
    logOut: 'Déconnexion',
    liveSync: 'Synchronisation',
    searchPlaceholder: 'Rechercher un actif...',
    inventoryHeader: 'Gestion des Stocks',
    commandInterface: 'Console de Gestion',
    systemArchitecture: 'Cadre Opérationnel',
    operationalDiagnostics: 'Dossiers Système',
    confirmAction: 'Confirmer l\'Action',
    runSnapshot: 'Exécuter un Analyse Complète',
    archiveHistory: 'Historique des Archives Data',
    payloadGenerated: 'Données Internes Générées',
    supportGateStatus: 'Statut de Sécurité',
    grantSupport: 'Accorder l\'Accès',
    revokeSupport: 'Révoquer l\'Accès',
    partialPaymentDirect: 'Aller au Grand Livre',
    receivableDirect: 'Aller au Manifeste des Ventes',
    broadcastWhatsApp: 'Diffuser via WhatsApp',
    downloadPayload: 'Télécharger les Données',
    addRecord: 'Enregistrer une Entrée',
    back: 'Retour',
    commanderInterface: 'Interface de Commande',
    
    // Auth
    loginGateway: 'Connexion Sécurisée',
    commandGateway: 'Accès Administratif',
    identityRequest: 'Demande de Nouvel Utilisateur',
    registerNode: 'Créer un Compte',
    initializeSession: 'Se Connecter',
    initializeInterface: 'Entrer dans le Tableau de Bord',
    fullIdentity: 'Nom Autorisé',
    fullName: 'Nom Complet',
    systemId: 'Identifiant Personnel',
    password: 'Mot de Passe',
    accessRequest: 'Accès Demandé',
    awaitingClearance: 'En Attente d\'Approbation Administrative',
    authorizeAccess: 'Approuver l\'Accès',
    requestIdentity: 'Créer un Nouveau Compte',
    resumeSession: 'Retour à la Connexion',
    accessDenied: 'Accès Refusé : Identifiants Invalides',
    pendingClearance: 'En Attente : Approbation Admin Requise',
    accountSequestered: 'Accès Révoqué : Contacter l\'Admin',
    protocolError: 'Erreur : Tous les champs sont requis',
    handleUnavailable: 'Identifiant Indisponible : Déjà utilisé',
    requestSubmitted: 'Succès : Demande envoyée pour approbation',
    
    // Dashboard
    assetManifest: 'Total des Actifs',
    liquidityDelta: 'Flux de Revenus',
    retentionCredit: 'Crédit Client',
    liabilityIndex: 'Dette Impayée',
    allProtocolsNominal: 'Statut Système : Actif',
    systemWarning: 'Avertissement : Stock Faible',
    systemAlert: 'Alerte : Action Immédiate',
    totalValuation: 'Valeur du Portefeuille',
    reserveLow: 'Stock Faible',
    reserveOptimal: 'Stock Optimal',
    
    // Sales / Transactions
    transactionPortal: 'Portail des Transactions',
    exchangeDate: 'Date de Transaction',
    assetDetail: 'Nom du Produit',
    entityInfo: 'Nom du Client',
    transactionVal: 'Montant Total',
    settledAmount: 'Montant Payé',
    varianceTip: 'Ajuster le Solde',
    recordExchange: 'Ajouter une Vente',
    unitsSold: 'Quantité',
    totalRevenue: 'Chiffre d\'Affaires',
    
    // Stock / Inventory
    assetIdentity: 'Nom du Produit',
    sector: 'Catégorie',
    reserve: 'Quantité',
    unitRate: 'Prix Unitaire',
    valuation: 'Valeur Totale',
    optimal: 'En Stock',
    low: 'Presque Épuisé',
    depleted: 'Rupture de Stock',
    
    // Reports / Intelligence
    projectTracker: 'Suivi Financier',
    plannedValue: 'Revenus Projetés',
    actualValue: 'Revenus Réalisés',
    targetStock: 'Stock Cible',
    actualStock: 'Unités Disponibles',
    grossMargin: 'Marge Nette',
    assetLiquidity: 'Liquidité',
    
    // Ledger / Settlement
    ledgerAudit: 'Audit du Grand Livre',
    manualEntry: 'Nouvelle Entrée',
    debit: 'Dépense',
    credit: 'Vente',
    outstandingObligation: 'Obligations Financières',
    financialNodes: 'Comptes Opérationnels',
    accountActivity: 'Historique des Transactions',

    // Wait / Retention
    retention: 'Crédit Client',
    protocol: 'Gestion',
    creditRetention: 'Soldes Clients',
    loyaltyProgram: 'Programme de Fidélité',

    // Admin / Recovery
    governance: 'Gestion du Personnel',
    masterSettlement: 'Comptes Globaux',
    provisionIdentity: 'Provisionnement des Utilisateurs',
    clearance: 'Rôle',
    identityIdentity: 'Nom du Personnel',
    authorize: 'Approuver',
    entityIdentity: 'Nom d\'Utilisateur',
    provision: 'Statut',
    supportAccess: 'Support Système',
    grantAccess: 'Accorder l\'Accès Admin',
    revokeAccess: 'Révoquer l\'Accès',
    clearanceEnabled: 'Support : ACTIVÉ',
    clearanceDisabled: 'Support : DÉSACTIVÉ',
    
    // Common
    date: 'Date',
    status: 'Statut',
    action: 'Action',
    search: 'Rechercher des archives...',
    cancel: 'Annuler',
    execute: 'Confirmer',
    abort: 'Abandonner',
    all: 'Tout le Temps',
    today: 'Aujourd\'hui',
    month: 'Ce Mois',
    custom: 'Période',
    active: 'Actif',
    pending: 'En Attente',
    restricted: 'Inactif',
    quantumSecured: 'Accès Sécurisé',
    masterClearance: 'Système Ver. 4.0',

    // New Luxury Features
    clientsDatabase: 'Base Clients VIP',
    spoilage: 'Déclarer une Perte (Avarie)',
    thermalReceipt: 'Ticket Caisse (80mm)',
    closeRegister: 'Clôture de Caisse',
    printReceipt: 'Imprimer Reçu',
    spoilageReason: 'Raison de la perte (Ex: Pourri)',
    expectedCash: 'Espèces Attendues',
    actualCash: 'Espèces Réelles (Tiroir)',
    cashDiscrepancy: 'Écart de Caisse',
    vipStatus: 'Client VIP',
    riskStatus: 'Risque Financier',
    commanderCenter: 'Centre de Commande',
    forecasting: 'Prévisions I.A',
    leaderboard: 'Palmarès de Performance',
    riskRoom: 'Zone de Risque Critique',
    projectedRevenue: 'Revenu Projeté (7j)',
    efficiencyIndex: 'Indice d\'Efficacité',
    topOperator: 'Meilleur Opérateur',
    performanceDelta: 'Variation de Performance',
    newSale: 'Nouvelle Vente',
    todayRevenue: 'Chiffre d\'Affaires du Jour',
    totalTransactions: 'Transactions Totales',
    records: 'Enregistrements',
    currentShift: 'Poste Actuel',
    allShifts: 'Tous les Postes',
    confirmSale: 'Confirmer la Vente',
    confirm: 'Confirmer',
    success: 'Succès',
    transactionRecorded: 'Transaction enregistrée avec succès',
    print: 'Imprimer',
    share: 'Partager',
    intelligence: 'Intelligence d\'Affaires',
    auditor: 'Auditeur Multi-Secteurs',
    sectors: 'Secteurs',
    salesSec: 'Ventes',
    ledgerSec: 'Grand Livre',
    stockSec: 'Stock',
    lossesSec: 'Pertes',
    pdf: 'PDF',
    revenue: 'Revenus des Ventes',
    debtsIssued: 'Dettes Émises',
    netMargin: 'MARGE NETTE'
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const lang = 'fr';
  const t = (key) => translations.fr[key] || key;
  return (
    <LanguageContext.Provider value={{ lang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
