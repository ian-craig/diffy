import React from 'react';
import MonacoEditor from 'react-monaco-editor';

export interface IFileEditorProps {
  width: number | string;
  code: string;
}

export const FileEditor: React.FC<IFileEditorProps> = (props: IFileEditorProps) => {
  return (
    <MonacoEditor
            language="javascript"
            theme="vs-light"
            value={props.code}
            width={props.width}
            options={{
              readOnly: true
            }}
          />
  );
}
