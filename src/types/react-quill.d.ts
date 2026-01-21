declare module 'react-quill-new' {
    import React from 'react';
    export interface ReactQuillProps {
        theme?: string;
        modules?: any;
        formats?: string[];
        value?: string;
        onChange?: (content: string, delta: any, source: string, editor: any) => void;
        placeholder?: string;
        className?: string;
        readOnly?: boolean;
    }
    export default class ReactQuill extends React.Component<ReactQuillProps> { }
}
