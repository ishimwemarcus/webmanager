const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/views/Dashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Change MasterDashboard signature
content = content.replace(
  'function MasterDashboard() {',
  'function MasterDashboard({ currentUser, isOperator }) {'
);

// 2. Modify the Header Title
content = content.replace(
  `          <h1 className="text-[clamp(2rem,6vw,3rem)] font-black uppercase tracking-tighter text-navy-brand italic leading-none">
            {t('dashboard')}
          </h1>`,
  `          <h1 className="text-[clamp(2rem,6vw,3rem)] font-black uppercase tracking-tighter text-navy-brand italic leading-none">
            {isOperator ? \`BIENVENUE, \${currentUser?.name?.split(' ')[0] || 'OPÉRATEUR'}\` : t('dashboard')}
          </h1>`
);

// 3. Inject Clearance Box after the header div
const headerEnd = `        </div>
      </div>`;
const clearanceBox = `        </div>
      </div>

      {isOperator && (
        <div className="glass-card mb-12 p-8 md:p-10 rounded-[48px] bg-white border border-navy-50 flex flex-col lg:flex-row items-center justify-between gap-8 fade-in shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.02] -mr-10 -mt-10 text-navy-brand">
            <ShieldAlert className="w-full h-full" />
          </div>
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 w-full lg:w-auto">
            <div className={\`w-24 h-24 rounded-[32px] flex flex-shrink-0 items-center justify-center transition-all duration-700 \${store.clearanceGrants[currentUser.id]
              ? 'bg-success-pro/10 text-success-pro border border-success-pro/20 shadow-sm'
              : 'bg-navy-50 text-blue-gray border border-navy-100'
              }\`}>
              {store.clearanceGrants[currentUser.id] ? <ShieldCheck className="w-12 h-12 animate-pulse" /> : <ShieldAlert className="w-12 h-12" />}
            </div>
            <div className="text-center md:text-left">
              <h4 className="text-2xl font-black text-navy-brand uppercase tracking-tight mb-2">
                {store.clearanceGrants[currentUser.id] ? 'SUPPORT : ACTIVÉ' : 'SUPPORT : DÉSACTIVÉ'}
              </h4>
              <p className="text-sm md:text-base text-blue-gray font-bold uppercase tracking-widest leading-relaxed max-w-lg">
                {store.clearanceGrants[currentUser.id]
                  ? 'Temporary administrative access has been granted for record reconciliation.'
                  : 'Grant temporary access for system corrections or account assistance.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (store.clearanceGrants[currentUser.id]) {
                store.showConfirm("REVOKE ACCESS? The administrator will no longer be able to assist with record corrections.", () => {
                  store.revokeClearance(currentUser.id);
                });
              } else {
                store.showConfirm("GRANT ACCESS? This will allow the administrator to modify your records for maintenance purposes.", () => {
                  store.grantClearance(currentUser.id);
                });
              }
            }}
            className={\`btn-premium !py-6 !px-10 !text-sm w-full lg:w-auto relative z-10 \${store.clearanceGrants[currentUser.id] ? 'bg-navy-900' : ''}\`}
          >
            <Zap className={\`w-5 h-5 mr-3 \${store.clearanceGrants[currentUser.id] ? 'text-success-pro' : 'text-white'}\`} />
            {store.clearanceGrants[currentUser.id] ? t('revokeAccess') : 'ACCORDER L\\'ACCÈS ADMIN'}
          </button>
        </div>
      )}`;

content = content.replace(headerEnd, clearanceBox);

// 4. Hide Intelligence card for Operator, show Data Export
const intelligenceCardRegex = /<div className="w-full lg:col-span-1">[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>/;
const intelligenceMatch = content.match(intelligenceCardRegex);
if (intelligenceMatch) {
  const newCardStr = `
          {isOperator ? (
            <div className="w-full lg:col-span-1">
              <div className="glass-card p-8 md:p-12 rounded-[48px] border border-navy-50 bg-white shadow-2xl relative overflow-hidden group hover:border-navy-brand/20 transition-all duration-700 h-full flex flex-col justify-between">
                <Database className="absolute -bottom-10 -right-10 w-64 h-64 opacity-[0.03] text-navy-brand" />
                <div className="space-y-4 text-center relative z-10">
                  <h3 className="text-3xl font-black text-navy-brand uppercase tracking-tight flex items-center justify-center gap-4">
                    <Database className="w-10 h-10 text-navy-brand" /> DATA EXPORT
                  </h3>
                  <p className="text-sm md:text-base text-blue-gray font-bold uppercase tracking-widest leading-relaxed">
                    Generate a secure backup of your personal operational data. This ensure your records remain portable and protected.
                  </p>
                </div>
                <button
                  onClick={() => {
                    store.showConfirm("TÉLÉCHARGER LES DONNÉES? Cela générera une sauvegarde de vos enregistrements personnels.", () => {
                      store.exportPersonalData();
                    });
                  }}
                  className="btn-premium w-full !py-6 !text-sm mt-8 relative z-10"
                >
                  <Database className="w-5 h-5 mr-3" /> EXPORTER LES DONNÉES
                </button>
              </div>
            </div>
          ) : (
            ${intelligenceMatch[0].replace(/^/gm, '            ').trim()}
          )}
  `;
  content = content.replace(intelligenceMatch[0], newCardStr);
}

// 5. Change Dashboard return
const dashboardReturn = `  return isMasterOrAdmin ? <MasterDashboard /> : <OperatorDashboard currentUser={currentUser} />;`;
content = content.replace(dashboardReturn, `  return <MasterDashboard currentUser={currentUser} isOperator={!isMasterOrAdmin} />;`);

// 6. Delete OperatorDashboard completely
const operatorStartIdx = content.indexOf('function OperatorDashboard({ currentUser }) {');
if (operatorStartIdx !== -1) {
  content = content.substring(0, operatorStartIdx);
}

fs.writeFileSync(filePath, content);
console.log('Dashboard refactored successfully!');
