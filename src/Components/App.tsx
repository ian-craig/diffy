import React from "react";
import SplitPane from "react-split-pane";

import { IDiffProvider } from "../DataStructures/IDiffProvider";
import { IChangeList } from "../DataStructures/IChangeList";
import { ChangeListPane } from "./ChangeListPane";
import { FilePane } from "./FilePane";
import { SettingsStore } from "../Utils/SettingsStore";
import { DiffModel } from "../Utils/DiffModel";

import "./App.css";

export interface IAppProps {
  provider: IDiffProvider;
}

interface IState {
  codeWidth: number;
  codeHeight: number;
  selected: DiffModel | undefined;
  changeLists: IChangeList[];
}

class App extends React.Component<IAppProps, IState> {
  private listWidth = 240;
  private settingsStore = new SettingsStore();

  public constructor(props: IAppProps) {
    super(props);

    this.state = {
      codeWidth: 0,
      codeHeight: 0,
      selected: undefined,
      changeLists: [],
    };
  }

  private readonly onFileChange = async (diffModel: DiffModel) => {
    this.setState({ selected: diffModel });
  };

  private readonly refreshChanges = () => {
    this.props.provider.getChanges().then(changeLists => {
      this.setState({ changeLists });
      //TODO Reselect current file
    });
  };

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

    this.refreshChanges();
  }

  public render() {
    return (
      <div className="App">
        <SplitPane split="vertical" minSize={50} defaultSize={this.listWidth} onChange={this.onResize}>
          <ChangeListPane
            title={this.props.provider.title || ""}
            changeLists={this.state.changeLists}
            onFileChange={this.onFileChange}
            refresh={this.refreshChanges}
          />
          <FilePane
            diffModel={this.state.selected}
            width={this.state.codeWidth}
            height={this.state.codeHeight}
            settingsStore={this.settingsStore}
          />
        </SplitPane>
      </div>
    );
  }
}

export default App;
