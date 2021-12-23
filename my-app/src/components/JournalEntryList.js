import React from "react";
import JournalEntry from "./JournalEntry";

class JournalEntryList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { entries: [], exclusiveStartKey: "" };
  }

  getNewEntries() {
    var url = process.env.REACT_APP_URL + "?num_entries=3";
    if (this.state.exclusiveStartKey) {
      url += `&exclusive_start_key=${this.state.exclusiveStartKey}`;
    }
    console.log(url);
    fetch(url, {
      method: "GET",
      headers: {
        "x-api-key": process.env.REACT_APP_API_KEY,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        console.log(data.Items);
        var oldEntries = this.state.entries;
        var newState = { entries: [...oldEntries, ...data.Items] };
        if (data.LastEvaluatedKey) {
          newState["exclusiveStartKey"] = data.LastEvaluatedKey.SK1.S.slice(
            "ENTRY_ID#".length
          );
        }
        this.setState(newState);
      });
  }

  loadMoreEntries = (event) => {
    event.preventDefault();
    this.getNewEntries();
  };

  componentDidMount(props, state) {
    var url = process.env.REACT_APP_URL + "?num_entries=3";
    this.getNewEntries();
  }

  render() {
    return (
      <>
        <div>
          <h2>Gratitude Journal</h2>
        </div>
        <ul className="entries">
          {Object.keys(this.state.entries).map((key) => (
            <JournalEntry key={key} details={this.state.entries[key]} />
          ))}
        </ul>
        <form onSubmit={this.loadMoreEntries}>
          <button type="submit">+ Add Entries</button>
        </form>
      </>
    );
  }
}

export default JournalEntryList;
