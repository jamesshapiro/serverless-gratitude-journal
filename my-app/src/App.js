//  aws s3 cp --recursive build s3://gratitude-09-journalwebsites3bucket-7zl5r9dvx6jp && aws cloudfront create-invalidation --distribution-id EB1U59377H4PA --paths "/*"

import "./App.css";
import JournalEntry from "./components/JournalEntry";
import InfiniteScroll from "react-infinite-scroll-component";
import React from "react";
import { ImagePicker } from 'react-file-picker'
import { FaCloudUploadAlt } from 'react-icons/fa'

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
      imageCaption: '',
      showTextPost: true
    }
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  createUI() {
    return (
      <table>
        {this.state.values.map((el, i) => (
          <tr key={i}>
            <td className="td-button">
              <div
                type="button"
                className="bullet-button"
                value="+"
                onClick={this.addClick.bind(this)}
              >
                +
              </div>
            </td>
            <td className="td-textarea">
              <textarea
                value={el || ''}
                className="bullet-textarea"
                onChange={this.handleChange.bind(this, i)}
              />
            </td>
            <td className="td-button">
              <div
                type="button"
                className="bullet-button"
                value="-"
                onClick={this.removeClick.bind(this, i)}
              >
                -
              </div>
            </td>
          </tr>
        ))}
      </table>
    )
  }

  createImageCaption() {
    var i = 'image-metadata'
    return (
      <div key={i}>
        Caption (Optional):{' '}
        <input
          type="text"
          className="image-caption"
          onChange={this.handleImageCaptionChange.bind(this, i)}
        />
      </div>
    )
  }

  handleImageCaptionChange(i, event) {
    const newCaption = event.target.value
    this.setState({ imageCaption: newCaption })
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
          <input type="submit" value="Search" />
        </form>
      </span>
    )
  }

  uploadImage = (base64) => {
    console.log(`submitting 1... ${this.state.imageCaption}`)
    var image_caption = "#NO_CAPTION#"
    if (this.state.imageCaption) {
      image_caption = this.state.imageCaption
    }
    const entry = {
      image_caption: image_caption
    }
    const url = process.env.REACT_APP_URL
    const data = {
      image_caption: entry['image_caption'],
      image_base64_content: base64,
    }
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
    }).then((response) => {
      this.setState({
        entries: [],
        exclusiveStartKey: '',
        showEntries: true,
        values: [''],
        imageCaption: '',
      })
      this.getNewEntries()
    })
  }

  toggleEntryType = (event) => {
    const newState = !this.state.showTextPost
    this.setState({ showTextPost: newState})
  }

  getTextPost() {
    return (
      <div>
        <h3 className="toggle-entry-type-header">
          (Click <span className="toggle-entry-type-link" onClick={this.toggleEntryType}>here</span>{' '}
          for image uploads)
        </h3>
        <form onSubmit={this.handleSubmit}>
          {this.createUI()}
          <input type="submit" value="Submit" />
        </form>
      </div>
    )
  }

  getImagePost() {
    return (
      <div>
        <h3 onClick={this.toggleEntryType} className="toggle-entry-type-header">
          (Click{' '}
          <span
            className="toggle-entry-type-link"
            onClick={this.toggleEntryType}
          >
            here
          </span>{' '}
          for text uploads)
        </h3>
        <ImagePicker
          extensions={['jpg', 'jpeg', 'png']}
          dims={{
            minWidth: 1,
            minHeight: 1,
          }}
          onChange={(base64) => this.uploadImage(base64)}
          onError={(errMsg) => console.log(`error: ${errMsg}`)}
        >
          <div className="upload-outer-box">
            <div className="upload-inner-box">
              <div>
                <FaCloudUploadAlt />
              </div>
              <div>Upload Image</div>
            </div>
          </div>
        </ImagePicker>
        {this.createImageCaption()}
      </div>
    )
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
          {this.state.showTextPost && this.getTextPost()}
          {!this.state.showTextPost && this.getImagePost()}
        </div>
      )
    }
  }

  render() {
    return <div className="container">{this.showPage()}</div>
  }
}

export default App;
