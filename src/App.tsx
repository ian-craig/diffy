import React from 'react';
import './App.css';
import { FileEditor } from './Components/FileEditor';
import { FileList } from './Components/FileList';
import SplitPane from 'react-split-pane';

interface IState {
  codeWidth: number | string;
}

class App extends React.Component<{}, IState> {
  private listWidth = 200;

  public constructor(props: {}) {
    super(props);

    this.state = {
      codeWidth: "100%",
    };
  }

  private readonly onResize = (size?: number) => {
    if (size !== undefined) {
      this.listWidth = size;
    }
    this.setState({
      codeWidth: window.innerWidth - this.listWidth - 3,
    });
  }

  componentDidMount() {
    window.addEventListener('resize', () => this.onResize());
  }

  public render() {
    return (
      <div className="App">
        <SplitPane split="vertical" minSize={50} defaultSize={this.listWidth} onChange={this.onResize}>
          <FileList changeLists={[]} />
          <FileEditor code={"Foo bar"} width={this.state.codeWidth} />
        </SplitPane>
      </div>
    );
  }
}

export default App;
