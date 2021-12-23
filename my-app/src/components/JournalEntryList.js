import React from "react";
import JournalEntry from "./JournalEntry";

class JournalEntryList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { entries: [], date: new Date() };
  }

  componentDidMount() {
    const url = process.env.REACT_APP_URL;
    fetch(url, {
      method: "GET",
      //mode: "cors",
      headers: {
        "x-api-key": process.env.REACT_APP_API_KEY,
      },
    })
      .then((response) => response.json())
      .then((data) => console.log(data));
  }

  render() {
    return (
      <div>
        <h1>Hello, world!</h1>
        <h2>It is {this.state.date.toLocaleTimeString()}.</h2>
      </div>
    );
  }
}

export default JournalEntryList;
