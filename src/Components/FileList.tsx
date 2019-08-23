import React from 'react';
import { IChangeList } from '../DataStructures/IChangeList';

export interface IFileListProps {
    changeLists: IChangeList[];
}

export const FileList: React.FC<IFileListProps> = (props: IFileListProps) => {
  return (
    <div className="FileList">
      {props.changeLists.length} change lists
    </div>
  );
}
