import React from "react";
import "../App.css";

class JournalEntryForm extends React.Component {
  entryRef = React.createRef();
  constructor(props) {
    super(props);
  }
  submitEntry = (event) => {
    event.preventDefault();
    const entry = {
      entry_content: this.entryRef.current.value,
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
      this.props.submitEntryCleanup();
      //   this.setState({ entries: [], exclusiveStartKey: "", showEntries: true });
      //   this.getNewEntries();
    });
    event.currentTarget.reset();
  };

  render() {
    return (
      <div>
        <div className="box">
          <h2>
            <span
              onClick={this.props.showEntries}
              style={{ color: "red", cursor: "pointer" }}
            >
              Gratitude Journal,
            </span>{" "}
            <span>+Entry</span>
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

export default JournalEntryForm;
