import "./App.css";
import JournalEntry from "./components/JournalEntry";
import InfiniteScroll from "react-infinite-scroll-component";
import React from "react";
import { ImagePicker } from 'react-file-picker'
// import JournalEntryForm from "./components/JournalEntryForm";

class App extends React.Component {
  entryRef = React.createRef()
  constructor(props) {
    super(props)
    this.state = {
      entries: [],
      exclusiveStartKey: '',
      showEntries: true,
      values: [''],
      keyword: '',
      imageMetadata: ''
    }
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  createUI() {
    return this.state.values.map((el, i) => (
      <div key={i}>
        <input type="button" value="+" onClick={this.addClick.bind(this)} />
        <textarea
          value={el || ''}
          className="bullet-item"
          onChange={this.handleChange.bind(this, i)}
        />
        <input
          type="button"
          value="-"
          onClick={this.removeClick.bind(this, i)}
        />
      </div>
    ))
  }

  createImageMetadata() {
    var i = 'image-metadata'
    return (
      <div key={i}>
        <input
          type="text"
          className="image-title"
          onChange={this.handleImageMetadataChange.bind(this, i)}
        />
      </div>
    )
  }

  handleImageMetadataChange(i, event) {
    const newMetadata = event.target.value
    this.setState({ imageMetadata: newMetadata })
  }

  handleChange(i, event) {
    let values = [...this.state.values]
    values[i] = event.target.value
    this.setState({ values })
  }

  addClick() {
    this.setState((prevState) => ({ values: [...prevState.values, ''] }))
  }

  removeClick(i) {
    let values = [...this.state.values]
    values.splice(i, 1)
    this.setState({ values })
  }

  handleSubmit(event) {
    console.log('submitting...')
    event.preventDefault()
    const entry = {
      entry_content: JSON.stringify(this.state.values),
    }
    const url = process.env.REACT_APP_URL
    const data = { entry: entry['entry_content'] }
    fetch(url, {
      method: 'POST',
      headers: {
        'x-api-key': process.env.REACT_APP_API_KEY,
      },
      body: JSON.stringify(data),
    }).then((response) => {
      this.setState({
        entries: [],
        exclusiveStartKey: '',
        showEntries: true,
        values: [''],
      })
      this.getNewEntries()
    })
    event.currentTarget.reset()
  }

  deleteEntryCleanup = () => {
    this.setState({ entries: [], exclusiveStartKey: '' })
    this.getNewEntries()
  }

  getNewEntries = () => {
    var useExclusiveStartKey = true
    const NO_ENTRIES_LEFT = 'NO ENTRIES LEFT'
    var url = process.env.REACT_APP_URL + '?num_entries=10'
    if (
      useExclusiveStartKey &&
      this.state.exclusiveStartKey === NO_ENTRIES_LEFT
    ) {
      return
    }
    if (this.state.keyword) {
      url += `&keyword=${this.state.keyword}`
    }
    if (useExclusiveStartKey && this.state.exclusiveStartKey) {
      url += `&exclusive_start_key=${this.state.exclusiveStartKey}`
    }
    fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': process.env.REACT_APP_API_KEY,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        var oldEntries = this.state.entries
        if (this.state.exclusiveStartKey) {
          var newState = { entries: [...oldEntries, ...data.Items] }
        } else {
          var newState = { entries: [...data.Items] }
        }

        if (data.LastEvaluatedKey) {
          newState['exclusiveStartKey'] = data.LastEvaluatedKey.SK1.S.slice(
            'ENTRY_ID#'.length
          )
        } else {
          newState['exclusiveStartKey'] = NO_ENTRIES_LEFT
        }
        this.setState(newState)
      })
  }

  componentDidMount() {
    this.getNewEntries()
  }

  loadMoreEntries = (event) => {
    if (event) {
      event.preventDefault()
    }
    this.getNewEntries(true)
  }

  showEntries = () => {
    const newState = { showEntries: true }
    this.setState(newState)
  }

  showCreateEntry = () => {
    var newState = { showEntries: false }
    this.setState(newState)
  }

  handleSearchBarChange(event) {
    let keyword = [...this.state.keyword]
    keyword = event.target.value
    this.setState({ keyword, exclusiveStartKey: '' })
  }

  handleSearch = (event) => {
    event.preventDefault()
    event.currentTarget.reset()
    this.getNewEntries()
  }

  // handleSubmitImage = (event) => {
  //   console.log('submitting image')
  //   event.preventDefault();
  // }

  getSearchBar = () => {
    return (
      <span>
        🔍
        {/* <input type="text" onChange={this.handleSearchBarChange.bind(this)} /> */}
        <form className="search-bar" onSubmit={this.handleSearch}>
          <input type="text" onChange={this.handleSearchBarChange.bind(this)} />
          {/* <input type="text" /> */}
          <input type="submit" value="Submit" />
        </form>
      </span>
    )
  }

  uploadImage = (base64) => {
    console.log(`submitting 1... ${this.state.imageMetadata}`)
    if (!this.state.imageMetadata) {
      console.log('error! no image title!')
      return
    }
    const entry = {
      image_title: JSON.stringify(this.state.imageMetadata),
    }
    const url = process.env.REACT_APP_URL
    const data = { image_title: entry['image_title'] }
    fetch(url, {
      method: 'POST',
      headers: {
        'x-api-key': process.env.REACT_APP_API_KEY,
      },
      body: JSON.stringify(data),
    }).then((response) => {
      return response.json()
    }).then((body) => {
      console.log(body)
      const presigned_url = body
      const myHeaders = new Headers()
      // myHeaders.append('Content-Type', 'text/plain')
      myHeaders.append(
        'x-amz-server-side-encryption-context',
        'arn:aws:s3:::gratitude-09-journalwebsites3bucket-7zl5r9dvx6jp'
      )
      fetch(presigned_url, {
        method: 'PUT',
        headers: myHeaders,
        body: data,
      })
      // this.setState({
      //   entries: [],
      //   exclusiveStartKey: '',
      //   showEntries: true,
      //   values: [''],
      // })
      // this.getNewEntries()      
    }).then(response => {
      console.log(response)
      console.log(response.httpResponse)
    })
  }

  showPage() {
    if (this.state.showEntries) {
      return (
        <>
          <h2>
            <span>Journal,</span>{' '}
            <span
              onClick={this.showCreateEntry}
              style={{ color: 'red', cursor: 'pointer' }}
            >
              +Entry,
            </span>
            <span>{this.getSearchBar()}</span>
          </h2>
          <InfiniteScroll
            dataLength={this.state.entries.length}
            next={this.getNewEntries}
            hasMore={this.state.exclusiveStartKey !== 'NO ENTRIES LEFT'}
            loader={<h4>Loading...</h4>}
            useWindow={true}
          >
            {Object.keys(this.state.entries).map((key) => (
              <JournalEntry
                key={key}
                details={this.state.entries[key]}
                deleteEntryCleanup={this.deleteEntryCleanup}
              />
            ))}
          </InfiniteScroll>
        </>
      )
    } else {
      return (
        <div>
          <h2>
            <span
              onClick={this.showEntries}
              style={{ color: 'red', cursor: 'pointer' }}
            >
              Journal,
            </span>{' '}
            <span>+Entry,</span>
            <span>{this.getSearchBar()}</span>
          </h2>
          <div>
            <form onSubmit={this.handleSubmit}>
              {this.createUI()}
              <input type="submit" value="Submit" />
            </form>
            <ImagePicker
              extensions={['jpg', 'jpeg', 'png']}
              dims={{
                minWidth: 1,
                minHeight: 1,
              }}
              onChange={(base64) => this.uploadImage(base64)}
              onError={(errMsg) => console.log(`error: ${errMsg}`)}
            >
              <button>Click to upload image</button>
            </ImagePicker>
            {this.createImageMetadata()}
          </div>
        </div>
      )
    }
  }

  render() {
    return <div className="container">{this.showPage()}</div>
  }
}

export default App;
