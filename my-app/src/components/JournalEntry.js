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

  getTextOrImage(item, ulid, idx, item_count) {
    if (item.startsWith('#IMAGE#')) {
      const imageLocation=item.slice(7)
      return (
        <>
          <img
            className="journal-image"
            src={imageLocation}
            alt={imageLocation}
          />
          {/* <img className="journal-image" src="koala.jpg" alt="koala.jpg" /> */}
        </>
      )
    } else if (item_count > 1) {
      return <li key={`${ulid}-${idx}`}>{item}</li>
    } else {
      return <>{item}</>
    }
  }

  listStringToUL(entry_content, ulid) {
    const as_list = JSON.parse(entry_content);
    if (as_list.length > 1) {
      return (
        <ul>
          {as_list.map((item, idx) => (
            <>{this.getTextOrImage(item, ulid, idx, as_list.length)}</>
          ))}
        </ul>
      )
    }
    return (
      <>
        {as_list.map((item, idx) => (
          <>{this.getTextOrImage(item, ulid, idx, as_list.length)}</>
        ))}
      </>
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
