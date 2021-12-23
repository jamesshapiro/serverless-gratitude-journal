import "./App.css";
import JournalEntryList from "./components/JournalEntryList";
import React from "react";

class App extends React.Component {
  entryRef = React.createRef();
  constructor(props) {
    super(props);
    this.state = { entries: [], exclusiveStartKey: "" };
  }

  submitNewEntry(entry) {
    const url = process.env.REACT_APP_URL;
    console.log("submitting to AWS!");
    const data = { entry: entry["entry_content"] };
    fetch(url, {
      method: "POST",
      headers: {
        "x-api-key": process.env.REACT_APP_API_KEY,
      },
      body: JSON.stringify(data),
    });
  }

  getNewEntries() {
    const NO_ENTRIES_LEFT = "NO ENTRIES LEFT";
    var url = process.env.REACT_APP_URL + "?num_entries=3";
    if (this.state.exclusiveStartKey === NO_ENTRIES_LEFT) {
      return;
    }
    if (this.state.exclusiveStartKey) {
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
        // console.log(data);
        // console.log(data.Items);
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
    this.getNewEntries();
  };

  submitEntryButton = (event) => {
    event.preventDefault();
    const months = {
      1: "January",
      2: "February",
      3: "March",
      4: "April",
      5: "May",
      6: "June",
      7: "July",
      8: "August",
      9: "September",
      10: "October",
      11: "November",
      12: "December",
    };
    const today = new Date();
    const day = String(today.getDate());
    const month = months[today.getMonth() + 1];
    const year = today.getFullYear();
    const entry = {
      entry_content: this.entryRef.current.value,
      legible_date: `${month} ${day}, ${year}`,
    };
    const entries = [...this.state.entries];
    entries.unshift(entry);
    console.log(entries);
    this.setState({ entries });
    this.submitNewEntry(entry);
    event.currentTarget.reset();
  };

  render() {
    return (
      <div className="container">
        <div>
          <JournalEntryList
            loadMoreEntries={this.loadMoreEntries}
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
            <form onSubmit={this.submitEntryButton}>
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
