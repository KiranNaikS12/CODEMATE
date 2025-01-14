import React, { useImperativeHandle, forwardRef } from 'react';
import * as monaco from 'monaco-editor';
import Editor, { OnMount } from '@monaco-editor/react';
import LanguageMenu from './LanguageMenu';
import { CODE_SNIPPETS } from '../../types/languageConstants';
import { Language } from '../../types/languageConstants';
import { CodeSubmitResponse, ProblemExample } from '../../types/problemTypes';

interface CodingEnvironmentProps {
    value: string;
    setValue: React.Dispatch<React.SetStateAction<string>>;
    setEditorInstance?: (instance: monaco.editor.IStandaloneCodeEditor) => void;
    examples: ProblemExample[] | undefined;
    language: Language;
    onSelectLanguage: (language: Language) => void;
    responseData: CodeSubmitResponse | null;
}

const CodingEnvironment = forwardRef<monaco.editor.IStandaloneCodeEditor | null, CodingEnvironmentProps>(
    ({ value, setValue, setEditorInstance, language, onSelectLanguage }, ref) => {
        const editorRef = React.useRef<monaco.editor.IStandaloneCodeEditor | null>(null);



        const onMount: OnMount = (editor) => {
            setEditorInstance?.(editor)
            editor.focus();
        };

        // Expose editorRef.current via ref to the parent component
        useImperativeHandle(ref, () => editorRef.current!);

        const handleSelect = (newLanguage: Language) => {
            onSelectLanguage(newLanguage)
        }

        return (
            <> 
                <LanguageMenu language={language} onSelect={handleSelect} />
                <Editor
                    height="100%"
                    theme="vs-light"
                    language={language}
                    defaultValue={CODE_SNIPPETS[language]}
                    onMount={onMount}
                    value={value}
                    onChange={(value) => setValue(value!)}
                />
            </>
        );
    }
);

export default CodingEnvironment;
