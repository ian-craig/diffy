import React from 'react';
import './App.css';
import { FileEditor } from './FileEditor';
import { FileList } from './FileList';
import SplitPane from 'react-split-pane';
import { IFileCompare } from '../../DataStructures/IFileCompare';
import { IProvider } from '../../DataStructures/IProvider';
import { IChangeList } from '../../DataStructures/IChangeList';

export interface IAppProps {
  provider: IProvider;
}

interface IState {
  codeWidth: number;
  codeHeight: number;
  selectedFile: IFileCompare | undefined;
  changeLists: IChangeList[];
}

class App extends React.Component<IAppProps, IState> {
  private listWidth = 240;

  public constructor(props: IAppProps) {
    super(props);

    this.state = {
      codeWidth: 0,
      codeHeight: 0,
      selectedFile: undefined,
      changeLists: [],
    };
  }

  private readonly onFileChange = (file: IFileCompare) => {
    this.setState({
      selectedFile: file,
    });
  }

  private readonly onResize = (size?: number) => {
    if (size !== undefined) {
      this.listWidth = size;
    }
    this.setState({
      codeWidth: window.innerWidth - this.listWidth - 3,
      codeHeight: window.innerHeight,
    });
  }

  componentDidMount() {
    this.onResize();
    window.addEventListener('resize', () => this.onResize());

    this.props.provider.getChanges().then(changeLists => {
      this.setState({ changeLists });
    });
  }

  public render() {
    return (
      <div className="App">
        <SplitPane split="vertical" minSize={50} defaultSize={this.listWidth} onChange={this.onResize}>
          <FileList changeLists={this.state.changeLists} onFileChange={this.onFileChange} />
          <FileEditor file={this.state.selectedFile} width={this.state.codeWidth} height={this.state.codeHeight} />
        </SplitPane>
      </div>
    );
  }
}

export default App;
