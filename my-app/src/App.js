import "./App.css";
import JournalEntryList from "./components/JournalEntryList";
import React from "react";

class App extends React.Component {
  entryRef = React.createRef();
  constructor(props) {
    super(props);
    this.state = { entries: [], exclusiveStartKey: "" };
  }

  submitEntry = (event) => {
    event.preventDefault();
    const entry = {
      entry_content: this.entryRef.current.value,
    };
    const url = process.env.REACT_APP_URL;
    const data = { entry: entry["entry_content"] };
    this.setState({ entries: [], exclusiveStartKey: "" });
    fetch(url, {
      method: "POST",
      headers: {
        "x-api-key": process.env.REACT_APP_API_KEY,
      },
      body: JSON.stringify(data),
    }).then((response) => {
      this.getNewEntries();
    });
    event.currentTarget.reset();
  };

  deleteEntryCleanup = () => {
    console.log("HELLLLOOOOO");
    this.setState({ entries: [], exclusiveStartKey: "" });
    this.getNewEntries(false);
  };

  getNewEntries(useExclusiveStartKey) {
    console.log(`excl start key ${this.state.exclusiveStartKey}`);
    const NO_ENTRIES_LEFT = "NO ENTRIES LEFT";
    var url = process.env.REACT_APP_URL + "?num_entries=3";
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
  }

  loadMoreEntries = (event) => {
    if (event) {
      event.preventDefault();
    }
    this.getNewEntries(true);
  };

  render() {
    return (
      <div className="container">
        <div>
          <JournalEntryList
            loadMoreEntries={this.loadMoreEntries}
            deleteEntryCleanup={this.deleteEntryCleanup}
            entries={this.state.entries}
            exclusiveStartKey={this.state.exclusiveStartKey}
          />
          {this.state.exclusiveStartKey !== "NO ENTRIES LEFT" && (
            <form onSubmit={this.loadMoreEntries}>
              <button type="submit">More Entries</button>
            </form>
          )}
        </div>
        <div>
          <div className="box">
            <h2>Write Entry</h2>
            <form onSubmit={this.submitEntry}>
              <textarea
                className="entry-text-area"
                name="entry"
                ref={this.entryRef}
                placeholder="Entry"
              />
              <button type="submit">Submit Entry</button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
