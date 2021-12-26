import "./App.css";
import JournalEntry from "./components/JournalEntry";
import InfiniteScroll from "react-infinite-scroll-component";
import React from "react";
// import JournalEntryForm from "./components/JournalEntryForm";

class App extends React.Component {
  entryRef = React.createRef();
  constructor(props) {
    super(props);
    this.state = {
      entries: [],
      exclusiveStartKey: "",
      showEntries: true,
      values: [""],
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  createUI() {
    return this.state.values.map((el, i) => (
      <div key={i}>
        <input type="button" value="+" onClick={this.addClick.bind(this)} />
        <textarea
          value={el || ""}
          className="bullet-item"
          onChange={this.handleChange.bind(this, i)}
        />
        <input
          type="button"
          value="-"
          onClick={this.removeClick.bind(this, i)}
        />
      </div>
    ));
  }

  handleChange(i, event) {
    let values = [...this.state.values];
    values[i] = event.target.value;
    this.setState({ values });
  }

  addClick() {
    this.setState((prevState) => ({ values: [...prevState.values, ""] }));
  }

  removeClick(i) {
    let values = [...this.state.values];
    values.splice(i, 1);
    this.setState({ values });
  }

  handleSubmit(event) {
    event.preventDefault();
    const entry = {
      entry_content: JSON.stringify(this.state.values),
    };
    const url = process.env.REACT_APP_URL;
    const data = { entry: entry["entry_content"] };
    fetch(url, {
      method: "POST",
      headers: {
        "x-api-key": process.env.REACT_APP_API_KEY,
      },
      body: JSON.stringify(data),
    }).then((response) => {
      this.setState({
        entries: [],
        exclusiveStartKey: "",
        showEntries: true,
        values: [""],
      });
      this.getNewEntries();
    });
    event.currentTarget.reset();
  }

  deleteEntryCleanup = () => {
    this.setState({ entries: [], exclusiveStartKey: "" });
    this.getNewEntries();
  };

  getNewEntries = () => {
    var useExclusiveStartKey = true;
    const NO_ENTRIES_LEFT = "NO ENTRIES LEFT";
    var url = process.env.REACT_APP_URL + "?num_entries=10";
    if (
      useExclusiveStartKey &&
      this.state.exclusiveStartKey === NO_ENTRIES_LEFT
    ) {
      return;
    }
    if (useExclusiveStartKey && this.state.exclusiveStartKey) {
      url += `&exclusive_start_key=${this.state.exclusiveStartKey}`;
    }
    fetch(url, {
      method: "GET",
      headers: {
        "x-api-key": process.env.REACT_APP_API_KEY,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        var oldEntries = this.state.entries;
        var newState = { entries: [...oldEntries, ...data.Items] };
        if (data.LastEvaluatedKey) {
          newState["exclusiveStartKey"] = data.LastEvaluatedKey.SK1.S.slice(
            "ENTRY_ID#".length
          );
        } else {
          newState["exclusiveStartKey"] = NO_ENTRIES_LEFT;
        }
        this.setState(newState);
      });
  };

  componentDidMount() {
    this.getNewEntries();
  }

  loadMoreEntries = (event) => {
    if (event) {
      event.preventDefault();
    }
    this.getNewEntries(true);
  };

  showEntries = () => {
    const newState = { showEntries: true };
    this.setState(newState);
  };

  showCreateEntry = () => {
    var newState = { showEntries: false };
    this.setState(newState);
  };

  showPage() {
    if (this.state.showEntries) {
      return (
        <>
          <h2>
            <span>Gratitude Journal,</span>{" "}
            <span
              onClick={this.showCreateEntry}
              style={{ color: "red", cursor: "pointer" }}
            >
              +Entry
            </span>
          </h2>
          <h2></h2>
          <InfiniteScroll
            dataLength={this.state.entries.length}
            next={this.getNewEntries}
            hasMore={this.state.exclusiveStartKey !== "NO ENTRIES LEFT"}
            loader={<h4>Loading...</h4>}
            useWindow={true}
          >
            {Object.keys(this.state.entries).map((key) => (
              <JournalEntry
                key={key}
                details={this.state.entries[key]}
                deleteEntryCleanup={this.deleteEntryCleanup}
              />
            ))}
          </InfiniteScroll>
        </>
      );
    } else {
      return (
        <div>
          <h2>
            <span
              onClick={this.showEntries}
              style={{ color: "red", cursor: "pointer" }}
            >
              Gratitude Journal,
            </span>{" "}
            <span>+Entry</span>
          </h2>
          <div>
            <form onSubmit={this.handleSubmit}>
              {this.createUI()}
              <input type="submit" value="Submit" />
            </form>
          </div>
        </div>
      );
    }
  }

  render() {
    return <div className="container">{this.showPage()}</div>;
  }
}

export default App;
