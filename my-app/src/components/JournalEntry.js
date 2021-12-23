import React from "react";
import "../App.css";

class JournalEntry extends React.Component {
  render() {
    const { entry_content, legible_date } = this.props.details;
    return (
      <div className="journal-entry">
        <div className="journal-entry-date">{legible_date}</div>
        <div className="journal-entry-content">{entry_content}</div>
      </div>
    );
  }
}

export default JournalEntry;
