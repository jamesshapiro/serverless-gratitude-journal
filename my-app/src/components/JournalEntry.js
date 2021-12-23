import React from 'react'

class JournalEntry extends React.Component {
  constructor(props) {
    super(props);
    this.state = {entries: [], date: new Date()};
  }

  componentDidMount() {
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

export default JournalEntry