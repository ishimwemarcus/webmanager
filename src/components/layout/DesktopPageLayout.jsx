import React from 'react';
import PageHeader from './PageHeader';

/**
 * Professional single-column layout.
 * utilityPanel renders as a top stat strip (equal-width cards),
 * not as a separate narrow side column.
 */
export default function DesktopPageLayout({
  title,
  subtitle,
  badge,
  actions,
  children,
  utilityPanel,
  className = '',
}) {
  return (
    <div className={`desktop-page ${className}`}>
      {/* Fixed page header */}
      <PageHeader
        className="app-page-header"
        title={title}
        subtitle={subtitle}
        badge={badge}
        actions={actions}
      />

      {/* Full-width scrollable body */}
      <div className="desktop-page__workspace desktop-page__workspace--single">
        <div className="desktop-page__main scroll-panel">

          {/* Utility stats rendered as a horizontal strip at the top */}
          {utilityPanel && (
            <div className="utility-strip">
              {utilityPanel}
            </div>
          )}

          {/* Page content */}
          {children}
        </div>
      </div>
    </div>
  );
}
