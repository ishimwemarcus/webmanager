import React from 'react';

/**
 * Consistent page title + actions bar for all screen sizes.
 */
export default function PageHeader({ title, subtitle, badge, actions, className = '' }) {
  return (
    <header className={`page-header flex items-center ${className}`}>
      <div className="page-header__info">
        <div className="page-header__title-row">
          <h1 className="text-display">{title}</h1>
          {badge}
        </div>
        {subtitle && <p className="text-caption">{subtitle}</p>}
      </div>
      {actions && (
        <div className="toolbar">
          {actions}
        </div>
      )}
    </header>
  );
}
