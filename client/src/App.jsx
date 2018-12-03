import React, { Component } from 'react';
import socketIOClient from 'socket.io-client';
import timeago from 'timeago.js';
import {
  Button,
  Input,
  Container,
  ListGroup,
  ListGroupItem,
  Badge,
  Alert,
  InputGroup,
  InputGroupAddon,
} from 'reactstrap';

class App extends Component {
  constructor() {
    super();
    this.state = {
      items: [],
      endpoint: 'http://127.0.0.1:3001',
      notification: '',
      url: '',
    };
  }

  componentDidMount() {
    const { endpoint } = this.state;
    const socket = socketIOClient(endpoint);
    socket.on('connection:sid', data => {
      console.log('SOCKET_ID', data);
    });
    socket.on('newUrl', data => {
      console.log('EMISSION', data);
      this.setState({ notification: data });
    });
    this.getItems();
  }

  getItems = () => {
    fetch('api')
      .then(response => {
        return response.json();
      })
      .then(json => {
        this.setState({ items: json });
      });
  };

  handleChange = event => {
    this.setState({ url: event.target.value });
  };

  onAddBtnClick = event => {
    const urlInput = document.getElementById('urlInput');
    const infoField = document.getElementsByClassName('invalid-feedback')[0];

    if (!urlInput.validity.valid) {
      event.preventDefault();
      event.stopPropagation();
      infoField.style.display = 'block';
    } else {
      infoField.style.display = 'none';
      fetch('api/new', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: this.state.url }),
      })
        .then(() => {
          setTimeout(() => {
            this.getItems();
          }, 1000);
        })
        .catch(error => console.log(error));
    }
  };

  onAlertClick = () => {
    setTimeout(() => {
      this.getItems();
      this.setState({ notification: '' });
    }, 500);
  };

  onUrlClick = () => {
    setTimeout(() => {
      this.getItems();
    }, 1000);
  };

  render() {
    // console.log('STATE', this.state);
    const items = this.state.items.map((item, i) => (
      <React.Fragment key={i}>
        <ListGroupItem className="justify-content-between">
          <a onClick={this.onUrlClick} href={'http://localhost:3001/' + item.code} target="_blank">
            http://localhost:3001/{item.code}
          </a>{' '}
          <Badge color="primary" pill>
            {item.visited}
          </Badge>{' '}
          <span className="float-right text-muted">
            Last visited: {timeago().format(item.lastVisited)}
          </span>
        </ListGroupItem>
      </React.Fragment>
    ));
    return (
      <Container>
        <React.Fragment>
          <h2>URL Shortener</h2>
          <hr />
          {this.state.notification ? (
            <Alert color="primary" onClick={this.onAlertClick}>
              New{' '}
              <a href={this.state.notification} target="_blank">
                URL
              </a>{' '}
              has been shortened. Click to dismiss.
            </Alert>
          ) : (
            ''
          )}
          <InputGroup className="needsValidation">
            <Input
              type="url"
              value={this.state.url}
              onChange={this.handleChange}
              id="urlInput"
              required
              placeholder="Enter URL here"
            />
            <InputGroupAddon onClick={this.onAddBtnClick} addonType="append">
              <Button color="primary">Shorten</Button>
            </InputGroupAddon>
          </InputGroup>
          <div class="invalid-feedback">Please provide a valid url.</div>
          <hr />
          <ListGroup>{items}</ListGroup>
        </React.Fragment>
      </Container>
    );
  }
}

export default App;
