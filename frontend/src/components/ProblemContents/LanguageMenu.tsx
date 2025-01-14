import React, {useState} from 'react';
import { Language } from '../../types/languageConstants';
import { CODE_SNIPPETS } from '../../types/languageConstants';


const languages: Language[] = Object.keys(CODE_SNIPPETS) as Language[]; 

export interface LanguageMenuProps {
    language: string;
    onSelect: (language: Language) => void;
}

const LanguageMenu: React.FC<LanguageMenuProps> = ({language, onSelect}) => {
    const [showMenu, setShowMenu] = useState(false);

    const handleSelect = (selectedLanguage: Language) => {
        onSelect(selectedLanguage);
        setShowMenu(false)
    }

    const dropMenu = () => {
        setShowMenu(!showMenu)
    }

    return (
        <div className="flex w-full px-2 py-4 bg-white rounded-md border-md">
            <button
                className="text-sm font-medium text-highlightBlue hover:text-themeColor "
                onClick={() => dropMenu()}
            >
                <span className='mr-2 text-sm text-gray-400'>
                    Language:
                </span> 
                {language}
            </button>
            {/* Dropdown Menu */}
            {showMenu && (
                <div className="absolute z-50 bg-white border border-gray-300 rounded-md shadow-lg top-12 left-2">
                    <ul className="p-4 space-y-2">
                        {languages.map((language, index) => (
                        <li key={index}
                            onClick={() => handleSelect(language)}
                        >
                            <button
                                className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-blue-100 hover:rounded-md hover:text-highlightBlue"
                            >
                                {language}
                            </button>
                        </li>    
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}

export default LanguageMenu
