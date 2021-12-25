import React from "react";
import "../App.css";

class JournalEntry extends React.Component {
  constructor(props) {
    super(props);
    this.clickTheButton = this.clickTheButton.bind(this);
    this.state = { ulid: "" };
  }
  clickTheButton() {
    const url = process.env.REACT_APP_URL + `?ulid=${this.state.ulid}`;
    fetch(url, {
      method: "DELETE",
      headers: {
        "x-api-key": process.env.REACT_APP_API_KEY,
      },
    }).then((response) => {
      this.props.deleteEntryCleanup();
    });
  }

  componentDidMount() {
    const ulid = this.props.details.ulid;
    const newState = { ulid: ulid };
    this.setState(newState);
  }

  render() {
    const { entry_content, legible_date, ulid } = this.props.details;
    return (
      <>
        <div className="journal-entry">
          <div className="journal-entry-date">{legible_date}</div>
          <div className="journal-entry-content">{entry_content}</div>
          <span
            className="journal-entry-delete-button"
            onClick={this.clickTheButton}
          >
            DELETE
          </span>
        </div>
      </>
    );
  }
}

export default JournalEntry;
