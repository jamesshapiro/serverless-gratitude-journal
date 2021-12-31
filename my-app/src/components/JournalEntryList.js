import React from "react";
import JournalEntry from "./JournalEntry";
import "../App.css";

class JournalEntryList extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount(props, state) {
    this.props.loadMoreEntries(false);
  }

  render() {
    return (
      <>
        <div className="box">
          <h2>Journal</h2>
          <ul className="entries">
            {Object.keys(this.props.entries).map((key) => (
              <JournalEntry
                key={key}
                details={this.props.entries[key]}
                deleteEntryCleanup={this.props.deleteEntryCleanup}
              />
            ))}
          </ul>
        </div>
      </>
    );
  }
}

export default JournalEntryList;
