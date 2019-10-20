import React from "react";
import SplitPane from "react-split-pane";

import { ChangeListPane } from "./ChangeListPane";
import { FilePane } from "./FilePane";

import "./App.css";

export interface IAppProps {
  title: string;
}

interface IState {
  codeWidth: number;
  codeHeight: number;
}

class App extends React.Component<IAppProps, IState> {
  private listWidth = 240;

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
  };

  componentDidMount() {
    this.onResize();
    window.addEventListener("resize", () => this.onResize());
  }

  public render() {
    return (
      <div className="App">
        <SplitPane split="vertical" minSize={50} defaultSize={this.listWidth} onChange={this.onResize}>
          <ChangeListPane title={this.props.title} />
          <FilePane width={this.state.codeWidth} height={this.state.codeHeight} />
        </SplitPane>
      </div>
    );
  }
}

export default App;
