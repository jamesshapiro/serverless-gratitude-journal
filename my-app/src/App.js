import "./App.css";
import JournalEntry from "./components/JournalEntry";
import InfiniteScroll from "react-infinite-scroll-component";
import React from "react";

class App extends React.Component {
  entryRef = React.createRef();
  constructor(props) {
    super(props);
    this.state = { entries: [], exclusiveStartKey: "", showEntries: true };
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
    this.setState({ entries: [], exclusiveStartKey: "" });
    this.getNewEntries(false);
  };

  getNewEntries = () => {
    console.log("getting new entries!");
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
    // var newState = { showEntries: true, entries: [], exclusiveStartKey: "" };
    this.setState(newState);
    // this.getNewEntries();
  };

  showCreateEntry = () => {
    var newState = { showEntries: false };
    this.setState(newState);
  };

  showPage() {
    console.log(this.state.entries.length);
    console.log(`excl start key ${this.state.exclusiveStartKey}`);
    console.log(
      `has more: ${this.state.exclusiveStartKey !== "NO ENTRIES LEFT"}`
    );
    if (this.state.showEntries) {
      return (
        <>
          <h2>
            <span onClick={this.showEntries}>Gratitude Journal,</span>{" "}
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
          <div className="box">
            <h2>
              <span
                onClick={this.showEntries}
                style={{ color: "red", cursor: "pointer" }}
              >
                Gratitude Journal,
              </span>{" "}
              <span onClick={this.showCreateEntry}>+Entry</span>
            </h2>

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
      );
    }
  }

  render() {
    return <div className="container">{this.showPage()}</div>;
  }
}

export default App;
