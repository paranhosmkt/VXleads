import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
      <Globe size={18} />
      <select 
        value={i18n.language.split('-')[0]} 
        onChange={changeLanguage}
        className="bg-transparent border-none focus:ring-0 text-sm font-medium cursor-pointer outline-none"
      >
        <option value="pt">PT-BR</option>
        <option value="en">EN</option>
        <option value="es">ES</option>
      </select>
    </div>
  );
}
