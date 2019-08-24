import React from 'react';
import './App.css';
import { FileEditor } from './Components/FileEditor';
import { FileList } from './Components/FileList';
import SplitPane from 'react-split-pane';
import { IChangeList } from './DataStructures/IChangeList';

export interface IAppProps {
  changeLists: IChangeList[];
}

interface IState {
  codeWidth: number;
  codeHeight: number;
}

class App extends React.Component<IAppProps, IState> {
  private listWidth = 200;

  public constructor(props: IAppProps) {
    super(props);

    this.state = {
      codeWidth: 0,
      codeHeight: 0,
    };
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
  }

  public render() {
    const selectedFileChange = this.props.changeLists[0].files[0];
    return (
      <div className="App">
        <SplitPane split="vertical" minSize={50} defaultSize={this.listWidth} onChange={this.onResize}>
          <FileList changeLists={this.props.changeLists} />
          <FileEditor codeLeft={selectedFileChange.left.content} codeRight={selectedFileChange.right.content} width={this.state.codeWidth} height={this.state.codeHeight} />
        </SplitPane>
      </div>
    );
  }
}

export default App;
