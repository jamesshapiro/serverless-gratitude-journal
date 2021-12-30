import React from "react";
import "../App.css";

class JournalEntry extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ulid: "" };
  }
  deleteEntry = () => {
    const url = process.env.REACT_APP_URL + `?ulid=${this.state.ulid}`;
    fetch(url, {
      method: "DELETE",
      headers: {
        "x-api-key": process.env.REACT_APP_API_KEY,
      },
    }).then((response) => {
      this.props.deleteEntryCleanup();
    });
  };

  componentDidMount() {
    const ulid = this.props.details.ulid;
    const newState = { ulid: ulid };
    this.setState(newState);
  }

  getTextOrImage(item) {
    if (item.startsWith('#IMAGE#')) {
      const imageLocation=item.slice(7)
      return <img className="journal-image" src={imageLocation} alt={imageLocation} />
    } else {
      return item
    }
  }

  listStringToUL(entry_content, ulid) {
    const as_list = JSON.parse(entry_content);
    return (
      <ul>
        {as_list.map((item, idx) => (
          <li key={`${ulid}-${idx}`}>{this.getTextOrImage(item)}</li>
        ))}
      </ul>
    )
  }

  render() {
    const { entry_content, legible_date, ulid } = this.props.details;
    return (
      <>
        <div className="journal-entry">
          <div className="journal-entry-date">{legible_date}</div>
          <div className="journal-entry-content">
            {this.listStringToUL(entry_content, ulid)}
          </div>
          <span
            className="journal-entry-delete-button"
            onClick={this.deleteEntry}
          >
            DELETE
          </span>
        </div>
      </>
    );
  }
}

export default JournalEntry;
